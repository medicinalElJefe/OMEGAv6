import {spawnSync} from 'node:child_process';

const candidate=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const worker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
const base=String(process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expected=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
if(!candidate)throw new Error('R491 promotion convergence requires OMEGA_WORKER_VERSION_ID');
if(!base)throw new Error('R493 promotion convergence requires OMEGA_PUBLIC_URL or OMEGA_E2E_URL');
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('R493 promotion convergence requires exact OMEGA_PROMOTED_SHA or GITHUB_SHA');

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function servingRows(value,rows=[]){
 if(!value||typeof value!=='object')return rows;
 if(Array.isArray(value)){for(const x of value)servingRows(x,rows);return rows}
 const id=typeof value.version_id==='string'?value.version_id:(typeof value.versionId==='string'?value.versionId:null);
 const pct=Number(value.percentage??value.traffic_percentage??value.trafficPercentage);
 if(id&&Number.isFinite(pct)&&pct>0.001)rows.push({id,pct});
 for(const x of Object.values(value))servingRows(x,rows);
 return rows;
}
async function canonicalReceipt(attempt){
 try{
  const response=await fetch(`${base}/omega-build-receipt.json?r493=${Date.now()}-${attempt}`,{
   headers:{'cache-control':'no-cache','pragma':'no-cache'}
  });
  const raw=await response.text();
  if(!response.ok)return{exact:false,detail:`HTTP ${response.status} ${raw.slice(0,180)}`};
  let receipt;
  try{receipt=JSON.parse(raw)}catch(error){return{exact:false,detail:`JSON ${error instanceof Error?error.message:String(error)}`}}
  const source=String(receipt?.source?.sha||'').trim();
  const promoted=String(receipt?.promotion?.promotedMergeSha||'').trim();
  return{
   exact:source===expected&&promoted===expected,
   detail:`source ${source||'NONE'} · promoted ${promoted||'NONE'}`
  };
 }catch(error){
  return{exact:false,detail:`fetch ${error instanceof Error?error.message:String(error)}`};
 }
}

// R492 production scar: deployment metadata reached candidate@100 before the canonical edge receipt exposed the same exact merge SHA.
let lastMetadata='UNOBSERVED',lastReceipt='UNOBSERVED';
for(let attempt=1;attempt<=15;attempt++){
 const proc=spawnSync('npx',['wrangler','deployments','status','--name',worker,'--json'],{cwd:process.cwd(),encoding:'utf8'});
 if(proc.status===0){
  try{
   const rows=[...new Map(servingRows(JSON.parse(proc.stdout)).map(x=>[x.id,x])).values()];
   lastMetadata=JSON.stringify(rows);
   const metadataReady=rows.length===1&&rows[0].id===candidate&&rows[0].pct>=99.999;
   if(metadataReady){
    const edge=await canonicalReceipt(attempt);
    lastReceipt=edge.detail;
    if(edge.exact){
     console.log(`R491 PROMOTION CONVERGENCE PASS · R493 EDGE RECEIPT BOUND · attempt ${attempt} · exact candidate ${candidate} alone at ${rows[0].pct}% · canonical receipt ${expected}`);
     process.exit(0);
    }
    console.log(`R493 promotion metadata ready on attempt ${attempt}, canonical receipt pending: ${edge.detail}`);
   }else{
    console.log(`R491 promotion convergence attempt ${attempt}: ${JSON.stringify(rows)}`);
   }
  }catch(error){console.log(`R491 promotion status parse attempt ${attempt}: ${error instanceof Error?error.message:String(error)}`)}
 }else{
  lastMetadata=`command failed: ${String(proc.stderr||proc.stdout||'').slice(0,500)}`;
  console.log(`R491 promotion status command attempt ${attempt} failed: ${String(proc.stderr||proc.stdout||'').slice(0,500)}`);
 }
 if(attempt<15)await sleep(2000);
}
throw new Error(`R493 exact candidate ${candidate} did not converge simultaneously in Cloudflare deployment metadata and canonical edge receipt within the bounded window · metadata ${lastMetadata} · receipt ${lastReceipt}`);
