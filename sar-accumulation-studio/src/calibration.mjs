import { deweyAtlasEstimate } from './atlas.mjs';
import {
  FOLD_SCALE_CANON,
  EMPIRICAL_TURN_PROFILES,
  WOVEN_RELEASE_CALIBRATION,
  EARTH_PROXY_CHART,
  PRIOR_VALIDATION_REFERENCES,
  PROOF_BOUNDARY
} from './charted-canon.mjs';

export const CHARTED_CALIBRATION_CONTRACT = Object.freeze({
  foldScale: FOLD_SCALE_CANON,
  empiricalTurnProfiles: EMPIRICAL_TURN_PROFILES,
  wovenReleaseCalibration: WOVEN_RELEASE_CALIBRATION,
  earthProxyChart: EARTH_PROXY_CHART,
  priorValidationReferences: PRIOR_VALIDATION_REFERENCES,
  proofBoundary: PROOF_BOUNDARY
});

const finite = value => Number.isFinite(Number(value));
const clamp01 = value => Math.max(0, Math.min(1, Number(value)));

// Exact formal operators transcribed from the existing Fold-Scale calibration harness.
export function omegaViability(E, Lambda, q) {
  const e = Number(E), burden = Number(Lambda), contradiction = Number(q);
  if (![e, burden, contradiction].every(Number.isFinite)) return null;
  const denominator = 1 + Math.max(0, burden) + Math.abs(contradiction);
  return denominator > 0 ? e / denominator : null;
}

export function memoryUpdate(M, retention, Delta) {
  const m = Number(M), lambda = Number(retention), delta = Number(Delta);
  if (![m, lambda, delta].every(Number.isFinite)) return null;
  if (lambda < 0 || lambda > 1) throw new Error('Memory retention lambda must remain in [0,1]');
  return lambda * m + delta;
}

export function burdenUpdate(Lambda, q, g) {
  const burden = Number(Lambda), contradiction = Number(q), integration = Number(g);
  if (![burden, contradiction, integration].every(Number.isFinite)) return null;
  return Math.max(0, burden + contradiction - integration);
}

export function phaseTurn(phi, theta) {
  const p = Number(phi), t = Number(theta);
  if (![p, t].every(Number.isFinite)) return null;
  const twoPi = Math.PI * 2;
  return ((p + t) % twoPi + twoPi) % twoPi;
}

export function compressionUpdate(scale, c) {
  const s = Number(scale), factor = Number(c);
  if (![s, factor].every(Number.isFinite)) return null;
  if (factor <= 0) throw new Error('Compression factor c must be > 0');
  return s * factor;
}

// The charted law requires tau to be declared/calibrated for the host. Do not invent a default.
export function dispatchOmega(Omega, tau) {
  const omega = Number(Omega), tolerance = Number(tau);
  if (!Number.isFinite(omega) || !Number.isFinite(tolerance) || tolerance < 0) return 'UNRESOLVED_HOST_THRESHOLD';
  if (omega > 1 + tolerance) return 'STAY';
  if (Math.abs(omega - 1) <= tolerance) return 'TURN';
  return 'ESCALATE';
}

export function shellSimplex(amplitudes, epsilon = 1e-9) {
  if (!Array.isArray(amplitudes) || amplitudes.length !== 7) throw new Error('1+6 shell requires [a0,a1,a2,a3,a4,a5,a6]');
  const a = amplitudes.map(Number);
  if (!a.every(Number.isFinite)) throw new Error('1+6 shell amplitudes must be finite');
  const u = [a[1] - a[4], a[2] - a[5], a[3] - a[6]];
  const denominator = u.reduce((sum, value) => sum + Math.abs(value), 0) + Math.max(Number.EPSILON, Number(epsilon));
  const lambda = u.map(value => Math.abs(value) / denominator);
  const dominantAxis = lambda.indexOf(Math.max(...lambda)) + 1;
  return { center: a[0], contrasts: u, lambda, dominantAxis, lambdaSum: lambda.reduce((x, y) => x + y, 0) };
}

export function empiricalTurnDecision(profileName, value) {
  const profile = EMPIRICAL_TURN_PROFILES[profileName];
  if (!profile) throw new Error(`Unknown charted TURN profile: ${profileName}`);
  const x = Number(value);
  if (!Number.isFinite(x)) return { state: 'UNRESOLVED', profileName, profile };
  const turn = profile.orientation === 'lower=TURN' ? x <= profile.threshold : x >= profile.threshold;
  return { state: turn ? 'TURN' : 'NON_TURN', value: x, profileName, profile, role: 'PRIOR_EMPIRICAL_REFERENCE' };
}

export function normalizeObservedRange(value, min, max) {
  const x = Number(value), lo = Number(min), hi = Number(max);
  if (![x, lo, hi].every(Number.isFinite) || hi <= lo) return null;
  return clamp01((x - lo) / (hi - lo));
}

export function releaseReferencePosition(variableName, value) {
  const profile = WOVEN_RELEASE_CALIBRATION[variableName];
  if (!profile || !finite(value)) return null;
  return {
    variableName,
    value: Number(value),
    observedReleaseMin: profile.min,
    observedReleaseMean: profile.mean,
    observedReleaseMax: profile.max,
    calibrated24Mean: profile.calibrated24Mean,
    boundedPosition: normalizeObservedRange(value, profile.min, profile.max),
    role: 'REFERENCE_ONLY_FOR_SAR_UNTIL_HOST_VALIDATED'
  };
}

export function mae(actual, predicted) {
  const pairs = actual.map((a, i) => [Number(a), Number(predicted[i])]).filter(([a, p]) => Number.isFinite(a) && Number.isFinite(p));
  return pairs.length ? pairs.reduce((sum, [a, p]) => sum + Math.abs(a - p), 0) / pairs.length : null;
}

export function rmse(actual, predicted) {
  const pairs = actual.map((a, i) => [Number(a), Number(predicted[i])]).filter(([a, p]) => Number.isFinite(a) && Number.isFinite(p));
  return pairs.length ? Math.sqrt(pairs.reduce((sum, [a, p]) => sum + (a - p) ** 2, 0) / pairs.length) : null;
}

export function r2(actual, predicted) {
  const pairs = actual.map((a, i) => [Number(a), Number(predicted[i])]).filter(([a, p]) => Number.isFinite(a) && Number.isFinite(p));
  if (pairs.length < 2) return null;
  const avg = pairs.reduce((sum, [a]) => sum + a, 0) / pairs.length;
  const total = pairs.reduce((sum, [a]) => sum + (a - avg) ** 2, 0);
  if (total === 0) return null;
  const residual = pairs.reduce((sum, [a, p]) => sum + (a - p) ** 2, 0);
  return 1 - residual / total;
}

export function median(values) {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function mean(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : null;
}

export function baselinePredictions(samples, holdoutIndex) {
  const target = samples[holdoutIndex];
  const train = samples.filter((_, i) => i !== holdoutIndex).filter(sample => finite(sample.value));
  const earlier = train.filter(sample => new Date(sample.time) <= new Date(target.time)).sort((a, b) => new Date(a.time) - new Date(b.time));
  const nearest = train.slice().sort((a, b) => Math.abs(new Date(a.time) - new Date(target.time)) - Math.abs(new Date(b.time) - new Date(target.time)))[0];
  return {
    median: median(train.map(sample => sample.value)),
    mean: mean(train.map(sample => sample.value)),
    persistence: earlier.at(-1)?.value ?? nearest?.value ?? null
  };
}

function improvementPct(baseline, model) {
  return Number.isFinite(baseline) && baseline > 0 && Number.isFinite(model) ? 100 * (baseline - model) / baseline : null;
}

// Host validation follows the previously charted rule: measured observations -> model -> benchmark vs baseline.
// It deliberately does NOT derive a new Dewey score from regression metrics.
export function leaveOneOutAtlasCalibration(samples, options = {}) {
  const clean = (samples || [])
    .map((sample, index) => ({ ...sample, index, value: Number(sample.value), lon: Number(sample.lon), lat: Number(sample.lat) }))
    .filter(sample => sample.measured !== false && Number.isFinite(sample.value) && Number.isFinite(sample.lon) && Number.isFinite(sample.lat) && sample.time);

  if (clean.length < 4) {
    return {
      state: 'INSUFFICIENT_MEASURED_HOST_DATA',
      n: clean.length,
      minimumForDiagnostic: 4,
      minimumForChartedBenchmarkGate: 30,
      folds: [],
      claim: 'NO_SAR_CALIBRATION_CLAIM'
    };
  }

  const folds = [];
  for (let i = 0; i < clean.length; i++) {
    const target = clean[i];
    const training = clean.filter((_, j) => j !== i);
    const estimate = deweyAtlasEstimate(training, { lon: target.lon, lat: target.lat, time: target.time }, options);
    const baselines = baselinePredictions(clean, i);
    folds.push({
      id: target.id || String(i),
      time: target.time,
      actual: target.value,
      predicted: Number.isFinite(estimate.value) ? estimate.value : null,
      uncertainty: estimate.uncertainty ?? null,
      confidence: estimate.confidence ?? null,
      atlasLevel: estimate.level ?? null,
      inferenceState: estimate.state,
      baselines
    });
  }

  const actual = folds.map(fold => fold.actual);
  const predicted = folds.map(fold => fold.predicted);
  const baselineNames = ['median', 'mean', 'persistence'];
  const model = { mae: mae(actual, predicted), rmse: rmse(actual, predicted), r2: r2(actual, predicted) };
  const baselines = Object.fromEntries(baselineNames.map(name => [name, {
    mae: mae(actual, folds.map(fold => fold.baselines[name])),
    rmse: rmse(actual, folds.map(fold => fold.baselines[name])),
    r2: r2(actual, folds.map(fold => fold.baselines[name]))
  }]));
  const bestBaselineName = baselineNames.slice().sort((a, b) => (baselines[a].mae ?? Infinity) - (baselines[b].mae ?? Infinity))[0];
  const bestBaseline = baselines[bestBaselineName];
  const improvement = improvementPct(bestBaseline.mae, model.mae);
  const predictedCount = folds.filter(fold => Number.isFinite(fold.predicted)).length;
  const coverage = predictedCount / folds.length;

  const beatsBaseline = Number.isFinite(model.mae) && Number.isFinite(bestBaseline.mae) && model.mae < bestBaseline.mae;
  const meetsChartedSampleGate = clean.length >= 30;
  const benchmarkPass = meetsChartedSampleGate && beatsBaseline && predictedCount === folds.length;

  return {
    state: benchmarkPass ? 'SAR_HOST_BENCHMARK_PASS' : beatsBaseline ? 'SAR_HOST_DIAGNOSTIC_GAIN_ONLY' : 'SAR_HOST_PRUNE_OR_RETUNE',
    n: clean.length,
    measuredOnly: true,
    folds,
    coverage,
    model,
    baselines,
    bestBaselineName,
    bestBaseline,
    improvementVsBestBaselinePct: improvement,
    gate: {
      minimumMeasuredObservations: 30,
      meetsChartedSampleGate,
      beatsBaseline,
      completePredictionCoverage: predictedCount === folds.length,
      benchmarkPass
    },
    claim: benchmarkPass ? 'PRACTICAL_UTILITY_CANDIDATE_FOR_THIS_SAR_HOST_REGIME_ONLY' : 'NO_SAR_CALIBRATION_CLAIM',
    semantics: 'Leave-one-out validation using only the current measured SAR host samples. Prior workbook benchmarks are reference evidence and are never injected as SAR observations.'
  };
}

export function calibrationProofPacket(calibration) {
  return {
    schema: 'omega.sar.charted-calibration.v1',
    canon: CHARTED_CALIBRATION_CONTRACT,
    sarHostValidation: calibration || null,
    authority: {
      measuredSarRequired: true,
      priorBenchmarksCountAsSarObservations: false,
      proxyEarthChartCountsAsRawTerrain: false,
      inferredValuesCountAsObservations: false
    }
  };
}
