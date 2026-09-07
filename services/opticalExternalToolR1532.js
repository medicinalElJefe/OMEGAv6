import {createOpticalExternalToolR1531,R1531_TOOL_SCHEMA,R1531_RECEIPT_SCHEMA,R1531_TOOL_NAME} from './opticalExternalToolR1531.js';

export const R1532_TOOL_VERSION='R153.2';
export const R1532_TOOL_SCHEMA=R1531_TOOL_SCHEMA;
export const R1532_RECEIPT_SCHEMA=R1531_RECEIPT_SCHEMA;
export const R1532_TOOL_NAME=R1531_TOOL_NAME;
export const R1532_TOOL_AUTHORITY='SCREEN_ONLY';

const clampInt=(value,min,max,fallback=min)=>{const n=Math.floor(Number(value));return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback};
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const sha256=async value=>{const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(value))));return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const encode=({d,p,r,l})=>d*1728+p*144+r*12+l;
const validCoord=x=>Number.isInteger(x)&&x>=0&&x<=11;
const uniqueBy=(items,keyFn)=>[...new Map(items.map(item=>[keyFn(item),item])).values()];
const scoreOf=item=>Number(item?.scalar_focus??item?.score??-1);
const proposalFromItem=(item,callerId,suffix='seed')=>({schema:'OMEGA_PACKET_v1',packet_id:`r1532_${suffix}_${item.address??'geometry'}`,source_node:'omega-external-tool',source_sha:`r1532_${suffix}_${item.address??'geometry'}`,wavelength_nm:Number(item.wavelength_nm||532),target_phase_deg:Number(item.target_phase_deg||0),geometry:{...item.geometry},polarization:'circular',lineage:[`external-tool:${callerId}`,`adaptive-refine:${suffix}`]});

export function createOpticalExternalToolR1532({addressCandidate,screenCandidate,atlasSize=20736,truthBoundary,service='omega-optical-machine-r152'}){
 const base=createOpticalExternalToolR1531({addressCandidate,screenCandidate,atlasSize,truthBoundary,service});
 const adaptiveDef={description:'Refine around one winning atlas state in 4D address space, detect edge pressure, extrapolate bounded geometry beyond pressured atlas edges, and return a compact AI reasoning packet plus a proof-gated full-wave handoff plan.',side_effects:'none',max_local_candidates:256,max_radius:3};
 const residuals=['full_wave_result_not_implied','measured_material_dispersion_not_implied','fabrication_not_implied','physical_measurement_not_implied','canonical_admission_not_implied'];

 function boundaryPressure(seed){
  const out=[];
  for(const axis of ['d','p','r','l']){
   const v=Number(seed[axis]);
   if(v===0)out.push({axis,side:'low',coordinate:v});
   if(v===11)out.push({axis,side:'high',coordinate:v});
  }
  return out;
 }
 function atlasNeighborhood(seed,radius,budget,wavelength_nm){
  const coords=[];
  for(let dd=-radius;dd<=radius;dd++)for(let dp=-radius;dp<=radius;dp++)for(let dr=-radius;dr<=radius;dr++)for(let dl=-radius;dl<=radius;dl++){
   const manhattan=Math.abs(dd)+Math.abs(dp)+Math.abs(dr)+Math.abs(dl);
   if(manhattan>radius)continue;
   const c={d:seed.d+dd,p:seed.p+dp,r:seed.r+dr,l:seed.l+dl};
   if(!Object.values(c).every(validCoord))continue;
   coords.push({...c,manhattan,address:encode(c)});
  }
  const items=uniqueBy(coords,x=>x.address).slice(0,budget).map(c=>({...addressCandidate(c.address,wavelength_nm),distance:c.manhattan}));
  return items.sort((a,b)=>b.scalar_focus-a.scalar_focus||b.continuity-a.continuity||a.contradiction-b.contradiction||a.distance-b.distance||a.address-b.address);
 }
 function extrapolationProposals(seed,pressure,callerId){
  const g=seed.geometry||{},baseTarget=Number(seed.target_phase_deg||0),out=[],blocked=[];
  const push=(axis,side,geometry,target_phase_deg=baseTarget)=>{
   const gg={...geometry};
   if(!(gg.pitch_nm>0&&gg.width_nm>0&&gg.length_nm>0&&gg.height_nm>0&&gg.width_nm<=gg.pitch_nm&&gg.length_nm<=gg.pitch_nm)){blocked.push({axis,side,reason:'GEOMETRY_CONSTRAINT',geometry:gg});return}
   out.push({axis,side,proposal:{schema:'OMEGA_PACKET_v1',packet_id:`r1532_edge_${axis}_${side}_${seed.address}`,source_node:'omega-external-tool',source_sha:`r1532_edge_${axis}_${side}_${seed.address}`,wavelength_nm:Number(seed.wavelength_nm||532),target_phase_deg:((target_phase_deg%360)+360)%360,geometry:gg,polarization:'circular',lineage:[`external-tool:${callerId}`,`adaptive-boundary:${axis}:${side}`]}})
  };
  for(const edge of pressure){
   if(edge.axis==='d')push('d',edge.side,{...g,pitch_nm:Number(g.pitch_nm)+(edge.side==='low'?-4:4)});
   if(edge.axis==='p')push('p',edge.side,{...g,width_nm:Number(g.width_nm)+(edge.side==='low'?-3:3)});
   if(edge.axis==='r')push('r',edge.side,{...g,length_nm:Number(g.length_nm)+(edge.side==='low'?-5:5)});
   if(edge.axis==='l')push('l',edge.side,{...g,height_nm:Number(g.height_nm)+(edge.side==='low'?-7:7),orientation_deg:Number(g.orientation_deg||0)+(edge.side==='low'?-15:15)},baseTarget+(edge.side==='low'?-30:30));
  }
  return{proposals:out,blocked};
 }
 async function adaptiveRefine(call,callerId){
  const payload=call.payload&&typeof call.payload==='object'?call.payload:{};
  const seed_address=clampInt(payload.seed_address,0,atlasSize-1,0),wavelength_nm=clampInt(payload.wavelength_nm,380,780,532),radius=clampInt(payload.radius,1,3,1),budget=clampInt(payload.budget,8,256,128);
  const seed=addressCandidate(seed_address,wavelength_nm),pressure=boundaryPressure(seed),neighbors=atlasNeighborhood(seed,radius,budget,wavelength_nm),topAtlas=neighbors[0]||seed;
  const edge=extrapolationProposals(seed,pressure,callerId),expanded=[];
  for(const candidate of edge.proposals){
   const screened=await screenCandidate(candidate.proposal);
   if(screened.ok)expanded.push({axis:candidate.axis,side:candidate.side,proposal:candidate.proposal,packet:screened.body.packet,tier2_job:screened.body.tier2_job,score:screened.body.packet.scalar_metrics.scalar_focus,continuity:screened.body.packet.proof.continuity,contradiction:screened.body.packet.proof.contradiction,gate:screened.body.packet.proof.gate});
   else expanded.push({axis:candidate.axis,side:candidate.side,error:screened.body?.code||'SCREEN_FAILED',score:-1,continuity:0,contradiction:1,gate:'HOLD'});
  }
  expanded.sort((a,b)=>b.score-a.score||b.continuity-a.continuity||a.contradiction-b.contradiction);
  const bestExpanded=expanded.find(x=>x.score>=0)||null;
  const atlasImprovement=round(scoreOf(topAtlas)-scoreOf(seed));
  const expandedImprovement=bestExpanded?round(bestExpanded.score-scoreOf(seed)):null;
  let bestKind='seed',bestScore=scoreOf(seed),bestItem=seed;
  if(scoreOf(topAtlas)>bestScore){bestKind='atlas_neighbor';bestScore=scoreOf(topAtlas);bestItem=topAtlas}
  if(bestExpanded&&bestExpanded.score>bestScore){bestKind='boundary_extrapolation';bestScore=bestExpanded.score;bestItem=bestExpanded}
  const bestProposal=bestKind==='boundary_extrapolation'?bestExpanded.proposal:proposalFromItem(bestItem,callerId,bestKind);
  const bestScreen=await screenCandidate(bestProposal);
  const tier2=bestScreen.ok?bestScreen.body.tier2_job:null;
  let state='LOCAL_STABLE',next='validate_top_candidate_with_authenticated_fullwave_solver';
  if(bestKind==='boundary_extrapolation'&&bestScore>scoreOf(seed)+1e-6){state='BOUNDARY_ESCAPE_IMPROVING';next='continue_adaptive_refinement_from_expanded_geometry'}
  else if(bestKind==='atlas_neighbor'&&bestScore>scoreOf(seed)+1e-6){state='LOCAL_ATLAS_IMPROVING';next='continue_adaptive_refinement_from_top_address'}
  else if(!tier2){state=pressure.length?'BOUNDARY_PRESSURE_NO_PROMOTION':'LOCAL_STABLE_NO_PROMOTION';next=pressure.length?'expand_geometry_or_shift_search_window':'expand_search_radius_or_shift_wavelength'}
  const ai_context={
   schema:'OMEGA_AI_REASONING_PACKET_v1',
   observation:`Seed ${seed.address} scored ${round(seed.scalar_focus)} with gate ${seed.gate}; local best is ${bestKind} at ${round(bestScore)}.`,
   boundary_pressure:pressure.map(x=>`${x.axis}:${x.side}`),
   local_top:{address:topAtlas.address,score:round(topAtlas.scalar_focus),gate:topAtlas.gate,continuity:round(topAtlas.continuity),contradiction:round(topAtlas.contradiction)},
   expanded_top:bestExpanded?{axis:bestExpanded.axis,side:bestExpanded.side,score:round(bestExpanded.score),gate:bestExpanded.gate,continuity:round(bestExpanded.continuity),contradiction:round(bestExpanded.contradiction)}:null,
   convergence:{state,seed_score:round(seed.scalar_focus),best_score:round(bestScore),atlas_improvement:atlasImprovement,expanded_improvement:expandedImprovement},
   next_action:next,
   fullwave:{prepared:Boolean(tier2),state:tier2?.state||'NOT_PREPARED',solver:tier2?.solver||null},
   truth:'This packet is decision support over reduced-order screening. It is not hidden model reasoning, full-wave proof, fabrication evidence, or CanonState admission.'
  };
  return{seed,wavelength_nm,radius,budget,neighbors_count:neighbors.length,top_neighbors:neighbors.slice(0,12),boundary_pressure:pressure,blocked_extrapolations:edge.blocked,expanded_geometry_probes:expanded,best:{kind:bestKind,score:round(bestScore),address:bestItem?.address??null,geometry:bestKind==='boundary_extrapolation'?bestExpanded.proposal.geometry:bestItem.geometry},convergence:ai_context.convergence,ai_context,fullwave_handoff:{prepared:Boolean(tier2),job:tier2,truth:'PREPARED_NOT_SOLVED remains required until an authenticated Sovereign full-wave result receipt returns.'}};
 }
 async function makeReceipt(call,callerId,operation){
  const requestSha=await sha256({schema:call.schema,caller:{id:callerId,kind:String(call.caller?.kind||'ai-agent')},operation,payload:call.payload||{},request_id:call.request_id||null,goal:String(call.goal||'').slice(0,600),tool_version:R1532_TOOL_VERSION});
  return{schema:R1532_RECEIPT_SCHEMA,receipt_id:`omega_tool_${requestSha.slice(0,24)}`,request_sha256:requestSha,tool:R1532_TOOL_NAME,tool_version:R1532_TOOL_VERSION,service,authority:R1532_TOOL_AUTHORITY,operation,caller:{id:callerId,kind:String(call.caller?.kind||'ai-agent')},request_id:String(call.request_id||'').slice(0,160)||null,returned_at:new Date().toISOString(),canonical_mutation:false,side_effects:'none',truth_boundary:truthBoundary};
 }
 function descriptor(origin=''){
  const d=base.descriptor(origin),operationEnum=[...new Set([...(d.call_schema?.properties?.operation?.enum||[]),'adaptive_refine'])];
  return{...d,version:R1532_TOOL_VERSION,operations:{...d.operations,adaptive_refine:adaptiveDef},transport:{...d.transport,insight:`${origin}/api/tool/insight`},call_schema:{...d.call_schema,properties:{...d.call_schema.properties,operation:{...d.call_schema.properties.operation,enum:operationEnum}}},interpretation:'R153.2 extends an AI session with deterministic optical search, boundary-aware refinement, compact reasoning packets, and proof-gated full-wave handoff planning. It does not modify model weights, expose hidden reasoning, execute arbitrary code, or grant canonical authority.'};
 }
 function probe(origin=''){
  const p=base.probe(origin);return{...p,version:R1532_TOOL_VERSION,ready:{...p.ready,adaptive_refine:true},insight:`${origin}/api/tool/insight`,live_evidence_basis:{r1531_rank_top:{address:1698,gate:'STAY',scalar_focus:0.795603,continuity:0.863307,contradiction:0.075669},interpretation:'R153.2 adaptive refinement was added because the live R153.1 winner landed on d:low and p:high atlas boundaries.'}};
 }
 function openapi(origin=''){
  const o=base.openapi(origin),schema=descriptor('').call_schema;
  o.info={...o.info,version:R1532_TOOL_VERSION,description:'Bounded external deterministic optical computation with adaptive boundary-aware refinement, AI reasoning packets, hashed receipts and explicit SCREEN_ONLY truth boundaries.'};
  o.paths['/api/tool/invoke'].post.requestBody.content['application/json'].schema=schema;
  o.components.schemas.ExternalToolCall=schema;
  o.paths['/api/tool/insight']={get:{summary:'Run one bounded adaptive refinement step from query parameters',parameters:[{name:'seed_address',in:'query',schema:{type:'integer',minimum:0,maximum:20735}},{name:'wavelength_nm',in:'query',schema:{type:'integer',minimum:380,maximum:780}},{name:'radius',in:'query',schema:{type:'integer',minimum:1,maximum:3}},{name:'budget',in:'query',schema:{type:'integer',minimum:8,maximum:256}}],responses:{'200':{description:'Adaptive reasoning packet and proof-gated handoff plan'}}}};
  o['x-omega-tool-version']=R1532_TOOL_VERSION;return o;
 }
 async function invoke(call){
  if(call?.operation!=='adaptive_refine'){
   const delegated=await base.invoke(call);
   if(!delegated.ok)return delegated;
   delegated.body.receipt={...(delegated.body.receipt||{}),tool_version:R1532_TOOL_VERSION,base_tool_version:'R153.1'};
   delegated.body.tool_upgrade={version:R1532_TOOL_VERSION,adaptive_refine_available:true};
   return delegated;
  }
  if(!call||call.schema!==R1532_TOOL_SCHEMA)return{ok:false,status:400,body:{ok:false,code:'OMEGA_EXTERNAL_TOOL_SCHEMA_REQUIRED',expected:R1532_TOOL_SCHEMA}};
  const callerId=String(call.caller?.id||'').replace(/[\r\n\t]+/g,' ').slice(0,120);if(!callerId)return{ok:false,status:400,body:{ok:false,code:'CALLER_ID_REQUIRED'}};
  const result=await adaptiveRefine(call,callerId),receipt=await makeReceipt(call,callerId,'adaptive_refine');
  return{ok:true,status:200,body:{ok:true,schema:'OMEGA_EXTERNAL_TOOL_RESPONSE_v1',receipt,result,decision_support:{next_action:result.ai_context.next_action,evidence_class:'REDUCED_ORDER_SCREEN',confidence_class:'SCREENING_ONLY',residuals:[...residuals]}}};
 }
 return{descriptor,probe,openapi,invoke};
}
