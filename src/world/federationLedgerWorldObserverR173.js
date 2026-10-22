import {reconcileFederationLedgerWorldR172} from './federationLedgerWorldBindingR172.js';

export const R173_REVISION='R173';
export const R173_SCHEMA='OMEGA_FEDERATION_LEDGER_WORLD_OBSERVER_R173';
export const R173_EVENT='omega-federation-world-r173';
export const R173_LAWS=Object.freeze([
 'OBSERVE_CANONICAL_R114_LEDGER_WITHOUT_MUTATING_FEDERATION_AUTHORITY',
 'ONLY_HTTP_OK_JSON_FROM_THE_DECLARED_SAME_ORIGIN_R114_LEDGER_ROUTE_IS_CALLER_TRUSTED',
 'UNCHANGED_LEDGER_HEAD_DOES_NOT_REPLAY_DUPLICATE_WORLD_SCARS',
 'R172_R171_R136_R134_REMAIN_LEDGER_WORLD_RECONCILIATION_AND_CONTINUITY_AUTHORITIES',
 'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY',
 'OBSERVATION_IS_NOT_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_OR_COMPUTED_PHOTOREAL_PROOF'
]);

const ENDPOINT='/api/federation/ceremony/ledger';
const text=(v,n=180)=>String(v??'').trim().slice(0,n);
const receiptsOf=(ledger)=>Array.isArray(ledger)?ledger:Array.isArray(ledger?.receipts)?ledger.receipts:Array.isArray(ledger?.ledger)?ledger.ledger:[];
const headOf=(ledger)=>text(receiptsOf(ledger).at(-1)?.receiptSha256,180)||null;

export async function pollFederationLedgerWorldR173({fetchLedger,previousHead=null,context={}}={}){
 if(typeof fetchLedger!=='function')throw new Error('R173_FETCH_LEDGER_REQUIRED');
 let response;
 try{response=await fetchLedger(ENDPOINT);}catch(error){return{schema:R173_SCHEMA,revision:R173_REVISION,observed:false,changed:false,endpoint:ENDPOINT,head:null,world:null,error:text(error?.message||error,240),claims:zeroClaims()};}
 const ok=response?.ok===true;
 if(!ok)return{schema:R173_SCHEMA,revision:R173_REVISION,observed:false,changed:false,endpoint:ENDPOINT,head:null,world:null,error:`HTTP_${Number(response?.status)||0}`,claims:zeroClaims()};
 let ledger;
 try{ledger=await response.json();}catch{return{schema:R173_SCHEMA,revision:R173_REVISION,observed:false,changed:false,endpoint:ENDPOINT,head:null,world:null,error:'INVALID_JSON',claims:zeroClaims()};}
 const head=headOf(ledger);
 if(!head)return{schema:R173_SCHEMA,revision:R173_REVISION,observed:true,changed:false,endpoint:ENDPOINT,head:null,world:null,error:null,claims:zeroClaims()};
 if(head===previousHead)return{schema:R173_SCHEMA,revision:R173_REVISION,observed:true,changed:false,endpoint:ENDPOINT,head,world:null,error:null,claims:zeroClaims()};
 const world=await reconcileFederationLedgerWorldR172({ledger,trustedSource:true,context:{...context,sessionId:context.sessionId||`R173-${head.slice(0,12)}`}});
 return{schema:R173_SCHEMA,revision:R173_REVISION,observed:true,changed:world.predecessorChainValid===true,endpoint:ENDPOINT,head,world,error:world.predecessorChainValid?null:'R172_LEDGER_REJECTED',claims:{...zeroClaims(),federationClosedProved:world.claims?.federationClosedProved===true}};
}

export function installFederationLedgerWorldObserverR173({intervalMs=6000,fetchLedger=null,contextProvider=null,onUpdate=null}={}){
 if(typeof window==='undefined')return()=>{};
 const fetcher=fetchLedger||((path)=>window.fetch(path,{method:'GET',headers:{accept:'application/json'},credentials:'same-origin',cache:'no-store'}));
 let stopped=false,head=null,timer=0;
 const tick=async()=>{
  if(stopped)return;
  const result=await pollFederationLedgerWorldR173({fetchLedger:fetcher,previousHead:head,context:typeof contextProvider==='function'?contextProvider():{}});
  if(result.head)head=result.head;
  if(result.changed){
   try{window.localStorage.setItem('omega.r173.federationLedgerHead',JSON.stringify({head:result.head,observedAt:Date.now()}));}catch{}
   window.dispatchEvent(new CustomEvent(R173_EVENT,{detail:result}));
   if(typeof onUpdate==='function')onUpdate(result);
  }
 };
 void tick();timer=window.setInterval(()=>void tick(),Math.max(2000,Number(intervalMs)||6000));
 return()=>{stopped=true;if(timer)window.clearInterval(timer)};
}

function zeroClaims(){return{publicDeploymentProved:false,pcOnlineProved:false,solverValidityProved:false,computedPhotorealRealityProved:false,currentNetworkReachabilityProved:false,federationClosedProved:false};}

export function manifestR173(){return{schema:R173_SCHEMA,revision:R173_REVISION,endpoint:ENDPOINT,laws:R173_LAWS,sourceAuthority:'R114_LEDGER_HTTP_RESPONSE',worldAuthority:'R172/R171/R136/R134',canonicalAdmissionAuthority:'R125',canonicalMutation:false};}
