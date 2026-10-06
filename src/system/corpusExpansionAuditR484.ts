import {ARCHIVE_GENOME_ALL_ROWS_R288} from '../archiveGenomeLedgerR288b';
import {ARCHIVE_SOURCE_BOUNDARY_R83,SOFTWARE2_VISIBLE_R83} from '../archiveDonorIndexR83';
import {MASTER_SYSTEMS_R83,MASTER_SYSTEM_SOURCE_R83} from '../softwareMasterLedgerR83';
import {SOURCE_CORPUS_AUTHORITIES_R107} from '../sourceCorpusCorrelationR107';
import {R314_BUILD_STAGES} from '../convergenceMasterR314';

export const R484_SCHEMA='OMEGA_CORPUS_EXPANSION_AUDIT_R484' as const;
export type CorpusAuthorityClassR484='ARTIFACT_FAMILY'|'SOFTWARE_LEDGER'|'VISIBLE_ARCHIVE_LISTING'|'CORPUS_AUTHORITY'|'BUILD_GRAPH';
export type CorpusAuthorityR484={id:string;class:CorpusAuthorityClassR484;records:number;exhaustive:boolean;identityAuthority:boolean;boundary:string};

export function corpusAuthoritiesR484():readonly CorpusAuthorityR484[]{
 return Object.freeze([
  {id:'R288_ARCHIVE_GENOME',class:'ARTIFACT_FAMILY',records:ARCHIVE_GENOME_ALL_ROWS_R288.length,exhaustive:false,identityAuthority:true,boundary:'Typed archive families already independently reviewed; not an exhaustive Drive/archive census.'},
  {id:'R83_MASTER_SYSTEM_LEDGER',class:'SOFTWARE_LEDGER',records:MASTER_SYSTEMS_R83.length,exhaustive:false,identityAuthority:true,boundary:MASTER_SYSTEM_SOURCE_R83.boundary},
  {id:'R83_SOFTWARE2_VISIBLE',class:'VISIBLE_ARCHIVE_LISTING',records:SOFTWARE2_VISIBLE_R83.length,exhaustive:ARCHIVE_SOURCE_BOUNDARY_R83.software2ListingComplete,identityAuthority:false,boundary:ARCHIVE_SOURCE_BOUNDARY_R83.boundary},
  {id:'R107_SOURCE_CORPUS_AUTHORITIES',class:'CORPUS_AUTHORITY',records:SOURCE_CORPUS_AUTHORITIES_R107.length,exhaustive:false,identityAuthority:true,boundary:'Authority registries identify independent source families and design ledgers; they do not prove every historical artifact has been enumerated.'},
  {id:'R314_BUILD_GRAPH',class:'BUILD_GRAPH',records:R314_BUILD_STAGES.length,exhaustive:false,identityAuthority:false,boundary:'Build stages are convergence dependencies, not artifact identities.'}
 ]);
}
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const toks=(s:string)=>new Set(norm(s).split(' ').filter(x=>x.length>2));
const score=(a:string,b:string)=>{const A=toks(a),B=toks(b);let n=0;for(const x of A)if(B.has(x))n++;return n};

export function discoveredSoftwareRowsR484(){
 const ag=ARCHIVE_GENOME_ALL_ROWS_R288;
 return Object.freeze(MASTER_SYSTEMS_R83.map(row=>{
  const matches=ag.map(x=>({id:x.id,score:Math.max(score(row.family,x.family),...x.artifacts.map(a=>score(row.artifact,a)))})).filter(x=>x.score>=2).sort((a,b)=>b.score-a.score);
  return Object.freeze({systemId:row.id,family:row.family,artifact:row.artifact,role:row.role,disposition:row.disposition,capability:row.capability,agCandidates:Object.freeze(matches.map(x=>x.id)),classification:matches.length?'CANDIDATE_OVERLAP':'UNRESOLVED_OUTSIDE_AG',canonicalMutation:false as const});
 }));
}
export function corpusExpansionAuditR484(){
 const authorities=corpusAuthoritiesR484(),systems=discoveredSoftwareRowsR484(),outside=systems.filter(x=>x.classification==='UNRESOLVED_OUTSIDE_AG');
 const visibleTitles=SOFTWARE2_VISIBLE_R83.map(x=>x.title);
 const visibleOutside=visibleTitles.filter(title=>!ARCHIVE_GENOME_ALL_ROWS_R288.some(x=>x.artifacts.some(a=>norm(a)===norm(title))));
 return Object.freeze({
  schema:R484_SCHEMA,authorities,
  known:{agFamilies:ARCHIVE_GENOME_ALL_ROWS_R288.length,softwareLedgerRows:MASTER_SYSTEMS_R83.length,visibleArchiveItems:SOFTWARE2_VISIBLE_R83.length,sourceAuthorities:SOURCE_CORPUS_AUTHORITIES_R107.length,buildStages:R314_BUILD_STAGES.length},
  unresolved:{softwareRowsOutsideAg:outside.map(x=>x.systemId),visibleItemsNotExactAgArtifacts:visibleOutside},
  exhaustiveCorpusKnown:false,
  coveragePercentage:null,
  laws:['NO_CORPUS_COMPLETION_PERCENTAGE_WITHOUT_EXHAUSTIVE_DENOMINATOR','UNRESOLVED_ARTIFACTS_SURVIVE_DISCOVERY','ALIASES_DO_NOT_BECOME_CAPABILITIES_BY_NAME','ROUTES_DO_NOT_DEFINE_CORPUS_IDENTITY','CURRENT_EXECUTION_DOES_NOT_ERASE_HISTORICAL_IMPLEMENTATION_LINEAGE'],
  next:'CLASSIFY_UNRESOLVED_ROWS_BY_DISTINCT_CAPABILITY_IMPLEMENTATION_ALIAS_SUPERSEDED_DONOR',
  canonicalMutation:false,
  boundary:'R484 proves that multiple independent corpus authorities exceed the 22-family AG registry and that the reviewed Software2 listing is explicitly incomplete. It does not infer unseen Drive contents, merge aliases, promote historical designs to execution, or claim an exhaustive corpus denominator.'
 });
}
