// R617S: source-only, bounded proof that the original R612 engineering rows
// partition the historical 12^10 address space into 12 x 12 disjoint bands.
// This is NOT an executor, an empirical dimension claim, or Canon admission.
import {createHash} from 'node:crypto';

export const ORIGINAL_BAND_PROOF_R617S = Object.freeze({
  schema: 'OMEGA_ORIGINAL_WORKBOOK_BAND_PARTITION_R617S',
  expectedRows: 144,
  radix: 12,
  bandSize: 12 ** 8,
  addressCapacity: 12 ** 10,
  moduleLabels: Object.freeze(['Cinematic', 'Evidence', 'Export', 'Observer', 'Packets', 'Renderer', 'Substrate', 'Traversal']),
  expectedRowsPerModule: 18,
  // Independently calculated from the exact original v18 sheet, never from a fixture.
  expectedBandLedgerSha256: 'cae44895b3f01d21b1c5baeb07b0e5a7a0898c111bd287fcc916ffd9dd337ef9',
});

function integerCell(value, label) {
  if (!/^(0|[1-9][0-9]*)$/.test(String(value ?? ''))) throw Error(label + ': noncanonical unsigned integer');
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw Error(label + ': unsafe integer');
  return number;
}

export function proveOriginalWorkbookBandsR617S(engineeringRecords) {
  const p = ORIGINAL_BAND_PROOF_R617S;
  if (!Array.isArray(engineeringRecords) || engineeringRecords.length !== p.expectedRows) {
    throw Error('original band proof: expected exactly 144 engineering records');
  }
  const moduleCounts = Object.fromEntries(p.moduleLabels.map(label => [label, 0]));
  const gateCounts = Object.create(null);
  const seen = new Set();
  const ledger = [];
  for (let i = 0; i < engineeringRecords.length; i++) {
    const row = engineeringRecords[i];
    if (!row || !Array.isArray(row.digits) || row.digits.length !== 10 ||
        row.digits.some(d => !Number.isInteger(d) || d < 0 || d >= p.radix)) {
      throw Error('original band proof: invalid coordinate at row ' + i);
    }
    const domain = Math.floor(i / p.radix), phase = i % p.radix;
    if (row.digits[0] !== domain || row.digits[1] !== phase) {
      throw Error('original band proof: domain/phase partition order mismatch at row ' + i);
    }
    const decoded = row.digits.reduce((acc, digit) => acc * p.radix + digit, 0);
    const address = integerCell(row.address, 'row ' + i + ' address');
    if (decoded !== address || seen.has(address)) throw Error('original band proof: coordinate/address mismatch at row ' + i);
    seen.add(address);
    const m = row.metadata;
    if (!m || typeof m !== 'object') throw Error('original band proof: missing metadata at row ' + i);
    const start = integerCell(m['Band Start'], 'row ' + i + ' Band Start');
    const end = integerCell(m['Band End'], 'row ' + i + ' Band End');
    const size = integerCell(m['Band Size'], 'row ' + i + ' Band Size');
    const expectedStart = i * p.bandSize;
    if (start !== expectedStart || end !== expectedStart + p.bandSize - 1 || size !== p.bandSize ||
        address < start || address > end) {
      throw Error('original band proof: gap, overlap, size or representative mismatch at row ' + i);
    }
    if (integerCell(m.Address, 'row ' + i + ' Address') !== address ||
        m['Decoded Check'] !== row.digits.join('|')) {
      throw Error('original band proof: declared address or decoded check mismatch at row ' + i);
    }
    const module = m.Module, gate = m.Gate;
    if (typeof module !== 'string' || !Object.hasOwn(moduleCounts, module)) {
      throw Error('original band proof: unknown historical module at row ' + i);
    }
    if (typeof gate !== 'string' || !gate || gate.length > 64) {
      throw Error('original band proof: invalid historical gate label at row ' + i);
    }
    moduleCounts[module]++;
    gateCounts[gate] = (gateCounts[gate] || 0) + 1;
    ledger.push([address, start, end, size, module, gate]);
  }
  if (Object.values(moduleCounts).some(n => n !== p.expectedRowsPerModule)) {
    throw Error('original band proof: historical module distribution mismatch');
  }
  return Object.freeze({
    schema: p.schema,
    truthClass: 'SOURCE_VERIFIED_REPRESENTATIONAL_PARTITION_NOT_EXECUTOR',
    admission: 'NO_EXECUTION_NO_CANON_MUTATION',
    addressCapacity: p.addressCapacity,
    coveredAddresses: p.addressCapacity,
    representativeRows: ledger.length,
    bandSize: p.bandSize,
    moduleCounts,
    historicalGateCounts: {...gateCounts},
    bandLedgerSha256: createHash('sha256').update(JSON.stringify(ledger)).digest('hex'),
  });
}

export function verifyOriginalWorkbookBandLedgerR617S(engineeringRecords) {
  const proof = proveOriginalWorkbookBandsR617S(engineeringRecords);
  if (proof.bandLedgerSha256 !== ORIGINAL_BAND_PROOF_R617S.expectedBandLedgerSha256) {
    throw Error('original band proof: independent source ledger fingerprint mismatch');
  }
  return proof;
}
