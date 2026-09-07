import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';

export const R204_REVISION='R204';
export const R204_SCHEMA='OMEGA_FORENSIC_CONTINUITY_LEDGER_R204';
export const R204_OUTPUT='omega-forensic-continuity-r204.json';
export const R204_LAWS=Object.freeze([
  'HASH_IDENTITY_IS_NOT_INDEPENDENT_EMPIRICAL_CORROBORATION',
  'DESCENDANT_ARTIFACTS_MAY_NOT_SELF_CONFIRM_ANCESTOR_TRUTH',
  'DRIVE_BYTE_BINDING_APPLIES_ONLY_TO_EXPLICITLY_FETCHED_RAW_FILES',
  'DRIVE_METADATA_OBSERVATION_IS_NOT_RUNTIME_AUTHORITY',
  'AT09_REQUIRES_HOST_HEALTH_RECEIPT_AND_IS_NOT_CLOSED_BY_HEARTBEAT_ALONE',
  'AT10_REPOSITORY_CONTINUITY_MAY_BE_PROVED_WITHOUT_CLAIMING_COMPLETE_EXTERNAL_ARCHIVE_HASH_COVERAGE',
  'R180_REMAINS_LIVING_WORLD_DISPATCH_AUTHORITY_THROUGH_R147',
  'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY'
]);
export const R204_AUTHORITY_FILES=Object.freeze([
  ['.github/workflows/ci.yml','CANONICAL_DEPLOYMENT_PROOF','CANON_RUNTIME'],
  ['.github/workflows/r170-current-convergence.yml','CURRENT_CONVERGENCE_PROOF','PROOF'],
  ['.github/workflows/r170-governed-selfbuild.yml','GOVERNED_SELFBUILD_CONTROL','PROOF'],
  ['.github/workflows/r204-forensic-continuity-ledger.yml','R204_FOCUSED_PROOF','PROOF'],
  ['package-lock.json','LOCKED_DEPENDENCY_GRAPH','BUILD'],
  ['public/omega-drive-observation-r204.json','CONNECTED_DRIVE_OBSERVATION','DRIVE_SNAPSHOT'],
  ['public/omega-operational-source-authority-r202-core.js','R202_R2021_SOURCE_AUTHORITY','PROOF'],
  ['public/omega-r170-self-build-governor.json','SELFBUILD_GOVERNOR','PROOF'],
  ['public/omega-hybrid-agent.py','HYBRID_AGENT_BYTES','HYBRID_PC'],
  ['public/omega-rcwa-agent.py','RCWA_AGENT_BYTES','PROOF'],
  ['public/omega-rcwa-worker.py','RCWA_WORKER_BYTES','PROOF'],
  ['src/App.tsx','ROUTING_SURFACE','CANON_RUNTIME'],
  ['src/driveAuthoritySnapshotR48.ts','R48_DRIVE_SNAPSHOT_CONTRACT','DRIVE_SNAPSHOT'],
  ['src/workerR34.js','CANONICAL_WORKER_SOURCE','CANON_RUNTIME'],
  ['vite.config.ts','BUILD_RECEIPT_AND_FORENSIC_COMPILER','BUILD'],
  ['wrangler.jsonc','CLOUDFLARE_BINDING_AUTHORITY','CANON_RUNTIME']
]);

const sha256=value=>createHash('sha256').update(value).digest('hex');
const isSha40=value=>/^[a-f0-9]{40}$/i.test(String(value||''));
const isSha64=value=>/^[a-f0-9]{64}$/i.test(String(value||''));
function stable(value){
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])]));
  return value;
}
export const stableStringifyR204=value=>JSON.stringify(stable(value));

export function repositoryEntriesR204(){
  return R204_AUTHORITY_FILES.map(([path,role,sourceClass])=>{
    const bytes=readFileSync(path);
    return{path,role,sourceClass,bytes:statSync(path).size,sha256:sha256(bytes)};
  }).sort((a,b)=>a.path.localeCompare(b.path));
}

export function driveObservationR204(){
  const observation=JSON.parse(readFileSync('public/omega-drive-observation-r204.json','utf8'));
  if(observation.schema!=='OMEGA_DRIVE_OBSERVATION_R204'||observation.revision!=='R204')throw new Error('R204 Drive observation schema/revision mismatch');
  const raw=Array.isArray(observation.rawByteBound)?observation.rawByteBound:[];
  if(raw.length<1)throw new Error('R204 Drive observation contains no raw-byte-bound donors');
  for(const item of raw){if(!isSha64(item.sha256)||!Number.isInteger(item.bytes)||item.bytes<1)throw new Error(`R204 invalid Drive byte receipt for ${item.title||'unknown'}`)}
  if(observation.liveDriveAuthority!==false||observation.exhaustive!==false)throw new Error('R204 Drive observation authority boundary regressed');
  return observation;
}

export function buildForensicContinuityLedgerR204(env=process.env){
  const entries=repositoryEntriesR204();
  const drive=driveObservationR204();
  const sourceSha=String(env.GITHUB_SHA||'UNAVAILABLE').trim();
  const candidateSha=String(env.OMEGA_CANDIDATE_SHA||'').trim()||null;
  const promotedMergeSha=String(env.OMEGA_PROMOTED_SHA||'').trim()||null;
  const rollbackSha=String(env.OMEGA_ROLLBACK_SHA||'').trim()||null;
  const productionBound=env.GITHUB_ACTIONS==='true'&&isSha40(sourceSha)&&promotedMergeSha===sourceSha&&isSha40(candidateSha)&&isSha40(rollbackSha);
  const artifactSetSha256=sha256(stableStringifyR204(entries));
  const driveRawBinding=drive.rawByteBound.map(({title,bytes,modifiedTime,sha256})=>({title,bytes,modifiedTime,sha256})).sort((a,b)=>a.title.localeCompare(b.title));
  const driveBindingSha256=sha256(stableStringifyR204(driveRawBinding));
  const core={
    schema:R204_SCHEMA,
    revision:R204_REVISION,
    state:productionBound?'PRODUCTION_BOUND_FORENSIC_CONTINUITY':'BUILD_BOUND_NOT_PRODUCTION_PROMOTED',
    source:{repository:'medicinalElJefe/OMEGAv6',sha:sourceSha,branch:String(env.GITHUB_REF_NAME||'UNKNOWN')},
    lineage:{candidateSha,promotedMergeSha,rollbackSha,authority:productionBound?'GITHUB_EXACT_TWO_PARENT_PROMOTION':'PRODUCTION_LINEAGE_NOT_BOUND'},
    artifactSetSha256,
    driveBinding:{state:'PARTIAL_RAW_BYTE_BOUND',rawByteBoundCount:driveRawBinding.length,metadataOnlyCount:Array.isArray(drive.metadataObserved)?drive.metadataObserved.length:0,driveBindingSha256,repositorySnapshotAuthority:drive.repositorySnapshotAuthority,liveDriveAuthority:false,exhaustive:false},
    archiveResiduals:{AT09:{state:'HOST_HEALTH_RECEIPT_REQUIRED',closed:false},AT10:{state:productionBound?'REPOSITORY_FORENSIC_LEDGER_PRODUCTION_BOUND_EXTERNAL_ARCHIVE_PARTIAL':'FORENSIC_LEDGER_BUILT_NOT_PRODUCTION_BOUND',closed:productionBound,externalArchiveFullyHashed:false}},
    executionClaimed:false,
    canonicalMutation:false,
    canonicalAdmissionAuthority:'R125',
    livingWorldDispatchAuthority:'R180/R147',
    independentEmpiricalEvidenceClaimed:false,
    laws:R204_LAWS,
    truthBoundary:'R204 binds repository authority bytes, exact build lineage and an explicitly bounded subset of raw Drive donor bytes. Hash continuity proves identity/integrity and ancestry, not independent empirical truth. AT10 closes only for the repository continuity ledger when production-bound; complete external archive byte coverage remains partial. AT09 remains open until a host-side desktop-health receipt exists. No PC-online, execution, solver-validity, scientific-truth or CanonState claim is created.'
  };
  const continuitySha256=sha256(stableStringifyR204(core));
  return{...core,generatedAt:new Date().toISOString(),entries,driveRawBinding,continuitySha256};
}

export function verifyForensicContinuityLedgerR204(ledger,{againstRepository=false}={}){
  if(ledger?.schema!==R204_SCHEMA||ledger?.revision!==R204_REVISION)throw new Error('R204 ledger schema/revision mismatch');
  if(!isSha64(ledger.artifactSetSha256)||!isSha64(ledger.continuitySha256)||!isSha64(ledger.driveBinding?.driveBindingSha256))throw new Error('R204 ledger SHA format invalid');
  const entries=[...(ledger.entries||[])].sort((a,b)=>String(a.path).localeCompare(String(b.path)));
  if(sha256(stableStringifyR204(entries))!==ledger.artifactSetSha256)throw new Error('R204 artifact-set digest mismatch');
  const raw=[...(ledger.driveRawBinding||[])].sort((a,b)=>String(a.title).localeCompare(String(b.title)));
  if(sha256(stableStringifyR204(raw))!==ledger.driveBinding.driveBindingSha256)throw new Error('R204 Drive-binding digest mismatch');
  if(ledger.canonicalMutation!==false||ledger.executionClaimed!==false||ledger.independentEmpiricalEvidenceClaimed!==false||ledger.canonicalAdmissionAuthority!=='R125'||ledger.livingWorldDispatchAuthority!=='R180/R147')throw new Error('R204 authority boundary regressed');
  if(ledger.archiveResiduals?.AT09?.closed!==false)throw new Error('R204 falsely closed AT09 without host-health proof');
  const {generatedAt,entries:_entries,driveRawBinding:_driveRawBinding,continuitySha256,...core}=ledger;
  if(sha256(stableStringifyR204(core))!==continuitySha256)throw new Error('R204 continuity digest mismatch');
  if(againstRepository){
    const current=repositoryEntriesR204();
    if(stableStringifyR204(current)!==stableStringifyR204(entries))throw new Error('R204 ledger entries do not match current repository bytes');
  }
  return true;
}

export function forensicContinuityPluginR204(){
  return{name:'omega-forensic-continuity-r204',apply:'build',writeBundle(){
    const ledger=buildForensicContinuityLedgerR204(process.env);
    verifyForensicContinuityLedgerR204(ledger,{againstRepository:true});
    mkdirSync('dist',{recursive:true});
    writeFileSync(`dist/${R204_OUTPUT}`,JSON.stringify(ledger,null,2)+'\n','utf8');
    console.log(`R204 FORENSIC CONTINUITY ${ledger.state} · ${ledger.entries.length} repository authorities · ${ledger.driveBinding.rawByteBoundCount} raw Drive donors · ${ledger.continuitySha256}`);
  }};
}
