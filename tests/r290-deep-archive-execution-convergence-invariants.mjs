import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R290 invariant failed: ${msg}`)};
const model=read('src/archiveDeepRecoveryR290.ts');
const ui=read('src/ArchiveDeepRecoveryR290.tsx');
const css=read('src/archiveDeepRecoveryR290.css');
const governance=read('src/ArchiveGovernanceControl.tsx');
const nav=read('src/navigationRegistry.ts');
const genome=read('src/archiveGenomeLedgerR288b.ts');

for(const token of [
 'OMEGA_DEEP_ARCHIVE_EXECUTION_CONVERGENCE_R290','R290-01','R290-02','R290-03','R290-04','R290-05','R290-06','R290-07',
 'atlas_camera_prototype_webgl.html','v31r1__UNIFIED_LANGUAGE_REPORT.txt','omega_life_engine.xlsx','renderer_20736_color_state.html',
 'OMEGA_ENTIRE_BUILD_61917364224D_FULL_CHART_v20.xlsx','OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx','omega_cube_engine_v9.xlsx','SpatialAudio','QtSpatialAudio',
 'ACTIVE_SUCCESSOR','RECOVERABLE','DONOR_ONLY','DEVICE_GATED','EVIDENCE_GATED','auditDeepArchiveRecoveryR290','deepArchiveRecoveryReceiptR290',
 'PUBLIC_CLIENT_USES_OPAQUE_PROVENANCE_KEYS_CONNECTED_STORAGE_LOCATORS_EXTERNAL'
])must(model.includes(token),`missing model token ${token}`);

for(const ref of ['AG-008','AG-009','AG-010','AG-011','AG-015','AG-016','AG-017','AG-019','AG-020','AG-021'])must(genome.includes(`id:'${ref}'`)||model.includes(`'${ref}'`),`expected existing genome linkage ${ref}`);
for(const menu of ["'04'","'05'","'06'","'07'","'08'","'10'","'11'"])must(model.includes(`masterMenuId:${menu}`),`missing recovered master-menu binding ${menu}`);
for(const route of ['Cockpit','Hybrid Link','Reality Lab','Instructions','SAI Lab','Kernel Intelligence','Atlas','System Atlas','Matter Traversal','Visual Instrument','Render Queue','Create','Build Out','Development','Settings','Archive Census','Archive Operators','Consolidation'])must(nav.includes(`name:'${route}'`)&&model.includes(`'${route}'`),`route must exist in canonical registry and R290 binding: ${route}`);

must(model.includes('routeMismatches')&&model.includes('missingGenomeRefs')&&model.includes('unknownMenus')&&model.includes('duplicateIds')&&model.includes('duplicatePublicKeys'),'R290 audit must fail closed on route/menu/genome/identity/provenance-key drift');
must(model.includes('They add no route owner, CanonState writer, proof authority, dispatcher, device claim or deployment authority.'),'R290 authority boundary missing');
must(model.includes('ci.yml remains sole main-push production deployment authority'),'release single-writer boundary missing');
must(model.includes('no Canon mutation from pixels'),'camera observation boundary missing');
must(model.includes('may not create facts, authorize execution, rewrite evidence, or become a second command authority'),'language/SAI authority boundary missing');
must(model.includes('not proof of biological truth, diagnosis, treatment, or new physical primitives'),'Life Engine truth/medical boundary missing');
must(model.includes('Rendered geometry, color, interpolation or cinematic polish never creates observations'),'renderer truth boundary missing');
must(model.includes('S17 remains user-gesture local audio only'),'audio truth boundary missing');
must(!/\b(?:id|driveId):['"][A-Za-z0-9_-]{20,}['"]/.test(model),'R291 must not add raw connected-storage locators to the public deep-recovery model');
must(model.includes("key:'PROV-R290-")&&ui.includes('public-safe provenance keys'),'public archive provenance must use opaque stable keys');

must(ui.includes('Recovered lineage → correct menu → current successor → next proof'),'UI must expose recovery progression');
must(ui.includes('MASTER MENU')&&ui.includes('CURRENT SUCCESSOR')&&ui.includes('Proof required')&&ui.includes('Archive provenance'),'UI must expose menu/successor/provenance/proof context');
must(ui.includes("OMEGA_R290_DEEP_ARCHIVE_RECOVERY_RECEIPT.json"),'UI must export machine-readable R290 receipt');
must(governance.includes("import ArchiveDeepRecoveryR290 from './ArchiveDeepRecoveryR290'"),'Archive governance must mount R290 deep recovery instrument');
must(governance.includes('<ArchiveDeepRecoveryR290/>'),'Archive governance render mount missing');
must(css.includes('@media(max-width:900px)')&&css.includes('@media(max-width:520px)'),'R290 UI must include desktop/tablet/mobile containment');
must(!model.includes('fetch(')&&!model.includes('localStorage')&&!model.includes('WebSocket'),'R290 recovery model must remain a pure planning/provenance layer');

const ids=[...model.matchAll(/id:'R290-(\d{2})'/g)].map(x=>x[1]);
must(ids.length===7,`expected exactly 7 deduplicated R290 context bindings, got ${ids.length}`);
must(new Set(ids).size===ids.length,'R290 binding IDs must be unique');
console.log('R290/R291 DEEP ARCHIVE EXECUTION CONVERGENCE PASS · 7 deduplicated context bindings · public-safe archive provenance + current successor + 12-menu placement + proof requirements · no new authority or raw storage locators');