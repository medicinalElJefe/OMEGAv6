export const WORLD_REVISION='R125';
export const WORLD_ROOT_ID='omega-world-root-r125';
export const WORLD_LAW='ONE CANONICAL WORLD / MANY LAWFUL PROJECTIONS / PERSISTENT CAUSAL PATH';

const MAX_EVENTS=256;
const MAX_PUBLIC_BODY_BYTES=131072;
const MAX_PAYLOAD_BYTES=65536;
const clip=(v,n=12000)=>String(v??'').trim().slice(0,n);
const clamp01=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const clampAddress=v=>Math.max(0,Math.min(20735,Math.trunc(Number(v)||0)));
const now=()=>Date.now();
const json=(v,s=200)=>new Response(JSON.stringify(v,null,2),{status:s,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-world-runtime':WORLD_REVISION}});

async function sha(v){
 const bytes=new TextEncoder().encode(typeof v==='string'?v:JSON.stringify(v));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function addressFrames(address){
 const a=clampAddress(address);
 return{address:a,root12:Math.floor(a/1728),band144:Math.floor(a/144),cell1728:Math.floor(a/12),state20736:a,d:Math.floor(a/1728),p:Math.floor(a/144)%12,r:Math.floor(a/12)%12,l:a%12};
}
function metrics(input={}){
 return{continuity:clamp01(input.continuity),plasticity:clamp01(input.plasticity),contradiction:clamp01(input.contradiction),burden:clamp01(input.burden),evidence:clamp01(input.evidence),uncertainty:clamp01(input.uncertainty??1),scar:clamp01(input.scar)};
}
function boundedPayload(value){
 if(value==null)return null;
 try{
  const encoded=JSON.stringify(value);
  if(new TextEncoder().encode(encoded).byteLength>MAX_PAYLOAD_BYTES)return{truncated:true,reason:'PAYLOAD_EXCEEDED_64_KIB',sha256Pending:false};
  return JSON.parse(encoded);
 }catch{return{truncated:true,reason:'PAYLOAD_NOT_JSON_SERIALIZABLE'};}
}
function emptyCanonical(){
 return{version:0,address:0,addressFrames:addressFrames(0),host:'OMEGA_CANON',geometry:null,material:null,radiance:null,velocity:null,metrics:metrics({uncertainty:1}),evidenceRefs:[],sourceRefs:[],proofRefs:[],scarHead:null,time:{event:0,receive:0,compute:0,logical:0},authority:'CANONICAL_EMPTY_GENESIS',truthBoundary:'An empty canonical world is a durable identity container, not a claim that an observed physical world has been reconstructed.'};
}
function normalizePacket(input={},authority='RETURNED_NOT_ADMITTED'){
 const address=clampAddress(input.address);
 return{
  schema:'OMEGA_WORLD_PACKET_R125',host:clip(input.host||'UNTYPED',80),kind:clip(input.kind||'PROPOSAL',80),address,addressFrames:addressFrames(address),observerId:clip(input.observerId||'OMEGA_OPERATOR',120),projection:clip(input.projection||'FIELD',80),
  metrics:metrics(input.metrics||{}),geometry:boundedPayload(input.geometry),material:boundedPayload(input.material),radiance:boundedPayload(input.radiance),velocity:boundedPayload(input.velocity),
  evidenceRefs:(Array.isArray(input.evidenceRefs)?input.evidenceRefs:[]).slice(0,32).map(x=>clip(x,220)),sourceRefs:(Array.isArray(input.sourceRefs)?input.sourceRefs:[]).slice(0,32).map(x=>clip(x,500)),proofRefs:(Array.isArray(input.proofRefs)?input.proofRefs:[]).slice(0,32).map(x=>clip(x,220)),
  payload:boundedPayload(input.payload),summary:clip(input.summary,3000),dedupeKey:clip(input.dedupeKey,220)||null,createdAt:Number(input.createdAt)||now(),authority,canonicalMutation:false,
  truthBoundary:clip(input.truthBoundary||'This packet is retained with lineage but does not mutate CanonState until a separate proof-gated admission succeeds.',1000)
 };
}
async function parsePublicJson(request){
 const length=Number(request.headers.get('content-length')||0);
 if(length>MAX_PUBLIC_BODY_BYTES)return{ok:false,code:'WORLD_PACKET_TOO_LARGE'};
 const text=await request.text();
 if(new TextEncoder().encode(text).byteLength>MAX_PUBLIC_BODY_BYTES)return{ok:false,code:'WORLD_PACKET_TOO_LARGE'};
 try{return{ok:true,value:text?JSON.parse(text):{}}}catch{return{ok:false,code:'INVALID_JSON'}}
}

export class OmegaWorldState{
 constructor(state,env){this.storage=state.storage;this.env=env;}
 async ensure(){
  let snapshot=await this.storage.get('snapshot');
  if(!snapshot){
   snapshot={schema:'OMEGA_PERSISTENT_WORLD_R125',runtimeRevision:WORLD_REVISION,worldLaw:WORLD_LAW,canonical:emptyCanonical(),ledger:{eventCount:0,head:null,pending:0,admitted:0,rejected:0,lastEventAt:null},createdAt:now(),updatedAt:now(),truthBoundary:'Canonical state, returned evidence, unadmitted proposals, observer projections and proof receipts are distinct durable roles.'};
   await this.storage.put('snapshot',snapshot);await this.storage.put('events',[]);
  }
  return snapshot;
 }
 async events(){return(await this.storage.get('events'))||[];}
 async append(type,packet,extra={}){
  const snapshot=await this.ensure(),events=await this.events();
  if(packet?.dedupeKey){const prior=events.find(e=>e.packet?.dedupeKey===packet.dedupeKey);if(prior)return{event:prior,snapshot,deduped:true};}
  const seq=Number(snapshot.ledger?.eventCount||0)+1,previousHash=snapshot.ledger?.head||'GENESIS';
  const eventBase={schema:'OMEGA_WORLD_EVENT_R125',seq,type,packet,previousHash,createdAt:now(),...extra};
  const hash=await sha(eventBase),event={...eventBase,hash};events.push(event);
  const kept=events.slice(-MAX_EVENTS),pending=kept.filter(e=>!['ADMITTED','REJECTED'].includes(e.type)).length;
  const next={...snapshot,updatedAt:event.createdAt,ledger:{eventCount:seq,head:hash,pending,admitted:Number(snapshot.ledger?.admitted||0)+(type==='ADMITTED'?1:0),rejected:Number(snapshot.ledger?.rejected||0)+(type==='REJECTED'?1:0),lastEventAt:event.createdAt}};
  await this.storage.put('events',kept);await this.storage.put('snapshot',next);return{event,snapshot:next,deduped:false};
 }
 async propose(body){const packet=normalizePacket(body,'RETURNED_NOT_ADMITTED'),out=await this.append('PROPOSAL',packet);return{ok:true,schema:'OMEGA_WORLD_PROPOSAL_RECEIPT_R125',event:out.event,world:out.snapshot,canonicalMutation:false,deduped:out.deduped};}
 async observe(body){const packet=normalizePacket({...body,kind:body?.kind||'OBSERVATION'},'SOURCE_RETURNED_NOT_ADMITTED'),out=await this.append('OBSERVED_RETURN',packet);return{ok:true,schema:'OMEGA_WORLD_OBSERVATION_RECEIPT_R125',event:out.event,world:out.snapshot,canonicalMutation:false,deduped:out.deduped};}
 async reject(body){
  const events=await this.events(),source=events.find(e=>e.hash===body?.eventHash);if(!source)return{ok:false,code:'SOURCE_EVENT_NOT_FOUND'};
  const packet=normalizePacket({host:'OMEGA_PROOF',kind:'REJECTION',summary:body?.reason||'Rejected by proof/admission boundary',proofRefs:body?.proofHash?[body.proofHash]:[],dedupeKey:`reject:${source.hash}`},'PROOF_REJECTED');
  const out=await this.append('REJECTED',packet,{sourceEventHash:source.hash});return{ok:true,event:out.event,world:out.snapshot,canonicalMutation:false};
 }
 async admit(request,body){
  const secret=clip(request.headers.get('x-omega-world-admission-secret'),500),expected=clip(this.env?.WORLD_ADMISSION_SECRET,500);
  if(!expected||!secret||secret!==expected)return{ok:false,code:'INTERNAL_ADMISSION_SECRET_REQUIRED'};
  const proof=body?.proof||{},proofHash=clip(proof.hash,128);if(proof.status!=='PROVEN'||!/^[a-f0-9]{64}$/i.test(proofHash))return{ok:false,code:'PROVEN_SHA256_PROOF_REQUIRED'};
  const events=await this.events(),source=events.find(e=>e.hash===body?.eventHash);if(!source)return{ok:false,code:'SOURCE_EVENT_NOT_FOUND'};
  const snapshot=await this.ensure(),packet=source.packet||{},version=Number(snapshot.canonical?.version||0)+1;
  const canonical={...snapshot.canonical,version,address:packet.address,addressFrames:addressFrames(packet.address),host:packet.host,geometry:packet.geometry,material:packet.material,radiance:packet.radiance,velocity:packet.velocity,metrics:packet.metrics,evidenceRefs:packet.evidenceRefs,sourceRefs:packet.sourceRefs,proofRefs:[...new Set([...(packet.proofRefs||[]),proofHash])].slice(0,32),scarHead:source.hash,time:{event:Number(packet.createdAt)||now(),receive:now(),compute:Number(proof.computeAt)||now(),logical:version},authority:'OMEGAV6_PROOF_ADMITTED',truthBoundary:'Canonical mutation occurred only after an internal proof-gated admission with an explicit SHA-256 proof receipt.'};
  const admittedPacket=normalizePacket({host:'OMEGA_CANON',kind:'ADMISSION',address:canonical.address,metrics:canonical.metrics,proofRefs:canonical.proofRefs,sourceRefs:canonical.sourceRefs,evidenceRefs:canonical.evidenceRefs,summary:`Admitted event ${source.hash}`,dedupeKey:`admit:${source.hash}`},'CANONICAL_ADMISSION');
  const out=await this.append('ADMITTED',admittedPacket,{sourceEventHash:source.hash,proofHash}),next={...out.snapshot,canonical,updatedAt:now()};await this.storage.put('snapshot',next);return{ok:true,schema:'OMEGA_WORLD_ADMISSION_RECEIPT_R125',world:next,event:out.event,canonicalMutation:true};
 }
 async project(url){
  const snapshot=await this.ensure(),observerId=clip(url.searchParams.get('observer')||'OMEGA_OPERATOR',120),projection=clip(url.searchParams.get('projection')||'FIELD',80),address=clampAddress(url.searchParams.get('address')??snapshot.canonical.address),events=await this.events();
  return{ok:true,schema:'OMEGA_WORLD_PROJECTION_R125',runtimeRevision:WORLD_REVISION,worldLaw:WORLD_LAW,observer:{id:observerId,projection,address,addressFrames:addressFrames(address)},canonical:{...snapshot.canonical,addressFrames:addressFrames(snapshot.canonical.address)},ledger:snapshot.ledger,recent:events.slice(-24).reverse().map(e=>({seq:e.seq,type:e.type,hash:e.hash,previousHash:e.previousHash,host:e.packet?.host,kind:e.packet?.kind,address:e.packet?.address,authority:e.packet?.authority,summary:e.packet?.summary,createdAt:e.createdAt})),canonicalMutation:false,truthBoundary:'Observer and projection can change expression and inspection address but do not mutate canonical existence or promote returned evidence into proof.'};
 }
 async fetch(request){
  const u=new URL(request.url);
  if(request.method==='GET'&&u.pathname==='/snapshot'){const snapshot=await this.ensure(),events=await this.events();return json({ok:true,...snapshot,recent:events.slice(-12).reverse()});}
  if(request.method==='GET'&&u.pathname==='/events'){const events=await this.events(),after=Math.max(0,Number(u.searchParams.get('after')||0));return json({ok:true,schema:'OMEGA_WORLD_EVENT_LOG_R125',events:events.filter(e=>e.seq>after),head:(await this.ensure()).ledger.head});}
  if(request.method==='GET'&&u.pathname==='/project')return json(await this.project(u));
  if(request.method==='POST'&&u.pathname==='/propose'){const p=await parsePublicJson(request);return p.ok?json(await this.propose(p.value),202):json({ok:false,code:p.code},p.code==='WORLD_PACKET_TOO_LARGE'?413:400);}
  if(request.method==='POST'&&u.pathname==='/observe'){const p=await parsePublicJson(request);return p.ok?json(await this.observe(p.value),202):json({ok:false,code:p.code},p.code==='WORLD_PACKET_TOO_LARGE'?413:400);}
  if(request.method==='POST'&&u.pathname==='/reject'){const p=await parsePublicJson(request);if(!p.ok)return json({ok:false,code:p.code},400);const out=await this.reject(p.value);return json(out,out.ok?200:400);}
  if(request.method==='POST'&&u.pathname==='/admit'){const p=await parsePublicJson(request);if(!p.ok)return json({ok:false,code:p.code},400);const out=await this.admit(request,p.value);return json(out,out.ok?200:403);}
  return json({ok:false,code:'WORLD_ROUTE_NOT_FOUND'},404);
 }
}

const approvedOrigins=new Set(['omegav6.jeffdeweyeljefe.workers.dev','omega-genesis-v1.jeffdeweyeljefe.workers.dev','omega-living-light-etching-private-woven2.vercel.app','omega-optical-cloud-woven2.vercel.app']);
function cors(request){
 const origin=clip(request.headers.get('origin'),500);if(!origin)return{};
 try{const u=new URL(origin);if(u.protocol==='https:'&&approvedOrigins.has(u.hostname.toLowerCase()))return{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,authorization,x-omega-session-id,cache-control','access-control-expose-headers':'x-omega-world-runtime'};}catch{}
 return{};
}
export function withWorldCorsR125(response,request){const h=new Headers(response.headers);h.set('x-omega-world-runtime',WORLD_REVISION);for(const[k,v]of Object.entries(cors(request)))h.set(k,v);return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});}
function worldStub(env){if(!env?.OMEGA_WORLD_STATE)return null;return env.OMEGA_WORLD_STATE.get(env.OMEGA_WORLD_STATE.idFromName(WORLD_ROOT_ID));}
async function body(response){return response?.clone?.().json().catch(()=>null);}
async function syncSwarm(env,stub){
 if(!env?.OMEGA_SWARM_ORGANISM||!stub)return{available:false,ingested:0,status:null};
 const swarm=env.OMEGA_SWARM_ORGANISM.get(env.OMEGA_SWARM_ORGANISM.idFromName('omega-organism-root-r123'));
 const response=await swarm.fetch(new Request('https://organism.internal/status')),status=await body(response),missions=Array.isArray(status?.missions)?status.missions:[];
 const finished=missions.filter(m=>['COMPLETE','FAILED','TIMED_OUT','CANCELLED'].includes(m?.status)),receipts=[];
 for(const m of finished.slice(0,16)){
  const packet=normalizePacket({host:'SWARM',kind:'SWARM_RETURN',address:Number(m.seed)||0,metrics:{continuity:m.totalCells?m.completedCells/m.totalCells:0,plasticity:.5,contradiction:m.totalCells?m.failedCells/m.totalCells:0,burden:m.totalCells?Math.min(1,m.totalCells/1728):0,evidence:Array.isArray(m.evidence)&&m.evidence.length?.7:.25,uncertainty:m.failedCells?.7:.35,scar:m.totalBranches?m.failedBranches/m.totalBranches:0},evidenceRefs:(m.evidence||[]).map(x=>x.sha256||x.id).filter(Boolean),proofRefs:[m.merkleRoot].filter(Boolean),sourceRefs:[`swarm:${m.id}`],summary:clip(m.finalSynthesis?.text||`${m.status} swarm mission ${m.id}`,2600),payload:{missionId:m.id,status:m.status,totalCells:m.totalCells,completedCells:m.completedCells,failedCells:m.failedCells,totalBranches:m.totalBranches,completedBranches:m.completedBranches,failedBranches:m.failedBranches,merkleRoot:m.merkleRoot,proofState:m.proofState,authority:m.authority,finalSynthesis:m.finalSynthesis||null},dedupeKey:`swarm:${m.id}:${m.merkleRoot||m.status}`,truthBoundary:'Swarm output and Merkle receipts are durable returned computation, not CanonState admission.'},'RETURNED_NOT_ADMITTED');
  const rr=await stub.fetch(new Request('https://world.internal/observe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(packet)})),rd=await body(rr);receipts.push({missionId:m.id,ok:rr.ok,deduped:rd?.deduped===true,eventHash:rd?.event?.hash||null});
 }
 return{available:response.ok,ingested:receipts.filter(x=>x.ok&&!x.deduped).length,status,receipts};
}

export async function worldApiR125(request,env,inheritedFetch){
 const u=new URL(request.url);
 if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors(request),'x-omega-world-runtime':WORLD_REVISION}});
 if(u.pathname==='/api/world/manifest'&&request.method==='GET')return json({ok:true,schema:'OMEGA_WORLD_MANIFEST_R125',runtimeRevision:WORLD_REVISION,canonicalAuthority:'OMEGAV6',worldLaw:WORLD_LAW,addressTopology:'12 x 12 x 12 x 12 = 20,736 canonical addresses',stateRoles:['CANONICAL','OBSERVATION','PROPOSAL','PROOF','PROJECTION','SCAR_HISTORY'],fields:['geometry','material','radiance','velocity','metrics','evidenceRefs','sourceRefs','proofRefs','scarHead','authoritativeTime'],publicRoutes:['GET /api/world/snapshot','GET /api/world/events','GET /api/world/project','GET /api/world/organism','POST /api/world/propose','POST /api/world/observe/earth','POST /api/world/sync/swarm'],hardInvariants:['observer-projection-never-mutates-canonical-state','returned-evidence-never-self-admits','swarm-results-remain-returned-not-admitted','host-typing-prevents-silent-domain-merging','scar-ledger-is-hash-chained','public-admission-is-forbidden'],truthBoundary:'The persistent world is a continuity and provenance substrate. It does not turn model output, display geometry or returned provider data into validated physical truth.'});
 const stub=worldStub(env);if(!stub)return json({ok:false,code:'WORLD_BINDING_UNAVAILABLE'},503);
 if(u.pathname==='/api/world/snapshot'&&request.method==='GET')return stub.fetch(new Request('https://world.internal/snapshot'));
 if(u.pathname==='/api/world/events'&&request.method==='GET')return stub.fetch(new Request(`https://world.internal/events?${u.searchParams}`));
 if(u.pathname==='/api/world/project'&&request.method==='GET')return stub.fetch(new Request(`https://world.internal/project?${u.searchParams}`));
 if(u.pathname==='/api/world/propose'&&request.method==='POST')return stub.fetch(new Request('https://world.internal/propose',{method:'POST',headers:{'content-type':'application/json','content-length':request.headers.get('content-length')||''},body:await request.text()}));
 if(u.pathname==='/api/world/admit')return json({ok:false,code:'PUBLIC_ADMISSION_FORBIDDEN',truthBoundary:'Canonical world admission is an internal proof-gated operation and is never a public convenience endpoint.'},403);
 if(u.pathname==='/api/world/observe/earth'&&request.method==='POST'){
  if(typeof inheritedFetch!=='function')return json({ok:false,code:'EARTH_SOURCE_GATE_UNAVAILABLE'},503);
  const parsed=await parsePublicJson(request);if(!parsed.ok)return json({ok:false,code:parsed.code},parsed.code==='WORLD_PACKET_TOO_LARGE'?413:400);
  const q=parsed.value,lat=Math.max(-90,Math.min(90,Number(q.lat)||0)),lon=Math.max(-180,Math.min(180,Number(q.lon)||0));
  const sourceRequest=new Request(new URL(`/api/earth/evidence?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}`,request.url),{method:'GET',headers:request.headers}),sourceResponse=await inheritedFetch(sourceRequest,env),evidence=await body(sourceResponse);
  if(!sourceResponse.ok||!evidence?.evidenceHash)return json({ok:false,code:'EARTH_EVIDENCE_UNAVAILABLE',sourceStatus:sourceResponse.status},502);
  const packet=normalizePacket({host:'EARTH',kind:'RETURNED_EARTH_EVIDENCE',address:q.address,observerId:q.observerId||'OMEGA_OPERATOR',projection:q.projection||'EARTH',metrics:{continuity:.8,plasticity:.35,contradiction:0,burden:.15,evidence:Object.values(evidence.sources||{}).filter(x=>x?.ok).length/Math.max(1,Object.keys(evidence.sources||{}).length),uncertainty:Object.values(evidence.sources||{}).some(x=>!x?.ok)?.5:.2,scar:0},evidenceRefs:[evidence.evidenceHash],sourceRefs:Object.values(evidence.sources||{}).map(x=>x?.source).filter(Boolean),summary:`Returned Earth evidence ${lat.toFixed(4)}, ${lon.toFixed(4)} · ${evidence.verifiedAt||'timestamp unavailable'}`,payload:evidence,dedupeKey:`earth:${evidence.evidenceHash}`,truthBoundary:evidence.truthBoundary},'SOURCE_RETURNED_NOT_ADMITTED');
  return stub.fetch(new Request('https://world.internal/observe',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(packet)}));
 }
 if(u.pathname==='/api/world/sync/swarm'&&request.method==='POST')return json({ok:true,schema:'OMEGA_WORLD_SWARM_SYNC_R125',...(await syncSwarm(env,stub)),canonicalMutation:false});
 if(u.pathname==='/api/world/organism'&&request.method==='GET'){
  const [worldResponse,swarmSync,selfbuildResponse,federationResponse,hybridResponse]=await Promise.all([
   stub.fetch(new Request('https://world.internal/snapshot')),syncSwarm(env,stub),env?.ASSETS?.fetch?env.ASSETS.fetch(new Request(new URL('/omega-r124-selfbuild-state.json',request.url))):Promise.resolve(null),typeof inheritedFetch==='function'?inheritedFetch(new Request(new URL('/api/federation/run/status',request.url),{headers:request.headers}),env):Promise.resolve(null),typeof inheritedFetch==='function'?inheritedFetch(new Request(new URL('/api/hybrid/status',request.url),{headers:request.headers}),env):Promise.resolve(null)
  ]);
  const world=await body(worldResponse),selfbuild=await body(selfbuildResponse),federation=await body(federationResponse),hybrid=await body(hybridResponse);
  return json({ok:true,schema:'OMEGA_ORGANISM_WORLD_R125',runtimeRevision:WORLD_REVISION,world,swarm:swarmSync.status,selfBuild:selfbuild?{schema:selfbuild.schema,generation:selfbuild.generation,active:selfbuild.active,currentCapsuleId:selfbuild.currentCapsuleId,admitted:selfbuild.admitted,rejected:selfbuild.rejected,blocked:selfbuild.blocked}:null,federation,sovereign:{nativeExecutionClaimed:hybrid?.nativeExecutionClaimed===true,devices:Array.isArray(hybrid?.devices)?hybrid.devices.filter(x=>x?.online&&!x?.revoked).map(x=>({id:x.id||x.deviceId||null,online:true,lastSeen:x.lastSeen||x.heartbeatAt||null})):[]},sync:{swarmIngested:swarmSync.ingested},canonicalMutation:false,truthBoundary:'This organism view correlates durable world state, swarm computation, governed self-build, federation and authenticated host state without collapsing their separate authority levels.'});
 }
 return json({ok:false,code:'WORLD_API_ROUTE_NOT_FOUND'},404);
}
