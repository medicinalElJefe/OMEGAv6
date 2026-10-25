// R608: evidence-bound journey across an existing capability identity and woven field.
// No second Canon, archive admission, empirical physics, or production proof is minted here.
import {executeProvenFrameR654,verifyProvenFrameR654,sha256R654} from './provenFrameR654.js';
import {buildProvenRelationalSceneR659} from './provenRelationalSceneR659.js';
import {normalizeState,normalizeEdge} from './wovenFieldR651.js';

const TRUTH=new Set(['FORMAL_MODEL','DERIVED_REPRESENTATION','SOURCE_BOUND','PROVIDER_GATED','DEVICE_GATED','OPERATIONAL','RECOVERY_ONLY']);
const EXECUTION=new Set(['EXECUTES_NOW','EXECUTES_AS_ADAPTER','TRUTH_GATED']);
const edgeKey=e=>[e.from,e.to,e.kind,e.weight].join(':');
export function buildWovenCapabilityJourneyR608({capability,frame,journey}={}){
 if(!capability||typeof capability.id!=='string'||!capability.id||!TRUTH.has(capability.truthClass)||!EXECUTION.has(capability.executionState)||typeof capability.sourceBinding!=='string'||!capability.sourceBinding)throw Error('capability provenance required');
 if(capability.executionState==='TRUTH_GATED'&&capability.claimsExecution===true)throw Error('truth-gated capability cannot claim execution');
 if(!frame||!Array.isArray(frame.nodes)||!Array.isArray(frame.edges)||!journey||!Array.isArray(journey.steps))throw Error('bounded graph and journey required');
 const input=structuredClone(frame);
 const ids=new Set(input.nodes.map(n=>n.id)),nodes=input.nodes.map(normalizeState),edges=input.edges.map(e=>normalizeEdge(e,ids));
 const sourceGraphSha256=sha256R654({states:nodes,links:edges});
 const proof=executeProvenFrameR654(input),verified=verifyProvenFrameR654(proof);
 if(!verified.valid)throw Error('frame replay failed: '+verified.reason);
 const scene=buildProvenRelationalSceneR659(input,journey);
 if(scene.sourceGraphSha256!==sourceGraphSha256)throw Error('source graph changed');
 if(scene.sourceStateSha256!==proof.proof.stateSha256)throw Error('rendered canonical state diverged from frame');
 const blocked=edges.filter(e=>e.kind==='BLOCKED').map(e=>({key:edgeKey(e),kind:e.kind,reason:'NO_ADMITTED_CARRY'}));
 const record={schema:'OMEGA_WOVEN_CAPABILITY_JOURNEY_R608',truthClass:'LOCAL_REPLAY_ONLY',admission:'NO_CANON_MUTATION_NO_PRODUCTION_PROOF',capability:structuredClone(capability),capabilitySha256:sha256R654(capability),sourceGraphSha256,canonicalStateSha256:proof.proof.stateSha256,frameReceiptSha256:sha256R654(proof),sceneSha256:scene.sceneSha256,routeSha256:scene.routeSha256,blocked,route:scene.route.map(x=>({id:x.id,step:x.step})),carried:proof.output.transportLedger,conservedEvidence:{blockedCount:blocked.length,scarTotal:proof.output.canonicalState.reduce((sum,n)=>sum+n.scar,0),contradictionTotal:proof.output.canonicalState.reduce((sum,n)=>sum+n.contradiction,0)},missingProof:['CURRENT_PRODUCTION_SHA','EXTERNAL_EMPIRICAL_ADMISSION']};
 return {record:{...record,journeySha256:sha256R654(record)},frame:proof,scene};
}
export function verifyWovenCapabilityJourneyR608(bundle){
 try{
  const {record,frame,scene}=bundle;
  if(!record||record.schema!=='OMEGA_WOVEN_CAPABILITY_JOURNEY_R608'||record.admission!=='NO_CANON_MUTATION_NO_PRODUCTION_PROOF'||record.truthClass!=='LOCAL_REPLAY_ONLY')return {valid:false};
  if(sha256R654(Object.fromEntries(Object.entries(record).filter(([k])=>k!=='journeySha256')))!==record.journeySha256)return {valid:false};
  if(!verifyProvenFrameR654(frame).valid||sha256R654(frame)!==record.frameReceiptSha256||frame.proof.stateSha256!==record.canonicalStateSha256)return {valid:false};
  if(sha256R654(Object.fromEntries(Object.entries(scene).filter(([k])=>k!=='sceneSha256')))!==scene.sceneSha256||scene.sceneSha256!==record.sceneSha256||scene.routeSha256!==record.routeSha256)return {valid:false};
  if(sha256R654(record.capability)!==record.capabilitySha256)return {valid:false};
  const rebuilt=buildWovenCapabilityJourneyR608({capability:record.capability,frame:frame.input,journey:{startId:scene.route[0]?.id,steps:scene.routeEvidence.map(e=>({to:e.to,kind:e.kind}))}});
  return {valid:rebuilt.record.journeySha256===record.journeySha256&&rebuilt.scene.sceneSha256===scene.sceneSha256,truthClass:'LOCAL_DETERMINISTIC_REPLAY'};
 }catch{return {valid:false}}
}
