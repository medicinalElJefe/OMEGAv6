export const R1531_TOOL_VERSION='R153.1';
export const R1531_TOOL_SCHEMA='OMEGA_EXTERNAL_TOOL_CALL_v1';
export const R1531_RECEIPT_SCHEMA='OMEGA_EXTERNAL_TOOL_RECEIPT_v1';
export const R1531_TOOL_NAME='omega_optical_external_push';
export const R1531_TOOL_AUTHORITY='SCREEN_ONLY';

const clampInt=(value,min,max,fallback=min)=>{
 const n=Math.floor(Number(value));
 return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
};
const stable=value=>{
 if(Array.isArray(value))return value.map(stable);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
 return value;
};
const stableStringify=value=>JSON.stringify(stable(value));
const sha256=async value=>{
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stableStringify(value)));
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
};
const boundedText=(value,max=120)=>String(value||'').replace(/[\r\n\t]+/g,' ').slice(0,max);

export function createOpticalExternalToolR1531({addressCandidate,screenCandidate,atlasSize=20736,truthBoundary,service='omega-optical-machine-r152'}){
 const operations={
  inspect_address:{description:'Inspect one deterministic optical atlas address at a requested wavelength.',side_effects:'none'},
  rank_addresses:{description:'Rank an explicit address set or bounded contiguous atlas window by reduced-order scalar focus and continuity.',side_effects:'none',max_candidates:1728},
  screen_candidate:{description:'Screen one bounded geometry proposal and return proof metrics plus an optional PREPARED_NOT_SOLVED Tier-2 RCWA request.',side_effects:'none'},
  compare_candidates:{description:'Screen and rank up to 24 geometry proposals using the same R152 reduced-order truth boundary.',side_effects:'none',max_candidates:24}
 };
 const residuals=['full_wave_result_not_implied','measured_material_dispersion_not_implied','fabrication_not_implied','physical_measurement_not_implied','canonical_admission_not_implied'];
 function descriptor(origin=''){
  return{
   schema:'OMEGA_EXTERNAL_TOOL_DESCRIPTOR_v1',name:R1531_TOOL_NAME,version:R1531_TOOL_VERSION,service,authority:R1531_TOOL_AUTHORITY,
   transport:{descriptor:`${origin}/api/tool/descriptor`,probe:`${origin}/api/tool/probe`,invoke:`${origin}/api/tool/invoke`,openapi:`${origin}/openapi.json`},
   call_schema:{type:'object',required:['schema','caller','operation','payload'],properties:{schema:{const:R1531_TOOL_SCHEMA},caller:{type:'object',required:['id'],properties:{id:{type:'string',maxLength:120},kind:{type:'string',enum:['ai-agent','human-tool','automation','test']}}},operation:{type:'string',enum:Object.keys(operations)},payload:{type:'object'},request_id:{type:'string',maxLength:160},goal:{type:'string',maxLength:600}}},
   operations,truth_boundary:truthBoundary,side_effects:'none',canonical_mutation:false,
   interpretation:'This adapter can extend an AI session with external deterministic optical computation and proof receipts. It does not modify the AI model, reveal hidden reasoning, or convert screening evidence into full-wave or physical validation.'
  };
 }
 function decisionSupport(operation,result){
  let next='inspect_or_refine';
  if(operation==='rank_addresses'&&result?.items?.length)next=result.items[0].gate==='STAY'?'screen_top_geometry_then_request_fullwave':'expand_or_shift_search_window';
  if(operation==='inspect_address')next=result?.item?.gate==='STAY'?'screen_candidate_or_prepare_fullwave':'compare_neighboring_addresses';
  if(operation==='screen_candidate')next=result?.screen?.tier2_job?'submit_tier2_only_through_authenticated_sovereign_solver':'refine_geometry_or_compare_candidates';
  if(operation==='compare_candidates')next=result?.items?.[0]?.tier2_job?'validate_top_candidate_with_authenticated_fullwave_solver':'iterate_top_reduced_order_candidates';
  return{next_action:next,evidence_class:'REDUCED_ORDER_SCREEN',confidence_class:'SCREENING_ONLY',residuals:[...residuals]};
 }
 async function invoke(call){
  if(!call||call.schema!==R1531_TOOL_SCHEMA)return{ok:false,status:400,body:{ok:false,code:'OMEGA_EXTERNAL_TOOL_SCHEMA_REQUIRED',expected:R1531_TOOL_SCHEMA}};
  const callerId=boundedText(call.caller?.id,120);
  const callerKind=boundedText(call.caller?.kind||'ai-agent',40);
  if(!callerId)return{ok:false,status:400,body:{ok:false,code:'CALLER_ID_REQUIRED'}};
  const operation=String(call.operation||'');
  if(!operations[operation])return{ok:false,status:400,body:{ok:false,code:'UNSUPPORTED_TOOL_OPERATION',available:Object.keys(operations)}};
  const payload=call.payload&&typeof call.payload==='object'?call.payload:{};
  let result;
  if(operation==='inspect_address'){
   const address=clampInt(payload.address,0,atlasSize-1,0),wavelength_nm=clampInt(payload.wavelength_nm,380,780,532);
   result={item:addressCandidate(address,wavelength_nm)};
  }
  if(operation==='rank_addresses'){
   const wavelength_nm=clampInt(payload.wavelength_nm,380,780,532);
   let addresses=[];
   if(Array.isArray(payload.addresses)&&payload.addresses.length){addresses=[...new Set(payload.addresses.slice(0,1728).map(value=>clampInt(value,0,atlasSize-1,0)))]}
   else{
    const offset=clampInt(payload.offset,0,atlasSize-1,0),limit=clampInt(payload.limit,1,1728,144),end=Math.min(atlasSize,offset+limit);
    for(let address=offset;address<end;address++)addresses.push(address);
   }
   const items=addresses.map(address=>addressCandidate(address,wavelength_nm)).sort((a,b)=>b.scalar_focus-a.scalar_focus||b.continuity-a.continuity||a.contradiction-b.contradiction||a.address-b.address);
   result={wavelength_nm,count:items.length,items,top:items.slice(0,12)};
  }
  if(operation==='screen_candidate'){
   const proposal={...(payload.proposal||{}),source_node:'omega-external-tool',lineage:[...((payload.proposal||{}).lineage||[]),`external-tool:${callerId}`]};
   const screened=await screenCandidate(proposal);
   if(!screened.ok)return screened;
   result={screen:screened.body};
  }
  if(operation==='compare_candidates'){
   const proposals=Array.isArray(payload.proposals)?payload.proposals.slice(0,24):[];
   if(!proposals.length)return{ok:false,status:400,body:{ok:false,code:'PROPOSALS_REQUIRED',max:24}};
   const items=[];
   for(let index=0;index<proposals.length;index++){
    const proposal={...proposals[index],source_node:'omega-external-tool',lineage:[...(proposals[index]?.lineage||[]),`external-tool:${callerId}:candidate:${index}`]};
    const screened=await screenCandidate(proposal);
    if(screened.ok)items.push({index,packet:screened.body.packet,tier2_job:screened.body.tier2_job,score:screened.body.packet.scalar_metrics.scalar_focus,continuity:screened.body.packet.proof.continuity,contradiction:screened.body.packet.proof.contradiction});
    else items.push({index,error:screened.body?.code||'SCREEN_FAILED',score:-1,continuity:0,contradiction:1});
   }
   items.sort((a,b)=>b.score-a.score||b.continuity-a.continuity||a.contradiction-b.contradiction||a.index-b.index);
   result={count:items.length,items,top:items.slice(0,6)};
  }
  const requestSha=await sha256({schema:call.schema,caller:{id:callerId,kind:callerKind},operation,payload,request_id:call.request_id||null,goal:boundedText(call.goal,600)});
  const returnedAt=new Date().toISOString();
  const receipt={schema:R1531_RECEIPT_SCHEMA,receipt_id:`omega_tool_${requestSha.slice(0,24)}`,request_sha256:requestSha,tool:R1531_TOOL_NAME,tool_version:R1531_TOOL_VERSION,service,authority:R1531_TOOL_AUTHORITY,operation,caller:{id:callerId,kind:callerKind},request_id:boundedText(call.request_id,160)||null,returned_at:returnedAt,canonical_mutation:false,side_effects:'none',truth_boundary:truthBoundary};
  return{ok:true,status:200,body:{ok:true,schema:'OMEGA_EXTERNAL_TOOL_RESPONSE_v1',receipt,result,decision_support:decisionSupport(operation,result)}};
 }
 function probe(origin=''){
  return{ok:true,schema:'OMEGA_EXTERNAL_TOOL_PROBE_v1',name:R1531_TOOL_NAME,version:R1531_TOOL_VERSION,authority:R1531_TOOL_AUTHORITY,ready:{inspect_address:true,rank_addresses:true,screen_candidate:true,compare_candidates:true,fullwave_execution:false,canonical_admission:false},dependencies:{tier1:'LOCAL_DETERMINISTIC',fullwave:'AUTHENTICATED_SOVEREIGN_RESULT_REQUIRED',canon:'OMEGAv6_ADMISSION_REQUIRED'},descriptor:`${origin}/api/tool/descriptor`,invoke:`${origin}/api/tool/invoke`,truth_boundary:truthBoundary};
 }
 function openapi(origin=''){
  return{openapi:'3.1.0',info:{title:'OMEGA Optical External Push Tool',version:R1531_TOOL_VERSION,description:'Bounded external deterministic optical computation adapter with hashed receipts and explicit SCREEN_ONLY truth boundaries.'},servers:[{url:origin||'/'}],paths:{'/api/tool/descriptor':{get:{summary:'Describe the tool contract',responses:{'200':{description:'Tool descriptor'}}}},'/api/tool/probe':{get:{summary:'Return operation readiness and dependency truth',responses:{'200':{description:'Tool readiness'}}}},'/api/tool/invoke':{post:{summary:'Invoke one bounded optical operation',requestBody:{required:true,content:{'application/json':{schema:descriptor('').call_schema}}},responses:{'200':{description:'Hashed tool receipt and deterministic result'},'400':{description:'Invalid bounded call'}}}}},components:{schemas:{ExternalToolCall:descriptor('').call_schema}},'x-omega-authority':R1531_TOOL_AUTHORITY,'x-omega-canonical-mutation':false,'x-omega-truth-boundary':truthBoundary};
 }
 return{descriptor,invoke,probe,openapi};
}
