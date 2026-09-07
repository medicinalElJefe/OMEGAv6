import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {basename} from 'node:path';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const scope=String(process.env.OMEGA_RCWA_DIAGNOSTIC_SCOPE||'FULL').trim().toUpperCase();
if(!['CANDIDATE','LIVE','FULL'].includes(scope))throw new Error(`Unsupported OMEGA_RCWA_DIAGNOSTIC_SCOPE ${scope}`);
const proveCandidate=scope==='CANDIDATE'||scope==='FULL';
const proveLive=scope==='LIVE'||scope==='FULL';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const targets=[
  {name:'agent',file:'public/omega-rcwa-agent.py',endpoint:'/api/federation/rcwa/agent-download',marker:'OMEGA Sovereign RCWA transport agent',header:'x-omega-rcwa-agent-sha256'},
  {name:'worker',file:'public/omega-rcwa-worker.py',endpoint:'/api/federation/rcwa/worker-download',marker:'OMEGA Sovereign RCWA Worker R3',header:'x-omega-rcwa-worker-sha256'}
];

let failed=false;
for(const target of targets){
  const repoBytes=readFileSync(target.file);
  const repoText=repoBytes.toString('utf8');
  const distPath=`dist/${basename(target.file)}`;
  const distBytes=existsSync(distPath)?readFileSync(distPath):null;
  const record={
    schema:'OMEGA_RCWA_BYTE_DIAGNOSTIC_R1681',
    revision:'R168.1',
    scope,
    target:target.name,
    repo:{path:target.file,bytes:repoBytes.length,sha256:sha(repoBytes),startsPython:repoText.startsWith('#!/usr/bin/env python3'),markerPresent:repoText.includes(target.marker)},
    dist:distBytes?{path:distPath,bytes:distBytes.length,sha256:sha(distBytes),matchesRepo:sha(distBytes)===sha(repoBytes)}:{path:distPath,missing:true},
    authority:{candidate:'repository + built dist bytes',live:'canonical Worker download endpoint + SHA receipt',staticDirectPath:'NON_CANONICAL_OBSERVATION_ONLY'},
  };
  if(proveCandidate){
    record.candidatePass=Boolean(distBytes)&&record.dist.matchesRepo&&record.repo.startsPython&&record.repo.markerPresent;
    if(!record.candidatePass)failed=true;
  }
  if(proveLive){
    const endpointResponse=await fetch(`${base}${target.endpoint}?r1681_diag=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
    const endpointBytes=Buffer.from(await endpointResponse.arrayBuffer());
    const endpointText=endpointBytes.toString('utf8');
    record.endpoint={url:target.endpoint,httpStatus:endpointResponse.status,contentType:endpointResponse.headers.get('content-type'),bytes:endpointBytes.length,sha256:sha(endpointBytes),receiptSha256:endpointResponse.headers.get(target.header),canonicalOrigin:endpointResponse.headers.get('x-omega-canonical-origin'),startsPython:endpointText.startsWith('#!/usr/bin/env python3'),markerPresent:endpointText.includes(target.marker),matchesRepo:sha(endpointBytes)===sha(repoBytes)};
    record.endpoint.receiptMatchesRepo=record.endpoint.receiptSha256===record.repo.sha256;
    record.endpoint.receiptMatchesEndpoint=record.endpoint.receiptSha256===record.endpoint.sha256;
    record.livePass=endpointResponse.ok&&record.endpoint.startsPython&&record.endpoint.markerPresent&&record.endpoint.matchesRepo&&record.endpoint.receiptMatchesRepo&&record.endpoint.receiptMatchesEndpoint&&record.endpoint.canonicalOrigin===base;
    if(!record.livePass)failed=true;
  }
  console.log(JSON.stringify(record,null,2));
}
if(failed)throw new Error(`R168.1 RCWA ${scope} diagnostic found an attestation mismatch. See structured records above.`);
console.log(`R168.1 RCWA ${scope} BYTE DIAGNOSTIC PASS`);
