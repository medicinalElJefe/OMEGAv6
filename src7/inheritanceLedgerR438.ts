import {OMEGA7_CAPABILITIES} from './capabilityRegistry';
import {OMEGA7_NATIVE_ROUTES} from './nativeCapabilityRegistry';

export type Omega7MigrationState='BRIDGED'|'ADAPTED'|'PARITY_PROVED'|'NATIVE'|'LEGACY_RETIRED';

export type Omega7InheritanceRow={
 capabilityId:string;
 legacyRoute:string;
 migration:Omega7MigrationState;
 functionalParity:boolean;
 desktopProved:boolean;
 mobileProved:boolean;
 failureProved:boolean;
 performanceProved:boolean;
 rollbackAvailable:boolean;
};

const native=new Set<string>(OMEGA7_NATIVE_ROUTES);

export const OMEGA7_INHERITANCE_LEDGER:readonly Omega7InheritanceRow[]=OMEGA7_CAPABILITIES.map(cap=>({
 capabilityId:cap.id,
 legacyRoute:cap.legacyRoute,
 migration:native.has(cap.legacyRoute)?'ADAPTED':'BRIDGED',
 functionalParity:false,
 desktopProved:false,
 mobileProved:false,
 failureProved:false,
 performanceProved:false,
 rollbackAvailable:true
}));

export function canRetireOmega6Surface(row:Omega7InheritanceRow){
 return row.migration==='LEGACY_RETIRED'&&row.functionalParity&&row.desktopProved&&row.mobileProved&&row.failureProved&&row.performanceProved&&row.rollbackAvailable;
}

export const OMEGA7_INHERITANCE_RULE='NO_OMEGAV6_CAPABILITY_RETIRES_UNTIL_OMEGA7_PARITY_AND_ROLLBACK_ARE_PROVED' as const;
