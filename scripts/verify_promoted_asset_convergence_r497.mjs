import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const base=String(process.env.OMEGA_PUBLIC_URL||process.env.OMEGA_E2E_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'').trim();
const attempts=Math.max(1,Number.parseInt(process.env.OMEGA_R497_ASSET_ATTEMPTS||'40',10)||40);
const delayMs=Math.max(500,Number.parseInt(process.env.OMEGA_R497_ASSET_DELAY_MS||'3000',10)||3000);
if(!base)throw new Error('R497 requires OMEGA_PUBLIC_URL or OMEGA_E2E_URL');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R497 requires exact promoted SHA');

const localHtml=readFileSync('dist/index.html','utf8');
const normalize=ref=>new URL(ref,'https://omega.local').pathname;
const entryRefs=[...localHtml.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
 .map(m=>m[1]).filter(ref=>normalize(ref).startsWith('/assets/')).map(normalize);
if(entryRefs.length<2)throw new Error(`R497 local dist exposes too few root asset refs: ${JSON.stringify(entryRefs)}`);

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const expectedAssets=new Map(entryRefs.map(ref=>[ref,sha(readFileSync(join('dist',ref.replace(/^\//,''))))]));
const headers={'cache-control':'no-cache','pragma':'no-cache','accept-encoding':'identity'};
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let last={attempt:0,rootRefs:[],missing:[...expectedAssets.keys()],hashMismatches:[],rootStatus:0};

for(let attempt=1;attempt<=attempts;attempt++){
 try{
  const rootResponse=await fetch(`${base}/?r497=${Date.now()}-${attempt}`,{headers});
  const rootText=await rootResponse.text();
  const rootRefs=[...rootText.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
   .map(m=>m[1]).filter(ref=>normalize(ref).startsWith('/assets/')).map(normalize);
  const rootSet=new Set(rootRefs);
  const missing=[...expectedAssets.keys()].filter(ref=>!rootSet.has(ref));
  const hashMismatches=[];
  if(rootResponse.ok&&!missing.length){
   for(const [ref,expectedHash] of expectedAssets){
    const response=await fetch(`${base}${ref}?r497=${Date.now()}-${attempt}`,{headers});
    if(!response.ok){hashMismatches.push({ref,state:`HTTP_${response.status}`});continue}
    const actualHash=sha(new Uint8Array(await response.arrayBuffer()));
    if(actualHash!==expectedHash)hashMismatches.push({ref,state:'SHA_MISMATCH',expectedHash,actualHash});
   }
  }
  last={attempt,rootRefs,missing,hashMismatches,rootStatus:rootResponse.status};
  if(rootResponse.ok&&!missing.length&&!hashMismatches.length){
   console.log(`R497 PROMOTED ASSET CONVERGENCE PASS · exact SHA ${expectedSha} · attempt ${attempt}/${attempts} · root refs ${entryRefs.length} · canonical entry assets byte-identical to promoted dist`);
   process.exit(0);
  }
  console.log(`R497 WAIT · attempt ${attempt}/${attempts} · root HTTP ${rootResponse.status} · missing ${missing.length} · hash mismatches ${hashMismatches.length}`);
 }catch(error){
  last={...last,attempt,error:error instanceof Error?error.message:String(error)};
  console.log(`R497 WAIT · attempt ${attempt}/${attempts} · ${last.error}`);
 }
 if(attempt<attempts)await sleep(delayMs);
}
throw new Error(`R497 promoted asset convergence timeout for ${expectedSha}: ${JSON.stringify(last).slice(0,5000)}`);
