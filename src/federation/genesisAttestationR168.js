export const R168_GENESIS_EXPECTATION = Object.freeze({
  contract: 'R192_SERVICE_BOUND_R1532_ATTESTED',
  genesisSurfaceService: 'omega-genesis-v1',
  omegaV6Service: 'omegav6',
  opticalService: 'omega-optical-machine-r1532',
  opticalVersion: 'R153.2',
  opticalAuthority: 'SCREEN_ONLY',
  genesisRole: 'PROPOSE',
  canonicalAdmissionAuthority: 'R125'
});

export const R168_ATTESTATION_STATES = Object.freeze({
  UNATTESTED: 'UNATTESTED',
  CONTRACT_MISMATCH: 'CONTRACT_MISMATCH',
  VERSION_ATTESTATION_REQUIRED: 'VERSION_ATTESTATION_REQUIRED',
  VERSION_MISMATCH: 'VERSION_MISMATCH',
  SERVICE_IDENTITY_MISMATCH: 'SERVICE_IDENTITY_MISMATCH',
  OPTICAL_CONTRACT_MISMATCH: 'OPTICAL_CONTRACT_MISMATCH',
  AUTHORITY_VIOLATION: 'AUTHORITY_VIOLATION',
  ATTESTED_NOT_LIVE_VERIFIED: 'ATTESTED_NOT_LIVE_VERIFIED',
  LIVE_VERIFIED_NOT_PROMOTED: 'LIVE_VERIFIED_NOT_PROMOTED'
});

const fail = (state, reason, observed = {}) => ({
  schema: 'OMEGA_GENESIS_ATTESTATION_RESULT_R168',
  revision: 'R168',
  state,
  ok: false,
  liveVerified: false,
  promoted: false,
  canonicalAdmissionAuthority: R168_GENESIS_EXPECTATION.canonicalAdmissionAuthority,
  reason,
  observed
});

const pass = (state, liveVerified, observed = {}) => ({
  schema: 'OMEGA_GENESIS_ATTESTATION_RESULT_R168',
  revision: 'R168',
  state,
  ok: liveVerified,
  liveVerified,
  promoted: false,
  canonicalAdmissionAuthority: R168_GENESIS_EXPECTATION.canonicalAdmissionAuthority,
  truthLaw: 'reachable != writable != executed != verified != promoted',
  observed
});

export function assessGenesisR192Attestation(evidence) {
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence) || Object.keys(evidence).length === 0) {
    return fail(R168_ATTESTATION_STATES.UNATTESTED, 'No Genesis R192 attestation evidence supplied.');
  }

  const expected = R168_GENESIS_EXPECTATION;
  if (evidence.contract !== expected.contract) {
    return fail(R168_ATTESTATION_STATES.CONTRACT_MISMATCH, 'Genesis runtime contract does not match R192.', {contract: evidence.contract ?? null});
  }

  const expectedWorkerVersion = typeof evidence.expectedWorkerVersion === 'string' ? evidence.expectedWorkerVersion.trim() : '';
  const runtimeWorkerVersion = typeof evidence.runtimeWorkerVersion === 'string' ? evidence.runtimeWorkerVersion.trim() : '';
  if (!expectedWorkerVersion || !runtimeWorkerVersion) {
    return fail(R168_ATTESTATION_STATES.VERSION_ATTESTATION_REQUIRED, 'Published and runtime Worker version IDs are both required.', {expectedWorkerVersion: expectedWorkerVersion || null, runtimeWorkerVersion: runtimeWorkerVersion || null});
  }
  if (expectedWorkerVersion !== runtimeWorkerVersion) {
    return fail(R168_ATTESTATION_STATES.VERSION_MISMATCH, 'Public trigger is not serving the exact published Worker version.', {expectedWorkerVersion, runtimeWorkerVersion});
  }

  const omegaV6 = evidence.services?.OMEGA_V6 ?? null;
  const opticalService = evidence.services?.OMEGA_OPTICAL ?? null;
  if (omegaV6 !== expected.omegaV6Service || opticalService !== expected.opticalService) {
    return fail(R168_ATTESTATION_STATES.SERVICE_IDENTITY_MISMATCH, 'Genesis service identities do not match the governed sibling contract.', {OMEGA_V6: omegaV6, OMEGA_OPTICAL: opticalService});
  }

  if (evidence.optical?.machineVersion !== expected.opticalVersion || evidence.optical?.adaptiveCycle !== true) {
    return fail(R168_ATTESTATION_STATES.OPTICAL_CONTRACT_MISMATCH, 'Optical R153.2 adaptive SCREEN contract is incomplete.', {
      machineVersion: evidence.optical?.machineVersion ?? null,
      adaptiveCycle: evidence.optical?.adaptiveCycle ?? null
    });
  }

  if (
    evidence.optical?.authority !== expected.opticalAuthority ||
    evidence.optical?.canonicalMutation !== false ||
    evidence.genesis?.role !== expected.genesisRole ||
    evidence.genesis?.mayMutateGlobalCanonState !== false
  ) {
    return fail(R168_ATTESTATION_STATES.AUTHORITY_VIOLATION, 'Federation authority boundary was violated.', {
      opticalAuthority: evidence.optical?.authority ?? null,
      opticalCanonicalMutation: evidence.optical?.canonicalMutation ?? null,
      genesisRole: evidence.genesis?.role ?? null,
      genesisMayMutateGlobalCanonState: evidence.genesis?.mayMutateGlobalCanonState ?? null
    });
  }

  const observed = {
    contract: evidence.contract,
    workerVersion: runtimeWorkerVersion,
    OMEGA_V6: omegaV6,
    OMEGA_OPTICAL: opticalService,
    opticalVersion: evidence.optical.machineVersion,
    opticalAuthority: evidence.optical.authority,
    adaptiveCycle: evidence.optical.adaptiveCycle,
    genesisRole: evidence.genesis.role
  };

  if (evidence.liveVerified !== true) {
    return pass(R168_ATTESTATION_STATES.ATTESTED_NOT_LIVE_VERIFIED, false, observed);
  }

  return pass(R168_ATTESTATION_STATES.LIVE_VERIFIED_NOT_PROMOTED, true, observed);
}
