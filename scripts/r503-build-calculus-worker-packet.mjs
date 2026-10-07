import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {
 buildCalculusNativeWorkerPacketR503,
 referenceDeterministicWorkerAttestationR503,
 validateWorkerAttestationR503,
} from '../src/system/calculusNativeAutonomyR503.js';

const arg=name=>{const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null};
const packetPath=arg('--packet')||process.env.OMEGA_R503_WORKER_PACKET_PATH||'/tmp/omega-r503-worker-packet.json';
const attestationPath=arg('--attestation')||process.env.OMEGA_R503_WORKER_ATTESTATION_PATH||null;
const baseSha=String(process.env.GITHUB_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'})).trim();
const read=p=>fs.readFileSync(p,'utf8');
const state=JSON.parse(read('public/omega-r170-selfbuild-state.json'));
const heightened=JSON.parse(read('src7/heightenedModeR457.ledger.json'));
const sourceRefs={};
for(const p of ['src/yearCorpusCapabilityGraphR474.ts','src/yearCorpusExecutionR473.ts','src7/heightenedModeR457.ledger.json','src/system/governedSelfBuildContractR245.js','public/omega-r170-selfbuild-state.json']){
 try{sourceRefs[p]=execFileSync('git',['hash-object',p],{encoding:'utf8'}).trim()}catch{sourceRefs[p]='UNAVAILABLE'}
}
const built=buildCalculusNativeWorkerPacketR503({
 baseSha,
 capabilitySource:read('src/yearCorpusCapabilityGraphR474.ts'),
 executionSource:read('src/yearCorpusExecutionR473.ts'),
 heightenedLedger:heightened,
 selfBuildState:state,
 governedSource:read('src/system/governedSelfBuildContractR245.js'),
 sourceRefs,
});
if(!built.valid)throw new Error('R503 calculus-native packet rejected: '+built.reasons.join(','));
fs.mkdirSync(packetPath.split('/').slice(0,-1).join('/')||'.',{recursive:true});
fs.writeFileSync(packetPath,JSON.stringify(built.packet,null,2)+'\n','utf8');
let admission=null;
if(attestationPath){
 const attestation=referenceDeterministicWorkerAttestationR503(built.packet);
 admission=validateWorkerAttestationR503(built.packet,attestation);
 if(!admission.valid)throw new Error('R503 deterministic worker attestation rejected: '+admission.reasons.join(','));
 fs.mkdirSync(attestationPath.split('/').slice(0,-1).join('/')||'.',{recursive:true});
 fs.writeFileSync(attestationPath,JSON.stringify(attestation,null,2)+'\n','utf8');
}
process.stdout.write(JSON.stringify({schema:'OMEGA_R503_WORKER_PACKET_BUILD_RECEIPT',baseSha,contextId:built.packet.contextId,capabilityCount:built.packet.architecture.capabilityCount,packetPath,attestationPath,admission},null,2)+'\n');
