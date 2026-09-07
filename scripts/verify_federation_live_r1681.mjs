import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';

const base=(process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev').replace(/\/$/,'');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const artifactAttempts=Math.max(1,Number.parseInt(process.env.OMEGA_RCWA_PROPAGATION_ATTEMPTS||'36',10)||36);
const federationAttempts=Math.max(1,Number.parseInt(process.env.OMEGA_FEDERATION_PROPAGATION_ATTEMPTS||'12',10)||12);
const files=[
  {path:'/api/federation/rcwa/agent-download',file:'public/omega-rcwa-agent.py',marker:'OMEGA Sovereign RCWA transport agent',header:'x-omega-rcwa-agent-sha256'},
  {path:'/api/federation/rcwa/worker-download',file:'public/omega-rcwa-worker.py',marker:'OMEGA Sovereign RCWA Worker R3',header:'x-omega-rcwa-worker-sha256'}
];

async function verifyArtifact(target){
  const expectedBytes=readFileSync(target.file);
  const expected=sha(expectedBytes);
  let last=null;
  for(let attempt=1;attempt<=artifactAttempts;attempt++){
    try{
      const response=await fetch(`${base}${target.path}?r1681_accept=${Date.now()}_${attempt}`,{headers:{'cache-control':'no-cache'}});
      const bytes=Buffer.from(await response.arrayBuffer());
      const source=bytes.toString('utf8');
      const actual=sha(bytes);
      const receipt=response.headers.get(target.header);
      const observation={attempt,httpStatus:response.status,bytes:bytes.length,expectedSha256:expected,actualSha256:actual,receiptSha256:receipt,startsPython:source.startsWith('#!/usr/bin/env python3'),markerPresent:source.includes(target.marker),canonicalOrigin:response.headers.get('x-omega-canonical-origin')};
      const ok=response.ok&&observation.startsPython&&observation.markerPresent&&actual===expected&&receipt===expected&&observation.canonicalOrigin===base;
      if(ok){
        console.log(`R168.1 RCWA ARTIFACT PASS · ${target.path} · attempt ${attempt}/${artifactAttempts} · ${bytes.length} bytes · ${actual}`);
        return observation;
      }
      last=observation;
      console.log(`R168.1 RCWA ARTIFACT PENDING · ${target.path} · ${JSON.stringify(observation)}`);
    }catch(error){
      last={attempt,error:error instanceof Error?error.message:String(error)};
      console.log(`R168.1 RCWA ARTIFACT RETRY · ${target.path} · ${JSON.stringify(last)}`);
    }
    await sleep(5000);
  }
  throw new Error(`${target.path} did not reach byte-exact canonical attestation after ${artifactAttempts} bounded propagation attempts: ${JSON.stringify(last)}`);
}

async function verifyFederation(){
  let last=null;
  for(let attempt=1;attempt<=federationAttempts;attempt++){
    try{
      const response=await fetch(`${base}/api/federation/run/status?r1681_accept=${Date.now()}_${attempt}`,{headers:{'cache-control':'no-cache','x-omega-session-id':'ci_federation_probe_r1681'}});
      const raw=await response.text();
      let status=null;
      try{status=JSON.parse(raw)}catch{}
      const opticalState=status?.nodes?.optical?.state;
      const validOpticalState=['LIVE','ACCESS_GATED','DEGRADED','UNREACHABLE'].includes(opticalState);
      const genesisLive=status?.nodes?.genesis?.state==='LIVE'&&status?.nodes?.genesis?.jsonVerified===true;
      const omegaLive=status?.nodes?.omegaV6?.state==='LIVE';
      if(response.ok&&status?.schema==='OMEGA_FEDERATION_RUN_STATUS_R97'&&omegaLive&&genesisLive&&validOpticalState){
        const machineOptical=status?.machineServices?.optical||null;
        if(machineOptical){
          if(machineOptical.service!=='omega-optical-machine-r1532')throw new Error(`Optical machine identity regressed: ${JSON.stringify(machineOptical)}`);
          if(machineOptical.version!=='R153.2')throw new Error(`Optical machine version regressed: ${JSON.stringify(machineOptical)}`);
          if(machineOptical.authority&&machineOptical.authority!=='SCREEN_ONLY')throw new Error(`Optical authority regressed: ${JSON.stringify(machineOptical)}`);
        }
        console.log(`OMEGA FEDERATION R168.1 LIVE PASS · attempt ${attempt}/${federationAttempts} · Genesis ${status.nodes.genesis.state} · Optical ${opticalState} · Sovereign ${status.nodes.sovereign.state}${machineOptical?` · Optical machine ${machineOptical.service} ${machineOptical.version}`:''}`);
        return status;
      }
      last={attempt,httpStatus:response.status,schema:status?.schema||null,omega:status?.nodes?.omegaV6||null,genesis:status?.nodes?.genesis||null,optical:status?.nodes?.optical||null,raw:raw.slice(0,500)};
    }catch(error){last={attempt,error:error instanceof Error?error.message:String(error)}}
    console.log(`R168.1 FEDERATION STATUS PENDING · ${JSON.stringify(last)}`);
    await sleep(5000);
  }
  throw new Error(`Federation Run did not reach governed live truth after ${federationAttempts} bounded attempts: ${JSON.stringify(last)}`);
}

for(const target of files)await verifyArtifact(target);
await verifyFederation();
console.log('R168.1 FEDERATION + RCWA PROPAGATION ATTESTATION PASS');

if(String(process.env.OMEGA_PROMOTED_SHA||'').trim()){
  await import('./verify_live_execution_control_r199.mjs');
  await import('./verify_live_operational_lifecycle_r200.mjs');
}
