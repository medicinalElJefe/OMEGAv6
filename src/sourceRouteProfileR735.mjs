// R735: bounded exact successor-route metric profile. No physical time or measured field implied.
export const SOURCE_ROUTE_PROFILE_SCHEMA_R735='OMEGA_SOURCE_ROUTE_PROFILE_R735_V1';
const COUNT=20736;
export function computeSourceRouteProfileR735(field,start,channel='C',limit=256){
 if(!field||field.count!==COUNT||!(field.routeNext instanceof Uint32Array)||field.routeNext.length!==COUNT)
  throw Error('R735 complete source successor graph required');
 if(!Number.isSafeInteger(start)||start<0||start>=COUNT)throw Error('R735 invalid start address');
 if(!Number.isSafeInteger(limit)||limit<1||limit>COUNT)throw Error('R735 invalid bound');
 const sourceKey=channel==='successorDeltaC'?'C':channel;
 const source=field[sourceKey];
 if(!(source instanceof Float32Array)||source.length!==COUNT)throw Error('R735 complete metric channel required');
 const seen=new Map(),steps=[];
 let address=start,cycleStart=null;
 for(let index=0;index<limit;index++){
  if(seen.has(address)){cycleStart=seen.get(address);break;}
  seen.set(address,index);
  const next=field.routeNext[address];
  if(!Number.isSafeInteger(next)||next<0||next>=COUNT)throw Error('R735 invalid successor');
  const value=source[address],nextValue=source[next];
  if(!Number.isFinite(value)||!Number.isFinite(nextValue))throw Error('R735 nonfinite metric');
  const projected=channel==='successorDeltaC'?nextValue-value:value;
  steps.push({index,address,nextAddress:next,value:projected,successorDifference:nextValue-value});
  address=next;
 }
 if(cycleStart===null&&seen.has(address))cycleStart=seen.get(address);
 const values=steps.map(x=>x.value);
 return {schema:SOURCE_ROUTE_PROFILE_SCHEMA_R735,channel,start,steps,
  minimum:Math.min(...values),maximum:Math.max(...values),
  cycleStart,cyclePeriod:cycleStart===null?null:steps.length-cycleStart,
  truncated:cycleStart===null,continuationAddress:address,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Discrete source successor steps, not physical time, historical donor parity or empirical measurements.'};
}
