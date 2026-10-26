// R618: executable, bounded traversal of the historical 12^10 address representation.
// This does not execute a historical module, mutate Canon, or imply physical dimensions.
import {createHash} from 'node:crypto';
import {CORPUS_CAPACITY_R610, decodeCorpusAddressR610} from './corpusAddressR610.js';
import {ORIGINAL_BAND_PROOF_R617S, verifyOriginalWorkbookBandLedgerR617S} from './originalWorkbookBandProofR617S.js';

const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const width = ORIGINAL_BAND_PROOF_R617S.bandSize;

function requireSafe(value, label) {
  if (!Number.isSafeInteger(value)) throw Error(label + ': safe integer required');
  return value;
}

// This is a real address-arithmetic executor, not a historical application executor.
export function traverseCorpusBandR618({address, offset, wrap = false} = {}) {
  requireSafe(address, 'address');
  requireSafe(offset, 'offset');
  if (address < 0 || address >= CORPUS_CAPACITY_R610) throw Error('address outside 12^10');
  if (typeof wrap !== 'boolean') throw Error('wrap must be boolean');
  const capacity = BigInt(CORPUS_CAPACITY_R610);
  const raw = BigInt(address) + BigInt(offset);
  const crossedBoundary = raw < 0n || raw >= capacity;
  if (crossedBoundary && !wrap) throw Error('traversal outside 12^10 without wrap authority');
  const target = Number(((raw % capacity) + capacity) % capacity);
  const fromBand = Math.floor(address / width);
  const toBand = Math.floor(target / width);
  const record = {
    schema: 'OMEGA_CORPUS_BAND_TRAVERSAL_R618',
    truthClass: 'LOCAL_REPRESENTATIONAL_ADDRESS_EXECUTION_NOT_HISTORICAL_EXECUTOR',
    admission: 'NO_CANON_MUTATION_NO_HISTORICAL_MODULE_EXECUTION',
    addressCapacity: CORPUS_CAPACITY_R610,
    fromAddress: address,
    toAddress: target,
    offset,
    wrapAuthorized: wrap,
    wrapped: crossedBoundary,
    fromBand,
    toBand,
    crossedBand: fromBand !== toBand,
    fromDigits: decodeCorpusAddressR610(address),
    toDigits: decodeCorpusAddressR610(target),
  };
  return Object.freeze({...record, receiptSha256: digest(record)});
}

export function verifyCorpusBandTraversalR618(input, receipt) {
  try {
    const expected = traverseCorpusBandR618(input);
    return receipt?.schema === expected.schema && digest(receipt) === digest(expected);
  } catch { return false; }
}

// This path requires actual 144 source records to pass the pinned R617S ledger.
// It never emits original workbook rows, Notes, or Build Interpretation text.
export function traverseOriginalSourceBandR618({engineeringRecords, address, offset, wrap = false} = {}) {
  const proof = verifyOriginalWorkbookBandLedgerR617S(engineeringRecords);
  const traversal = traverseCorpusBandR618({address, offset, wrap});
  const source = engineeringRecords[traversal.fromBand];
  const destination = engineeringRecords[traversal.toBand];
  const record = {
    ...traversal,
    schema: 'OMEGA_ORIGINAL_SOURCE_BAND_TRAVERSAL_R618',
    truthClass: 'LOCAL_SOURCE_LEDGER_BOUND_ADDRESS_EXECUTION_NOT_HISTORICAL_EXECUTOR',
    sourceLedgerSha256: proof.bandLedgerSha256,
    sourceModule: source.metadata.Module,
    destinationModule: destination.metadata.Module,
  };
  delete record.receiptSha256;
  return Object.freeze({...record, receiptSha256: digest(record)});
}

export function verifyOriginalSourceBandTraversalR618(input, receipt) {
  try {
    const expected = traverseOriginalSourceBandR618(input);
    return receipt?.schema === expected.schema && digest(receipt) === digest(expected);
  } catch { return false; }
}
