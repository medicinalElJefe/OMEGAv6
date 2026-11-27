// R1005: explicit, bounded operator-supplied SAI context for the existing R121 dispatch.
// No new executor, no server-side verification claim, no Canon admission.
import {agentAddress} from './sphereAgentFabricR887.mjs';
import {verifyFieldReceiptR1000} from './saiRelationalLearningR992.mjs';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';
export async function attachSaiCloudR1005(base,field,authorized,digest=inspectionSHA){
 if(authorized!==true)return base;
 if(!field||!base?.packet||!base?.request||typeof base.request.intent!=='string')throw Error('Verified SAI projection and dispatch required');
 const verified=verifyFieldReceiptR1000(field,field.input,field.bindings);
 const ids=Array.isArray(base.packet.members)?base.packet.members.map(m=>m.id):[base.packet.agent];
 if(ids.length<1||ids.length>12||new Set(ids).size!==ids.length||ids.length!==base.request.requestedCells)throw Error('SAI cloud membership mismatch');
 const rows=ids.map(id=>{const {outer}=agentAddress(id),b=verified.bindings[Math.floor(outer/144)];return {agent:id,outer,prediction:verified.result.values[outer],sourceSha256:b.sourceSha256,modelSha256:b.modelSha256}});
 const fieldSha256=await digest(verified);
 if(!/^[a-f0-9]{64}$/.test(fieldSha256))throw Error('Invalid SAI field digest');
 // Full field remains local; only bounded members and their identity references leave device.
 const context={schema:'OMEGA_SAI_CLOUD_CONTEXT_R1005',fieldSha256,weight:verified.result.weight,steps:verified.result.steps,rows,authority:'OPERATOR_SUPPLIED_PROJECTED_MODEL_OUTPUT_NOT_SERVER_VERIFIED',canonicalMutation:false};
 const intent=base.request.intent+'\nSAI context (client replayed; cloud has not independently verified source or model): '+JSON.stringify(context)+'\nTreat as projected scar predictions, not measurements or agent state. No Canon admission.';
 if(intent.length>12000)throw Error('SAI cloud intent exceeds budget');
 return {packet:base.packet,request:{...base.request,intent},context};
}
