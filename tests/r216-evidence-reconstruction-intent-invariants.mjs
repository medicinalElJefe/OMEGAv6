import fs from 'node:fs';
import {compileEvidenceReconstructionIntentR216,manifestR216,R216_SCHEMA,R216_REVISION} from '../src/world/evidenceReconstructionIntentR216.js';

const must=(value,message)=>{if(!value)throw new Error(message)};
const h='a'.repeat(64),h2='b'.repeat(64),h3='c'.repeat(64),h4='d'.repeat(64),h5='e'.repeat(64),h6='f'.repeat(64);
const input={
 mission:{id:'mission-r216',command:'reconstruct evidence-bound Tucson ground scene'},
 anchor:{state:'RENDER_ATTEMPT_CONTINUITY_READY',anchorSha256:h,parentAttemptSha256:h2,parentLineageSha256:h3,worldBindingOperationSha256:h4,previousWorldHeadSha256:h5},
 scene:{eventAccepted:true,renderInputReady:true,earthHash:'earth-source-hash',groundHash:'ground-source-hash',evidenceDigest:'evidence-digest'},
 artifactReceipt:{artifactReceiptSha256:h6,artifact:{sha256:h2,mime:'image/png',byteLength:4096},continuity:{r214AnchorSha256:h},authority:{representationalArtifactGenerated:true,computedRealityFrame:false}},
 projectId:'project-r216'
};

const ready=await compileEvidenceReconstructionIntentR216(input);
must(ready.schema===R216_SCHEMA&&ready.revision===R216_REVISION,'R216 schema/revision mismatch');
must(ready.state==='EVIDENCE_RECONSTRUCTION_INTENT_READY','valid proof inputs must compile a ready reconstruction intent');
must(/^[a-f0-9]{64}$/.test(ready.requestSha256),'R216 request identity must be SHA-256');
must(ready.r214AnchorSha256===h&&ready.r215ArtifactReceiptSha256===h6,'R214/R215 continuity must be carried');
must(ready.earthHash==='earth-source-hash'&&ready.groundHash==='ground-source-hash'&&ready.evidenceDigest==='evidence-digest','Earth/ground/evidence identity must be carried');
must(ready.requestedAuthority==='R122_EXISTING_COMPUTED_REALITY','R122 must remain existing computed-reality authority');
must(ready.adaptivePerformanceAuthority==='R185_EXISTING_PERFORMANCE_LAYER','R185 must remain adaptive-performance authority');
must(ready.canonicalAdmissionAuthority==='R125','R125 must remain Canon admission authority');
for(const [k,v] of Object.entries({representationalArtifactIsEmpiricalEvidence:false,rendererInvoked:false,reconstructionExecuted:false,renderedFrame:false,renderReceipt:false,computedPhotorealRealityProved:false,solverValidityProved:false,nativeExecutionClaimed:false,federationClosureProved:false,canonicalMutation:false,newRenderer:false,newExecutor:false,newPersistenceAuthority:false,newFederationAuthority:false,newCanonAuthority:false}))must(ready[k]===v,`R216 truth boundary changed: ${k}`);

const same=await compileEvidenceReconstructionIntentR216(input);must(same.requestSha256===ready.requestSha256,'R216 request identity must be deterministic for identical proof input');
const mismatched=await compileEvidenceReconstructionIntentR216({...input,artifactReceipt:{...input.artifactReceipt,continuity:{r214AnchorSha256:h2}}});
must(mismatched.state==='HELD_FOR_PROOF'&&mismatched.missing.includes('R214_R215_CONTINUITY_MATCH'),'R214/R215 mismatch must hold reconstruction intent');
const noScene=await compileEvidenceReconstructionIntentR216({...input,scene:{eventAccepted:false,renderInputReady:false}});must(noScene.state==='HELD_FOR_PROOF'&&noScene.missing.includes('EVIDENCE_SCENE_ACCEPTED')&&noScene.missing.includes('R122_INPUT_READY'),'missing evidence scene must hold reconstruction intent');

const manifest=manifestR216();must(manifest.authority.newRenderer===false&&manifest.authority.newExecutor===false&&manifest.authority.newPersistenceAuthority===false&&manifest.authority.newFederationAuthority===false&&manifest.authority.newCanonAuthority===false,'R216 must add no new execution/authority plane');must(manifest.authority.computedReality==='R122'&&manifest.authority.canonicalAdmission==='R125','R122/R125 authority must remain intact');

const source=fs.readFileSync('src/world/evidenceReconstructionIntentR216.js','utf8');
for(const forbidden of ['rendererInvoked:true','reconstructionExecuted:true','renderedFrame:true','computedPhotorealRealityProved:true','solverValidityProved:true','nativeExecutionClaimed:true','federationClosureProved:true','canonicalMutation:true','fetch(','/api/'])must(!source.includes(forbidden),`R216 must not overclaim or create network execution authority: ${forbidden}`);
const ui=fs.readFileSync('src/MissionWorldContinuityR206.tsx','utf8');
for(const marker of ['R204 → R206 → R208 → R211 → R213 → R214 → R215 → R216','R216 R122 REQUEST READY','RECONSTRUCTION NOT EXECUTED','FRAME NOT RENDERED','COMPUTED PHOTOREAL REALITY UNPROVEN',"type:'EVIDENCE_RECONSTRUCTION_INTENT_COMPILED'",'recordProjectOperationR87(projectId,event)'])must(ui.includes(marker),`living-world R216 marker missing: ${marker}`);
const bus=fs.readFileSync('src/omegaOperationBusR86.ts','utf8');must(bus.includes("|'EVIDENCE_RECONSTRUCTION_INTENT_COMPILED'"),'R86 must recognize the bounded R216 request receipt');
const r215=fs.readFileSync('tests/r215-render-artifact-continuity-invariants.mjs','utf8');must(r215.includes('computedRealityFrame:false'),'R215 non-computed artifact boundary must remain intact');

console.log('R216 EVIDENCE RECONSTRUCTION INTENT PASS · mission/world/R214 continuity + exact R215 artifact proof + Earth/ground evidence produce a deterministic R122 request identity · no renderer/frame/photoreal/solver/native/federation/Canon overclaim');
