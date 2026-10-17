/** R600: typed, directed, conservative exchange graph for seven complete systems.
 * A channel is an internal system, not a color or physical dimension.
 * Transfers are finite, nonnegative and limited by available source inventory.
 * Blocked requests remain evidence; returning transfers are separately typed.
 */
export type ExchangeKind='INGRESS'|'EGRESS'|'RETURN'|'BLOCKED';
export type ExchangeEdge={id:string;from:number;to:number;rate:number;kind:ExchangeKind;enabled:boolean};
export type ExchangeReceipt={id:string;from:number;to:number;kind:ExchangeKind;requested:number;admitted:number;blocked:number};
export type ExchangeGraph={edges:ExchangeEdge[]};
export type ExchangeResult={next:Float64Array;receipts:ExchangeReceipt[];totalBefore:number;totalAfter:number;residual:number;incoming:Float64Array;outgoing:Float64Array;blocked:number};
export const sevenSystemGraph:ExchangeGraph={edges:Array.from({length:7},(_,i)=>({id:'ring-'+i,from:i,to:(i+1)%7,rate:.08,kind:'EGRESS' as const,enabled:true}))};
export function validateExchangeGraph(graph:ExchangeGraph){
 const ids=new Set<string>();
 for(const edge of graph.edges){
  if(!edge.id||ids.has(edge.id))throw Error('duplicate or empty exchange edge id');
  ids.add(edge.id);
  if(!Number.isInteger(edge.from)||!Number.isInteger(edge.to)||edge.from<0||edge.from>6||edge.to<0||edge.to>6||edge.from===edge.to)throw Error('invalid exchange endpoints');
  if(!Number.isFinite(edge.rate)||edge.rate<0||edge.rate>1)throw Error('exchange rate outside [0,1]');
  if(!['INGRESS','EGRESS','RETURN','BLOCKED'].includes(edge.kind))throw Error('invalid exchange type');
 }
}
export function applyExchangeGraph(inventory:Float64Array,graph:ExchangeGraph):ExchangeResult{
 if(inventory.length!==7||inventory.some(v=>!Number.isFinite(v)||v<0))throw Error('invalid seven-system inventory');
 validateExchangeGraph(graph);
 const next=inventory.slice(),receipts:ExchangeReceipt[]=[],incoming=new Float64Array(7),outgoing=new Float64Array(7);
 const before=inventory.reduce((a,b)=>a+b,0);
 // A synchronous snapshot of requests prevents edge-order bias; requests from
 // one source are proportionally admitted when combined demand exceeds supply.
 const requests=graph.edges.map(edge=>edge.enabled?inventory[edge.from]*edge.rate:0);
 const demands=new Float64Array(7);
 graph.edges.forEach((edge,i)=>{if(edge.kind!=='BLOCKED')demands[edge.from]+=requests[i]});
 let blocked=0;
 graph.edges.forEach((edge,i)=>{
  const requested=requests[i];
  const scale=demands[edge.from]>inventory[edge.from]&&demands[edge.from]>0?inventory[edge.from]/demands[edge.from]:1;
  const admitted=edge.kind==='BLOCKED'?0:requested*scale;
  const denied=requested-admitted;blocked+=denied;
  next[edge.from]-=admitted;next[edge.to]+=admitted;
  outgoing[edge.from]+=admitted;incoming[edge.to]+=admitted;
  receipts.push({id:edge.id,from:edge.from,to:edge.to,kind:edge.kind,requested,admitted,blocked:denied});
 });
 const totalAfter=next.reduce((a,b)=>a+b,0);
 return{next,receipts,totalBefore:before,totalAfter,residual:totalAfter-before,incoming,outgoing,blocked};
}
export function sevenSystemNetworkMetrics(result:ExchangeResult){
 const active=result.receipts.filter(r=>r.admitted>0);
 const sources=new Set(active.map(r=>r.from)),targets=new Set(active.map(r=>r.to));
 const convergence=Array.from({length:7},(_,i)=>({system:i+1,parents:new Set(active.filter(r=>r.to===i).map(r=>r.from)).size,incoming:result.incoming[i],outgoing:result.outgoing[i]}));
 return{activeEdges:active.length,activeSources:sources.size,activeTargets:targets.size,convergence,returnFlow:active.filter(r=>r.kind==='RETURN').reduce((a,b)=>a+b.admitted,0),blocked:result.blocked,residual:result.residual};
}
