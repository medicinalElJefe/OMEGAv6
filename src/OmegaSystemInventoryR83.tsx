import {useMemo,useState} from 'react';
import {Archive,Blocks,BrainCircuit,ChevronRight,Grid3X3,Layers3,Search,Settings2,ShieldCheck} from 'lucide-react';
import {FAMILIES} from './systemAtlasRuntime';
import {MASTER_CAPABILITIES_R83,MASTER_MENU_OPTIONS_R83,MASTER_SYSTEMS_R83,routeForCapabilityR83,routeForMenuOptionR83,routeForSystemR83} from './softwareMasterLedgerR83';
import {V77_BINS_R83} from './v77BinLedgerR83';
import {ARCHIVE_COLLECTIONS_R83,B043_ARCHIVE_R83,SOFTWARE2_VISIBLE_R83,routeForArchiveArtifactR83} from './archiveDonorIndexR83';
import {HOST_BUILD_ROWS_R83,HOST_BUILD_SOURCE_R83,routeForHostBuildR83} from './hostBuildLedgerR83';
import {ALL_MODES_BOUNDARY} from './allModesAuthority';
import {OMEGA_ROUTE_INVENTORY_R107,OMEGA_WORKSPACES_R82} from './omegaExperienceRegistryR82';
import './systemInventoryR83.css';

type Tab='FABRIC'|'SYSTEMS'|'FAMILIES'|'HOST_BUILD'|'MENUS'|'CAPABILITIES'|'ARCHIVES'|'V77';
type Props={onNavigate:(panel:string)=>void;compact?:boolean;initialTab?:Tab};
const TABS:readonly {id:Tab;label:string;count:number}[]=[
 {id:'FABRIC',label:'Full fabric',count:8},
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

export default function OmegaSystemInventoryR83({onNavigate,compact=false,initialTab='FABRIC'}:Props){
 const[tab,setTab]=useState<Tab>(initialTab),[query,setQuery]=useState('');
 const q=query.trim().toLowerCase();
 const systems=useMemo(()=>MASTER_SYSTEMS_R83.filter(x=>match(q,x.id,x.family,x.artifact,x.role,x.menuSetting,x.capability,x.disposition,x.menu)),[q]);
 const families=useMemo(()=>FAMILIES.filter(x=>match(q,x.id,x.name,x.invariant,x.role,x.status,x.statusNote,x.inventoryPurpose,x.target)),[q]);
 const hostBuild=useMemo(()=>HOST_BUILD_ROWS_R83.filter(x=>match(q,x.id,x.name,x.module,x.function,x.disposition,x.menu,x.stateSpace,x.authority)),[q]);
 const options=useMemo(()=>MASTER_MENU_OPTIONS_R83.filter(x=>match(q,x.menuId,x.topMenu,x.optionId,x.label,x.roles,x.output,x.stateSpace,x.proofGate,x.risk)),[q]);
 const capabilities=useMemo(()=>MASTER_CAPABILITIES_R83.filter(x=>match(q,x.id,x.name,x.roles,x.menu,x.law,x.output,x.stateTier,x.proofGate)),[q]);
 const archives=useMemo(()=>[...SOFTWARE2_VISIBLE_R83.map(x=>({...x,collection:'2Software'})),...B043_ARCHIVE_R83.map(x=>({...x,collection:'B043'}))].filter(x=>match(q,x.title,x.kind,x.collection)),[q]);
 const bins=useMemo(()=>V77_BINS_R83.filter(x=>match(q,x.id,x.direction,x.name,x.sourceTitle)),[q]);
 const fabric=useMemo(()=>FABRIC.filter(x=>match(q,x.id,x.name,x.detail,x.route)),[q]);
 const go=(route:string,key:string,value:string)=>{try{localStorage.setItem(key,value)}catch{}onNavigate(route)};
 return <section className={'r83-inventory '+(compact?'compact':'full')}>
  <header className='r83-inventory-head'><div><span>OMEGA COMPLETE SOFTWARE + CALCULUS INDEX · PRESERVE BEFORE PRUNE</span><h3>Integrated capability fabric navigator</h3><p>Application destinations are an interface inventory only. The full machine is canonical state + calculus/modes + eight functional layers + software/runtime families + controls + federation + proof.</p></div><div className='r83-inventory-kpis'><b>{MASTER_SYSTEMS_R83.length}</b><small>systems</small><b>{FAMILIES.length}</b><small>families</small><b>{ALL_MODES_BOUNDARY.sourceModeEvaluations}</b><small>source modes</small><b>{ALL_MODES_BOUNDARY.canonAuthorities}</b><small>canon lenses</small><b>{MASTER_CAPABILITIES_R83.length}</b><small>capabilities</small></div></header>
  <nav className='r83-inventory-tabs' aria-label='Software inventory layers'>{TABS.map(x=><button key={x.id} className={tab===x.id?'active':''} onClick={()=>setTab(x.id)} aria-pressed={tab===x.id}><span>{x.label}</span><b>{x.count}</b></button>)}</nav>
  <label className='r83-inventory-search'><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder='Search full fabric, systems, families, local-host lineage, menus, capabilities, archive builds or V77 bins…'/></label>
  <div className='r83-inventory-grid' data-tab={tab}>
   {tab==='FABRIC'&&fabric.map(x=><button key={x.id} onClick={()=>go(x.route,'omega.r107.fabricFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>R107 full-build authority</small><em>{x.detail}</em></span><strong>OPEN<small>{x.route}</small></strong><ChevronRight/></button>)}
   {tab==='SYSTEMS'&&systems.map(x=>{const route=routeForSystemR83(x);return <button key={x.id} onClick={()=>go(route,'omega.r83.systemFocus',x.id)}><code>{x.id}</code><span><b>{x.artifact}</b><small>{x.family} · {x.role}</small><em>{x.capability}</em></span><strong>{x.disposition}<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='FAMILIES'&&families.map(x=><button key={x.id} onClick={()=>go(x.target||'System Atlas','omega.r83.familyFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.invariant} · {x.role}</small><em>{x.inventoryPurpose}</em></span><strong>{x.status}<small>{x.target}</small></strong><ChevronRight/></button>)}
   {tab==='HOST_BUILD'&&hostBuild.map(x=>{const route=routeForHostBuildR83(x);return <button key={x.id} onClick={()=>go(route,'omega.r83.hostBuildFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.module} · {x.disposition} · {x.stateSpace}</small><em>{x.function}</em></span><strong>HOST LINEAGE<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='MENUS'&&options.map(x=>{const route=routeForMenuOptionR83(x);return <button key={x.optionId} onClick={()=>go(route,'omega.r83.menuOptionFocus',x.optionId)}><code>{x.optionId}</code><span><b>{x.label}</b><small>{x.topMenu} · default {x.default}</small><em>{x.output}</em></span><strong>{x.risk||'—'}<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='CAPABILITIES'&&capabilities.map(x=>{const route=routeForCapabilityR83(x);return <button key={x.id} onClick={()=>go(route,'omega.r83.capabilityFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.menu} · {x.stateTier}</small><em>{x.output}</em></span><strong>{x.upgradeLevel||'—'}<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='ARCHIVES'&&archives.map((x,i)=>{const route=routeForArchiveArtifactR83(x.title);return <button key={x.collection+'-'+x.title+'-'+i} onClick={()=>go(route,'omega.r83.archiveFocus',x.title)}><code>{x.collection==='B043'?'B043':'ARC'}</code><span><b>{x.title}</b><small>{x.collection} · {x.kind} · {x.size||'size —'}</small><em>Reviewed archive donor/build artifact · presence ≠ execution</em></span><strong>ARCHIVE<small>{route}</small></strong><ChevronRight/></button>})}
   {tab==='V77'&&bins.map(x=>{const route=BIN_ROUTE[x.bin]||'System Atlas';return <button key={x.id} onClick={()=>go(route,'omega.r83.binFocus',x.id)}><code>{x.id}</code><span><b>{x.name}</b><small>{x.direction} · V77 donor lineage</small><em>{x.sourceTitle}</em></span><strong>DONOR<small>{route}</small></strong><ChevronRight/></button>})}
  </div>
  <footer><ShieldCheck/><span><b>Truth boundary:</b> route inventory, mode availability, source-backed execution, current runtime execution, historical donor presence and design-ledger intent remain separate statuses. Nothing here promotes a catalog mode, archive donor or registered control merely because it is visible.</span><div><BrainCircuit/>{ALL_MODES_BOUNDARY.sourceModeEvaluations}+{ALL_MODES_BOUNDARY.canonAuthorities} mode/lens authority<Blocks/>{MASTER_SYSTEMS_R83.length}-system ledger<Archive/>{ARCHIVE_COLLECTIONS_R83.map(x=>x.count).reduce((a,b)=>a+b,0)} indexed archive items<Grid3X3/>{FAMILIES.length} source families<Settings2/>{HOST_BUILD_ROWS_R83.length} local-host rows · {HOST_BUILD_SOURCE_R83.autoPingCells} auto-ping cells</div></footer>
 </section>;
}
