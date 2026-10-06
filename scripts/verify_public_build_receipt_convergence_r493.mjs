import {setTimeout as sleep} from 'node:timers/promises';

const base=String(process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const worker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
if(!/^https:\/\//.test(base))throw new Error('R493 requires canonical HTTPS OMEGA_PUBLIC_URL');
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('R493 requires exact 40-character promoted SHA');

const affinityKey=`omega-r493-${expected.slice(0,16)}-public`;
const headers={
 'cache-control':'no-cache',
 'pragma':'no-cache',
 'Cloudflare-Workers-Version-Key':affinityKey
};
let last='NO_OBSERVATION';
for(let attempt=1;attempt<=45;attempt++){
 const url=`${base}/omega-build-receipt.json?r493=${Date.now()}-${attempt}`;
 try{
  const response=await fetch(url,{headers,cache:'no-store',redirect:'follow'});
  const raw=await response.text();
  if(!response.ok){
   last=`HTTP ${response.status} ${raw.slice(0,240)}`;
  }else{
   let receipt;try{receipt=JSON.parse(raw)}catch{receipt=null}
   const schema=String(receipt?.schema||'');
   const source=String(receipt?.source?.sha||'');
   const promoted=String(receipt?.promotion?.promotedMergeSha||'');
   last=JSON.stringify({schema,source,promoted});
   if(schema==='OMEGA_GOVERNED_BUILD_RECEIPT_V1'&&source===expected&&promoted===expected){
    console.log(`R493 PUBLIC BUILD RECEIPT CONVERGENCE PASS · attempt ${attempt} · worker ${worker} · exact source/promoted SHA ${expected} · affinity ${affinityKey}`);
    process.exit(0);
   }
  }
 }catch(error){
  last=error instanceof Error?error.message:String(error);
 }
 console.log(`R493 public build receipt convergence attempt ${attempt}/45 · expected ${expected} · observed ${last.slice(0,500)}`);
 if(attempt<45)await sleep(2000);
}
throw new Error(`R493 public build receipt did not converge to exact promoted SHA ${expected} within bounded 90s window; last=${last.slice(0,800)}`);
