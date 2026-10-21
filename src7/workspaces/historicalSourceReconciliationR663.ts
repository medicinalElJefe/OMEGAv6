/** R663 OMEGA 7 bounded historical source reconciliation. No mutation of canonical state. */
import {historicalAddressDigits,SEVEN_STAR_HISTORICAL_SOURCES} from './sevenStarHistoricalAuthorityR602.ts';
import {replayWorkbookFrameR604} from './timeMandalaFormulaReplayR604.ts';
export type R663EvidenceRow={sourceId:string;row:number;address:number;digits?:readonly number[];baseStar?:number;activeStar?:number;mode188Gate?:string};
export type R663Receipt={schema:'OMEGA7_SOURCE_RECONCILIATION_R663';truthClass:'LOCAL_SOURCE_REPLAY_COMPARISON';sourceId:string;offset:number;processed:number;accepted:number;discrepancies:readonly {row:number;address:number;field:string;expected:string;actual:string}[];nextOffset:number|null;dependency:'R602_ADDRESS_MAPPING + R604_FORMULA_REPLAY';immutable:true};
export function reconcileHistoricalBatchR663(rows:readonly R663EvidenceRow[],{sourceId,seconds,offset=0,limit=256}:{sourceId:string;seconds:number;offset?:number;limit?:number}):R663Receipt{
 if(!SEVEN_STAR_HISTORICAL_SOURCES.some(s=>s.id===sourceId))throw Error('unregistered historical source');
 if(!Array.isArray(rows)||!Number.isInteger(offset)||offset<0||offset>rows.length||!Number.isInteger(limit)||limit<1||limit>1024)throw Error('invalid bounded batch');
 const discrepancies:R663Receipt['discrepancies'][number][]=[];let accepted=0;
 const end=Math.min(rows.length,offset+limit);
 for(let i=offset;i<end;i++){
  const row=rows[i];if(!row||row.sourceId!==sourceId||!Number.isInteger(row.row)||!Number.isInteger(row.address))throw Error('invalid source row');
  const digits=historicalAddressDigits(row.address),frame=replayWorkbookFrameR604(row.address,seconds);
  const checks:[string,unknown,unknown][]=[];
  if(row.digits!==undefined)checks.push(['digits',JSON.stringify(digits),JSON.stringify(row.digits)]);
  if(row.baseStar!==undefined)checks.push(['baseStar',frame.baseStar,row.baseStar]);
  if(row.activeStar!==undefined)checks.push(['activeStar',frame.activeStar,row.activeStar]);
  if(row.mode188Gate!==undefined)checks.push(['mode188Gate',frame.mode188Gate,row.mode188Gate]);
  let valid=true;for(const [field,expected,actual] of checks)if(String(expected)!==String(actual)){valid=false;discrepancies.push({row:row.row,address:row.address,field,expected:String(expected),actual:String(actual)})}
  if(valid)accepted++;
 }
 const receipt:R663Receipt={schema:'OMEGA7_SOURCE_RECONCILIATION_R663',truthClass:'LOCAL_SOURCE_REPLAY_COMPARISON',sourceId,offset,processed:end-offset,accepted,discrepancies,nextOffset:end<rows.length?end:null,dependency:'R602_ADDRESS_MAPPING + R604_FORMULA_REPLAY',immutable:true};
 return Object.freeze({...receipt,discrepancies:Object.freeze(discrepancies.map(d=>Object.freeze(d))) });
}
