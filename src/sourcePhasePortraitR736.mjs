// R736: two independently computed source-metric channels along one exact successor route.
// This is a discrete model-state phase portrait, never physical phase space or observed dynamics.
import {computeSourceRouteProfileR735} from './sourceRouteProfileR735.mjs';
import {ATLAS_FIELD_CHANNELS_R734} from './atlasFieldRasterR734.mjs';
export const SOURCE_PHASE_PORTRAIT_SCHEMA_R736='OMEGA_SOURCE_PHASE_PORTRAIT_R736_V1';
export function computeSourcePhasePortraitR736(field,start,xChannel='C',yChannel='q',limit=128){
 if(!Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,xChannel)||!Object.hasOwn(ATLAS_FIELD_CHANNELS_R734,yChannel))
  throw Error('R736 undeclared metric channel refused');
 if(xChannel===yChannel)throw Error('R736 requires distinct source metric axes');
 const x=computeSourceRouteProfileR735(field,start,xChannel,limit);
 const y=computeSourceRouteProfileR735(field,start,yChannel,limit);
 if(x.steps.length!==y.steps.length||x.cycleStart!==y.cycleStart||x.continuationAddress!==y.continuationAddress)
  throw Error('R736 source-route channel mismatch');
 const dx=x.maximum-x.minimum,dy=y.maximum-y.minimum;
 const points=x.steps.map((step,i)=>{
  if(step.address!==y.steps[i].address||step.nextAddress!==y.steps[i].nextAddress)
   throw Error('R736 source-route address mismatch');
  return {index:i,address:step.address,nextAddress:step.nextAddress,
   xValue:step.value,yValue:y.steps[i].value,
   xNormalized:dx===0?0.5:(step.value-x.minimum)/dx,
   yNormalized:dy===0?0.5:(y.steps[i].value-y.minimum)/dy,
   cycleMember:x.cycleStart!==null&&i>=x.cycleStart};
 });
 const edges=points.slice(1).map((p,i)=>({from:i,to:i+1,cycleEdge:x.cycleStart!==null&&i>=x.cycleStart}));
 // A closing edge is valid only when the source successor was actually encountered.
 if(x.cycleStart!==null&&points.length)edges.push({from:points.length-1,to:x.cycleStart,cycleEdge:true});
 return {schema:SOURCE_PHASE_PORTRAIT_SCHEMA_R736,start,xChannel,yChannel,
  xLabel:ATLAS_FIELD_CHANNELS_R734[xChannel],yLabel:ATLAS_FIELD_CHANNELS_R734[yChannel],
  xMinimum:x.minimum,xMaximum:x.maximum,yMinimum:y.minimum,yMaximum:y.maximum,
  points,edges,cycleStart:x.cycleStart,cyclePeriod:x.cyclePeriod,
  truncated:x.truncated,continuationAddress:x.continuationAddress,
  sourceBound:true,canonicalMutation:false,physicalMeasurement:false,
  boundary:'Normalized axes are independent source-channel min/max over the bounded exact successor route. Not physical phase space, physical time, empirical motion or historical donor parity.'};
}
