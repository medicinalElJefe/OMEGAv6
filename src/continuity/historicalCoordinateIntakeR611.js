// R611: sparse, source-byte-bound ingestion of historical chart coordinates.
// Coordinates are representations; source verification is not execution admission.
import {createHash} from 'node:crypto';
import {encodeCorpusAddressR610,describeCorpusCoordinateR610} from './corpusAddressR610.js';
import {sha256R654} from './provenFrameR654.js';
const hashBytes=b=>createHash('sha256').update(b).digest('hex');
export function ingestHistoricalCoordinatesR611({sourceBytes,claimedSha256,sourceName,sheet,rows}={}){
 if(!(sourceBytes instanceof Uint8Array)||sourceBytes.byteLength===0||sourceBytes.byteLength>20_000_000)throw Error('bounded source bytes required');
 if(typeof claimedSha256!=='string'||!/^[a-f0-9]{64}$/.test(claimedSha256)||hashBytes(sourceBytes)!==claimedSha256)throw Error('source fingerprint mismatch');
 if(typeof sourceName!=='string'||!sourceName||typeof sheet!=='string'||!sheet||!Array.isArray(rows)||rows.length>4096)throw Error('bounded named chart rows required');
 const seen=new Set(),coordinates=rows.map((row,index)=>{
  if(!row||!Array.isArray(row.digits)||typeof row.familyId!=='string'||!row.familyId)throw Error('invalid chart row');
  const address=encodeCorpusAddressR610(row.digits);
  if(seen.has(address))throw Error('duplicate chart coordinate');seen.add(address);
  const coordinate=describeCorpusCoordinateR610(row.digits);
  return {index,familyId:row.familyId,address,coordinateSha256:coordinate.receiptSha256,rowSourceStatus:'CALLER_SUPPLIED_MAPPING_NOT_WORKBOOK_PARSED'};
 });
 const record={schema:'OMEGA_HISTORICAL_COORDINATE_INTAKE_R611',truthClass:'BYTE_VERIFIED_SOURCE_AND_UNVERIFIED_ROW_MAPPING',admission:'NO_EXECUTION_NO_CANON_MUTATION',source:{name:sourceName,sheet,sha256:claimedSha256,size:sourceBytes.byteLength},coordinates,limitations:['ROW_MAPPING_NOT_INDEPENDENTLY_VERIFIED','HISTORICAL_CAPABILITY_EXECUTION_NOT_PROVEN']};
 return {...record,receiptSha256:sha256R654(record)};
}
export function verifyHistoricalCoordinatesR611(input,record){
 try{return sha256R654(ingestHistoricalCoordinatesR611(input))===sha256R654(record)}catch{return false}
}
