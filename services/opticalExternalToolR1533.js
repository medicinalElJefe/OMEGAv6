import {createOpticalExternalToolR1532,R1532_TOOL_SCHEMA,R1532_RECEIPT_SCHEMA,R1532_TOOL_NAME} from './opticalExternalToolR1532.js';

export const R1533_TOOL_VERSION='R153.3';
export const R1533_TOOL_SCHEMA=R1532_TOOL_SCHEMA;
export const R1533_RECEIPT_SCHEMA=R1532_RECEIPT_SCHEMA;
export const R1533_TOOL_NAME=R1532_TOOL_NAME;
export const R1533_TOOL_AUTHORITY='SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE';
export const R1533_R41_CELL_RATIO=0.95;

const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sha256=async v=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(v))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const geometryFrom=value=>value?.geometry||value?.proposal?.geometry||value?.result?.cycle?.final?.geometry||value?.result?.best?.geometry||value?.cycle?.final?.geometry||value?.best?.geometry||value;

export function fullwaveAdmissibilityR1533(value,{engineeringRatio=0.93}={}){
 const g=geometryFrom(value)||{};
 const pitch=Number(g.pitch_nm),width=Number(g.width_nm),length=Number(g.length_nm),height=Number(g.height_nm);
 const positive=[pitch,width,length,height].every(Number.isFinite)&&Math.min(pitch,width,length,height)>0;
 const ordered=positive&&width<length;
 const diagonal=positive?Math.hypot(width,length):Infinity;
 const r41Limit=positive?R1533_R41_CELL_RATIO*pitch:0;
 const slack=r41Limit-diagonal;
 const valid=positive&&ordered&&diagonal<=r41Limit;
 const ratio=Math.max(0.8,Math.min(R1533_R41_CELL_RATIO-0.001,Number(engineeringRatio)||0.93));
 const maxLength=Math.sqrt(Math.max(0,(ratio*pitch)**2-width**2));
 const expandPitch=positive?diagonal/ratio:Infinity;
 const balancedPitch=positive?(pitch+expandPitch)/2:Infinity;
 const balancedMaxLength=positive?Math.sqrt(Math.max(0,(ratio*balancedPitch)**2-width**2)):0;
 const projections=[];
 const add=(family,x)=>{
  const p=Number(x.pitch_nm),w=Number(x.width_nm),l=Number(x.length_nm),h=Number(x.height_nm),d=Math.hypot(w,l),limit=R1533_R41_CELL_RATIO*p;
  if([p,w,l,h].every(Number.isFinite)&&Math.min(p,w,l,h)>0&&w<l&&d<=limit)projections.push({family,geometry:{...g,pitch_nm:round(p,3),width_nm:round(w,3),length_nm:round(l,3),height_nm:round(h,3)},r41_slack_nm:round(limit-d)});
 };
 if(positive){
  add('shrink_length',{...g,length_nm:Math.max(width+2,Math.min(length,maxLength))});
  add('expand_pitch',{...g,pitch_nm:Math.max(pitch,expandPitch)});
  add('balanced',{...g,pitch_nm:balancedPitch,length_nm:Math.max(width+2,Math.min(length,balancedMaxLength))});
 }
 return{
  schema:'OMEGA_FULLWAVE_ADMISSIBILITY_R1533',version:R1533_TOOL_VERSION,
  geometry:{...g,pitch_nm:pitch,width_nm:width,length_nm:length,height_nm:height},
  r41:{valid,cell_ratio:R1533_R41_CELL_RATIO,diagonal_nm:round(diagonal),limit_nm:round(r41Limit),slack_nm:round(slack),diagonal_to_limit_ratio:Number.isFinite(diagonal/r41Limit)?round(diagonal/r41Limit):null,width_less_than_length:ordered},
  engineering_projection_ratio:ratio,projections,
  status:valid?'FULLWAVE_GEOMETRY_ADMISSIBLE':'FULLWAVE_GEOMETRY_REFINEMENT_REQUIRED',
  truth:'The 0.95 diagonal-to-pitch boundary is inherited from the validated R41/R43 RCWA geometry filter. The engineering projection ratio is search headroom, not a physical constant or fabrication specification.'
 };
}

export function createOpticalExternalToolR1533(deps){
 const base=createOpticalExternalToolR1532(deps);
 const operations={
  ...base.descriptor('').operations,
  fullwave_admissibility:{description:'Check a geometry against the inherited R41/R43 RCWA unit-cell manifold and return deterministic admissible projection families.',side_effects:'none'},
  prepare_robust_fullwave:{description:'Prepare a bounded R153.3 robustness job contract for the sovereign grcwa bridge. Invalid scalar geometries are routed to manifold refinement rather than falsely marked ready for full-wave validation.',side_effects:'none'}
 };
 const residuals=['independent_sovereign_rcwa_result_required','fabrication_tolerance_specification_required','measured_material_dispersion_not_implied','physical_measurement_not_implied','canonical_admission_not_implied'];
 async function receipt(call,operation){
  const caller={id:String(call?.caller?.id||'').slice(0,120),kind:String(call?.caller?.kind||'ai-agent').slice(0,40)};
  const requestSha=await sha256({schema:call?.schema,caller,operation,payload:call?.payload||{},request_id:call?.request_id||null,goal:String(call?.goal||'').slice(0,600),tool_version:R1533_TOOL_VERSION});
  return{schema:R1533_RECEIPT_SCHEMA,receipt_id:`omega_tool_${requestSha.slice(0,24)}`,request_sha256:requestSha,tool:R1533_TOOL_NAME,tool_version:R1533_TOOL_VERSION,service:deps.service,authority:R1533_TOOL_AUTHORITY,operation,caller,request_id:String(call?.request_id||'').slice(0,160)||null,returned_at:new Date().toISOString(),canonical_mutation:false,side_effects:'none',truth_boundary:deps.truthBoundary};
 }
 function rewriteAdaptive(body){
  const geometry=body?.result?.cycle?.final?.geometry||body?.result?.best?.geometry;
  if(!geometry)return body;
  const admissibility=fullwaveAdmissibilityR1533(geometry);
  body.result.fullwave_admissibility=admissibility;
  if(!admissibility.r41.valid){
   const inherited=body.result.fullwave_handoff||null;
   body.result.fullwave_handoff={prepared:false,state:'BLOCKED_BY_FULLWAVE_GEOMETRY',inherited_screen_handoff:inherited,required_action:'project_and_refine_on_r41_rcwa_manifold',truth:'A reduced-order STAY gate cannot prepare a sovereign RCWA promotion when the candidate lies outside the inherited full-wave geometry manifold.'};
   if(body.result.ai_context){body.result.ai_context.next_action='project_and_refine_on_fullwave_admissible_manifold';body.result.ai_context.fullwave={prepared:false,state:'BLOCKED_BY_FULLWAVE_GEOMETRY'};}
   if(body.decision_support)body.decision_support.next_action='project_and_refine_on_fullwave_admissible_manifold';
  }
  return body;
 }
 async function invoke(call){
  if(!call||call.schema!==R1533_TOOL_SCHEMA)return{ok:false,status:400,body:{ok:false,code:'OMEGA_EXTERNAL_TOOL_SCHEMA_REQUIRED',expected:R1533_TOOL_SCHEMA}};
  const callerId=String(call.caller?.id||'').replace(/[\r\n\t]+/g,' ').slice(0,120);if(!callerId)return{ok:false,status:400,body:{ok:false,code:'CALLER_ID_REQUIRED'}};
  const operation=String(call.operation||'');
  if(operation==='fullwave_admissibility'||operation==='prepare_robust_fullwave'){
   const payload=call.payload&&typeof call.payload==='object'?call.payload:{};
   const geometry=geometryFrom(payload);
   const admissibility=fullwaveAdmissibilityR1533(geometry,{engineeringRatio:payload.engineering_ratio});
   const robustJob={schema:'OMEGA_FULLWAVE_ROBUST_QUEUE_R1533',version:R1533_TOOL_VERSION,state:admissibility.r41.valid?'ROBUSTNESS_VALIDATION_PREPARED_NOT_SOLVED':'MANIFOLD_REFINEMENT_PREPARED_NOT_SOLVED',source_geometry:admissibility.geometry,admissibility,solver:'grcwa',bridge:'sovereign/omega_fullwave_manifold_r1533.py',wavelengths_nm:Array.isArray(payload.wavelengths_nm)?payload.wavelengths_nm.slice(0,9):[470,532,650],numerics:{screen_grid:Math.max(32,Math.min(128,Number(payload.screen_grid)||64)),validation_grid:Math.max(64,Math.min(160,Number(payload.validation_grid)||96)),top_k:Math.max(1,Math.min(24,Number(payload.top_k)||12))},stress:{tolerance_nm:Math.max(0,Math.min(50,Number(payload.tolerance_nm)||5)),phase_margin_deg:Math.max(0.5,Math.min(12,Number(payload.phase_margin_deg)||6)),engineering_projection_ratio:admissibility.engineering_projection_ratio},authority:'PREPARED_NOT_SOLVED',canonical_mutation:false};
   const result=operation==='fullwave_admissibility'?{admissibility}:{admissibility,robust_job:robustJob};
   return{ok:true,status:200,body:{ok:true,schema:'OMEGA_EXTERNAL_TOOL_RESPONSE_v1',receipt:await receipt(call,operation),result,decision_support:{next_action:admissibility.r41.valid?'run_bounded_robust_rcwa_validation':'run_fullwave_manifold_projection_then_robust_rcwa',evidence_class:'GEOMETRY_AUTHORITY_GATE',confidence_class:'DETERMINISTIC_GEOMETRY',residuals}}};
  }
  const delegated=await base.invoke(call);if(!delegated.ok)return delegated;
  delegated.body.receipt={...(delegated.body.receipt||{}),tool_version:R1533_TOOL_VERSION,base_tool_version:delegated.body.receipt?.tool_version||'R153.2',authority:R1533_TOOL_AUTHORITY};
  delegated.body.tool_upgrade={...(delegated.body.tool_upgrade||{}),version:R1533_TOOL_VERSION,fullwave_admissibility_available:true,robust_fullwave_queue_available:true};
  return{...delegated,body:rewriteAdaptive(delegated.body)};
 }
 function descriptor(origin=''){
  const d=base.descriptor(origin);return{...d,version:R1533_TOOL_VERSION,authority:R1533_TOOL_AUTHORITY,operations,call_schema:{...d.call_schema,properties:{...d.call_schema.properties,operation:{type:'string',enum:Object.keys(operations)}}},interpretation:'R153.3 preserves the external reduced-order coprocessor but adds the inherited R41/R43 RCWA geometry manifold as an authority gate. Reduced-order winners outside that manifold are projected/refined before any robust full-wave promotion.'};
 }
 function probe(origin=''){
  const p=base.probe(origin);return{...p,version:R1533_TOOL_VERSION,authority:R1533_TOOL_AUTHORITY,ready:{...p.ready,fullwave_admissibility:true,prepare_robust_fullwave:true,fullwave_execution:false,canonical_admission:false},r41_manifold:{cell_ratio:R1533_R41_CELL_RATIO,rule:'hypot(width_nm,length_nm) <= 0.95 * pitch_nm AND width_nm < length_nm'},dependencies:{...p.dependencies,robust_fullwave:'SOVEREIGN_GRCWA_BRIDGE_REQUIRED'}};
 }
 function openapi(origin=''){
  const o=base.openapi(origin),d=descriptor(origin);o.info={...o.info,version:R1533_TOOL_VERSION,description:'External optical coprocessor with deterministic R41/R43 full-wave geometry admissibility gating and robust grcwa queue preparation.'};o.paths['/api/tool/invoke'].post.requestBody.content['application/json'].schema=d.call_schema;o['x-omega-tool-version']=R1533_TOOL_VERSION;o['x-omega-fullwave-manifold']='R41_R43_0.95_DIAGONAL_RATIO';return o;
 }
 return{descriptor,probe,openapi,invoke};
}
