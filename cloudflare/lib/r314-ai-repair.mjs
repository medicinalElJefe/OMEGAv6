import {
  R314_AI_REPAIR_MODEL_DEFAULT,
  R314_AI_MAX_ATTEMPTS,
  R314_AI_MAX_OUTPUT_TOKENS,
  R314_AI_CORRECTION_MAX_OUTPUT_TOKENS,
  applyAiRepairProposalR314,
  bindDeterministicPreimageAnchorsR506,
  autonomousRepairPromptR314,
  autonomousRepairCorrectionPromptR314,
  parseAiJsonR314,
  summarizeAiProposalR314,
  validateAiRepairProposalR314,
} from '../../src/system/autonomousRepairPolicyR314.js';
import {validateReasoningWorkerProposalR503} from '../../src/system/calculusNativeAutonomyR503.js';
import {validateReasoningWorkerDecisionR504} from '../../src/system/calculusDecisionContinuityR504.js';
import {bindAppliedReasoningWorkerR505} from '../../src/system/appliedCalculusReasoningR505.js';

export const R314_CLOUD_AI_REPAIR_SCHEMA='OMEGA_CLOUD_R314_AI_REPAIR';

function responsePayload(result){
 if(typeof result==='string')return result;
 if(result?.response!==undefined)return result.response;
 if(result?.text!==undefined)return result.text;
 if(result?.result?.response!==undefined)return result.result.response;
 if(result?.result?.text!==undefined)return result.result.text;
 return result??{};
}

export function repairResponseFormatR314(){
 return{type:'json_object'};
}

function bindMissingPreimageShaR417(proposal,{contextFiles=[]}={}){
 if(!proposal||!Array.isArray(proposal.files)||proposal.files.length===0)return proposal;
 const supplied=new Map((contextFiles||[]).map(file=>[String(file?.path||'').trim().replace(/\\/g,'/').replace(/^\.\//,''),file]));
 return{
  ...proposal,
  files:proposal.files.map(file=>{
   const path=String(file?.path||'').trim().replace(/\\/g,'/').replace(/^\.\//,'');
   const current=String(file?.preimageSha||'').trim();
   const context=supplied.get(path);
   if(current||!context)return file;
   return{...file,preimageSha:String(context.sha||'')};
  }),
 };
}

export function prepareAiRepairR314({rawResponse,residual,contextFiles=[],rejection=null}={}){
 let proposal;
 try{proposal=parseAiJsonR314(rawResponse)}
 catch(error){
  return{ok:false,state:'MALFORMED_AI_RESPONSE',proposal:null,reasons:[`AI_RESPONSE_PARSE_ERROR:${error instanceof Error?error.message:String(error)}`],patches:[]};
 }
 proposal=bindMissingPreimageShaR417(proposal,{contextFiles});
 const r506=bindDeterministicPreimageAnchorsR506(proposal,{rejection,contextFiles});
 if(!r506.valid)return{ok:false,state:'BLOCKED_BY_R506_PREIMAGE_BINDING',proposal:r506.proposal||proposal,reasons:r506.reasons,preimageBinding:r506,patches:[]};
 proposal=r506.proposal;
 if(Array.isArray(proposal?.files)&&proposal.files.length===0){
  return{ok:false,state:'NO_SAFE_PATCH',proposal,reasons:['MODEL_DECLINED_BOUNDED_PATCH'],patches:[]};
 }
 const validation=validateAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
 if(!validation.valid)return{ok:false,state:'REJECTED_BY_R314_POLICY',proposal,validation,reasons:validation.reasons,patches:[]};
 const patches=applyAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
 return{ok:true,state:'VALIDATED_BOUNDED_PATCH',proposal,validation,patches};
}

const retryableState=state=>state==='REJECTED_BY_R314_POLICY'||state==='MALFORMED_AI_RESPONSE'||state==='AI_GENERATION_ERROR'||state==='NO_SAFE_PATCH'||state==='BLOCKED_BY_R503_CALCULUS_LITERACY'||state==='BLOCKED_BY_R504_CALCULUS_DECISION'||state==='BLOCKED_BY_R505_APPLIED_CALCULUS'||state==='BLOCKED_BY_R506_PREIMAGE_BINDING';
const attemptReceipt=(attempt,prepared)=>({
 attempt,
 state:prepared.state,
 accepted:prepared.ok===true,
 reasons:Array.isArray(prepared.reasons)?prepared.reasons.map(String):[],
 validation:prepared.validation?{
  valid:prepared.validation.valid===true,
  changedChars:Number(prepared.validation.changedChars||0),
  fileCount:Number(prepared.validation.fileCount||0),
 }:null,
 proposal:summarizeAiProposalR314(prepared.proposal),
});

export async function proposeAiRepairR314({ai,model=R314_AI_REPAIR_MODEL_DEFAULT,residual,stage,contextFiles=[],maxAttempts=R314_AI_MAX_ATTEMPTS}={}){
 if(!ai||typeof ai.run!=='function')return{ok:false,state:'AI_BINDING_UNAVAILABLE',reasons:['CLOUD-01 AI binding is unavailable'],patches:[],attempts:[]};
 const boundedAttempts=Math.max(1,Math.min(R314_AI_MAX_ATTEMPTS,Number(maxAttempts)||R314_AI_MAX_ATTEMPTS));
 const attempts=[];
 let rejection=null;
 for(let attempt=1;attempt<=boundedAttempts;attempt++){
  const prompt=attempt===1
   ?autonomousRepairPromptR314({residual,stage,contextFiles})
   :autonomousRepairCorrectionPromptR314({residual,stage,contextFiles,rejection,attempt});
  let prepared;
  try{
   const result=await ai.run(model,{messages:[
    {role:'system',content:`Return exactly one valid JSON object and no markdown. Required top-level keys: schema,residualId,files,canonicalAdmission,directProductionMutation,expectedProofs${stage?.calculusWorkerPacket?',calculusContextId,appliedCalculus,developmentalDelta,alternativesConsidered,residualEvidenceIds,selectedAlternative,decision,decisionRationale':''}. Immutable workerAttestation is system-bound from the exact calculus packet and must not be invented by the model. On a zero-occurrence correction, use the R506 anchorId supplied in validator evidence instead of inventing before text; the runtime binds exact current-source bytes before R314 validation. The unchanged R314 mutation membrane and R503 calculus-literacy gate reject any value outside the supplied exact source and authority context.`},
    {role:'user',content:prompt},
   ],response_format:repairResponseFormatR314({residual,contextFiles}),temperature:attempt===1?0.1:0,max_tokens:attempt===1?R314_AI_MAX_OUTPUT_TOKENS:R314_AI_CORRECTION_MAX_OUTPUT_TOKENS,seed:314});
   prepared=prepareAiRepairR314({rawResponse:responsePayload(result),residual,contextFiles,rejection});
  }catch(error){
   prepared={ok:false,state:'AI_GENERATION_ERROR',proposal:null,reasons:[`AI_RUN_ERROR:${error instanceof Error?error.message:String(error)}`],patches:[]};
  }
  if(prepared.ok&&stage?.calculusWorkerPacket){
   const applied=bindAppliedReasoningWorkerR505(stage.calculusWorkerPacket,prepared.proposal,{residualId:residual?.id||null});
   if(!applied.valid){
    prepared={...prepared,ok:false,state:'BLOCKED_BY_R505_APPLIED_CALCULUS',reasons:applied.reasons,workerApplication:applied,patches:[]};
   }else{
    prepared={...prepared,proposal:applied.proposal,workerApplication:applied};
    const literacy=validateReasoningWorkerProposalR503(stage.calculusWorkerPacket,prepared.proposal);
    if(!literacy.valid){
     prepared={...prepared,ok:false,state:'BLOCKED_BY_R503_CALCULUS_LITERACY',reasons:literacy.reasons,workerLiteracy:literacy,patches:[]};
    }else{
     const decision=validateReasoningWorkerDecisionR504(stage.calculusWorkerPacket,prepared.proposal,{
      residualId:residual?.id||null,
      mutationProposed:Array.isArray(prepared.proposal?.files)&&prepared.proposal.files.length>0,
     });
     if(!decision.valid)prepared={...prepared,ok:false,state:'BLOCKED_BY_R504_CALCULUS_DECISION',reasons:decision.reasons,workerLiteracy:literacy,workerDecision:decision,patches:[]};
     else prepared={...prepared,workerLiteracy:literacy,workerDecision:decision};
    }
   }
  }
  const receipt=attemptReceipt(attempt,prepared);
  attempts.push(receipt);
  if(prepared.ok)return{model,promptSchema:'R314',reformulated:attempt>1,rejectionHistory:attempts.slice(0,-1),attempts,...prepared};
  if(!retryableState(prepared.state)||attempt===boundedAttempts)return{model,promptSchema:'R314',reformulated:attempt>1,rejectionHistory:attempts,attempts,...prepared};
  rejection={state:prepared.state,reasons:prepared.reasons||[],validation:prepared.validation||null,proposal:prepared.proposal||null};
 }
 return{model,promptSchema:'R314',ok:false,state:'RETRY_BUDGET_EXHAUSTED',reasons:['R314_REFORMULATION_BUDGET_EXHAUSTED'],patches:[],attempts,rejectionHistory:attempts};
}
