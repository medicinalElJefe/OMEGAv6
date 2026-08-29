import {corpusState} from './corpusRuntime';

export const R21_MODE_AUTHORITY={
  schema:'OMEGA_SOURCE_BACKED_MODES_R21',
  catalogCount:179,
  sources:[
    'dewey_canon_phase2_objective_workbook.xlsx / Mode Ledger',
    'Dewey_Calculus_20736D_Complete_Trig_Water_Mode188_Atlas.xlsx / README + Mode Registry',
    'Dewey_Calculus_20736D_ENTIRE_Full_Canon_Trig_Water_Scar_Mode188_Atlas.xlsx / Formula_Ledger',
    'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx / TEST_MATRIX_ALL',
    'OMEGA_Master_Ledger_Milestone03.xlsx / Module_Dependencies'
  ],
  boundary:'Only operators whose required inputs are present in the canonical packet are executed. Catalog names, semantic similarity and representation dimensions are never treated as execution or empirical proof.'
} as const;

export type SourceBackedModeState='EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS';
export type SourceBackedModeResult={
  id:string;name:string;state:SourceBackedModeState;formula:string;source:string;value:number|string|null;inputs:string[];missing:string[];detail:string;
};

const EPS=1e-9;
const finite=(x:any)=>Number.isFinite(Number(x));
const num=(x:any)=>finite(x)?Number(x):0;
const fmt=(x:number)=>Number.isFinite(x)?Number(x.toFixed(6)):0;

export function evaluateSourceBackedModes(record:any):SourceBackedModeResult[]{
  const C=num(record?.metrics?.continuity),Phi=num(record?.metrics?.plasticity),q=num(record?.metrics?.contradiction),Lambda=num(record?.metrics?.burden),scar=num(record?.metrics?.scar),evidence=num(record?.metrics?.evidence);
  const prev=corpusState((Number(record?.address||0)+20735)%20736),angle=num(record?.geometry?.phi)*Math.PI*2;
  const exact=(id:string,name:string,formula:string,source:string,value:number|string,inputs:string[],detail:string):SourceBackedModeResult=>({id,name,state:'EXECUTED_EXACT',formula,source,value:typeof value==='number'?fmt(value):value,inputs,missing:[],detail});
  const packet=(id:string,name:string,formula:string,source:string,value:number|string,inputs:string[],detail:string,state:SourceBackedModeState='SOURCE_PACKET'):SourceBackedModeResult=>({id,name,state,formula,source,value:typeof value==='number'?fmt(value):value,inputs,missing:[],detail});
  const gated=(id:string,name:string,formula:string,source:string,inputs:string[],missing:string[],detail:string):SourceBackedModeResult=>({id,name,state:'GATED_MISSING_INPUTS',formula,source,value:null,inputs,missing,detail});
  return [
    exact('M001','Unified Coherence / Dewey Score','S=(CΩ·Φ)/(q+Λ+ε)','phase2 Mode Ledger + 20736D README',(C*Phi)/(q+Lambda+EPS),['CΩ','Φ','q','Λ'],'Primary decision/coherence kernel with all required packet inputs present.'),
    exact('M002','Mode 188 lens score','M188=(CΩ+Scar)/(1+q)','phase2 Mode Ledger',(C+scar)/(1+q),['CΩ','Scar','q'],'Exact donor formula; distinct from the categorical Mode188 source gate.'),
    packet('M003','Mode 188 source gate','source category predict.mode188_gate','20736D source packet',String(record?.metrics?.mode188||'UNKNOWN'),['predict.mode188_gate'],'Exact categorical gate carried by the embedded source packet.'),
    exact('M004','Forecast Mode','F_t=CΩ_t+Φ_t-q_t-Λ_t','phase2 Mode Ledger',C+Phi-q-Lambda,['CΩ','Φ','q','Λ'],'Exact time-weighted forward signal formula from the donor ledger; it is a model signal, not future observation.'),
    exact('M005','Prune Mode','Prune=q+Λ-CΩ','phase2 Mode Ledger',q+Lambda-C,['q','Λ','CΩ'],'Exact contradiction/burden pruning pressure.'),
    exact('M006','Host-Centered Runtime','HCR=CΩ_host/(Λ_host+ε)','phase2 Mode Ledger',C/(Lambda+EPS),['CΩ','Λ'],'Exact host-centered continuity-to-burden ratio using the current packet.'),
    exact('M007','Contradiction Turbulence','Turb=q/(CΩ+ε)','phase2 Mode Ledger',q/(C+EPS),['q','CΩ'],'Exact instability pressure ratio.'),
    exact('M008','Burden Compression','B=Λ/(CΩ+Φ+ε)','phase2 Mode Ledger',Lambda/(C+Phi+EPS),['Λ','CΩ','Φ'],'Exact load/compression ratio.'),
    exact('M009','Scar Carry Trigonometry','Scar_next=Previous_Scar·0.972+|sin(Angle_Rad)|·q·(1-CΩ)','Full Canon Formula_Ledger',num(prev.metrics.scar)*.972+Math.abs(Math.sin(angle))*q*(1-C),['Previous_Scar','Angle_Rad','q','CΩ'],'Previous scar is taken from the immediately prior canonical state; Angle_Rad is reconstructed from the packet phase geometry.'),
    packet('M010','Continuity-Field Runtime','CΩ = retained lawful links / total links','phase2 Mode Ledger',C,['CΩ packet channel'],'The current packet contains the resulting CΩ channel but not the underlying link-count ledger, so the packet value is exposed without pretending to recompute the ratio.'),
    packet('M011','Traversal Engine','Next=argmax(S_i) / admitted route','phase2 Mode Ledger',Number(record?.autoPing?.dataNext)+1,['autoPing.dataNext'],'The hosted runtime carries a deterministic admitted route produced by the canonical route logic. Candidate score vectors are not fabricated.', 'DERIVED_RUNTIME'),
    packet('M012','Guidance Field','STAY / TURN / ESCALATE source decision','phase2 Mode Ledger',String(record?.metrics?.decision||'UNKNOWN'),['predict.decision'],'Exact categorical source decision. The donor ledger names max(S,T,E), but the three raw candidate score channels are not separately present.'),
    packet('M013','Future Plasticity','Φ source packet channel','20736D source packet',Phi,['Φ'],'Current packet future-plasticity/recoverability channel; no claim of physical dimension.'),
    packet('M014','Evidence / Proof Weight','identity.Evidence_Weight','20736D source packet',evidence,['Evidence_Weight'],'Source evidence weight only. Verified/Claimed counts needed by the separate P=Verified/Claimed operator are not silently inferred.'),
    gated('M015','Deep Mother Mode','Mother=(CΩ·Care)/(Λ+ε)','phase2 Mode Ledger',['CΩ','Care','Λ'],['Care'],'Exact donor formula is preserved but execution is gated because Care is not an authoritative packet input.'),
    gated('M016','High Father Mode','Father=(Proof·Aim)/(q+Λ+ε)','phase2 Mode Ledger',['Proof','Aim','q','Λ'],['Aim','Proof count/score'],'Exact donor formula is preserved but execution is gated because Aim and an authoritative Proof input are absent.'),
    gated('M017','RAFT-188','RAFT=R+A+F+T','phase2 Mode Ledger',['Recovery','Anchor','Forecast','Transform'],['Recovery','Anchor','Transform'],'Formula retained; missing terms are not replaced with proxies.'),
    gated('M018','Gamma Admission Loop','Γ=Novelty·Fit·Proof','phase2 Mode Ledger',['Novelty','Fit','Proof'],['Novelty','Fit','Proof'],'Admission formula retained; missing calibrated inputs keep it gated.'),
    gated('M019','Renderer Cluster','R=Σ(layer_i·weight_i)','phase2 Mode Ledger',['layer_i','weight_i'],['authoritative layer weights'],'Renderer-composition law retained; the current packet does not supply the complete calibrated layer-weight vector.'),
    gated('M020','Unified Coherence full blend','MAX(0,MIN(1,(Base_Coherence+Mother_Mode+Father_Mode+Water_Basin)/4))','Full Canon Formula_Ledger',['Base_Coherence','Mother_Mode','Father_Mode','Water_Basin'],['Mother_Mode','Father_Mode','Water_Basin'],'This alternate donor blend is not substituted for the primary executable kernel until its required terms are source-bound.')
  ];
}

export function sourceBackedModeSummary(record:any){
  const rows=evaluateSourceBackedModes(record),executed=rows.filter(x=>x.state==='EXECUTED_EXACT'),packet=rows.filter(x=>x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME'),gated=rows.filter(x=>x.state==='GATED_MISSING_INPUTS');
  return{rows,executed,packet,gated,appliedCount:executed.length+packet.length,exactCount:executed.length,packetCount:packet.length,gatedCount:gated.length,catalogCount:R21_MODE_AUTHORITY.catalogCount,boundary:R21_MODE_AUTHORITY.boundary};
}

export type TraversalStateR21={step:number;address:number;stateId:number;decision:string;C:number;Phi:number;q:number;Lambda:number;scar:number;evidence:number;dewey:number;mode188:number;next:number};
export function compileSourceTraversal(startAddress:number,maxSteps=64){
  const start=Math.max(0,Math.min(20735,Math.floor(startAddress))),seen=new Set<number>(),path:TraversalStateR21[]=[];let a=start,closed=false;
  for(let step=0;step<Math.max(2,Math.min(256,maxSteps));step++){
    if(seen.has(a)){closed=true;break}seen.add(a);
    const r=corpusState(a),C=num(r.metrics.continuity),Phi=num(r.metrics.plasticity),q=num(r.metrics.contradiction),Lambda=num(r.metrics.burden),scar=num(r.metrics.scar),evidence=num(r.metrics.evidence),next=Math.max(0,Math.min(20735,Number(r.autoPing.dataNext)||0));
    path.push({step,address:a,stateId:r.stateId,decision:String(r.metrics.decision),C,Phi,q,Lambda,scar,evidence,dewey:(C*Phi)/(q+Lambda+EPS),mode188:(C+scar)/(1+q),next});
    if(next===a){closed=true;break}a=next;
  }
  return{start,path,closed,boundary:'Trajectory follows the canonical autoPing.dataNext route only. No interpolated state is presented as source data.'};
}
