import {runContinuityFrameR653} from './continuity/frameRuntimeR653.js';
import {heightenedSequence} from './continuity/wovenFieldR651.js';

/** Run the inherited state transition, then derive Heightened Mode from its real states.
 *  No parallel transport law or replacement canonical authority is introduced.
 */
export function replayInheritedDevelopmentR623({nodes,edgeFrames,step=0.1,mode='TRANSPORT',alpha=0.5}={}){
 if(!Array.isArray(nodes)||!nodes.length||!Array.isArray(edgeFrames)||edgeFrames.length<3)throw Error('at least three transport frames are required for jerk');
 const history=[nodes],receipts=[],projections=[];
 let current=nodes;
 for(const [index,edges] of edgeFrames.entries()){
  const frame=runContinuityFrameR653({nodes:current,edges,step,mode,alpha});
  if(frame.receipt.truthClass!=='LOCAL_EXECUTION_ONLY')throw Error('unexpected receipt authority');
  current=frame.canonicalState;
  history.push(current);
  receipts.push({...frame.receipt,index});
  projections.push(frame.projection);
 }
 const developmental=heightenedSequence(history,step);
 const identity=history[0].map(x=>x.id).join('\0');
 if(history.some(h=>h.map(x=>x.id).join('\0')!==identity))throw Error('state identity changed during inherited transport');
 return {schema:'OMEGA_INHERITED_DEVELOPMENT_REPLAY_R623',truthClass:'LOCAL_EXECUTION_ONLY',
  history,receipts,projections,developmental,
  proof:{sourceKernel:'R651',frameRuntime:'R653',derivativeOperator:'R651.heightenedSequence',frames:edgeFrames.length,
    liveRuntimeVerified:false,historicalParityVerified:false},
  boundary:'Projection cannot be promoted to canonical state; model execution is not physical dimensional or production proof.'};
}
