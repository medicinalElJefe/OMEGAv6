import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {agentId,createFabric,getAgent,baseline,SIZE,submitTask,stepFabric,serializeFabricR888} from '../src/sphereAgentFabricR887.mjs';
import {R895_SCHEMA,R895_MAX_VALUES,validateDurableR895} from '../src/sphereDurableCheckpointR895.mjs';
assert.equal(R895_MAX_VALUES,248832);
const fabric=createFabric(),root=agentId(4,137),session={agent:root,memberCount:12,stepCursor:7291,batch:64,mode:'ALL_20736',selectedInner:731};
const agents=[];for(let i=0;i<12;i++){const a=getAgent(fabric,root+i);agents.push(a);for(let inner=0;inner<SIZE;inner++)a.values.set(inner,baseline(a.id,inner))}
const record=validateDurableR895(fabric,session);
assert.equal(record.schema,R895_SCHEMA);assert.equal(record.activeAgents,12);assert.equal(record.modifiedValues,248832);
assert.equal(record.session.stepCursor,7291);
const copied=structuredClone(record);
assert.ok(copied.fabric.active instanceof Map);
assert.equal(copied.fabric.active.get(root).values.size,20736);
assert.equal(copied.fabric.active.get(root).values.get(20735),baseline(root,20735),'float64 survives structured clone');
assert.equal(validateDurableR895(copied.fabric,copied.session).modifiedValues,248832);
// R974: existing coordinates remain writable at the durable limit, but a
// new coordinate is refused before dequeue, activation, tick or epoch mutation.
const capped=structuredClone(fabric);
submitTask(capped,{agent:root,kind:'RELAX',inner:0});
assert.equal(stepFabric(capped,1).length,1);
submitTask(capped,{agent:root+12,kind:'RELAX',inner:0});
const beforeRefusal=structuredClone(capped);
assert.throws(()=>stepFabric(capped,1),/Durable state budget exceeded/);
assert.deepEqual(capped,beforeRefusal);
const overflow=createFabric();overflow.sequence=Number.MAX_SAFE_INTEGER;
assert.throws(()=>submitTask(overflow,{agent:root,kind:'OBSERVE'}),/sequence exhausted/);
assert.equal(overflow.queue.length,0);
const extra=getAgent(fabric,root+12);extra.values.set(0,.123);
assert.throws(()=>validateDurableR895(fabric,session),/budget exceeded/);
fabric.active.delete(extra.id);
agents[0].values.set(0,NaN);assert.throws(()=>validateDurableR895(fabric,session),/float64/);agents[0].values.set(0,baseline(root,0));
agents[0].values.set(SIZE,0.4);assert.throws(()=>validateDurableR895(fabric,session),/Invalid durable agent|float64/);agents[0].values.delete(SIZE);
assert.throws(()=>validateDurableR895(fabric,{...session,memberCount:13}),/session/);
assert.throws(()=>validateDurableR895(fabric,{...session,stepCursor:-1}),/session/);
assert.throws(()=>validateDurableR895(fabric,{...session,batch:65}),/session/);
assert.throws(()=>validateDurableR895(fabric,{...session,mode:'UNBOUNDED'}),/session/);
const forged=createFabric(),peer=getAgent(forged,root);
forged.tick=1;forged.sequence=1;
peer.memory.push({taskId:1,tick:1,agent:root,inner:0,kind:'EXCHANGE',peer:root+1,
 before:.8,after:.8,peerBefore:.8,peerAfter:.1,conservationResidual:0});
assert.throws(()=>validateDurableR895(forged,session),/memory receipt/);
// R973: validate real executor receipts, then exercise independent corruptions.
const real=createFabric();
for(let i=0;i<3;i++){submitTask(real,{agent:root,kind:'OBSERVE',inner:i});stepFabric(real,1)}
submitTask(real,{agent:root,kind:'OBSERVE',inner:4});
assert.equal(validateDurableR895(real,session).fabric.tick,3);
const wrongOwner=structuredClone(real);
wrongOwner.active.get(root).memory[0].agent=root+1;
assert.throws(()=>validateDurableR895(wrongOwner,session),/memory receipt/);
const duplicate=structuredClone(real);
duplicate.receipts[1]=duplicate.receipts[0];
assert.throws(()=>validateDurableR895(duplicate,session),/ledger receipt/);
const reordered=structuredClone(real);
reordered.active.get(root).memory.reverse();
assert.throws(()=>validateDurableR895(reordered,session),/memory receipt/);
const replay=structuredClone(real);
replay.queue[0].id=2;
assert.throws(()=>validateDurableR895(replay,session),/pending task/);
const ui=readFileSync('src/SphereAgentInstrumentR887.tsx','utf8');
for(const token of ['saveDurableR895','restoreDurableR895','Save full-state durable checkpoint','Restore full-state durable checkpoint','data-r895-exact-inner-value','Full-state checkpoints use atomic IndexedDB'])assert.ok(ui.includes(token),token+' missing');
for(const token of ['setInterval(()=>{if(durableBusy.current)return','const saveCheckpoint=()=>{if(durableBusy.current)return','const restoreCheckpoint=()=>{if(durableBusy.current)return','setDurablePending(true);setRunning(false);try{const receipt=await saveDurableR895','disabled={durablePending} aria-pressed={running}','if(durableBusy.current)return;setActiveInner(innerPage*144+i)'])
 assert.ok(ui.includes(token),'R968 durable operation isolation missing: '+token);
const source=readFileSync('src/sphereDurableCheckpointR895.mjs','utf8');
for(const token of ['structuredClone(fabric)','indexedDB.open(DB,1)','tx.objectStore(STORE).put(record,KEY)','tx.oncomplete','R895_MAX_VALUES','validateDurableR895(record.fabric,record.session)'])assert.ok(source.includes(token),token+' missing');
assert.ok(!source.includes('api.post'),'R895 persistence never creates cloud tasks');
for(const token of ['nestedAddress(globalId)','nestedId(selected,activeInner)','data-r895-global-address','Go to exact nested address','Global address navigation refused'])assert.ok(ui.includes(token),'R895 full nested address UI is missing: '+token);
for(const token of ['exportDurablePortableR895','importDurablePortableR895','R895_PORTABLE_MAX_BYTES','Portable checkpoint integrity mismatch; import refused'])assert.ok(source.includes(token),'Missing R895 portable transfer contract '+token);
for(const token of ['Export portable checkpoint JSON','Import portable checkpoint JSON','exportPortable','importPortable'])assert.ok(ui.includes(token),'Missing R895 portable UI '+token);
for(const token of ['durableBusy=useRef(false)','if(durableBusy.current)return','finally{durableBusy.current=false;setDurablePending(false)}','disabled={durablePending}'])assert.ok(ui.includes(token),'R895 concurrent checkpoint protection missing: '+token);
for(const token of ["globalThis.crypto?.subtle","digest('SHA-256'","record.integrity=await integrityDigestR895(record)","Durable checkpoint integrity mismatch; restore refused"])assert.ok(source.includes(token),'Missing checkpoint integrity guarantee '+token);
// R170 WORKFLOW GOVERNOR: R895 must reuse the canonical release controllers,
// never create an extra active CI authority or raise the governed cap.
const governedPolicy=JSON.parse(readFileSync('public/omega-r170-self-build-governor.json','utf8')).successorWorkflowPolicy;
const workflowNames=readdirSync('.github/workflows').filter(name=>/\.ya?ml$/i.test(name));
const activeAuthorities=workflowNames.filter(name=>name!=='r2461-legacy-ref-cleanup.yml');
assert.ok(activeAuthorities.length<=governedPolicy.maxActiveWorkflowAuthorities,'R895 exceeded R170 active workflow authority count');
assert.match(execFileSync(process.execPath,['scripts/verify_workflow_topology_r170.mjs'],{encoding:'utf8'}),/"result": "PASS"/,'R895 release candidate must preserve the entire R170 workflow topology, not just the count');
for(const removed of ['r894-exact-continuity-proof.yml','r895-exact-portable-proof.yml','r895-full-inherited-integration.yml'])
 assert.ok(!workflowNames.includes(removed),'temporary candidate workflow must not survive release candidate: '+removed);
console.log('R895 PASS: 248,832 exact float64 modified values (12 full 20,736D agents), atomic durable storage contract, fail-closed bounds and restored Map identity.');

 // R987: exact byte roundtrip and real executor continuation, including
 // a pending operator command, nonzero cursor, peer/phase exchanges and wrap.
const {encodeDurablePortableR987,decodeDurablePortableR987}=await import('../src/sphereDurableCheckpointR895.mjs');
const {collectiveMembersR890}=await import('../src/sphereCollectiveR890.mjs');
const {autonomousSweepR893}=await import('../src/sphereFullInnerSweepR893.mjs');
const replayMembers=collectiveMembersR890(root,12),live=createFabric();
let cursor=0;
for(let i=0;i<16;i++)cursor=autonomousSweepR893(live,replayMembers,cursor,64).nextStepCursor;
submitTask(live,{agent:root,kind:'OBSERVE',inner:42});
const savedSession={...session,stepCursor:cursor};
const bytes=await encodeDurablePortableR987(live,savedSession);
const decoded=await decodeDurablePortableR987(bytes);
assert.deepEqual(decoded.fabric,live);
assert.deepEqual(decoded.session,savedSession);
assert.equal(await encodeDurablePortableR987(decoded.fabric,decoded.session),bytes);
const malformed=JSON.parse(bytes);
const rawAgents=malformed.fabric.active.__omega_r895_map__;
rawAgents.push(rawAgents[0]);
await assert.rejects(()=>decodeDurablePortableR987(JSON.stringify(malformed)),/duplicate portable map key/);
const nestedDuplicate=JSON.parse(bytes);
const valueRows=nestedDuplicate.fabric.active.__omega_r895_map__.find(([,a])=>a.values.__omega_r895_map__.length>0)[1].values.__omega_r895_map__;
valueRows.push(valueRows[0]);
await assert.rejects(()=>decodeDurablePortableR987(JSON.stringify(nestedDuplicate)),/duplicate portable map key/);
const invalidPair=JSON.parse(bytes);invalidPair.fabric.active.__omega_r895_map__[0].push('extra');
await assert.rejects(()=>decodeDurablePortableR987(JSON.stringify(invalidPair)),/portable map key/);
const alteredCensus=JSON.parse(bytes);alteredCensus.modifiedValues++;
await assert.rejects(()=>decodeDurablePortableR987(JSON.stringify(alteredCensus)),/census mismatch/);
const alteredSession=JSON.parse(bytes);alteredSession.session.stepCursor++;
await assert.rejects(()=>decodeDurablePortableR987(JSON.stringify(alteredSession)),/integrity mismatch/);
let restoredCursor=decoded.session.stepCursor;
const priorityA=autonomousSweepR893(live,replayMembers,cursor,64),priorityB=autonomousSweepR893(decoded.fabric,replayMembers,restoredCursor,64);
assert.equal(priorityA.mode,'OPERATOR_QUEUE_FIRST');assert.deepEqual(priorityA,priorityB);
assert.equal(priorityA.nextStepCursor,cursor);
let replayCount=0;
for(let i=0;i<32;i++){
 const a=autonomousSweepR893(live,replayMembers,cursor,64),b=autonomousSweepR893(decoded.fabric,replayMembers,restoredCursor,64);
 assert.deepEqual(a,b);cursor=a.nextStepCursor;restoredCursor=b.nextStepCursor;replayCount+=a.receipts.length;
}
assert.equal(replayCount,2048);assert.equal(cursor,restoredCursor);assert.deepEqual(decoded.fabric,live);
assert.equal(await encodeDurablePortableR987(decoded.fabric,{...session,stepCursor:cursor}),await encodeDurablePortableR987(live,{...session,stepCursor:cursor}));
console.log('R987 PASS: actual portable state roundtrip and 2,048 identical resumed operations plus queued operator priority; malformed maps/census/digest rejected.');

 // R990 exact recursive addressing, with direct binding to the existing state.
const {encodePathR990,decodePathR990,flattenPathR990,expandIndexR990,parentPathR990,childPathR990,commonAncestorR990,ancestorsR990,resolveRecursiveStateR990,queryRecursiveRegionR990,RECURSIVE_PATH_MAX_DEPTH_R990}=await import('../src/sphereAgentFabricR887.mjs');
const rootPath990=encodePathR990([]),deep990=encodePathR990([12348,6221,19385]);
assert.equal(deep990,'omega://atlas/root/012348/006221/019385');
assert.deepEqual(decodePathR990(deep990),[12348,6221,19385]);
assert.equal(parentPathR990(rootPath990),null);
assert.equal(childPathR990(parentPathR990(deep990),19385),deep990);
assert.equal(commonAncestorR990(deep990,encodePathR990([12348,6221,0])),parentPathR990(deep990));
assert.equal(ancestorsR990(deep990).length,3);
for(let depth=0;depth<=RECURSIVE_PATH_MAX_DEPTH_R990;depth++){
 const digits=Array(depth).fill(20735),flat=flattenPathR990(digits);
 assert.equal(flat.index,20736n**BigInt(depth)-1n);
 assert.deepEqual(expandIndexR990(flat.index,depth),digits);
 assert.deepEqual(decodePathR990(encodePathR990(digits)),digits);
}
for(const bad of ['omega://atlas/root/0','omega://atlas/root/020736','omega://atlas/root/000000/','omega://atlas/root/00000a','other'])assert.throws(()=>decodePathR990(bad));
assert.throws(()=>flattenPathR990(Array(65).fill(0)));
assert.throws(()=>expandIndexR990(20736n,1));
assert.throws(()=>expandIndexR990(1,1));
const recursiveFabric=createFabric(),selectedPath990=encodePathR990([137,731]);
assert.equal(resolveRecursiveStateR990(recursiveFabric,4,selectedPath990).value,baseline(root,731));
getAgent(recursiveFabric,root).values.set(731,.123);
assert.equal(resolveRecursiveStateR990(recursiveFabric,4,selectedPath990).value,.123);
assert.equal(resolveRecursiveStateR990(recursiveFabric,4,selectedPath990).state,'STORED_R887_OVERRIDE');
const before990=structuredClone(recursiveFabric),region990=queryRecursiveRegionR990(recursiveFabric,4,selectedPath990,20592,144);
assert.equal(region990.length,144);assert.equal(region990.at(-1).path,childPathR990(selectedPath990,20735));
assert.deepEqual(region990,queryRecursiveRegionR990(recursiveFabric,4,selectedPath990,20592,144));
assert.ok(region990.every(row=>row.state==='GENERATED_RECURSIVE_SCALAR_R990'&&!row.materialized&&row.value>=0&&row.value<=1));
assert.deepEqual(recursiveFabric,before990);
assert.throws(()=>queryRecursiveRegionR990(recursiveFabric,4,selectedPath990,20735,2));
assert.ok(ui.includes('data-r990-recursive=')&&ui.includes('Open existing state executor'));
console.log('R990 PASS: 0–64 depth exact BigInt paths; existing depth-two state binding, bounded deterministic deeper region inspection without allocation.');

 // R991: deeper mutations share existing fabric and portable persistence.
const {executeRecursiveR991,recursiveSiblingR991,validateRecursiveStoreR991,restoreFabricR888,R991_MAX_OVERRIDES}=await import('../src/sphereAgentFabricR887.mjs');
const deepState991=childPathR990(selectedPath990,31),peerState991=recursiveSiblingR991(deepState991,0);
const original991=resolveRecursiveStateR990(recursiveFabric,4,deepState991);
const first991=executeRecursiveR991(recursiveFabric,{shell:4,path:deepState991,kind:'RELAX_PARENT',weight:.25,expectedRevision:0});
assert.equal(first991.changes[0].after,original991.value+.25*(.123-original991.value));
assert.equal(resolveRecursiveStateR990(recursiveFabric,4,deepState991).revision,1);
const pair991=executeRecursiveR991(recursiveFabric,{shell:4,path:deepState991,kind:'EXCHANGE_SIBLING',weight:.25,phase:0,expectedRevision:1,expectedPeerRevision:0});
assert.equal(pair991.changes[1].path,peerState991);assert.ok(Math.abs(pair991.residual)<=1e-12);
assert.equal(validateRecursiveStoreR991(recursiveFabric),2);
assert.equal(resolveRecursiveStateR990(recursiveFabric,4,selectedPath990).value,.123);
assert.equal(resolveRecursiveStateR990(recursiveFabric,5,deepState991).revision,0);
const unchanged991=structuredClone(recursiveFabric);
assert.throws(()=>executeRecursiveR991(recursiveFabric,{shell:4,path:deepState991,kind:'EXCHANGE_SIBLING',weight:.25,phase:0,expectedRevision:1,expectedPeerRevision:2}),/Stale/);
assert.deepEqual(recursiveFabric,unchanged991);
assert.throws(()=>executeRecursiveR991(recursiveFabric,{shell:4,path:selectedPath990,kind:'RELAX_PARENT',weight:.25,expectedRevision:0}),/Depth three/);
const deepRoundtrip991=await decodeDurablePortableR987(await encodeDurablePortableR987(recursiveFabric,session));
assert.deepEqual(deepRoundtrip991.fabric,recursiveFabric);
const next991={shell:4,path:deepState991,kind:'RELAX_PARENT',weight:.5,expectedRevision:2};
assert.deepEqual(executeRecursiveR991(deepRoundtrip991.fabric,next991),executeRecursiveR991(recursiveFabric,next991));
assert.deepEqual(deepRoundtrip991.fabric,recursiveFabric);
const corrupt991=structuredClone(recursiveFabric);
corrupt991.recursive.entries['4:'+deepState991].value=.999;
assert.throws(()=>validateDurableR895(corrupt991,session),/return mismatch/);
const legacy991=restoreFabricR888(serializeFabricR888(recursiveFabric));
assert.deepEqual(legacy991.recursive,recursiveFabric.recursive);
const capped991=createFabric();capped991.recursive={revision:0,entries:{},receipts:[]};
for(let i=0;i<R991_MAX_OVERRIDES;i++)capped991.recursive.entries['4:'+childPathR990(selectedPath990,i)]={value:.5,revision:0};
const beforeCap991=structuredClone(capped991);
assert.throws(()=>executeRecursiveR991(capped991,{shell:4,path:childPathR990(selectedPath990,R991_MAX_OVERRIDES),kind:'RELAX_PARENT',weight:.25,expectedRevision:0}),/budget exceeded/);
assert.deepEqual(capped991,beforeCap991);
assert.ok(ui.includes('Relax toward parent state')&&ui.includes('Conserved sibling exchange'));
console.log('R991 PASS: deeper operator arithmetic, version conflicts, isolation, durable and legacy replay, corrupt return and budget refusal.');
