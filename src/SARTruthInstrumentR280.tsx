import React,{useMemo,useState}from'react';
import{
 SAR_BAND_RELATIVITY_R280,SAR_MISSION_REGISTRY_R280,compileSarWovenStateR280,
 interferometricAdmissionR280,phaseToLosDisplacementR280,
 type SarBandR280,type SarMissingnessR280,type SarObservationR280,type SarTruthClassR280
}from'./sarTruthR280';

type View='SOURCE'|'AMPLITUDE'|'PHASE'|'COHERENCE'|'INTERFEROGRAM'|'DEFORMATION'|'ELEVATION'|'POLARIMETRY'|'MULTI_BAND'|'TIME_STACK'|'SCAR_UNCERTAINTY'|'PROOF';

const VIEWS:View[]=['SOURCE','AMPLITUDE','PHASE','COHERENCE','INTERFEROGRAM','DEFORMATION','ELEVATION','POLARIMETRY','MULTI_BAND','TIME_STACK','SCAR_UNCERTAINTY','PROOF'];
const truthRank:Record<SarTruthClassR280,number>={OBSERVED_NATIVE:10,OBSERVED_CALIBRATED:9,CORRECTED:8,GEOCODED:7,FUSED:6,ASSIMILATED:5,SIMULATED:2,FORECAST:1,DERIVED_MODEL:4,VISUAL_ENHANCED:3};
const missingLabels:Record<SarMissingnessR280,string>={NO_SOURCE:'No source',OUT_OF_SWATH:'Out of swath',RADAR_SHADOW:'Radar shadow',LAYOVER:'Layover',NO_COHERENCE:'No coherence',CLOUD_MASKED:'Cloud masked',ATMOSPHERICALLY_DEGRADED:'Atmospheric degradation',INTERPOLATED_ONLY:'Interpolated only'};

const DEMO:SarObservationR280={
 id:'r280-demo-observation',missionId:'sentinel-1',sensor:'C-SAR',productId:'DEMO-NO-LIVE-SOURCE',productLevel:'SLC',band:'C',frequencyGHz:5.405,wavelengthCm:5.55,polarization:'VV',
 provenance:{sourceId:'demo-only',provider:'R280 deterministic demonstration',acquiredAt:new Date(0).toISOString()},
 geometry:{crs:'EPSG:4326',surfaceClass:'SCATTERING_SURFACE',orbitDirection:'ASCENDING',incidenceDeg:39,azimuthDeg:12,lookDirection:'RIGHT',losUnit:[0.56,-0.16,0.81],baselineM:112,temporalBaselineDays:12,nativeResolutionM:[10,10],pixelSpacingM:[10,10]},
 truth:'VISUAL_ENHANCED',missingness:['NO_SOURCE'],residuals:{atmosphereRad:0.42,orbitRad:0.08,topographyRad:0.18,noiseRad:0.11,decorrelation:0.23,speckleBurden:0.34,interpolationBurden:0,notes:['Deterministic demonstration state only. No live complex SAR source is bound.']},
 nativeDataBound:false,complexDataBound:false,sourceEvidenceBound:false
};

function seedNoise(x:number,y:number,k:number){const s=Math.sin(x*12.9898+y*78.233+k*37.719)*43758.5453;return s-Math.floor(s)}
function fieldValue(view:View,x:number,y:number,t:number){
 const n=seedNoise(x,y,t);const r=Math.hypot(x-.5,y-.5);const ridge=Math.exp(-Math.pow((y-.5-.13*Math.sin(x*11+t*.2))*13,2));
 const fault=Math.tanh(((x-.52)*1.2+(y-.47)*.55)*28);const rings=Math.sin((r*42-t*.18)+Math.sin(x*8)*.6);
 if(view==='AMPLITUDE'||view==='SOURCE')return Math.max(0,Math.min(1,.18+n*.42+ridge*.31+(1-r)*.12));
 if(view==='PHASE'||view==='INTERFEROGRAM')return .5+.5*Math.sin(rings+fault*2.6+n*.6);
 if(view==='COHERENCE')return Math.max(0,Math.min(1,.86-r*.62-Math.abs(fault)*.11-n*.18));
 if(view==='DEFORMATION')return Math.max(0,Math.min(1,.5+fault*.28+Math.sin(y*12+t*.2)*.07));
 if(view==='ELEVATION')return Math.max(0,Math.min(1,.3+ridge*.5+(1-r)*.2+n*.06));
 if(view==='POLARIMETRY')return Math.max(0,Math.min(1,.22+ridge*.28+n*.42+Math.sin(x*15)*.08));
 if(view==='MULTI_BAND')return Math.max(0,Math.min(1,.18+n*.28+ridge*.36+(Math.sin(y*16)+1)*.08));
 if(view==='TIME_STACK')return Math.max(0,Math.min(1,.25+n*.28+ridge*.24+.12*Math.sin((x+y)*18+t*.42)));
 if(view==='SCAR_UNCERTAINTY')return Math.max(0,Math.min(1,r*.36+n*.24+Math.abs(fault)*.34));
 return Math.max(0,Math.min(1,.12+n*.16+ridge*.22));
}

function color(view:View,v:number,x:number,y:number){
 // Colors are semantic UI encodings only; no generated palette is labelled as measured radiometry.
 if(view==='PHASE'||view==='INTERFEROGRAM'){
  const a=2*Math.PI*v;const r=Math.floor(128+127*Math.sin(a));const g=Math.floor(128+127*Math.sin(a+2.094));const b=Math.floor(128+127*Math.sin(a+4.188));return `rgb(${r},${g},${b})`;
 }
 if(view==='COHERENCE')return `rgb(${Math.floor(20+65*(1-v))},${Math.floor(35+185*v)},${Math.floor(45+200*v)})`;
 if(view==='DEFORMATION')return `rgb(${Math.floor(60+180*v)},${Math.floor(90+90*(1-Math.abs(v-.5)*2))},${Math.floor(230-180*v)})`;
 if(view==='ELEVATION')return `rgb(${Math.floor(35+145*v)},${Math.floor(55+170*v)},${Math.floor(45+90*(1-v))})`;
 if(view==='POLARIMETRY')return `rgb(${Math.floor(35+210*v)},${Math.floor(35+170*fieldValue('AMPLITUDE',x,y,0))},${Math.floor(55+180*(1-v))})`;
 if(view==='MULTI_BAND')return `rgb(${Math.floor(40+180*v)},${Math.floor(70+110*(1-v))},${Math.floor(80+160*fieldValue('COHERENCE',x,y,0))})`;
 if(view==='SCAR_UNCERTAINTY')return `rgb(${Math.floor(65+190*v)},${Math.floor(45+90*(1-v))},${Math.floor(55+60*(1-v))})`;
 const q=Math.floor(18+225*Math.pow(v,.78));return `rgb(${q},${q},${q})`;
}

function SarCanvas({view,time}:{view:View;time:number}){
 const N=72;const cells=useMemo(()=>Array.from({length:N*N},(_,i)=>{const x=(i%N)/(N-1),y=Math.floor(i/N)/(N-1),v=fieldValue(view,x,y,time);return {i,v,c:color(view,v,x,y)}}),[view,time]);
 return <div className="r280-canvas" aria-label={`${view} deterministic visualization surface`}>
  {cells.map(c=><i key={c.i} style={{background:c.c}}/>)}
  <div className="r280-grid"/><div className="r280-crosshair"><span/><b/></div>
  <div className="r280-range-labels"><span>RANGE →</span><span>AZIMUTH ↓</span></div>
 </div>
}

function Metric({label,value,sub}:{label:string;value:string;sub?:string}){return <div className="r280-metric"><small>{label}</small><b>{value}</b>{sub&&<em>{sub}</em>}</div>}

export function SARTruthInstrumentR280({observation=DEMO}:{observation?:SarObservationR280}){
 const [view,setView]=useState<View>('AMPLITUDE');const[time,setTime]=useState(4);const[bandB,setBandB]=useState<SarBandR280>('L');const[showGeometry,setShowGeometry]=useState(true);
 const mission=SAR_MISSION_REGISTRY_R280.find(x=>x.id===observation.missionId);
 const woven=useMemo(()=>compileSarWovenStateR280(observation,[view==='SOURCE'?'none':'render-lens'],[view]),[observation,view]);
 const pair=useMemo(()=>({masterId:'A',slaveId:'B',wavelengthCm:observation.wavelengthCm||5.55,baselineM:observation.geometry.baselineM||0,temporalBaselineDays:observation.geometry.temporalBaselineDays||0,meanCoherence:.72,wrappedPhaseBound:observation.complexDataBound,unwrappedPhaseBound:false,topographyHandled:false,orbitHandled:true,atmosphereHandled:false,noiseCharacterized:true}),[observation]);
 const admission=interferometricAdmissionR280(pair);
 const phaseExample=phaseToLosDisplacementR280(Math.PI/2,observation.wavelengthCm||5.55);
 const sourceBound=observation.sourceEvidenceBound&&observation.nativeDataBound;
 const proofTone=sourceBound&&woven.admission.state==='ADMITTED'?'ADMITTED':woven.admission.state;
 return <section className="sar-r280">
  <header className="r280-top">
   <div><span className="r280-kicker">OMEGA · SAR TRUTH INSTRUMENT · R280</span><h2>Complex measurement → geometry → residual → proof → visual lens</h2><p>Source-first SAR workstation. Rendering never upgrades evidence class.</p></div>
   <div className={`r280-proof ${proofTone.toLowerCase()}`}><small>PROOF STATE</small><b>{proofTone}</b><span>{sourceBound?'source measurement bound':'deterministic demonstration · no live SAR pixels bound'}</span></div>
  </header>

  <nav className="r280-tabs" aria-label="SAR truth views">{VIEWS.map(x=><button key={x} aria-pressed={view===x} onClick={()=>setView(x)}>{x.replaceAll('_',' ')}</button>)}</nav>

  <div className="r280-workbench">
   <aside className="r280-left">
    <h3>Acquisition frame</h3>
    <Metric label="MISSION" value={mission?.label||observation.missionId}/><Metric label="SENSOR" value={observation.sensor}/>
    <div className="r280-pair"><Metric label="BAND" value={observation.band}/><Metric label="POL" value={observation.polarization}/></div>
    <Metric label="WAVELENGTH" value={observation.wavelengthCm?`${observation.wavelengthCm.toFixed(2)} cm`:'unknown'}/>
    <Metric label="PRODUCT" value={observation.productLevel} sub={observation.productId||'no product id'}/>
    <Metric label="TRUTH CLASS" value={observation.truth.replaceAll('_',' ')}/>
    <label className="r280-toggle"><input type="checkbox" checked={showGeometry} onChange={e=>setShowGeometry(e.target.checked)}/> geometry overlay</label>
    <h3>Frame relativity</h3>
    <p>{SAR_BAND_RELATIVITY_R280[observation.band].relativeScattering}</p>
    <label>Compare band<select value={bandB} onChange={e=>setBandB(e.target.value as SarBandR280)}>{(['X','C','S','L','P'] as SarBandR280[]).map(b=><option key={b}>{b}</option>)}</select></label>
    <p className="r280-note">{SAR_BAND_RELATIVITY_R280[bandB].interpretation}</p>
   </aside>

   <main className="r280-center">
    <div className="r280-screen-head"><span>{view.replaceAll('_',' ')}</span><b>{sourceBound?'BOUND SOURCE':'DEMONSTRATION FIELD'}</b><small>{observation.geometry.crs} · {observation.geometry.surfaceClass.replaceAll('_',' ')}</small></div>
    <div className={`r280-screen ${showGeometry?'geometry-on':''}`}><SarCanvas view={view} time={time}/>{showGeometry&&<div className="r280-geometry-overlay"><span>INC {observation.geometry.incidenceDeg??'—'}°</span><span>LOOK {observation.geometry.lookDirection||'—'}</span><span>BASE {observation.geometry.baselineM??'—'} m</span><span>ΔT {observation.geometry.temporalBaselineDays??'—'} d</span></div>}</div>
    {view==='TIME_STACK'&&<div className="r280-timeline"><button onClick={()=>setTime(Math.max(0,time-1))}>−</button><input type="range" min="0" max="11" value={time} onChange={e=>setTime(Number(e.target.value))}/><button onClick={()=>setTime(Math.min(11,time+1))}>+</button><b>T{String(time).padStart(2,'0')}</b></div>}
    <footer className="r280-legend"><span>Visual values are lens encodings.</span><b>{sourceBound?'Measurement-linked rendering':'NO SOURCE PIXELS CLAIMED'}</b><span>Native resolution: {observation.geometry.nativeResolutionM?.join(' × ')||'unknown'} m</span></footer>
   </main>

   <aside className="r280-right">
    <h3>Truth inspector</h3>
    <Metric label="SOURCE ID" value={observation.provenance.sourceId}/><Metric label="ACQUIRED" value={observation.provenance.acquiredAt}/>
    <div className="r280-pair"><Metric label="INCIDENCE" value={`${observation.geometry.incidenceDeg??'—'}°`}/><Metric label="AZIMUTH" value={`${observation.geometry.azimuthDeg??'—'}°`}/></div>
    <Metric label="SURFACE" value={observation.geometry.surfaceClass.replaceAll('_',' ')}/>
    <Metric label="SCENE PROOF" value={observation.sourceEvidenceBound?'SOURCE BOUND':'SOURCE UNBOUND'}/>
    <h3>Interferometry gate</h3>
    <Metric label="PAIR" value={admission.admitted?'ADMITTED':'HELD'} sub={`${pair.meanCoherence??0} coherence`}/>
    <p className="r280-note">π/2 phase would equal {phaseExample.toFixed(4)} m LOS under the declared sign convention and wavelength; this is math only, not a claim about the displayed field.</p>
    {admission.reasons.map(x=><span className="r280-chip" key={x}>{x.replaceAll('_',' ')}</span>)}
    <h3>Scar / residual ledger</h3>
    {Object.entries(observation.residuals).filter(([k,v])=>k!=='notes'&&v!=null).map(([k,v])=><div className="r280-residual" key={k}><span>{k}</span><b>{String(v)}</b></div>)}
    {observation.missingness.length>0&&<><h3>Missingness</h3>{observation.missingness.map(x=><span className="r280-chip danger" key={x}>{missingLabels[x]}</span>)}</>}
   </aside>
  </div>

  <div className="r280-bottom">
   <div><h3>Woven Continuity · executable path</h3><code>partition → transform/exchange → invariant carry → scar/history carry → re-contextualize</code></div>
   <div className="r280-flow"><span>{woven.partition.mission}</span><i>→</i><span>{woven.partition.band}/{woven.partition.polarization}</span><i>→</i><span>{woven.transforms.join(', ')||'none'}</span><i>→</i><span>{woven.scarCarry.length} scar channels</span><i>→</i><strong>{view}</strong></div>
   <div className="r280-admission"><b>{woven.admission.state}</b>{woven.admission.reasons.map(x=><span key={x}>{x}</span>)}</div>
  </div>
 </section>
}

export default SARTruthInstrumentR280;
