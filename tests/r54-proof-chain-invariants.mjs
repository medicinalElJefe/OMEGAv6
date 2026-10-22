import fs from 'node:fs';
import {compileDeltaMeshR53} from '../src/workerDeltaMeshR53.js';
import {verifyProofChainR54} from '../src/workerProofChainR54.js';
const worker=fs.readFileSync('src/worker.js','utf8'),ui=fs.readFileSync('src/ProofChainSupervisorR54.tsx','utf8'),host=fs.readFileSync('src/LiveStateSpineR50.tsx','utf8');
if(!worker.includes("import {verifyProofChainR54} from './workerProofChainR54.js'"))throw new Error('R54 Worker verifier import missing');
if(!worker.includes('url.pathname==="/api/proof/chain"'))throw new Error('R54 /api/proof/chain route missing');
if(!ui.includes("omega.r53.delta.mesh.journal")||!ui.includes("api.post<ChainProof>('/api/proof/chain'"))throw new Error('R54 browser supervisor is not journal-bound');
if(!host.includes("import ProofChainSupervisorR54 from './ProofChainSupervisorR54'" )||!host.includes('<ProofChainSupervisorR54/>'))throw new Error('R54 supervisor not mounted in live state spine');
if(worker.includes('@appdeploy/client')||ui.includes('@appdeploy/client'))throw new Error('R54 reintroduced AppDeploy dependency');
const packet=(address,c=.7)=>({address,stateId:address+1,identity:{domain:'Structure'},metrics:{continuity:c,plasticity:.6,contradiction:.1,burden:.2,decision:'STAY'},psc:{phase:1},predict:{score:.5},autoPing:{next:address+1}});
const projection={view:'FIELD',frameHash:'r54-a'};
const a=await compileDeltaMeshR53({current:{packet:packet(12),projection}});
const b=await compileDeltaMeshR53({previous:{packet:packet(12),projection},current:{packet:packet(12,.81),projection:{view:'FIELD',frameHash:'r54-b'}},previousCheckpointHash:a.checkpointHash});
const segment=[
 {mode:a.mode,baseHash:a.baseHash,currentHash:a.currentHash,deltaHash:a.deltaHash,snapshotHash:a.snapshotHash,checkpointHash:a.checkpointHash,changedComponents:a.changedComponents,patchCount:a.patches.length,resynced:false},
 {mode:b.mode,baseHash:b.baseHash,currentHash:b.currentHash,deltaHash:b.deltaHash,snapshotHash:b.snapshotHash,checkpointHash:b.checkpointHash,changedComponents:b.changedComponents,patchCount:b.patches.length,resynced:false}
];
const good=await verifyProofChainR54({segment});
if(good.ok!==true||good.schema!=='OMEGA_SUPERVISED_PROOF_CHAIN_R54'||good.health!=='COHERENT')throw new Error(`R54 valid chain rejected: ${JSON.stringify(good.errors)}`);
if(!/^[a-f0-9]{64}$/.test(String(good.segmentHash||'')))throw new Error('R54 segment hash missing');
if(good.recomputed.length!==2||good.recomputed.some(x=>x.match!==true))throw new Error('R54 must recompute every checkpoint');
const tampered=structuredClone(segment);tampered[1].checkpointHash='0'.repeat(64);
const badCheckpoint=await verifyProofChainR54({segment:tampered});
if(badCheckpoint.ok!==false||badCheckpoint.health!=='REGRESSION_DETECTED'||!badCheckpoint.errors.some(x=>x.includes('failed deterministic recomputation')))throw new Error('R54 must detect checkpoint tampering');
const badBase=structuredClone(segment);badBase[1].baseHash='f'.repeat(64);
const badTransition=await verifyProofChainR54({segment:badBase});
if(badTransition.ok!==false||!badTransition.errors.some(x=>x.includes('baseHash does not match prior currentHash')))throw new Error('R54 must detect broken base/current transition');
const duplicated=[segment[0],segment[0]];
const duplicate=await verifyProofChainR54({segment:duplicated});
if(duplicate.ok!==false||!duplicate.errors.some(x=>x.includes('duplicate checkpointHash')))throw new Error('R54 must detect duplicate checkpoints');
if(!String(good.boundary).includes('does not persist the journal')||good.proof?.authority!=='NON_AUTHORITATIVE_CHAIN_VERIFIER'||good.proof?.receivedNotObserved!==true)throw new Error('R54 truth boundary regressed');
console.log('R54 supervised proof-chain invariants PASS');
