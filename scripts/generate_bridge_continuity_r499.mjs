import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const assetsDir=join(process.cwd(),'dist','assets');
const files=readdirSync(assetsDir).filter(name=>/\.(?:js|css)$/.test(name));
const roots=files.filter(name=>/^(?:OmegaHomeR71|OmegaWorkstationFullV2)-/.test(name));
if(!roots.some(name=>/^OmegaHomeR71-.*\.js$/.test(name)))throw new Error('R499 missing built OmegaHomeR71 bridge root');
if(!roots.some(name=>/^OmegaWorkstationFullV2-.*\.js$/.test(name)))throw new Error('R499 missing built OmegaWorkstationFullV2 bridge root');

const available=new Set(files);
const closure=new Set(roots);
const queue=[...roots];
while(queue.length){
 const name=queue.shift();
 const text=readFileSync(join(assetsDir,name),'utf8');
 for(const match of text.matchAll(/(?:\.\/)?([A-Za-z0-9_.-]+\.(?:js|css))/g)){
  const dep=match[1];
  if(available.has(dep)&&!closure.has(dep)){closure.add(dep);queue.push(dep)}
 }
}

const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');
const assets=[...closure].sort().map(file=>{
 const bytes=readFileSync(join(assetsDir,file));
 return{
  path:`/assets/${file}`,
  file,
  role:roots.includes(file)?'BRIDGE_ROOT':'BRIDGE_DEPENDENCY',
  bytes:bytes.byteLength,
  sha256:sha256(bytes)
 };
});

const payload={
 schema:'OMEGA_BRIDGE_CONTINUITY_R499',
 state:process.env.GITHUB_ACTIONS==='true'?'EXACT_BUILD_GRAPH':'LOCAL_BUILD_GRAPH',
 sourceSha:String(process.env.GITHUB_SHA||'UNAVAILABLE'),
 promotedSha:String(process.env.OMEGA_PROMOTED_SHA||process.env.GITHUB_SHA||'UNAVAILABLE'),
 sequence:[
  'CANONICAL_OMEGA7',
  'BRIDGE_INTENT',
  'BRIDGE_DEPENDENCY_GRAPH',
  'BRIDGE_ASSET_CONVERGENCE',
  'OMEGA6_HOME',
  'OMEGA6_WORKSTATION',
  'LIVE_ROUTE_PROOF'
 ],
 roots:roots.sort(),
 assetCount:assets.length,
 assets,
 truthBoundary:'R499 models the OMEGA7→OMEGA6 compatibility path as a sequential transition over the exact promoted artifact. Entry convergence alone is insufficient; deferred compatibility roots and their referenced JS/CSS dependencies must be byte-identical before bridge execution is accepted.',
 canonicalMutation:false
};
const manifest={...payload,manifestSha256:sha256(Buffer.from(JSON.stringify(payload)))};
writeFileSync(join(process.cwd(),'dist','omega-bridge-continuity-r499.json'),JSON.stringify(manifest,null,2)+'\n','utf8');
console.log(`R499 BRIDGE MANIFEST PASS · ${assets.length} exact deferred assets · roots ${roots.join(', ')} · source ${manifest.sourceSha}`);
