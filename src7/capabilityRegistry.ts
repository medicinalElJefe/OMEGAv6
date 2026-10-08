import {OMEGA_NAVIGATION,type OmegaRouteName} from '../src/navigationRegistry';
import {CAPABILITY_BY_NAME,capabilityReality,type CapabilityReality} from '../src/capabilityAuthority';

export const OMEGA7_SCHEMA='OMEGA7_CAPABILITY_INHERITANCE_V1' as const;
export const OMEGA7_DOMAINS=['HOME','WORK','EXPLORE','CREATE','DEVELOP','SYSTEM'] as const;
export type Omega7Domain=typeof OMEGA7_DOMAINS[number];
export type Omega7Depth='STANDARD'|'ADVANCED'|'CANON';
export type Omega7Health='READY'|'DEGRADED'|'HELD'|'OFFLINE'|'FAILED'|'UNKNOWN';

export type Omega7Capability={
 id:string;
 legacyRoute:OmegaRouteName;
 legacyId:string;
 domain:Omega7Domain;
 label:string;
 description:string;
 family:string;
 effect:string;
 authority:string;
 reality:CapabilityReality;
 availability:Omega7Health;
 sourceBoundary:string;
 primaryAction:string;
 keywords:string[];
 compatibility:'OMEGAV6_BRIDGE';
};

const DOMAIN_BY_ROUTE:Record<OmegaRouteName,Omega7Domain>={
 'Command Center':'HOME',
 'Hybrid Link':'DEVELOP',
 'Workspace':'WORK',
 'Cockpit':'SYSTEM',
 'Immersive Traversal':'EXPLORE',
 'Matter Traversal':'EXPLORE',
 'Extreme Traversal':'EXPLORE',
 'Visual Instrument':'CREATE',
 'Relativity':'EXPLORE',
 'Earth Now':'EXPLORE',
 'Forecast':'EXPLORE',
 'Atlas':'EXPLORE',
 'Traversal':'EXPLORE',
 'Create':'CREATE',
 'Field':'EXPLORE',
 'Data Motion':'EXPLORE',
 'Reality Lab':'EXPLORE',
 'Atlas Calculator':'EXPLORE',
 'Infinity':'EXPLORE',
 'Convergence':'EXPLORE',
 'Quality Compiler':'DEVELOP',
 'Build Out':'DEVELOP',
 'Projects':'WORK',
 'Render Queue':'CREATE',
 'Assets':'CREATE',
 'Modes':'SYSTEM',
 'Kernel Intelligence':'DEVELOP',
 'Evidence & Proof':'SYSTEM',
 'Memory':'WORK',
 'Archive Census':'SYSTEM',
 'Archive Operators':'SYSTEM',
 'Development':'DEVELOP',
 'Canon Evolution':'SYSTEM',
 'SAI Lab':'DEVELOP',
 'Governance':'SYSTEM',
 'Consolidation':'SYSTEM',
 'Instructions':'SYSTEM',
 'Plugins':'SYSTEM',
 'Settings':'SYSTEM',
 'System':'SYSTEM',
 'Validation':'SYSTEM',
 'System Atlas':'SYSTEM',
 'Scale Compiler':'EXPLORE',
 'Control Matrix':'SYSTEM'
};

const LABEL_OVERRIDES:Partial<Record<OmegaRouteName,string>>={
 'Command Center':'Ask OMEGA',
 'Hybrid Link':'Computer & Device Link',
 'Immersive Traversal':'Immersive Explorer',
 'Matter Traversal':'Matter Explorer',
 'Extreme Traversal':'Deep Explorer',
 'Visual Instrument':'Visual Studio',
 'Earth Now':'Earth & Weather',
 'Atlas':'State Atlas',
 'Data Motion':'Motion Data',
 'Reality Lab':'Science Lab',
 'Infinity':'Recursive Explorer',
 'Convergence':'Compare & Converge',
 'Quality Compiler':'Quality & Reliability',
 'Build Out':'Build & Restore',
 'Modes':'Analysis Modes',
 'Kernel Intelligence':'AI Runtime',
 'Evidence & Proof':'Evidence & Proof',
 'Archive Census':'Archive',
 'Archive Operators':'Archive Tools',
 'Canon Evolution':'System Evolution',
 'SAI Lab':'AI Lab',
 'Governance':'Authority & Governance',
 'Consolidation':'System Consolidation',
 'System Atlas':'System Map',
 'Scale Compiler':'Scale Explorer',
 'Control Matrix':'System Controls'
};

const ACTION_OVERRIDES:Partial<Record<OmegaRouteName,string>>={
 'Command Center':'Ask or start a task',
 'Earth Now':'Open live Earth and weather',
 'Projects':'Open projects',
 'Create':'Create something',
 'Development':'Build or repair software',
 'Evidence & Proof':'Inspect evidence',
 'Hybrid Link':'Connect a computer or device',
 'Settings':'Change preferences',
 'System':'Check system health'
};

function healthForReality(reality:CapabilityReality):Omega7Health{
 switch(reality){
  case 'RUNTIME_ACTIVE':
  case 'SOURCE_ACTIVE':
  case 'LOCAL_ACTIVE': return 'READY';
  case 'EVIDENCE_GATED':
  case 'DEVICE_GATED':
  case 'PROVIDER_GATED': return 'HELD';
  case 'RESTORATION_DEBT': return 'DEGRADED';
  case 'DONOR_ONLY': return 'OFFLINE';
  default:return 'DEGRADED';
 }
}

export const OMEGA7_CAPABILITIES:readonly Omega7Capability[]=OMEGA_NAVIGATION.map(nav=>{
 const contract=CAPABILITY_BY_NAME.get(nav.name);
 const reality=capabilityReality(nav.name);
 return{
  id:`omega7.cap.${nav.id}`,
  legacyRoute:nav.name,
  legacyId:nav.id,
  domain:DOMAIN_BY_ROUTE[nav.name],
  label:LABEL_OVERRIDES[nav.name]||nav.name,
  description:contract?.purpose||nav.hint,
  family:contract?.family||nav.group,
  effect:nav.effect,
  authority:nav.authority,
  reality,
  availability:healthForReality(reality),
  sourceBoundary:contract?.boundary||'UNKNOWN',
  primaryAction:ACTION_OVERRIDES[nav.name]||`Open ${LABEL_OVERRIDES[nav.name]||nav.name}`,
  keywords:[nav.name,nav.group,nav.effect,nav.authority,contract?.family||'',contract?.purpose||'',nav.hint].join(' ').toLowerCase().split(/\s+/).filter(Boolean),
  compatibility:'OMEGAV6_BRIDGE'
 };
});

export const OMEGA7_CAPABILITY_BY_ID=new Map(OMEGA7_CAPABILITIES.map(x=>[x.id,x]));
export const OMEGA7_CAPABILITY_BY_ROUTE=new Map(OMEGA7_CAPABILITIES.map(x=>[x.legacyRoute,x]));

export function omega7CapabilitiesForDomain(domain:Omega7Domain){
 return OMEGA7_CAPABILITIES.filter(x=>x.domain===domain);
}

const normalizeSearch=(value:string)=>value.toLowerCase().replace(/(\d),(?=\d)/g,'$1').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();

export function searchOmega7Capabilities(query:string){
 const q=normalizeSearch(query);
 if(!q)return OMEGA7_CAPABILITIES;
 const terms=q.split(/\s+/).filter(Boolean);
 return OMEGA7_CAPABILITIES
  .map(cap=>({cap,score:terms.reduce((n,t)=>{
   const label=normalizeSearch(cap.label),route=normalizeSearch(cap.legacyRoute),desc=normalizeSearch(cap.description),family=normalizeSearch(cap.family),keywords=normalizeSearch(cap.keywords.join(' '));
   return n+(label===t?12:0)+(label.includes(t)?7:0)+(route.includes(t)?5:0)+(family.includes(t)?3:0)+(desc.includes(t)?2:0)+(keywords.includes(t)?2:0);
  },0)}))
  .filter(x=>x.score>0)
  .sort((a,b)=>b.score-a.score||a.cap.legacyId.localeCompare(b.cap.legacyId))
  .map(x=>x.cap);
}


export type Omega7StartMenuGroupR512={
 id:string;
 label:string;
 copy:string;
 routes:readonly OmegaRouteName[];
};

export const OMEGA7_START_MENU_R512:Readonly<Record<Omega7Domain,readonly Omega7StartMenuGroupR512[]>>=Object.freeze({
 HOME:Object.freeze([]),
 WORK:Object.freeze([
  Object.freeze({id:'CONTINUE',label:'Continue work',copy:'projects · workspace · memory',routes:Object.freeze(['Projects','Workspace','Memory'])}),
 ]),
 EXPLORE:Object.freeze([
  Object.freeze({id:'LIVE',label:'Live world',copy:'earth · forecast · motion',routes:Object.freeze(['Earth Now','Forecast','Data Motion'])}),
  Object.freeze({id:'TRAVERSE',label:'Traverse',copy:'matter · scale · recursion',routes:Object.freeze(['Matter Traversal','Immersive Traversal','Extreme Traversal','Traversal','Scale Compiler','Infinity'])}),
  Object.freeze({id:'MODEL',label:'Model & compare',copy:'relativity · atlas · field · science',routes:Object.freeze(['Relativity','Atlas','Field','Reality Lab','Atlas Calculator','Convergence'])}),
 ]),
 CREATE:Object.freeze([
  Object.freeze({id:'MAKE',label:'Make',copy:'visuals · media · assets',routes:Object.freeze(['Visual Instrument','Create','Assets'])}),
  Object.freeze({id:'OUTPUT',label:'Output',copy:'queue · render · export',routes:Object.freeze(['Render Queue'])}),
 ]),
 DEVELOP:Object.freeze([
  Object.freeze({id:'BUILD',label:'Build & repair',copy:'development · packages · quality',routes:Object.freeze(['Development','Build Out','Quality Compiler'])}),
  Object.freeze({id:'AI',label:'AI & intelligence',copy:'SAI · runtime · reasoning',routes:Object.freeze(['SAI Lab','Kernel Intelligence'])}),
  Object.freeze({id:'CONNECT',label:'Connect compute',copy:'desktop · device · sovereign host',routes:Object.freeze(['Hybrid Link'])}),
 ]),
 SYSTEM:Object.freeze([
  Object.freeze({id:'PROOF',label:'Proof & validation',copy:'evidence · validation · governance',routes:Object.freeze(['Evidence & Proof','Validation','Governance'])}),
  Object.freeze({id:'SYSTEM',label:'System control',copy:'map · control · health',routes:Object.freeze(['System Atlas','Control Matrix','System'])}),
  Object.freeze({id:'ARCHIVE',label:'Recovery & archive',copy:'census · operators · consolidation',routes:Object.freeze(['Archive Census','Archive Operators','Consolidation'])}),
  Object.freeze({id:'EXTEND',label:'Modes & extensions',copy:'modes · evolution · plugins · settings',routes:Object.freeze(['Modes','Canon Evolution','Plugins','Settings','Instructions'])}),
 ]),
});

export function omega7StartMenuForDomainR512(domain:Omega7Domain){
 return OMEGA7_START_MENU_R512[domain]||[];
}

export const OMEGA7_INHERITANCE_CONTRACT=Object.freeze({
 schema:OMEGA7_SCHEMA,
 inheritedRouteCount:OMEGA7_CAPABILITIES.length,
 expectedRouteCount:OMEGA_NAVIGATION.length,
 uniqueCapabilityIds:new Set(OMEGA7_CAPABILITIES.map(x=>x.id)).size,
 uniqueLegacyRoutes:new Set(OMEGA7_CAPABILITIES.map(x=>x.legacyRoute)).size,
 domains:OMEGA7_DOMAINS,
 rule:'NO_OMEGAV6_CAPABILITY_IS_RETIRED_UNTIL_OMEGA7_PROVES_EQUIVALENT_OR_BETTER_INHERITANCE'
});
