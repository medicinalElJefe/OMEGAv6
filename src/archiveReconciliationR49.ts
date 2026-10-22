import {SOFTWARE_REGISTRY_R49_A} from './data/softwareRegistryR49a';
import {SOFTWARE_REGISTRY_R49_B} from './data/softwareRegistryR49b';
import {SOFTWARE_REGISTRY_R49_C} from './data/softwareRegistryR49c';
import {SOFTWARE_REGISTRY_R49_D} from './data/softwareRegistryR49d';

export type ArchiveRelation='CURRENT_SUCCESSOR'|'MERGED_INTO_SUCCESSOR'|'DONOR_RETAINED';
export type ArchiveReality='WEB_ACTIVE'|'SOURCE_ACTIVE'|'LOCAL_ACTIVE'|'EVIDENCE_GATED'|'DEVICE_GATED';
export type RegistryRow=(typeof SOFTWARE_REGISTRY_R49_A)[number]|(typeof SOFTWARE_REGISTRY_R49_B)[number]|(typeof SOFTWARE_REGISTRY_R49_C)[number]|(typeof SOFTWARE_REGISTRY_R49_D)[number];
const RAW=[...SOFTWARE_REGISTRY_R49_A,...SOFTWARE_REGISTRY_R49_B,...SOFTWARE_REGISTRY_R49_C,...SOFTWARE_REGISTRY_R49_D] as readonly RegistryRow[];

const MENU_ROUTE:Record<string,string>={
 '01 Runtime Core':'System',
 '02 Proof & Governance':'Evidence & Proof',
 '03 Traversal':'Traversal',
 '04 Render Field':'Visual Instrument',
 '05 Host Inputs':'System Atlas',
 '06 AI Orchestration':'Command Center',
 '07 Data / Excel Atlas':'Plugins',
 '08 Audio / Signal':'System Atlas',
 '09 World / Bio / Forecast':'Reality Lab',
 '10 Recovery / Packaging':'Build Out',
 '11 Archive Merge':'Archive Operators',
 '12 Operator Cockpit':'Cockpit'
};
const DEVICE_RX=/\b(native|desktop|windows|installer|install target|shortcut|exe|gpu|mp4|filesystem|one-click|local runtime|service|websocket)\b/i;
const EVIDENCE_RX=/\b(earth|gis|lidar|dem|health|hrv|symptom|civilization|forecast|external|location)\b/i;
function routeFor(r:RegistryRow){
 const text=`${r.artifact} ${r.role} ${r.capability}`;
 if(/bio|biological/i.test(text))return 'Matter Traversal';
 if(/forecast/i.test(text))return 'Forecast';
 if(/earth|world/i.test(text))return 'Earth Now';
 if(/camera|observation|host adapter|now-frame/i.test(text))return 'System Atlas';
 if(/audio|soma|oscillator|sound/i.test(text))return 'System Atlas';
 if(/data|excel|workbook|lensmatrix/i.test(text))return 'Plugins';
 if(/render|visual|cinematic|mandala|volumetric|membrane/i.test(text))return 'Visual Instrument';
 if(/proof|governance|mode188|returnpacket|crimson/i.test(text))return 'Evidence & Proof';
 if(/installer|package|patch|replay verifier|micro build|oneclick|seal/i.test(text))return 'Build Out';
 if(/archive|hybrid canon|recovery board/i.test(text))return 'Archive Operators';
 return MENU_ROUTE[r.menuId]||'System Atlas';
}
function realityFor(r:RegistryRow):ArchiveReality{
 const text=`${r.artifact} ${r.role} ${r.capability}`;
 if(r.disposition==='DONOR')return EVIDENCE_RX.test(text)?'EVIDENCE_GATED':DEVICE_RX.test(text)?'DEVICE_GATED':'EVIDENCE_GATED';
 if(DEVICE_RX.test(text)&&(/DEPLOYMENT|CORE_RUNTIME|RENDER_ENGINE/.test(r.role)))return 'DEVICE_GATED';
 if(EVIDENCE_RX.test(text))return 'EVIDENCE_GATED';
 if(r.menuId==='01 Runtime Core'||r.menuId==='06 AI Orchestration'||r.menuId==='12 Operator Cockpit')return 'WEB_ACTIVE';
 if(r.menuId==='03 Traversal'||r.menuId==='04 Render Field'||r.menuId==='02 Proof & Governance')return 'SOURCE_ACTIVE';
 return 'LOCAL_ACTIVE';
}
function relationFor(r:RegistryRow):ArchiveRelation{return r.disposition==='KEEP'?'CURRENT_SUCCESSOR':r.disposition==='MERGE'?'MERGED_INTO_SUCCESSOR':'DONOR_RETAINED'}
function proofFor(r:RegistryRow,reality:ArchiveReality,route:string){
 if(reality==='DEVICE_GATED')return `Successor route ${route}; native/device execution requires paired target proof.`;
 if(reality==='EVIDENCE_GATED')return `Successor route ${route}; preserved as evidence/provider-bound where authoritative observation is missing.`;
 if(reality==='WEB_ACTIVE')return `Successor route ${route}; current hosted runtime/UI/command path is executable.`;
 if(reality==='SOURCE_ACTIVE')return `Successor route ${route}; canonical packet/calculus/renderer path is source-bound and executable.`;
 return `Successor route ${route}; browser-local executor/persistence/export path is active.`;
}
export const R49_ARCHIVE_RECONCILIATION=RAW.map(r=>{const route=routeFor(r),reality=realityFor(r);return {...r,route,reality,relation:relationFor(r),proof:proofFor(r,reality,route)} as const});
export const R49_RECONCILIATION_SUMMARY=(()=>{
 const byDisposition=Object.fromEntries(['KEEP','MERGE','DONOR'].map(k=>[k,R49_ARCHIVE_RECONCILIATION.filter(x=>x.disposition===k).length]));
 const byRelation=Object.fromEntries(['CURRENT_SUCCESSOR','MERGED_INTO_SUCCESSOR','DONOR_RETAINED'].map(k=>[k,R49_ARCHIVE_RECONCILIATION.filter(x=>x.relation===k).length]));
 const byReality=Object.fromEntries(['WEB_ACTIVE','SOURCE_ACTIVE','LOCAL_ACTIVE','EVIDENCE_GATED','DEVICE_GATED'].map(k=>[k,R49_ARCHIVE_RECONCILIATION.filter(x=>x.reality===k).length]));
 return {schema:'OMEGA_ARCHIVE_RECONCILIATION_R49',source:'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_MENU_LEDGER.xlsx / 01_All_Software_Registry',rowCount:R49_ARCHIVE_RECONCILIATION.length,byDisposition,byRelation,byReality,unmapped:R49_ARCHIVE_RECONCILIATION.filter(x=>!x.route).length,boundary:'R49 reconciles every workbook registry row to the strongest current successor or retained donor relation. It does not claim every historical package remains independently runnable; MERGED and DONOR lineage stays visible, and DEVICE/EVIDENCE gates remain gates rather than failures.'};
})();
