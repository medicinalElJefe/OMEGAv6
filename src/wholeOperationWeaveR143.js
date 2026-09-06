import {appendWorldEventR134,continuityOperationRefR134,sha256R134} from './world/canonicalWorldContinuityR134.js';

export const R143_REVISION='R143';
export const R143_SCHEMA='OMEGA_WHOLE_OPERATION_WEAVE_R143';
export const R143_JOIN_SCHEMA='OMEGA_WHOLE_OPERATION_JOIN_R143';
export const R143_SCALES=Object.freeze([1,12,144,1728,20736]);
export const R143_EXECUTORS=Object.freeze(['OMEGA_LOCAL','SWARM','GENESIS_MACHINE','OPTICAL_MACHINE','SOVEREIGN_PC','RCWA_FEDERATION','R125_ADMISSION']);
export const R143_LAWS=Object.freeze([
 'ONE_OBJECTIVE_MAY_EXPAND_INTO_MANY_EXECUTION_FRAMES',
 'COMPUTE_SCALE_IS_LOGICAL_WORK_RESOLUTION_NOT_PHYSICAL_DIMENSION_COUNT',
 'EXECUTOR_SELECTION_REQUIRES_CURRENT_CAPABILITY_EVIDENCE',
 'DEPENDENCIES_MUST_RETURN_BEFORE_CHILD_INVOCATION',
 'DEPARTURE_AND_RETURN_STATE_ARE_DISTINCT_CAUSAL_FRAMES',
 'EVERY_RETURN_PRESERVES_PROOF_SCAR_AND_LINEAGE',
 'CONTRADICTION_IS_CARRIED_INTO_JOIN_NOT_AVERAGED_AWAY',
 'FAILED_STALE_OR_UNAVAILABLE_NODES_REMAIN_VISIBLE',
 'JOIN_IS_DETERMINISTIC_EVIDENCE_RECONVERGENCE_NOT_CANONSTATE',
 'R141_REMAINS_EXACT_HYBRID_RETURN_PROOF_AUTHORITY',
 'R142_REMAINS_CAPABILITY_EXECUTION_LIFECYCLE_AUTHORITY',
 'R125_REMAINS_CANONSTATE_ADMISSION_AUTHORITY'
]);

const text=(v,n=4000)=>String(v??'').trim().slice(0,n);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const safeId=(v,f='')=>{const s=text(v,160);return /^[A-Za-z0-9._:-]+$/.test(s)?s:f};
const uniq=a=>[...new Set(a.filter(Boolean))];
const nowIso=()=>new Date().toISOString();

function flags(intent){
 const p=text(intent).toLowerCase();
 return{
  native:/\b(pc|windows|desktop|local|file|folder|build|compile|test|package|patch|repair|edit|write|macro|browser automation|screen|click|type)\b/.test(p),
  optical:/\b(optical|light|etch|metasurface|rcwa|fdtd|full[- ]?wave|wavelength|diffraction|material|fabrication)\b/.test(p),
  generative:/\b(generate|design|candidate|alternative|hypothesis|invent|explore|propose|search space)\b/.test(p),
  proof:/\b(prove|verify|validate|evidence|replay|audit|accuracy|truth|falsif)\b/.test(p),
  research:/\b(research|analy[sz]e|compare|deep|all|full|system|architecture|physics|science|forecast|causal|relativ|continuity)\b/.test(p),
  training:/\b(train|training|sai|learn|learning|corpus|retrieval|memory)\b/.test(p),
  uncertain:/\b(maybe|unknown|uncertain|contradiction|conflict|ambiguous|investigate|discover)\b/.test(p)
 };
}

export function computeRelativityScaleR143(intent,hints={}){
 const f=flags(intent),length=Math.min(1,text(intent).length/1600),domainCount=Object.values(f).filter(Boolean).length;
 const novelty=clamp(hints.novelty??(f.generative?.8:.25),0,1),uncertainty=clamp(hints.uncertainty??(f.uncertain?.8:.25),0,1),contradiction=clamp(hints.contradiction??0,0,1),proofUrgency=clamp(hints.proofUrgency??(f.proof?.8:.35),0,1),motion=clamp(hints.motion??(f.native?.55:.2),0,1),external=clamp(hints.external??((f.native||f.optical)?.75:.2),0,1);
 const score=clamp(.14*length+.13*Math.min(1,domainCount/6)+.18*novelty+.16*uncertainty+.12*contradiction+.12*proofUrgency+.08*motion+.07*external,0,1);
 const requested=R143_SCALES.includes(Number(hints.requestedScale))?Number(hints.requestedScale):null;
 const logicalScale=requested??(score>=.78?20736:score>=.58?1728:score>=.38?144:score>=.18?12:1);
 const swarmCells=logicalScale>=20736?1728:logicalScale>=1728?1728:logicalScale>=144?144:logicalScale>=12?12:1;
 const lanesPerCell=Math.max(1,Math.ceil(logicalScale/swarmCells));
 return{logicalScale,swarmCells,lanesPerCell,score:Number(score.toFixed(4)),signals:{length:Number(length.toFixed(4)),domainCount,novelty,uncertainty,contradiction,proofUrgency,motion,external},truthBoundary:'1→12→144→1728→20736 is adaptive logical execution/address resolution. It is not a claim of physical dimensions, physical processors, or 20,736 simultaneously billed servers.'};
}

function readiness(snapshot={}){
 const machine=snapshot.machine||{},hybrid=snapshot.hybrid||{},federation=snapshot.federation||{};
 const onlineDevices=Array.isArray(hybrid.devices)?hybrid.devices.filter(d=>d?.online===true&&d?.revoked!==true):[];
 return{
  OMEGA_LOCAL:{available:true,proof:'IN_PROCESS_CANONICAL_RUNTIME'},
  SWARM:{available:snapshot.swarmBinding!==false,proof:snapshot.swarmBinding===false?'SWARM_BINDING_UNAVAILABLE':'OMEGA_SWARM_COORDINATOR_BINDING'},
  GENESIS_MACHINE:{available:machine?.nodes?.genesis?.state==='LIVE'||snapshot.genesisLive===true,proof:machine?.nodes?.genesis?.state||'UNPROVED'},
  OPTICAL_MACHINE:{available:machine?.nodes?.optical?.state==='LIVE'||snapshot.opticalLive===true,proof:machine?.nodes?.optical?.state||'UNPROVED'},
  SOVEREIGN_PC:{available:hybrid?.nativeExecutionClaimed===true&&onlineDevices.length>0,proof:onlineDevices.length?`AUTHENTICATED_HEARTBEAT:${onlineDevices.map(x=>x.id).join(',')}`:'CURRENT_AUTHENTICATED_HEARTBEAT_REQUIRED'},
  RCWA_FEDERATION:{available:String(federation?.runtime?.rcwa?.state||federation?.nodes?.sovereign?.rcwaState||snapshot.rcwaState||'').toUpperCase()==='LIVE',proof:federation?.runtime?.rcwa?.state||federation?.nodes?.sovereign?.rcwaState||snapshot.rcwaState||'UNPROVED'},
  R125_ADMISSION:{available:true,proof:'CANONSTATE_ADMISSION_AUTHORITY_REFERENCE_ONLY'}
 };
}

function node(id,kind,executor,dependsOn,purpose,ready,extra={}){
 return{schema:'OMEGA_WEAVE_NODE_R143',id,kind,executor,dependsOn:[...dependsOn],purpose,requiredEvidence:extra.requiredEvidence||[],state:ready.available?'AVAILABLE':'UNAVAILABLE',availabilityProof:ready.proof,invocation:null,returnReceipt:null,departureFrame:null,returnFrame:null,scarIds:[],proofIds:[],sourceIds:[],canonicalMutation:false,...extra};
}

export function compileWholeOperationWeaveR143(input={}){
 const intent=text(input.intent||input.text),f=flags(intent),scale=computeRelativityScaleR143(intent,input.hints||{}),r=readiness(input.snapshot||{}),nodes=[];
 const createdAt=typeof input.createdAt==='string'&&Number.isFinite(Date.parse(input.createdAt))?input.createdAt:nowIso(),joinEventTime=clamp(input.joinEventTime??Date.parse(createdAt),0,Number.MAX_SAFE_INTEGER);
 nodes.push(node('N00_FRAME','FRAME','OMEGA_LOCAL',[],'Freeze objective, execution truth snapshot, causal departure frame and adaptive logical scale.',r.OMEGA_LOCAL,{requiredEvidence:['current capability snapshot','intent identity','departure state']}));
 const complex=scale.logicalScale>=144||f.research||f.uncertain||f.training;
 if(complex)nodes.push(node('N10_SWARM','DECOMPOSE','SWARM',['N00_FRAME'],'Partition the objective across bounded logical cells and preserve dissent before reconvergence.',r.SWARM,{requestedCells:scale.swarmCells,logicalScale:scale.logicalScale,requiredEvidence:['swarm mission receipt']}));
 const frameDep=complex?'N10_SWARM':'N00_FRAME';
 if(f.generative||f.optical)nodes.push(node('N20_PROPOSE','PROPOSE','GENESIS_MACHINE',[frameDep],'Generate bounded candidate/hypothesis packets without canonical authority.',r.GENESIS_MACHINE,{requiredEvidence:['OMEGA_PACKET_v1 proposal']}));
 if(f.optical)nodes.push(node('N30_SCREEN','SCREEN','OPTICAL_MACHINE',[f.generative||f.optical?'N20_PROPOSE':frameDep],'Screen optical candidates with the specialized machine adapter and preserve rejection evidence.',r.OPTICAL_MACHINE,{requiredEvidence:['screen packet','screen proof']}));
 if(f.optical&&/\b(rcwa|fdtd|full[- ]?wave|fabrication|solver|validate)\b/i.test(intent))nodes.push(node('N35_FULLWAVE','SOLVE','RCWA_FEDERATION',['N30_SCREEN'],'Advance only an admissible screened candidate into full-wave solver validation.',r.RCWA_FEDERATION,{requiredEvidence:['solver receipt','validation receipt']}));
 if(f.native||f.training)nodes.push(node('N40_HOST','EXECUTE','SOVEREIGN_PC',[f.optical?(nodes.some(x=>x.id==='N35_FULLWAVE')?'N35_FULLWAVE':'N30_SCREEN'):frameDep],'Execute bounded native/local work only through the authenticated Hybrid host envelope.',r.SOVEREIGN_PC,{requiredEvidence:['R141 exact-payload closure','R142 VERIFIED lifecycle'],requiresExplicitConfirmation:true}));
 const workNodes=nodes.filter(x=>x.id!=='N00_FRAME'),joinDeps=workNodes.length?workNodes.map(x=>x.id):['N00_FRAME'];
 nodes.push(node('N80_JOIN','JOIN','OMEGA_LOCAL',joinDeps,'Re-contextualize all returned evidence into one deterministic continuity-preserving operation receipt.',r.OMEGA_LOCAL,{requiredEvidence:['dependency receipts','scar carry','proof carry','departure/return frame comparison']}));
 nodes.push(node('N90_ADMISSION','ADMISSION_CANDIDATE','R125_ADMISSION',['N80_JOIN'],'Expose a candidate to R125 only after the whole-operation join; R143 never performs admission itself.',r.R125_ADMISSION,{requiredEvidence:['R143 joined receipt'],state:'HELD_FOR_R125'}));
 const unavailable=nodes.filter(x=>x.state==='UNAVAILABLE').map(x=>({id:x.id,executor:x.executor,proof:x.availabilityProof})),graphCore={revision:R143_REVISION,intent,scale,nodes:nodes.map(({returnReceipt,invocation,...x})=>x)};
 return{schema:R143_SCHEMA,revision:R143_REVISION,intentId:safeId(input.intentId)||`intent-${joinEventTime.toString(36)}`,intent,createdAt,joinEventTime,scale,nodes,edges:nodes.flatMap(n=>n.dependsOn.map(from=>({from,to:n.id,carry:['invariant','scar','proof','source','causal-frame']}))),unavailable,executionPolicy:unavailable.length?'PARTIALLY_GATED':'READY_BY_DEPENDENCY',graphIdentitySeed:JSON.stringify(graphCore),canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'R143 compiles one objective into a dependency-bound execution graph over existing OMEGA executors. Availability is current execution evidence, not success. A node return is not verified merely because transport returned, the join is not CanonState, and R125 remains the only admission authority.'};
}

export function dependencyStateR143(graph,nodeId){
 const n=graph?.nodes?.find(x=>x.id===nodeId);if(!n)return{ready:false,reason:'NODE_NOT_FOUND'};
 const parents=n.dependsOn.map(id=>graph.nodes.find(x=>x.id===id)).filter(Boolean),terminal=new Set(['VERIFIED','COMPLETE','RETURNED_VERIFIED','HELD_FOR_R125']);
 const failed=parents.find(x=>['FAILED','REJECTED','STALE','UNAVAILABLE','FINGERPRINT_MISMATCH'].includes(x.state));if(failed)return{ready:false,reason:`DEPENDENCY_${failed.id}_${failed.state}`};
 const pending=parents.find(x=>!terminal.has(x.state));return pending?{ready:false,reason:`WAITING_${pending.id}_${pending.state}`}:{ready:n.state!=='UNAVAILABLE',reason:n.state==='UNAVAILABLE'?'EXECUTOR_UNAVAILABLE':'DEPENDENCIES_SATISFIED'};
}

export function applyNodeReceiptR143(graph,nodeId,receipt={},frames={}){
 const nodes=(graph?.nodes||[]).map(n=>({...n,dependsOn:[...(n.dependsOn||[])],scarIds:[...(n.scarIds||[])],proofIds:[...(n.proofIds||[])],sourceIds:[...(n.sourceIds||[])]})),n=nodes.find(x=>x.id===nodeId);if(!n)return graph;
 const state=text(receipt.state,48).toUpperCase()||'RETURNED',verified=receipt.verified===true||state==='VERIFIED'||state==='RETURNED_VERIFIED';
 n.state=verified?'VERIFIED':['FAILED','REJECTED','STALE','UNAVAILABLE','FINGERPRINT_MISMATCH'].includes(state)?state:'RETURNED';
 n.returnReceipt={...receipt,canonicalMutation:false};n.departureFrame=frames.departureFrame||n.departureFrame||null;n.returnFrame=frames.returnFrame||null;
 n.proofIds=uniq([...(receipt.proofIds||[]),receipt.proofRef,receipt.responseHash]);n.scarIds=uniq([...(receipt.scarIds||[]),...(verified?[]:[`${n.id}:${n.state}`])]);n.sourceIds=uniq([...(receipt.sourceIds||[]),receipt.capabilityId,receipt.source]);
 return{...graph,nodes,updatedAt:nowIso(),canonicalMutation:false};
}

function nodeMetrics(n){const verified=n.state==='VERIFIED',failed=['FAILED','REJECTED','STALE','UNAVAILABLE','FINGERPRINT_MISMATCH'].includes(n.state);return{continuity:verified?1:failed?.15:.45,plasticity:verified?.45:failed?.2:.3,contradiction:failed?1:verified?0:.5,burden:clamp((n.dependsOn.length+1)/8,0,1),evidence:verified?1:n.state==='RETURNED'?.5:0,uncertainty:verified?.05:failed?.9:.6,scar:failed?.9:verified?.12:.4}}

export async function joinWholeOperationWeaveR143(graph,previousHead=null){
 let head=previousHead&&previousHead.schema==='OMEGA_CANONICAL_WORLD_CONTINUITY_R134'?previousHead:null;
 const ordered=[...(graph?.nodes||[])].filter(x=>x.id!=='N90_ADMISSION').sort((a,b)=>a.id.localeCompare(b.id)),receipts=[],baseEventTime=clamp(graph?.joinEventTime??Date.parse(graph?.createdAt||'')||0,0,Number.MAX_SAFE_INTEGER);
 for(let i=0;i<ordered.length;i++){
  const n=ordered[i],digest=await sha256R134({graphIntentId:graph.intentId,nodeId:n.id,state:n.state,returnReceipt:n.returnReceipt||null,departureFrame:n.departureFrame||null,returnFrame:n.returnFrame||null});
  head=await appendWorldEventR134(head,{eventId:`${safeId(graph.intentId,'intent')}:${n.id}`,kind:n.id==='N00_FRAME'?'MISSION':n.id==='N80_JOIN'?'PROOF':n.state==='VERIFIED'?'FEDERATION_RETURN':'SCAR',sequence:(head?.count||0)+1,eventTime:baseEventTime+i,observerId:'omega-r143',projection:'WHOLE_OPERATION_WEAVE',intentId:graph.intentId,missionId:graph.intentId,federationNode:n.executor,sourceIds:uniq([n.executor,...n.sourceIds]),proofIds:uniq(n.proofIds),scarIds:uniq(n.scarIds),address:0,metrics:nodeMetrics(n),payloadDigest:digest,claim:{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false}});receipts.push(head.lastEvent);
 }
 const executionNodes=ordered.filter(x=>!['N00_FRAME','N80_JOIN'].includes(x.id)),verified=executionNodes.filter(x=>x.state==='VERIFIED'),held=executionNodes.filter(x=>x.state!=='VERIFIED'),finalState=held.length?'HELD_WITH_RESIDUALS':'VERIFIED_EVIDENCE_SET',joinDigest=await sha256R134({schema:R143_JOIN_SCHEMA,intentId:graph.intentId,finalState,nodeStates:ordered.map(x=>[x.id,x.state]),headSha256:head?.headSha256||null});
 return{ok:true,schema:R143_JOIN_SCHEMA,revision:R143_REVISION,intentId:graph.intentId,state:finalState,logicalScale:graph.scale?.logicalScale||1,verifiedNodeCount:verified.length,heldNodeCount:held.length,nodeStates:Object.fromEntries(ordered.map(x=>[x.id,x.state])),proofIds:uniq(ordered.flatMap(x=>x.proofIds||[])),scarIds:uniq(ordered.flatMap(x=>x.scarIds||[])),sourceIds:uniq(ordered.flatMap(x=>x.sourceIds||[])),continuity:continuityOperationRefR134(head),finalHeadSha256:head?.headSha256||null,joinDigest,receipts,canonicalMutation:false,canonicalAdmissionAuthority:'R125',admissionState:'CANDIDATE_ONLY_NOT_ADMITTED',truthBoundary:'R143 join deterministically reconverges execution evidence while carrying failed/unavailable/stale nodes as residual scars. It is an evidence set, not a vote, not truth-by-majority, and not CanonState admission.'};
}

export function manifestR143(){return{ok:true,schema:R143_SCHEMA,revision:R143_REVISION,scales:R143_SCALES,executors:R143_EXECUTORS,laws:R143_LAWS,preserves:{swarm:'R121/R123/R125',hybridProof:'R141',executionLifecycle:'R142',worldContinuity:'R134',livingWorld:'R136',capabilityRouting:'R139/R140',canonicalAdmission:'R125'},canonicalMutation:false,canonicalAdmissionAuthority:'R125',truthBoundary:'Manifest only. R143 adds adaptive multi-executor graph compilation and deterministic evidence reconvergence over existing enacted runtimes. It does not by itself prove an executor is online, invoke a machine, validate science, or mutate CanonState.'}}
