import {SWARM_CELL_COUNT,SWARM_LANE_COUNT,compactPlanR121,planMissionR121} from './swarmCoreR121.js';
import {resultDigestR1012,MAX_RESULT_JSON_R1012} from '../sphereResultBytesR1012.mjs';
import {SWARM_MODEL_R121} from './swarmCellR121.js';

const ACTIVE_R1011=new Set(['QUEUED','RUNNING']);
const MAX_INDEXED_MISSIONS_R1011=48;
const clip=(v,n=12000)=>String(v??'').trim().slice(0,n);
const json=(v,s=200)=>new Response(JSON.stringify(v,null,2),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-swarm-runtime':'R121'}});
async function digest(v){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(v)));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function modelText(r){if(typeof r==='string')return r;if(typeof r?.response==='string')return r.response;if(typeof r?.result?.response==='string')return r.result.response;return typeof r?.choices?.[0]?.message?.content==='string'?r.choices[0].message.content:''}
function publicMission(m){if(!m)return null;const {pending,inFlight,providerOutputs,providerReservedCells,...rest}=m;return{...rest,pendingCount:Array.isArray(pending)?pending.length:0,inFlightCount:Array.isArray(inFlight)?inFlight.length:0,progress:m.total?Math.round(((m.completed+m.failed)/m.total)*1000)/10:0,providerOutputCount:Array.isArray(providerOutputs)?providerOutputs.length:0}}

export class OmegaSwarmCoordinator{
 constructor(state,env){this.storage=state.storage;this.env=env;this.processing=new Map();this.saveTail=Promise.resolve()}
 async ids(){return(await this.storage.get('mission_ids'))||[]}
 async get(id){return this.storage.get(`mission:${id}`)}
 // R1011: admission cannot evict an unfinished mission. Serialize index writes
 // and atomically publish a new mission with its discoverable durable index.
 async save(m,archiveRows=[],admission=false){
  const run=this.saveTail.then(async()=>{
   const ids=await this.ids();
   if(ids.includes(m.id)){
    if(archiveRows.length){
     if(archiveRows.length>24)throw Error('ARCHIVE_BATCH_LIMIT');
     const entries={[`mission:${m.id}`]:m};
     for(const row of archiveRows)entries[`mission-result:${m.id}:${row.ordinal}`]=row;
     await this.storage.put(entries);
    }else await this.storage.put(`mission:${m.id}`,m);
    return m
   }
   const active=[],terminal=[];
   for(const id of ids){
    const stored=await this.get(id);
    (stored&&ACTIVE_R1011.has(stored.status)?active:terminal).push(id);
   }
   if(active.length>=MAX_INDEXED_MISSIONS_R1011)throw Error('MISSION_QUEUE_CAPACITY_REACHED');
   const retain=new Set([...active,...terminal.slice(0,MAX_INDEXED_MISSIONS_R1011-1-active.length)]);
   // R1023: arm recovery before publishing a newly admitted mission. If the
   // alarm write fails, no mission is published. Preserve an earlier wakeup.
   if(admission){const existing=await this.storage.getAlarm();const next=Date.now()+100;if(existing===null||existing>next)await this.storage.setAlarm(next)}
   // Terminal mission records remain retrievable by ID; only the bounded index rotates.
   await this.storage.put({[`mission:${m.id}`]:m,mission_ids:[m.id,...ids.filter(id=>retain.has(id))]});
   return m;
  });
  this.saveTail=run.catch(()=>{});
  return run;
 }
 executor(cell,mission){if(cell.profile.domainRole==='PHYSICS'&&cell.profile.phaseRole==='EXECUTE')return'OPTICAL_CHAIN';if(cell.profile.domainRole==='ORCHESTRATION'&&cell.profile.phaseRole==='FRAME')return'GENESIS';if(cell.providerEligible&&mission.providerBudget>0&&(!Array.isArray(mission.providerReservedCells)||mission.providerReservedCells.includes(cell.id)))return'WORKERS_AI';return'DETERMINISTIC'}
 async dispatch(mission,cell){const id=this.env.OMEGA_SWARM_CELL.idFromName(cell.id),stub=this.env.OMEGA_SWARM_CELL.get(id),executor=this.executor(cell,mission),task={schema:'OMEGA_SWARM_TASK_R121',missionId:mission.id,taskId:`${mission.id}:${cell.order}`,cellId:cell.id,index:cell.index,lane:cell.lane,intent:mission.intent,mode:mission.mode,executor,lineage:[`omega-v6:swarm:${mission.id}`,`organ:${cell.profile.domainRole}`,`branch:${cell.profile.phaseRole}`,`cell:${cell.id}`]};const r=await stub.fetch(new Request('https://swarm-cell.internal/task',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(task)}));const data=await r.json().catch(()=>null);
 if(!r.ok)return{cell,executor,ok:false,status:r.status,data};
 const reject=(error,status=502)=>({cell,executor,ok:false,status,data:{error}});
 const receipt=data?.receipt,result=data?.result;
 if(data?.ok!==true||!receipt||receipt.schema!=='OMEGA_SWARM_CELL_RECEIPT_R121'||receipt.taskId!==task.taskId||receipt.missionId!==mission.id||receipt.cellId!==cell.id||receipt.index!==cell.index||receipt.lane!==cell.lane||receipt.executor!==executor||receipt.canonicalMutation!==false||!result||typeof result.kind!=='string'||typeof receipt.resultSha256!=='string'||!/^[a-f0-9]{64}$/.test(receipt.resultSha256))return reject('R1012_CELL_RECEIPT_IDENTITY_INVALID');
 const bytes=JSON.stringify(result);
 if(await resultDigestR1012(bytes)!==receipt.resultSha256)return reject('R1012_CELL_RESULT_DIGEST_MISMATCH');
 if(['PROVIDER_GATED','SERVICE_GATED','OPTICAL_CHAIN_FAILED'].includes(result.kind)||result.ok===false)return reject('R1012_EXECUTOR_UNAVAILABLE_OR_FAILED: '+clip(result.summary||result.kind,900),424);
 return{cell,executor,ok:true,status:r.status,data,...(executor==='DETERMINISTIC'&&result.kind==='DETERMINISTIC_CELL_ANALYSIS'&&bytes.length<=MAX_RESULT_JSON_R1012?{resultJson:bytes}:{})}}
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
  const row={cellId:x.cell.id,index:x.cell.index,organ:x.cell.profile.domainRole,phase:x.cell.profile.phaseRole,executor:x.executor,ok:x.ok,status:x.status,summary,receiptSha:x.data?.receipt?.resultSha256||null,};
  const payload=typeof x.resultJson==='string'?{resultJson:x.resultJson}:{};
  m.recent.unshift(m.total<=12?{...row,...payload}:row);
  m.recent=m.recent.slice(0,36);
  if(x.executor==='WORKERS_AI'&&x.ok&&summary)m.providerOutputs.push({cellId:x.cell.id,role:x.cell.profile.domainRole,summary});
  m.providerOutputs=m.providerOutputs.slice(0,12);
  return {...row,...payload,ordinal:m.completed+m.failed-1};
 }
 // R1014: archive each accounted return with the same atomic storage write
 // as its mission counters. Legacy gaps are disclosed, never reconstructed.
 async saveReturnsR1014(m,rows){
  if(!rows.length)return this.save(m);
  const first=rows[0].ordinal;
  if(m.archiveStart===undefined){m.archiveStart=first;m.archivedCount=0}
  if(m.archiveStart+m.archivedCount!==first||rows.some((row,i)=>row.ordinal!==first+i))throw Error('ARCHIVE_CONTINUITY_UNPROVED');
  m.archivedCount+=rows.length;
  return this.save(m,rows);
 }
 async resultPageR1014(id,params){
  const m=await this.get(id);
  if(!m)return json({ok:false,code:'MISSION_NOT_FOUND'},404);
  const accounted=m.completed+m.failed,start=m.archiveStart??accounted,count=m.archivedCount??0;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(count)||start<0||count<0||start+count!==accounted)return json({ok:false,code:'ARCHIVE_CONTINUITY_UNPROVED'},409);
  const rawOffset=params.get('offset')??String(start),rawLimit=params.get('limit')??'24';
  if(!/^\d+$/.test(rawOffset)||!/^\d+$/.test(rawLimit))return json({ok:false,code:'INVALID_RESULT_PAGE'},400);
  const offset=Number(rawOffset),limit=Number(rawLimit);
  if(!Number.isSafeInteger(offset)||offset<start||offset>accounted||!Number.isSafeInteger(limit)||limit<1||limit>24)return json({ok:false,code:'INVALID_RESULT_PAGE'},400);
  const end=Math.min(accounted,offset+limit);
  const rows=await Promise.all(Array.from({length:end-offset},(_,i)=>this.storage.get(`mission-result:${id}:${offset+i}`)));
  if(rows.some((row,i)=>!row||row.ordinal!==offset+i))return json({ok:false,code:'ARCHIVE_RECORD_MISSING'},409);
  return json({ok:true,schema:'OMEGA_R121_RESULT_PAGE_R1014',missionId:id,archiveStart:start,archivedCount:count,accounted,planned:m.total,offset,rows,nextOffset:end<accounted?end:null,authority:'COORDINATOR_REPORTED_NOT_INDEPENDENTLY_VERIFIED',canonicalMutation:false});
 }
 async processOnce(id){
  let m=await this.get(id);
  if(!m||!['QUEUED','RUNNING'].includes(m.status))return m;
  // Arm recovery before changing the durable queue.
  await this.storage.setAlarm(Date.now()+30000);
  // R1016: a reserved synthesis from an earlier coordinator instance has an
  // uncertain external outcome. Close it without spending another model call.
  if(m.synthesisState==='IN_FLIGHT'){
   if(m.pending.length||m.inFlight?.length||m.completed+m.failed!==m.total){
    m.status='FAILED';m.proofState='SYNTHESIS_CONTINUITY_UNPROVED';
   }else{m.status=m.completed?'COMPLETE':'FAILED';m.proofState='RETURNED_NOT_ADMITTED'}
   m.synthesisState='OUTCOME_UNKNOWN';
   m.finalSynthesis={provider:'NOT_CONFIRMED',text:'Synthesis interrupted; outcome unknown. No automatic replay. Cell returns remain available.',authority:'NO_RESULT_FABRICATED'};
   m.completedAt=Date.now();return this.save(m);
  }
  const interrupted=Array.isArray(m.inFlight)?m.inFlight:[];
  if(interrupted.length){
   const rows=interrupted.map(cell=>this.recordCellReturn(m,{cell,executor:'UNKNOWN',ok:false,status:503,data:{error:'Execution outcome unknown after coordinator interruption; not replayed.'}}));
   m.inFlight=[];m.interruptedCells=(m.interruptedCells||0)+interrupted.length;
   await this.saveReturnsR1014(m,rows);
  }
  // Legacy records may have lost a batch before this version persisted inFlight.
  const missing=m.total-m.completed-m.failed-m.pending.length;
  if(missing!==0){
   m.status='FAILED';m.proofState='QUEUE_CONTINUITY_UNPROVED';m.unaccountedCells=missing;
   return this.save(m);
  }
  const binding=Boolean(this.env?.OMEGA_SWARM_CELL);
  if(!binding&&m.pending.length){
   const rows=m.pending.splice(0,24).map(cell=>this.recordCellReturn(m,{cell,executor:'UNKNOWN',ok:false,status:503,data:{error:'Cell binding unavailable; task not dispatched.'}}));
   m.proofState='CELL_BINDING_UNAVAILABLE';
   if(m.pending.length){m.status='RUNNING';await this.saveReturnsR1014(m,rows);await this.storage.setAlarm(Date.now()+500);return m}
   m.status=m.completed?'COMPLETE':'FAILED';m.completedAt=Date.now();return this.saveReturnsR1014(m,rows);
  }
  const n=m.mode==='PIPELINE'?1:Math.min(24,m.pending.length);
  const batch=m.pending.splice(0,n);
  m.status='RUNNING';m.startedAt=m.startedAt||Date.now();m.inFlight=batch;
  // Reserve provider calls durably before dispatch, including uncertain outcomes.
  // Unknown historical consumption is treated as exhausted, not zero.
  if(!Number.isSafeInteger(m.providerAttempts)||m.providerAttempts<0)m.providerAttempts=m.providerBudget;
  const remaining=Math.max(0,m.providerBudget-m.providerAttempts);
  m.providerReservedCells=batch.filter(cell=>cell.providerEligible&&!(cell.profile.domainRole==='PHYSICS'&&cell.profile.phaseRole==='EXECUTE')&&!(cell.profile.domainRole==='ORCHESTRATION'&&cell.profile.phaseRole==='FRAME')).slice(0,remaining).map(cell=>cell.id);
  m.providerAttempts+=m.providerReservedCells.length;
  await this.save(m);
  const results=await Promise.all(batch.map(cell=>this.dispatch(m,cell).catch(error=>({cell,executor:'UNKNOWN',ok:false,status:500,data:{error:error instanceof Error?error.message:String(error)}}))));
  const rows=results.map(x=>this.recordCellReturn(m,x));
  m.inFlight=[];m.providerReservedCells=[];
  // Persist completed work and archive records before any optional provider request.
  await this.saveReturnsR1014(m,rows);
  if(m.pending.length){await this.storage.setAlarm(Date.now()+500);return m}
  m.proofState='RETURNED_NOT_ADMITTED';
  // Remain RUNNING until optional synthesis returns, keeping existing clients
  // polling. Persist the reservation before any provider call.
  const synthAllowed=m.providerOutputs.length&&this.env?.AI&&m.providerAttempts<m.providerBudget;
  if(synthAllowed){
   m.providerAttempts++;
   m.synthesisState='IN_FLIGHT';
   m.finalSynthesis={provider:'NOT_CONFIRMED',text:'Synthesis in progress; cell receipts remain available.',authority:'NO_RESULT_FABRICATED'};
   await this.save(m);
  }
  if(synthAllowed){try{const contributions=m.providerOutputs.map(x=>`[${x.cellId} ${x.role}] ${x.summary}`).join('\n\n').slice(0,16000),r=await this.env.AI.run(SWARM_MODEL_R121,{messages:[{role:'system',content:'Reconverge bounded OMEGA swarm contributions into one concise mission result. Preserve contradictions and unresolved items. Do not convert interpretation into measurement, native execution, external evidence, or CanonState.'},{role:'user',content:`MISSION: ${m.intent}\n\nCONTRIBUTIONS:\n${contributions}`}],max_tokens:700,temperature:.22,chat_template_kwargs:{enable_thinking:false}}),text=modelText(r);if(!text)throw Error('EMPTY_SYNTHESIS_RESULT');m.finalSynthesis={provider:SWARM_MODEL_R121,text:text.slice(0,6000),authority:'MODEL_SYNTHESIS_NOT_CANON'};m.synthesisState='RETURNED'}catch(error){m.finalSynthesis={provider:'FAILED',text:clip(error instanceof Error?error.message:String(error),1200),authority:'NO_RESULT_FABRICATED'};m.synthesisState='FAILED'}}else{m.synthesisState=m.providerOutputs.length?'NOT_REQUESTED_OR_BUDGET_EXHAUSTED':'NO_PROVIDER_CONTRIBUTIONS'}
  m.status=m.completed?'COMPLETE':'FAILED';m.completedAt=Date.now();return this.save(m)
 }
 async alarm(){for(const id of (await this.ids()).slice().reverse()){const m=await this.get(id);if(m&&['QUEUED','RUNNING'].includes(m.status)){await this.process(id);break}}for(const id of await this.ids()){const m=await this.get(id);if(m&&['QUEUED','RUNNING'].includes(m.status)){await this.storage.setAlarm(Date.now()+500);break}}}
 async fetch(request){const u=new URL(request.url),parts=u.pathname.split('/').filter(Boolean);if(request.method==='GET'&&u.pathname==='/status'){const missions=[];let active=0;const ids=await this.ids();for(const [i,id] of ids.entries()){const m=await this.get(id);if(m&&ACTIVE_R1011.has(m.status))active++;if(i<12&&m)missions.push(publicMission(m))}return json({ok:true,schema:'OMEGA_SWARM_STATUS_R121',runtimeRevision:'R121',cellCapacity:SWARM_CELL_COUNT,laneCapacity:SWARM_LANE_COUNT,active,missions,canonicalMutation:false})}if(request.method==='POST'&&u.pathname==='/missions'){try{const body=await request.json().catch(()=>({})),plan=planMissionR121(body),id=`swarm_${Date.now().toString(36)}_${crypto.randomUUID().replace(/-/g,'')}`,m={schema:'OMEGA_SWARM_MISSION_R121',id,status:'QUEUED',mode:plan.mode,intent:plan.intent,requestedCells:plan.requestedCells,providerBudget:plan.providerBudget,providerAttempts:0,createdAt:Date.now(),total:plan.selected.length,pending:[...plan.selected],inFlight:[],archiveStart:0,archivedCount:0,completed:0,failed:0,organCounts:plan.organCounts,organProcessed:Array(12).fill(0),recent:[],providerOutputs:[],truthBoundary:plan.truthBoundary,proofState:'QUEUED_NOT_ADMITTED',canonicalMutation:false};await this.save(m,[],true);return json({ok:true,mission:publicMission(m),plan:compactPlanR121(plan)},202)}catch(error){return json({ok:false,code:error instanceof Error?error.message:'MISSION_INVALID'},error?.message==='MISSION_QUEUE_CAPACITY_REACHED'?429:400)}}if(parts[0]==='missions'&&parts[1]){const id=parts[1];if(request.method==='GET'&&parts.length===2){const m=await this.get(id);return json({ok:Boolean(m),mission:publicMission(m)},m?200:404)}if(request.method==='GET'&&parts.length===3&&parts[2]==='results')return this.resultPageR1014(decodeURIComponent(id),u.searchParams);if(request.method==='POST'&&parts[2]==='tick'){const m=await this.process(id);return json({ok:Boolean(m),mission:publicMission(m)},m?200:404)}}return json({ok:false,code:'NOT_FOUND'},404)}
}
