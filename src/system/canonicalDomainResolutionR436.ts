export const R436_SCHEMA='OMEGA_CANONICAL_DOMAIN_RESOLUTION_R436' as const;
export const R436_REVISION='R436.0' as const;

export type R436Authority='MEASURED'|'DERIVED_STANDARD'|'DERIVED_LENS'|'HYPOTHESIS';
export type R436ProofClass='PHYSICAL_INVARIANT'|'STRUCTURAL_ANALOGY'|'REPRESENTATIONAL_COINCIDENCE'|'UNRESOLVED_HYPOTHESIS';
export type R436Domain='MOTION_TRAVERSAL'|'SPECTRAL_COLOR'|'ATOMIC_CHEMISTRY'|'EARTH_WEATHER'|'CLOUD_CANDIDATE';
export type R436BranchStatus='ACTIVE'|'RESOLVED'|'BOUNDED'|'OBSERVE_ONLY'|'REJECTED_PHYSICAL'|'REJECTED_CANON'|'INCONSISTENT';

export type R436EvidenceRef={
 id:string;
 authority:R436Authority;
 source:string;
 sourceHash?:string|null;
 frame?:string|null;
 uncertainty?:number|null;
 assumptions?:string[];
};

export type R436Check={
 id:string;
 kind:'PHYSICAL'|'CANON';
 passed:boolean;
 authority:R436Authority;
 reason:string;
 residual?:number|null;
};

export type R436NodeState={
 schema:typeof R436_SCHEMA;
 revision:typeof R436_REVISION;
 nodeId:string;
 domain:R436Domain;
 address:number|null;
 stateId:string;
 frame:string;
 boundary:string;
 time:string|null;
 orientation:-1|0|1;
 sourceIdentity:string;
 sourceHash:string|null;
 authority:R436Authority;
 proofClass:R436ProofClass;
 state:Record<string,unknown>;
 evidence:R436EvidenceRef[];
 canonicalMutation:false;
};

export type R436TransitionRecord={
 transitionId:string;
 domain:R436Domain;
 fromNodeId:string|null;
 toNodeId:string;
 fromAddress:number|null;
 toAddress:number|null;
 operator:string;
 authority:R436Authority;
 physicalAdmissible:boolean;
 checks:R436Check[];
 delta:Record<string,unknown>;
 residuals:Record<string,number>;
 canonicalMutation:false;
};

export type R436Branch={
 branchId:string;
 parentBranchId:string|null;
 nodeId:string;
 transitionId:string|null;
 status:R436BranchStatus;
 authority:R436Authority;
 proofClass:R436ProofClass;
 physicalVeto:boolean;
 canonVeto:boolean;
 C_omega:number|null;
 Phi:number|null;
 q:number|null;
 Lambda:number|null;
 score:number|null;
 declineScars:string[];
 canonicalAdmissionAuthority:'R125';
 canonicalMutation:false;
};

export type R436LedgerEvent={
 index:number;
 kind:'NODE'|'TRANSITION'|'BRANCH'|'SCAR'|'PROMOTION';
 previousHash:string;
 hash:string;
 payload:Record<string,unknown>;
};

export type R436ResolutionBundle={
 schema:typeof R436_SCHEMA;
 revision:typeof R436_REVISION;
 domain:R436Domain;
 node:R436NodeState;
 transition:R436TransitionRecord|null;
 branch:R436Branch;
 ledger:R436LedgerEvent[];
 ledgerHash:string;
 truthBoundary:string;
 canonicalMutation:false;
};

const AUTHORITY_RANK:Record<R436Authority,number>={HYPOTHESIS:1,DERIVED_LENS:2,DERIVED_STANDARD:3,MEASURED:4};
const GENESIS='00000000';
const finite=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
const cl=(x:unknown)=>Math.max(0,Math.min(1,finite(Number(x))?Number(x):0));
const fnv=(input:string)=>{let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
const stable=(value:unknown):string=>{
 const seen=new WeakSet<object>();
 const norm=(v:any):any=>{
  if(v===null||typeof v!=='object')return Number.isNaN(v)?'NaN':v;
  if(seen.has(v))return '[CYCLE]';
  seen.add(v);
  if(Array.isArray(v))return v.map(norm);
  return Object.fromEntries(Object.keys(v).sort().map(k=>[k,norm(v[k])]));
 };
 return JSON.stringify(norm(value));
};
const hash=(value:unknown)=>fnv(stable(value));
const weakestAuthority=(refs:R436EvidenceRef[],fallback:R436Authority):R436Authority=>{
 if(!refs.length)return fallback;
 return refs.reduce((a,b)=>AUTHORITY_RANK[a]<=AUTHORITY_RANK[b.authority]?a:b.authority,refs[0].authority);
};
const lensScore=(C_omega:number|null,Phi:number|null,q:number|null,Lambda:number|null)=>{
 if([C_omega,Phi,q,Lambda].some(x=>x===null||!finite(x)))return null;
 return (Number(C_omega)*Number(Phi))/(Number(q)+Number(Lambda)+1e-12);
};
const ledger=(events:{kind:R436LedgerEvent['kind'];payload:Record<string,unknown>}[])=>{
 let previousHash=GENESIS;
 const out=events.map((event,index)=>{
  const hashValue=hash({index,kind:event.kind,payload:event.payload,previousHash});
  const row:R436LedgerEvent={index,kind:event.kind,previousHash,hash:hashValue,payload:event.payload};
  previousHash=hashValue;
  return row;
 });
 return{events:out,hash:previousHash};
};

export function buildCanonicalResolutionR436(input:{
 domain:R436Domain;
 address?:number|null;
 stateId:string;
 frame:string;
 boundary:string;
 time?:string|null;
 orientation?:-1|0|1;
 sourceIdentity:string;
 sourceHash?:string|null;
 state:Record<string,unknown>;
 evidence?:R436EvidenceRef[];
 proofClass:R436ProofClass;
 authority?:R436Authority;
 previousNode?:R436NodeState|null;
 operator?:string;
 checks?:R436Check[];
 delta?:Record<string,unknown>;
 residuals?:Record<string,number>;
 metrics?:{C_omega?:number|null;Phi?:number|null;q?:number|null;Lambda?:number|null};
 parentBranchId?:string|null;
 requestedStatus?:Exclude<R436BranchStatus,'REJECTED_PHYSICAL'|'REJECTED_CANON'>;
 truthBoundary:string;
}):R436ResolutionBundle{
 const evidence=input.evidence||[];
 const authority=weakestAuthority(evidence,input.authority||'HYPOTHESIS');
 const address=input.address==null?null:Math.max(0,Math.min(20735,Math.floor(Number(input.address)||0)));
 const nodeBase={
  schema:R436_SCHEMA,revision:R436_REVISION,domain:input.domain,address,stateId:String(input.stateId),frame:String(input.frame||'UNDECLARED'),
  boundary:String(input.boundary||'UNDECLARED'),time:input.time||null,orientation:input.orientation??0,sourceIdentity:String(input.sourceIdentity||'UNDECLARED'),
  sourceHash:input.sourceHash||null,authority,proofClass:input.proofClass,state:input.state,evidence,canonicalMutation:false as const
 };
 const node:R436NodeState={...nodeBase,nodeId:'NODE-'+hash(nodeBase)};
 const checks=input.checks||[];
 const failedPhysical=checks.filter(x=>x.kind==='PHYSICAL'&&!x.passed);
 const failedCanon=checks.filter(x=>x.kind==='CANON'&&!x.passed);
 const transition=input.previousNode?(()=>{
  const base={domain:input.domain,fromNodeId:input.previousNode!.nodeId,toNodeId:node.nodeId,fromAddress:input.previousNode!.address,toAddress:node.address,operator:input.operator||'DOMAIN_UPDATE',authority,physicalAdmissible:failedPhysical.length===0,checks,delta:input.delta||{},residuals:input.residuals||{},canonicalMutation:false as const};
  return{...base,transitionId:'TRANSITION-'+hash(base)} as R436TransitionRecord;
 })():null;
 const C_omega=input.metrics?.C_omega==null?null:cl(input.metrics.C_omega),Phi=input.metrics?.Phi==null?null:cl(input.metrics.Phi),q=input.metrics?.q==null?null:cl(input.metrics.q),Lambda=input.metrics?.Lambda==null?null:cl(input.metrics.Lambda);
 let status:R436BranchStatus=input.requestedStatus||'ACTIVE';
 if(failedPhysical.length)status='REJECTED_PHYSICAL';else if(failedCanon.length)status='REJECTED_CANON';
 const scars=[
  ...failedPhysical.map(x=>`PHYSICAL:${x.id}:${x.reason}`),
  ...failedCanon.map(x=>`CANON:${x.id}:${x.reason}`)
 ];
 const branchBase={
  parentBranchId:input.parentBranchId||null,nodeId:node.nodeId,transitionId:transition?.transitionId||null,status,authority,proofClass:input.proofClass,
  physicalVeto:failedPhysical.length>0,canonVeto:failedCanon.length>0,C_omega,Phi,q,Lambda,
  score:status==='ACTIVE'||status==='RESOLVED'||status==='BOUNDED'?lensScore(C_omega,Phi,q,Lambda):null,
  declineScars:scars,canonicalAdmissionAuthority:'R125' as const,canonicalMutation:false as const
 };
 const branch:R436Branch={...branchBase,branchId:'BRANCH-'+hash(branchBase)};
 const events:{kind:R436LedgerEvent['kind'];payload:Record<string,unknown>}[]=[
  {kind:'NODE',payload:{nodeId:node.nodeId,domain:node.domain,address:node.address,authority:node.authority,proofClass:node.proofClass,sourceIdentity:node.sourceIdentity}},
  ...(transition?[{kind:'TRANSITION' as const,payload:{transitionId:transition.transitionId,fromNodeId:transition.fromNodeId,toNodeId:transition.toNodeId,physicalAdmissible:transition.physicalAdmissible,operator:transition.operator}}]:[]),
  {kind:'BRANCH',payload:{branchId:branch.branchId,status:branch.status,authority:branch.authority,score:branch.score,canonicalAdmissionAuthority:'R125'}},
  ...scars.map(s=>({kind:'SCAR' as const,payload:{branchId:branch.branchId,scar:s}}))
 ];
 const l=ledger(events);
 return{schema:R436_SCHEMA,revision:R436_REVISION,domain:input.domain,node,transition,branch,ledger:l.events,ledgerHash:l.hash,truthBoundary:input.truthBoundary,canonicalMutation:false};
}

export function emitMotionResolutionR436(now:any):R436ResolutionBundle{
 const valid=now?.valid===true;
 const recordAddress=Number(now?.canonical?.address);
 const previousAddress=Number(now?.motion?.previousAddress);
 const metrics=now?.truth?.metrics||now?.truth?.evidence?.summary||{};
 const sourceIdentity=String(now?.truth?.sourceIdentity||now?.truth?.fingerprint||now?.selfModel?.currentTruthFingerprint||'R153_TRUTH_ENVELOPE');
 const evidence:R436EvidenceRef[]=(Array.isArray(now?.truth?.evidence?.packets)?now.truth.evidence.packets:[]).map((x:any)=>({
  id:String(x?.id||'EVIDENCE'),authority:x?.status==='VERIFIED'?'MEASURED':'DERIVED_STANDARD',source:String(x?.source||x?.id||'R152'),sourceHash:x?.hash||null,frame:String(now?.now?.id||'R153_NOW')
 }));
 const previousNode=Number.isFinite(previousAddress)&&previousAddress!==recordAddress?buildCanonicalResolutionR436({
  domain:'MOTION_TRAVERSAL',address:previousAddress,stateId:String(previousAddress+1),frame:String(now?.now?.id||'R153_NOW'),boundary:'Previous canonical motion address from R153.',time:now?.now?.utcTime||null,orientation:now?.motion?.weave?.orientation??0,sourceIdentity,sourceHash:null,state:{address:previousAddress},evidence,proofClass:'STRUCTURAL_ANALOGY',authority:'DERIVED_LENS',requestedStatus:'BOUNDED',truthBoundary:'Previous address is carried only as R153 canonical lineage context; no missing physical motion is synthesized.'
 }).node:null;
 return buildCanonicalResolutionR436({
  domain:'MOTION_TRAVERSAL',address:Number.isFinite(recordAddress)?recordAddress:null,stateId:String(now?.canonical?.stateId||recordAddress+1),frame:String(now?.now?.id||'R153_NOW'),boundary:String(now?.truthBoundary||'R153 governed motion state'),time:now?.now?.utcTime||null,orientation:now?.motion?.weave?.orientation??0,sourceIdentity,sourceHash:null,
  state:{canonical:now?.canonical||null,now:now?.now||null,motion:now?.motion||null,lineage:now?.lineage||[],truthFingerprint:now?.truth?.fingerprint||null},
  evidence,proofClass:'STRUCTURAL_ANALOGY',authority:evidence.length?'DERIVED_STANDARD':'DERIVED_LENS',previousNode,operator:'R153_MOTION_NOW',
  checks:[
   {id:'R153_VALID',kind:'CANON',passed:valid,authority:'DERIVED_STANDARD',reason:valid?'R153 time/frame contract valid':'R153 time/frame contract invalid'},
   {id:'CANONICAL_MUTATION_DENIED',kind:'CANON',passed:now?.canonical?.mutation===false,authority:'DERIVED_STANDARD',reason:'R125 remains CanonState admission authority'}
  ],
  delta:{metricDelta:now?.motion?.metricDelta||null,projection:now?.motion?.projection||null},
  residuals:{residualPressure:Number(now?.selfModel?.developmentLoop?.recognizedDifference?.residualPressure||0)},
  metrics:{C_omega:Number(now?.motion?.weave?.continuityFlux??metrics?.continuity??0),Phi:Number(now?.truth?.futurePlasticity??0),q:Number(now?.truth?.scarCarry?.contradiction??0),Lambda:Number(now?.truth?.uncertainty??0)},
  requestedStatus:valid?'ACTIVE':'OBSERVE_ONLY',
  truthBoundary:'R436 motion resolution wraps the existing R153 replayable NOW/motion packet. Address-route derivatives remain computational motion unless separately bound to measured physical time/position; R125 alone can admit CanonState.'
 });
}

export function emitSpectralResolutionR436(address:number,rel:any):R436ResolutionBundle{
 const finitePhysics=[rel?.temperatureK,rel?.wavelengthNm,rel?.dimensionlessHcOverLambdaKT,rel?.planckRadiance,rel?.wienPeakNm].every((x:any)=>Number.isFinite(Number(x)));
 return buildCanonicalResolutionR436({
  domain:'SPECTRAL_COLOR',address,stateId:String(address+1),frame:'R43_TEMPERATURE_WAVELENGTH_GRID',boundary:'144×144 temperature/wavelength model grid; Planck/Wien are standard physics calculations, address placement is representational.',sourceIdentity:'R43_RELATIVITY_GRID',state:{...rel},
  evidence:[{id:'R43_PLANCK_WIEN',authority:'DERIVED_STANDARD',source:'SI constants + R43 declared temperature/wavelength coordinates',frame:'spectral'}],
  proofClass:'PHYSICAL_INVARIANT',authority:'DERIVED_STANDARD',
  checks:[
   {id:'FINITE_SPECTRAL_STATE',kind:'PHYSICAL',passed:finitePhysics,authority:'DERIVED_STANDARD',reason:finitePhysics?'finite Planck/Wien state':'non-finite spectral calculation'},
   {id:'ADDRESS_IS_REPRESENTATION',kind:'CANON',passed:true,authority:'DERIVED_LENS',reason:'20,736 address is a computational mapping, not a physical dimension'}
  ],
  requestedStatus:finitePhysics?'RESOLVED':'OBSERVE_ONLY',
  truthBoundary:'E=hν=hc/λ, Planck radiance and Wien displacement keep ordinary physical meaning. The 20,736 address and color/canon mapping remain model-space representation unless independently observed.'
 });
}

export function emitAtomicChemistryResolutionR436(record:any):R436ResolutionBundle{
 const z=Number(record?.Z??record?.atomicNumber),hasSource=Number.isInteger(z)&&z>=1&&z<=118&&Boolean(record?.Element||record?.element||record?.Name||record?.name);
 const measured:any={};
 for(const key of ['Z','atomicNumber','Symbol','symbol','Element','element','Name','name','AtomicMass','atomicMass','Electronegativity','electronegativity','AtomicRadius_pm','radiusPm','Ionization_kJmol','ionizationKJmol'])if(record?.[key]!=null)measured[key]=record[key];
 return buildCanonicalResolutionR436({
  domain:'ATOMIC_CHEMISTRY',address:record?.address==null?null:Number(record.address),stateId:hasSource?`Z-${z}`:'ATOMIC-SOURCE-HELD',frame:String(record?.frame||'ATOMIC_REFERENCE'),boundary:'Atomic/chemistry source record. Standard reference properties remain distinct from OMEGA-derived atlas metrics.',sourceIdentity:String(record?.source||record?.dataset||'SOURCE_REQUIRED'),sourceHash:record?.sourceHash||null,state:{measured,derived:record?.derived||null},
  evidence:hasSource?[{id:`ELEMENT-${z}`,authority:'MEASURED',source:String(record?.source||record?.dataset||'DECLARED_ATOMIC_SOURCE'),sourceHash:record?.sourceHash||null,frame:String(record?.frame||'ATOMIC_REFERENCE')}]:[],
  proofClass:hasSource?'PHYSICAL_INVARIANT':'UNRESOLVED_HYPOTHESIS',authority:hasSource?'MEASURED':'HYPOTHESIS',
  checks:[
   {id:'TYPED_ATOMIC_SOURCE_REQUIRED',kind:'PHYSICAL',passed:hasSource,authority:'MEASURED',reason:hasSource?'typed Z/element source present':'typed atomic/chemistry source record is not loaded'},
   {id:'NO_ATLAS_AS_MEASUREMENT',kind:'CANON',passed:true,authority:'DERIVED_LENS',reason:'OMEGA atlas metrics cannot substitute for source chemistry'}
  ],
  requestedStatus:hasSource?'ACTIVE':'OBSERVE_ONLY',
  truthBoundary:'R436 does not fabricate the currently missing first-class atomic science pack. It emits canonical state only from typed source/reference records and keeps OMEGA-derived transforms subordinate to that evidence.'
 });
}

export function emitEarthWeatherResolutionR436(data:any,lat:number,lon:number):R436ResolutionBundle{
 const current=data?.current||{},quality=data?.quality||{},derived=data?.derived||{},scars=Array.isArray(data?.scarLedger)?data.scarLedger:[];
 const targetOk=Number.isFinite(Number(data?.target?.lat))&&Number.isFinite(Number(data?.target?.lon))&&Math.abs(Number(data.target.lat)-lat)<=.000011&&Math.abs(Number(data.target.lon)-lon)<=.000011;
 const sourceOk=Boolean(data?.sources?.openMeteo?.source||data?.sources?.openMeteo?.ok);
 const evidence:R436EvidenceRef[]=[
  ...(sourceOk?[{id:'OPEN_METEO_FORECAST',authority:'MEASURED' as const,source:String(data?.sources?.openMeteo?.source||'Open-Meteo'),frame:'geodetic-weather'}]:[]),
  ...(data?.sources?.nws?.ok?[{id:'NWS_CROSSCHECK',authority:'MEASURED' as const,source:String(data.sources.nws.office||'NWS'),frame:'geodetic-weather'}]:[]),
  ...(data?.satellite?.ok?[{id:'GOES_FRESHNESS',authority:'MEASURED' as const,source:String(data.satellite.source||data.satellite.id||'GOES'),frame:'hemispheric-observation'}]:[])
 ];
 return buildCanonicalResolutionR436({
  domain:'EARTH_WEATHER',address:null,stateId:`WEATHER-${lat.toFixed(5)}-${lon.toFixed(5)}-${String(data?.generatedAt||data?.timestamp||'CURRENT')}`,frame:`WGS84:${lat.toFixed(5)},${lon.toFixed(5)}`,boundary:'Returned meteorology is source evidence; continuity/transition metrics are derived structure only.',time:data?.generatedAt||data?.timestamp||null,sourceIdentity:String(data?.sources?.openMeteo?.source||'OMEGA_EARTH_WEATHER_R375'),sourceHash:data?.sourceHash||null,state:{target:data?.target||{lat,lon},current,hourly:Array.isArray(data?.hourly)?data.hourly:[],daily:Array.isArray(data?.daily)?data.daily:[],quality,satellite:data?.satellite||{},derived,scarLedger:scars},
  evidence,proofClass:'STRUCTURAL_ANALOGY',authority:evidence.length?'MEASURED':'HYPOTHESIS',
  checks:[
   {id:'EXACT_TARGET_BINDING',kind:'PHYSICAL',passed:targetOk,authority:'MEASURED',reason:targetOk?'returned target matches selected location':'returned weather target mismatch'},
   {id:'PRIMARY_SOURCE_PRESENT',kind:'PHYSICAL',passed:sourceOk,authority:'MEASURED',reason:sourceOk?'primary returned forecast source present':'primary returned forecast source missing'},
   {id:'CANONSTATE_MUTATION_DENIED',kind:'CANON',passed:data?.canonicalMutation!==true,authority:'DERIVED_STANDARD',reason:'weather observations and derived continuity cannot mutate CanonState'}
  ],
  residuals:{sourceDisagreement:quality?.sourceAgreement==null?0:Math.max(0,1-Number(quality.sourceAgreement))},
  metrics:{C_omega:Number(derived?.continuityMean24h??0),Phi:null,q:quality?.sourceAgreement==null?null:Math.max(0,1-Number(quality.sourceAgreement)),Lambda:quality?.dataCompleteness==null?null:Math.max(0,1-Number(quality.dataCompleteness))},
  requestedStatus:targetOk&&sourceOk?'ACTIVE':'OBSERVE_ONLY',
  truthBoundary:'Weather values remain returned provider evidence. GOES is a freshness/context gate, NWS overlap is source agreement rather than skill probability, and R436 continuity metrics cannot replace meteorological observations or mutate CanonState.'
 });
}
