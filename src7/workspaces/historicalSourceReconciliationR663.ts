/** R663: compare caller-supplied evidence rows against independently replayed R602/R604 formulas.
 * This is a local comparison, never original-byte authentication or canonical admission.
 */
import {historicalAddressDigits,SEVEN_STAR_HISTORICAL_SOURCES} from './sevenStarHistoricalAuthorityR602.ts';
import {replayWorkbookFrameR604,workbookClockR604} from './timeMandalaFormulaReplayR604.ts';
export type R663EvidenceRow={sourceId:string;row:number;address:number;digits?:readonly number[];baseStar?:number;activeStar?:number;mode188Gate?:string};
export type R663Discrepancy=Readonly<{row:number;address:number;field:string;expected:string;actual:string}>;
export type R663Receipt=Readonly<{schema:'OMEGA7_SOURCE_RECONCILIATION_R663';truthClass:'LOCAL_SOURCE_REPLAY_COMPARISON';sourceId:string;offset:number;processed:number;accepted:number;checkedFields:number;discrepancies:readonly R663Discrepancy[];nextOffset:number|null;dependency:'R602_ADDRESS_MAPPING + R604_FORMULA_REPLAY';originalSourceAuthenticated:false;canonicalMutation:false;immutable:true}>;
export function reconcileHistoricalBatchR663(rows:readonly R663EvidenceRow[],{sourceId,seconds,offset=0,limit=256}:{sourceId:string;seconds:number;offset?:number;limit?:number}):R663Receipt{
 if(!SEVEN_STAR_HISTORICAL_SOURCES.some(s=>s.id===sourceId))throw Error('UNREGISTERED_HISTORICAL_SOURCE');
 workbookClockR604(seconds);
 if(!Array.isArray(rows)||rows.length>4096||!Number.isInteger(offset)||offset<0||offset>rows.length||!Number.isInteger(limit)||limit<1||limit>1024)throw Error('INVALID_BOUNDED_BATCH');
 const discrepancies:R663Discrepancy[]=[];let accepted=0,checkedFields=0;
 const end=Math.min(rows.length,offset+limit);
 for(let i=offset;i<end;i++){
  const row=rows[i];
  if(!row||row.sourceId!==sourceId||!Number.isInteger(row.row)||row.row<0||!Number.isInteger(row.address))throw Error('INVALID_SOURCE_ROW');
  const digits=historicalAddressDigits(row.address),frame=replayWorkbookFrameR604(row.address,seconds);
  const checks:[string,unknown,unknown][]=[];
  if(row.digits!==undefined){
   if(!Array.isArray(row.digits)||row.digits.length!==4||row.digits.some(v=>!Number.isInteger(v)||v<0||v>11))throw Error('INVALID_COORDINATE_DIGITS');
   checks.push(['digits',JSON.stringify(digits),JSON.stringify(row.digits)]);
  }
  if(row.baseStar!==undefined){if(!Number.isInteger(row.baseStar))throw Error('INVALID_BASE_STAR');checks.push(['baseStar',frame.baseStar,row.baseStar])}
  if(row.activeStar!==undefined){if(!Number.isInteger(row.activeStar))throw Error('INVALID_ACTIVE_STAR');checks.push(['activeStar',frame.activeStar,row.activeStar])}
  if(row.mode188Gate!==undefined){if(typeof row.mode188Gate!=='string')throw Error('INVALID_MODE188_GATE');checks.push(['mode188Gate',frame.mode188Gate,row.mode188Gate])}
  if(!checks.length)throw Error('UNTESTABLE_SOURCE_ROW');
  checkedFields+=checks.length;
  let valid=true;
  for(const [field,expected,actual] of checks)if(String(expected)!==String(actual)){valid=false;discrepancies.push(Object.freeze({row:row.row,address:row.address,field,expected:String(expected),actual:String(actual)}))}
  if(valid)accepted++;
 }
 return Object.freeze({schema:'OMEGA7_SOURCE_RECONCILIATION_R663',truthClass:'LOCAL_SOURCE_REPLAY_COMPARISON',sourceId,offset,processed:end-offset,accepted,checkedFields,discrepancies:Object.freeze(discrepancies),nextOffset:end<rows.length?end:null,dependency:'R602_ADDRESS_MAPPING + R604_FORMULA_REPLAY',originalSourceAuthenticated:false,canonicalMutation:false,immutable:true});
}
