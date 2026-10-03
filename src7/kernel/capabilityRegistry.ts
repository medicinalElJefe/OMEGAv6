import {OMEGA_NAVIGATION} from '../../src/navigationRegistry';
import type {Omega7CapabilityContract,Omega7HumanDomain,Omega7Layout,Omega7Execution} from './types';

const sets={
 HOME:new Set(['Command Center','Cockpit']),
 WORK:new Set(['Workspace','Projects','Assets','Data Motion','Evidence & Proof','Memory']),
 EXPLORE:new Set(['Immersive Traversal','Matter Traversal','Extreme Traversal','Relativity','Earth Now','Forecast','Atlas','Traversal','Field','Reality Lab','Atlas Calculator','Infinity']),
 CREATE:new Set(['Create','Visual Instrument','Render Queue']),
 DEVELOP:new Set(['Hybrid Link','Convergence','Quality Compiler','Build Out','Development','Canon Evolution','SAI Lab']),
 SYSTEM:new Set(['Modes','Kernel Intelligence','Archive Census','Archive Operators','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Scale Compiler','Control Matrix'])
} satisfies Record<Omega7HumanDomain,Set<string>>;

function domainFor(route:string):Omega7HumanDomain{
 for(const [domain,routes] of Object.entries(sets) as [Omega7HumanDomain,Set<string>][])if(routes.has(route))return domain;
 return 'SYSTEM';
}
function layoutFor(route:string):Omega7Layout{
 if(/Earth|Visual|Traversal|Field|Relativity|Atlas|Reality/.test(route))return 'CANVAS';
 if(/Evidence|Validation|Quality|Archive|Memory|Modes|Calculator/.test(route))return 'ANALYSIS';
 if(/Hybrid|Development|Build|Governance|Control|System|Convergence/.test(route))return 'CONTROL';
 return 'DOCUMENT';
}
function executionFor(effect:string,authority:string):Omega7Execution{
 if(authority==='HOST_GATED')return 'DEVICE';
 if(authority==='EVIDENCE_GATED'||effect==='EXTERNAL_GATE')return 'EXTERNAL';
 if(effect==='BUILD')return 'MIXED';
 return 'BROWSER';
}

export const OMEGA7_CAPABILITIES:readonly Omega7CapabilityContract[]=OMEGA_NAVIGATION.map(route=>({
 id:`omega7.route.${route.id}`,
 legacyRoute:route.name,
 label:route.name,
 description:route.hint,
 humanDomain:domainFor(route.name),
 layout:layoutFor(route.name),
 execution:executionFor(route.effect,route.authority),
 effect:route.effect,
 authority:route.authority,
 source:'OMEGAV6_INHERITED' as const,
 inheritanceRequired:true as const,
 presentation:'STANDARD' as const
}));

export const OMEGA7_CAPABILITY_BY_ID=new Map(OMEGA7_CAPABILITIES.map(x=>[x.id,x]));
export const OMEGA7_CAPABILITY_BY_ROUTE=new Map(OMEGA7_CAPABILITIES.map(x=>[x.legacyRoute,x]));

export const OMEGA7_PRIMARY_DOMAINS:readonly {id:Omega7HumanDomain;label:string;description:string}[]=[
 {id:'HOME',label:'Home',description:'Start, continue, and understand what OMEGA is doing.'},
 {id:'WORK',label:'Work',description:'Projects, data, evidence, assets, and ongoing work.'},
 {id:'EXPLORE',label:'Explore',description:'Earth, science, matter, motion, forecasting, and state-space exploration.'},
 {id:'CREATE',label:'Create',description:'Visual creation, rendering, and generated artifacts.'},
 {id:'DEVELOP',label:'Develop',description:'Software, Hybrid compute, convergence, build, and controlled evolution.'},
 {id:'SYSTEM',label:'System',description:'Modes, memory, archive, governance, plugins, validation, and diagnostics.'}
];

export const capabilitiesForDomain=(domain:Omega7HumanDomain)=>OMEGA7_CAPABILITIES.filter(x=>x.humanDomain===domain);
