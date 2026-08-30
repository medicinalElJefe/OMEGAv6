import {OMEGA_CAPABILITY_AUTHORITY,capabilityReality,type CapabilityReality} from './capabilityAuthority';
import {FAMILIES,MASTER_MENUS} from './systemAtlasRuntime';

export const OPERATIONAL_CAPABILITY_SCHEMA='OMEGA_OPERATIONAL_CAPABILITY_R45' as const;
export type PerformanceClass='LIGHT'|'NORMAL'|'HEAVY'|'EXTREME';
export type PersistenceClass='NONE'|'LOCAL'|'PACKET'|'EVIDENCE';
export type ExecutionContract={name:string;familyId:string;reality:CapabilityReality;routable:boolean;performance:PerformanceClass;persistence:PersistenceClass;input:string;output:string;degradeTo:string;proof:string};

const FAMILY_ALIAS:Record<string,string>={
 'AI Cockpit':'S22','Hybrid Link':'S03','Atlas OS':'S00','Traversal / Domain':'S06','Reality Compiler':'S01','Field Renderer':'S08','Observer / Now':'S19','Earth':'S09','Dewey':'S14','Atlas Generator':'S06','Living Membrane':'S13','Persistent Packet':'S02','Proof / Governance':'S15','Recovery / Packaging':'S20','Rendering / Media':'S21','Dewey / Mode188':'S14','Proof Ledger':'S15','Artifact Governance':'S20','CanonForge':'S04','Universal Language':'S18','Control Planes':'S22'
};
const RESTORED_REALITY:Record<string,CapabilityReality>={'Immersive Traversal':'SOURCE_ACTIVE','Extreme Traversal':'SOURCE_ACTIVE','Build Out':'LOCAL_ACTIVE','Plugins':'LOCAL_ACTIVE'};
const HEAVY=new Set(['Matter Traversal','Visual Instrument','Earth Now','Atlas','Reality Lab','Immersive Traversal','Extreme Traversal','Traversal']);
const EXTREME=new Set(['Matter Traversal','Visual Instrument']);
const LOCAL=new Set(['Workspace','Create','Projects','Render Queue','Assets','Memory','Consolidation','Plugins','Settings','Build Out']);
const EVIDENCE=new Set(['Evidence & Proof','Validation','Quality Compiler','Governance','Archive Census','Archive Operators','System','Earth Now','Reality Lab']);

export function familyIdForCapability(family:string){return FAMILY_ALIAS[family]||'S00'}
export function effectiveCapabilityReality(name:string):CapabilityReality{return RESTORED_REALITY[name]||capabilityReality(name)}
export function capabilityExecutionContract(name:string):ExecutionContract{
 const c=OMEGA_CAPABILITY_AUTHORITY.find(x=>x.name===name);if(!c)throw new Error(`Unknown capability: ${name}`);
 const reality=effectiveCapabilityReality(name),routable=reality!=='DONOR_ONLY'&&reality!=='RESTORATION_DEBT';
 const performance:PerformanceClass=EXTREME.has(name)?'EXTREME':HEAVY.has(name)?'HEAVY':'NORMAL';
 const persistence:PersistenceClass=EVIDENCE.has(name)?'EVIDENCE':LOCAL.has(name)?'LOCAL':c.boundary==='SOURCE_PACKET'?'PACKET':'NONE';
 return{name,familyId:familyIdForCapability(c.family),reality,routable,performance,persistence,input:c.boundary,output:c.purpose,degradeTo:routable?name:'System Atlas',proof:`${c.implementation} · ${c.boundary} · ${reality}`};
}
export const OPERATIONAL_CAPABILITIES=OMEGA_CAPABILITY_AUTHORITY.map(x=>capabilityExecutionContract(x.name));
export function operationalCapabilityAudit(){
 const familyIds=new Set(FAMILIES.map(x=>x.id)),mappedFamilies=new Set(OPERATIONAL_CAPABILITIES.map(x=>x.familyId));
 const missingFamilyMappings=[...mappedFamilies].filter(x=>!familyIds.has(x));
 const duplicateNames=OPERATIONAL_CAPABILITIES.filter((x,i,a)=>a.findIndex(y=>y.name===x.name)!==i).map(x=>x.name);
 const unroutable=OPERATIONAL_CAPABILITIES.filter(x=>!x.routable).map(x=>x.name);
 const menuTargets=MASTER_MENUS.map(x=>x[2]),missingMenuTargets=menuTargets.filter(x=>!OPERATIONAL_CAPABILITIES.some(c=>c.name===x));
 const routedFamilies=new Set(OPERATIONAL_CAPABILITIES.filter(x=>x.routable).map(x=>x.familyId));
 const inventoryFamiliesWithoutRoute=FAMILIES.filter(x=>!routedFamilies.has(x.id)).map(x=>x.id);
 return{schema:OPERATIONAL_CAPABILITY_SCHEMA,total:OPERATIONAL_CAPABILITIES.length,routable:OPERATIONAL_CAPABILITIES.filter(x=>x.routable).length,gated:OPERATIONAL_CAPABILITIES.filter(x=>['EVIDENCE_GATED','DEVICE_GATED','PROVIDER_GATED'].includes(x.reality)).length,local:OPERATIONAL_CAPABILITIES.filter(x=>x.reality==='LOCAL_ACTIVE').length,source:OPERATIONAL_CAPABILITIES.filter(x=>x.reality==='SOURCE_ACTIVE'||x.reality==='RUNTIME_ACTIVE').length,unroutable,duplicateNames,missingFamilyMappings,missingMenuTargets,inventoryFamiliesWithoutRoute,pass:duplicateNames.length===0&&missingFamilyMappings.length===0&&missingMenuTargets.length===0,boundary:'R45 audits routing and implementation authority. A routable capability can still be evidence-, provider-, device-, or local-artifact-gated; routing is not proof of external execution.'};
}
export function capabilityPerformanceHints(name:string){const c=capabilityExecutionContract(name),cores=typeof navigator!=='undefined'?Number(navigator.hardwareConcurrency||4):4,lowPower=typeof window!=='undefined'&&(window.matchMedia('(max-width:760px)').matches||cores<=4),reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;return{class:c.performance,lowPower,reducedMotion:reduced,targetFps:reduced?0:lowPower?30:c.performance==='EXTREME'?45:60,renderDensity:lowPower?0.58:c.performance==='EXTREME'?0.82:1,idleChunk:lowPower?96:256,boundary:'Performance hints change scheduling/density only. They never change canonical state, evidence, calculus, or route authority.'}}
