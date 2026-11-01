import {V9_MODELS,compositionDefect,rotatedReturnDefect,equivarianceCertificate,DEWEY_V9_BOUNDARY} from './deweyTemporalRotationV9.js';
export const TEMPORAL_WORKBENCH_SCHEMA_V9='omega.dewey-v9.temporal-workbench.v1';
const bounded=(raw,lo,hi,label)=>{
 if(typeof raw!=='string'||!(/^-?(0|[1-9][0-9]*)$/).test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)<lo||Number(raw)>hi)throw Error(label+' must be an integer from '+lo+' to '+hi);
 return Number(raw);
};
export function computeTemporalWorkbenchV9(modelName,xRaw,yRaw,tRaw,qRaw){
 if(!Object.prototype.hasOwnProperty.call(V9_MODELS,modelName))throw Error('Unsupported research model');
 const x=bounded(xRaw,-20,20,'x'),y=bounded(yRaw,-20,20,'y');
 const t=bounded(tRaw,0,16,'time'),q=bounded(qRaw,-16,16,'quarter turns');
 const model=V9_MODELS[modelName];
 return {schema:TEMPORAL_WORKBENCH_SCHEMA_V9,modelName,initialState:[x,y],timeSteps:t,quarterTurns:q,
  composition:compositionDefect(model,[x,y],t,q),
  rotatedReturn:rotatedReturnDefect(model,[x,y],t,q),
  equivariance:equivarianceCertificate(model),
  boundary:DEWEY_V9_BOUNDARY,source:'DECLARED_INTEGER_LINEAR_MODEL_ONLY',productionAuthority:false,physicalMeasurement:false};
}
export function verifyTemporalWorkbenchV9(raw){
 if(typeof raw!=='string'||raw.length>8192)throw Error('V9 import size refused');
 let packet;try{packet=JSON.parse(raw)}catch{throw Error('V9 invalid JSON')}
 if(!packet||packet.schema!==TEMPORAL_WORKBENCH_SCHEMA_V9||!Array.isArray(packet.initialState)||packet.initialState.length!==2)throw Error('V9 schema refused');
 const [x,y]=packet.initialState;
 if(![x,y,packet.timeSteps,packet.quarterTurns].every(Number.isSafeInteger))throw Error('V9 exact integer fields required');
 const expected=computeTemporalWorkbenchV9(String(packet.modelName),String(x),String(y),String(packet.timeSteps),String(packet.quarterTurns));
 if(JSON.stringify(packet)!==JSON.stringify(expected))throw Error('V9 imported packet differs from fresh computation');
 return expected;
}
