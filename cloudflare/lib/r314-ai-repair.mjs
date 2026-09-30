import {
  R314_AI_REPAIR_MODEL_DEFAULT,
  R314_AI_MAX_ATTEMPTS,
  R314_AI_MAX_OUTPUT_TOKENS,
  R314_AI_MAX_FILES,
  R314_AI_MAX_REPLACEMENTS_PER_FILE,
  applyAiRepairProposalR314,
  autonomousRepairPromptR314,
  autonomousRepairCorrectionPromptR314,
  parseAiJsonR314,
  summarizeAiProposalR314,
  validateAiRepairProposalR314,
} from '../../src/system/autonomousRepairPolicyR314.js';

export const R314_CLOUD_AI_REPAIR_SCHEMA='OMEGA_CLOUD_R314_AI_REPAIR';

function responsePayload(result){
 if(typeof result==='string')return result;
 if(result?.response!==undefined)return result.response;
 if(result?.text!==undefined)return result.text;
 if(result?.result?.response!==undefined)return result.result.response;
 if(result?.result?.text!==undefined)return result.result.text;
 return result??{};
}

export function repairResponseFormatR314({residual,contextFiles=[]}={}){
 const exactFiles=(contextFiles||[]).map(file=>({path:String(file.path||''),sha:String(file.sha||'')}));
 const variants=exactFiles.map(file=>({
  type:'object',
  additionalProperties:false,
  properties:{
   path:{type:'string',enum:[file.path]},
   preimageSha:{type:'string',enum:[file.sha]},
   replacements:{
    type:'array',
    minItems:1,
    maxItems:R314_AI_MAX_REPLACEMENTS_PER_FILE,
    items:{
     type:'object',
     additionalProperties:false,
     properties:{
      before:{type:'string',minLength:1},
      after:{type:'string'},
     },
     required:['before','after'],
    },
   },
  },
  required:['path','preimageSha','replacements'],
 }));
 const expectedProofs=[...new Set((Array.isArray(residual?.expectedProofs)?residual.expectedProofs:[]).map(String).filter(Boolean))];
 const fileItems=variants.length===1?variants[0]:variants.length>1?{oneOf:variants}:{type:'object',additionalProperties:false};
 return{
  type:'json_schema',
  json_schema:{
   type:'object',
   additionalProperties:false,
   properties:{
    schema:{type:'string',enum:['OMEGA_AUTONOMOUS_REPAIR_POLICY_R314']},
    residualId:{type:'string',enum:[String(residual?.id||'')]},
    files:{type:'array',minItems:0,maxItems:Math.min(R314_AI_MAX_FILES,exactFiles.length),items:fileItems},
    canonicalAdmission:{type:'boolean',enum:[false]},
    directProductionMutation:{type:'boolean',enum:[false]},
    expectedProofs:{
     type:'array',
     minItems:1,
     maxItems:8,
     uniqueItems:true,
     items:expectedProofs.length?{type:'string',enum:expectedProofs}:{type:'string',minLength:1},
    },
   },
   required:['schema','residualId','files','canonicalAdmission','directProductionMutation','expectedProofs'],
  },
 };
}

export function prepareAiRepairR314({rawResponse,residual,contextFiles=[]}={}){
 let proposal;
 try{proposal=parseAiJsonR314(rawResponse)}
 catch(error){
  return{ok:false,state:'MALFORMED_AI_RESPONSE',proposal:null,reasons:[`AI_RESPONSE_PARSE_ERROR:${error instanceof Error?error.message:String(error)}`],patches:[]};
 }
 if(Array.isArray(proposal?.files)&&proposal.files.length===0){
  return{ok:false,state:'NO_SAFE_PATCH',proposal,reasons:['MODEL_DECLINED_BOUNDED_PATCH'],patches:[]};
 }
 const validation=validateAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
 if(!validation.valid)return{ok:false,state:'REJECTED_BY_R314_POLICY',proposal,validation,reasons:validation.reasons,patches:[]};
 const patches=applyAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
 return{ok:true,state:'VALIDATED_BOUNDED_PATCH',proposal,validation,patches};
}

const retryableState=state=>state==='REJECTED_BY_R314_POLICY'||state==='MALFORMED_AI_RESPONSE';
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
  const result=await ai.run(model,{messages:[
   {role:'system',content:'Return only the bounded JSON repair object requested by the user prompt. Do not use markdown.'},
   {role:'user',content:prompt},
  ],response_format:repairResponseFormatR314({residual,contextFiles}),temperature:attempt===1?0.1:0,max_tokens:R314_AI_MAX_OUTPUT_TOKENS,seed:314});
  const prepared=prepareAiRepairR314({rawResponse:responsePayload(result),residual,contextFiles});
  const receipt=attemptReceipt(attempt,prepared);
  attempts.push(receipt);
  if(prepared.ok)return{model,promptSchema:'R314',reformulated:attempt>1,rejectionHistory:attempts.slice(0,-1),attempts,...prepared};
  if(prepared.state==='NO_SAFE_PATCH')return{model,promptSchema:'R314',reformulated:attempt>1,rejectionHistory:attempts.slice(0,-1),attempts,...prepared};
  if(!retryableState(prepared.state)||attempt===boundedAttempts)return{model,promptSchema:'R314',reformulated:attempt>1,rejectionHistory:attempts,attempts,...prepared};
  rejection={state:prepared.state,reasons:prepared.reasons||[],validation:prepared.validation||null,proposal:prepared.proposal||null};
 }
 return{model,promptSchema:'R314',ok:false,state:'RETRY_BUDGET_EXHAUSTED',reasons:['R314_REFORMULATION_BUDGET_EXHAUSTED'],patches:[],attempts,rejectionHistory:attempts};
}
