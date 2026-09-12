import {ARCHIVE_GENOME_ALL_ROWS_R288} from './archiveGenomeLedgerR288b';
import {OMEGA_MASTER_MENU_NAVIGATION_R289} from './navigationRegistry';

export const R290_DEEP_RECOVERY_SCHEMA='OMEGA_DEEP_ARCHIVE_EXECUTION_CONVERGENCE_R290' as const;
export const R290_DEEP_RECOVERY_REVISION='R290' as const;

export type R290RecoveryState='ACTIVE_SUCCESSOR'|'RECOVERABLE'|'DONOR_ONLY'|'DEVICE_GATED'|'EVIDENCE_GATED';
export type R290RecoveryBinding={
 id:string;
 family:string;
 sourceGenomeIds:string[];
 driveArtifacts:{title:string;id:string;kind:'FILE'|'FOLDER'|'LEDGER'}[];
 masterMenuId:string;
 masterMenu:string;
 routes:string[];
 successor:string;
 state:R290RecoveryState;
 executionIntent:string;
 nextBuild:string[];
 proofRequired:string[];
 boundary:string;
};

export const R290_DEEP_RECOVERY_BINDINGS:R290RecoveryBinding[]=[
 {
  id:'R290-01',family:'Camera / host-input lineage',sourceGenomeIds:['AG-020'],
  driveArtifacts:[
   {title:'atlas_camera_prototype_webgl.html',id:'1J6-eR1J3dY2wbIksfwLqPnBYhAscUcze',kind:'FILE'},
   {title:'v31r1__INTEGRATION_REPORT.txt',id:'1fghB3I9MuIBAxlHMm4M-XZKOpZ-SUa8e',kind:'FILE'},
   {title:'v31r1__CONTROL_SURFACE_REPORT.txt',id:'1VrRE-AJvEnmfJCwg3P8VRH2YAn8_rIHy',kind:'FILE'}
  ],
  masterMenuId:'05',masterMenu:'Host Inputs',routes:['Cockpit','Hybrid Link','Reality Lab'],successor:'Current browser observation + Hybrid proof-gated host input spine',state:'DEVICE_GATED',
  executionIntent:'Recover camera projection, control-surface and feature-field mechanics as bounded observation adapters feeding current source/evidence contracts.',
  nextBuild:['camera capability probe','typed frame/camera metadata packet','projection/overlay adapter','feature-field extraction boundary','host-return receipt binding'],
  proofRequired:['explicit camera permission','frame/source timestamp','device identity when host-backed','no Canon mutation from pixels','R141 return proof for native host execution'],
  boundary:'A historical camera prototype or integration report proves donor design only. Camera observations remain evidence inputs and never become CanonState or device-execution proof by themselves.'
 },
 {
  id:'R290-02',family:'Universal language / lexicon lineage',sourceGenomeIds:[],
  driveArtifacts:[
   {title:'v31r1__UNIFIED_LANGUAGE_REPORT.txt',id:'1iOybgedJb1dWdR8WhZBb2xAtO4tDF1IW',kind:'FILE'},
   {title:'v24__UNIFIED_LANGUAGE_REPORT.txt',id:'18eVCJq6__DenLsttpfzi93PPQVA8T_Q_',kind:'FILE'},
   {title:'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',id:'1GD4INEkFMnuVDWkSNnLYTw2LAsqvBN4C',kind:'LEDGER'}
  ],
  masterMenuId:'06',masterMenu:'AI Orchestration',routes:['Instructions','SAI Lab','Kernel Intelligence'],successor:'Current instruction/SAI language layer with no separate restored lexicon executor',state:'RECOVERABLE',
  executionIntent:'Recover semantic packet, symbol/meaning and translation mappings as a subordinate interpretation layer for SAI and Instructions.',
  nextBuild:['versioned lexicon schema','v24→v31r1 semantic diff','symbol/meaning provenance map','packet-language translator','ambiguity/conflict ledger'],
  proofRequired:['deterministic translation fixtures','round-trip semantic tests','source-version provenance','no instruction text promoted to authority','no autonomous authorization'],
  boundary:'Recovered language rules may interpret or translate current state; they may not create facts, authorize execution, rewrite evidence, or become a second command authority.'
 },
 {
  id:'R290-03',family:'Omega Life Engine lineage',sourceGenomeIds:[],
  driveArtifacts:[
   {title:'omega_life_engine.xlsx',id:'1--XTXZC1IMktpZVphqLXc_vLP-TltRC0',kind:'FILE'},
   {title:'omega_total_engine.xlsx',id:'1jr-RH5IZuih6EgG1_8OlPO7UxbVmqm8S',kind:'FILE'},
   {title:'Omega_Kernel_Integrated_20736D_PATCHED.xlsx',id:'1dpcPJQEHXg5NIVcJo6_RX74MenIG5QAx',kind:'FILE'}
  ],
  masterMenuId:'07',masterMenu:'Data / Atlas',routes:['Atlas','System Atlas','Matter Traversal'],successor:'Current atlas/packet/Heavy-Bio successors; historical Life Engine remains donor data until semantics are reconciled',state:'DONOR_ONLY',
  executionIntent:'Diff historical Life/Total/Kernel workbooks for deterministic topology, state-neighborhood, transition and address mechanics that are not already superseded.',
  nextBuild:['sheet/schema census','formula graph extraction','Life→Total→Integrated version diff','current atlas crosswalk','unique-operator candidate list'],
  proofRequired:['formula-level provenance','typed/unit-domain checks','golden-row replay','no medical inference promotion','no literal physical-dimension interpretation'],
  boundary:'The Life Engine name is historical software nomenclature. Workbook formulas are model/donor mechanics, not proof of biological truth, diagnosis, treatment, or new physical primitives.'
 },
 {
  id:'R290-04',family:'Renderer evolution / native visual lineage',sourceGenomeIds:['AG-008','AG-009','AG-019'],
  driveArtifacts:[
   {title:'renderer_20736_color_state.html',id:'1QeIzCpO9aOjpj4zUWLqw3iB2S4WdmZ26',kind:'FILE'},
   {title:'DIMREL_NATIVE_RENDERER_1728_MASTER_PLAN.md',id:'1cZXnpYI58ATf974vUVSHyAVsgqC56wRb',kind:'FILE'}
  ],
  masterMenuId:'04',masterMenu:'Render Field',routes:['Visual Instrument','Render Queue','Create'],successor:'Current source-packet Visual Instrument plus proof-gated native/GPU renderer targets',state:'RECOVERABLE',
  executionIntent:'Recover visual grammar, camera/projection laws, color-state mapping and stronger native rendering mechanics while retaining the current packet as the only source of truth.',
  nextBuild:['renderer-version diff','camera/projection crosswalk','color-state semantic map','GPU/native capability adapter','frame/parameter receipt'],
  proofRequired:['same packet hash before/after render','deterministic parameter receipt','no decorative geometry admitted as data','GPU/native capability proof','visual regression fixtures'],
  boundary:'A renderer expresses admitted state. Rendered geometry, color, interpolation or cinematic polish never creates observations, physical evidence, solver proof or CanonState.'
 },
 {
  id:'R290-05',family:'Build / repair / release-control corpus',sourceGenomeIds:['AG-010','AG-011'],
  driveArtifacts:[
   {title:'OMEGA_ENTIRE_BUILD_61917364224D_FULL_CHART_v20.xlsx',id:'1iHdsZm6W-vwIJF1rBzUyvN5kISygp-0S',kind:'LEDGER'},
   {title:'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',id:'1GD4INEkFMnuVDWkSNnLYTw2LAsqvBN4C',kind:'LEDGER'},
   {title:'final_12_to_1_merge_workbook.xlsx',id:'118j4a7zwQUtZ8MR4hASpPQkYTHz3dzMO',kind:'LEDGER'}
  ],
  masterMenuId:'10',masterMenu:'Recovery / Packaging',routes:['Build Out','Development','Settings'],successor:'Current governed GitHub/Cloudflare release line + proof-gated native packaging',state:'RECOVERABLE',
  executionIntent:'Compile historical build, merge, repair and release ledgers into a current-version recovery planner that distinguishes superseded, active, donor and missing mechanics.',
  nextBuild:['build-ledger schema adapter','12→1 merge lineage graph','repair/rollback contract crosswalk','current-source status resolver','machine-readable recovery plan export'],
  proofRequired:['exact source SHA binding','expected-head release locking','rollback/recovery fixture','no direct main mutation','ci.yml remains sole main-push production deployment authority'],
  boundary:'Historical build ledgers plan and explain recovery; they do not authorize deployment. Current governed source, tests, expected-head merge and canonical CI remain release authority.'
 },
 {
  id:'R290-06',family:'J-drive / One-System recovery ledger',sourceGenomeIds:['AG-021'],
  driveArtifacts:[
   {title:'OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx',id:'12w_vkhiXU1RUx5YU4C4M232fyvoqx_XN',kind:'LEDGER'},
   {title:'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx',id:'1tvDDlPxHFTXMPN43-rE1kPKdmJW5uYj6',kind:'LEDGER'},
   {title:'OMEGA_20736D_IMPLEMENTATION_CANON_INDEX.xlsx',id:'1qUin9VhnhLtj3hEavex3l04fYCNdjfKD',kind:'LEDGER'}
  ],
  masterMenuId:'11',masterMenu:'Archive Merge',routes:['Archive Census','Archive Operators','Consolidation','Build Out'],successor:'R289 12-menu/44-route archive-native shell + current implementation source',state:'ACTIVE_SUCCESSOR',
  executionIntent:'Use historical One-System/J-drive/implementation ledgers as reconciliation authorities for coverage and lineage, while current source decides actual execution.',
  nextBuild:['row-level current-source crosswalk','duplicate/version family graph','contextual recovered-lineage strips on specialist surfaces','machine-readable remaining-debt report'],
  proofRequired:['all 44 routes remain uniquely registered','12 master menus remain non-empty','source path required for ACTIVE classification','archive rows cannot write CanonState','zero shadow deployment authority'],
  boundary:'Ledger completeness is not runtime completeness. Current source/test/live receipts decide execution; archive ledgers provide provenance, coverage intent and recovery evidence only.'
 },
 {
  id:'R290-07',family:'Cube / spatial-audio donor bindings',sourceGenomeIds:['AG-015','AG-016','AG-017'],
  driveArtifacts:[
   {title:'omega_cube_engine_v9.xlsx',id:'1OtqQFZ7yuSy6K3Q6dNQPF5lyIDCk4VMK',kind:'FILE'},
   {title:'SpatialAudio',id:'1aCq2le5iyA_p0imiFOIc9b1Vrmz2P8it',kind:'FOLDER'},
   {title:'QtSpatialAudio',id:'19yueTLibEmzpHzp3hVAe2XGjF9DD24CG',kind:'FOLDER'}
  ],
  masterMenuId:'08',masterMenu:'Audio / Signal',routes:['System Atlas','Atlas','Visual Instrument'],successor:'S17 browser-local 12-lane sonification + current atlas addressing; native spatial audio remains gated',state:'EVIDENCE_GATED',
  executionIntent:'Keep Cube topology and spatial-audio donors connected to the current atlas/signal runtime without implying that native Qt audio or historical cube formulas are executing.',
  nextBuild:['Cube v5→v9 semantic diff','packet/topology crosswalk','native spatial-audio capability probe','listener/source mapping','deterministic audio-position fixtures'],
  proofRequired:['S17 remains user-gesture local audio only','native dependency/version/license proof','known-position spatial tests','no frequency-as-physical-measurement claim','no Cube donor as state writer'],
  boundary:'These donors can strengthen topology presentation and sonification only after proof. Neither spatial sound nor Cube visualization is empirical evidence or canonical state authority.'
 }
];

const menuById=new Map(OMEGA_MASTER_MENU_NAVIGATION_R289.map(x=>[x.id,x]));
const genomeIds=new Set(ARCHIVE_GENOME_ALL_ROWS_R288.map(x=>x.id));

export function auditDeepArchiveRecoveryR290(){
 const ids=R290_DEEP_RECOVERY_BINDINGS.map(x=>x.id);
 const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
 const unknownMenus=R290_DEEP_RECOVERY_BINDINGS.filter(x=>!menuById.has(x.masterMenuId)).map(x=>x.id);
 const routeMismatches=R290_DEEP_RECOVERY_BINDINGS.flatMap(x=>{
  const menu=menuById.get(x.masterMenuId);
  const allowed=new Set(menu?.routes.map(r=>r.name)||[]);
  return x.routes.filter(route=>!allowed.has(route)).map(route=>`${x.id}:${route}`);
 });
 const missingGenomeRefs=R290_DEEP_RECOVERY_BINDINGS.flatMap(x=>x.sourceGenomeIds.filter(id=>!genomeIds.has(id)).map(id=>`${x.id}:${id}`));
 const missingDrive=R290_DEEP_RECOVERY_BINDINGS.filter(x=>!x.driveArtifacts.length).map(x=>x.id);
 const missingProof=R290_DEEP_RECOVERY_BINDINGS.filter(x=>!x.proofRequired.length||!x.boundary).map(x=>x.id);
 const pass=!duplicateIds.length&&!unknownMenus.length&&!routeMismatches.length&&!missingGenomeRefs.length&&!missingDrive.length&&!missingProof.length;
 return {schema:R290_DEEP_RECOVERY_SCHEMA,revision:R290_DEEP_RECOVERY_REVISION,pass,bindings:R290_DEEP_RECOVERY_BINDINGS.length,duplicateIds,unknownMenus,routeMismatches,missingGenomeRefs,missingDrive,missingProof,boundary:'Recovery bindings are planning/provenance overlays. They add no route owner, CanonState writer, proof authority, dispatcher, device claim or deployment authority.'};
}

export function deepArchiveRecoveryReceiptR290(){
 return {generatedAt:new Date().toISOString(),audit:auditDeepArchiveRecoveryR290(),bindings:R290_DEEP_RECOVERY_BINDINGS};
}
