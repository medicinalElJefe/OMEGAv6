import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const adapter=read('src/world/durableWorldHeadContinuityR149.ts');
const project=read('src/omegaProjectContinuityR87.ts');
const app=read('src/App.tsx');
const bridge=read('src/world/operationWorldBridgeR140.ts');
const world=read('src/world/canonicalWorldContinuityR134.js');
const must=(ok,msg)=>assert.ok(ok,'R149 '+msg);
for(const law of [
 'R140_WORLD_FRAME_IS_THE_ONLY_WORLD_HEAD_INPUT',
 'R134_OPERATION_REF_IS_CONTINUITY_EVIDENCE_NOT_CANONSTATE_ADMISSION',
 'R87_PROJECT_CONTINUITY_REMAINS_THE_BROWSER_CACHE_AND_ORGANIZATION_LAYER',
 'R97_AUTHENTICATED_CONTINUITY_SYNC_REMAINS_THE_ONLY_DURABLE_TRANSPORT_USED_HERE',
 'UNPAIRED_STATE_REMAINS_BROWSER_LOCAL_WITHOUT_FALSE_DURABILITY_CLAIMS',
 'WORLD_HEAD_PERSISTENCE_DOES_NOT_PROVE_PUBLIC_DEPLOYMENT_PC_ONLINE_SOLVER_VALIDITY_OR_PHOTOREAL_REALITY',
 'NO_NEW_DURABLE_OBJECT_OR_CANONSTATE_AUTHORITY_IS_INTRODUCED',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
])must(adapter.includes(`'${law}'`),`missing law ${law}`);
must(adapter.includes("window.addEventListener('omega-r140-world-frame'"),'must consume existing R140 world-frame receipts');
must(adapter.includes('recordProjectWorldRefR149'),'must append world refs through existing R87 continuity state');
must(adapter.includes('syncProjectContinuityR97()'),'must reuse authenticated R97 durable sync');
must(adapter.includes("state:sync?.ok?sync.state:'BROWSER_LOCAL_ONLY'"),'failed/unpaired durability must remain explicitly browser-local');
must(adapter.includes("canonicalAdmissionAuthority:'R125'"),'must preserve R125 admission authority');
must(!adapter.includes('DurableObjectNamespace')&&!adapter.includes('WORLD_ADMISSION_SECRET'),'must not create a parallel durable or admission authority');
for(const token of ['worldRefs?:ProjectWorldRefR149[]','recordProjectWorldRefR149','worldRefs:p.worldRefs||[]','DURABLE_CONTINUITY_REFERENCE_NOT_CANON','OMEGA_CANONICAL_WORLD'])must(project.includes(token),`project continuity missing ${token}`);
must(project.includes("if(!getHybridBridge())return{ok:false,state:'PAIRING_REQUIRED'}"),'R97 durable sync must remain authenticated Hybrid gated');
must(app.includes('installLivingWorldOperationBridgeR140();installDurableWorldHeadContinuityR149();installRuntimeAttestationWorldScarR145()'),'R149 must install after R140 and before R145 can emit operations');
must(bridge.includes("window.dispatchEvent(new CustomEvent('omega-r140-world-frame'"),'R140 must remain world-frame producer');
must(world.includes("authority:'DURABLE_CONTINUITY_REFERENCE_NOT_CANON'"),'R134 ref must remain non-canonical continuity evidence');
must(world.includes("existingTransport:'OMEGA_CONTINUITY_SNAPSHOT_R97.operationRefs'"),'R134 must still declare existing R97 transport');
console.log('R149 DURABLE WORLD HEAD CONTINUITY PASS · R140 frame → R134 operation ref → R87 project snapshot → authenticated R97 sync · no new authority · unpaired remains browser-local');
