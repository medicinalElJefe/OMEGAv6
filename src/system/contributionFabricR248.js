export const R248_SCHEMA='OMEGA_RELATIVE_CONTRIBUTION_FABRIC_R248';
export const R248_REVISION='R248';
export const R248_CONTINUITY_OPERATOR='PARTITION → CONTRIBUTION → RELATION → CONTRADICTION/RESIDUAL → PROOF CARRY → RE-CONTEXTUALIZE';

export const R248_DIMENSIONS=Object.freeze([
 'CAPABILITY','AUTHORITY','PROVENANCE','FRESHNESS','LATENCY','RELIABILITY',
 'RESOURCE','CONTRADICTION','EXECUTION','CONTINUITY','OBSERVABILITY','ADMISSION'
]);

export const R248_AUTHORITY_LAWS=Object.freeze([
 'R125_SOLE_CANONSTATE_ADMISSION',
 'R141_EXACT_HYBRID_RETURN_PROOF',
 'R146_DURABLE_EXECUTION_HISTORY',
 'R147_DISPATCH_EXECUTOR_SELECTION',
 'R240_EXACT_SOURCE_PROMOTION',
 'CI_YML_SOLE_CANONICAL_PRODUCTION_WORKER_WRITER',
 'R201_R203_TOMBSTONES_RETIRED',
 'UNOBSERVED_NEVER_PROMOTED_TO_PROVED'
]);

const PROFILE=(values={})=>Object.freeze(Object.fromEntries(R248_DIMENSIONS.map(key=>[key,Math.max(0,Math.min(100,Number(values[key]??0)))])));

export const R248_CONTRIBUTORS=Object.freeze([
 {id:'CANONICAL_RUNTIME',label:'Cloudflare canonical runtime',class:'RUNTIME',ceiling:'OBSERVE_AND_COMPUTE_NOT_CANON',profile:PROFILE({CAPABILITY:92,AUTHORITY:35,PROVENANCE:95,FRESHNESS:100,LATENCY:92,RELIABILITY:90,RESOURCE:78,CONTRADICTION:78,EXECUTION:70,CONTINUITY:86,OBSERVABILITY:100})},
 {id:'SOURCE_LINEAGE',label:'GitHub source + CI lineage',class:'SOURCE',ceiling:'SOURCE_PROPOSAL_AND_PROOF_NOT_CANON',profile:PROFILE({CAPABILITY:80,AUTHORITY:55,PROVENANCE:100,FRESHNESS:88,LATENCY:72,RELIABILITY:95,CONTRADICTION:92,EXECUTION:35,CONTINUITY:100,OBSERVABILITY:96})},
 {id:'HYBRID_HOST',label:'Authenticated Hybrid / PC',class:'NATIVE_EXECUTION',ceiling:'EXECUTION_REQUIRES_R147_AND_R141_RETURN',profile:PROFILE({CAPABILITY:100,AUTHORITY:72,PROVENANCE:90,FRESHNESS:100,LATENCY:88,RELIABILITY:86,RESOURCE:100,CONTRADICTION:85,EXECUTION:100,CONTINUITY:82,OBSERVABILITY:94})},
 {id:'EARTH_EVIDENCE',label:'Earth / SAR evidence sources',class:'EMPIRICAL',ceiling:'EMPIRICAL_EVIDENCE_NOT_CANON',profile:PROFILE({CAPABILITY:88,AUTHORITY:25,PROVENANCE:100,FRESHNESS:82,LATENCY:58,RELIABILITY:90,RESOURCE:68,CONTRADICTION:96,EXECUTION:12,CONTINUITY:84,OBSERVABILITY:92})},
 {id:'ARCHIVE_CORPUS',label:'Drive / archive continuity',class:'CORPUS',ceiling:'CORPUS_EVIDENCE_NOT_EXECUTION',profile:PROFILE({CAPABILITY:82,AUTHORITY:22,PROVENANCE:96,FRESHNESS:62,LATENCY:76,RELIABILITY:92,RESOURCE:66,CONTRADICTION:88,EXECUTION:8,CONTINUITY:100,OBSERVABILITY:84})},
 {id:'AI_PROVIDER',label:'AI / reasoning providers',class:'INTELLIGENCE',ceiling:'PROPOSE_SYNTHESIZE_NOT_EMPIRICAL_OR_CANON',profile:PROFILE({CAPABILITY:100,AUTHORITY:12,PROVENANCE:68,FRESHNESS:92,LATENCY:84,RELIABILITY:74,RESOURCE:78,CONTRADICTION:72,EXECUTION:28,CONTINUITY:70,OBSERVABILITY:78})},
 {id:'BROWSER_OPERATOR',label:'Browser / mobile operator surface',class:'INTENT',ceiling:'OPERATOR_INTENT_NOT_NATIVE_EXECUTION',profile:PROFILE({CAPABILITY:72,AUTHORITY:58,PROVENANCE:82,FRESHNESS:100,LATENCY:100,RELIABILITY:86,RESOURCE:54,CONTRADICTION:78,EXECUTION:18,CONTINUITY:76,OBSERVABILITY:100})},
 {id:'CALCULUS_ATLAS',label:'Calculus / Atlas derivation',class:'DERIVATION',ceiling:'DERIVE_AND_COMPARE_NOT_EMPIRICAL_PROOF',profile:PROFILE({CAPABILITY:96,AUTHORITY:16,PROVENANCE:88,FRESHNESS:86,LATENCY:86,RELIABILITY:90,RESOURCE:74,CONTRADICTION:100,EXECUTION:24,CONTINUITY:98,OBSERVABILITY:86})},
 {id:'SELF_BUILD',label:'R170/R223 governed self-build',class:'SOURCE_EVOLUTION',ceiling:'CANDIDATE_GENERATION_NOT_PRODUCTION',profile:PROFILE({CAPABILITY:94,AUTHORITY:48,PROVENANCE:100,FRESHNESS:92,LATENCY:68,RELIABILITY:90,RESOURCE:72,CONTRADICTION:96,EXECUTION:62,CONTINUITY:100,OBSERVABILITY:92})},
 {id:'R141_RETURN',label:'R141 exact Hybrid return proof',class:'PROOF',ceiling:'RETURN_PROOF_ONLY',profile:PROFILE({CAPABILITY:50,AUTHORITY:86,PROVENANCE:100,FRESHNESS:96,LATENCY:76,RELIABILITY:100,CONTRADICTION:100,EXECUTION:0,CONTINUITY:94,OBSERVABILITY:100})},
 {id:'R146_HISTORY',label:'R146 durable execution history',class:'MEMORY',ceiling:'HISTORY_NOT_DISPATCH_OR_ADMISSION',profile:PROFILE({CAPABILITY:52,AUTHORITY:62,PROVENANCE:100,FRESHNESS:84,LATENCY:92,RELIABILITY:98,CONTRADICTION:94,EXECUTION:0,CONTINUITY:100,OBSERVABILITY:96})},
 {id:'R147_DISPATCH',label:'R147 dispatch / executor selection',class:'EXECUTION_AUTHORITY',ceiling:'DISPATCH_NOT_CANON_ADMISSION',profile:PROFILE({CAPABILITY:66,AUTHORITY:100,PROVENANCE:96,FRESHNESS:96,LATENCY:96,RELIABILITY:98,RESOURCE:90,CONTRADICTION:96,EXECUTION:100,CONTINUITY:94,OBSERVABILITY:94})},
 {id:'R125_ADMISSION',label:'R125 CanonState admission',class:'CANON_AUTHORITY',ceiling:'SOLE_CANONSTATE_ADMISSION',profile:PROFILE({CAPABILITY:36,AUTHORITY:100,PROVENANCE:100,FRESHNESS:90,LATENCY:80,RELIABILITY:100,CONTRADICTION:100,EXECUTION:0,CONTINUITY:100,OBSERVABILITY:100,ADMISSION:100})}
]);

const upper=v=>String(v??'').toUpperCase();
const validSha=v=>/^[0-9a-f]{40}$/i.test(String(v||''));
const state=(proved,available=false)=>proved?'PROVED':available?'AVAILABLE_UNPROVED':'UNOBSERVED';

function dynamicState(id,input){
 const canon=input.canon||{},raw=input.raw||{};
 switch(id){
  case 'CANONICAL_RUNTIME': return state(Boolean(canon.runtime?.coreLive),Boolean(raw.core));
  case 'SOURCE_LINEAGE': return state(validSha(canon.production?.promotedSha),Boolean(raw.receipt));
  case 'HYBRID_HOST': return state(Boolean(canon.hybrid?.authenticatedCurrentDeviceProved),Boolean(raw.hybrid));
  case 'EARTH_EVIDENCE': return state(Boolean(raw.convergence?.earth?.verified||raw.operational?.earth?.verified),Boolean(raw.convergence?.earth||raw.operational?.earth));
  case 'ARCHIVE_CORPUS': return state(Boolean(raw.convergence?.archive?.verified||raw.operational?.archive?.verified),Boolean(raw.convergence?.archive||raw.operational?.archive));
  case 'AI_PROVIDER': return state(Boolean(raw.operational?.ai?.verified||raw.convergence?.ai?.verified),Boolean(raw.operational?.ai||raw.convergence?.ai));
  case 'BROWSER_OPERATOR': return 'AVAILABLE_UNPROVED';
  case 'CALCULUS_ATLAS': return 'AVAILABLE_UNPROVED';
  case 'SELF_BUILD': return state(Boolean(canon.selfBuild?.active),Boolean(raw.selfbuild));
  case 'R141_RETURN': return state(Boolean(raw.hybrid?.lastExactReturnProved||raw.connector?.proof?.r141Returned),Boolean(raw.hybrid||raw.connector));
  case 'R146_HISTORY': return state(Boolean(raw.connector?.durableHistory?.verified||raw.hybrid?.durableHistory?.verified),Boolean(raw.connector||raw.hybrid));
  case 'R147_DISPATCH': return state(Boolean(raw.connector?.dispatch?.revision==='R147'||raw.hybrid?.dispatchRevision==='R147'),Boolean(raw.connector||raw.hybrid));
  case 'R125_ADMISSION': return 'AUTHORITY_PRESENT';
  default:return 'UNOBSERVED';
 }
}

function contradictionLedger(input,contributors){
 const canon=input.canon||{},raw=input.raw||{},out=[];
 if(/ONLINE|LIVE|READY/.test(upper(canon.hybrid?.state))&&!canon.hybrid?.authenticatedCurrentDeviceProved)out.push({id:'HYBRID_STATE_WITHOUT_CURRENT_AUTH',severity:'HOLD',message:'Hybrid display state suggests availability while exact current authenticated-device proof is absent.'});
 if(canon.production?.promotedSha&&!validSha(canon.production.promotedSha))out.push({id:'INVALID_PRODUCTION_SHA',severity:'HOLD',message:'Production receipt contains a non-canonical SHA shape.'});
 if(/LIVE|READY/.test(upper(canon.runtime?.state))&&!canon.runtime?.coreLive)out.push({id:'RUNTIME_STATE_WITHOUT_CORE_PROOF',severity:'HOLD',message:'Runtime state is positive while first-hand core proof is incomplete.'});
 for(const error of input.errors||[])out.push({id:`SOURCE_GAP_${upper(error.source)}`,severity:'GAP',message:`${error.source}: ${error.message}`});
 const admission=contributors.find(x=>x.id==='R125_ADMISSION');
 if(!admission||admission.ceiling!=='SOLE_CANONSTATE_ADMISSION')out.push({id:'R125_AUTHORITY_DRIFT',severity:'BLOCK',message:'R125 sole CanonState admission declaration is missing or altered.'});
 if(raw.hybrid?.nativeExecutionClaimed===true&&!canon.hybrid?.authenticatedCurrentDeviceProved)out.push({id:'NATIVE_EXECUTION_UNBOUND',severity:'BLOCK',message:'Native execution is claimed without exact current authenticated Hybrid proof.'});
 return out;
}

function relationGraph(contributors){
 const pairs=[
  ['BROWSER_OPERATOR','AI_PROVIDER','INTENT_TO_REASONING'],['AI_PROVIDER','CALCULUS_ATLAS','SYNTHESIS_TO_DERIVATION'],['CALCULUS_ATLAS','EARTH_EVIDENCE','DERIVATION_CHECKS_EVIDENCE'],['ARCHIVE_CORPUS','CALCULUS_ATLAS','HISTORY_TO_CONTEXT'],['SOURCE_LINEAGE','SELF_BUILD','SOURCE_TO_EVOLUTION'],['SELF_BUILD','CANONICAL_RUNTIME','CANDIDATE_TO_RUNTIME_AFTER_PROMOTION'],['R147_DISPATCH','HYBRID_HOST','DISPATCH_TO_NATIVE_EXECUTOR'],['HYBRID_HOST','R141_RETURN','EXECUTION_TO_EXACT_RETURN'],['R141_RETURN','R146_HISTORY','RETURN_TO_DURABLE_HISTORY'],['R146_HISTORY','R125_ADMISSION','HISTORY_SUPPORTS_ADMISSION_REVIEW'],['CANONICAL_RUNTIME','R125_ADMISSION','RUNTIME_EVIDENCE_SUPPORTS_ADMISSION_REVIEW'],['EARTH_EVIDENCE','R125_ADMISSION','EMPIRICAL_EVIDENCE_SUPPORTS_ADMISSION_REVIEW']
 ];
 const byId=new Map(contributors.map(x=>[x.id,x]));
 return pairs.map(([from,to,kind])=>({from,to,kind,active:['PROVED','AUTHORITY_PRESENT'].includes(byId.get(from)?.state)&&['PROVED','AUTHORITY_PRESENT'].includes(byId.get(to)?.state)}));
}

export function compileContributionFabricR248(input={}){
 const contributors=R248_CONTRIBUTORS.map(base=>({...base,state:dynamicState(base.id,input)}));
 const contradictions=contradictionLedger(input,contributors);
 const gaps=contributors.filter(x=>x.state==='UNOBSERVED').map(x=>({id:x.id,reason:'NO_CURRENT_RETURNED_EVIDENCE'}));
 const held=contributors.filter(x=>x.state==='AVAILABLE_UNPROVED').map(x=>({id:x.id,reason:'CAPABILITY_OR_SURFACE_PRESENT_BUT_NOT_PROOF'}));
 const proved=contributors.filter(x=>x.state==='PROVED'||x.state==='AUTHORITY_PRESENT').length;
 const liveWeight=contributors.reduce((sum,x)=>sum+(x.state==='PROVED'||x.state==='AUTHORITY_PRESENT'?1:x.state==='AVAILABLE_UNPROVED'?.35:0),0);
 const max=contributors.length;
 const readiness=max?Math.round((liveWeight/max)*100):0;
 const dimensionAverages=Object.fromEntries(R248_DIMENSIONS.map(dim=>{
  const total=contributors.reduce((sum,x)=>sum+x.profile[dim]*(x.state==='PROVED'||x.state==='AUTHORITY_PRESENT'?1:x.state==='AVAILABLE_UNPROVED'?.35:.12),0);
  return [dim,Math.round(total/max)];
 }));
 return {
  schema:R248_SCHEMA,revision:R248_REVISION,continuityOperator:R248_CONTINUITY_OPERATOR,
  dimensions:R248_DIMENSIONS,authorityLaws:R248_AUTHORITY_LAWS,contributors,
  relations:relationGraph(contributors),contradictions,residuals:[...gaps,...held],
  summary:{proved,availableUnproved:held.length,unobserved:gaps.length,contradictions:contradictions.length,readiness},
  dimensionAverages,
  admission:{authority:'R125',admittedByR248:false},
  execution:{dispatchAuthority:'R147',returnProof:'R141',history:'R146',r248Executes:false},
  production:{writer:'.github/workflows/ci.yml',r248Deploys:false},
  truthBoundary:'STRUCTURAL PROFILES ARE ARCHITECTURAL WEIGHTS; LIVE STATE REQUIRES RETURNED EVIDENCE; UNOBSERVED IS NEVER PROMOTED TO PROVED.'
 };
}

export function assertContributionFabricR248(){
 if(R248_DIMENSIONS.length!==12)throw new Error('R248 must preserve exactly twelve contribution dimensions.');
 if(R248_CONTRIBUTORS.filter(x=>x.profile.ADMISSION===100).map(x=>x.id).join(',')!=='R125_ADMISSION')throw new Error('Only R125 may carry 100 Canon admission contribution.');
 if(R248_CONTRIBUTORS.find(x=>x.id==='R147_DISPATCH')?.profile.EXECUTION!==100)throw new Error('R147 must remain exact dispatch/execution-selection authority.');
 if(R248_CONTRIBUTORS.find(x=>x.id==='R141_RETURN')?.profile.EXECUTION!==0)throw new Error('R141 return proof must not become an executor.');
 if(!R248_AUTHORITY_LAWS.includes('R201_R203_TOMBSTONES_RETIRED'))throw new Error('Retired Durable Object tombstones must remain retired.');
 return true;
}
