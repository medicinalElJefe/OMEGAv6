import {R48_COMPLETION_FAMILIES,R48_COMPLETION_SUMMARY} from './completionRuntimeR48';
import {R153_FULL_SYSTEM_CONTRACT} from './fullSystemCompletionR153.js';
import {MASTER_MENUS,FAMILIES} from './systemAtlasRuntime';
import {SOURCE_CORPUS_AUTHORITIES_R107,ULTIMATE_DEVELOPMENT_FABRIC_R107} from './sourceCorpusCorrelationR107';
import {R265_ADDRESS_LEVELS,R265_CYCLE,R265_INVARIANTS,R265_OPERATOR,R265_TRUTH_BOUNDARY} from './system/wovenDimensionalRelativityR265.js';
import {R266_CYCLE,R266_PROVENANCE_KINDS,R266_BOUNDARY} from './system/adaptiveCoherenceCycleR266.js';

export type R288DriveAuthorityState='INDEXED_SOURCE'|'DESIGN_CONTROL'|'ARCHIVE_LEDGER';
export type R288DriveAuthority={id:string;title:string;fileId:string;state:R288DriveAuthorityState;scope:string;bindsTo:readonly string[];truthBoundary:string};

// R288 snapshots the Drive authorities that were directly re-read during this convergence pass.
// The file IDs are provenance pointers only: the production Worker does not receive Drive credentials
// and cannot silently turn Drive presence into runtime execution or CanonState authority.
export const R288_DRIVE_AUTHORITIES:readonly R288DriveAuthority[]=[
 {id:'ONE_SYSTEM_LEDGER',title:'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx',fileId:'1tvDDlPxHFTXMPN43-rE1kPKdmJW5uYj6',state:'DESIGN_CONTROL',scope:'100 reviewed software rows, 12 master menus, 36 menu/control rows, 18 capability rows and KEEP/MERGE/DONOR disposition lineage.',bindsTo:['System Atlas','Control Matrix','Archive Census','Archive Operators'],truthBoundary:'Design/recovery authority only; workbook ACTIVE labels do not prove current execution.'},
 {id:'FULL_SOFTWARE_UNIVERSE',title:'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',fileId:'1GD4INEkFMnuVDWkSNnLYTw2LAsqvBN4C',state:'DESIGN_CONTROL',scope:'24 software families × 24 subsystems × 12 phases × 4 streams = 27,648 design cells under one field/packet/continuity invariant.',bindsTo:['System Atlas','Convergence','Modes'],truthBoundary:'61,917,364,224 is address/design capacity, not a literal physical-dimension claim.'},
 {id:'J_DRIVE_AUTOPING',title:'OMEGA_ONE_SYSTEM_J_DRIVE_1728D_AUTOPING_LEDGER.xlsx',fileId:'12w_vkhiXU1RUx5YU4C4M232fyvoqx_XN',state:'DESIGN_CONTROL',scope:'Local-host/module/install and 1,728-cell deterministic auto-ping design lineage.',bindsTo:['Hybrid Link','Build Out','System'],truthBoundary:'Auto-ping is internal deterministic routing unless a returned network/device receipt explicitly proves otherwise.'},
 {id:'HEAVY_BIO_FULL',title:'HEAVY_BIO_MODE_61917364224D_FULL_ATLAS.xlsx',fileId:'1NxNCxIwqjvyClUFUs2-rAe3AgLmiNIpO',state:'INDEXED_SOURCE',scope:'Heavy Bio high-capacity atlas authority for biological-scale model traversal.',bindsTo:['Matter Traversal','Reality Lab','Modes'],truthBoundary:'Biological atlas rows are representational/model data; they are not microscopy, clinical measurement or medical diagnosis.'},
 {id:'HEAVY_BIO_SHARDS',title:'MASTER_heavy_bio_35831808D_shard_index.xlsx',fileId:'1siqrh4SmlpCh779YmfkVUN4G-f9qYGYf',state:'INDEXED_SOURCE',scope:'35,831,808-address Heavy Bio shard index with 36-file shard lineage.',bindsTo:['Matter Traversal','Assets','Archive Census'],truthBoundary:'Shard presence/indexing does not imply every shard is loaded into browser memory or externally validated.'},
 {id:'WATER_FORCE',title:'Dewey_Calculus_20736D_Trig_Water_Force_Atlas.xlsx',fileId:'1Flbg7drpujKdQhLKM030I_It9aPzEcPV',state:'INDEXED_SOURCE',scope:'20,736-cell Water/force/trigonometric calculus donor.',bindsTo:['Modes','Relativity','Visual Instrument'],truthBoundary:'User-defined calculus/model variables remain formal computation unless independently tied to empirical measurements.'},
 {id:'WATER_GEOMETRY',title:'Dewey_Calculus_20736D_Trigonometry_Water_Geometry_Atlas.xlsx',fileId:'1FQM_-vVlKzz33bTvHvDFEO_p2OkaOfbd',state:'INDEXED_SOURCE',scope:'20,736-cell Water Geometry + trigonometric state atlas.',bindsTo:['Modes','Relativity','Matter Traversal'],truthBoundary:'Water Geometry is treated as flow/boundary/pressure/memory under constraint, not as an unsupported universal physical law.'},
 {id:'RELATIONAL_SKIN',title:'20736D_relational_skin_calculus_atlas_autoping.xlsx',fileId:'15OgwIFcw7vPYcjSYm7qCVARQKGM1O-Vp',state:'INDEXED_SOURCE',scope:'20,736-cell relational-skin calculus/autoping corpus.',bindsTo:['Modes','Relativity','Convergence'],truthBoundary:'Relational Skin is an executable software/model transformation layer; it does not create a new physical primitive.'},
 {id:'VIOLET',title:'Violet_Transfiguration_20736D_Atlas.xlsx',fileId:'1eyHwNiQISxNhgthE2d4j1a37aVNnSFI1',state:'INDEXED_SOURCE',scope:'20,736-cell Violet spectral/transfiguration source used by the current software re-expression semantics.',bindsTo:['Relativity','Modes','Visual Instrument'],truthBoundary:'Violet in OMEGA is a software re-expression/transfiguration contract unless a separately declared physical model is empirically validated.'},
 {id:'ATOMIC_MOTION',title:'ATOMS_1728D_Omega_Atlas_MOTION_12power_20736_UPDATED.xlsx',fileId:'1SrPW_nsDVqsYb6AW809WUDgbw9tDHHV3',state:'INDEXED_SOURCE',scope:'Atomic/motion atlas lineage across 1,728 and 20,736 address levels.',bindsTo:['Matter Traversal','Atlas','Relativity'],truthBoundary:'Address levels are atlas/resolution roles and do not assert literal higher physical dimensions.'},
 {id:'NATIVE_RENDERER_LEDGER',title:'DIMREL_NATIVE_RENDERER_1728_MASTER_PLAN.md',fileId:'1cZXnpYI58ATf974vUVSHyAVsgqC56wRb',state:'DESIGN_CONTROL',scope:'Recovered native renderer/backend/host/proof/replay/projection/packaging spine and hard acceptance bar.',bindsTo:['Visual Instrument','Build Out','Hybrid Link','Evidence & Proof'],truthBoundary:'Design-control evidence identifies implementation donors; native target-machine execution still requires returned host proof.'},
 {id:'FULL_BUILD_LEDGER',title:'FULL_SYSTEM_BUILD_LEDGER.md',fileId:'1f5jT4ocl3agqkv145GcOYZhqz6npZLdy',state:'ARCHIVE_LEDGER',scope:'Unified source-family ledger covering Total Control, GPU/render, OS V64/V66/V70, sovereign render, image-space traversal and intrinsic render families.',bindsTo:['Archive Operators','Build Out','System Atlas'],truthBoundary:'Archived source-family inclusion is provenance, not current production execution.'}
] as const;

export const R288_EMERGING_OPERATORS=Object.freeze([
 {id:'BLADE_GEOMETRY',state:'FORMALIZATION_REQUIRED',surface:'Relativity',reason:'Current GitHub + Drive source review did not find an authoritative Blade Geometry equation/ledger. R288 preserves the named operator as pending rather than inventing a formula.',admission:'Provide or recover the exact operator/coordinate law, then add tests and bind it through the R265 frame/skin/provenance contract.'}
]);

export const R288_CANONICAL_OPERATOR_STACK=Object.freeze({
 operator:R265_OPERATOR,
 cycle:[...R265_CYCLE],
 adaptiveCycle:[...R266_CYCLE],
 addressLevels:[...R265_ADDRESS_LEVELS],
 invariants:[...R265_INVARIANTS],
 learningEvidence:[...R266_PROVENANCE_KINDS],
 truthBoundary:`${R265_TRUTH_BOUNDARY} ${R266_BOUNDARY}`
});

export const R288_FAMILY_CONVERGENCE=R48_COMPLETION_FAMILIES.map(row=>({
 id:row.id,
 name:row.name,
 predecessor:FAMILIES.find(x=>x.id===row.id)?.status||row.historical,
 current:row.successor,
 surface:row.surface,
 proof:row.proof,
 remaining:row.remaining,
 executable:['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE'].includes(row.successor),
 gated:['EVIDENCE_GATED','DEVICE_GATED'].includes(row.successor)
}));

export const R288_ARCHIVE_NATIVE_CONVERGENCE=Object.freeze({
 schema:'OMEGA_ARCHIVE_NATIVE_CAPABILITY_CONVERGENCE_R288',
 revision:'R288',
 predecessor:'R287',
 objective:'Make the recovered Drive/archive software universe visible and actionable through current successor authority without reactivating stale donors or creating shadow state.',
 inventory:Object.freeze({...R153_FULL_SYSTEM_CONTRACT.inventory,driveAuthorities:R288_DRIVE_AUTHORITIES.length,currentFamilies:R288_FAMILY_CONVERGENCE.length,sourceCorpusAuthorities:SOURCE_CORPUS_AUTHORITIES_R107.length,masterMenus:MASTER_MENUS.length}),
 successor:Object.freeze({executable:R48_COMPLETION_SUMMARY.executable,gated:R48_COMPLETION_SUMMARY.gated,restorationDebt:R48_COMPLETION_SUMMARY.restorationDebt}),
 inheritedFabric:ULTIMATE_DEVELOPMENT_FABRIC_R107,
 operatorStack:R288_CANONICAL_OPERATOR_STACK,
 emergingOperators:R288_EMERGING_OPERATORS,
 rules:Object.freeze([
  'CURRENT_SUCCESSOR_REALITY_OVERRIDES_STALE_PREDECESSOR_LABELS_WITHOUT_ERASING_PROVENANCE',
  'DRIVE_FILE_PRESENCE_NEQ_RUNTIME_EXECUTION',
  'DONOR_CODE_NEVER_SEIZES_HOSTSTATE_OR_CANONSTATE_AUTHORITY',
  'ONE_FIELD_ONE_PACKET_ONE_CONTINUITY_LAW',
  'NO_NEW_PHYSICAL_PRIMITIVE',
  'ADDRESS_LEVEL_NEQ_LITERAL_PHYSICAL_DIMENSION',
  'OBSERVED_RETURNED_DERIVED_INFERRED_STAY_DISTINCT',
  'NATIVE_EXECUTION_REQUIRES_CURRENT_DEVICE_PROOF',
  'ALL_ENABLED_UI_CONTROLS_REMAIN_BOUND_AND_TESTED',
  'UNKNOWN_OR_INCOMPLETE_OPERATORS_ARE_GATED_NOT_INVENTED'
 ]),
 boundary:'R288 is an archive-native convergence/index/authority layer. It makes recovered capability and source provenance part of the live product design, but does not embed private Drive credentials, bulk-load every workbook row into the Worker, convert design ledgers into execution proof, fabricate empirical validation, or bypass R125/R141/R142/R240/CI authority.'
});

export function archiveNativeConvergenceReceiptR288(){
 const currentCounts=R288_FAMILY_CONVERGENCE.reduce<Record<string,number>>((out,row)=>{out[row.current]=(out[row.current]||0)+1;return out},{});
 return{
  schema:R288_ARCHIVE_NATIVE_CONVERGENCE.schema,
  revision:R288_ARCHIVE_NATIVE_CONVERGENCE.revision,
  generatedAt:new Date().toISOString(),
  inventory:R288_ARCHIVE_NATIVE_CONVERGENCE.inventory,
  successor:R288_ARCHIVE_NATIVE_CONVERGENCE.successor,
  currentCounts,
  driveAuthorities:R288_DRIVE_AUTHORITIES.map(x=>({id:x.id,title:x.title,fileId:x.fileId,state:x.state,scope:x.scope,bindsTo:x.bindsTo,truthBoundary:x.truthBoundary})),
  families:R288_FAMILY_CONVERGENCE,
  operatorStack:R288_CANONICAL_OPERATOR_STACK,
  emergingOperators:R288_EMERGING_OPERATORS,
  rules:R288_ARCHIVE_NATIVE_CONVERGENCE.rules,
  boundary:R288_ARCHIVE_NATIVE_CONVERGENCE.boundary
 };
}

export function auditArchiveNativeConvergenceR288(){
 const ids=R288_DRIVE_AUTHORITIES.map(x=>x.id),fileIds=R288_DRIVE_AUTHORITIES.map(x=>x.fileId),familyIds=R288_FAMILY_CONVERGENCE.map(x=>x.id);
 const validStates=R288_FAMILY_CONVERGENCE.every(x=>['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','EVIDENCE_GATED','DEVICE_GATED'].includes(x.current));
 const noDebt=R288_ARCHIVE_NATIVE_CONVERGENCE.successor.restorationDebt===0;
 const addressLaw=JSON.stringify(R288_CANONICAL_OPERATOR_STACK.addressLevels)===JSON.stringify([12,144,1728,20736,248832]);
 const unique=ids.length===new Set(ids).size&&fileIds.length===new Set(fileIds).size&&familyIds.length===new Set(familyIds).size;
 const pass=unique&&R288_FAMILY_CONVERGENCE.length===24&&MASTER_MENUS.length===12&&R153_FULL_SYSTEM_CONTRACT.inventory.systems===100&&R153_FULL_SYSTEM_CONTRACT.inventory.routes===44&&R153_FULL_SYSTEM_CONTRACT.inventory.sourceModes===179&&R153_FULL_SYSTEM_CONTRACT.inventory.canonLenses===62&&validStates&&noDebt&&addressLaw&&R288_EMERGING_OPERATORS.every(x=>x.state==='FORMALIZATION_REQUIRED');
 return{pass,unique,validStates,noDebt,addressLaw,driveAuthorities:R288_DRIVE_AUTHORITIES.length,families:R288_FAMILY_CONVERGENCE.length,menus:MASTER_MENUS.length,systems:R153_FULL_SYSTEM_CONTRACT.inventory.systems,routes:R153_FULL_SYSTEM_CONTRACT.inventory.routes,sourceModes:R153_FULL_SYSTEM_CONTRACT.inventory.sourceModes,canonLenses:R153_FULL_SYSTEM_CONTRACT.inventory.canonLenses,boundary:R288_ARCHIVE_NATIVE_CONVERGENCE.boundary};
}
