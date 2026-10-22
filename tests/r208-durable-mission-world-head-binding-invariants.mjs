import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const r208=read('src/world/missionWorldHeadBindingR208.ts');
const r140=read('src/world/operationWorldBridgeR140.ts');
const r149=read('src/world/durableWorldHeadContinuityR149.ts');
const r86=read('src/omegaOperationBusR86.ts');
const r206=read('src/MissionWorldContinuityR206.tsx');
const app=read('src/App.tsx');
const project=read('src/omegaProjectContinuityR87.ts');
const must=(v,m)=>assert.ok(v,m);

for(const token of ['OMEGA_MISSION_WORLD_HEAD_BINDING_R208','buildMissionContinuity','MISSION_WORLD_CONTINUITY_BOUND','missionCarryHash','missionScarIds','R140','R134','R149','R97','R125'])must(r208.includes(token),`R208 missing ${token}`);
for(const law of [
 'R204_MISSION_PROOF_SCAR_CONTINUITY_IS_BOUND_AS_LINEAGE_NOT_EXECUTION_PROOF',
 'R140_REMAINS_THE_ONLY_OPERATION_TO_LIVING_WORLD_BRIDGE',
 'R134_REMAINS_THE_CANONICAL_WORLD_CONTINUITY_AUTHORITY',
 'R149_REMAINS_THE_EXISTING_WORLD_HEAD_PERSISTENCE_PATH',
 'R97_REMAINS_THE_EXISTING_AUTHENTICATED_DURABLE_CONTINUITY_TRANSPORT',
 'NO_NEW_DURABLE_OBJECT_EXECUTOR_OR_CANON_AUTHORITY',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
])must(r208.includes(law),`R208 law missing ${law}`);

must(r86.includes("|'REFLEX_MISSION_ASSEMBLED'|'EVIDENCE_BOUND_SCENE_INGRESSED'|'MISSION_WORLD_CONTINUITY_BOUND'"),'R208 must add one bounded R86 operation type without replacing inherited types');
must(r208.includes("window.addEventListener('omega-r206-mission-continuity'"),'R208 must attach to existing R206 mission event');
must(r208.includes("emitOperationR86({"),'R208 must reuse existing R86 operation bus');
for(const forbidden of ['fetch(','api.post(','api.put(','runtime.put','new DurableObject','canonicalMutation:true','directPhotorealValidation:true','nativeExecutionClaimed:true'])must(!r208.includes(forbidden),`R208 gained forbidden authority ${forbidden}`);

must(r140.includes("const missionId=text(p.missionId)||event.id"),'R140 must accept explicit R208 mission identity');
must(r140.includes("const missionPlanDigest=text(p.missionCarryHash)||event.sha256"),'R140 must hash the mission carry digest into the world mission event');
must(r140.includes("mission:{id:missionId,planDigest:missionPlanDigest,scarIds}"),'R140 must carry mission ID/digest/scar lineage into R136/R134');
must(r149.includes("window.addEventListener('omega-r140-world-frame'"),'R149 must remain the existing world-head persistence consumer');
must(project.includes("if(!getHybridBridge())return{ok:false,state:'PAIRING_REQUIRED'}"),'R97 durable sync must remain authenticated Hybrid gated');

must(app.includes("import {installMissionWorldHeadBindingR208} from './world/missionWorldHeadBindingR208'"),'R208 installer import missing');
must(app.includes('installLivingWorldOperationBridgeR140();installRuntimeAttestationWorldScarR145();installDurableWorldHeadContinuityR149();installReflexOperationIngressR160();const stopMissionWorldBinding=installMissionWorldHeadBindingR208()'),'R208 must install after the inherited R140/R145/R149/R160 chain');
must(r206.includes('R204 → R206 → R208'),'R206 visual surface must expose the new durable binding lineage');
must(r206.includes('World R134 · persist R149/R97'),'R206 must show the existing world/persistence authorities');
must(r206.includes('COMPUTED PHOTOREAL REALITY UNPROVEN'),'R206 must preserve computed-reality truth boundary');

console.log('R208 durable mission-world head binding invariants: PASS');
