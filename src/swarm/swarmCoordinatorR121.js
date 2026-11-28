import {SWARM_CELL_COUNT,SWARM_LANE_COUNT,compactPlanR121,planMissionR121} from './swarmCoreR121.js';
import {SWARM_MODEL_R121} from './swarmCellR121.js';

const clip=(v,n=12000)=>String(v??'').trim().slice(0,n);
const json=(v,s=200)=>new Response(JSON.stringify(v,null,2),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-swarm-runtime':'R121'}});
async function digest(v){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v)));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function modelText(r){if(typeof r==='string')return r;if(typeof r?.response==='string')return r.response;if(typeof r?.result?.response==='string')return r.result.response;return typeof r?.choices?.[0]?.message?.content==='string'?r.choices[0].message.content:''}
function publicMission(m){if(!m)return null;const {pending,inFlight,providerOutputs,...rest}=m;return{...rest,pendingCount:Array.isArray(pending)?pending.length:0,inFlightCount:Array.isArray(inFlight)?inFlight.length:0,progress:m.total?Math.round(((m.completed+m.failed)/m.total)*1000)/10:0,providerOutputCount:Array.isArray(providerOutputs)?providerOutputs.length:0}}

export class OmegaSwarmCoordinator{
 constructor(state,env){this.storage=state.storage;this.env=env;this.processing=new Map()}
 async ids(){return(await this.storage.get('mission_ids'))||[]}
 async get(id){return this.storage.get(`mission:${id}`)}
 async save(m){await this.storage.put(`mission:${m.id}`,m);const ids=await this.ids();if(!ids.includes(m.id))await this.storage.put('mission_ids',[m.id,...ids].slice(0,48));return m}
 executor(cell,mission){if(cell.profile.domainRole==='PHYSICS'&&cell.profile.phaseRole==='EXECUTE')return'OPTICAL_CHAIN';if(cell.profile.domainRole==='ORCHESTRATION'&&cell.profile.phaseRole==='FRAME')return'GENESIS';if(cell.providerEligible&&mission.providerBudget>0)return'WORKERS_AI';return'DETERMINISTIC'}
 async dispatch(mission,cell){const id=this.env.OMEGA_SWARM_CELL.idFromName(cell.id),stub=this.env.OMEGA_SWARM_CELL.get(id),executor=this.executor(cell,mission),task={schema:'OMEGA_SWARM_TASK_R121',missionId:mission.id,taskId:`${mission.id}:${cell.order}`,cellId:cell.id,index:cell.index,lane:cell.lane,intent:mission.intent,mode:mission.mode,executor,lineage:[`omega-v6:swarm:${mission.id}`,`organ:${cell.profile.domainRole}`,`branch:${cell.profile.phaseRole}`,`cell:${cell.id}`]};const r=await stub.fetch(new Request('https://swarm-cell.internal/task',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(task)}));return{cell,executor,ok:r.ok,status:r.status,data:await r.json().catch(()=>null)}}
 // R1010: persist a batch before any external execution. An interrupted batch
 // is recorded as uncertain, never automatically repeated (provider side effects).
 async process(id){
  if(this.processing.has(id))return this.processing.get(id);
  const run=this.processOnce(id);
  this.processing.set(id,run);
  try{return await run}finally{this.processing.delete(id)}
 }
 recordCellReturn(m,x){
  m.completed+=x.ok?1:0;m.failed+=x.ok?0:1;
  m.organProcessed[x.cell.address.domain]=(m.organProcessed[x.cell.address.domain]||0)+1;
  const result=x.data?.result,summary=clip(result?.summary||result?.truthBoundary||x.data?.error||x.data?.code,1200);
  m.recent.unshift({cellId:x.cell.id,index:x.cell.index,organ:x.cell.profile.domainRole,phase:x.cell.profile.phaseRole,executor:x.executor,ok:x.ok,status:x.status,summary,receiptSha:x.data?.receipt?.resultSha256||null});
  m.recent=m.recent.slice(0,36);
  if(x.executor==='WORKERS_AI'&&x.ok&&summary)m.providerOutputs.push({cellId:x.cell.id,role:x.cell.profile.domainRole,summary});
  m.providerOutputs=m.providerOutputs.slice(0,12);
 }
 async processOnce(id){
  let m=await this.get(id);
  if(!m||!['QUEUED','RUNNING'].includes(m.status))return m;
  // Arm recovery before changing the durable queue.
  await this.storage.setAlarm(Date.now()+30000);
  const interrupted=Array.isArray(m.inFlight)?m.inFlight:[];
  if(interrupted.length){
   for(const cell of interrupted)this.recordCellReturn(m,{cell,executor:'UNKNOWN',ok:false,status:503,data:{error:'Execution outcome unknown after coordinator interruption; not replayed.'}});
   m.inFlight=[];m.interruptedCells=(m.interruptedCells||0)+interrupted.length;
   await this.save(m);
  }
  // Legacy records may have lost a batch before this version persisted inFlight.
  const missing=m.total-m.completed-m.failed-m.pending.length;
  if(missing!==0){
   m.status='FAILED';m.proofState='QUEUE_CONTINUITY_UNPROVED';m.unaccountedCells=missing;
   return this.save(m);
  }
  const binding=Boolean(this.env?.OMEGA_SWARM_CELL);
  if(!binding){
   for(const cell of m.pending)this.recordCellReturn(m,{cell,executor:'UNKNOWN',ok:false,status:503,data:{error:'Cell binding unavailable; task not dispatched.'}});
   m.pending=[];m.status='FAILED';m.proofState='CELL_BINDING_UNAVAILABLE';m.completedAt=Date.now();return this.save(m);
  }
  const n=m.mode==='PIPELINE'?1:Math.min(24,m.pending.length);
  const batch=m.pending.splice(0,n);
  m.status='RUNNING';m.startedAt=m.startedAt||Date.now();m.inFlight=batch;
  await this.save(m);
  const results=await Promise.all(batch.map(cell=>this.dispatch(m,cell).catch(error=>({cell,executor:'UNKNOWN',ok:false,status:500,data:{error:error instanceof Error?error.message:String(error)}}))));
  for(const x of results)this.recordCellReturn(m,x);
  m.inFlight=[];
  // Persist completed work before any optional reconvergence provider request.
  await this.save(m);
  if(m.pending.length){await this.storage.setAlarm(Date.now()+500);return m}
  m.status=m.completed?'COMPLETE':'FAILED';m.completedAt=Date.now();m.proofState='RETURNED_NOT_ADMITTED';
  // Do not repeat a synthesis call after an interruption. Commit the terminal
  // cell state and an explicit synthesis-pending marker before invoking it.
  if(m.providerOutputs.length&&this.env?.AI){
   m.finalSynthesis={provider:'NOT_CONFIRMED',text:'Synthesis outcome not confirmed; cell receipts remain available.',authority:'NO_RESULT_FABRICATED'};
   await this.save(m);
  }
  if(m.providerOutputs.length&&this.env?.AI){try{const contributions=m.providerOutputs.map(x=>`[${x.cellId} ${x.role}] ${x.summary}`).join('\n\n').slice(0,16000),r=await this.env.AI.run(SWARM_MODEL_R121,{messages:[{role:'system',content:'Reconverge bounded OMEGA swarm contributions into one concise mission result. Preserve contradictions and unresolved items. Do not convert interpretation into measurement, native execution, external evidence, or CanonState.'},{role:'user',content:`MISSION: ${m.intent}\n\nCONTRIBUTIONS:\n${contributions}`}],max_tokens:700,temperature:.22,chat_template_kwargs:{enable_thinking:false}}),text=modelText(r);if(text)m.finalSynthesis={provider:SWARM_MODEL_R121,text:text.slice(0,6000),authority:'MODEL_SYNTHESIS_NOT_CANON'}}catch(error){m.finalSynthesis={provider:'FAILED',text:error instanceof Error?error.message:String(error),authority:'NO_RESULT_FABRICATED'}}}return this.save(m)
 }
 async alarm(){for(const id of await this.ids()){const m=await this.get(id);if(m&&['QUEUED','RUNNING'].includes(m.status)){await this.process(id);break}}for(const id of await this.ids()){const m=await this.get(id);if(m&&['QUEUED','RUNNING'].includes(m.status)){await this.storage.setAlarm(Date.now()+500);break}}}
 async fetch(request){const u=new URL(request.url),parts=u.pathname.split('/').filter(Boolean);if(request.method==='GET'&&u.pathname==='/status'){const missions=[];for(const id of(await this.ids()).slice(0,12))missions.push(publicMission(await this.get(id)));return json({ok:true,schema:'OMEGA_SWARM_STATUS_R121',runtimeRevision:'R121',cellCapacity:SWARM_CELL_COUNT,laneCapacity:SWARM_LANE_COUNT,active:missions.filter(x=>x&&['QUEUED','RUNNING'].includes(x.status)).length,missions:missions.filter(Boolean),canonicalMutation:false})}if(request.method==='POST'&&u.pathname==='/missions'){try{const body=await request.json().catch(()=>({})),plan=planMissionR121(body),id=`swarm_${Date.now().toString(36)}_${(await digest(`${plan.intent}|${Date.now()}|${plan.seed}`)).slice(0,12)}`,m={schema:'OMEGA_SWARM_MISSION_R121',id,status:'QUEUED',mode:plan.mode,intent:plan.intent,requestedCells:plan.requestedCells,providerBudget:plan.providerBudget,createdAt:Date.now(),total:plan.selected.length,pending:[...plan.selected],inFlight:[],completed:0,failed:0,organCounts:plan.organCounts,organProcessed:Array(12).fill(0),recent:[],providerOutputs:[],truthBoundary:plan.truthBoundary,proofState:'QUEUED_NOT_ADMITTED',canonicalMutation:false};await this.save(m);await this.storage.setAlarm(Date.now()+100);return json({ok:true,mission:publicMission(m),plan:compactPlanR121(plan)},202)}catch(error){return json({ok:false,code:error instanceof Error?error.message:'MISSION_INVALID'},400)}}if(parts[0]==='missions'&&parts[1]){const id=parts[1];if(request.method==='GET'&&parts.length===2){const m=await this.get(id);return json({ok:Boolean(m),mission:publicMission(m)},m?200:404)}if(request.method==='POST'&&parts[2]==='tick'){const m=await this.process(id);return json({ok:Boolean(m),mission:publicMission(m)},m?200:404)}}return json({ok:false,code:'NOT_FOUND'},404)}
}
