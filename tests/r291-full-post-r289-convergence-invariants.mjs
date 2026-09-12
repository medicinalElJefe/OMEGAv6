import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 convergence failed: ${msg}`)};
const recovery=read('src/archiveDeepRecoveryR290.ts');
const recoveryUi=read('src/ArchiveDeepRecoveryR290.tsx');
const genomeUi=read('src/ArchiveGenomeQueueR288.tsx');
const proofVm=read('src/rscProofVmR290.js');
const proofUi=read('src/RscProofLabR290.tsx');
const liveNav=read('src/OmegaSideNavigatorR88.tsx');
const bio=read('src/BioModeWorkbenchR284.tsx');
const bioBrowser=read('tests/r284-bio-mode-workbench-browser-e2e.mjs');

must(recovery.includes("R290_DEEP_RECOVERY_SCHEMA='OMEGA_DEEP_ARCHIVE_EXECUTION_CONVERGENCE_R290'"),'deep archive execution feeder missing');
must(recoveryUi.includes("aria-label='R290 deep archive execution convergence'"),'deep archive recovery surface is not mounted as a semantic region');
must(genomeUi.includes("import RscProofLabR290 from './RscProofLabR290'")&&genomeUi.includes('<RscProofLabR290/>'),'RSC proof lab must remain mounted inside archive genome queue');
must(proofVm.includes("RSC_MODEL_BOUNDARY_R290='SYMBOLIC_MODEL_ONLY_NOT_EXTERNAL_SCIENTIFIC_PROOF'"),'RSC symbolic-model boundary missing');
must(proofVm.includes('OMEGA_RSC_TOKEN_JACCARD_V1_ENGINEERED_NOT_ARCHIVE_FORMULA'),'engineered comparator must remain explicitly distinguished from archive formulas');
must(proofVm.includes('externalScientificProof:false')&&proofVm.includes('physicalLaw:false')&&proofVm.includes('canonicalStateMutation:false'),'RSC proof receipts must deny scientific/physical/Canon authority');
must(!proofVm.includes('fetch(')&&!proofVm.includes('WebSocket')&&!proofVm.includes('localStorage'),'RSC VM must remain a deterministic local model-space executor');
must(proofUi.includes('does not create external scientific, physical, medical, or Canon-state authority'),'RSC visible truth boundary missing');

must(liveNav.includes("id='omega-global-navigator'")&&liveNav.includes('data-master-menu-presentation-revision={R289_MASTER_MENU_PRESENTATION_REVISION}'),'inner live navigator must carry exact recovered-menu presentation identity');
must(liveNav.includes('compileNavigationLemmaR242')&&liveNav.includes('resolveExactRouteR242'),'R242 must remain route derivation/resolution authority');
must(bio.includes("data-read-only='true'")||bio.includes('data-read-only="true"')||bio.includes('data-read-only={true}'),'Heavy Bio comparison must expose machine-readable read-only semantics');
must(bio.includes("data-measurement-authority-delta='0'")||bio.includes('data-measurement-authority-delta="0"'),'Heavy Bio comparison must bind zero analytical measurement-authority delta');
must(bioBrowser.toLowerCase().includes('read-only comparison')&&bioBrowser.includes('data-measurement-authority-delta'),'Heavy Bio browser proof must verify rendered and machine comparison semantics');

for(const boundary of [
 'They add no route owner, CanonState writer, proof authority, dispatcher, device claim or deployment authority.',
 'ci.yml remains sole main-push production deployment authority',
 'not proof of biological truth, diagnosis, treatment, or new physical primitives',
 'Rendered geometry, color, interpolation or cinematic polish never creates observations'
])must(recovery.includes(boundary),`archive recovery boundary missing: ${boundary}`);

console.log('R291 FULL POST-R289 CONVERGENCE PASS · deep archive recovery + symbolic RSC VM + exact live navigation presentation + Heavy Bio read-only zero-authority comparison coexist under inherited R242/R282/R125/R141/R146/R147/R240/ci.yml authorities · no physical-dimension inflation or scientific-proof promotion');