// R653: single canonical state -> transport -> mode lens -> replayable receipt.
// Does not claim historical native-runtime or empirical-physics parity.
import {evolveWovenField} from './wovenFieldR651.js';
import {symmetryProjectionR652} from './modeSymmetryR652.js';
export function runContinuityFrameR653({nodes,edges,pressure={},step=0.1,mode='TRANSPORT',alpha=0.5}={}){
 const evolved=evolveWovenField({nodes,edges,pressure,step});
 const projected=symmetryProjectionR652({nodes:evolved.nodes,edges,mode,alpha});
 if(evolved.nodes.length!==projected.nodes.length)throw Error('projection lost state');
 for(let i=0;i<evolved.nodes.length;i++){
  const a=evolved.nodes[i],b=projected.nodes[i];
  if(a.id!==b.id||a.continuity!==b.continuity||a.scar!==b.scar||a.contradiction!==b.contradiction)throw Error('projection modified canonical state');
 }
 const receipt={schema:'OMEGA_CONTINUITY_FRAME_RECEIPT_R653',truthClass:'LOCAL_EXECUTION_ONLY',mode,step,alpha,nodeCount:evolved.nodes.length,edgeCount:evolved.ledger.length,netContinuityDelta:evolved.netContinuityDelta,blockedEdges:evolved.ledger.filter(x=>x.kind==='BLOCKED').length,symmetricMass:projected.totals.symmetricMass,asymmetricMass:projected.totals.asymmetricMass};
 return {schema:'OMEGA_CONTINUITY_FRAME_R653',canonicalState:evolved.nodes,transportLedger:evolved.ledger,projection:projected,receipt};
}
