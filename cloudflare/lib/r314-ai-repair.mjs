import {
  R314_AI_REPAIR_MODEL_DEFAULT,
  applyAiRepairProposalR314,
  autonomousRepairPromptR314,
  parseAiJsonR314,
  validateAiRepairProposalR314,
} from '../../src/system/autonomousRepairPolicyR314.js';

export const R314_CLOUD_AI_REPAIR_SCHEMA='OMEGA_CLOUD_R314_AI_REPAIR';

function responseText(result){
  if(typeof result==='string')return result;
  if(typeof result?.response==='string')return result.response;
  if(typeof result?.text==='string')return result.text;
  if(typeof result?.result?.response==='string')return result.result.response;
  if(typeof result?.result?.text==='string')return result.result.text;
  return JSON.stringify(result??{});
}

export function prepareAiRepairR314({rawResponse,residual,contextFiles=[]}={}){
  const proposal=parseAiJsonR314(rawResponse);
  if(Array.isArray(proposal?.files)&&proposal.files.length===0){
    return{ok:false,state:'NO_SAFE_PATCH',proposal,reasons:['MODEL_DECLINED_BOUNDED_PATCH'],patches:[]};
  }
  const validation=validateAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
  if(!validation.valid)return{ok:false,state:'REJECTED_BY_R314_POLICY',proposal,validation,reasons:validation.reasons,patches:[]};
  const patches=applyAiRepairProposalR314(proposal,{contextFiles,residualId:residual?.id||null});
  return{ok:true,state:'VALIDATED_BOUNDED_PATCH',proposal,validation,patches};
}

export async function proposeAiRepairR314({ai,model=R314_AI_REPAIR_MODEL_DEFAULT,residual,stage,contextFiles=[]}={}){
  if(!ai||typeof ai.run!=='function')return{ok:false,state:'AI_BINDING_UNAVAILABLE',reasons:['CLOUD-01 AI binding is unavailable'],patches:[]};
  const prompt=autonomousRepairPromptR314({residual,stage,contextFiles});
  const result=await ai.run(model,{messages:[
    {role:'system',content:'Return only the bounded JSON repair object requested by the user prompt. Do not use markdown.'},
    {role:'user',content:prompt},
  ],temperature:0.1,max_tokens:6000});
  return{model,promptSchema:'R314',...prepareAiRepairR314({rawResponse:responseText(result),residual,contextFiles})};
}
