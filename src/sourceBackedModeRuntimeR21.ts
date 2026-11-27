import {corpusState,corpusScarAtR981,isCorpusReady} from './corpusRuntime';
import {evaluateMode188DriveRuntimeR311,missingMode188InputsR980} from './mode188DriveRuntimeR311';

export const R21_MODE_AUTHORITY={
  schema:'OMEGA_SOURCE_BACKED_MODES_R21',
  catalogCount:179,
  sources:[
    'dewey_canon_phase2_objective_workbook.xlsx / Mode Ledger',
    'Dewey_Calculus_20736D_Complete_Trig_Water_Mode188_Atlas.xlsx / README + Mode Registry',
    'Dewey_Calculus_20736D_ENTIRE_Full_Canon_Trig_Water_Scar_Mode188_Atlas.xlsx / Formula_Ledger',
    'OMEGA FULL CANON MODE WITH ATLAS / Formula_Ledger + 20,736-row formal atlas',
    'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx / TEST_MATRIX_ALL',
    'OMEGA_Master_Ledger_Milestone03.xlsx / Module_Dependencies',
    'Mode188_Unified_Runtime_20736D_SYNCED.xlsx / Runtime_Control + Atlas_20736_Runtime'
  ],
  boundary:'Only operators whose required inputs are present in the canonical packet are executed; an exact deterministic reconstruction from the declared Full Canon formal atlas is admitted only as a formal packet input with FORMAL_CANON_ATLAS provenance. R311 additionally recomputes the exact Drive Mode-188 Sratio/decision law from source-derived packet channels without treating those browser channels as fresh empirical measurement. Catalog names, semantic similarity and representation dimensions are never treated as execution or empirical proof.'
} as const;

export type SourceBackedModeState='EXECUTED_EXACT'|'SOURCE_PACKET'|'DERIVED_RUNTIME'|'GATED_MISSING_INPUTS';
export type SourceBackedModeResult={
  id:string;name:string;state:SourceBackedModeState;formula:string;source:string;value:number|string|null;inputs:string[];missing:string[];detail:string;
};

// R978: absence is not zero; preserve the donor formulas but admit only
// explicitly supplied finite numeric channels and valid canonical coordinates.
const strictFinite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const validAddress=(x:unknown):x is number=>strictFinite(x)&&Number.isInteger(x)&&x>=0&&x<20736;
const validAxis=(x:unknown)=>strictFinite(x)&&Number.isInteger(x)&&x>=0&&x<12;
const validCategory=(x:unknown)=>typeof x==='string'&&x.trim().length>0&&x!=='UNKNOWN';
const EPS=1e-9;
const finite=(x:any)=>Number.isFinite(Number(x));
const num=(x:any)=>finite(x)?Number(x):0;
const fmt=(x:number)=>Number.isFinite(x)?Number(x.toFixed(6)):0;
const clamp01=(x:number)=>Math.max(0,Math.min(1,x));

export function canonicalFullCanonTermsR308(record:any){
  const coordinates=record?.coordinates||{};
  const d=Math.max(0,Math.min(11,Math.floor(num(coordinates.d))));
  const p=Math.max(0,Math.min(11,Math.floor(num(coordinates.p))));
  const r=Math.max(0,Math.min(11,Math.floor(num(coordinates.r))));
  const l=Math.max(0,Math.min(11,Math.floor(num(coordinates.l))));
  const domainIndex=d+1,stateIndex=p+1,phaseStep=Math.PI/6;
  const baseCoherence=clamp01((1+Math.cos((domainIndex+stateIndex-2)*phaseStep))/2);
  const structureVector=clamp01((1+Math.sin(domainIndex*phaseStep))/2);
  const compressionVector=clamp01((1+Math.cos((stateIndex+1)*phaseStep))/2);
  const traversalVector=clamp01((1+Math.sin((domainIndex+stateIndex-2)*phaseStep))/2);
  const waterBasin=clamp01((1+Math.cos((r-l)*phaseStep))/2);
  const motherMode=waterBasin*.618+compressionVector*.382;
  const fatherMode=structureVector*.618+traversalVector*.382;
  const unifiedCoherence=clamp01((baseCoherence+motherMode+fatherMode+waterBasin)/4);
  return{domainIndex,stateIndex,trigIndex:r+1,waterIndex:l+1,baseCoherence,structureVector,compressionVector,traversalVector,waterBasin,motherMode,fatherMode,unifiedCoherence,sourceClass:'FORMAL_CANON_ATLAS' as const};
}

export function evaluateSourceBackedModes(record:any):SourceBackedModeResult[]{
  const C=num(record?.metrics?.continuity),Phi=num(record?.metrics?.plasticity),q=num(record?.metrics?.contradiction),Lambda=num(record?.metrics?.burden),scar=num(record?.metrics?.scar),evidence=num(record?.metrics?.evidence);
  const previousScar=validAddress(record?.address)&&isCorpusReady()?corpusScarAtR981((record.address+20735)%20736):null,angle=num(record?.geometry?.phi)*Math.PI*2,canon=canonicalFullCanonTermsR308(record);
  const m=record?.metrics,c=record?.coordinates;
  const requirements:Record<string,Array<[string,boolean]>>={
   M001:[['CΩ',strictFinite(m?.continuity)],['Φ',strictFinite(m?.plasticity)],['q',strictFinite(m?.contradiction)],['Λ',strictFinite(m?.burden)]],
   M002:[['CΩ',strictFinite(m?.continuity)],['Scar',strictFinite(m?.scar)],['q',strictFinite(m?.contradiction)]],
   M003:[['predict.mode188_gate',validCategory(m?.mode188)]],
   M004:[['CΩ',strictFinite(m?.continuity)],['Φ',strictFinite(m?.plasticity)],['q',strictFinite(m?.contradiction)],['Λ',strictFinite(m?.burden)]],
   M005:[['q',strictFinite(m?.contradiction)],['Λ',strictFinite(m?.burden)],['CΩ',strictFinite(m?.continuity)]],
   M006:[['CΩ',strictFinite(m?.continuity)],['Λ',strictFinite(m?.burden)]],
   M007:[['q',strictFinite(m?.contradiction)],['CΩ',strictFinite(m?.continuity)]],
   M008:[['Λ',strictFinite(m?.burden)],['CΩ',strictFinite(m?.continuity)],['Φ',strictFinite(m?.plasticity)]],
   M009:[['Previous_Scar',strictFinite(previousScar)],['Angle_Rad',strictFinite(record?.geometry?.phi)],['q',strictFinite(m?.contradiction)],['CΩ',strictFinite(m?.continuity)]],
   M010:[['CΩ packet channel',strictFinite(m?.continuity)]],
   M011:[['autoPing.dataNext',validAddress(record?.autoPing?.dataNext)]],
   M012:[['predict.decision',validCategory(m?.decision)]],
   M013:[['Φ',strictFinite(m?.plasticity)]],
   M014:[['Evidence_Weight',strictFinite(m?.evidence)]],
   M015:[['d',validAxis(c?.d)],['p',validAxis(c?.p)],['r',validAxis(c?.r)],['l',validAxis(c?.l)]],
   M016:[['d',validAxis(c?.d)],['p',validAxis(c?.p)]],
   M020:[['d',validAxis(c?.d)],['p',validAxis(c?.p)],['r',validAxis(c?.r)],['l',validAxis(c?.l)]]
  };
  const admitted=(row:SourceBackedModeResult):SourceBackedModeResult=>{
   if(row.state==='GATED_MISSING_INPUTS')return row;
   const missing=(requirements[row.id]||[]).filter(([,ok])=>!ok).map(([name])=>name);
   return missing.length?{...row,state:'GATED_MISSING_INPUTS',value:null,missing,detail:'Required source packet channels absent or invalid; no default value admitted.'}:row;
  };
  const exact=(id:string,name:string,formula:string,source:string,value:number|string,inputs:string[],detail:string):SourceBackedModeResult=>typeof value==='number'&&!Number.isFinite(value)?{id,name,state:'GATED_MISSING_INPUTS',formula,source,value:null,inputs,missing:['finite formula result'],detail:'Formula output is nonfinite; execution result refused.'}:({id,name,state:'EXECUTED_EXACT',formula,source,value:typeof value==='number'?fmt(value):value,inputs,missing:[],detail});
  const packet=(id:string,name:string,formula:string,source:string,value:number|string,inputs:string[],detail:string,state:SourceBackedModeState='SOURCE_PACKET'):SourceBackedModeResult=>({id,name,state,formula,source,value:typeof value==='number'?fmt(value):value,inputs,missing:[],detail});
  const gated=(id:string,name:string,formula:string,source:string,inputs:string[],missing:string[],detail:string):SourceBackedModeResult=>({id,name,state:'GATED_MISSING_INPUTS',formula,source,value:null,inputs,missing,detail});
  return [
    exact('M001','Unified Coherence / Dewey Score','S=(CΩ·Φ)/(q+Λ+ε)','phase2 Mode Ledger + 20736D README',(C*Phi)/(q+Lambda+EPS),['CΩ','Φ','q','Λ'],'Primary decision/coherence kernel with all required packet inputs present.'),
    exact('M002','Mode 188 lens score','M188=(CΩ+Scar)/(1+q)','phase2 Mode Ledger',(C+scar)/(1+q),['CΩ','Scar','q'],'Exact donor lens formula; distinct from the Drive workbook Sratio/decision runtime exposed by sourceBackedModeSummary().mode188Drive.'),
    packet('M003','Mode 188 source gate','source category predict.mode188_gate','20736D source packet',String(record?.metrics?.mode188||'UNKNOWN'),['predict.mode188_gate'],'Exact categorical gate carried by the embedded source packet. It remains distinct from the R311 Drive Sratio recomputation unless the source category is directly comparable.'),
    exact('M004','Forecast Mode','F_t=CΩ_t+Φ_t-q_t-Λ_t','phase2 Mode Ledger',C+Phi-q-Lambda,['CΩ','Φ','q','Λ'],'Exact time-weighted forward signal formula from the donor ledger; it is a model signal, not future observation.'),
    exact('M005','Prune Mode','Prune=q+Λ-CΩ','phase2 Mode Ledger',q+Lambda-C,['q','Λ','CΩ'],'Exact contradiction/burden pruning pressure.'),
    exact('M006','Host-Centered Runtime','HCR=CΩ_host/(Λ_host+ε)','phase2 Mode Ledger',C/(Lambda+EPS),['CΩ','Λ'],'Exact host-centered continuity-to-burden ratio using the current packet.'),
    exact('M007','Contradiction Turbulence','Turb=q/(CΩ+ε)','phase2 Mode Ledger',q/(C+EPS),['q','CΩ'],'Exact instability pressure ratio.'),
    exact('M008','Burden Compression','B=Λ/(CΩ+Φ+ε)','phase2 Mode Ledger',Lambda/(C+Phi+EPS),['Λ','CΩ','Φ'],'Exact load/compression ratio.'),
    exact('M009','Scar Carry Trigonometry','Scar_next=Previous_Scar·0.972+|sin(Angle_Rad)|·q·(1-CΩ)','Full Canon Formula_Ledger',num(previousScar)*.972+Math.abs(Math.sin(angle))*q*(1-C),['Previous_Scar','Angle_Rad','q','CΩ'],'Previous scar is taken from the immediately prior canonical state; Angle_Rad is reconstructed from the packet phase geometry.'),
    packet('M010','Continuity-Field Runtime','CΩ = retained lawful links / total links','phase2 Mode Ledger',C,['CΩ packet channel'],'The current packet contains the resulting CΩ channel but not the underlying link-count ledger, so the packet value is exposed without pretending to recompute the ratio.'),
    packet('M011','Traversal Engine','Next=argmax(S_i) / admitted route','phase2 Mode Ledger',Number(record?.autoPing?.dataNext)+1,['autoPing.dataNext'],'The hosted runtime carries a deterministic admitted route produced by the canonical route logic. Candidate score vectors are not fabricated.', 'DERIVED_RUNTIME'),
    packet('M012','Guidance Field','STAY / TURN / ESCALATE source decision','phase2 Mode Ledger',String(record?.metrics?.decision||'UNKNOWN'),['predict.decision'],'Exact categorical source decision. The donor ledger names max(S,T,E), but the three raw candidate score channels are not separately present.'),
    packet('M013','Future Plasticity','Φ source packet channel','20736D source packet',Phi,['Φ'],'Current packet future-plasticity/recoverability channel; no claim of physical dimension.'),
    packet('M014','Evidence / Proof Weight','identity.Evidence_Weight','20736D source packet',evidence,['Evidence_Weight'],'Source evidence weight only. Verified/Claimed counts needed by the separate P=Verified/Claimed operator are not silently inferred.'),
    exact('M015','Deep Mother Mode','Mother_Mode=Water_Basin·0.618+Compression_Vector·0.382','OMEGA FULL CANON MODE WITH ATLAS / Formula_Ledger',canon.motherMode,['Water_Basin','Compression_Vector'],'R308 restores the exact Full Canon formal operator from the 20,736-row atlas. Water_Basin and Compression_Vector are reconstructed from the same declared address geometry; this is formal-model output, not empirical measurement.'),
    exact('M016','High Father Mode','Father_Mode=Structure_Vector·0.618+Traversal_Vector·0.382','OMEGA FULL CANON MODE WITH ATLAS / Formula_Ledger',canon.fatherMode,['Structure_Vector','Traversal_Vector'],'R308 restores the exact Full Canon formal operator from the 20,736-row atlas. Structure and traversal vectors are reconstructed from the same declared address geometry; this is formal-model output, not empirical measurement.'),
    gated('M017','RAFT-188','RAFT=R+A+F+T','phase2 Mode Ledger',['Recovery','Anchor','Forecast','Transform'],['Recovery','Anchor','Transform'],'Formula retained; missing terms are not replaced with proxies.'),
    gated('M018','Gamma Admission Loop','Γ=Novelty·Fit·Proof','phase2 Mode Ledger',['Novelty','Fit','Proof'],['Novelty','Fit','Proof'],'Admission formula retained; missing calibrated inputs keep it gated.'),
    gated('M019','Renderer Cluster','R=Σ(layer_i·weight_i)','phase2 Mode Ledger',['layer_i','weight_i'],['authoritative layer weights'],'Renderer-composition law retained; the current packet does not supply the complete calibrated layer-weight vector.'),
    exact('M020','Unified Coherence full blend','MAX(0,MIN(1,(Base_Coherence+Mother_Mode+Father_Mode+Water_Basin)/4))','OMEGA FULL CANON MODE WITH ATLAS / Formula_Ledger',canon.unifiedCoherence,['Base_Coherence','Mother_Mode','Father_Mode','Water_Basin'],'R308 restores the exact Full Canon normalized blend from its declared formal atlas inputs. It remains distinct from M001 and carries formal-model authority only.')
  ].map(admitted);
}

export function sourceBackedModeSummary(record:any){
  const rows=evaluateSourceBackedModes(record),executed=rows.filter(x=>x.state==='EXECUTED_EXACT'),packet=rows.filter(x=>x.state==='SOURCE_PACKET'||x.state==='DERIVED_RUNTIME'),gated=rows.filter(x=>x.state==='GATED_MISSING_INPUTS'),mode188Drive=evaluateMode188DriveRuntimeR311(record);
  return{rows,executed,packet,gated,mode188Drive,appliedCount:executed.length+packet.length,exactCount:executed.length,packetCount:packet.length,gatedCount:gated.length,catalogCount:R21_MODE_AUTHORITY.catalogCount,boundary:R21_MODE_AUTHORITY.boundary};
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

// R979: bounded, reproducible coverage of the actual R21 contracts.
// The 179-entry catalog and 62 lenses are not substituted for executors.
export function chartSourceModeFieldR979(start:number,count:number){
 if(!Number.isSafeInteger(start)||start<0||start>=20736||!Number.isSafeInteger(count)||count<1||count>144||start+count>20736)throw new RangeError('Invalid canonical chart range');
 return Array.from({length:count},(_,offset)=>{
  const address=start+offset,record=corpusState(address);
  const missing=missingMode188InputsR980(record);
  const mode188Drive=missing.length?null:evaluateMode188DriveRuntimeR311(record);
  return {address,stateId:record.stateId,coordinates:record.coordinates,modes:evaluateSourceBackedModes(record),mode188Drive,mode188Missing:missing};
 });
}
export function modeChartCSVHeaderR979(rows:SourceBackedModeResult[]){
 return ['address','state_id','d','p','r','l',...rows.flatMap(row=>[row.id+'_state',row.id+'_value',row.id+'_missing']),'R311_state','R311_ratio','R311_decision','R311_packet_gate','R311_agrees','R311_missing'].join(',');
}
const csvR979=(value:unknown)=>'"'+String(value??'').replace(/"/g,'""')+'"';
export function modeChartCSVRowR979(row:ReturnType<typeof chartSourceModeFieldR979>[number]){
 const {d,p,r,l}=row.coordinates;
 return [row.address,row.stateId,d,p,r,l,...row.modes.flatMap(mode=>[csvR979(mode.state),csvR979(mode.value),csvR979(mode.missing.join('; '))]),csvR979(row.mode188Drive?'FORMULA_EXACT_PACKET_INPUTS':'GATED_MISSING_INPUTS'),csvR979(row.mode188Drive?.sratio),csvR979(row.mode188Drive?.decision),csvR979(row.mode188Drive?.packetGate),csvR979(row.mode188Drive?.agreesWithComparablePacketGate),csvR979(row.mode188Missing.join('; '))].join(',');
}

// R982: additional exact hooks recovered from phase2 Mode Ledger.
// These are parameterized computations, not empirical or canonical admission.
// Distinct variant IDs avoid confusing the earlier Mother/Father formulas
// with the R308 formal blend or the R311 workbook decision law.
export const DONOR_FORMULA_HOOKS_R982=Object.freeze([
 {id:'RAFT',name:'RAFT-188',formula:'R+A+F+T',fields:['Recovery','Anchor','Forecast','Transform']},
 {id:'GAMMA',name:'Gamma admission score',formula:'Novelty*Fit*Proof',fields:['Novelty','Fit','Proof']},
 {id:'RENDER',name:'Renderer layer composition',formula:'Σ(layer_i*weight_i)',fields:['layers','weights']},
 {id:'PROOF',name:'Proof ledger ratio',formula:'Verified/Claimed',fields:['Verified','Claimed']},
 {id:'SCAR',name:'Scar ledger product',formula:'Impact*Persistence*Lesson',fields:['Impact','Persistence','Lesson']},
 {id:'EVOLVE',name:'Continuance/Evolution',formula:'CΩ+Φ-q',fields:['Continuity','Plasticity','Contradiction']},
 {id:'SHORTCUT',name:'Shortcut operator',formula:'Outcome/Cost',fields:['Outcome','Cost']},
 {id:'BALANCE',name:'Symmetry/asymmetry balance',formula:'Sym/(Asym+ε)',fields:['Symmetry','Asymmetry','Epsilon']},
 {id:'MEMETIC',name:'Memetic encoding',formula:'Clarity*Repeatability*CΩ',fields:['Clarity','Repeatability','Continuity']},
 {id:'MOTHER_PHASE2',name:'Deep Mother — phase2 variant',formula:'CΩ*Care/(Λ+ε)',fields:['Continuity','Care','Burden','Epsilon']},
 {id:'FATHER_PHASE2',name:'High Father — phase2 variant',formula:'Proof*Aim/(q+Λ+ε)',fields:['Proof','Aim','Contradiction','Burden','Epsilon']}
] as const);
export function evaluateDonorFormulaR982(id:string,raw:Record<string,unknown>,inputSource:string){
 const spec=DONOR_FORMULA_HOOKS_R982.find(x=>x.id===id);
 if(!spec)throw new Error('Unknown donor formula variant');
 if(typeof inputSource!=='string'||!inputSource.trim()||inputSource.length>512)throw new Error('Explicit input provenance required');
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error('Explicit formula input object required');
 const values:Record<string,number|number[]>={};
 for(const field of spec.fields){
  const value=raw[field];
  if(field==='layers'||field==='weights'){
   if(!Array.isArray(value)||value.length<1||value.length>20736||!Array.from(value).every(strictFinite))throw new Error('Invalid or missing '+field);
   values[field]=Array.from(value);
  }else{
   if(!strictFinite(value))throw new Error('Invalid or missing '+field);
   values[field]=value;
  }
 }
 const n=(key:string)=>values[key] as number;
 const ratio=(a:number,b:number)=>{if(!Number.isFinite(b)||b===0)throw new Error('Undefined or nonfinite denominator');return a/b};
 let result:number;
 switch(id){
  case 'RAFT':result=n('Recovery')+n('Anchor')+n('Forecast')+n('Transform');break;
  case 'GAMMA':result=n('Novelty')*n('Fit')*n('Proof');break;
  case 'RENDER':{
   const layers=values.layers as number[],weights=values.weights as number[];
   if(layers.length!==weights.length)throw new Error('Layer and weight counts differ');
   result=0;for(let i=0;i<layers.length;i++)result+=layers[i]*weights[i];break;
  }
  case 'PROOF':if(!Number.isSafeInteger(n('Verified'))||!Number.isSafeInteger(n('Claimed'))||n('Verified')<0||n('Claimed')<1||n('Verified')>n('Claimed'))throw new Error('Invalid verified/claimed counts');result=ratio(n('Verified'),n('Claimed'));break;
  case 'SCAR':result=n('Impact')*n('Persistence')*n('Lesson');break;
  case 'EVOLVE':result=n('Continuity')+n('Plasticity')-n('Contradiction');break;
  case 'SHORTCUT':if(n('Cost')<=0)throw new Error('Positive cost required');result=ratio(n('Outcome'),n('Cost'));break;
  case 'BALANCE':if(n('Epsilon')<=0)throw new Error('Positive epsilon required');result=ratio(n('Symmetry'),n('Asymmetry')+n('Epsilon'));break;
  case 'MEMETIC':result=n('Clarity')*n('Repeatability')*n('Continuity');break;
  case 'MOTHER_PHASE2':if(n('Epsilon')<=0)throw new Error('Positive epsilon required');result=ratio(n('Continuity')*n('Care'),n('Burden')+n('Epsilon'));break;
  case 'FATHER_PHASE2':if(n('Epsilon')<=0)throw new Error('Positive epsilon required');result=ratio(n('Proof')*n('Aim'),n('Contradiction')+n('Burden')+n('Epsilon'));break;
  default:throw new Error('Unknown donor formula variant');
 }
 if(!Number.isFinite(result))throw new Error('Nonfinite formula result');
 return {schema:'OMEGA_DONOR_FORMULA_SCENARIO_R982',id:spec.id,name:spec.name,formula:spec.formula,source:'dewey_canon_phase2_objective_workbook.xlsx / Mode Ledger',inputSource:inputSource.trim(),inputs:values,value:result,evidence:'OPERATOR_SUPPLIED_FORMULA_SCENARIO',canonicalMutation:false,admissionGranted:false,empirical:false} as const;
}

// R983: bind only identically named source channels. Operator-supplied
// constants remain scenarios; evidence weight is not Proof and forecast
// signal is not automatically the RAFT forecast term.
export const DONOR_PACKET_BINDINGS_R983=Object.freeze({
 EVOLVE:Object.freeze({Continuity:'metrics.continuity',Plasticity:'metrics.plasticity',Contradiction:'metrics.contradiction'}),
 BALANCE:Object.freeze({Symmetry:'geometry.symmetry',Asymmetry:'geometry.asymmetry'}),
 MEMETIC:Object.freeze({Continuity:'metrics.continuity'}),
 MOTHER_PHASE2:Object.freeze({Continuity:'metrics.continuity',Burden:'metrics.burden'}),
 FATHER_PHASE2:Object.freeze({Contradiction:'metrics.contradiction',Burden:'metrics.burden'})
});
export function donorPacketBindingsR983(id:string):Readonly<Record<string,string>>{
 return Object.prototype.hasOwnProperty.call(DONOR_PACKET_BINDINGS_R983,id)?DONOR_PACKET_BINDINGS_R983[id as keyof typeof DONOR_PACKET_BINDINGS_R983]:Object.freeze({});
}
export function evaluateBoundDonorR983(id:string,record:any,extra:Record<string,unknown>,inputSource:string){
 const bindings=donorPacketBindingsR983(id),boundFields=Object.keys(bindings);
 if(!boundFields.length)throw new Error('No established packet binding for this variant');
 if(!validAddress(record?.address))throw new RangeError('Invalid canonical source address');
 const spec=DONOR_FORMULA_HOOKS_R982.find(x=>x.id===id)!;
 if(!extra||typeof extra!=='object'||Array.isArray(extra))throw new Error('Explicit additional input object required');
 const inputs:Record<string,unknown>={},provenance:Record<string,string>={},missing:string[]=[];
 for(const key of Object.keys(extra)){
  if(Object.prototype.hasOwnProperty.call(bindings,key))throw new Error('Cannot override source-bound channel '+key);
  if(!(spec.fields as readonly string[]).includes(key))throw new Error('Unknown formula input '+key);
 }
 for(const field of spec.fields){
  const binding=bindings[field];
  if(binding){
   const [section,key]=binding.split('.');
   inputs[field]=record?.[section]?.[key];
   provenance[field]='CANONICAL_PACKET:'+binding;
  }else{
   inputs[field]=extra[field];
   provenance[field]='OPERATOR_SCENARIO:'+inputSource;
  }
  if(!strictFinite(inputs[field]))missing.push(field);
 }
 const base={address:record.address,id,formula:spec.formula,source:'dewey_canon_phase2_objective_workbook.xlsx / Mode Ledger',inputProvenance:provenance,canonicalMutation:false,admissionGranted:false,empirical:false} as const;
 if(missing.length)return {...base,state:'GATED_MISSING_INPUTS' as const,missing,value:null};
 const additional=spec.fields.filter(field=>!bindings[field]);
 const receipt=evaluateDonorFormulaR982(id,inputs,additional.length?inputSource:'Canonical source-derived packet channels');
 return {...base,state:additional.length?'SOURCE_AND_SCENARIO_INPUTS' as const:'FORMULA_EXACT_PACKET_INPUTS' as const,missing:[],value:receipt.value};
}
export function chartBoundDonorFieldR983(id:string,start:number,count:number,extra:Record<string,unknown>,inputSource:string){
 if(!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(count)||count<1||count>144||start+count>20736)throw new RangeError('Invalid canonical chart range');
 if(!Object.keys(donorPacketBindingsR983(id)).length)throw new Error('No established packet binding for this variant');
 return Array.from({length:count},(_,offset)=>evaluateBoundDonorR983(id,corpusState(start+offset),extra,inputSource));
}
