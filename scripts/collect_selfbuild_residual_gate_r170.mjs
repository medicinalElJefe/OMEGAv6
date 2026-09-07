import fs from 'node:fs';
import {buildDevelopmentResidualGraphR164} from '../src/system/developmentResidualGraphR164.js';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const out=process.env.OMEGA_R170_RESIDUAL_EVIDENCE_PATH||'/tmp/omega-r170-residual-evidence.json';
const get=async path=>{
  const response=await fetch(`${base}${path}?r170_gate=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
  const raw=await response.text();
  if(!response.ok)throw new Error(`${path} HTTP ${response.status}: ${raw.slice(0,400)}`);
  return JSON.parse(raw);
};

let graph;
try{
  const [coreHealth,releaseEvidence,runtimeAttestation,hybrid]=await Promise.all([
    get('/api/core-health'),
    get('/api/release-evidence'),
    get('/api/runtime-attestation'),
    get('/api/hybrid/status')
  ]);
  graph=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth,releaseEvidence,runtimeAttestation,hybrid}});
}catch(error){
  graph=buildDevelopmentResidualGraphR164({runtimeEvidence:{coreHealth:{ok:false,state:'UNREACHABLE',schema:'OMEGA_CANONICAL_CORE_HEALTH_R163'}}});
  graph.collectionError=error instanceof Error?error.message:String(error);
}
fs.writeFileSync(out,JSON.stringify(graph,null,2)+'\n');
console.log(JSON.stringify({schema:'OMEGA_R170_SELFBUILD_RESIDUAL_GATE',state:graph.state,summary:graph.summary,collectionError:graph.collectionError||null,path:out},null,2));
if(graph.state==='BLOCKED')process.exitCode=20;
