import assert from 'node:assert/strict';
import {ORIGINAL_BAND_PROOF_R617S as p, proveOriginalWorkbookBandsR617S as prove, verifyOriginalWorkbookBandLedgerR617S as verify} from '../src/continuity/originalWorkbookBandProofR617S.js';

const rows = Array.from({length: p.expectedRows}, (_, i) => {
  const domain = Math.floor(i / 12), phase = i % 12;
  const digits = [domain, phase, 0, 0, 0, 10, 0, 0, 6, 0];
  const address = digits.reduce((n, d) => n * 12 + d, 0);
  return {digits, address, metadata: {
    Address: String(address), 'Decoded Check': digits.join('|'),
    'Band Start': String(i * p.bandSize), 'Band End': String((i + 1) * p.bandSize - 1),
    'Band Size': String(p.bandSize), Module: p.moduleLabels[i % 8], Gate: 'PASS',
  }};
});
const result = prove(rows);
assert.equal(result.coveredAddresses, 12 ** 10);
assert.throws(() => verify(rows), /independent source ledger fingerprint mismatch/);
assert.equal(result.representativeRows, 144);
assert.equal(result.historicalGateCounts.PASS, 144);
assert.equal(result.moduleCounts.Cinematic, 18);
assert.match(result.bandLedgerSha256, /^[a-f0-9]{64}$/);
assert.match(result.truthClass, /NOT_EXECUTOR/);
const changed = (i, changes) => rows.map((row, j) => j === i ? {...row, ...changes} : row);
const changedMetadata = (i, patch) => changed(i, {metadata: {...rows[i].metadata, ...patch}});
assert.throws(() => prove(rows.slice(1)), /exactly 144/);
assert.throws(() => prove(changedMetadata(1, {'Band Start': '0'})), /gap, overlap/);
assert.throws(() => prove(changedMetadata(1, {'Band End': String(3 * p.bandSize - 1)})), /gap, overlap/);
assert.throws(() => prove(changedMetadata(1, {'Band Size': '429981695'})), /gap, overlap/);
assert.throws(() => prove(changedMetadata(1, {'Band Size': '4.29981696e8'})), /noncanonical/);
assert.throws(() => prove(changed(1, {digits: [...rows[0].digits]})), /domain\/phase/);
assert.throws(() => prove(changedMetadata(1, {'Decoded Check': 'forged'})), /decoded check/);
assert.throws(() => prove(changedMetadata(1, {Address: '-1'})), /noncanonical/);
assert.throws(() => prove(changedMetadata(1, {Module: 'ImaginaryExecutor'})), /unknown historical module/);
assert.throws(() => prove(changedMetadata(1, {Module: 'Substrate'})), /module distribution/);
assert.throws(() => prove(changedMetadata(1, {Gate: ''})), /invalid historical gate/);
assert.throws(() => prove(changed(1, {address: Number.MAX_SAFE_INTEGER + 1})), /unsafe integer/);
console.log('R617S historical 12^10 source band partition, provenance and negative controls PASS');
