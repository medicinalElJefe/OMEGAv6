import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compileWovenExecutionGraphR142,createWovenExecutionGraphR142,advanceWovenGraphsR142,readWovenExecutionGraphR142,manifestR142} from '../src/wovenExecutionGraphR142.js';

const must=(ok,msg)=>assert.ok(ok,'R142 '+msg);
const read=p=>fs.readFileSync(p,'utf8');
class RuntimeMock{
 constructor(devices=[]){this.store=new Map();this.deviceRows=devices;this.events=[]}
 async get(k,f){return this.store.has(k)?this.store.get(k):f}
 async put(k,v){this.store.set(k,v)}
 async devices(){return this.deviceRows}
 async event(type,message,data={}){const row={type,message,data};this.events.push(row);return row}
}
const caps=['INDEX','HASH_TREE','BUILD','TEST','PACKAGE','SUPPORT_BUNDLE','WORKBOOK_AUDIT'];
const devices=[
 {id:'pc-alpha',name:'Alpha',online:true,revoked:false,capabilityRevision:'R132',capabilities:caps,lastSeen:1},
 {id:'pc-beta',name:'Beta',online:true,revoked:false,capabilityRevision:'R132',capabilities:caps,lastSeen:1}
];
const tasks=[
 {id:'scan-a',label:'Independent source census',dependsOn:[],writeSet:[],preferredDeviceId:'pc-alpha',steps:[{id:'S01',op:'INDEX',path:'OMEGA'}]},
 {id:'scan-b',label:'Independent source hash',dependsOn:[],writeSet:[],preferredDeviceId:'pc-beta',steps:[{id:'S01',op:'HASH_TREE',path:'OMEGA'}]},
 {id:'join',label:'Join evidence bundle',dependsOn:['scan-a','scan-b'],writeSet:[],preferredDeviceId:'pc-alpha',steps:[{id:'S01',op:'SUPPORT_BUNDLE',path:'OMEGA'}]}
];
const input={objective:'Prove one distributed bounded execution graph',projectPath:'OMEGA',replicaPolicy:'HASH_MATCHED_REPLICAS',maxParallel:2,deviceIds:['pc-alpha','pc-beta'],tasks};
const previewRuntime=new RuntimeMock(devices);
const preview=await compileWovenExecutionGraphR142(previewRuntime,input);must(preview.ok,'valid two-replica graph must compile');must(preview.candidateDevices.length===2,'both current authenticated devices must be candidates');must(preview.graphCore.topology.indexOf('join')>preview.graphCore.topology.indexOf('scan-a'),'dependency topology must order join after parent');
const badMutation=await compileWovenExecutionGraphR142(previewRuntime,{...input,tasks:[{id:'bad',dependsOn:[],writeSet:[],steps:[{id:'S01',op:'WRITE_TEXT',path:'OMEGA/x.txt',createOnly:true,content:'x'}]}]});must(!badMutation.ok&&badMutation.errors.some(x=>x.includes('writeSet')),'mutating task without declared writeSet must be rejected');
const cyclic=await compileWovenExecutionGraphR142(previewRuntime,{...input,tasks:[{id:'a',dependsOn:['b'],writeSet:[],steps:[{op:'INDEX',path:'OMEGA'}]},{id:'b',dependsOn:['a'],writeSet:[],steps:[{op:'HASH_TREE',path:'OMEGA'}]}]});must(!cyclic.ok&&cyclic.errors.some(x=>x.includes('cycle')),'dependency cycle must be rejected');
const unconfirmed=await createWovenExecutionGraphR142(previewRuntime,input,'bridge');must(!unconfirmed.ok&&unconfirmed.code==='GRAPH_CONFIRMATION_REQUIRED','graph execution requires explicit confirmation');

const runtime=new RuntimeMock(devices);const created=await createWovenExecutionGraphR142(runtime,{...input,confirmedGraph:true},'bridge-r142');must(created.ok,'confirmed graph must create');const graphId=created.graph.id;let graph=runtime.store.get('r142Graph:'+graphId);must(graph.state==='ATTESTING'&&graph.attestations.length===2,'multi-device graph must begin with one attestation per candidate replica');must((runtime.store.get('jobs')||[]).filter(x=>x.action==='ATTEST_REPLICA').length===2,'attestation must use real Hybrid jobs');
const H='c'.repeat(64),proof=(device,tree)=>({schema:'OMEGA_HYBRID_PROOF_SCAR_REPLAY_R141',state:'VERIFIED_EXECUTION_RETURN',finalHeadSha256:'d'.repeat(64),fingerprint:{verified:true,supplied:'a'.repeat(64)},input:{core:{stepProofs:tree?[{id:'S01',ok:true,result:{treeSha256:tree}}]:[{id:'S01',ok:true,result:{ok:true}}]},job:{targetDeviceId:device}},continuity:{headSha256:'d'.repeat(64),count:1,scarCount:0,proofCount:1}});
await advanceWovenGraphsR142(runtime,graph.attestations[0].jobId,proof('pc-alpha',H));graph=runtime.store.get('r142Graph:'+graphId);must(graph.state==='ATTESTING','one replica hash cannot admit multi-device execution');
await advanceWovenGraphsR142(runtime,graph.attestations[1].jobId,proof('pc-beta',H));graph=runtime.store.get('r142Graph:'+graphId);must(graph.replicaInvariant.state==='HASH_MATCH_VERIFIED'&&graph.replicaInvariant.workspaceSha256===H,'matching returned HASH_TREE identities must admit replica set');must(graph.admittedDeviceIds.length===2,'both hash-matched devices must be admitted');
const scanA=graph.tasks.find(x=>x.id==='scan-a'),scanB=graph.tasks.find(x=>x.id==='scan-b');must(scanA.state==='QUEUED'&&scanB.state==='QUEUED','independent parents must queue in same scheduling wave');must(scanA.assignedDeviceId==='pc-alpha'&&scanB.assignedDeviceId==='pc-beta','independent work must really fan out to distinct preferred authenticated executors');
await advanceWovenGraphsR142(runtime,scanA.jobId,proof('pc-alpha'));graph=runtime.store.get('r142Graph:'+graphId);must(graph.tasks.find(x=>x.id==='join').state==='PENDING','join cannot advance while any dependency lacks verified R141 closure');
await advanceWovenGraphsR142(runtime,scanB.jobId,proof('pc-beta'));graph=runtime.store.get('r142Graph:'+graphId);const join=graph.tasks.find(x=>x.id==='join');must(join.state==='QUEUED','join must queue only after both verified dependency proofs close');
await advanceWovenGraphsR142(runtime,join.jobId,proof(join.assignedDeviceId));graph=runtime.store.get('r142Graph:'+graphId);must(graph.state==='COMPLETE','all verified graph tasks must close graph');must(graph.joinReceipt?.state==='VERIFIED_JOIN'&&graph.joinReceipt?.canonicalMutation===false,'graph must emit deterministic evidence join without CanonState mutation');must(runtime.store.get('r141WorldHead')?.headSha256===graph.joinReceipt.worldHeadSha256,'R142 join must append into preserved R134/R141 world continuity head');must(graph.tasks.every(x=>x.closureRef?.fingerprintVerified===true),'every completed dependency path must carry verified R141 proof');

const driftRuntime=new RuntimeMock(devices);const driftCreated=await createWovenExecutionGraphR142(driftRuntime,{...input,confirmedGraph:true},'bridge-drift');let drift=driftRuntime.store.get('r142Graph:'+driftCreated.graph.id);await advanceWovenGraphsR142(driftRuntime,drift.attestations[0].jobId,proof('pc-alpha','1'.repeat(64)));drift=driftRuntime.store.get('r142Graph:'+drift.id);await advanceWovenGraphsR142(driftRuntime,drift.attestations[1].jobId,proof('pc-beta','2'.repeat(64)));drift=driftRuntime.store.get('r142Graph:'+drift.id);must(drift.state==='HELD'&&drift.hold?.code==='REPLICA_DRIFT','different workspace hashes must scar and hold instead of merging');must(drift.joinReceipt?.state==='HELD','replica drift must produce an explicit continuity hold receipt');

const manifest=manifestR142();for(const law of ['MULTI_DEVICE_EXECUTION_REQUIRES_HASH_MATCHED_WORKSPACE_REPLICAS','DEPENDENCY_EDGES_ADVANCE_ONLY_FROM_VERIFIED_R141_CLOSURE','REPLICA_DRIFT_BECOMES_SCAR_AND_HOLD_NOT_SILENT_MERGE','GRAPH_JOIN_IS_R134_PROOF_CONTINUITY_NOT_CANONSTATE','R125_REMAINS_CANONICAL_ADMISSION_AUTHORITY'])must(manifest.laws.includes(law),'manifest missing '+law);must(manifest.executorAuthority.native.includes('AUTHENTICATED'),'native executor authority must remain heartbeat/authentication bound');must(manifest.canonicalMutation===false&&manifest.canonicalAdmissionAuthority==='R125','R142 manifest must preserve R125 admission');

const worker=read('src/workerR116.js'),ui=read('src/WovenExecutionGraphR142.tsx'),hybrid=read('src/HybridLinkR32.tsx'),r141=read('src/hybridProofClosureR141.js'),r140=read('src/world/operationWorldBridgeR140.ts'),r139=read('src/unifiedCapabilityEngineR139.ts'),config=read('wrangler.jsonc');
for(const token of ["from './wovenExecutionGraphR142.js'",'advanceWovenGraphsR142(this,job.id,closure)',"path==='/api/hybrid/execution-graph/r142'",'/api/hybrid/(graphs','wovenExecutionGraph:manifestR142()'])must(worker.includes(token),'canonical Worker missing '+token);must(worker.includes('closeHybridReturnR141(this,job,body)'),'R141 exact-return closure must happen before R142 graph advance');must(config.includes('"main": "src/workerR116.js"'),'canonical Worker entrypoint must remain R116 spine');
for(const token of ['HASH-ATTESTED DISTRIBUTED EXECUTION','/api/hybrid/graphs/preview','/api/hybrid/graphs','HASH_MATCHED_REPLICAS','Parallel build/proof lanes','R125 remains CanonState admission authority'])must(ui.includes(token),'R142 operator missing '+token);must(hybrid.includes('<WovenExecutionGraphR142/>')&&hybrid.includes('R142 WOVEN GRAPH'),'Hybrid Link must mount R142 without hiding R141 closure');
for(const token of ['R141_FINGERPRINT_SCHEMA','REPLAY_MUST_REPRODUCE_THE_SAME_FINAL_CONTINUITY_HEAD'])must(r141.includes(token),'R141 proof authority lost '+token);must(r140.includes('OMEGA_LIVING_WORLD_OPERATION_BRIDGE_R140'),'R140 living world bridge lost');must(r139.includes('OMEGA_UNIFIED_CAPABILITY_ENGINE_R139'),'R139 capability engine lost');
console.log('R142 WOVEN EXECUTION GRAPH PASS · real Hybrid jobs · two-device hash attestation · replica drift hold · verified R141 dependency edges · true fan-out · deterministic R134 join · R139/R140/R141 preserved · R125 admission unchanged');
