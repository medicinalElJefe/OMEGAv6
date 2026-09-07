import {createOpticalExternalToolR1531,R1531_TOOL_SCHEMA,R1531_RECEIPT_SCHEMA,R1531_TOOL_NAME} from './opticalExternalToolR1531.js';

export const R1532_TOOL_VERSION='R153.2';
export const R1532_TOOL_SCHEMA=R1531_TOOL_SCHEMA;
export const R1532_RECEIPT_SCHEMA=R1531_RECEIPT_SCHEMA;
export const R1532_TOOL_NAME=R1531_TOOL_NAME;
export const R1532_TOOL_AUTHORITY='SCREEN_ONLY';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)));
const clampInt=(v,a,b,f=a)=>{const n=Math.floor(Number(v));return Number.isFinite(n)?Math.max(a,Math.min(b,n)):f};
const round=(v,n=6)=>Number(Number(v).toFixed(n));
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const sha256=async v=>{const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stable(v))));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const encode=({d,p,r,l})=>d*1728+p*144+r*12+l;
const validCoord=x=>Number.isInteger(x)&&x>=0&&x<=11;
const uniqueBy=(items,keyFn)=>[...new Map(items.map(item=>[keyFn(item),item])).values()];
const scoreOf=x=>Number(x?.scalar_focus??x?.score??x?.packet?.scalar_metrics?.scalar_focus??-1);
const proofOf=x=>({continuity:Number(x?.continuity??x?.packet?.proof?.continuity??0),contradiction:Number(x?.contradiction??x?.packet?.proof?.contradiction??1),burden:Number(x?.burden??x?.packet?.proof?.burden??1),gate:String(x?.gate??x?.packet?.proof?.gate??'HOLD')});
const geometryKey=g=>['pitch_nm','width_nm','length_nm','height_nm','orientation_deg'].map(k=>round(Number(g?.[k]||0),3)).join(':');
const proposalFromItem=(item,callerId,suffix='seed')=>({schema:'OMEGA_PACKET_v1',packet_id:`r1532_${suffix}_${item.address??'geometry'}`,source_node:'omega-external-tool',source_sha:`r1532_${suffix}_${item.address??'geometry'}`,wavelength_nm:Number(item.wavelength_nm||532),target_phase_deg:Number(item.target_phase_deg||0),geometry:{...item.geometry},polarization:'circular',lineage:[`external-tool:${callerId}`,`adaptive-refine:${suffix}`]});

function validGeometry(g){return Number(g?.pitch_nm)>0&&Number(g?.width_nm)>0&&Number(g?.length_nm)>0&&Number(g?.height_nm)>0&&Number(g.width_nm)<=Number(g.pitch_nm)&&Number(g.length_nm)<=Number(g.pitch_nm)}
function normalizeGeometry(g){
 const pitch=Math.max(80,round(Number(g.pitch_nm)||330,3));
 const width=clamp(round(Number(g.width_nm)||105,3),30,pitch);
 const length=clamp(round(Number(g.length_nm)||290,3),Math.min(width+10,pitch),pitch);
 const height=Math.max(100,round(Number(g.height_nm)||575,3));
 const orientation=((Number(g.orientation_deg)||0)%180+180)%180;
 return{...g,pitch_nm:pitch,width_nm:width,length_nm:length,height_nm:height,orientation_deg:round(orientation,3),material:g?.material||'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'};
}
function candidateUtility(x){
 const s=scoreOf(x),p=proofOf(x);
 const gateBonus=p.gate==='STAY'?0.035:p.gate==='TURN'?0.01:-0.025;
 return round(s+.18*p.continuity-.14*p.contradiction-.07*p.burden+gateBonus,9);
}

export function createOpticalExternalToolR1532({addressCandidate,screenCandidate,atlasSize=20736,truthBoundary,service='omega-optical-machine-r152'}){
 const base=createOpticalExternalToolR1531({addressCandidate,screenCandidate,atlasSize,truthBoundary,service});
 const adaptiveDef={description:'Refine one winning atlas state in 4D address space, detect boundary pressure, and test constraint-preserving geometry escapes.',side_effects:'none',max_local_candidates:256,max_radius:3};
 const cycleDef={description:'Run a bounded deterministic closed-loop search: atlas refinement -> constraint-preserving boundary escape -> proof-guided geometry beam search -> convergence or PREPARED_NOT_SOLVED full-wave handoff.',side_effects:'none',max_rounds:6,max_evaluations:384};
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
  return uniqueBy(coords,x=>x.address).map(c=>({...addressCandidate(c.address,wavelength_nm),distance:c.manhattan})).sort((a,b)=>candidateUtility(b)-candidateUtility(a)||a.distance-b.distance||a.address-b.address).slice(0,budget);
 }
 function edgeGeometry(seed,axis,side){
  const g={...seed.geometry},sign=side==='low'?-1:1;
  if(axis==='d'){
   g.pitch_nm=Number(g.pitch_nm)+4*sign;
   if(sign<0){g.length_nm=Math.min(Number(g.length_nm),Number(g.pitch_nm));g.width_nm=Math.min(Number(g.width_nm),Number(g.pitch_nm)-1)}
  }
  if(axis==='p')g.width_nm=Number(g.width_nm)+3*sign;
  if(axis==='r')g.length_nm=Number(g.length_nm)+5*sign;
  if(axis==='l'){g.height_nm=Number(g.height_nm)+7*sign;g.orientation_deg=Number(g.orientation_deg||0)+15*sign}
  return normalizeGeometry(g);
 }
 function extrapolationProposals(seed,pressure,callerId){
  const out=[],blocked=[];
  const edges=[...pressure];
  if(pressure.length>1){
   for(let i=0;i<pressure.length;i++)for(let j=i+1;j<pressure.length;j++)edges.push({axis:`${pressure[i].axis}+${pressure[j].axis}`,side:`${pressure[i].side}+${pressure[j].side}`,pair:[pressure[i],pressure[j]]});
  }
  for(const edge of edges){
   let g={...seed.geometry},target=Number(seed.target_phase_deg||0);
   const parts=edge.pair||[edge];
   for(const part of parts){g=edgeGeometry({...seed,geometry:g},part.axis,part.side);if(part.axis==='l')target+=part.side==='low'?-30:30}
   if(!validGeometry(g)){blocked.push({axis:edge.axis,side:edge.side,reason:'GEOMETRY_CONSTRAINT',geometry:g});continue}
   out.push({axis:edge.axis,side:edge.side,proposal:{schema:'OMEGA_PACKET_v1',packet_id:`r1532_edge_${String(edge.axis).replace(/\+/g,'_')}_${seed.address}`,source_node:'omega-external-tool',source_sha:`r1532_edge_${String(edge.axis).replace(/\+/g,'_')}_${seed.address}`,wavelength_nm:Number(seed.wavelength_nm||532),target_phase_deg:((target%360)+360)%360,geometry:g,polarization:'circular',lineage:[`external-tool:${callerId}`,`adaptive-boundary:${edge.axis}:${edge.side}`]}});
  }
  return{proposals:uniqueBy(out,x=>geometryKey(x.proposal.geometry)),blocked};
 }
 async function screenProposal(proposal){
  const screened=await screenCandidate(proposal);
  if(!screened.ok)return{ok:false,error:screened.body?.code||'SCREEN_FAILED',score:-1,utility:-1,continuity:0,contradiction:1,burden:1,gate:'HOLD',proposal};
  const packet=screened.body.packet,p=packet.proof;
  const item={ok:true,proposal,packet,tier2_job:screened.body.tier2_job,score:packet.scalar_metrics.scalar_focus,continuity:p.continuity,contradiction:p.contradiction,burden:p.burden,gate:p.gate};
  return{...item,utility:candidateUtility(item)};
 }
 async function adaptiveRefine(call,callerId){
  const payload=call.payload&&typeof call.payload==='object'?call.payload:{};
  const seed_address=clampInt(payload.seed_address,0,atlasSize-1,0),wavelength_nm=clampInt(payload.wavelength_nm,380,780,532),radius=clampInt(payload.radius,1,3,1),budget=clampInt(payload.budget,8,256,128);
  const seed=addressCandidate(seed_address,wavelength_nm),pressure=boundaryPressure(seed),neighbors=atlasNeighborhood(seed,radius,budget,wavelength_nm),topAtlas=neighbors[0]||seed;
  const edge=extrapolationProposals(seed,pressure,callerId),expanded=[];
  for(const candidate of edge.proposals)expanded.push({...candidate,...await screenProposal(candidate.proposal)});
  expanded.sort((a,b)=>b.utility-a.utility||b.score-a.score);
  const bestExpanded=expanded.find(x=>x.ok)||null;
  let bestKind='seed',bestScore=scoreOf(seed),bestUtility=candidateUtility(seed),bestItem=seed,bestProposal=proposalFromItem(seed,callerId,'seed');
  if(candidateUtility(topAtlas)>bestUtility){bestKind='atlas_neighbor';bestScore=scoreOf(topAtlas);bestUtility=candidateUtility(topAtlas);bestItem=topAtlas;bestProposal=proposalFromItem(topAtlas,callerId,'atlas_neighbor')}
  if(bestExpanded&&bestExpanded.utility>bestUtility){bestKind='boundary_extrapolation';bestScore=bestExpanded.score;bestUtility=bestExpanded.utility;bestItem=bestExpanded;bestProposal=bestExpanded.proposal}
  const bestScreen=bestKind==='boundary_extrapolation'?bestExpanded:await screenProposal(bestProposal),tier2=bestScreen?.tier2_job||null;
  const improvement=round(bestScore-scoreOf(seed));
  let state='LOCAL_STABLE',next='validate_top_candidate_with_authenticated_fullwave_solver';
  if(bestKind==='boundary_extrapolation'&&improvement>1e-6){state='BOUNDARY_ESCAPE_IMPROVING';next='continue_geometry_beam_search_from_boundary_escape'}
  else if(bestKind==='atlas_neighbor'&&improvement>1e-6){state='LOCAL_ATLAS_IMPROVING';next='continue_adaptive_refinement_from_top_address'}
  else if(!tier2){state=pressure.length?'BOUNDARY_PRESSURE_NO_PROMOTION':'LOCAL_STABLE_NO_PROMOTION';next=pressure.length?'continue_constraint_preserving_geometry_search':'expand_search_radius_or_shift_wavelength'}
  const ai_context={schema:'OMEGA_AI_REASONING_PACKET_v1',observation:`Seed ${seed.address} scored ${round(seed.scalar_focus)} with gate ${seed.gate}; best ${bestKind} scored ${round(bestScore)}.`,boundary_pressure:pressure.map(x=>`${x.axis}:${x.side}`),local_top:{address:topAtlas.address,score:round(topAtlas.scalar_focus),utility:round(candidateUtility(topAtlas)),gate:topAtlas.gate,continuity:round(topAtlas.continuity),contradiction:round(topAtlas.contradiction)},expanded_top:bestExpanded?{axis:bestExpanded.axis,side:bestExpanded.side,score:round(bestExpanded.score),utility:round(bestExpanded.utility),gate:bestExpanded.gate,continuity:round(bestExpanded.continuity),contradiction:round(bestExpanded.contradiction)}:null,convergence:{state,seed_score:round(seed.scalar_focus),best_score:round(bestScore),improvement,pressure_count:pressure.length},next_action:next,fullwave:{prepared:Boolean(tier2),state:tier2?.state||'NOT_PREPARED',solver:tier2?.solver||null},truth:'Decision support over reduced-order screening only; not hidden model reasoning, full-wave proof, fabrication evidence, or CanonState admission.'};
  return{seed,wavelength_nm,radius,budget,neighbors_count:neighbors.length,top_neighbors:neighbors.slice(0,12),boundary_pressure:pressure,blocked_extrapolations:edge.blocked,expanded_geometry_probes:expanded,best:{kind:bestKind,score:round(bestScore),utility:round(bestUtility),address:bestItem?.address??null,proposal:bestProposal,geometry:bestProposal.geometry},convergence:ai_context.convergence,ai_context,fullwave_handoff:{prepared:Boolean(tier2),job:tier2,truth:'PREPARED_NOT_SOLVED remains required until an authenticated Sovereign full-wave result receipt returns.'}};
 }
 function geometryMoves(parent,roundIndex){
  const g=parent.proposal.geometry,phase=parent.packet?.scalar_metrics?.phase_error_deg??180,fill=parent.packet?.scalar_metrics?.fill_fraction??0.5,step=Math.max(1,3-roundIndex);
  const pitchStep=4*step,widthStep=3*step,lengthStep=5*step,heightStep=7*step;
  const raw=[
   {...g,pitch_nm:Number(g.pitch_nm)-pitchStep},{...g,pitch_nm:Number(g.pitch_nm)+pitchStep},
   {...g,width_nm:Number(g.width_nm)-widthStep},{...g,width_nm:Number(g.width_nm)+widthStep},
   {...g,length_nm:Number(g.length_nm)-lengthStep},{...g,length_nm:Number(g.length_nm)+lengthStep},
   {...g,height_nm:Number(g.height_nm)-heightStep},{...g,height_nm:Number(g.height_nm)+heightStep}
  ];
  if(Number(phase)>45)raw.push({...g,height_nm:Number(g.height_nm)-2*heightStep},{...g,height_nm:Number(g.height_nm)+2*heightStep});
  if(Number(fill)>0.55)raw.push({...g,width_nm:Number(g.width_nm)-widthStep,length_nm:Number(g.length_nm)-lengthStep});
  else raw.push({...g,width_nm:Number(g.width_nm)+widthStep,length_nm:Number(g.length_nm)+lengthStep});
  return uniqueBy(raw.map(normalizeGeometry).filter(validGeometry),geometryKey);
 }
 async function adaptiveCycle(call,callerId){
  const payload=call.payload&&typeof call.payload==='object'?call.payload:{};
  const rounds=clampInt(payload.rounds,1,6,4),beamWidth=clampInt(payload.beam_width,1,8,4),maxEvaluations=clampInt(payload.max_evaluations,32,384,256);
  const requestedBudget=clampInt(payload.budget,8,256,128),refineBudget=Math.min(requestedBudget,Math.max(8,maxEvaluations-16));
  const first=await adaptiveRefine({...call,payload:{...payload,radius:clampInt(payload.radius,1,3,1),budget:refineBudget}},callerId);
  let evaluations=first.neighbors_count+first.expanded_geometry_probes.length,best=null;
  if(first.best.kind==='boundary_extrapolation')best=first.expanded_geometry_probes.find(x=>x.ok&&geometryKey(x.proposal?.geometry)===geometryKey(first.best.proposal?.geometry))||null;
  else{best=await screenProposal(first.best.proposal);evaluations++}
  if(!best?.ok)return{...first,cycle:{state:'SEED_SCREEN_FAILED',rounds_completed:0,evaluations,max_evaluations:maxEvaluations,trace:[]}};
  let beam=[best],trace=[{round:0,source:first.best.kind,score:round(best.score),utility:round(best.utility),gate:best.gate,geometry:best.proposal.geometry}],stagnant=0;
  for(let roundIndex=1;roundIndex<=rounds&&evaluations<maxEvaluations;roundIndex++){
   const candidates=[];
   for(const parent of beam){
    for(const geometry of geometryMoves(parent,roundIndex)){
     if(evaluations>=maxEvaluations)break;
     const proposal={...parent.proposal,packet_id:`r1532_cycle_${roundIndex}_${evaluations}`,source_sha:`r1532_cycle_${roundIndex}_${evaluations}`,geometry,lineage:[...(parent.proposal.lineage||[]),`adaptive-cycle:round:${roundIndex}`]};
     candidates.push(await screenProposal(proposal));evaluations++;
    }
    if(evaluations>=maxEvaluations)break;
   }
   const ranked=uniqueBy(candidates.filter(x=>x.ok),x=>geometryKey(x.proposal.geometry)).sort((a,b)=>b.utility-a.utility||b.score-a.score).slice(0,beamWidth);
   if(!ranked.length)break;
   beam=ranked;
   const leader=beam[0],delta=leader.utility-best.utility;
   if(delta>1e-7){best=leader;stagnant=0}else stagnant++;
   trace.push({round:roundIndex,score:round(leader.score),utility:round(leader.utility),delta_utility:round(delta,9),gate:leader.gate,continuity:round(leader.continuity),contradiction:round(leader.contradiction),burden:round(leader.burden),geometry:leader.proposal.geometry});
   if(stagnant>=2)break;
  }
  const convergence=trace.length>1&&Math.abs(trace.at(-1).utility-trace.at(-2).utility)<1e-5?'CONVERGED':'BOUNDED_STOP';
  const handoff=best.tier2_job?{prepared:true,job:best.tier2_job}:{prepared:false,job:null};
  return{...first,best:{...first.best,kind:'adaptive_cycle',origin:first.best.kind,score:round(best.score),utility:round(best.utility),address:first.best.address,proposal:best.proposal,geometry:best.proposal.geometry},cycle:{schema:'OMEGA_ADAPTIVE_CYCLE_R1532',state:convergence,rounds_requested:rounds,rounds_completed:trace.length-1,evaluations,max_evaluations:maxEvaluations,beam_width:beamWidth,trace,final:{score:round(best.score),utility:round(best.utility),gate:best.gate,continuity:round(best.continuity),contradiction:round(best.contradiction),burden:round(best.burden),geometry:best.proposal.geometry},next_action:handoff.prepared?'validate_final_candidate_with_authenticated_fullwave_solver':convergence==='CONVERGED'?'shift_wavelength_or_expand_design_family':'continue_bounded_cycle_with_new_budget'},ai_context:{...first.ai_context,observation:`Closed-loop search completed ${trace.length-1} geometry rounds after atlas/boundary refinement; final scalar score ${round(best.score)} and utility ${round(best.utility)}.`,convergence:{...first.ai_context.convergence,cycle_state:convergence,rounds_completed:trace.length-1,evaluations,final_score:round(best.score),final_utility:round(best.utility)},next_action:handoff.prepared?'validate_final_candidate_with_authenticated_fullwave_solver':convergence==='CONVERGED'?'shift_wavelength_or_expand_design_family':'continue_bounded_cycle_with_new_budget'},fullwave_handoff:{prepared:handoff.prepared,job:handoff.job,truth:'PREPARED_NOT_SOLVED remains required until an authenticated Sovereign full-wave result receipt returns.'}};
 }
 async function makeReceipt(call,callerId,operation){
  const requestSha=await sha256({schema:call.schema,caller:{id:callerId,kind:String(call.caller?.kind||'ai-agent')},operation,payload:call.payload||{},request_id:call.request_id||null,goal:String(call.goal||'').slice(0,600),tool_version:R1532_TOOL_VERSION});
  return{schema:R1532_RECEIPT_SCHEMA,receipt_id:`omega_tool_${requestSha.slice(0,24)}`,request_sha256:requestSha,tool:R1532_TOOL_NAME,tool_version:R1532_TOOL_VERSION,service,authority:R1532_TOOL_AUTHORITY,operation,caller:{id:callerId,kind:String(call.caller?.kind||'ai-agent')},request_id:String(call.request_id||'').slice(0,160)||null,returned_at:new Date().toISOString(),canonical_mutation:false,side_effects:'none',truth_boundary:truthBoundary};
 }
 function descriptor(origin=''){
  const d=base.descriptor(origin),operations={...d.operations,adaptive_refine:adaptiveDef,adaptive_cycle:cycleDef};
  return{...d,version:R1532_TOOL_VERSION,operations,call_schema:{...d.call_schema,properties:{...d.call_schema.properties,operation:{type:'string',enum:Object.keys(operations)}}},transport:{...d.transport,insight:`${origin}/api/tool/insight`,cycle:`${origin}/api/tool/cycle`},interpretation:'R153.2 extends an AI session with deterministic optical search, constraint-aware boundary escape, bounded proof-guided beam optimization, compact reasoning packets, and proof-gated full-wave handoff planning. It does not modify model weights, expose hidden reasoning, execute arbitrary code, or grant canonical authority.'};
 }
 function probe(origin=''){
  const p=base.probe(origin);return{...p,version:R1532_TOOL_VERSION,ready:{...p.ready,adaptive_refine:true,adaptive_cycle:true},insight:`${origin}/api/tool/insight`,cycle:`${origin}/api/tool/cycle`,limits:{adaptive_rounds:6,adaptive_evaluations:384},live_evidence_basis:{r1531_rank_top:{address:1698,gate:'STAY',scalar_focus:0.795603,continuity:0.863307,contradiction:0.075669},interpretation:'R153.2 was derived from live R153.1 evidence: winner 1698 lies on d:low and p:high boundaries, requiring coupled constraint-preserving refinement rather than blind fixed-window ranking.'}};
 }
 function openapi(origin=''){
  const o=base.openapi(origin),d=descriptor(origin);o.info={...o.info,version:R1532_TOOL_VERSION,description:'Bounded deterministic optical computation with constraint-aware adaptive refinement, closed-loop beam optimization, hashed receipts, and explicit SCREEN_ONLY truth boundaries.'};o.paths['/api/tool/invoke'].post.requestBody.content['application/json'].schema=d.call_schema;o.paths['/api/tool/insight']={get:{summary:'Run one adaptive refinement step from query parameters',responses:{'200':{description:'Adaptive reasoning packet and proof-gated handoff plan'}}}};o.paths['/api/tool/cycle']={get:{summary:'Run a bounded closed-loop adaptive search from query parameters',responses:{'200':{description:'Adaptive cycle trace and proof-gated handoff plan'}}}};o['x-omega-tool-version']=R1532_TOOL_VERSION;return o;
 }
 async function invoke(call){
  if(!['adaptive_refine','adaptive_cycle'].includes(call?.operation)){
   const delegated=await base.invoke(call);if(!delegated.ok)return delegated;
   delegated.body.receipt={...(delegated.body.receipt||{}),tool_version:R1532_TOOL_VERSION,base_tool_version:'R153.1'};
   delegated.body.tool_upgrade={version:R1532_TOOL_VERSION,adaptive_refine_available:true,adaptive_cycle_available:true};
   return delegated;
  }
  if(!call||call.schema!==R1532_TOOL_SCHEMA)return{ok:false,status:400,body:{ok:false,code:'OMEGA_EXTERNAL_TOOL_SCHEMA_REQUIRED',expected:R1532_TOOL_SCHEMA}};
  const callerId=String(call.caller?.id||'').replace(/[\r\n\t]+/g,' ').slice(0,120);if(!callerId)return{ok:false,status:400,body:{ok:false,code:'CALLER_ID_REQUIRED'}};
  const operation=call.operation,result=operation==='adaptive_cycle'?await adaptiveCycle(call,callerId):await adaptiveRefine(call,callerId),receipt=await makeReceipt(call,callerId,operation);
  return{ok:true,status:200,body:{ok:true,schema:'OMEGA_EXTERNAL_TOOL_RESPONSE_v1',receipt,result,decision_support:{next_action:result.ai_context?.next_action||result.cycle?.next_action||'inspect_or_refine',evidence_class:'REDUCED_ORDER_SCREEN',confidence_class:'SCREENING_ONLY',residuals:[...residuals]}}};
 }
 return{descriptor,probe,openapi,invoke};
}
