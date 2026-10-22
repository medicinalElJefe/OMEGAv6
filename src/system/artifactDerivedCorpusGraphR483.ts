import {ARCHIVE_GENOME_ALL_ROWS_R288,type ArchiveGenomeRowR288} from '../archiveGenomeLedgerR288b';
import {YEAR_CORPUS_EXECUTION_R473} from '../yearCorpusExecutionR473';
import {R314_BUILD_STAGES} from '../convergenceMasterR314';

export const R483_SCHEMA='OMEGA_ARTIFACT_DERIVED_CORPUS_GRAPH_R483' as const;
export type R483Coverage='ACTIVE'|'PARTIAL'|'LEDGER_ONLY'|'ABSENT'|'GATED';
export type R483CorpusNode={
 id:string;family:string;artifacts:readonly string[];driveIds:readonly string[];origin:string;evidenceState:string;coverage:R483Coverage;
 promotionClass:string;missingDelta:readonly string[];validation:readonly string[];boundary:string;priority:number;
 currentBindings:readonly string[];buildStages:readonly string[];routeIndependent:true;canonicalMutation:false;
};
const words=(s:string)=>new Set(s.toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(x=>x.length>2));
const overlap=(a:string,b:string)=>{const A=words(a),B=words(b);let n=0;for(const x of A)if(B.has(x))n++;return n};

function bindingsFor(row:ArchiveGenomeRowR288){
 return YEAR_CORPUS_EXECUTION_R473
  .map(x=>({id:x.id,score:Math.max(overlap(row.family,x.name),...row.artifacts.map(a=>overlap(a,x.name+' '+x.aliases.join(' '))))}))
  .filter(x=>x.score>=2).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)).map(x=>x.id);
}
function stagesFor(row:ArchiveGenomeRowR288){
 return R314_BUILD_STAGES.filter(s=>s.sourceFamilies.includes(row.id)||s.sourceFamilies.some(f=>overlap(f,row.family)>=2)).map(s=>s.id);
}
export function compileArtifactDerivedCorpusGraphR483(rows:readonly ArchiveGenomeRowR288[]=ARCHIVE_GENOME_ALL_ROWS_R288):readonly R483CorpusNode[]{
 return Object.freeze(rows.map(row=>Object.freeze({
  id:row.id,family:row.family,artifacts:Object.freeze([...row.artifacts]),driveIds:Object.freeze([...row.driveIds]),origin:row.origin,evidenceState:row.evidenceState,
  coverage:row.currentCoverage,promotionClass:row.promotionClass,missingDelta:Object.freeze([...row.missingDelta]),validation:Object.freeze([...row.validation]),
  boundary:row.boundary,priority:row.priority,currentBindings:Object.freeze(bindingsFor(row)),buildStages:Object.freeze(stagesFor(row)),
  routeIndependent:true as const,canonicalMutation:false as const
 })));
}
export function auditArtifactDerivedCorpusGraphR483(nodes:readonly R483CorpusNode[]=compileArtifactDerivedCorpusGraphR483()){
 const ids=nodes.map(x=>x.id),artifactCount=nodes.reduce((n,x)=>n+x.artifacts.length,0),driveIdCount=nodes.reduce((n,x)=>n+x.driveIds.length,0);
 const incomplete=nodes.filter(x=>x.coverage!=='ACTIVE');
 const unbound=nodes.filter(x=>x.currentBindings.length===0);
 const unstaged=nodes.filter(x=>x.buildStages.length===0);
 const r473Ids=new Set(YEAR_CORPUS_EXECUTION_R473.map(x=>x.id));
 const bindingsReferenced=new Set(nodes.flatMap(x=>x.currentBindings));
 return Object.freeze({
  schema:R483_SCHEMA,nodes:nodes.length,artifactCount,driveIdCount,
  incomplete:incomplete.map(x=>x.id),unbound:unbound.map(x=>x.id),unstaged:unstaged.map(x=>x.id),
  r473Bindings:YEAR_CORPUS_EXECUTION_R473.length,r473BindingsReferencedFromArtifacts:[...bindingsReferenced].filter(x=>r473Ids.has(x)).sort(),
  corpusAuthority:'R288_ARCHIVE_GENOME_PLUS_R314_BUILD_GRAPH' as const,
  executorProjection:'R473_IS_DOWNSTREAM_PROJECTION_NOT_CAPABILITY_IDENTITY_AUTHORITY' as const,
  pass:ids.length===new Set(ids).size&&nodes.length===ARCHIVE_GENOME_ALL_ROWS_R288.length&&artifactCount>nodes.length,
  canonicalMutation:false as const,
  boundary:'R483 inventories artifact-derived corpus families independently of UI routes. Matching to R473 is a non-authoritative current-executor crosswalk; absence of a match is preserved as evidence, never silently collapsed into an existing route.'
 });
}
