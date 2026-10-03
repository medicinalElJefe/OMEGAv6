import {OMEGA7_CAPABILITIES} from './capabilityRegistry';

export type Omega7InheritanceRow={
 id:string;
 legacyRoute:string;
 domain:string;
 adapterStatus:'REGISTERED'|'MIGRATING'|'PROVED';
 functionalParity:boolean;
 desktopProved:boolean;
 mobileProved:boolean;
 failureProved:boolean;
 performanceProved:boolean;
 retiredLegacySurface:boolean;
};

export const OMEGA7_INHERITANCE_MATRIX:readonly Omega7InheritanceRow[]=OMEGA7_CAPABILITIES.map(cap=>({
 id:cap.id,
 legacyRoute:cap.legacyRoute,
 domain:cap.humanDomain,
 adapterStatus:'REGISTERED',
 functionalParity:false,
 desktopProved:false,
 mobileProved:false,
 failureProved:false,
 performanceProved:false,
 retiredLegacySurface:false
}));

export function mayRetireLegacySurface(row:Omega7InheritanceRow){
 return row.adapterStatus==='PROVED'&&row.functionalParity&&row.desktopProved&&row.mobileProved&&row.failureProved&&row.performanceProved;
}
