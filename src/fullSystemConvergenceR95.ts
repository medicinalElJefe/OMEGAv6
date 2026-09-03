import {FAMILIES,MASTER_MENUS,SYSTEM_INVARIANT} from './systemAtlasRuntime';
import {MASTER_SYSTEMS_R83,MASTER_MENU_OPTIONS_R83,MASTER_CAPABILITIES_R83,validateMasterLedgerR83} from './softwareMasterLedgerR83';

export const ONE_SYSTEM_LEDGER_AUTHORITY_R95={
 source:'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx',
 softwareUniverseSource:'OMEGA_ALL_SOFTWARE_61917364224D_FULL_BUILD_v22.xlsx',
 primaryUI:'Operator Cockpit + Menu Matrix',
 runtimeAuthority:'Single HostState + CanonState authority',
 renderStandard:'Live field membrane, not decorative graphics',
 proofStandard:'Replayable proof + no shadow state',
 packageStandard:'One-click EXE + repair + patch',
 invariant:SYSTEM_INVARIANT,
 totals:{systems:100,families:24,menuOptions:36,capabilities:18,masterMenus:12,keep:63,merge:26,donor:11},
 acceptance:[
  'No orphan feature',
  'No duplicate semantic engines',
  'No build without evidence',
  'Pixel cells carry state',
  'All skins use the same state',
  'Skin cannot alter state',
  'No decorative-only frames',
  'View never covered',
  'Every action writes ledger',
  'Rejected transitions logged',
  'Return path exists',
  'No overwrite without proof',
  'No hidden mutation'
 ] as const
} as const;

export const COMPLETION_SEQUENCE_R95=[
 {order:1,menu:'01 Runtime Core',goal:'one canonical runtime authority',route:'System'},
 {order:2,menu:'02 Proof & Governance',goal:'admission, replay and no-shadow-state proof',route:'Evidence & Proof'},
 {order:3,menu:'03 Traversal',goal:'reversible stay/turn/escalate movement through canonical addresses',route:'Traversal'},
 {order:4,menu:'04 Render Field',goal:'20,736-cell state membrane with state-bound skins',route:'Visual Instrument'},
 {order:5,menu:'05 Host Inputs',goal:'real camera/text/file/system observations with source class',route:'Hybrid Link'},
 {order:6,menu:'06 AI Orchestration',goal:'bounded assistant/build planning with approval and receipts',route:'SAI Lab'},
 {order:7,menu:'07 Data / Excel Atlas',goal:'workbook seed, formula/checksum and round-trip control plane',route:'System Atlas'},
 {order:8,menu:'08 Audio / Signal',goal:'state sonification as optional feedback',route:'System Atlas'},
 {order:9,menu:'09 World / Bio / Forecast',goal:'domain projections over the same packet substrate',route:'Forecast'},
 {order:10,menu:'10 Recovery / Packaging',goal:'one-click install, health, patch and rollback',route:'Build Out'},
 {order:11,menu:'11 Archive Merge',goal:'donor scan, classify, conflict-resolve and recover without overwrite',route:'Archive Operators'},
 {order:12,menu:'12 Operator Cockpit',goal:'professional adaptive control surface that never covers the primary instrument',route:'Cockpit'}
] as const;

const activeStatus=new Set(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE']);
const gatedStatus=new Set(['EVIDENCE_GATED','DEVICE_GATED']);
export function fullSystemConvergenceR95(){
 const ledger=validateMasterLedgerR83();
 const familyRows=FAMILIES.map(f=>({
  id:f.id,name:f.name,status:f.status,target:f.target,
  completion:activeStatus.has(f.status)?'ACTIVE':gatedStatus.has(f.status)?'GATED':'RESTORE',
  reason:f.statusNote
 }));
 const restore=familyRows.filter(x=>x.completion==='RESTORE');
 const gated=familyRows.filter(x=>x.completion==='GATED');
 const active=familyRows.filter(x=>x.completion==='ACTIVE');
 const menuRows=MASTER_MENUS.map(([id,name,target,purpose])=>{
  const systems=MASTER_SYSTEMS_R83.filter(x=>String(x.menu).startsWith(id));
  const options=MASTER_MENU_OPTIONS_R83.filter(x=>String(x.menuId).replace('M','')===id);
  const capabilities=MASTER_CAPABILITIES_R83.filter(x=>String(x.menu).startsWith(id));
  return{id,name,target,purpose,systems:systems.length,options:options.length,capabilities:capabilities.length};
 });
 return{
  pass:ledger.pass&&FAMILIES.length===24&&MASTER_SYSTEMS_R83.length===100&&MASTER_MENU_OPTIONS_R83.length===36&&MASTER_CAPABILITIES_R83.length===18,
  invariant:SYSTEM_INVARIANT,
  authority:ONE_SYSTEM_LEDGER_AUTHORITY_R95,
  ledger,
  active,
  gated,
  restore,
  menuRows,
  nextRestore:restore.map(x=>x.id),
  boundary:'44 application routes are operator entry points only. Full-system completion is judged against the 100-system / 24-family / 36-option / 18-capability / 12-menu authority and its acceptance checks.'
 };
}
