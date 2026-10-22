import {emitAtomicChemistryResolutionR436,type R436ResolutionBundle} from './canonicalDomainResolutionR436';

export const R436_SCIENCE_DOMAIN_SCHEMA='OMEGA_SCIENCE_DOMAIN_RESOLUTION_R436' as const;

export function resolveAtomicChemistryR436(record:any):R436ResolutionBundle{
 return emitAtomicChemistryResolutionR436(record);
}

export function atomicChemistrySourceGateR436(record:any){
 const resolution=resolveAtomicChemistryR436(record);
 return{
  schema:R436_SCIENCE_DOMAIN_SCHEMA,
  sourceReady:resolution.branch.status!=='OBSERVE_ONLY'&&resolution.branch.status!=='REJECTED_PHYSICAL',
  status:resolution.branch.status,
  authority:resolution.node.authority,
  ledgerHash:resolution.ledgerHash,
  canonicalMutation:false,
  boundary:'The archived atomic/periodic workbooks are not silently treated as a live typed science pack. R436 emits OBSERVE_ONLY until a typed Z/element source record is actually supplied.'
 };
}
