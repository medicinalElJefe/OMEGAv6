import { median, omegaViability, memoryUpdate, burdenUpdate, empiricalTurnDecision } from './calibration.mjs';

const clamp01 = value => Math.max(0, Math.min(1, Number(value)));
const boundedRatio = value => {
  const x = Math.max(0, Number(value));
  return Number.isFinite(x) ? x / (1 + x) : null;
};

function mad(values, center = median(values)) {
  if (!Number.isFinite(center)) return null;
  return median(values.map(value => Math.abs(Number(value) - center)).filter(Number.isFinite));
}

function lagOneRetention(values) {
  const x = values.map(Number).filter(Number.isFinite);
  if (x.length < 3) return null;
  const a = x.slice(0, -1), b = x.slice(1);
  const ma = a.reduce((s,v)=>s+v,0)/a.length, mb = b.reduce((s,v)=>s+v,0)/b.length;
  let num=0, da=0, db=0;
  for(let i=0;i<a.length;i++){const xa=a[i]-ma,xb=b[i]-mb;num+=xa*xb;da+=xa*xa;db+=xb*xb;}
  if(da<=0||db<=0)return null;
  return clamp01(num/Math.sqrt(da*db));
}

function medianGapHours(samples) {
  const gaps=[];
  for(let i=1;i<samples.length;i++){
    const gap=(new Date(samples[i].time)-new Date(samples[i-1].time))/3600000;
    if(Number.isFinite(gap)&&gap>0)gaps.push(gap);
  }
  return median(gaps);
}

export function sarHostVariableAdapter(samples, options={}) {
  const clean=(samples||[])
    .filter(sample=>sample?.measured!==false&&Number.isFinite(Number(sample?.value))&&sample?.time)
    .map(sample=>({...sample,value:Number(sample.value)}))
    .sort((a,b)=>new Date(a.time)-new Date(b.time));

  if(!clean.length)return {state:'NO_MEASURED_SAR_HOST_DATA',rows:[],contract:'FOLD_SCALE_CANON_HOST_ADAPTER'};

  const values=clean.map(sample=>sample.value);
  const center=median(values);
  const rawMad=mad(values,center);
  const robustScale=Math.max(Number.EPSILON,1.4826*(rawMad||0),Math.abs(center||0)*1e-9);
  const cadence=medianGapHours(clean);
  const retention=lagOneRetention(values);
  let memory=0;
  let burden=0;

  const rows=clean.map((sample,index)=>{
    const previous=clean[index-1]||null;
    const innovation=previous?Math.abs(sample.value-previous.value):0;
    const centralDeviation=Math.abs(sample.value-center);
    const q=boundedRatio(innovation/robustScale) ?? 0;
    const E=1-(boundedRatio(centralDeviation/robustScale) ?? 0);
    const gapHours=previous?(new Date(sample.time)-new Date(previous.time))/3600000:null;
    const excessGap=Number.isFinite(gapHours)&&Number.isFinite(cadence)&&cadence>0?Math.max(0,gapHours/cadence-1):0;
    const gapBurden=boundedRatio(excessGap) ?? 0;
    const integration=previous?1-(boundedRatio(centralDeviation/robustScale)??0):1;
    burden=burdenUpdate(Math.max(burden,gapBurden),q,integration) ?? gapBurden;
    const Delta=q;
    memory=retention==null?null:memoryUpdate(memory??0,retention,Delta);
    const Omega=omegaViability(E,burden,q);
    const priorOmegaTurn=empiricalTurnDecision('omega',Omega);
    const phase=Number.isFinite(cadence)&&cadence>0
      ? ((new Date(sample.time)-new Date(clean[0].time))/3600000/cadence*2*Math.PI)%(2*Math.PI)
      : null;
    return {
      id:sample.id||String(index),time:sample.time,value:sample.value,measured:true,
      E_continuity_capacity:E,
      M_scar_memory:memory,
      Lambda_burden:burden,
      q_contradiction:q,
      g_integration:integration,
      Delta_scar_imprint:Delta,
      Phi_phase:phase,
      C_scale:Number(options.scaleRatio)||1,
      Omega,
      formalDispatch:'UNRESOLVED_HOST_THRESHOLD',
      empiricalOmegaTurnReference:priorOmegaTurn.state,
      diagnostics:{innovation,centralDeviation,gapHours,excessGap,gapBurden}
    };
  });

  return {
    state:'SAR_HOST_VARIABLES_DERIVED_FROM_MEASURED_STACK',
    measuredOnly:true,
    contract:'FOLD_SCALE_CANON_HOST_ADAPTER',
    adapterVersion:'sar.robust-host.v1',
    adapterEquations:{
      robustScale:'1.4826 * MAD(measured pixel stack)',
      q:'z_innovation/(1+z_innovation), z_innovation=abs(x_t-x_(t-1))/robustScale',
      E:'1-z_center/(1+z_center), z_center=abs(x_t-median(x))/robustScale',
      Lambda:'charted Lambda update seeded by excess-cadence burden',
      g:'1-z_center/(1+z_center)',
      Delta:'q event imprint',
      memoryRetention:'measured lag-1 correlation clipped to [0,1]',
      Phi:'acquisition phase relative to measured median revisit interval when available',
      Omega:'exact charted E/(1+Lambda+abs(q))'
    },
    boundaries:{
      variablesAreHostAdapters:true,
      rawPixelValuesRemainSeparate:true,
      priorReleaseRangesAreNotForcedOntoSar:true,
      empiricalOmegaThresholdIsReferenceOnlyUntilSarOutcomeValidated:true,
      formalDispatchRequiresSarCalibratedTau:true
    },
    summary:{count:rows.length,median:center,mad:rawMad,robustScale,medianGapHours:cadence,measuredMemoryRetention:retention},
    rows
  };
}

export function currentSarHostState(adapter, id=null) {
  if(!adapter?.rows?.length)return null;
  return id ? adapter.rows.find(row=>row.id===id)||null : adapter.rows.at(-1);
}
