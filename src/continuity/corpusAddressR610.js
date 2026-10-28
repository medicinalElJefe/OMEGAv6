// R610: exact address arithmetic for the historical 12^10 engineering coordinates.
// Addressability is not execution, physical dimensionality or materialized capability count.
import {sha256R654} from './provenFrameR654.js';
export const CORPUS_AXES_R610=Object.freeze(['Domain','Phase','Regulation','Layer','Lens','Host','Operator','TimeBand','Evidence','Render']);
export const CORPUS_CAPACITY_R610=12**10;
export const HISTORICAL_SOURCE_R610=Object.freeze({name:'OMEGA_61917364224D_BUILD_CHART_v18.xlsx',sheet:'Axes',status:'HISTORICAL_DOCUMENT_REFERENCE_NOT_VERIFIED_FILE_BYTES'});
export function encodeCorpusAddressR610(digits){
 if(!Array.isArray(digits)||digits.length!==10||digits.some(d=>!Number.isInteger(d)||d<0||d>=12))throw Error('ten exact base-12 digits required');
 return digits.reduce((n,d)=>n*12+d,0);
}
export function decodeCorpusAddressR610(address){
 if(!Number.isSafeInteger(address)||address<0||address>=CORPUS_CAPACITY_R610)throw Error('address outside 12^10');
 const digits=Array(10),value=address;
 for(let i=9;i>=0;i--){digits[i]=address%12;address=Math.floor(address/12)}
 if(encodeCorpusAddressR610(digits)!==value)throw Error('address roundtrip mismatch');
 return digits;
}
export function describeCorpusCoordinateR610(digits){
 const address=encodeCorpusAddressR610(digits);
 const axes=Object.fromEntries(CORPUS_AXES_R610.map((name,i)=>[name,digits[i]]));
 const record={schema:'OMEGA_CORPUS_ADDRESS_R610',truthClass:'EXACT_REPRESENTATIONAL_COORDINATE_NOT_RUNTIME_CAPABILITY',source:HISTORICAL_SOURCE_R610,address,digits:[...digits],axes,executionAuthority:false,empiricalDimensionsClaimed:false};
 return {...record,receiptSha256:sha256R654(record)};
}
export function verifyCorpusCoordinateR610(record){
 try{
  if(record?.schema!=='OMEGA_CORPUS_ADDRESS_R610')return false;
  const expected=describeCorpusCoordinateR610(record.digits);
  return sha256R654(expected)===sha256R654(record)&&expected.receiptSha256===record.receiptSha256;
 }catch{return false}
}
// Each leading Domain digit determines a contiguous address band of width 12^9.
// This is arithmetic partitioning, not proof that any member was executed.
export function corpusDomainBandR610(domain){
 if(!Number.isInteger(domain)||domain<0||domain>11)throw Error('invalid domain digit');
 const width=12**9;
 return {domain,start:domain*width,end:(domain+1)*width-1,count:width,materialized:false};
}
