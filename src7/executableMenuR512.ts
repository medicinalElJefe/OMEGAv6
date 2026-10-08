import {OMEGA7_CAPABILITIES,OMEGA7_CAPABILITY_BY_ROUTE,type Omega7Capability,type Omega7Domain} from './capabilityRegistry';
import {R486_VISIBLE_CAPABILITIES,type VisibleFamilyR486} from './visibleCapabilityConvergenceR486';
import {RECOVERED_SYSTEM_EXECUTION_R512,RECOVERED_SYSTEM_SUMMARY_R512} from '../src/recoveredSoftwareExecutionR512';

export const R512_MENU_SCHEMA='OMEGA7_EXECUTABLE_MENU_R512' as const;
export type R512MenuSectionId='START'|'TOOLS'|'ADVANCED';
export type R512SoftwareLaunchState='LIVE'|'ADAPTER'|'GATED'|'ARCHIVE';

export type R512SoftwareBinding={
 id:string;
 name:string;
 family:VisibleFamilyR486;
 domain:Omega7Domain;
 route:string;
 operation:string;
 contribution:string;
 aliases:readonly string[];
 truth:string;
 state:'EXECUTES_NOW'|'EXECUTES_AS_ADAPTER'|'TRUTH_GATED'|'ARCHIVE_ONLY';
 launchState:R512SoftwareLaunchState;
 routable:boolean;
 capabilityReality:string;
 receiptAuthority:string;
 admissionAuthority:string;
};

const START:Partial<Record<Omega7Domain,readonly string[]>>={
 HOME:['Command Center','Projects','Earth Now','Create','Development','System Atlas'],
 WORK:['Workspace','Projects','Memory'],
 EXPLORE:['Earth Now','Matter Traversal','Forecast','Atlas','Relativity'],
 CREATE:['Create','Visual Instrument','Render Queue','Assets'],
 DEVELOP:['Development','Build Out','Hybrid Link','Kernel Intelligence','Quality Compiler'],
 SYSTEM:['System Atlas','Evidence & Proof','Modes','Validation','Settings'],
};

const ADVANCED=new Set([
 'Extreme Traversal','Atlas Calculator','Infinity','Convergence','Scale Compiler','Data Motion',
 'Archive Census','Archive Operators','Canon Evolution','Governance','Consolidation','Control Matrix',
 'SAI Lab','Plugins','Instructions'
]);

const SECTION_COPY:Record<R512MenuSectionId,{label:string;copy:string}>={
 START:{label:'Start here',copy:'Primary working surfaces for this area.'},
 TOOLS:{label:'Tools',copy:'Current operational capabilities and specialist instruments.'},
 ADVANCED:{label:'Advanced',copy:'Deep system, analysis, archive and authority surfaces.'},
};

export const R512_EXECUTABLE_SOFTWARE:readonly R512SoftwareBinding[]=R486_VISIBLE_CAPABILITIES.map(binding=>{
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(binding.route as any);
 const domain=cap?.domain||'SYSTEM';
 return Object.freeze({
  id:binding.id,
  name:binding.name,
  family:binding.family,
  domain,
  route:binding.route,
  operation:binding.operation,
  contribution:binding.contribution,
  aliases:Object.freeze([...binding.aliases]),
  truth:binding.truth,
  state:binding.state,
  launchState:binding.state==='EXECUTES_NOW'?'LIVE':binding.state==='EXECUTES_AS_ADAPTER'?'ADAPTER':'GATED',
  routable:binding.routable,
  capabilityReality:binding.capabilityReality,
  receiptAuthority:binding.receiptAuthority,
  admissionAuthority:binding.admissionAuthority,
 });
});

const domainFamily=(domain:Omega7Domain):VisibleFamilyR486=>domain==='WORK'?'WORK':domain==='EXPLORE'?'EXPLORE':domain==='CREATE'?'CREATE':domain==='DEVELOP'?'BUILD':domain==='SYSTEM'?'RECOVER':'UNDERSTAND';

export const R512_LEDGER_SOFTWARE:readonly R512SoftwareBinding[]=RECOVERED_SYSTEM_EXECUTION_R512.map(row=>{
 const cap=OMEGA7_CAPABILITY_BY_ROUTE.get(row.route as any);
 const domain=cap?.domain||'SYSTEM';
 return Object.freeze({
  id:row.systemId,
  name:row.artifact,
  family:domainFamily(domain),
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
});

const canonicalSoftwareName=(value:string)=>value.toLowerCase().replace(/ω/g,'omega').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const existingSoftwareNames=new Set(R512_EXECUTABLE_SOFTWARE.flatMap(row=>[row.name,...row.aliases]).map(canonicalSoftwareName));
export const R512_ALL_PREVIOUS_SOFTWARE:readonly R512SoftwareBinding[]=Object.freeze([
 ...R512_EXECUTABLE_SOFTWARE,
 ...R512_LEDGER_SOFTWARE.filter(row=>!existingSoftwareNames.has(canonicalSoftwareName(row.name)))
]);

const normalize=(value:string)=>value
 .toLowerCase()
 .replace(/ω/g,'omega')
 .replace(/(\\d),(?=\\d)/g,'$1')
 .replace(/[^a-z0-9]+/g,' ')
 .replace(/\\s+/g,' ')
 .trim();

const words=(value:string)=>normalize(value).split(' ').filter(Boolean);

export function menuSectionForCapabilityR512(cap:Omega7Capability):R512MenuSectionId{
 const primary=START[cap.domain]||[];
 if(primary.includes(cap.legacyRoute))return'START';
 if(ADVANCED.has(cap.legacyRoute))return'ADVANCED';
 return'TOOLS';
}

export function menuSectionsForDomainR512(domain:Omega7Domain){
 if(domain==='HOME'){
  const primary=(START.HOME||[]).map(route=>OMEGA7_CAPABILITIES.find(x=>x.legacyRoute===route)).filter(Boolean) as Omega7Capability[];
  return [Object.freeze({id:'START' as const,...SECTION_COPY.START,capabilities:Object.freeze(primary)})];
 }
 const caps=OMEGA7_CAPABILITIES.filter(x=>x.domain===domain);
 return (['START','TOOLS','ADVANCED'] as const).map(id=>Object.freeze({
  id,
  ...SECTION_COPY[id],
  capabilities:Object.freeze(caps.filter(cap=>menuSectionForCapabilityR512(cap)===id)),
 })).filter(section=>section.capabilities.length>0);
}

export function softwareForDomainR512(domain:Omega7Domain){
 return R512_ALL_PREVIOUS_SOFTWARE.filter(x=>domain==='HOME'||x.domain===domain);
}

function capabilityScore(cap:Omega7Capability,q:string,terms:string[]){
 const label=normalize(cap.label),route=normalize(cap.legacyRoute),desc=normalize(cap.description),family=normalize(cap.family),keywords=normalize(cap.keywords.join(' '));
 return terms.reduce((n,t)=>n+(label===q?30:0)+(route===q?28:0)+(label.includes(t)?8:0)+(route.includes(t)?7:0)+(family.includes(t)?4:0)+(desc.includes(t)?3:0)+(keywords.includes(t)?2:0),0);
}

function softwareScore(row:R512SoftwareBinding,q:string,terms:string[]){
 const name=normalize(row.name),aliases=row.aliases.map(normalize),operation=normalize(row.operation),contribution=normalize(row.contribution),route=normalize(row.route);
 return terms.reduce((n,t)=>n+
  (name===q?50:0)+(aliases.some(x=>x===q)?48:0)+(operation===q?42:0)+
  (name.includes(t)?10:0)+(aliases.some(x=>x.includes(t))?9:0)+(operation.includes(t)?7:0)+(route.includes(t)?5:0)+(contribution.includes(t)?3:0),0);
}

export type R512MenuSearchResult=
 |{kind:'CAPABILITY';id:string;score:number;capability:Omega7Capability}
 |{kind:'SOFTWARE';id:string;score:number;software:R512SoftwareBinding};

export function searchExecutableMenuR512(query:string,domain:Omega7Domain='HOME'):readonly R512MenuSearchResult[]{
 const q=normalize(query);
 const terms=words(query);
 if(!q){
  const primary=(START[domain]||START.HOME||[])
   .map(route=>OMEGA7_CAPABILITIES.find(x=>x.legacyRoute===route))
   .filter(Boolean) as Omega7Capability[];
  return primary.map((cap,index)=>({kind:'CAPABILITY' as const,id:'cap:'+cap.id,score:100-index,capability:cap}));
 }
 const capRows=OMEGA7_CAPABILITIES
  .map(cap=>({kind:'CAPABILITY' as const,id:'cap:'+cap.id,score:capabilityScore(cap,q,terms),capability:cap}))
  .filter(x=>x.score>0);
 const softwareRows=R512_ALL_PREVIOUS_SOFTWARE
  .map(software=>({kind:'SOFTWARE' as const,id:'software:'+software.id,score:softwareScore(software,q,terms),software}))
  .filter(x=>x.score>0);
 return [...softwareRows,...capRows].sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}

export function softwareBindingR512(id:string){return R512_ALL_PREVIOUS_SOFTWARE.find(x=>x.id===id)||null}

export const R512_MENU_SUMMARY=Object.freeze({
 schema:R512_MENU_SCHEMA,
 routeCount:OMEGA7_CAPABILITIES.length,
 recoveredSoftwareCount:R512_ALL_PREVIOUS_SOFTWARE.length,
 reviewedSystemLedgerCount:RECOVERED_SYSTEM_SUMMARY_R512.total,
 reviewedKeepMergeCount:RECOVERED_SYSTEM_SUMMARY_R512.keepMerge,
 reviewedDonorCount:RECOVERED_SYSTEM_SUMMARY_R512.donor,
 liveSoftwareCount:R512_EXECUTABLE_SOFTWARE.filter(x=>x.launchState==='LIVE').length,
 adapterSoftwareCount:R512_EXECUTABLE_SOFTWARE.filter(x=>x.launchState==='ADAPTER').length,
 gatedSoftwareCount:R512_ALL_PREVIOUS_SOFTWARE.filter(x=>x.launchState==='GATED').length,
 archiveSoftwareCount:R512_ALL_PREVIOUS_SOFTWARE.filter(x=>x.launchState==='ARCHIVE').length,
 unroutableSoftwareCount:R512_EXECUTABLE_SOFTWARE.filter(x=>!x.routable).length,
 rule:'INTENT_TO_CAPABILITY_TO_EXECUTOR_WITH_HISTORICAL_ALIASES_AS_EXECUTABLE_CONTEXT_NOT_DEAD_MENU_ROWS',
 canonicalMutation:false,
});
