import { buildOmegaContinuousField, OMEGA_SKINS as CORE_SKINS } from './omega-field-core.mjs';
import { fitSatelliteToSar, predictSarFromSatellite } from './omega-satellite-skin.mjs';

export const FULL_OMEGA_MODE_STACK=Object.freeze([
  'OVERALL_CANON','UNIFIED_COHERENCE','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','GUIDANCE_FIELD','FULL_SPHERE',
  'ALPHA','CRIMSON','FORECAST','RECOVERY','STABILIZATION','INTEGRATION','TRUTH_TRAVERSAL','RAFT188','CTDE','GAMMA_ADMISSION',
  'CONTINUANCE_EVOLUTION','HEAVY_PRUNE','DIMENSION_SKIN','REALTIME_SATELLITE_SKIN','PROOF_LEDGER','RENDERER_FIELD',...CORE_SKINS
]);

const clamp01=v=>Math.max(0,Math.min(1,Number(v)));
const finite=v=>Number.isFinite(Number(v));
const median=v=>{const x=v.filter(finite).map(Number).sort((a,b)=>a-b);if(!x.length)return null;const m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2};
const mad=(v,c=median(v))=>finite(c)?median(v.filter(finite).map(x=>Math.abs(Number(x)-c))):null;
const key=(x,y)=>`${x}:${y}`;

function neighborhood(field,cell,radius=1){
  const out=[];
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
    if(!dx&&!dy)continue;
    const x=cell.ix+dx,y=cell.iy+dy;
    if(x<0||y<0||x>=field.cols||y>=field.rows)continue;
    out.push(field.cells[y*field.cols+x]);
  }
  return out;
}

function satelliteAssimilationPass(field,options){
  const context=options?.satelliteContext;
  if(!context)return {...field,satelliteFit:{state:'SATELLITE_CONTEXT_UNAVAILABLE',confidence:0}};
  const anchors=(options?.anchors||[]).filter(a=>a?.measured!==false&&finite(a?.value));
  const fit=fitSatelliteToSar(anchors,context);
  if(fit.state!=='SATELLITE_SAR_FIT_READY'){
    const cells=field.cells.map(c=>({...c,modeLedger:{...(c.modeLedger||{}),REALTIME_SATELLITE_SKIN:{state:fit.state,support:fit.support||0}}}));
    return {...field,cells,satelliteFit:fit};
  }
  const anchorValues=anchors.map(a=>Number(a.value)),center=median(anchorValues)??0,scale=Math.max(1,1.4826*(mad(anchorValues,center)??3));
  const cells=field.cells.map(cell=>{
    const pred=predictSarFromSatellite(context,fit,cell.lon,cell.lat);
    const ledger={...(cell.modeLedger||{})};
    if(!pred){ledger.REALTIME_SATELLITE_SKIN='OUTSIDE_CONTEXT_OR_UNRESOLVED';return {...cell,modeLedger:ledger};}
    ledger.REALTIME_SATELLITE_SKIN={state:'ASSIMILATED_CORRELATED_REALTIME_CONTEXT',authority:context.authority,date:context.date,layers:context.layers,fitR2:fit.r2,fitRmse:fit.rmse,fitConfidence:fit.confidence};
    if(cell.measured)return {...cell,modeLedger:{...ledger,REALTIME_SATELLITE_SKIN:{...ledger.REALTIME_SATELLITE_SKIN,action:'MEASURED_ANCHOR_FIXED'}}};
    const satSigma=Math.max(.8,pred.uncertainty||2),baseSigma=Math.max(.8,cell.uncertainty||3);
    let value,confidence,uncertainty,satelliteFraction=1;
    if(finite(cell.value)){
      const wb=Math.max(.01,cell.confidence||.15)/(baseSigma*baseSigma),ws=Math.max(.01,pred.confidence)/(satSigma*satSigma),sum=wb+ws;
      value=(wb*cell.value+ws*pred.value)/sum;uncertainty=Math.sqrt(1/sum);confidence=clamp01(1-(1-clamp01(cell.confidence||0))*(1-clamp01(pred.confidence)));satelliteFraction=ws/sum;
    }else{
      value=pred.value;uncertainty=satSigma;confidence=.72*pred.confidence;satelliteFraction=1;
    }
    const displayValue=clamp01(.5+.18*((value-center)/scale));
    const state=confidence>=.72?'OMEGA_RECONSTRUCTED_SATELLITE_HIGH':confidence>=.42?'OMEGA_RECONSTRUCTED_SATELLITE':'OMEGA_RECONSTRUCTED_SATELLITE_LOW';
    return {...cell,value,displayValue,uncertainty,confidence,state,measured:false,inferred:true,
      provenance:{...(cell.provenance||{}),realtimeSatellite:satelliteFraction},modeLedger:ledger};
  });
  return {...field,cells,satelliteFit:fit};
}

function recoveryPass(field){
  const next=field.cells.map(cell=>({...cell,modeLedger:{...(cell.modeLedger||{})}}));
  for(const cell of next){
    const peers=neighborhood(field,cell,1).filter(p=>finite(p.value)&&p.confidence>=.35);
    if(!peers.length){cell.modeLedger.RECOVERY='NO_ACCEPTED_NEIGHBOR';continue;}
    const peerMedian=median(peers.map(p=>p.value));
    if(!finite(peerMedian)){cell.modeLedger.RECOVERY='UNRESOLVED';continue;}
    if(!finite(cell.value)){
      cell.value=peerMedian;
      cell.displayValue=median(peers.map(p=>p.displayValue))??cell.displayValue;
      cell.confidence=Math.min(.38,median(peers.map(p=>p.confidence))??.25);
      cell.uncertainty=Math.max(2,median(peers.map(p=>p.uncertainty).filter(finite))??3);
      cell.state='OMEGA_RECOVERED_CONTINUITY';cell.measured=false;cell.inferred=true;
      cell.modeLedger.RECOVERY='NEIGHBOR_CONTINUITY_RECOVERY';
    }else{
      cell.modeLedger.RECOVERY='STATE_ALREADY_PRESENT';
    }
  }
  return {...field,cells:next};
}

function stabilizationPass(field){
  const next=field.cells.map(cell=>({...cell,modeLedger:{...(cell.modeLedger||{})}}));
  for(const cell of next){
    if(cell.measured){cell.modeLedger.STABILIZATION='MEASURED_ANCHOR_FIXED';continue;}
    if(!finite(cell.value)){cell.modeLedger.STABILIZATION='NO_NUMERIC_STATE';continue;}
    const peers=neighborhood(field,cell,1).filter(p=>finite(p.value));
    if(peers.length<2){cell.modeLedger.STABILIZATION='INSUFFICIENT_NEIGHBORS';continue;}
    const local=median(peers.map(p=>p.value));
    const strength=.12+.18*(1-clamp01(cell.confidence));
    cell.value=(1-strength)*cell.value+strength*local;
    cell.confidence=clamp01(cell.confidence*(.98+.02*Math.min(1,peers.length/8)));
    cell.modeLedger.STABILIZATION={kind:'CONFIDENCE_WEIGHTED_MEDIAN_REGULARIZATION',strength};
  }
  return {...field,cells:next};
}

function evolutionPass(field,previousField){
  const previousMap=new Map((previousField?.cells||[]).map(c=>[key(c.ix,c.iy),c]));
  const next=field.cells.map(cell=>{
    const prev=previousMap.get(key(cell.ix,cell.iy));
    const delta=finite(prev?.value)&&finite(cell.value)?cell.value-prev.value:null;
    const temporalConfidence=delta==null?0:clamp01((prev.confidence||0)*(cell.confidence||0));
    return {...cell,modeLedger:{...(cell.modeLedger||{}),CTDE:delta==null?'NO_PREVIOUS_NUMERIC_STATE':{delta,temporalConfidence},CONTINUANCE_EVOLUTION:delta==null?'NEW_FRAME':{delta}},evolution:{delta,temporalConfidence}};
  });
  return {...field,cells:next};
}

function admissionPass(field){
  const next=field.cells.map(cell=>{
    let gamma='REJECT';
    if(cell.measured)gamma='ADMIT_MEASURED';
    else if(finite(cell.value)&&cell.confidence>=.72)gamma='ADMIT_HIGH';
    else if(finite(cell.value)&&cell.confidence>=.42)gamma='ADMIT_BOUNDED';
    else if(cell.state==='CONTEXT_PRIOR')gamma='DISPLAY_PRIOR_ONLY';
    else if(finite(cell.value))gamma='HOLD_LOW_CONFIDENCE';
    const highFather=gamma.startsWith('ADMIT')?'CONSTRAINTS_SATISFIED':gamma==='DISPLAY_PRIOR_ONLY'?'NON_SAR_CONTEXT_ONLY':'WITHHOLD_FROM_STRONG_CLAIM';
    const noNothing=finite(cell.value)||finite(cell.displayValue)?'STATE_PRESERVED':'UNKNOWN_PRESERVED_NOT_ZERO';
    return {...cell,gammaAdmission:gamma,modeLedger:{...(cell.modeLedger||{}),GAMMA_ADMISSION:gamma,MODE188:gamma,HIGH_FATHER:highFather,NO_NOTHING_TRUTH:noNothing}};
  });
  return {...field,cells:next};
}

function guidancePass(field){
  const next=field.cells.map(cell=>{
    const peers=neighborhood(field,cell,1);
    const conf=clamp01(cell.confidence||0);
    const disagreement=finite(cell.value)&&peers.some(p=>finite(p.value))?median(peers.filter(p=>finite(p.value)).map(p=>Math.abs(p.value-cell.value)))??0:0;
    const scaledDisagreement=clamp01(disagreement/6);
    const need=clamp01(.72*(1-conf)+.28*scaledDisagreement);
    return {...cell,guidanceNeed:need,modeLedger:{...(cell.modeLedger||{}),GUIDANCE_FIELD:{need,reason:need>.7?'HIGH_VALUE_EVIDENCE_TARGET':need>.4?'USEFUL_EVIDENCE_TARGET':'LOW_PRIORITY'}}};
  });
  return {...field,cells:next};
}

function truthTraversalPass(field){
  const next=field.cells.map(cell=>{
    const contradictions=[];
    if(cell.measured&&cell.inferred)contradictions.push('MEASURED_AND_INFERRED_SIMULTANEOUSLY');
    if(cell.gammaAdmission?.startsWith('ADMIT')&&!finite(cell.value))contradictions.push('ADMITTED_WITHOUT_NUMERIC_STATE');
    if(cell.state==='CONTEXT_PRIOR'&&finite(cell.value))contradictions.push('CONTEXT_PRIOR_HAS_SAR_UNIT_VALUE');
    if(cell.provenance?.directSar>0&&cell.measured===false&&cell.provenance.directSar>.98)contradictions.push('DIRECT_SUPPORT_NEAR_ONE_BUT_NOT_MEASURED');
    const truth=contradictions.length?'TURN':'STAY';
    return {...cell,contradictions,modeLedger:{...(cell.modeLedger||{}),TRUTH_TRAVERSAL:truth,OVERALL_CANON:truth==='STAY'?'COHERENT':'CONTRADICTION_RETAINED_FOR_REVIEW'}};
  });
  return {...field,cells:next};
}

function summarize(field){
  const counts={};let admitted=0,prior=0,hold=0,contradictions=0,guidance=0;
  for(const c of field.cells){counts[c.gammaAdmission]=(counts[c.gammaAdmission]||0)+1;if(c.gammaAdmission?.startsWith('ADMIT'))admitted++;else if(c.gammaAdmission==='DISPLAY_PRIOR_ONLY')prior++;else hold++;contradictions+=c.contradictions?.length||0;guidance+=c.guidanceNeed||0;}
  const n=Math.max(1,field.cells.length);
  return {...field.summary,admission:counts,admittedFraction:admitted/n,priorFraction:prior/n,holdFraction:hold/n,contradictions,guidanceMean:guidance/n,satelliteFit:field.satelliteFit||null};
}

export function buildFullOmegaField(options={}){
  const base=buildOmegaContinuousField(options);
  let field={...base,modePipeline:['ALPHA','REALTIME_SATELLITE_SKIN','RECOVERY','STABILIZATION','CTDE','GAMMA_ADMISSION','GUIDANCE_FIELD','TRUTH_TRAVERSAL','UNIFIED_COHERENCE','OVERALL_CANON']};
  field=satelliteAssimilationPass(field,options);
  field=recoveryPass(field);
  field=stabilizationPass(field);
  field=evolutionPass(field,options.previousField||null);
  field=admissionPass(field);
  field=guidancePass(field);
  field=truthTraversalPass(field);
  field={...field,summary:summarize(field),skins:FULL_OMEGA_MODE_STACK,boundary:`${field.boundary} Mode passes preserve measured anchors, never coerce missing state to zero, and retain per-cell satellite assimilation, admission, contradiction, guidance, recovery and evolution ledgers.`};
  return field;
}
