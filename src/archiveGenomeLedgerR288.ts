export const R288_ARCHIVE_GENOME_SCHEMA='OMEGA_ARCHIVE_GENOME_LEDGER_R288' as const;
export const R288_ARCHIVE_GENOME_REVISION='R288' as const;

export type ArchiveOriginR288='OMEGA_ARCHIVE'|'USER_AUTHORED'|'THIRD_PARTY'|'DEPENDENCY'|'GENERATED_OUTPUT'|'UNKNOWN';
export type ArchiveEvidenceStateR288='ARCHIVE_VERIFIED'|'SOURCE_REVIEWED'|'VISUAL_EVIDENCE'|'RECEIPT_EVIDENCE'|'DEPENDENCY_PRESENT'|'UNOPENED';
export type RuntimeCoverageR288='ACTIVE'|'PARTIAL'|'LEDGER_ONLY'|'ABSENT'|'GATED';
export type PromotionClassR288='RECOVER_EXECUTOR'|'INGEST_TYPED_DATA'|'RECOVER_VISUAL_GRAMMAR'|'ADMIT_DEPENDENCY'|'PROOF_PROVENANCE'|'CROSS_VALIDATE'|'HOLD';
export type ArchiveGenomeRowR288={
 id:string;
 family:string;
 artifacts:string[];
 driveIds:string[];
 origin:ArchiveOriginR288;
 evidenceState:ArchiveEvidenceStateR288;
 currentCoverage:RuntimeCoverageR288;
 omegaV6Connection:string;
 missingDelta:string[];
 promotionClass:PromotionClassR288;
 validation:string[];
 boundary:string;
 priority:1|2|3|4|5;
};

export const ARCHIVE_GENOME_ROWS_R288:ArchiveGenomeRowR288[]=[
 {
  id:'AG-001',family:'SAI / PSC compiled reasoning substrate',
  artifacts:['OMEGA_SAI_B059_PART_01_CORE_COMPILED.zip','OMEGA_SAI_B059_PART_02_PSC_ATLAS.zip','OMEGA_SAI_B059_PART_03_PSC_OPERATOR_QR.zip','OMEGA_SAI_B059_PART_04_CALCULUS_GRAPH_PROOF.zip','OMEGA_SAI_B059_PART_05_WORKBOOKS.zip'],
  driveIds:['1E7vk-RPG7NHsjaLMhKaCGMFmZPUIdtN-','1PlV5ec1Z4Hqyw_zpKY_17Izoug7ordS5','1lGKUUOnfXpKswoEAXaGZcSAlHlalUj15','18v--hP9TVwjVdxNds7ByuodoY8HxWXy3','1LTA8m8vatFKCw6a7Grtw7fv15PwF_QWm'],
  origin:'OMEGA_ARCHIVE',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'saiB059Runtime + SAI Lab + PSC fields already exist, but the five-part archive distribution is not represented as independently recoverable runtime organs.',
  missingDelta:['compiled-core census','PSC atlas adapter','operator/QR executor','calculus/graph/proof adapter','workbook-pack ingestion','cross-pack hash/provenance map'],
  promotionClass:'RECOVER_EXECUTOR',validation:['expand/fingerprint each ZIP','classify source vs generated data','compare PSC hashes to saiB059Runtime','run bounded operator vectors','prove no second state authority'],
  boundary:'Archive package names do not prove current execution. Recovery must preserve current OMEGA state/proof authority and reject synthetic promotion.',priority:1
 },
 {
  id:'AG-002',family:'PSC all-domain atlas / QR build',
  artifacts:['PSC_20736D_all_domains_parent_accumulation_autoping.xlsx','PSC_20736D_all_domains_FULL_QR_build_expanded.xlsx','PSC_SAMPLE_RUN_BRANCH_TRUNK.txt','PSC_20736D_OMEGA_MASTER_TECHNICAL_REPORT.pdf'],
  driveIds:['1vQK4ibuZKEzIT5OT2_0kcU1DylwNM3sR','18faR7tXRm33A9LVBXj4lRJnnGtAD1Svr','1bSGA8o9h-yOqrq8LZsBHbq8WULrE7_6m','1tLBQaSfriAqSwTbQBqrCCDYGWAtYL9Ys'],
  origin:'OMEGA_ARCHIVE',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'PSC appears in current records and SAI B059 runtime, but archive-scale parent accumulation, auto-ping and QR topology are not separately surfaced.',
  missingDelta:['typed PSC schema','parent-accumulation executor','auto-ping replay','QR graph visualizer','sample-run regression corpus'],
  promotionClass:'CROSS_VALIDATE',validation:['schema extraction','deterministic replay against sample run','graph invariants','hash-stable result receipts'],
  boundary:'PSC archive values remain model/runtime data until their source semantics and calculations are independently verified.',priority:1
 },
 {
  id:'AG-003',family:'Water Geometry / Mode188 calculus',
  artifacts:['Dewey_Calculus_20736D_Trig_Water_Force_Atlas.xlsx','Dewey_Calculus_20736D_Trigonometry_Water_Geometry_Atlas.xlsx','water_geometry_dewey_mode188_20736D_state_space.xlsx','Dewey_Calculus_20736D_ENTIRE_Full_Canon_Trig_Water_Scar_Mode188_Atlas.xlsx','Water_Power_Matrix_12x12.xlsx'],
  driveIds:['1Flbg7drpujKdQhLKM030I_It9aPzEcPV','1FQM_-vVlKzz33bTvHvDFEO_p2OkaOfbd','1hWYrd5x_57BnuOroQXwDkJZSYx6p4Fyi','1wGA2rK5BbNAhWcm8c7lb18ytvagTpc3W','1egEs81EOyusoFz6pZbdbNntqF0Dn-j-i'],
  origin:'USER_AUTHORED',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'R265/R266 make Water Transport and Woven Continuity executable, but the larger archived trigonometry/force/scar/Mode188 operator family is compressed into a smaller runtime contract.',
  missingDelta:['formula registry','operator provenance','state-space adapter','force/pressure/scar channels','matrix cross-checks','interactive Water instrument'],
  promotionClass:'RECOVER_EXECUTOR',validation:['extract formulas without reinterpretation','unit/domain checks','golden-row replay','compare R265 outputs','hold unsupported physical claims'],
  boundary:'Water Geometry is a software/mathematical transform family. It is not a new physical primitive and archived labels are not empirical proof by themselves.',priority:1
 },
 {
  id:'AG-004',family:'Violet Transfiguration',
  artifacts:['Violet_Transfiguration_20736D_Atlas.xlsx','Violet_Transfiguration_20736D_Empirical_Full(1).xlsx','Violet_Transfiguration_Canon_Validated_Release'],
  driveIds:['1eyHwNiQISxNhgthE2d4j1a37aVNnSFI1','1oMtzFAPzZ_BcPSHJ9vuEIofcx_EQT-A6','1lUd3Xkgl0bjsk7QG20YOf8nr-PnUmfs1'],
  origin:'USER_AUTHORED',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'violetCanon, RelativityLab, traversalRuntime and R265/R266 already execute a bounded Violet re-expression, but they do not ingest the full archived atlas/release corpus.',
  missingDelta:['atlas-to-runtime compiler','empirical-row provenance','release-manifest recovery','operator-by-operator comparison','mode-specific visual surface'],
  promotionClass:'CROSS_VALIDATE',validation:['diff formulas against violetCanon','replay matched rows','separate empirical columns from derived/model columns','require provenance for any empirical label'],
  boundary:'Validated-release naming is archive metadata, not current scientific validation. OMEGAv6 must preserve explicit observed/derived/model-space distinctions.',priority:1
 },
 {
  id:'AG-005',family:'Dimensional / Parent / Fold / Atomic Relativity',
  artifacts:['Dewey_Parent_Relativity_Fully_Correlated_Master_Chart.xlsx','relativity_bridge_full_modes.xlsx','Fold_Scale_Relativity_Calibration_Test_Harness_v1.xlsx','20736D_ALL_ATOMIC_FIRST_HAND_RELATIVITY_FILLED(2).xlsx','Atomic_Woven_Continuity_Full_Relativity_Excel.xlsx','20736D_ALL_FULL_DIMENSION_RELATIVITY_ATLAS(2).xlsx'],
  driveIds:['1HNgwybFfVeOfeNMNrF29Q4_cijYeiVnV','1fbepjcEE9nhsifdRd0go6dtEaJaHUSIY','1z2MF57R1ObBdxFOcbKVVQ40uqUFC8xjO','1AQF5vjRwLHBvkZNgk3Kk-_bqJMlSvww7','1ENWPkMxqPAW2TLZ3iKzOCEHoPu0TjF4w','1fVb9GvDIO2XOfBuipTC_U9SN-RAlXXmI'],
  origin:'USER_AUTHORED',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'R265 and current Relativity surfaces implement frame/resolution relativity and Woven carry, while archived parent/fold/atomic/calibration branches remain largely uncompiled.',
  missingDelta:['parent-relativity executor','fold-scale calibration harness','atomic adapter','bridge-mode crosswalk','calibration receipt format','scale-reconciliation visualizer'],
  promotionClass:'RECOVER_EXECUTOR',validation:['calibration-harness replay','frame-transform invariants','orientation reversal tests','resolution-level identity tests','no literal-dimension claims'],
  boundary:'12→144→1728→20,736→248,832 are representation/address resolutions in OMEGA. They must not be promoted as literal physical dimensions.',priority:1
 },
 {
  id:'AG-006',family:'Heavy Bio archive corpus',
  artifacts:['heavy_bio_35831808D_shard_03_of_36.xlsx','heavy_bio_35831808D_shard_14_of_36.xlsx','heavy_bio_35831808D_shard_24_of_36.xlsx','heavy_bio_35831808D_shard_36_of_36.xlsx','unified_atlas_audit_report.xlsx'],
  driveIds:['1WHSqGIfWFeJhCdXpipHsUFjBtSe57tIz','1csxmtwvSfTGSsn67npmlPMxAv7qqXd-1','1R_Ul50-bBuBGAgPTdQUvsrtFDsV_PKIY','1vTHK6_PBdsIbE1gQzjIh_9ZaE4jncqvi','14FvUkhHBHxvoqbNXcosMfxP4IyUhBvzK'],
  origin:'USER_AUTHORED',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'heavyBioRuntimeR280 and BiologicalTraversal already provide an evidence-gated runtime, but the 36-shard archive and audit corpus are not compiled into a queryable typed source pack.',
  missingDelta:['36-shard index','schema reconciliation','typed evidence provenance','archive query engine','cross-shard invariants','visual layer mapping'],
  promotionClass:'INGEST_TYPED_DATA',validation:['schema audit all shards','duplicate/version detection','range/type validation','cross-shard checksum ledger','compare runtime address projections'],
  boundary:'Heavy Bio archive state must not produce diagnosis, treatment, disease inference or clinical claims without independently validated medical evidence and appropriate regulatory validation.',priority:1
 },
 {
  id:'AG-007',family:'Scientific domain packs',
  artifacts:['Science_20736_Bound_Atomic_Periodic.xlsx','Science_20736_CodeSequenced_Domain12.xlsx','AMO_144D_20736D_Framework_FILLED.xlsx','Condensed_Matter_144D_20736D_Framework_FULL20736.xlsx','Math_Atlas_20736D_UniversalDomains.xlsx','20736D_Earth_Space_Motion_Atlas.xlsx'],
  driveIds:['1PQZ-rJv-RYcOm2bC48U3RDn_3Ub2f5vC','1c4WbxrImnqqVOQ_7ZXog3mfEyOonJyIJ','1rUjTzgIKZYf9mWnY7bMIML3ZN-pWMwDQ','1IuNnkiMlD-BccSohUTTdzDLAHFaf79hB','1qaSQbO62KdMyxLL_aGNUpDMes-KL1MDF','1s5gUyW6OVmFoLk_Ptik-TQReNrqri1vS'],
  origin:'OMEGA_ARCHIVE',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'LEDGER_ONLY',
  omegaV6Connection:'Heavy Physics and Earth/relativity surfaces exist, but these domain-specific workbooks are not first-class loadable science packs.',
  missingDelta:['domain schemas','source/reference columns','typed loaders','equation registries','cross-domain query surface','evidence-class labeling'],
  promotionClass:'INGEST_TYPED_DATA',validation:['source-column audit','formula extraction','known-constant spot checks','unit consistency','separate reference science from OMEGA transforms'],
  boundary:'Workbook inclusion does not validate scientific claims. Standard physics/science facts and OMEGA-derived constructs must remain separately labeled.',priority:2
 },
 {
  id:'AG-008',family:'Full Sphere historical visual instrument',
  artifacts:['FULL_SPHERE_v12_1_BinaryLens_Folds_AllLines_Illuminated.mp4','FULL_SPHERE_v12_ThinLens_CausticFolds_ControlPanel.mp4','FULL_SPHERE_TimeLapse_v10_3_ForecastHUD_WeightedSeeds_AntipodeWarning.mp4','FULL_SPHERE_TimeLapse_v10_2_HistoryTimelineRing_NOW_Mandala_DodecaMotion.mp4','FULL_SPHERE_TimeLapse_v10_5000y_Precession_Inclination_Asteroids_EarthMarker.mp4','FULL_SPHERE_TripleNested_Dodecahedra_ColorMotion_v7.mp4'],
  driveIds:['1z9_umrAzqYwI4LjUl65cgvggBkzfPWaU','1NXAhnkErtW1kkhag246lBYanigVdMYlx','1NBjTXGZ5Fa3PYsq3grnT4j5vwlxkgOpg','1bQWFyWs9mnGQVHlGDFqCTiZcW9-JwBZD','1uqpqoCXea-Ru51OAQ5lkJnWTbHPw4frE','1hkVtCAzjznSrJUSt5szCauZDKsB3UWi-'],
  origin:'GENERATED_OUTPUT',evidenceState:'VISUAL_EVIDENCE',currentCoverage:'PARTIAL',
  omegaV6Connection:'Current Full Sphere addressing survives in ledgers/traversal, but the historical interactive visual grammar—lens/fold/history/NOW/forecast/antipode/precession/dodecahedron—is not recovered as a unified instrument.',
  missingDelta:['visual grammar reconstruction','history/NOW/forecast timeline','lens/fold controls','antipode warnings','precession/orbital layers','dodecahedral projection family'],
  promotionClass:'RECOVER_VISUAL_GRAMMAR',validation:['recover source parameters where available','pixel/output comparison only as presentation evidence','bind every live layer to typed state/evidence','no generated visuals labeled observed'],
  boundary:'MP4 outputs prove historical presentation results, not the equations, source data or physical validity that generated them.',priority:1
 },
 {
  id:'AG-009',family:'Visual and animated calculus corpus',
  artifacts:['Dewey_Woven_Continuity_General_Equation_Full.svg','full_canon_mode188_water_dewey_20736D_algebra.svg','CANON_RELATIVITY_ANIMATED_DODECA_FOLD_WATER_TRUE_MOTION.svg','61917364224D_min_pi_motion_full_view.svg','dewey_calculus_20736D_extreme_detail.svg','executable_atlas_microdetail_188.svg','full_micro_macro_continuity_formula_sphere.svg'],
  driveIds:['17y92Koszwk9d7-yZ8fGGlbiiD4mGzXkC','1crDGiOwPOR2CM22vuGXgGZ4vmMXAiii8','19J3pbibz0L9Q8c9bjXjWUTbtr-Azd2-V','1ndZ-v8Ih19-3Se_J-4VmlRgxPLtNwWmm','1IJiV1KRqs-UCYHgYeA6b8jRZU5-WCUDz','14nX1WYQGFsyBUuRVUXsCoJlsS5re-g2F','1KacJwYbag8YDWVELASeDOpPugGTUr3Om'],
  origin:'USER_AUTHORED',evidenceState:'VISUAL_EVIDENCE',currentCoverage:'PARTIAL',
  omegaV6Connection:'Current visuals reproduce pieces of the calculus but do not preserve the full historical visual grammar as typed, selectable state-bound instruments.',
  missingDelta:['SVG semantic parser','equation/label extraction','visual grammar registry','state binding map','interactive reconstruction','visual regression corpus'],
  promotionClass:'RECOVER_VISUAL_GRAMMAR',validation:['parse without changing source meaning','bind symbols to current canonical definitions','compare visual layers to source assets','mark legacy/superseded semantics'],
  boundary:'Visual resemblance is not structural or scientific proof. Recovered visuals must remain subordinate to current source/proof contracts.',priority:2
 },
 {
  id:'AG-010',family:'Compact installer / reconstruction core',
  artifacts:['CORE_FILE_HASHES.json','CORE_MANIFEST.json','INSTALL_OMEGA_COMPACT_WINDOWS.bat','install_omega_compact.ps1','omega_reconstruct.ps1','omega_app.html','OMEGA_RUNTIME_README.md'],
  driveIds:['10ZUU5GwWFXtXCm1EMGM1uw0DnTStIdBr','1nPty-ZFJPDUTegzH42DzNoKfzFmmwhFF','1gUqkJZOuxgtw9Rrd2Veaa1Hdk-RnRHxU','1lxMxpqmQjWTRHTAY7wykmNZeC9JTNMtu','1J-vkyM8GVuwdAp4cNQs0btiPvUuXZz7P','1t-uUMJjf36AHdbmDmQi2puZCHqVNSuS9','1RIWb7im27fX9QsbirTkmqWdmkTuFeT3p'],
  origin:'OMEGA_ARCHIVE',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'PARTIAL',
  omegaV6Connection:'Current Hybrid/native packaging has newer authority, but the compact installer contains manifest/hash/reconstruction patterns that can strengthen one-click repair and rollback.',
  missingDelta:['installer delta analysis','manifest compatibility map','reconstruct/repair adapter','rollback receipt','dependency preflight','support bundle'],
  promotionClass:'CROSS_VALIDATE',validation:['read scripts before execution','sandbox install','hash verification','rollback test','preserve current Hybrid authorization boundary'],
  boundary:'Archived installer code is donor material only. It may not overwrite current runtime or execute on a host without explicit governed authorization.',priority:2
 },
 {
  id:'AG-011',family:'Sovereign build proof history',
  artifacts:['OMEGA_B015_SURPASS_FORECAST_MAINLINE_R17_MANIFEST.json','OMEGA_B015_SURPASS_FORECAST_MAINLINE_R17_TEST_RECEIPT.json','OMEGA_B015_SURPASS_FORECAST_MAINLINE_R17_CONTINUITY.json','OMEGA_B015_PUBLIC_POST_MERGE_TRUTH_R16_MANIFEST.json','OMEGA_B015_PUBLIC_FULL_RESTORE_MIGRATION_R15_TEST_RECEIPT.json'],
  driveIds:['1mzBI7bTvXchYoG5VV7Wi8GfpTxgac4kL','10Sh_OUyRhiGaDkKpYudRVkra0-eTjUw3','10unRuipwhK7Zu8RixEKeFg68x9WBOKqu','1rV24FdwQflGoLd4s118T_n_xf1GdI4Bi','1fuluiqrl_GN3A48zfx7Hnsfumq13XFCE'],
  origin:'OMEGA_ARCHIVE',evidenceState:'RECEIPT_EVIDENCE',currentCoverage:'PARTIAL',
  omegaV6Connection:'Current release governance has strong exact-head proof, while older manifests/continuity/test receipts can enrich lineage and teach the Archive Compiler built→tested→accepted→deployed distinctions.',
  missingDelta:['receipt schema normalization','release-lineage graph','supersession map','historical acceptance import','receipt-to-current-proof crosswalk'],
  promotionClass:'PROOF_PROVENANCE',validation:['hash/manifest consistency','parent/revision reconciliation','never convert historical acceptance into current live proof'],
  boundary:'Historical receipts prove only the bounded release/event they describe. They cannot establish current deployment or current device execution.',priority:1
 },
 {
  id:'AG-012',family:'B058 correspondence / decision history',
  artifacts:['OMEGA_B058_CORRESPONDENCE_LEDGER.md','OMEGA_B058_V90_B020_FAST_PATH_AUDIT_2026-08-27'],
  driveIds:['1VEa4525VYM-hK-hqcvewUSsaJnSORgPk','1lPheKF4vfMVYrKnonU2grRrSGUx0lF7IKbVoJub_M80'],
  origin:'OMEGA_ARCHIVE',evidenceState:'RECEIPT_EVIDENCE',currentCoverage:'PARTIAL',
  omegaV6Connection:'The correspondence ledger records why one-renderer-packet authority, immutable NOAA frames, source-bound resolver rules and Earth traversal boundaries were introduced; those decisions should become machine-readable provenance scars.',
  missingDelta:['decision-record parser','supersession relationships','reason/evidence fields','scar carry into archive compiler','authority-change timeline'],
  promotionClass:'PROOF_PROVENANCE',validation:['bind claims to exact release/version','compare surviving current code','mark superseded paths','no historical live-state carry'],
  boundary:'Correspondence text is provenance evidence, not automatic executable authority.',priority:1
 },
 {
  id:'AG-013',family:'Symbolic / paraxial optics dependency',
  artifacts:['optics/gaussopt.py','optics/medium.py','optics/polarization.py','optics/waves.py','optics/tests'],
  driveIds:['1yjy-e4VvjF6D3XHMm6zr-UwGOHgpYzPT','1ZFVTSzzrbQ8uH2YHLOI8gH-KBpsMy2BF','1QmlOvOHjWNV8Yj-nM7QPpK_sq83ywnO2','1FJamp6GiThQ56kqvS4bu83ru4godCWrF','15vCAXGRzQmJVM9ZTnbjPxTiUMPINqhYe'],
  origin:'THIRD_PARTY',evidenceState:'SOURCE_REVIEWED',currentCoverage:'ABSENT',
  omegaV6Connection:'This is recognizable SymPy optics source and can serve as an attributed analytic cross-check dependency for Gaussian/geometric optics before RCWA/FDTD, not as an OMEGA-original solver.',
  missingDelta:['license/version identification','dependency isolation','analytic optics adapter','ABCD/beam-parameter test vectors','cross-fidelity receipt integration'],
  promotionClass:'ADMIT_DEPENDENCY',validation:['identify exact upstream/version/license','run upstream tests','compare known Gaussian optics cases','never vendor without attribution/compliance'],
  boundary:'Third-party source must retain attribution/license and must never be represented as an original OMEGA invention or as full-wave validation.',priority:2
 },
 {
  id:'AG-014',family:'Qt Quick 3D native dependency tree',
  artifacts:['QtQuick3D/Xr','QtQuick3D/Particles3D','QtQuick3D/ParticleEffects','QtQuick3D/MaterialEditor','QtQuick3D/lightmapviewer','qquick3dplugin.dll','quick3drenderplugin.dll'],
  driveIds:['1A0__DIp5PGxAA7PMHdOjWaO3SQ4MNv3G','1MzGE4bpIg_yio4o1OEvHQCz1MeoL03zo','1pu2sSW1IbnEzuu4qT0jBerG58uls77MI','1qbXW-u0xGyfHldvsIr1zS0JVSJQdbkBE','1nmMk3YUWFf7u-DchtXYW0U1NMqlLIMAl','1kKrwPsQyQ1kfA72JDrfdbMcTVlaLd32R','1AvokqvvuskvVZ2U5rB7cNRZivKWRQNhp'],
  origin:'DEPENDENCY',evidenceState:'DEPENDENCY_PRESENT',currentCoverage:'GATED',
  omegaV6Connection:'Native OMEGA rendering can potentially reuse an existing Qt Quick 3D runtime tree for XR, particles, materials and lightmapping instead of packaging a second incompatible stack.',
  missingDelta:['version/license manifest','DLL dependency graph','hardware capability probe','native renderer adapter','XR/particle/material proof surface'],
  promotionClass:'ADMIT_DEPENDENCY',validation:['binary provenance/version check','license compliance','sandbox load','GPU/driver compatibility','never claim feature support until exercised'],
  boundary:'Presence of Qt binaries proves dependency availability only; it does not prove that OMEGA currently executes XR, particle, material or lightmap features.',priority:2
 },
 {
  id:'AG-015',family:'Spatial audio native dependency',
  artifacts:['SpatialAudio/plugins.qmltypes','SpatialAudio/qmldir','quick3dspatialaudioplugin.dll'],
  driveIds:['1Uwf8Jz6IN0wJ6ya2D3Ygthi7gDSh71IY','1afyaJgqTnGjBpkXE4TU8dXSbPZFCG3i5','1cZJ_8Wk8Mt8jL7VU19ZL09GzSKHckLe-'],
  origin:'DEPENDENCY',evidenceState:'DEPENDENCY_PRESENT',currentCoverage:'GATED',
  omegaV6Connection:'Can extend current S17 sonification into native spatialized output if the archived Qt runtime is version-compatible and explicitly exercised.',
  missingDelta:['version/license manifest','spatial scene adapter','listener/source coordinate mapping','packet-to-audio spatialization','native verification'],
  promotionClass:'ADMIT_DEPENDENCY',validation:['sandbox plugin load','known-position audio tests','latency/channel tests','device capability proof'],
  boundary:'Dependency presence is not current OMEGA spatial-audio execution proof.',priority:3
 },
 {
  id:'AG-016',family:'Learned / generative audio dependency corpus',
  artifacts:['audio_diffusion','audio_spectrogram_transformer','stable_audio'],
  driveIds:['1IMru_jyS6_YSWVKYAJ31X8849sWrTfvx','1uFY-F6nHlfD0bUZbXXyMOtK4NIBYegEA','1yNq5cF6Sfu28vYiIZsLTA-TW_VQPZhCW'],
  origin:'DEPENDENCY',evidenceState:'DEPENDENCY_PRESENT',currentCoverage:'ABSENT',
  omegaV6Connection:'Potential future S17 feature-embedding, spectral-analysis or generative-audio donors, but they are lower priority than deterministic sonification/spatialization and require model/license/resource review.',
  missingDelta:['model/version census','license review','resource sizing','offline inference adapter','bounded generation policy'],
  promotionClass:'HOLD',validation:['do not load models until origin/license/weights are known','benchmark only after deterministic audio path is stable'],
  boundary:'Model folders are not admitted runtime dependencies and must not influence canonical state/truth.',priority:4
 },
 {
  id:'AG-017',family:'Omega Cube Engine lineage',
  artifacts:['omega_cube_engine_v5.xlsx','omega_cube_engine_v5_bound_I8.xlsx','omega_cube_engine_v8.xlsx','omega_cube_engine_v9.xlsx'],
  driveIds:['1599Qlq12xQo0rShjpM67T_EfvIgyGbbi','1J8o4OWjbI0UahxwPcX1i9lqLzu3EJCVM','1rmJwieFoRJdmA8h0Mj2UPN3bQ7jR16f1','1OtqQFZ7yuSy6K3Q6dNQPF5lyIDCk4VMK'],
  origin:'OMEGA_ARCHIVE',evidenceState:'ARCHIVE_VERIFIED',currentCoverage:'LEDGER_ONLY',
  omegaV6Connection:'Historical cube-engine generations may contain state-neighborhood, address, folding or rendering mechanics not preserved by current flat ledgers.',
  missingDelta:['version diff','formula/structure extraction','cube-address semantics','neighbor/topology crosswalk','identify superseded vs unique mechanics'],
  promotionClass:'CROSS_VALIDATE',validation:['diff v5→v8→v9','extract only unique deterministic operators','compare against current atlas/address runtime'],
  boundary:'Do not revive a competing coordinate/state authority; unique operators must adapt into current address semantics.',priority:3
 }
];

export const R288_ORIGIN_BOUNDARY='Third-party and dependency artifacts must retain origin, version and license identity. Archive presence never converts external code, libraries, models or binaries into OMEGA-original capability.' as const;
export const R288_TRUTH_BOUNDARY='ARCHIVE_VERIFIED means the artifact/folder was observed in the connected Drive corpus; it does not mean the contained software was executed, scientifically validated, medically validated, or admitted to production.' as const;
export const R288_PROMOTION_RULE='PRUNE → FINGERPRINT → ORIGIN → MAP → DIFF → RECOVER/ADAPT → TEST → PROVE → PROMOTE → RE-ARCHIVE' as const;

export function archiveGenomeSummaryR288(){
 const rows=ARCHIVE_GENOME_ROWS_R288;
 return {
  schema:R288_ARCHIVE_GENOME_SCHEMA,
  revision:R288_ARCHIVE_GENOME_REVISION,
  rows:rows.length,
  priority1:rows.filter(x=>x.priority===1).length,
  partial:rows.filter(x=>x.currentCoverage==='PARTIAL').length,
  absent:rows.filter(x=>x.currentCoverage==='ABSENT').length,
  gated:rows.filter(x=>x.currentCoverage==='GATED').length,
  dependencyRows:rows.filter(x=>x.origin==='DEPENDENCY'||x.origin==='THIRD_PARTY').length,
  promotionQueue:[...rows].sort((a,b)=>a.priority-b.priority).map(x=>({id:x.id,family:x.family,priority:x.priority,promotionClass:x.promotionClass,currentCoverage:x.currentCoverage}))
 };
}
