import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {R170_CAPSULES,R170_LAWS,R170_MAX_AUTONOMOUS_GENERATIONS,ensureR170State,geometricMotionFrameR170,geometricMotionScoreR170} from '../scripts/r170-geometric-motion-selfbuild.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const state=JSON.parse(read('public/omega-r124-selfbuild-state.json'));
const runtime=read('src/selfBuildRuntimeR124.ts');
const engine=read('scripts/r124-selfbuild-engine.mjs');
const helper=read('scripts/r170-geometric-motion-selfbuild.mjs');
const workflow=read('.github/workflows/r124-self-contained-continuous-build.yml');
const woven=read('src/weaveStateR100.ts');
const buildout=read('src/WovenBuildOutPanel.tsx');
const continuum=read('src/AutonomousBuildContinuumR170.tsx');
const calculus=read('src/system/appliedCalculusAuthorityR168.ts');
const accuracy=read('scripts/r125-accuracy-engine.mjs');
const must=(ok,msg)=>assert.ok(ok,`R170 geometric-motion autonomous build invariant failed: ${msg}`);

must(R170_MAX_AUTONOMOUS_GENERATIONS===12,'autonomous roadmap must remain bounded to twelve declared generations');
must(R170_CAPSULES.length===4,'R170 must add exactly four declared continuation capsules');
assert.deepEqual(R170_CAPSULES.map(x=>x.id),['SB009','SB010','SB011','SB012']);
const extended=ensureR170State(state);
must(extended.maxAutonomousGenerations===12,'legacy generation-8 state must extend to the bounded R170 generation-12 envelope');
must(extended.roadmap.length>=12,'R170 must extend rather than replace the admitted R124 roadmap');
for(const id of ['SB001','SB004','SB008','SB009','SB010','SB011','SB012'])must(extended.roadmap.some(x=>x.id===id),`roadmap missing ${id}`);
for(const law of ['GEOMETRIC_MOTION_RELATIVITY_PRIORITIZES_WITHIN_DECLARED_BUILD_BACKLOG_ONLY','AUTONOMOUS_PULSE_NEVER_BYPASSES_SANDBOX_TEST_FRESHNESS_ADMISSION','SCHEDULED_OBSERVATION_MAY_WAKE_BUILD_BUT_MAY_NOT_INVENT_CAPABILITY','NO_MAIN_MUTATION_WITHOUT_EXACT_FRESHNESS_AND_PROOF_GATES'])must(R170_LAWS.includes(law),`R170 law missing ${law}`);

const frame=geometricMotionFrameR170(extended,extended.roadmap);
for(const key of ['phase','phaseBand','orientation','continuity','residual','invariantCarry','scarCarry','angularVelocity','radialPosition','repartitionDemand','effectiveResolution'])must(frame[key]!==undefined,`motion frame missing ${key}`);
must([12,144,1728,20736,248832].includes(frame.effectiveResolution),'effective resolution must remain inside the established atlas resolution hierarchy');
must(frame.boundary.includes('Software/build scheduling geometry only'),'motion frame must explicitly reject physical-motion interpretation');
const ready=extended.roadmap.find(x=>x.id==='SB009');
must(geometricMotionScoreR170(ready,extended,extended.roadmap,1)>0,'dependency-ready R170 candidate must receive a finite positive relative-motion priority');

for(const token of ['R170_GEOMETRIC_MOTION_RELATIVITY_PRIORITIZES_WITHIN_PROVEN_BACKLOG_ONLY','R170_AUTONOMOUS_PULSE_NEVER_BYPASSES_SANDBOX_TEST_FRESHNESS_ADMISSION','R170_SCHEDULED_OBSERVATION_MAY_WAKE_BUILD_BUT_MAY_NOT_INVENT_CAPABILITY','deriveGeometricMotionFrameR170','geometricMotionPriorityR170'])must(runtime.includes(token),`runtime missing ${token}`);
for(const token of ["from './r170-geometric-motion-selfbuild.mjs'",'ensureR170State','geometricMotionFrameR170','geometricMotionScoreR170','R170_MODULES','updateGeneratedIndex','reevaluate on the next geometric motion pulse'])must(engine.includes(token),`engine missing ${token}`);
for(const token of ['Geometric motion relativity field','Development motion scheduler','Autonomous build pulse governor','Proof-carry promotion gate','Software scheduling geometry only','MAIN_NOT_FRESH',"canonicalAdmissionAuthority:'R125'"])must(helper.includes(token),`R170 continuation fabric missing ${token}`);

must(workflow.startsWith('name: OMEGA R124 Self-Contained Continuous Build'),'R170 must preserve the exact workflow identity consumed by the R125 workflow-run sensor');
must(workflow.includes("cron: '17 * * * *'"),'continuous self-build must wake on an hourly observation pulse');
for(const token of ['R124 + R170 autonomous-build invariants','Select next capsule through geometric motion relativity','Observe cleanly when no declared capsule is ready','Abort if main moved during proof run','Commit proved candidate on isolated branch','git push origin HEAD:main','Continue next geometric generation without chat scheduling'])must(workflow.includes(token),`workflow missing ${token}`);
must(workflow.includes('node tests/r170-geometric-motion-autonomous-build-invariants.mjs'),'R170 proof gate must run before and after candidate generation');
must(workflow.includes('receipt.tests={r124:true,r170:true'),'admission receipt must carry the R170 proof result');
must(!workflow.includes('cancel-in-progress: true'),'self-build pulses may not cancel an in-flight proof/admission chain');

for(const token of ['partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition','motionRelativity','orientation','torsion','resolutionDemand'])must(woven.includes(token),`established woven motion calculus missing ${token}`);
for(const token of ["import AutonomousBuildContinuumR170 from './AutonomousBuildContinuumR170'",'<AutonomousBuildContinuumR170 onNavigate={onNavigate}/>','R170 geometric-motion self-build continuum','sandbox + inherited tests + exact main freshness + rollback lineage'])must(buildout.includes(token),`Build Out integration missing ${token}`);
for(const token of ['R170 · GEOMETRIC MOTION AUTONOMOUS BUILD','generation 12','hourly observation pulses','SB009','SB010','SB011','SB012','Geometric motion changes build priority only inside the declared backlog','R125 remains the only CanonState admission authority'])must(continuum.includes(token),`operator continuum missing ${token}`);
for(const token of ["id:'DEVELOPMENT_MOTION'",'R124 governed self-build → R170 geometric motion continuation',"scheduledObservation:'hourly after promotion'",'geometric motion scheduling to bypass proof-gated repository or CanonState admission'])must(calculus.includes(token),`applied calculus authority missing ${token}`);

must(accuracy.includes("revision:'R169'")&&accuracy.includes('FEDERATION_ATTESTATION_WORLD_FAILURE'),'pre-existing R169 federation authority must remain intact and distinct');
must(!helper.includes('FEDERATION_ATTESTATION_WORLD_FAILURE'),'R170 geometric-motion build must not alias the established R169 federation authority');
must(!runtime.includes('R169_GEOMETRIC_MOTION_BUILD'),'collision-prone geometric build identifier must be absent from current runtime authority');
must(!engine.includes("./r169-geometric-motion-selfbuild.mjs"),'self-build engine must not bind the obsolete collision-prone geometric helper');

const proposal=JSON.parse(execFileSync(process.execPath,['scripts/r124-selfbuild-engine.mjs'],{encoding:'utf8'}));
if(Number(state.generation||0)<12){must(['PROPOSE','OBSERVE'].includes(proposal.status),'self-build engine must either propose a declared continuation capsule or observe safely');if(Number(state.generation||0)===8){must(proposal.status==='PROPOSE'&&proposal.capsuleId==='SB009','generation-8 legacy state must advance first into SB009 rather than remain falsely complete');}}
must(proposal.geometricMotionFrame?.revision==='R170','proposal must carry the collision-free R170 geometric motion revision');
must(proposal.geometricMotionFrame?.boundary?.includes('no physical-motion')||proposal.geometricMotionFrame?.boundary?.includes('Software/build scheduling geometry only'),'proposal must carry the non-physical scheduling boundary');

console.log('R170 GEOMETRIC MOTION AUTONOMOUS BUILD PASS · generation 8→12 continuation restored · hourly observation + immediate post-admission continuation · collision with existing R169 federation authority eliminated · declared-only geometric scheduler · Build Out + applied-calculus authority integrated · sandbox/test/freshness admission preserved · no fake physical motion or CanonState authority');
