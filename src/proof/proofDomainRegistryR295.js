export const PROOF_DOMAIN_REGISTRY_SCHEMA_R295='OMEGA_PROOF_DOMAIN_REGISTRY_R295';

export const PROOF_DOMAIN_REGISTRY_R295=Object.freeze({
  'NUMBER_THEORY/PASCAL/SINGMASTER':Object.freeze({
    domainId:'NUMBER_THEORY/PASCAL/SINGMASTER',
    claimId:'SHARP_SINGMASTER_N_LE_8',
    adapterPath:'src/proof/singmasterProofAtlasR290.ts',
    workbenchPath:'src/SingmasterProofWorkbenchR290.tsx',
    testPaths:Object.freeze([
      'tests/r290-singmaster-proof-atlas-invariants.mjs',
      'tests/r292-proof-carry-fabric-invariants.mjs',
      'tests/r293-proof-directed-evolution-invariants.mjs',
      'tests/r294-returned-evidence-closure-invariants.mjs',
      'tests/r295-proof-admission-compiler-invariants.mjs',
      'tests/r296-singmaster-exact-closure-invariants.mjs'
    ]),
    admissionMode:'GOVERNED_SOURCE_PATCH_ONLY',
    publicTruthBoundary:'OPEN remains OPEN unless source-level proof gates and exhaustive arithmetic closure are changed by reproducible evidence and the full inherited proof suite remains green.'
  })
});

export function proofDomainAdapterR295(domainId,claimId=''){
  const row=PROOF_DOMAIN_REGISTRY_R295[String(domainId||'')];
  if(!row)return null;
  if(claimId&&String(row.claimId)!==String(claimId))return null;
  return row;
}
