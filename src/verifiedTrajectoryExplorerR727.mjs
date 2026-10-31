// R727: discrete, source-bound trajectory projection. Never interpolate absent observations.
import {MEMORY_TRAJECTORY_SCHEMA_R726,MEMORY_TRAJECTORY_LIMIT_R726} from './memoryTrajectoryR726.mjs';
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function buildVerifiedTrajectoryExplorerR727(packet,requestedKey='address'){
 if(!packet||packet.schema!==MEMORY_TRAJECTORY_SCHEMA_R726||!Array.isArray(packet.sources)||
    !Array.isArray(packet.edges)||packet.sources.length<3||
    packet.sources.length>MEMORY_TRAJECTORY_LIMIT_R726||
    packet.edges.length!==packet.sources.length-1)
  throw Error('R727 verified trajectory schema refused');
 const sources=packet.sources;
 const keys=new Set(['address']);
 for(let i=0;i<sources.length;i++){
  const s=sources[i];
  if(typeof s.id!=='string'||!finite(s.at)||!Number.isInteger(s.address)||
     s.address<0||s.address>=20736||(i&&s.at<=sources[i-1].at))
   throw Error('R727 invalid or unordered source observation');
 }
 for(let i=0;i<packet.edges.length;i++){
  const edge=packet.edges[i];
  if(edge.earlierId!==sources[i].id||edge.laterId!==sources[i+1].id||
     !Array.isArray(edge.metricDeltas))throw Error('R727 edge/source identity mismatch');
  for(const d of edge.metricDeltas){
   if(typeof d.key!=='string'||!d.key||!finite(d.earlier)||!finite(d.later)||
      !finite(d.delta)||Math.abs((d.later-d.earlier)-d.delta)>1e-8*Math.max(1,Math.abs(d.delta)))
    throw Error('R727 invalid numeric edge observation');
   keys.add(d.key);
  }
 }
 const metricKeys=[...keys].sort((a,b)=>a==='address'?-1:b==='address'?1:a.localeCompare(b));
 if(!metricKeys.includes(requestedKey))throw Error('R727 metric not present in verified trajectory');
 const values=sources.map(s=>requestedKey==='address'?s.address:null);
 if(requestedKey!=='address'){
  for(let i=0;i<packet.edges.length;i++){
   const d=packet.edges[i].metricDeltas.find(d=>d.key===requestedKey);
   if(!d)continue;
   for(const [index,value] of [[i,d.earlier],[i+1,d.later]]){
    if(values[index]!==null&&Math.abs(values[index]-value)>1e-8*Math.max(1,Math.abs(value)))
     throw Error('R727 contradictory metric observation');
    values[index]=value;
   }
  }
 }
 const observed=values.filter(finite),minimum=Math.min(...observed),maximum=Math.max(...observed);
 const span=maximum-minimum;
 const points=sources.map((s,i)=>({
  id:s.id,at:s.at,address:s.address,stateId:s.stateId,decision:s.decision,
  value:values[i],index:i,x:32+(576*i)/(sources.length-1),
  y:values[i]===null?null:190-(span===0?0.5:(values[i]-minimum)/span)*160
 }));
 const segments=[];
 for(let i=1;i<points.length;i++)if(points[i-1].y!==null&&points[i].y!==null)
  segments.push({from:points[i-1].id,to:points[i].id,
   x1:points[i-1].x,y1:points[i-1].y,x2:points[i].x,y2:points[i].y});
 return {schema:'OMEGA_VERIFIED_TRAJECTORY_EXPLORER_R727_V1',metricKey:requestedKey,
  metricKeys,points,segments,minimum,maximum,observedCount:observed.length,
  missingCount:points.length-observed.length,interpolated:false,
  sourceBound:true,canonicalMutation:false,physicalTimeMeasurement:false};
}
