import {privateSaiDoorwayR261} from './privateSaiDoorwayR261.js';
import {privateSaiAdminR256} from './privateSaiAdminR256.js';

const REVISION='R261';
const INTERNAL_ORIGIN='https://r261-ledger.internal';
const CANONICAL_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev';
const HIDDEN_HEADERS={'cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow, noarchive','referrer-policy':'no-referrer','x-content-type-options':'nosniff','x-omega-doorway-revision':REVISION};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...HIDDEN_HEADERS,'content-type':'application/json; charset=utf-8'}});
const clean=v=>String(v??'').replace(/[^A-Za-z0-9._:-]/g,'').slice(0,160);

export class OmegaSaiPeerLedgerR256 {
  constructor(state){this.storage=state.storage}
  async fetch(request){
    const u=new URL(request.url),path=u.pathname;
    if(path==='/put'&&request.method==='POST'){
      const b=await request.json().catch(()=>({})),key=String(b.key||'').slice(0,180),value=String(b.value||'');
      if(!key||value.length>100000)return json({ok:false,code:'R256_LEDGER_WRITE_REJECTED'},400);
      await this.storage.put(`record:${key}`,value);return json({ok:true});
    }
    if(path==='/get'&&request.method==='GET'){
      const key=String(u.searchParams.get('key')||'').slice(0,180);if(!key)return json({ok:false},400);
      const value=await this.storage.get(`record:${key}`);return json({ok:true,value:value??null});
    }
    if(path==='/list'&&request.method==='GET'){
      const limit=Math.max(1,Math.min(500,Number(u.searchParams.get('limit'))||100)),map=await this.storage.list({prefix:'record:',limit,reverse:true});
      return json({ok:true,keys:[...map.keys()].map(name=>({name:name.slice(7)})),cursor:null,list_complete:map.size<limit});
    }
    if(path==='/rate'&&request.method==='POST'){
      const b=await request.json().catch(()=>({})),peer=clean(b.peer).slice(0,96),action=clean(b.action).slice(0,40),limit=Math.max(1,Math.min(240,Number(b.limit)||60)),windowMs=Math.max(60000,Math.min(86400000,Number(b.windowMs)||3600000));
      if(!peer||!action)return json({ok:false,allowed:false},400);
      const key=`rate:${peer}:${action}`,now=Date.now(),raw=await this.storage.get(key),hits=Array.isArray(raw)?raw.filter(x=>Number.isFinite(Number(x))&&now-Number(x)<windowMs):[];
      if(hits.length>=limit)return json({ok:true,allowed:false,code:'R256_RATE_LIMITED',retryAfterMs:Math.max(1000,windowMs-(now-hits[0])),remaining:0},429);
      hits.push(now);await this.storage.put(key,hits.slice(-limit));return json({ok:true,allowed:true,remaining:Math.max(0,limit-hits.length)});
    }
    if(path==='/session/put'&&request.method==='POST'){
      const b=await request.json().catch(()=>({})),digest=String(b.digest||'').toLowerCase(),value=String(b.value||''),ttl=Math.max(300,Math.min(86400,Number(b.ttl)||3600));
      if(!/^[0-9a-f]{64}$/.test(digest)||!value||value.length>20000)return json({ok:false,code:'R261_SESSION_WRITE_REJECTED'},400);
      await this.storage.put(`session:${digest}`,value,{expirationTtl:ttl});return json({ok:true});
    }
    if(path==='/session/get'&&request.method==='GET'){
      const digest=String(u.searchParams.get('digest')||'').toLowerCase();
      if(!/^[0-9a-f]{64}$/.test(digest))return json({ok:false},400);
      const value=await this.storage.get(`session:${digest}`);return json({ok:true,value:value??null});
    }
    if(path==='/task/put'&&request.method==='POST'){
      const b=await request.json().catch(()=>({})),peer=clean(b.peer).slice(0,96),id=clean(b.id).slice(0,96),value=String(b.value||'');
      if(!peer||!id||!value||value.length>100000)return json({ok:false,code:'R261_TASK_WRITE_REJECTED'},400);
      await this.storage.put(`task:${peer}:${id}`,value);return json({ok:true});
    }
    if(path==='/task/get'&&request.method==='GET'){
      const peer=clean(u.searchParams.get('peer')).slice(0,96),id=clean(u.searchParams.get('id')).slice(0,96);
      if(!peer||!id)return json({ok:false},400);
      const value=await this.storage.get(`task:${peer}:${id}`);return json({ok:true,value:value??null});
    }
    if(path==='/task/list'&&request.method==='GET'){
      const peer=clean(u.searchParams.get('peer')).slice(0,96),limit=Math.max(1,Math.min(100,Number(u.searchParams.get('limit'))||50));
      if(!peer)return json({ok:false},400);
      const map=await this.storage.list({prefix:`task:${peer}:`,limit,reverse:true});
      return json({ok:true,values:[...map.values()]});
    }
    return json({ok:false},404);
  }
}

function ledger(env){
  const ns=env?.OMEGA_SAI_PEER_LEDGER_DO;if(!ns?.get||!ns?.idFromName)return null;
  const stub=ns.get(ns.idFromName('omega-sai-private-peer-ledger-r256'));
  const call=async(path,init)=>{const r=await stub.fetch(new Request(INTERNAL_ORIGIN+path,init));const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.code||`R261 ledger ${r.status}`);return data};
  return{
    put:async(key,value)=>{await call('/put',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key,value})})},
    get:async key=>(await call('/get?key='+encodeURIComponent(key),{method:'GET'})).value,
    list:async({limit=100}={})=>{const d=await call('/list?limit='+encodeURIComponent(limit),{method:'GET'});return{keys:d.keys||[],cursor:d.cursor||null,list_complete:d.list_complete!==false}},
    rate:async(peer,action,limit,windowMs)=>call('/rate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({peer,action,limit,windowMs})}),
    sessionPut:async(digest,value,ttl)=>{await call('/session/put',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({digest,value,ttl})})},
    sessionGet:async digest=>(await call('/session/get?digest='+encodeURIComponent(digest),{method:'GET'})).value,
    taskPut:async(peer,id,value)=>{await call('/task/put',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({peer,id,value})})},
    taskGet:async(peer,id)=>(await call('/task/get?peer='+encodeURIComponent(peer)+'&id='+encodeURIComponent(id),{method:'GET'})).value,
    taskList:async(peer,limit=50)=>(await call('/task/list?peer='+encodeURIComponent(peer)+'&limit='+encodeURIComponent(limit),{method:'GET'})).values||[]
  };
}
async function delegateCanonical(request,env){
  if(!env?.OMEGA_CANONICAL?.fetch)return json({ok:false,code:'R261_CANONICAL_SERVICE_UNAVAILABLE'},503);
  const incoming=new URL(request.url),target=new URL(incoming.pathname+incoming.search,CANONICAL_ORIGIN),headers=new Headers(request.headers);
  headers.delete('origin');headers.delete('authorization');headers.delete('cookie');
  const init={method:request.method,headers};if(request.method!=='GET'&&request.method!=='HEAD')init.body=await request.clone().arrayBuffer();
  return env.OMEGA_CANONICAL.fetch(new Request(target,init));
}

export default{
  async fetch(request,env){
    const store=ledger(env),adapted={...env,OMEGA_SAI_PEER_LEDGER:store};
    const admin=await privateSaiAdminR256(request,adapted);if(admin)return admin;
    const doorway=await privateSaiDoorwayR261(request,adapted,{delegate:(req)=>delegateCanonical(req,env)});if(doorway)return doorway;
    return new Response('Not found',{status:404,headers:HIDDEN_HEADERS});
  }
};
