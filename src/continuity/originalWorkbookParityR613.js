// R613: independently inventoried original workbook evidence, without committing original bytes.
// Historical source evidence is an intake constraint, not executor restoration.
import {createHash} from 'node:crypto';
import {parseHistoricalWorkbookR612} from './ooxmlCorpusParserR612.js';
export const HISTORICAL_WORKBOOK_PROOF_R613=Object.freeze({
 source:'OMEGA_61917364224D_BUILD_CHART_v18.xlsx',
 sha256:'2b096f5bc6f463d298a28846e4240a71b58e43eaf5b621ba4cdce8879ee98e96',
 sizeBytes:149433,
 sheet:'619D_Addressing',
 expectedRows:144,
 coordinateListSha256:'1213665ccc3b8ef259d77734654dc5a7a20770187c8734da7d1c122c97b6b4c7',
 firstAddress:207432,
 lastAddress:61664835395,
 truthClass:'INDEPENDENT_SOURCE_INVENTORY_NOT_PRODUCTION_INGESTION'
});
export function verifyOriginalWorkbookR613(sourceBytes){
 const p=HISTORICAL_WORKBOOK_PROOF_R613;
 if(!(sourceBytes instanceof Uint8Array)||sourceBytes.length!==p.sizeBytes)throw Error('original workbook byte length mismatch');
 const hash=createHash('sha256').update(sourceBytes).digest('hex');
 if(hash!==p.sha256)throw Error('original workbook SHA256 mismatch');
 const parsed=parseHistoricalWorkbookR612({sourceBytes,claimedSha256:p.sha256,sheet:p.sheet,familyId:'atlas-state'});
 const addresses=parsed.coordinates.map(x=>x.address);
 const digest=createHash('sha256').update(JSON.stringify(addresses)).digest('hex');
 if(addresses.length!==p.expectedRows||new Set(addresses).size!==p.expectedRows||digest!==p.coordinateListSha256||addresses[0]!==p.firstAddress||addresses.at(-1)!==p.lastAddress)throw Error('historic coordinate parity mismatch');
 return {schema:'OMEGA_ORIGINAL_WORKBOOK_PARITY_R613',sourceSha256:p.sha256,coordinateListSha256:digest,coordinateRows:addresses.length,truthClass:'LOCAL_VERIFIED_WORKBOOK_CELLS',admission:'NO_EXECUTION_NO_CANON_MUTATION'};
}
