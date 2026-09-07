import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {R169_CAPSULES,R169_LAWS,R169_MAX_AUTONOMOUS_GENERATIONS,ensureR169State,geometricMotionFrameR169,geometricMotionScoreR169} from '../scripts/r169-geometric-motion-selfbuild.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const state=JSON.parse(read('public/omega-r124-selfbuild-state.json'));
const runtime=read('src/selfBuildRuntimeR124.ts');
const engine=read('scripts/r124-selfbuild-engine.mjs');
const helper=read('scripts/r169-geometric-motion-selfbuild.mjs');
const workflow=read('.github/workflows/r124-self-contained-continuous-build.yml');
const woven=read('src/weaveStateR100.ts');
const must=(ok,msg)=>assert.ok(ok,`R169 geometric-motion autonomous build invariant failed: ${msg}`);

must(R169_MAX_AUTONOMOUS_GENERATIONS===12,'autonomous roadmap must remain bounded to twelve declared generations');
must(R169_CAPSULES.length===4,'R169 must add exactly four declared continuation capsules');
assert.deepEqual(R169_CAPSULES.map(x=>x.id),['SB009','SB010','SB011','SB012']);
const extended=ensureR169State(state);
must(extended.maxAutonomousGenerations===12,'legacy generation-8 state must extend to the bounded R169 generation-12 envelope');
must(extended.roadmap.length>=12,'R169 must extend rather than replace the admitted R124 roadmap');
for(const id of ['SB001','SB004','SB008','SB009','SB010','SB011','SB012'])must(extended.roadmap.some(x=>x.id===id),`roadmap missing ${id}`);
for(const law of ['GEOMETRIC_MOTION_RELATIVITY_PRIORITIZES_WITHIN_DECLARED_BUILD_BACKLOG_ONLY','AUTONOMOUS_PULSE_NEVER_BYPASSES_SANDBOX_TEST_FRESHNESS_ADMISSION','SCHEDULED_OBSERVATION_MAY_WAKE_BUILD_BUT_MAY_NOT_INVENT_CAPABILITY','NO_MAIN_MUTATION_WITHOUT_EXACT_FRESHNESS_AND_PROOF_GATES'])must(R169_LAWS.includes(law),`R169 law missing ${law}`);

const frame=geometricMotionFrameR169(extended,extended.roadmap);
for(const key of ['phase','phaseBand','orientation','continuity','residual','invariantCarry','scarCarry','angularVelocity','radialPosition','repartitionDemand','effectiveResolution'])must(frame[key]!==undefined,`motion frame missing ${key}`);
must([12,144,1728,20736,248832].includes(frame.effectiveResolution),'effective resolution must remain inside the established atlas resolution hierarchy');
must(frame.boundary.includes('Software/build scheduling geometry only'),'motion frame must explicitly reject physical-motion interpretation');
const ready=extended.roadmap.find(x=>x.id==='SB009');
must(geometricMotionScoreR169(ready,extended,extended.roadmap,1)>0,'dependency-ready R169 candidate must receive a finite positive relative-motion priority');

for(const token of ['R169_GEOMETRIC_MOTION_RELATIVITY_PRIORITIZES_WITHIN_PROVEN_BACKLOG_ONLY','R169_AUTONOMOUS_PULSE_NEVER_BYPASSES_SANDBOX_TEST_FRESHNESS_ADMISSION','R169_SCHEDULED_OBSERVATION_MAY_WAKE_BUILD_BUT_MAY_NOT_INVENT_CAPABILITY','deriveGeometricMotionFrameR169','geometricMotionPriorityR169'])must(runtime.includes(token),`runtime missing ${token}`);
for(const token of ["from './r169-geometric-motion-selfbuild.mjs'",'ensureR169State','geometricMotionFrameR169','geometricMotionScoreR169','R169_MODULES','updateGeneratedIndex','reevaluate on the next geometric motion pulse'])must(engine.includes(token),`engine missing ${token}`);
for(const token of ['Geometric motion relativity field','Development motion scheduler','Autonomous build pulse governor','Proof-carry promotion gate','Software scheduling geometry only','MAIN_NOT_FRESH','canonicalAdmissionAuthority:\'R125\''])must(helper.includes(token),`R169 continuation fabric missing ${token}`);

must(workflow.includes("cron: '17 */3 * * *'"),'continuous self-build must wake on a bounded three-hour observation pulse');
for(const token of ['Select next capsule through geometric motion relativity','Observe cleanly when no declared capsule is ready','Abort if main moved during proof run','Commit proved candidate on isolated branch','git push origin HEAD:main','Continue next geometric generation without chat scheduling'])must(workflow.includes(token),`workflow missing ${token}`);
must(workflow.includes('node tests/r169-geometric-motion-autonomous-build-invariants.mjs'),'R169 proof gate must run before and after candidate generation');
must(!workflow.includes('cancel-in-progress: true'),'self-build pulses may not cancel an in-flight proof/admission chain');

for(const token of ['partition → exchange/transform → invariant carry → scar/residual carry → re-contextualize/repartition','motionRelativity','orientation','torsion','resolutionDemand'])must(woven.includes(token),`established woven motion calculus missing ${token}`);

const proposal=JSON.parse(execFileSync(process.execPath,['scripts/r124-selfbuild-engine.mjs'],{encoding:'utf8'}));
if(Number(state.generation||0)<12){must(['PROPOSE','OBSERVE'].includes(proposal.status),'self-build engine must either propose a declared continuation capsule or observe safely');if(Number(state.generation||0)===8){must(proposal.status==='PROPOSE'&&proposal.capsuleId==='SB009','generation-8 legacy state must advance first into SB009 rather than remain falsely complete');}}
must(proposal.geometricMotionFrame?.boundary?.includes('no physical-motion')||proposal.geometricMotionFrame?.boundary?.includes('Software/build scheduling geometry only'),'proposal must carry the non-physical scheduling boundary');

console.log('R169 GEOMETRIC MOTION AUTONOMOUS BUILD PASS · generation 8→12 continuation restored · declared-only geometric scheduler · recurring observation pulse · sandbox/test/freshness admission preserved · no fake physical motion or CanonState authority');
