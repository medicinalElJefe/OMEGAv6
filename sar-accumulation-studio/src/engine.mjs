import { coverageAtPoint } from './geometry.mjs';

export function dedupeAndSort(records) {
  const byId = new Map();
  for (const record of records) {
    const prior = byId.get(record.id);
    if (!prior) byId.set(record.id, record);
    else {
      const priorScore = gradeScore(prior.evidence?.grade);
      const nextScore = gradeScore(record.evidence?.grade);
      if (nextScore > priorScore) byId.set(record.id, record);
    }
  }
  return [...byId.values()].sort((a, b) => {
    const dt = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    return dt || String(a.id).localeCompare(String(b.id));
  });
}

function gradeScore(grade) { return ({ A: 3, B: 2, C: 1 }[grade] || 0); }

export function frameState(records, index, mode = 'accumulate') {
  const safe = Math.max(0, Math.min(index, Math.max(0, records.length - 1)));
  const current = records[safe] || null;
  const visible = mode === 'single' ? (current ? [current] : []) : records.slice(0, safe + 1);
  return { index: safe, current, visible, count: visible.length };
}

export function maturityWarnings(records) {
  const maturities = [...new Set(records.map(r => r.maturity).filter(Boolean))];
  const warnings = [];
  if (maturities.includes('BETA') && maturities.includes('PROVISIONAL')) {
    warnings.push('Mixed NISAR BETA + PROVISIONAL maturity: processing changes can appear as temporal change.');
  }
  if (records.some(r => r.platform?.toUpperCase().includes('NISAR') && r.maturity === 'PROVISIONAL')) {
    warnings.push('NISAR PROVISIONAL is calibrated and partially validated, not final validated maturity.');
  }
  if (records.some(r => r.evidence?.grade === 'C')) {
    warnings.push('One or more records are Grade C imports; inspect provenance before scientific interpretation.');
  }
  return warnings;
}

export function revisitStats(records, lon, lat, throughIndex = records.length - 1) {
  const hits = coverageAtPoint(records, lon, lat, throughIndex)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const intervalsHours = [];
  for (let i = 1; i < hits.length; i++) {
    intervalsHours.push((new Date(hits[i].startTime) - new Date(hits[i - 1].startTime)) / 3600000);
  }
  const meanHours = intervalsHours.length ? intervalsHours.reduce((a,b)=>a+b,0) / intervalsHours.length : null;
  return {
    hits,
    hitCount: hits.length,
    first: hits[0]?.startTime || null,
    last: hits.at(-1)?.startTime || null,
    intervalsHours,
    meanHours
  };
}

export function knownMissionWarnings({ dataset, start, end } = {}) {
  const warnings = [];
  if (String(dataset || '').toUpperCase() === 'NISAR' && start && end) {
    const q0 = new Date(start).getTime();
    const q1 = new Date(end).getTime();
    const gap0 = new Date('2026-07-27T22:03:25Z').getTime();
    const gap1 = new Date('2026-08-10T00:55:27Z').getTime();
    if (Number.isFinite(q0) && Number.isFinite(q1) && q0 <= gap1 && q1 >= gap0) {
      warnings.push('Known NISAR instrument data gap: 2026-07-27T22:03:25Z through 2026-08-10T00:55:27Z. Missing observations in this interval must not be interpreted as surface stability.');
    }
  }
  return warnings;
}

export function acquisitionSpacing(records) {
  const sorted = dedupeAndSort(records);
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push((new Date(sorted[i].startTime) - new Date(sorted[i - 1].startTime)) / 1000);
  }
  return gaps;
}
