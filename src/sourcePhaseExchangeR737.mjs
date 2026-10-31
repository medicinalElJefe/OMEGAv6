// R737: exact, read-only exchange geometry over R736 source-metric successor edges.
// Discrete model coordinates only. No physical motion, physical symmetry, or donor parity.
import {SOURCE_PHASE_PORTRAIT_SCHEMA_R736} from './sourcePhasePortraitR736.mjs';
export const SOURCE_PHASE_EXCHANGE_SCHEMA_R737='OMEGA_SOURCE_PHASE_EXCHANGE_R737_V1';
const EPS=1e-8;
const finite=(x)=>typeof x==='number'&&Number.isFinite(x);
const distance=(dx,dy)=>Math.hypot(dx,dy);
function reflectionMismatch(points,axis){
 const lo=Math.min(...points.map(p=>p[axis])),hi=Math.max(...points.map(p=>p[axis]));
 const center=(lo+hi)/2;
 return points.reduce((sum,p)=>{
  const reflected=2*center-p[axis];
  const closest=Math.min(...points.map(q=>distance(
   axis==='xNormalized'?reflected-q.xNormalized:p.xNormalized-q.xNormalized,
   axis==='yNormalized'?reflected-q.yNormalized:p.yNormalized-q.yNormalized)));
  return sum+closest;
 },0)/points.length;
}
export function computeSourcePhaseExchangeR737(portrait){
 const p=portrait;
 if(!p||p.schema!==SOURCE_PHASE_PORTRAIT_SCHEMA_R736||!Array.isArray(p.points)||!Array.isArray(p.edges)||
    p.points.length<1||p.points.length>256||p.edges.length<0||p.edges.length>p.points.length)
  throw Error('R737 exact bounded R736 source portrait required');
 const closed=p.cycleStart!==null;
 if(closed?(!Number.isSafeInteger(p.cycleStart)||p.cycleStart<0||p.cycleStart>=p.points.length||
    p.cyclePeriod!==p.points.length-p.cycleStart||p.edges.length!==p.points.length):
    (p.edges.length!==p.points.length-1))
  throw Error('R737 inconsistent source-cycle topology');
 const steps=p.points;
 for(let i=0;i<steps.length;i++){
  const x=steps[i];
  if(x.index!==i||!Number.isSafeInteger(x.address)||!Number.isSafeInteger(x.nextAddress)||
     x.address<0||x.address>=20736||x.nextAddress<0||x.nextAddress>=20736||
     !finite(x.xNormalized)||!finite(x.yNormalized)||!finite(x.xValue)||!finite(x.yValue)||
     x.xNormalized<0||x.xNormalized>1||x.yNormalized<0||x.yNormalized>1)
   throw Error('R737 invalid source-metric point '+i);
 }
 let transientLength=0,cycleLength=0,netDx=0,netDy=0,cycleDx=0,cycleDy=0,twiceArea=0;
 const edges=p.edges.map((edge,i)=>{
  const last=i===steps.length-1;
  const from=i,to=last?p.cycleStart:i+1;
  if(edge.from!==from||edge.to!==to||edge.cycleEdge!==(closed&&i>=p.cycleStart))
   throw Error('R737 invalid source successor edge '+i);
  const a=steps[from],b=steps[to];
  if(a.nextAddress!==b.address)throw Error('R737 source successor address mismatch '+i);
  const dx=b.xNormalized-a.xNormalized,dy=b.yNormalized-a.yNormalized;
  const length=distance(dx,dy),cycle=Boolean(edge.cycleEdge);
  if(cycle){cycleLength+=length;cycleDx+=dx;cycleDy+=dy;twiceArea+=a.xNormalized*b.yNormalized-b.xNormalized*a.yNormalized;}
  else transientLength+=length;
  netDx+=dx;netDy+=dy;
  return {index:i,fromAddress:a.address,toAddress:b.address,dx,dy,length,phase:cycle?'CYCLE':'TRANSIENT'};
 });
 const end=closed?steps[p.cycleStart]:steps[steps.length-1],first=steps[0];
 if(Math.abs(netDx-(end.xNormalized-first.xNormalized))>EPS||
    Math.abs(netDy-(end.yNormalized-first.yNormalized))>EPS||
    (closed&&(Math.abs(cycleDx)>EPS||Math.abs(cycleDy)>EPS)))
  throw Error('R737 source exchange continuity balance failed');
 const signedCycleArea=closed?twiceArea/2:null;
 const orientation=!closed?'OPEN':Math.abs(signedCycleArea)<=EPS?'DEGENERATE':signedCycleArea>0?'COUNTERCLOCKWISE':'CLOCKWISE';
 const cyclePoints=closed?steps.slice(p.cycleStart):[];
 return {schema:SOURCE_PHASE_EXCHANGE_SCHEMA_R737,start:p.start,xChannel:p.xChannel,yChannel:p.yChannel,
  pointCount:steps.length,edgeCount:edges.length,cycleStart:p.cycleStart,cyclePeriod:p.cyclePeriod,
  truncated:p.truncated,continuationAddress:p.continuationAddress,edges,
  transientLength,cycleLength,totalLength:transientLength+cycleLength,
  netDx,netDy,cycleClosureResidual:closed?distance(cycleDx,cycleDy):null,
  signedCycleArea,orientation,
  verticalReflectionMismatch:closed?reflectionMismatch(cyclePoints,'xNormalized'):null,
  horizontalReflectionMismatch:closed?reflectionMismatch(cyclePoints,'yNormalized'):null,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,historicalParity:false,
  boundary:'Normalized source-metric exchange, polygon orientation and nearest-point mirror mismatch are finite formal geometry, not physical motion, measured symmetry, time, or historical donor parity.'};
}
export function serializeSourcePhaseExchangeR737(exchange){
 if(!exchange||exchange.schema!==SOURCE_PHASE_EXCHANGE_SCHEMA_R737||!exchange.sourceBound||
    exchange.canonicalMutation!==false||exchange.physicalMeasurement!==false)
  throw Error('R737 export requires validated source exchange');
 return JSON.stringify(exchange,null,2)+'\\n';
}
