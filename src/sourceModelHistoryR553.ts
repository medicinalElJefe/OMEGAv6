import {executeAccumulatedCapabilityR534} from './accumulativeCapabilityExecutionR534';
export const R553_HISTORY_KEY='omega.r553.sourceModelHistory';
export const R553_HISTORY_LIMIT=30;
export type R553Entry={id:string;at:string;capabilityId:string;address:number;status:string;executionClaimed:boolean;result:ReturnType<typeof executeAccumulatedCapabilityR534>};
export function appendSourceHistoryR553(history:readonly R553Entry[],entry:R553Entry):R553Entry[]{
 return [entry,...history.filter(x=>x.id!==entry.id)].slice(0,R553_HISTORY_LIMIT);
}
export function parseSourceHistoryR553(raw:string|null):R553Entry[]{
 if(!raw)return[];
 try{
  const data:unknown=JSON.parse(raw);
  if(!Array.isArray(data))return[];
  return data.filter((x):x is R553Entry=>typeof x==='object'&&x!==null&&typeof x.id==='string'&&typeof x.at==='string'&&typeof x.capabilityId==='string'&&Number.isInteger(x.address)&&x.address>=0&&x.address<20736&&typeof x.status==='string'&&typeof x.executionClaimed==='boolean'&&typeof x.result==='object'&&x.result!==null&&x.result.canonicalMutation===false).slice(0,R553_HISTORY_LIMIT);
 }catch{return[]}
}
export function runSourceHistoryR553(capabilityId:string,address:number,history:readonly R553Entry[],at:string,id:string){
 const result=executeAccumulatedCapabilityR534(capabilityId,address);
 const entry:R553Entry={id,at,capabilityId,address,status:result.status,executionClaimed:result.executionClaimed,result};
 return{entry,history:appendSourceHistoryR553(history,entry)};
}
