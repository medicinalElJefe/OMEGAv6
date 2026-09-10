import {privateSaiDoorwayR256,validateSaiInviteR256} from './privateSaiDoorwayR256.js';
import {privateSaiAdminR256} from './privateSaiAdminR256.js';

const REVISION='R256';
const INTERNAL_ORIGIN='https://r256-ledger.internal';
const CANONICAL_ORIGIN='https://omegav6.jeffdeweyeljefe.workers.dev';
const HIDDEN_HEADERS={'cache-control':'no-store, max-age=0','x-robots-tag':'noindex, nofollow, noarchive','referrer-policy':'no-referrer','x-content-type-options':'nosniff','x-omega-doorway-revision':REVISION};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...HIDDEN_HEADERS,'content-type':'application/json; charset=utf-8'}});

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
      const b=await request.json().catch(()=>({})),peer=String(b.peer||'').replace(/[^A-Za-z0-9._:-]/g,'').slice(0,96),action=String(b.action||'').replace(/[^A-Za-z0-9._:-]/g,'').slice(0,40),limit=Math.max(1,Math.min(240,Number(b.limit)||60)),windowMs=Math.max(60000,Math.min(86400000,Number(b.windowMs)||3600000));
      if(!peer||!action)return json({ok:false,allowed:false},400);
      const key=`rate:${peer}:${action}`,now=Date.now(),raw=await this.storage.get(key),hits=Array.isArray(raw)?raw.filter(x=>Number.isFinite(Number(x))&&now-Number(x)<windowMs):[];
      if(hits.length>=limit)return json({ok:true,allowed:false,retryAfterMs:Math.max(1000,windowMs-(now-hits[0])),remaining:0},429);
      hits.push(now);await this.storage.put(key,hits.slice(-limit));return json({ok:true,allowed:true,remaining:Math.max(0,limit-hits.length)});
    }
    return json({ok:false},404);
  }
}

function ledger(env){
  const ns=env?.OMEGA_SAI_PEER_LEDGER_DO;if(!ns?.get||!ns?.idFromName)return null;
  const stub=ns.get(ns.idFromName('omega-sai-private-peer-ledger-r256'));
  const call=async(path,init)=>{const r=await stub.fetch(new Request(INTERNAL_ORIGIN+path,init));const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.code||`R256 ledger ${r.status}`);return data};
  return{
    put:async(key,value)=>{await call('/put',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({key,value})})},
    get:async key=>(await call('/get?key='+encodeURIComponent(key),{method:'GET'})).value,
    list:async({limit=100}={})=>{const d=await call('/list?limit='+encodeURIComponent(limit),{method:'GET'});return{keys:d.keys||[],cursor:d.cursor||null,list_complete:d.list_complete!==false}},
    rate:async(peer,action,limit,windowMs)=>call('/rate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({peer,action,limit,windowMs})})
  };
}
function peerToken(path){const m=path.match(/^\/sai-door\/([A-Za-z0-9_-]{32,128})(?:\/|$)/);return m?.[1]||null}
async function enforceRate(request,env,adapted){
  if(request.method!=='POST')return null;const u=new URL(request.url),token=peerToken(u.pathname);if(!token)return null;
  const action=u.pathname.endsWith('/training')?'training':u.pathname.endsWith('/message')||u.pathname.endsWith('/a2a')||u.pathname.endsWith('/mcp')?'collaboration':null;if(!action)return null;
  const invite=await validateSaiInviteR256(token,adapted);if(!invite)return null;const store=adapted.OMEGA_SAI_PEER_LEDGER;if(!store?.rate)return null;
  const policy=action==='training'?{limit:30,windowMs:3600000}:{limit:120,windowMs:3600000},result=await store.rate(invite.id,action,policy.limit,policy.windowMs);
  if(result.allowed!==false)return null;return json({ok:false,code:'R256_RATE_LIMITED',retryAfterMs:result.retryAfterMs||60000},429);
}
async function delegateCanonical(request,env){
  if(!env?.OMEGA_CANONICAL?.fetch)return json({ok:false,code:'R256_CANONICAL_SERVICE_UNAVAILABLE'},503);
  const incoming=new URL(request.url),target=new URL(incoming.pathname+incoming.search,CANONICAL_ORIGIN),headers=new Headers(request.headers);headers.delete('origin');
  const init={method:request.method,headers};if(request.method!=='GET'&&request.method!=='HEAD')init.body=await request.clone().arrayBuffer();
  return env.OMEGA_CANONICAL.fetch(new Request(target,init));
}

export default{
  async fetch(request,env){
    const store=ledger(env),adapted={...env,OMEGA_SAI_PEER_LEDGER:store};
    const admin=await privateSaiAdminR256(request,adapted);if(admin)return admin;
    const limited=await enforceRate(request,env,adapted);if(limited)return limited;
    const doorway=await privateSaiDoorwayR256(request,adapted,{delegate:(req)=>delegateCanonical(req,env)});if(doorway)return doorway;
    return new Response('Not found',{status:404,headers:HIDDEN_HEADERS});
  }
};
