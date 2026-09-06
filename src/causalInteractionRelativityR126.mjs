export const R126_RUNTIME = 'OMEGA_R126_CAUSAL_INTERACTION_RELATIVITY_FABRIC';

export const R126_LAWS = Object.freeze([
  'NO_RESULT_WITHOUT_FRAME',
  'NO_FRAME_WITHOUT_TIME',
  'NO_TIME_WITHOUT_LINEAGE',
  'NO_LINEAGE_WITHOUT_EVIDENCE',
  'NO_MUTATION_WITHOUT_PROOF',
  'SAME_CLOCK_TIME_DOES_NOT_IMPLY_SAME_CAUSAL_STATE',
  'LATER_TIMESTAMP_DOES_NOT_IMPLY_DESCENDANT_COMPUTATION',
  'ONE_CANONICAL_PHASE_MANY_RELATIVE_PROJECTIONS',
  'INVARIANT_CARRY_SURVIVES_FRAME_TRANSFORM',
  'RETURNED_WORK_RECONCILES_AGAINST_CURRENT_STATE',
  'REPRESENTATION_MAY_TRANSFORM_EVIDENCE_IDENTITY_MAY_NOT',
  'R125_ACCURACY_GATE_PRECEDES_CANONICAL_MUTATION'
]);

export const FEDERATION_ROLES = Object.freeze({
  OMEGAV6: 'canonical-state-proof-admission-replay',
  GENESIS: 'proposal-variation-branch-generation',
  SAI: 'learned-cognition-memory-adaptation',
  OPTICAL: 'scalar-screening-rcwa-fdtd-fullwave',
  SOVEREIGN: 'private-native-heavy-compute',
  EARTH: 'source-bound-world-observation',
  FEDERATION: 'typed-routing-proof-transport-continuity'
});

const clamp01 = n => Math.max(0, Math.min(1, Number.isFinite(Number(n)) ? Number(n) : 0));
const nonEmpty = x => typeof x === 'string' && x.trim().length > 0;
const iso = x => nonEmpty(x) && Number.isFinite(Date.parse(x));
const copy = x => JSON.parse(JSON.stringify(x));
const invariantIdentity = inv => JSON.stringify({
  missionId:inv.missionId,
  canonicalStateHash:inv.canonicalStateHash,
  inputHash:inv.inputHash,
  proofState:inv.proofState,
  truthBoundary:inv.truthBoundary,
  evidenceRefs:inv.evidenceRefs,
  scarHistory:inv.scarHistory
});

export function validateCausalTime(time) {
  const errors = [];
  if (!time || typeof time !== 'object') return ['TIME_ENVELOPE_REQUIRED'];
  if (!iso(time.utcTime)) errors.push('UTC_TIME_REQUIRED');
  if (!iso(time.sourceObservationTime)) errors.push('SOURCE_OBSERVATION_TIME_REQUIRED');
  if (!Number.isFinite(time.monotonicMs) || time.monotonicMs < 0) errors.push('MONOTONIC_TIME_REQUIRED');
  for (const k of ['missionTick','stateGeneration','agentTurn','modelGeneration','causalDepth']) {
    if (!Number.isInteger(time[k]) || time[k] < 0) errors.push(`${k.toUpperCase()}_REQUIRED`);
  }
  if (time.causalDepth > 0 && !nonEmpty(time.parentReceiptHash)) errors.push('PARENT_RECEIPT_REQUIRED_FOR_DESCENDANT');
  return errors;
}

export function validateInteractionPacket(packet) {
  const errors = [];
  if (!packet || typeof packet !== 'object') return {valid:false,errors:['PACKET_REQUIRED']};
  const frame = packet.frame || {};
  for (const k of ['serviceIdentity','serviceRole','runtimeRevision','canonicalSchemaVersion','hostIdentity','observerFrame','currentStateAddress']) {
    if (!nonEmpty(String(frame[k] ?? ''))) errors.push(`FRAME_${k.toUpperCase()}_REQUIRED`);
  }
  errors.push(...validateCausalTime(packet.time));
  const inv = packet.invariants || {};
  for (const k of ['missionId','packetId','canonicalStateHash','inputHash','proofState','truthBoundary']) {
    if (!nonEmpty(inv[k])) errors.push(`INVARIANT_${k.toUpperCase()}_REQUIRED`);
  }
  if (!Array.isArray(inv.evidenceRefs) || inv.evidenceRefs.length === 0) errors.push('EVIDENCE_REQUIRED');
  if (!Array.isArray(inv.scarHistory)) errors.push('SCAR_HISTORY_REQUIRED');
  if (packet.time?.causalDepth > 0 && !nonEmpty(inv.parentPacketId)) errors.push('PARENT_PACKET_REQUIRED_FOR_DESCENDANT');
  return {valid:errors.length === 0,errors};
}

export function causalOrder(a,b) {
  if (a.invariants?.missionId !== b.invariants?.missionId) return 'UNRELATED';
  if (b.time?.parentReceiptHash === a.receiptHash && b.time?.causalDepth === a.time?.causalDepth + 1) return 'A_PARENT_OF_B';
  if (a.time?.parentReceiptHash === b.receiptHash && a.time?.causalDepth === b.time?.causalDepth + 1) return 'B_PARENT_OF_A';
  if (a.time?.stateGeneration === b.time?.stateGeneration && a.time?.missionTick === b.time?.missionTick && a.receiptHash === b.receiptHash) return 'SAME_CAUSAL_STATE';
  return 'CONCURRENT_OR_DIVERGED';
}

export function transformInteractionFrame(packet, receiver, receiveTime) {
  const check = validateInteractionPacket(packet);
  if (!check.valid) return {status:'BLOCK',errors:check.errors,packet:null};
  const next = copy(packet);
  const invariantBefore = invariantIdentity(next.invariants);
  const childDepth = packet.time.causalDepth + 1;
  const receiverId = String(receiver.serviceIdentity || 'receiver').replace(/[^a-zA-Z0-9_-]/g,'_');
  next.frame = {...next.frame, ...copy(receiver)};
  next.invariants = {...next.invariants, parentPacketId:packet.invariants.packetId, packetId:`${packet.invariants.packetId}.${receiverId}.${childDepth}`};
  next.time = {...next.time, ...copy(receiveTime), causalDepth:childDepth, parentReceiptHash:packet.receiptHash, agentTurn:Math.max(packet.time.agentTurn + 1, receiveTime?.agentTurn ?? 0)};
  next.transform = {
    fromService: packet.frame.serviceIdentity,
    toService: receiver.serviceIdentity,
    transformedAt: next.time.utcTime,
    law: 'INVARIANT_CARRY_SURVIVES_FRAME_TRANSFORM'
  };
  if (invariantIdentity(next.invariants) !== invariantBefore) throw new Error('Invariant carry mutated during frame transform');
  return {status:'TRANSFORMED',errors:[],packet:next};
}

export function motionDelta(departure,current) {
  const changed = departure.canonicalStateHash !== current.canonicalStateHash;
  const generationDelta = Number(current.stateGeneration ?? 0) - Number(departure.stateGeneration ?? 0);
  const missionTickDelta = Number(current.missionTick ?? 0) - Number(departure.missionTick ?? 0);
  const dependencyChanges = [...new Set((current.changedDependencies || []).filter(Boolean))];
  return {changed,generationDelta,missionTickDelta,dependencyChanges,rebaseRequired:changed || dependencyChanges.length > 0};
}

export function reconcileReturnedWork({departure,current,result,r125}) {
  const delta = motionDelta(departure,current);
  const reasons = [];
  if (r125?.action === 'BLOCK') return {decision:'BLOCK',delta,reasons:['R125_ACCURACY_GATE_BLOCKED']};
  if (!result?.proofVerified) reasons.push('RETURN_PROOF_UNVERIFIED');
  if (!result?.evidenceRefs?.length) reasons.push('RETURN_EVIDENCE_MISSING');
  if (result?.truthBoundaryChanged && !result?.newEvidenceAuthorizesTruthBoundaryChange) reasons.push('UNAUTHORIZED_TRUTH_BOUNDARY_CHANGE');
  if (reasons.includes('UNAUTHORIZED_TRUTH_BOUNDARY_CHANGE')) return {decision:'BLOCK',delta,reasons};
  if (delta.rebaseRequired) return {decision:'REBASE',delta,reasons:[...reasons,'WORLD_MOVED_SINCE_DEPARTURE']};
  if (reasons.length) return {decision:'TURN',delta,reasons};
  if (r125?.action !== 'ADMIT' && r125?.action !== 'AUTO_REPAIR_APPROVED') return {decision:'TURN',delta,reasons:['R125_ADMISSION_NOT_PROVEN']};
  return {decision:'ADMIT',delta,reasons:['CURRENT_FRAME_PROOF_AND_EVIDENCE_ALIGNED']};
}

export function allocateRelativeCompute(metrics={}) {
  const novelty=clamp01(metrics.novelty), uncertainty=clamp01(metrics.uncertainty), contradiction=clamp01(metrics.contradiction);
  const proofUrgency=clamp01(metrics.proofUrgency), motion=clamp01(metrics.motion), observerRelevance=clamp01(metrics.observerRelevance);
  const expectedInformationGain=clamp01(metrics.expectedInformationGain), cost=clamp01(metrics.cost);
  const pressure = clamp01(.17*novelty + .18*uncertainty + .18*contradiction + .14*proofUrgency + .11*motion + .08*observerRelevance + .14*expectedInformationGain - .10*cost);
  const lanes = pressure < .18 ? 1 : pressure < .36 ? 12 : pressure < .56 ? 144 : pressure < .78 ? 1728 : 20736;
  const mode = lanes===1?'EXACT_OR_REFLEX':lanes===12?'ORGAN':lanes===144?'BRANCH':lanes===1728?'CELL_SWARM':'EXECUTION_LANES';
  return {pressure:Number(pressure.toFixed(6)),lanes,mode,topology:[1,12,144,1728,20736]};
}

export function synchronizationAssessment(packets=[]) {
  const valid = packets.map(validateInteractionPacket);
  const invalid = valid.reduce((n,x)=>n+(x.valid?0:1),0);
  const missionTicks = packets.map(x=>x.time?.missionTick).filter(Number.isInteger);
  const stateGenerations = packets.map(x=>x.time?.stateGeneration).filter(Number.isInteger);
  return {
    packetCount:packets.length,
    validCount:packets.length-invalid,
    invalidCount:invalid,
    missionTickSpread:missionTicks.length?Math.max(...missionTicks)-Math.min(...missionTicks):0,
    stateGenerationSpread:stateGenerations.length?Math.max(...stateGenerations)-Math.min(...stateGenerations):0,
    synchronized:invalid===0 && new Set(stateGenerations).size<=1,
    note:'Wall-clock agreement alone never establishes causal synchronization.'
  };
}
