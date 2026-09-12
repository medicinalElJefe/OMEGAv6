import fs from 'node:fs';
const p='src/archiveGenomeLedgerR288.ts';
if(!fs.existsSync(p))throw new Error('R288 archive genome ledger missing');
const s=fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(`R288 invariant failed: ${msg}`)};
for(const token of [
 'OMEGA_ARCHIVE_GENOME_LEDGER_R288','PRUNE → FINGERPRINT → ORIGIN → MAP → DIFF → RECOVER/ADAPT → TEST → PROVE → PROMOTE → RE-ARCHIVE',
 'OMEGA_SAI_B059_PART_01_CORE_COMPILED.zip','PSC_20736D_all_domains_FULL_QR_build_expanded.xlsx',
 'Dewey_Calculus_20736D_Trig_Water_Force_Atlas.xlsx','Violet_Transfiguration_20736D_Atlas.xlsx',
 'Fold_Scale_Relativity_Calibration_Test_Harness_v1.xlsx','heavy_bio_35831808D_shard_36_of_36.xlsx',
 'Science_20736_Bound_Atomic_Periodic.xlsx','FULL_SPHERE_v12_ThinLens_CausticFolds_ControlPanel.mp4',
 'CORE_FILE_HASHES.json','OMEGA_B015_SURPASS_FORECAST_MAINLINE_R17_TEST_RECEIPT.json',
 'OMEGA_B058_CORRESPONDENCE_LEDGER.md','optics/gaussopt.py','quick3drenderplugin.dll',
 'quick3dspatialaudioplugin.dll','omega_cube_engine_v9.xlsx'
]) must(s.includes(token),`missing ledger token ${token}`);
for(const token of ['THIRD_PARTY','DEPENDENCY','GENERATED_OUTPUT','ARCHIVE_VERIFIED','SOURCE_REVIEWED','VISUAL_EVIDENCE','RECEIPT_EVIDENCE','DEPENDENCY_PRESENT','PARTIAL','ABSENT','GATED','RECOVER_EXECUTOR','INGEST_TYPED_DATA','RECOVER_VISUAL_GRAMMAR','ADMIT_DEPENDENCY','PROOF_PROVENANCE','CROSS_VALIDATE','HOLD'])must(s.includes(token),`missing classification ${token}`);
must(s.includes('Archive presence never converts external code, libraries, models or binaries into OMEGA-original capability.'),'third-party origin boundary missing');
must(s.includes('does not mean the contained software was executed, scientifically validated, medically validated, or admitted to production'),'archive truth boundary missing');
must(s.includes('They must not be promoted as literal physical dimensions'),'dimensional-relativity semantic guardrail missing');
must(s.includes('must not produce diagnosis, treatment, disease inference or clinical claims'),'Heavy Bio medical boundary missing');
must(s.includes('never be represented as an original OMEGA invention or as full-wave validation'),'optics dependency attribution/full-wave boundary missing');
const ids=[...s.matchAll(/id:'AG-(\d{3})'/g)].map(x=>x[1]);
must(ids.length>=17,`expected >=17 archive genome rows, got ${ids.length}`);
must(new Set(ids).size===ids.length,'archive genome IDs must be unique');
console.log(`R288 ARCHIVE GENOME LEDGER PASS · ${ids.length} typed archive upgrade rows · origin/truth/medical/dimensional boundaries preserved`);
