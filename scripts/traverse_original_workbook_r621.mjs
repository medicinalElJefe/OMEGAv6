#!/usr/bin/env node
// R621: read-only original-byte proof + R618 address execution.
// The private workbook is read only from the caller's filesystem. Never print its rows.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {HISTORICAL_WORKBOOK_PROOF_R613, verifyOriginalWorkbookR613} from '../src/continuity/originalWorkbookParityR613.js';
import {parseHistoricalWorkbookR612} from '../src/continuity/ooxmlCorpusParserR612.js';
import {verifyOriginalWorkbookBandLedgerR617S} from '../src/continuity/originalWorkbookBandProofR617S.js';
import {traverseOriginalSourceBandR618, verifyOriginalSourceBandTraversalR618} from '../src/continuity/sourceBoundBandTraversalR618.js';

const sha256 = value => createHash('sha256').update(value).digest('hex');
function canonicalInteger(value, label, nonnegative = false) {
  if (typeof value !== 'string' || !/^(0|-?[1-9][0-9]*)$/.test(value)) throw Error(label + ': canonical integer required');
  const n = Number(value);
  if (!Number.isSafeInteger(n) || (nonnegative && n < 0)) throw Error(label + ': safe integer required');
  return n;
}
export function parseTraversalArgsR621(argv) {
  if (!Array.isArray(argv) || ![5, 6].includes(argv.length) ||
      !argv[0] || argv[0].startsWith('--') ||
      argv[1] !== '--address' || argv[3] !== '--offset' ||
      (argv.length === 6 && argv[5] !== '--wrap')) {
    throw Error('usage: node scripts/traverse_original_workbook_r621.mjs /path/original.xlsx --address N --offset SIGNED_N [--wrap]');
  }
  return Object.freeze({
    path: argv[0],
    address: canonicalInteger(argv[2], 'address', true),
    offset: canonicalInteger(argv[4], 'offset'),
    wrap: argv.length === 6,
  });
}

export function proveOriginalByteTraversalR621(sourceBytes, {address, offset, wrap = false} = {}) {
  if (!Buffer.isBuffer(sourceBytes)) throw Error('original workbook Buffer required');
  const pinned = HISTORICAL_WORKBOOK_PROOF_R613;
  // The R613 byte fingerprint is the first admission gate, not the sheet's historical PASS label.
  const parity = verifyOriginalWorkbookR613(sourceBytes);
  const extracted = parseHistoricalWorkbookR612({
    sourceBytes, claimedSha256: pinned.sha256, sheet: pinned.sheet, familyId: 'atlas-state',
  });
  const records = extracted.engineeringRecords;
  if (!Array.isArray(records) || records.length !== pinned.expectedRows) throw Error('original engineering record count mismatch');
  const partition = verifyOriginalWorkbookBandLedgerR617S(records);
  const input = {engineeringRecords: records, address, offset, wrap};
  const traversal = traverseOriginalSourceBandR618(input);
  if (!verifyOriginalSourceBandTraversalR618(input, traversal) ||
      traversal.sourceLedgerSha256 !== partition.bandLedgerSha256) {
    throw Error('source-bound traversal receipt verification failed');
  }
  const record = {
    schema: 'OMEGA_ORIGINAL_BYTE_TRAVERSAL_PROOF_R621',
    truthClass: 'LOCAL_ORIGINAL_BYTES_VERIFIED_REPRESENTATIONAL_TRAVERSAL_NOT_HISTORICAL_EXECUTOR',
    admission: 'READ_ONLY_NO_CANON_MUTATION_NO_NATIVE_HOST_EXECUTION',
    sourceSha256: pinned.sha256,
    sourceBytes: sourceBytes.length,
    sourceSheet: pinned.sheet,
    coordinateListSha256: parity.coordinateListSha256,
    sourceLedgerSha256: partition.bandLedgerSha256,
    traversal,
    privateRowsEmitted: false,
  };
  return Object.freeze({...record, receiptSha256: sha256(JSON.stringify(record))});
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    const {path, ...movement} = parseTraversalArgsR621(process.argv.slice(2));
    const receipt = proveOriginalByteTraversalR621(readFileSync(resolve(path)), movement);
    process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
  } catch (error) {
    // Do not emit workbook content, parsed rows, notes, or interpreter stack traces.
    console.error('R621 ORIGINAL SOURCE TRAVERSAL REFUSED:', error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
