import fs from 'node:fs';
import {reconcileImplementationCanonR291,R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,R291_PUBLIC_SOURCE_PROVENANCE} from '../scripts/r291-implementation-canon-reconcile.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R291 convergence failed: ${msg}`)};
const recovery=read('src/archiveDeepRecoveryR290.ts');
const recoveryUi=read('src/ArchiveDeepRecoveryR290.tsx');
const genomeC=read('src/archiveGenomeLedgerR288c.ts');
const genomeD=read('src/archiveGenomeLedgerR288d.ts');
const genomeUi=read('src/ArchiveGenomeQueueR288.tsx');
const proofVm=read('src/rscProofVmR290.js');
const proofUi=read('src/RscProofLabR290.tsx');
const liveNav=read('src/OmegaSideNavigatorR88.tsx');
const bio=read('src/BioModeWorkbenchR284.tsx');
const bioBrowser=read('tests/r284-bio-mode-workbench-browser-e2e.mjs');
const singmaster=read('src/proof/singmasterProofAtlasR290.ts');
const singmasterUi=read('src/SingmasterProofWorkbenchR290.tsx');
const canon=reconcileImplementationCanonR291();

must(recovery.includes("R290_DEEP_RECOVERY_SCHEMA='OMEGA_DEEP_ARCHIVE_EXECUTION_CONVERGENCE_R290'"),'deep archive execution feeder missing');
must(recoveryUi.includes("aria-label='R290 deep archive execution convergence'"),'deep archive recovery surface is not mounted as a semantic region');
must(genomeUi.includes("import RscProofLabR290 from './RscProofLabR290'")&&genomeUi.includes('<RscProofLabR290/>'),'RSC proof lab must remain mounted inside archive genome queue');
must(proofVm.includes("RSC_MODEL_BOUNDARY_R290='SYMBOLIC_MODEL_ONLY_NOT_EXTERNAL_SCIENTIFIC_PROOF'"),'RSC symbolic-model boundary missing');
must(proofVm.includes('OMEGA_RSC_TOKEN_JACCARD_V1_ENGINEERED_NOT_ARCHIVE_FORMULA'),'engineered comparator must remain explicitly distinguished from archive formulas');
must(proofVm.includes('externalScientificProof:false')&&proofVm.includes('physicalLaw:false')&&proofVm.includes('canonicalStateMutation:false'),'RSC proof receipts must deny scientific/physical/Canon authority');
must(!proofVm.includes('fetch(')&&!proofVm.includes('WebSocket')&&!proofVm.includes('localStorage'),'RSC VM must remain a deterministic local model-space executor');
must(proofUi.includes('does not create external scientific, physical, medical, or Canon-state authority'),'RSC visible truth boundary missing');

must(singmaster.includes("SINGMASTER_PUBLIC_STATUS_R290='OPEN'"),'canonical Singmaster theorem status must remain OPEN');
must(singmaster.includes('does not claim that the global Sharp Singmaster Bound N(a) <= 8 is proved'),'Singmaster truth boundary must block global proof promotion');
must(singmaster.includes("id:'G09'")&&singmaster.includes("status:'OPEN'")&&singmaster.includes("id:'G13'"),'Singmaster unresolved family/final theorem gates must remain open');
must(singmasterUi.includes('global theorem status remains OPEN')&&singmasterUi.includes('deliberately does not promote the open global theorem'),'Singmaster rendered audit must distinguish bounded witness checks from the open theorem');

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

must(!/driveIds:\['/.test(genomeC)&&!/driveIds:\['/.test(genomeD),'new R291 archive rows must not add connected-storage locators to public source');
must(recovery.includes('PUBLIC_CLIENT_USES_OPAQUE_PROVENANCE_KEYS_CONNECTED_STORAGE_LOCATORS_EXTERNAL'),'deep-recovery public provenance boundary missing');
must(canon.schema==='OMEGA_IMPLEMENTATION_CANON_RECONCILIATION_R291','675-row implementation canon reconciliation schema missing');
must(canon.source.rows===675,'implementation canon must contain exactly 675 rows');
must(canon.source.payloadSha256==='8eb1d334cf1a1cbb6e7633b0f90e37893e1d95560de2cfe334e6a076cdbeb904','implementation canon payload hash drift');
must(canon.source.payloadCodec==='GZIP','implementation canon must remain the canonical gzip payload');
must(canon.source.file==='OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx','implementation canon source filename drift');
must(canon.source.modified==='2026-08-03T13:29:58.020Z','implementation canon source modification identity drift');
must(canon.source.archiveLocked===12&&canon.source.archivePlanned===663,'implementation canon source status totals drift');
must(canon.source.publicProvenance===R291_PUBLIC_SOURCE_PROVENANCE&&!('driveId' in canon.source),'public reconciliation result must omit connected-storage locator');
must(canon.classification.scope===R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,'implementation classification scope drift');
must(Object.values(canon.counts).reduce((a,b)=>a+Number(b),0)===675,'implementation canon state counts must conserve all 675 rows');
for(const row of canon.rows){
 if(row.currentState==='IMPLEMENTED'||row.currentState==='SUPERSEDED')must(row.evidence.sourceEvidence&&row.evidence.proofEvidence,`${row.id} promoted without source+proof evidence`);
 must(row.claims.liveRuntimeProof===false&&row.claims.deviceProof===false&&row.claims.deploymentProof===false&&row.claims.empiricalScientificProof===false&&row.claims.canonAdmission===false,`${row.id} crossed the repository-classification truth boundary`);
}

console.log(`R291 FULL POST-R289 CONVERGENCE PASS · canonical Singmaster remains OPEN · deep archive recovery + symbolic RSC VM + exact live navigation presentation + Heavy Bio read-only zero-authority comparison + exact ${canon.source.rows}-row implementation canon SHA/reconciliation coexist under inherited R242/R282/R125/R141/R146/R147/R240/ci.yml authorities · source/proof classification coverage ${(canon.evidencedCoverage*100).toFixed(2)}% · no physical-dimension inflation or scientific/live-execution proof promotion`);