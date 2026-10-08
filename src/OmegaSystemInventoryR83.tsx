import {useMemo,useState} from 'react';
import {Archive,Blocks,BrainCircuit,ChevronRight,Grid3X3,Layers3,Search,Settings2,ShieldCheck} from 'lucide-react';
import {FAMILIES} from './systemAtlasRuntime';
import {R48_COMPLETION_FAMILIES} from './completionRuntimeR48';
import {MASTER_CAPABILITIES_R83,MASTER_MENU_OPTIONS_R83,MASTER_SYSTEMS_R83,routeForCapabilityR83,routeForMenuOptionR83} from './softwareMasterLedgerR83';
import {RECOVERED_SOFTWARE_EXECUTION_R512,RECOVERED_SOFTWARE_SUMMARY_R512,recoveredSoftwareByIdR512} from './recoveredSoftwareExecutionR512';
import {V77_BINS_R83} from './v77BinLedgerR83';
import {ARCHIVE_COLLECTIONS_R83,B043_ARCHIVE_R83,SOFTWARE2_VISIBLE_R83,routeForArchiveArtifactR83} from './archiveDonorIndexR83';
import {HOST_BUILD_ROWS_R83,HOST_BUILD_SOURCE_R83,routeForHostBuildR83} from './hostBuildLedgerR83';
import {ALL_MODES_BOUNDARY} from './allModesAuthority';
import {OMEGA_ROUTE_INVENTORY_R107,OMEGA_WORKSPACES_R82} from './omegaExperienceRegistryR82';
import OmegaBuildPotentialR133 from './OmegaBuildPotentialR133';
import './systemInventoryR83.css';

type Tab='RUNNING'|'FABRIC'|'POTENTIAL'|'SYSTEMS'|'FAMILIES'|'HOST_BUILD'|'MENUS'|'CAPABILITIES'|'ARCHIVES'|'V77';
type Props={onNavigate:(panel:string)=>void;compact?:boolean;initialTab?:Tab};
const TABS:readonly {id:Tab;label:string;count:number}[]=[
 {id:'RUNNING',label:'Software now',count:RECOVERED_SOFTWARE_SUMMARY_R512.launchable},
 {id:'FABRIC',label:'Architecture',count:8},
 {id:'POTENTIAL',label:'Build potential',count:FAMILIES.length},
 {id:'SYSTEMS',label:'Software systems',count:MASTER_SYSTEMS_R83.length},
 {id:'FAMILIES',label:'Runtime families',count:FAMILIES.length},
 {id:'HOST_BUILD',label:'Local-host lineage',count:HOST_BUILD_ROWS_R83.length},
 {id:'MENUS',label:'Menu options',count:MASTER_MENU_OPTIONS_R83.length},
 {id:'CAPABILITIES',label:'Capabilities',count:MASTER_CAPABILITIES_R83.length},
 {id:'ARCHIVES',label:'Archive builds',count:SOFTWARE2_VISIBLE_R83.length+B043_ARCHIVE_R83.length},
 {id:'V77',label:'V77 bins',count:V77_BINS_R83.length}
] as const;
const BIN_ROUTE:Record<number,string>={
 1:'System',2:'Atlas',3:'Earth Now',4:'Canon Evolution',5:'Memory',6:'Earth Now',7:'Create',8:'Visual Instrument',9:'Immersive Traversal',10:'Evidence & Proof',11:'Evidence & Proof',12:'Validation',
 13:'Memory',14:'Forecast',15:'Modes',16:'Convergence',17:'Modes',18:'Memory',19:'SAI Lab',20:'Development',21:'Matter Traversal',22:'Visual Instrument',23:'Scale Compiler',24:'Build Out'
};
const FABRIC=[
 {id:'STATE',name:'Canonical state + atlas',detail:'20,736 resident canonical addresses · project/state identity · admitted transition authority',route:'Atlas'},
 {id:'CALCULUS',name:'Unified calculus + Woven Continuity',detail:'partition → transform/exchange → invariant carry → scar/history carry → re-contextualize',route:'Extreme Traversal'},
 {id:'MODES',name:'All-mode authority fabric',detail:`${ALL_MODES_BOUNDARY.sourceModeEvaluations} source catalog records · ${ALL_MODES_BOUNDARY.canonAuthorities} bounded canon/calculus lenses · missing-input gates preserved`,route:'Modes'},
 {id:'LAYERS',name:'Eight functional layers',detail:'State · Intelligence · Memory · Relation · Computation · Action · Observation · Proof',route:'System Atlas'},
 {id:'SYSTEMS',name:'Recovered software system ledger',detail:`${MASTER_SYSTEMS_R83.length} reviewed systems · ${FAMILIES.length} runtime families · ${HOST_BUILD_ROWS_R83.length} local-host lineage rows`,route:'System Atlas'},
 {id:'CONTROL',name:'Menus + capabilities + action truth',detail:`${MASTER_MENU_OPTIONS_R83.length} recovered menu options · ${MASTER_CAPABILITIES_R83.length} master capability rows · bounded control execution`,route:'Control Matrix'},
 {id:'FEDERATION',name:'Distributed capability fabric',detail:'Genesis PROPOSE → Optical SCREEN → Sovereign SOLVE → OMEGAv6 ADMIT',route:'Cockpit'},
 {id:'INTERFACE',name:'Dynamic application inventory',detail:`${OMEGA_ROUTE_INVENTORY_R107.currentCount} currently registered destinations across ${OMEGA_WORKSPACES_R82.length} contexts · count is telemetry, not architecture`,route:'Command Center'}
] as const;
const match=(q:string,...v:any[])=>!q||v.join(' ').toLowerCase().includes(q);
const currentByFamily=new Map(R48_COMPLETION_FAMILIES.map(x=>[x.id,x]));
const currentRouteOf=(surface:string|undefined,fallback:string)=>String(surface||fallback||'System Atlas').split('/')[0].trim()||fallback||'System Atlas';

export default function OmegaSystemInventoryR83({onNavigate,compact=false,initialTab='RUNNING'}:Props){
 const[tab,setTab]=useState<Tab>(initialTab),[query,setQuery]=useState('');
 const q=query.trim().toLowerCase();
 const systems=useMemo(()=>MASTER_SYSTEMS_R83.filter(x=>match(q,x.id,x.family,x.artifact,x.role,x.menuSetting,x.capability,x.disposition,x.menu)),[q]);
 const running=useMemo(()=>RECOVERED_SOFTWARE_EXECUTION_R512.filter(x=>x.launchable&&match(q,x.systemId,x.artifact,x.family,x.state,x.route,x.executorReality,x.currentMeaning)),[q]);
 const families=useMemo(()=>FAMILIES.filter(x=>{const now=currentByFamily.get(x.id);return match(q,x.id,x.name,x.invariant,x.role,x.status,x.statusNote,x.inventoryPurpose,x.target,now?.successor,now?.surface,now?.proof,now?.remaining)}),[q]);
 const hostBuild=useMemo(()=>HOST_BUILD_ROWS_R83.filter(x=>match(q,x.id,x.name,x.module,x.function,x.disposition,x.menu,x.stateSpace,x.authority)),[q]);
 const options=useMemo(()=>MASTER_MENU_OPTIONS_R83.filter(x=>match(q,x.menuId,x.topMenu,x.optionId,x.label,x.roles,x.output,x.stateSpace,x.proofGate,x.risk)),[q]);
 const capabilities=useMemo(()=>MASTER_CAPABILITIES_R83.filter(x=>match(q,x.id,x.name,x.roles,x.menu,x.law,x.output,x.stateTier,x.proofGate)),[q]);
 const archives=useMemo(()=>[...SOFTWARE2_VISIBLE_R83.map(x=>({...x,collection:'2Software'})),...B043_ARCHIVE_R83.map(x=>({...x,collection:'B043'}))].filter(x=>match(q,x.title,x.kind,x.collection)),[q]);
 const bins=useMemo(()=>V77_BINS_R83.filter(x=>match(q,x.id,x.direction,x.name,x.sourceTitle)),[q]);
 const fabric=useMemo(()=>FABRIC.filter(x=>match(q,x.id,x.name,x.detail,x.route)),[q]);
 const go=(route:string,key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{}onNavigate(route)};
 const launchSystem=(systemId:string)=>{
  const resolution=recoveredSoftwareByIdR512(systemId),row=MASTER_SYSTEMS_R83.find(x=>x.id===systemId);
  if(!resolution||!row)return;
  const detail={schema:'OMEGA_RECOVERED_SOFTWARE_LAUNCH_R512',systemId,artifact:row.artifact,family:row.family,capability:row.capability,state:resolution.state,route:resolution.route,executorReality:resolution.executorReality,executorProof:resolution.executorProof,currentMeaning:resolution.currentMeaning,canonicalMutation:false};
  try{localStorage.setItem('omega.r83.systemFocus',systemId);localStorage.setItem('omega.r512.legacyLaunch',JSON.stringify(detail))}catch{}
  window.dispatchEvent(new CustomEvent('omega-r512-software-launch',{detail}));
  onNavigate(resolution.launchable?resolution.route:'Archive Operators');
 };
 return <section className={'r83-inventory '+(compact?'compact':'full')}>
  <header className='r83-inventory-head'><div><span>OMEGA SOFTWARE · CURRENT EXECUTION + RECOVERED LINEAGE</span><h3>Software that works now, with history preserved</h3><p>R512 resolves every recovered software row to its current executor before presenting it as runnable. KEEP/MERGE systems launch their proved current successor; device/provider/evidence work stays visibly gated; DONOR artifacts remain archive lineage instead of pretending to run.</p></div><div className='r83-inventory-kpis'><b>{RECOVERED_SOFTWARE_SUMMARY_R512.working}</b><small>working successors</small><b>{RECOVERED_SOFTWARE_SUMMARY_R512.gated}</b><small>gated successors</small><b>{RECOVERED_SOFTWARE_SUMMARY_R512.archiveOnly}</b><small>archive-only</small><b>{MASTER_SYSTEMS_R83.length}</b><small>recovered systems</small><b>{FAMILIES.length}</b><small>runtime families</small></div></header>
  <nav className='r83-inventory-tabs' aria-label='Software inventory layers'>{TABS.map(x=><button key={x.id} className={tab===x.id?'active':''} onClick={()=>setTab(x.id)} aria-pressed={tab===x.id}><span>{x.label}</span><b>{x.count}</b></button>)}</nav>
  {tab!=='POTENTIAL'&&<label className='r83-inventory-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tab==='RUNNING'?'Search software that runs now…':'Search architecture, recovered systems, families, menus, capabilities or archives…'}/></label>}
  {tab==='POTENTIAL'?<OmegaBuildPotentialR133 compact={compact} onNavigate={onNavigate}/>:<div className='r83-inventory-grid' data-tab={tab}>
   {tab==='RUNNING'&&running.map(x=><button key={x.systemId} onClick={()=>launchSystem(x.systemId)} data-r512-software-state={x.state} data-r512-executor={x.route}><code>{x.systemId}</code><span><b>{x.artifact}</b><small>{x.family} · {x.state==='WORKING_SUCCESSOR'?'working now':'proof-gated'}</small><em>{x.currentMeaning}</em></span><strong>{x.state==='WORKING_SUCCESSOR'?'RUN':'OPEN GATED'}<small>{x.route} · {x.executorReality}</small></strong><ChevronRight/></button>)}
   {tab==='FABRIC'&&fabric.map(x=><button key={x.id} onClick={()=>go(x.route,'omega.r107.fabricFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>R107 full-build authority</small><em>{x.detail}</em></span><strong>OPEN<small>{x.route}</small></strong><ChevronRight/></button>)}
   {tab==='SYSTEMS'&&systems.map(x=>{const r=recoveredSoftwareByIdR512(x.id);return <button key={x.id} onClick={()=>launchSystem(x.id)} data-r512-software-state={r?.state||'UNRESOLVED'}><code>{x.id}</code><span><b>{x.artifact}</b><small>{x.family} · {x.role} · {x.disposition}</small><em>{x.capability}</em></span><strong>{r?.launchable?(r.state==='WORKING_SUCCESSOR'?'RUN SUCCESSOR':'GATED SUCCESSOR'):'LINEAGE'}<small>{r?.route||'System Atlas'} · {r?.executorReality||'UNRESOLVED'}</small></strong><ChevronRight/></button>})}
   {tab==='FAMILIES'&&families.map(x=>{const now=currentByFamily.get(x.id),route=currentRouteOf(now?.surface,x.target);return <button key={x.id} onClick={()=>go(route,'omega.r83.familyFocus',x.id)} title={`Current ${now?.successor||'UNMAPPED'} · ${now?.surface||x.target} · V24 ${x.status} → ${x.target}`}><code>{x.id}</code><span><b>{x.name}</b><small>{x.invariant} · {x.role}</small><em>{x.inventoryPurpose}</em></span><strong>{now?.successor||x.status}<small>{route} · V24 {x.status}</small></strong><ChevronRight/></button>})}
   {tab==='HOST_BUILD'&&hostBuild.map(x=>{const route=routeForHostBuildR83(x);return <button key={x.id} onClick={()=>go(route,'omega.r83.hostBuildFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.module} · {x.disposition} · {x.stateSpace}</small><em>{x.function}</em></span><strong>HOST LINEAGE<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='MENUS'&&options.map(x=>{const route=routeForMenuOptionR83(x);return <button key={x.optionId} onClick={()=>go(route,'omega.r83.menuOptionFocus',x.optionId)}><code>{x.optionId}</code><span><b>{x.label}</b><small>{x.topMenu} · default {x.default}</small><em>{x.output}</em></span><strong>{x.risk||'—'}<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='CAPABILITIES'&&capabilities.map(x=>{const route=routeForCapabilityR83(x);return <button key={x.id} onClick={()=>go(route,'omega.r83.capabilityFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.menu} · {x.stateTier}</small><em>{x.output}</em></span><strong>{x.upgradeLevel||'—'}<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='ARCHIVES'&&archives.map((x,i)=>{const route=routeForArchiveArtifactR83(x.title);return <button key={x.collection+'-'+x.title+'-'+i} onClick={()=>go(route,'omega.r83.archiveFocus',x.title)}><code>{x.collection==='B043'?'B043':'ARC'}</code><span><b>{x.title}</b><small>{x.collection} · {x.kind} · {x.size||'size —'}</small><em>Reviewed archive donor/build artifact · presence ≠ execution</em></span><strong>ARCHIVE<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='V77'&&bins.map(x=>{const route=BIN_ROUTE[x.bin]||'System Atlas';return <button key={x.id} onClick={()=>go(route,'omega.r83.binFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.direction} · V77 donor lineage</small><em>{x.sourceTitle}</em></span><strong>DONOR<small>{route}</small></strong><ChevronRight/></button>})}
  </div>}
  <footer><ShieldCheck/><span><b>Truth boundary:</b> a recovered software name is not treated as execution. R512 launches the current proved successor while preserving historical identity. Gated successors may open but cannot claim returned external/device/provider work without evidence; DONOR rows remain lineage only.</span><div><BrainCircuit/>{ALL_MODES_BOUNDARY.sourceModeEvaluations}+{ALL_MODES_BOUNDARY.canonAuthorities} mode/lens authority<Blocks/>{MASTER_SYSTEMS_R83.length}-system ledger<Archive/>{ARCHIVE_COLLECTIONS_R83.map(x=>x.count).reduce((a,b)=>a+b,0)} indexed archive items<Grid3X3/>{FAMILIES.length} source families<Settings2/>{HOST_BUILD_ROWS_R83.length} local-host rows · {HOST_BUILD_SOURCE_R83.autoPingCells} auto-ping cells</div></footer>
 </section>;
}
