import {OMEGA7_CAPABILITY_BY_ROUTE,type Omega7Domain} from './capabilityRegistry';
import type {VisibleFamilyR486} from './visibleCapabilityConvergenceR486';
import type {R512SoftwareBinding,R512MenuSearchResult} from './executableMenuR512';
import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512} from '../src/recoveredSoftwareExecutionR512';

const familyFor=(domain:Omega7Domain):VisibleFamilyR486=>domain==='WORK'?'WORK':domain==='EXPLORE'?'EXPLORE':domain==='CREATE'?'CREATE':domain==='DEVELOP'?'BUILD':domain==='SYSTEM'?'RECOVER':'UNDERSTAND';
const normalize=(value:string)=>value.toLowerCase().replace(/ω/g,'omega').replace(/(\d),(?=\d)/g,'$1').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const words=(value:string)=>normalize(value).split(' ').filter(Boolean);

export const R512_LAZY_LEDGER_SOFTWARE:readonly R512SoftwareBinding[]=Object.freeze(RECOVERED_SYSTEM_EXECUTION_R512.map(row=>{
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(row.route as any);
 const domain=cap?.domain||'SYSTEM';
 return Object.freeze({
  id:row.systemId,
  name:row.artifact,
  family:familyFor(domain),
  domain,
  route:row.route,
  operation:row.state==='ARCHIVE_ONLY'?'INSPECT_ARCHIVE_LINEAGE':`CONTINUE_${row.role}`,
  contribution:row.capability,
  aliases:Object.freeze([row.artifact,row.family,row.role,row.systemId]),
  truth:row.truth,
  state:row.state==='WORKING_SUCCESSOR'?'EXECUTES_NOW':row.state==='ARCHIVE_ONLY'?'ARCHIVE_ONLY':'TRUTH_GATED',
  launchState:row.state==='WORKING_SUCCESSOR'?'LIVE':row.state==='ARCHIVE_ONLY'?'ARCHIVE':'GATED',
  routable:row.state!=='RESTORATION_REQUIRED',
  capabilityReality:row.executorReality,
  receiptAuthority:'R142_EXECUTION_RECEIPT',
  admissionAuthority:'R125_CANON_ADMISSION_SEPARATE',
 });
}));

const score=(row:R512SoftwareBinding,q:string,terms:string[])=>{
 const name=normalize(row.name),aliases=row.aliases.map(normalize),operation=normalize(row.operation),contribution=normalize(row.contribution),route=normalize(row.route);
 return terms.reduce((n,t)=>n+(name===q?60:0)+(aliases.some(x=>x===q)?58:0)+(operation===q?44:0)+(name.includes(t)?11:0)+(aliases.some(x=>x.includes(t))?10:0)+(operation.includes(t)?7:0)+(route.includes(t)?5:0)+(contribution.includes(t)?3:0),0);
};

export function searchRecoveredSystemLedgerR512(query:string,excludeNames:readonly string[]=[]):readonly R512MenuSearchResult[]{
 const q=normalize(query),terms=words(query),excluded=new Set(excludeNames.map(normalize));
 if(!q)return[];
 return R512_LAZY_LEDGER_SOFTWARE
  .filter(row=>!excluded.has(normalize(row.name)))
  .map(software=>({kind:'SOFTWARE' as const,id:'ledger:'+software.id,score:score(software,q,terms),software}))
  .filter(x=>x.score>0)
  .sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}

export const R512_LAZY_LEDGER_SUMMARY=RECOVERED_SYSTEM_SUMMARY_R512;
