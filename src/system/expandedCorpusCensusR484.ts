import {ARCHIVE_GENOME_ALL_ROWS_R288} from '../archiveGenomeLedgerR288b';
import {MASTER_SYSTEMS_R83,MASTER_SYSTEM_SOURCE_R83} from '../softwareMasterLedgerR83';
import {SOFTWARE2_VISIBLE_R83,ARCHIVE_SOURCE_BOUNDARY_R83} from '../archiveDonorIndexR83';
import {YEAR_CORPUS_EXECUTION_R473} from '../yearCorpusExecutionR473';

export const R484_SCHEMA='OMEGA_EXPANDED_CORPUS_CENSUS_R484' as const;
export type R484Truth='VERIFIED_SOURCE'|'RECOVERED_LEDGER'|'ARCHIVE_LISTING_ONLY'|'CURRENT_EXECUTOR';
export type R484CorpusRecord={id:string;identity:string;source:string;truth:R484Truth;kind:string;capability:string;disposition:string;retention:'RETAIN'|'RETAIN_UNRESOLVED';canonicalMutation:false};

export function expandedCorpusCensusR484():readonly R484CorpusRecord[]{
 const ag=ARCHIVE_GENOME_ALL_ROWS_R288.map(x=>({id:x.id,identity:x.family,source:'R288_ARCHIVE_GENOME',truth:'VERIFIED_SOURCE' as const,kind:'ARCHIVE_FAMILY',capability:x.omegaV6Connection,disposition:x.promotionClass,retention:'RETAIN' as const,canonicalMutation:false as const}));
 const systems=MASTER_SYSTEMS_R83.map(x=>({id:x.id,identity:x.artifact,source:'R83_SOFTWARE_MASTER_LEDGER',truth:'RECOVERED_LEDGER' as const,kind:x.role,capability:x.capability,disposition:x.disposition,retention:'RETAIN' as const,canonicalMutation:false as const}));
 const listing=SOFTWARE2_VISIBLE_R83.map((x,i)=>({id:'SOFTWARE2-'+String(i+1).padStart(3,'0'),identity:x.title,source:'R83_SOFTWARE2_VISIBLE',truth:'ARCHIVE_LISTING_ONLY' as const,kind:x.kind,capability:'UNRESOLVED_UNTIL_CONTENT_EVIDENCE',disposition:'DISCOVERED',retention:'RETAIN_UNRESOLVED' as const,canonicalMutation:false as const}));
 const executors=YEAR_CORPUS_EXECUTION_R473.map(x=>({id:'EXEC-'+x.id,identity:x.name,source:'R473_CURRENT_EXECUTOR_PROJECTION',truth:'CURRENT_EXECUTOR' as const,kind:x.domain,capability:x.contribution,disposition:x.state,retention:'RETAIN' as const,canonicalMutation:false as const}));
 return Object.freeze([...ag,...systems,...listing,...executors]);
}
const norm=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function auditExpandedCorpusCensusR484(records:readonly R484CorpusRecord[]=expandedCorpusCensusR484()){
 const bySource=Object.fromEntries([...new Set(records.map(x=>x.source))].map(s=>[s,records.filter(x=>x.source===s).length]));
 const identities=new Map<string,R484CorpusRecord[]>();for(const r of records){const k=norm(r.identity);identities.set(k,[...(identities.get(k)||[]),r]);}
 const overlaps=[...identities.entries()].filter(([,v])=>v.length>1).map(([identity,rows])=>({identity,refs:rows.map(x=>x.id)}));
 const unresolved=records.filter(x=>x.retention==='RETAIN_UNRESOLVED');
 return Object.freeze({
  schema:R484_SCHEMA,totalRecords:records.length,bySource,overlaps,unresolved:unresolved.map(x=>x.id),
  registeredArchiveFamilies:ARCHIVE_GENOME_ALL_ROWS_R288.length,recoveredSoftwareRows:MASTER_SYSTEMS_R83.length,
  softwareLedgerDeclaredRows:MASTER_SYSTEM_SOURCE_R83.reviewedSystemRows,
  visibleArchiveListingRows:SOFTWARE2_VISIBLE_R83.length,archiveListingComplete:ARCHIVE_SOURCE_BOUNDARY_R83.software2ListingComplete,
  laws:['NEWLY_RECOVERED_TRUE_IDENTITY_IS_RETAINED','UNRESOLVED_DOES_NOT_MEAN_DISCARD','ALIASES_DO_NOT_BECOME_DISTINCT_CAPABILITIES_WITHOUT_EVIDENCE','ROUTES_DO_NOT_DEFINE_CAPABILITY_IDENTITY','CURRENT_EXECUTOR_IS_A_PROJECTION_NOT_CORPUS_AUTHORITY'],
  exhaustive:false as const,canonicalMutation:false as const,
  boundary:'R484 expands the census across independently recovered source authorities. It deliberately does not claim exhaustive corpus recovery because the Software2 source listing itself is marked incomplete and archive titles alone do not establish executable capability.'
 });
}
