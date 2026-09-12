import fs from 'node:fs';
import {reconcileImplementationCanonR291,R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,R291_PUBLIC_SOURCE_PROVENANCE,R291_SOURCE_SNAPSHOT_ENCODING} from '../scripts/r291-implementation-canon-reconcile.mjs';

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
const reconciler=read('scripts/r291-implementation-canon-reconcile.mjs');
const sourceManifestText=read('data/implementation-canon-r291.manifest.json');
const sourceManifest=JSON.parse(sourceManifestText);
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

must(!fs.existsSync('data/implementation-canon-r291.json.gz.b64'),'corrupt opaque implementation-canon payload must remain removed');
must(!fs.existsSync('data/implementation-canon-r291.json'),'single opaque/monolithic implementation-canon snapshot must remain replaced by source-derived chunks');
must(!reconciler.includes("node:zlib")&&!reconciler.includes('decodePayloadByPinnedIntegrity')&&!reconciler.includes('brotliDecompressSync'),'implementation canon must use one transparent chunked JSON contract, not codec guessing');
must(!sourceManifestText.includes('driveId')&&!sourceManifestText.includes('docs.google.com')&&!sourceManifestText.includes('drive.google.com'),'public implementation-canon manifest must omit connected-storage locators');
must(sourceManifest.schema==='OMEGA_IMPLEMENTATION_CANON_SOURCE_MANIFEST_R291','implementation canon source manifest schema drift');
must(sourceManifest.source.file==='OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx'&&sourceManifest.source.sheet==='Implementation_Index'&&sourceManifest.source.range==='A1:J676','implementation canon authoritative workbook/sheet/range drift');
must(sourceManifest.source.rowsIncludingHeader===676&&sourceManifest.source.dataRows===675,'implementation canon source row conservation drift');
must(sourceManifest.source.storageLocator==='OMITTED_FROM_PUBLIC_REPOSITORY','implementation canon source locator must remain omitted');
must(sourceManifest.source.workbookSha256==='fdda75804ffb67136e6c547f5549bf2b2a26fd2e30ddfd86cd38dfc28f556e4e','implementation canon source workbook SHA-256 drift');
must(sourceManifest.snapshot.logicalRowsSha256==='af271c6c32420eb0e30c4315faebfcfbe01b32e1df527554ea6bea04818accfc'&&sourceManifest.snapshot.encoding==='UTF-8_JSON_CHUNKS','implementation canon source-derived logical snapshot hash/encoding drift');
must(Array.isArray(sourceManifest.snapshot.chunks)&&sourceManifest.snapshot.chunks.length===10&&sourceManifest.snapshot.chunks.reduce((n,c)=>n+c.rows,0)===675,'implementation canon source chunk conservation drift');
must(JSON.stringify(sourceManifest.conservation.statusCounts)===JSON.stringify({LOCKED:12,PLANNED:663}),'implementation canon archive-status conservation drift');
must(Object.values(sourceManifest.conservation.typeCounts).reduce((a,b)=>a+Number(b),0)===675,'implementation canon type conservation must total 675 rows');
for(const chunk of sourceManifest.snapshot.chunks){
 must(fs.existsSync(chunk.path),`implementation canon source chunk missing ${chunk.path}`);
 const text=read(chunk.path);
 must(!text.includes('driveId')&&!text.includes('docs.google.com')&&!text.includes('drive.google.com'),`implementation canon source chunk leaked connected-storage locator ${chunk.path}`);
}

must(canon.schema==='OMEGA_IMPLEMENTATION_CANON_RECONCILIATION_R291','675-row implementation canon reconciliation schema missing');
must(canon.source.rows===675&&canon.source.chunks===10,'implementation canon must contain exactly 675 rows across 10 source-derived chunks');
must(canon.source.sourceWorkbookSha256==='fdda75804ffb67136e6c547f5549bf2b2a26fd2e30ddfd86cd38dfc28f556e4e','implementation canon reconciled source workbook hash drift');
must(canon.source.logicalRowsSha256==='af271c6c32420eb0e30c4315faebfcfbe01b32e1df527554ea6bea04818accfc','implementation canon logical-row hash drift');
must(canon.source.manifestSha256==='9f05f12b66ea618b13b9f9275b28dc183c91c7ba44747b969583f568a54639b2','implementation canon source manifest hash drift');
must(canon.source.encoding===R291_SOURCE_SNAPSHOT_ENCODING&&canon.source.sourceSheet==='Implementation_Index'&&canon.source.sourceRange==='A1:J676','implementation canon transparent source binding drift');
must(canon.source.publicProvenance===R291_PUBLIC_SOURCE_PROVENANCE&&!('driveId' in canon.source),'public reconciliation result must omit connected-storage locator');
must(canon.classification.scope===R291_IMPLEMENTATION_CLASSIFICATION_SCOPE,'implementation classification scope drift');
must(Object.values(canon.counts).reduce((a,b)=>a+Number(b),0)===675,'implementation canon state counts must conserve all 675 rows');
for(const row of canon.rows){
 if(row.currentState==='IMPLEMENTED'||row.currentState==='SUPERSEDED')must(row.evidence.sourceEvidence&&row.evidence.proofEvidence,`${row.id} promoted without source+proof evidence`);
 must(row.claims.liveRuntimeProof===false&&row.claims.deviceProof===false&&row.claims.deploymentProof===false&&row.claims.empiricalScientificProof===false&&row.claims.canonAdmission===false,`${row.id} crossed the repository-classification truth boundary`);
}

console.log(`R291 FULL POST-R289 CONVERGENCE PASS · canonical Singmaster remains OPEN · deep archive recovery + symbolic RSC VM + exact live navigation presentation + Heavy Bio read-only zero-authority comparison + source-derived ${canon.source.rows}-row implementation canon across ${canon.source.chunks} SHA-bound chunks coexist under inherited R242/R282/R125/R141/R146/R147/R240/ci.yml authorities · source/proof classification coverage ${(canon.evidencedCoverage*100).toFixed(2)}% · no physical-dimension inflation or scientific/live-execution proof promotion`);
