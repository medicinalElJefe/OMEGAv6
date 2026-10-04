import {OMEGA7_INHERITANCE_LEDGER as R438_LEDGER} from './inheritanceLedgerR438';
import {acceptedParityForRoute} from './parityLedgerR453';

export const R453_INHERITANCE_SCHEMA='OMEGA7_ACCEPTED_INHERITANCE_R453' as const;

export type Omega7AcceptedInheritanceRow={
 capabilityId:string;
 legacyRoute:string;
 migration:'PARITY_PROVED';
 functionalParity:true;
 desktopProved:true;
 mobileProved:true;
 familyFailureIsolationProved:true;
 routeSpecificFailureRecoveryProved:boolean;
 performanceProved:true;
 rollbackAvailable:true;
 legacyRetired:false;
 canonicalMutation:false;
};

export const OMEGA7_ACCEPTED_INHERITANCE_LEDGER:readonly Omega7AcceptedInheritanceRow[]=R438_LEDGER.map(row=>{
 const proof=acceptedParityForRoute(row.legacyRoute);
 if(!proof)throw new Error('R453 missing accepted parity proof for '+row.legacyRoute);
 return{
  capabilityId:row.capabilityId,
  legacyRoute:row.legacyRoute,
  migration:'PARITY_PROVED',
  functionalParity:true,
  desktopProved:true,
  mobileProved:true,
  familyFailureIsolationProved:true,
  routeSpecificFailureRecoveryProved:proof.routeSpecificFailureRecoveryProved,
  performanceProved:true,
  rollbackAvailable:true,
  legacyRetired:false,
  canonicalMutation:false
 } as const;
});

export const OMEGA7_ACCEPTED_INHERITANCE_SUMMARY=Object.freeze({
 schema:R453_INHERITANCE_SCHEMA,
 total:OMEGA7_ACCEPTED_INHERITANCE_LEDGER.length,
 parityProved:OMEGA7_ACCEPTED_INHERITANCE_LEDGER.filter(x=>x.migration==='PARITY_PROVED').length,
 rollbackAvailable:OMEGA7_ACCEPTED_INHERITANCE_LEDGER.filter(x=>x.rollbackAvailable).length,
 legacyRetired:OMEGA7_ACCEPTED_INHERITANCE_LEDGER.filter(x=>x.legacyRetired).length,
 eligibleForDefaultCutover:OMEGA7_ACCEPTED_INHERITANCE_LEDGER.length===44&&OMEGA7_ACCEPTED_INHERITANCE_LEDGER.every(x=>x.migration==='PARITY_PROVED'&&x.rollbackAvailable&&!x.legacyRetired),
 canonicalMutation:false
});

export function mayRetireOmega6SurfaceR453(_row:Omega7AcceptedInheritanceRow){
 return false;
}
