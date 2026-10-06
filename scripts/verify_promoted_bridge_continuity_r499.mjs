import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const base=String(process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const attempts=Math.max(1,Number.parseInt(process.env.OMEGA_R499_BRIDGE_ATTEMPTS||'40',10)||40);
const delayMs=Math.max(500,Number.parseInt(process.env.OMEGA_R499_BRIDGE_DELAY_MS||'3000',10)||3000);
if(!base)throw new Error('R499 requires OMEGA_PUBLIC_URL or OMEGA_E2E_URL');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R499 requires exact promoted SHA');

const local=JSON.parse(readFileSync('dist/omega-bridge-continuity-r499.json','utf8'));
if(local?.schema!=='OMEGA_BRIDGE_CONTINUITY_R499')throw new Error(`R499 local bridge manifest schema mismatch ${local?.schema}`);
if(local?.sourceSha!==expectedSha||local?.promotedSha!==expectedSha)throw new Error(`R499 local bridge manifest SHA mismatch source ${local?.sourceSha} promoted ${local?.promotedSha} expected ${expectedSha}`);
if(!Array.isArray(local.assets)||local.assets.length<2)throw new Error('R499 local bridge manifest contains no deferred asset graph');
for(const prefix of ['OmegaHomeR71-','OmegaWorkstationFullV2-'])if(!local.roots?.some(x=>x.startsWith(prefix)&&x.endsWith('.js')))throw new Error(`R499 bridge root missing ${prefix}`);

const headers={'cache-control':'no-cache','pragma':'no-cache','accept-encoding':'identity'};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let last='UNOBSERVED';

for(let attempt=1;attempt<=attempts;attempt++){
 try{
  const manifestResponse=await fetch(`${base}/omega-bridge-continuity-r499.json?r499=${Date.now()}-${attempt}`,{headers});
  const raw=await manifestResponse.text();
  if(!manifestResponse.ok){
   last=`manifest HTTP ${manifestResponse.status} ${raw.slice(0,180)}`;
  }else{
   let remote;
   try{remote=JSON.parse(raw)}catch(error){remote=null;last=`manifest JSON ${error instanceof Error?error.message:String(error)}`}
   if(remote){
    const sourceExact=remote.sourceSha===expectedSha&&remote.promotedSha===expectedSha;
    const graphExact=remote.manifestSha256===local.manifestSha256&&remote.assetCount===local.assetCount;
    if(!sourceExact||!graphExact){
     last=`manifest source ${remote.sourceSha||'NONE'} promoted ${remote.promotedSha||'NONE'} graph ${remote.manifestSha256||'NONE'}`;
    }else{
     const results=await Promise.all(local.assets.map(async asset=>{
      const response=await fetch(`${base}${asset.path}?r499=${Date.now()}-${attempt}`,{headers});
      if(!response.ok)return{path:asset.path,state:`HTTP_${response.status}`};
      const actual=sha256(new Uint8Array(await response.arrayBuffer()));
      return actual===asset.sha256?null:{path:asset.path,state:'SHA_MISMATCH',expected:asset.sha256,actual};
     }));
     const failures=results.filter(Boolean);
     if(!failures.length){
      console.log(`R499 BRIDGE ASSET CONVERGENCE PASS · exact SHA ${expectedSha} · attempt ${attempt}/${attempts} · ${local.assetCount} deferred bridge assets byte-identical`);
      process.exit(0);
     }
     last=`${failures.length} bridge asset mismatch(es): ${JSON.stringify(failures.slice(0,8))}`;
    }
   }
  }
 }catch(error){
  last=`fetch ${error instanceof Error?error.message:String(error)}`;
 }
 console.log(`R499 WAIT · attempt ${attempt}/${attempts} · ${last}`);
 if(attempt<attempts)await sleep(delayMs);
}

throw new Error(`R499 promoted bridge dependency graph did not converge for ${expectedSha}: ${last}`);
