export const R328_SOURCE_CANON_SCHEMA='OMEGA_SOURCE_EXACT_CANON_R328' as const;
export const R328_SOURCE_CANON_REVISION='R328' as const;
export const R328_SOURCE_CANON_URL='/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv' as const;
export const R328_SOURCE_ORIGINAL_SHA256='1c805af0e6e3a5ef2bb869bfc7d389ecba8746ba18b311859dca88b4b400a8eb' as const;
export const R328_REPOSITORY_NORMALIZED_SHA256='478922fb496a9402a82063908811dd9e264a0214e198dac4fb6ecfe2e95807bf' as const;
export const R328_SOURCE_CANON_EXPECTED_RECORDS=3743 as const;
export const R328_CONFLICT_POLICY='CONFLICT_VARIANTS_PRESERVED_UNTIL_EXPLICIT_PROOF' as const;
export const R328_SOURCE_CANON_RECEIPT=Object.freeze({
 originalSha256:R328_SOURCE_ORIGINAL_SHA256,repositoryNormalizedSha256:R328_REPOSITORY_NORMALIZED_SHA256,originalSizeBytes:1838041,repositorySizeBytes:1834293,transportNormalization:'UTF8_BOM_REMOVED_CRLF_TO_LF_FINAL_EOL_REMOVED_VALUES_UNCHANGED',records:3743,sourceFamilies:13,sourceFiles:10,categories:47,concepts:495,propertyNames:173,computationHeads:45,epistemicStatuses:63,blankEpistemicRows:2,blankValidationRows:3,conflictGroups:463,multiVariantConflictGroups:405
});

export const R328_SOURCE_CANON_COLUMNS=[
 'record_id','source_family','source_file','source_section','source_row_key','category','concept_name','property_name','canonical_value','computation_language','epistemic_status','units_or_frame','dependency_symbols','validation_rule','conflict_group','provenance_note'
] as const;

export type R328CanonColumn=typeof R328_SOURCE_CANON_COLUMNS[number];
export type R328CanonRow=Record<R328CanonColumn,string>;
export type R328OperationFamily=
 'CONST'|'VALUE'|'META'|'DEFINE_EXPR'|'INPUT_SCHEMA'|'FRAME_SPEC'|'LEDGER_RULE'|'OUTPUT_SCHEMA'|'PIPELINE'|'GATE_RULE'|'EPISTEMIC_TAG'|'REGISTER_MODE'|'DECISION_STATE'|'ASSERT'|'DIRECT_SYMBOLIC_EXPR';
export type R328EpistemicClass='PUBLIC_REFERENCE'|'CANON_MODEL'|'SOFTWARE_CONTRACT'|'DERIVED_MODEL'|'PROOF_BOUNDARY'|'AUDIT'|'PROVENANCE'|'UNCLASSIFIED';
export type R328CrosswalkState='SOURCE_EXACT_CURRENT'|'CURRENT_SUCCESSOR'|'REFERENCE_ONLY'|'DEVICE_GATED'|'EVIDENCE_GATED'|'REVIEW_REQUIRED';

const PRIMARY_OPS=new Set<R328OperationFamily>(['CONST','VALUE','META','DEFINE_EXPR','INPUT_SCHEMA','FRAME_SPEC','LEDGER_RULE','OUTPUT_SCHEMA','PIPELINE','GATE_RULE','EPISTEMIC_TAG','REGISTER_MODE','DECISION_STATE','ASSERT']);
const clean=(value:unknown)=>String(value??'').trim();

function csvMatrixR328(text:string){
 const rows:string[][]=[],row:string[]=[],field:string[]=[];let quoted=false;
 const flushField=()=>{row.push(field.join(''));field.length=0};
 const flushRow=()=>{flushField();rows.push([...row]);row.length=0};
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(quoted){
   if(ch==='"'){if(text[i+1]==='"'){field.push('"');i++}else quoted=false}
   else field.push(ch);
   continue;
  }
  if(ch==='"'){quoted=true;continue}
  if(ch===','){flushField();continue}
  if(ch==='\n'){flushRow();continue}
  if(ch==='\r'){if(text[i+1]==='\n')continue;flushRow();continue}
  field.push(ch);
 }
 if(field.length||row.length)flushRow();
 if(quoted)throw new Error('R328 CSV unterminated quoted field');
 return rows;
}

export function parseSourceExactCanonCsvR328(text:string){
 const matrix=csvMatrixR328(text.replace(/^\uFEFF/,''));
 if(!matrix.length)throw new Error('R328 source canon is empty');
 const header=matrix.shift()||[];
 if(header.length!==R328_SOURCE_CANON_COLUMNS.length||header.some((value,index)=>value!==R328_SOURCE_CANON_COLUMNS[index]))throw new Error('R328 source canon header mismatch');
 const rows=matrix.filter(row=>row.length>1||clean(row[0])).map((values,index)=>{
  if(values.length!==R328_SOURCE_CANON_COLUMNS.length)throw new Error(`R328 row ${index+2} column-count mismatch ${values.length}`);
  const out={} as R328CanonRow;
  R328_SOURCE_CANON_COLUMNS.forEach((column,i)=>out[column]=values[i]??'');
  const expected=`R${String(index+1).padStart(6,'0')}`;
  if(out.record_id!==expected)throw new Error(`R328 record sequence mismatch ${out.record_id} != ${expected}`);
  for(const key of ['record_id','source_family','source_section','source_row_key','category','concept_name','property_name','canonical_value','computation_language'] as R328CanonColumn[])if(!clean(out[key]))throw new Error(`R328 required field empty ${out.record_id}.${key}`);
  return out;
 });
 if(rows.length!==R328_SOURCE_CANON_EXPECTED_RECORDS)throw new Error(`R328 record-count mismatch ${rows.length} != ${R328_SOURCE_CANON_EXPECTED_RECORDS}`);
 return rows;
}

export function computationHeadR328(language:string){
 const source=clean(language);
 const match=source.match(/^([A-Za-z0-9_ΩσΛΦΔ]+)\s*(?::=|\[|\(|∈|$)/u);
 return match?.[1]||source.split(/\s+/)[0]||'';
}

export function operationFamilyR328(language:string):R328OperationFamily{
 const head=computationHeadR328(language) as R328OperationFamily;
 return PRIMARY_OPS.has(head)?head:'DIRECT_SYMBOLIC_EXPR';
}

export function compileComputationLanguageR328(row:R328CanonRow){
 const exact=row.computation_language;
 const head=computationHeadR328(exact),family=operationFamilyR328(exact);
 const assign=exact.indexOf(':='),lhs=assign>=0?clean(exact.slice(0,assign)):head,rhs=assign>=0?clean(exact.slice(assign+2)):exact;
 const structural=['CONST','VALUE','META','INPUT_SCHEMA','FRAME_SPEC','LEDGER_RULE','OUTPUT_SCHEMA','PIPELINE','GATE_RULE','EPISTEMIC_TAG','REGISTER_MODE','DECISION_STATE','ASSERT'].includes(family);
 return {
  recordId:row.record_id,family,head,lhs,rhs,exact,
  parseStatus:head?'PARSED_HEAD':'UNPARSED',
  executionClass:structural?'STRUCTURAL_OR_VALIDATION':'SYMBOLIC_ONLY',
  autoExecute:false,
  boundary:'R328 preserves and structurally compiles the exact computation language. No symbolic expression is evaluated or granted physical/Canon authority merely because it parses.'
 };
}

export function epistemicClassR328(status:string):R328EpistemicClass{
 const s=clean(status).toLowerCase();
 if(!s)return'UNCLASSIFIED';
 if(s.includes('public physics')||s.includes('public math'))return'PUBLIC_REFERENCE';
 if(s.includes('source integrity')||s.includes('provenance'))return'PROVENANCE';
 if(s.includes('audit'))return'AUDIT';
 if(s.includes('proof')||s.includes('epistemic boundary')||s.includes('validation'))return'PROOF_BOUNDARY';
 if(s.includes('software')||s.includes('runtime')||s.includes('schema'))return'SOFTWARE_CONTRACT';
 if(s.includes('charted')||s.includes('computed')||s.includes('derived')||s.includes('cross-source'))return'DERIVED_MODEL';
 if(s.includes('canon')||s.includes('symbolic')||s.includes('rsc')||s.includes('framework')||s.includes('model'))return'CANON_MODEL';
 return'UNCLASSIFIED';
}

const tokens=(value:string)=>clean(value).split(/[;,|]/).map(x=>x.trim()).filter(Boolean);

const current=(row:R328CanonRow,artifacts:string[],proofIds:string[],boundary:string,state:R328CrosswalkState='CURRENT_SUCCESSOR')=>({
 recordId:row.record_id,state,artifacts,proofIds,boundary
});

export function crosswalkSourceExactRecordR328(row:R328CanonRow){
 const sf=row.source_family,cat=row.category,concept=row.concept_name,value=row.canonical_value,status=epistemicClassR328(row.epistemic_status);
 const combined=`${cat} ${concept} ${row.property_name} ${value}`.toLowerCase();
 if(sf==='MASTER'||sf==='SOURCE_MANIFEST'||sf==='VALIDATION')return current(row,['public/canon/OMEGA_CANON_ALL_CONCEPTS_SOURCE_EXACT_2026-09-18.csv','src/system/sourceExactCanonR328.ts'],['tests/r328-source-exact-canon-invariants.mjs'],'Exact source/provenance registry is current; source presence is not formula execution or Canon admission.','SOURCE_EXACT_CURRENT');
 if(status==='PUBLIC_REFERENCE')return current(row,['src/physicsRelativityRuntimeR132.ts','src/system/appliedCalculusAuthorityR168.ts'],['tests/r132-relational-physics-manifold-invariants.mjs'],'Public math/physics is retained as reference material and remains distinct from observed evidence and user-defined canon.','REFERENCE_ONLY');
 if(/webgpu|vulkan|metal\b|gpu packet|gpu runtime|millions of packets|native gpu|one-click installer|windows\/local package|clean-machine install/.test(combined))return current(row,['src/convergenceMasterR314.ts','src/fullSystemConvergenceR122.ts'],['tests/r122-full-potential-convergence-invariants.mjs'],'Native GPU/packaging requirements remain device-gated until current host capability and returned proof exist.','DEVICE_GATED');
 if(sf==='RSC')return current(row,['src/lensCalculus.ts','src/system/wovenStateEvolutionR315.js','src/system/wovenSystemTraversalR315.ts'],['tests/r315-woven-state-evolution-invariants.mjs','tests/r315-woven-system-traversal-invariants.mjs'],'RSC semantics are carried by current Woven/relational successors; exact row-level formula equivalence remains inspectable and no new physical primitive is inferred.');
 if(sf==='ATOMIC_WOVEN'||sf==='WOVEN_20736')return current(row,['src/wovenContinuityRuntimeR77.ts','src/system/wovenStateEvolutionR315.js','src/system/calculusAddressFabricR240.ts'],['tests/r77-woven-continuity-invariants.mjs','tests/r240-full-calculus-bridge-invariants.mjs','tests/r315-woven-state-evolution-invariants.mjs'],'Woven continuity/address semantics have current successors; address resolution remains representational and source/model boundaries survive.');
 if(sf==='JULY_ALL_MODES'||sf==='MODE_INVENTORY')return current(row,['src/allModesAuthority.ts','src/sourceBackedModeRuntimeR21.ts','src/fullOverallModeOrchestratorR79.ts','src/mode188DriveRuntimeR311.ts'],['tests/source-backed-runtime-r21-invariants.mjs','tests/r151-all-modes-truth-fusion-invariants.mjs'],'Mode source semantics are registered through current all-modes/source-backed execution; gated dependencies remain gated.');
 if(sf==='OMEGA_BUILD_CANON')return current(row,['src/convergenceMasterR314.ts','src/fullSystemCompletionR153.js'],['tests/r153-full-system-completion-invariants.mjs','tests/r314-autonomous-convergence-invariants.mjs'],'Build-canon semantics are represented by the current convergence/dependency graph; device/provider gates are not promoted by source text alone.');
 if(sf==='LATER_CANON')return current(row,['src/system/wovenStateEvolutionR315.js','src/system/calculusAddressFabricR240.ts','src/physicsRelativityRuntimeR132.ts'],['tests/r240-full-calculus-bridge-invariants.mjs','tests/r315-woven-state-evolution-invariants.mjs'],'Later canonical upgrades are mapped into current Woven/address/relativity successors subject to their existing truth boundaries.');
 if(sf==='DEWEY_TREE')return current(row,['src/system/appliedCalculusAuthorityR168.ts','src/physicsRelativityRuntimeR132.ts'],['tests/r168-whole-system-truth-performance-restoration-invariants.mjs'],'Relativity/calculus tree rows are model/reference inputs to the applied calculus spine; empirical meaning requires independent evidence.');
 if(sf==='UNIFIED_AUDIT')return current(row,['src/archiveGenomeLedgerR288.ts','src/convergenceMasterR314.ts'],['tests/r288-archive-genome-ledger-invariants.mjs'],'Audit rows remain audit evidence and convergence residuals; they do not become runtime truth by naming alone.','REVIEW_REQUIRED');
 if(sf==='MASTER_EQUATION_LEDGER'){
  const symbolic=status==='CANON_MODEL'||status==='DERIVED_MODEL';
  return current(row,['src/system/appliedCalculusAuthorityR168.ts','src/lensCalculus.ts','src/unifiedCalculus.ts'],['tests/r168-whole-system-truth-performance-restoration-invariants.mjs'],symbolic?'Equation is preserved and crosswalked to the calculus registry, but exact formula-by-formula executable equivalence requires explicit successor proof.':'Equation/reference row is retained with its epistemic class; no automatic physical claim is created.',symbolic?'REVIEW_REQUIRED':'REFERENCE_ONLY');
 }
 return current(row,[],[],'Source row is preserved exactly but no stronger current implementation mapping has been proved.','REVIEW_REQUIRED');
}

export function compileSourceExactCanonR328(rows:readonly R328CanonRow[]){
 const sourceFamilies=new Set<string>(),sourceFiles=new Set<string>(),categories=new Set<string>(),concepts=new Set<string>(),properties=new Set<string>(),epistemicStatuses=new Set<string>(),operationHeads=new Set<string>();
 const conflictMap=new Map<string,R328CanonRow[]>(),byOperation=new Map<string,number>(),byEpistemic=new Map<string,number>(),crosswalk=new Map<R328CrosswalkState,number>();
 for(const row of rows){
  sourceFamilies.add(row.source_family);if(row.source_file)sourceFiles.add(row.source_file);categories.add(row.category);concepts.add(row.concept_name);properties.add(row.property_name);epistemicStatuses.add(row.epistemic_status);
  operationHeads.add(computationHeadR328(row.computation_language));
  const op=operationFamilyR328(row.computation_language);byOperation.set(op,(byOperation.get(op)||0)+1);
  const ep=epistemicClassR328(row.epistemic_status);byEpistemic.set(ep,(byEpistemic.get(ep)||0)+1);
  if(row.conflict_group){const group=conflictMap.get(row.conflict_group)||[];group.push(row);conflictMap.set(row.conflict_group,group)}
  const state=crosswalkSourceExactRecordR328(row).state;crosswalk.set(state,(crosswalk.get(state)||0)+1);
 }
 const conflicts=[...conflictMap].map(([id,variants])=>({id,records:variants.map(x=>x.record_id),variantCount:new Set(variants.map(x=>x.canonical_value)).size,concepts:[...new Set(variants.map(x=>x.concept_name))]}));
 return {
  schema:R328_SOURCE_CANON_SCHEMA,revision:R328_SOURCE_CANON_REVISION,rowCount:rows.length,
  census:{sourceFamilies:sourceFamilies.size,sourceFiles:sourceFiles.size,categories:categories.size,concepts:concepts.size,propertyNames:properties.size,computationHeads:operationHeads.size,epistemicStatuses:epistemicStatuses.size,blankEpistemicRows:rows.filter(r=>!clean(r.epistemic_status)).length,blankValidationRows:rows.filter(r=>!clean(r.validation_rule)).length,conflictGroups:conflicts.length,multiVariantConflictGroups:conflicts.filter(x=>x.variantCount>1).length},
  operations:Object.fromEntries([...byOperation].sort()),
  epistemic:Object.fromEntries([...byEpistemic].sort()),
  crosswalk:Object.fromEntries([...crosswalk].sort()),
  conflictPolicy:R328_CONFLICT_POLICY,
  conflicts,
  dependency:{declaredRows:rows.filter(x=>tokens(x.dependency_symbols).length>0).length},
  canonicalAdmission:false,
  truthBoundary:'R328 compiles the source-exact semantic registry and classifies every record without overwriting conflict variants. Crosswalk state is implementation/proof metadata, not CanonState admission.'
 };
}

export async function loadSourceExactCanonR328(signal?:AbortSignal){
 const response=await fetch(R328_SOURCE_CANON_URL,{signal,cache:'no-store'});
 if(!response.ok)throw new Error(`R328 source canon HTTP ${response.status}`);
 const text=await response.text(),rows=parseSourceExactCanonCsvR328(text),compiled=compileSourceExactCanonR328(rows);
 return{rows,compiled};
}
