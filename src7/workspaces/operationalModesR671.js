// R671: operational mode execution over canonical OMEGA 20,736-address packets.
// Reuses existing R651 (woven carry), R652 (mode symmetry), R653 (single frame).
// No new physics, no mutation of source field, no manufactured evidence.
import {runContinuityFrameR653} from '../../src/continuity/frameRuntimeR653.js';
import {heightenedSequence} from '../../src/continuity/wovenFieldR651.js';
import {modeNamesR652} from '../../src/continuity/modeSymmetryR652.js';

export const R671_SCHEMA='OMEGA7_CANONICAL_MODE_EXECUTION_R671';
export const R671_MODES=modeNamesR652;
export const R671_MODE_AUTHORITIES=Object.freeze([
 {id:'R651',operation:'WOVEN_CARRY',source:'src/continuity/wovenFieldR651.js'},
 {id:'R652',operation:'SYMMETRY_ASYMMETRY_LENS',source:'src/continuity/modeSymmetryR652.js'},
 {id:'R653',operation:'CONSERVATIVE_CANONICAL_FRAME',source:'src/continuity/frameRuntimeR653.js'},
 {id:'R457',operation:'HEIGHTENED_DEVELOPMENTAL_GOVERNANCE',source:'src7/heightenedModeR457.ts',status:'EXTERNAL_PROOF_REQUIRED'},
 {id:'R21',operation:'179_MODE_SOURCE_CATALOG_AND_IMPLEMENTED_OPERATORS',source:'src/sourceBackedModeRuntimeR21.ts',status:'EXECUTION_CLASS_PER_ROW'}
]);
const finite=(value,name)=>{if(typeof value!=='number'||!Number.isFinite(value))throw Error('R671 non-finite '+name);return value};
const unit=(value,name)=>Math.min(1,Math.max(0,finite(value,name)));
export function evaluateOperationalModesR671(field,address,mode='TRANSPORT',maxSteps=10){
 if(!field||field.count!==20736||!field.routeNext||!field.C||!field.Phi||!field.q||!field.Lambda||!field.scar||!field.evidence||!field.continuityGate)throw Error('R671 requires the canonical 20736-state field');
 for(const key of ['routeNext','C','Phi','q','Lambda','scar','evidence','continuityGate'])if(field[key].length!==field.count)throw Error('R671 malformed '+key+' field length');
 if(!Number.isInteger(address)||address<0||address>=field.count)throw Error('R671 invalid canonical address');
 if(!R671_MODES.includes(mode))throw Error('R671 unknown executable mode');
 if(!Number.isInteger(maxSteps)||maxSteps<4||maxSteps>24)throw Error('R671 bounded traversal required');
 const path=[],visited=new Set();let cursor=address,cycleTo=null;
 for(let k=0;k<maxSteps;k++){
  if(visited.has(cursor)){cycleTo=cursor;break}
  path.push(cursor);visited.add(cursor);
  const next=finite(Number(field.routeNext[cursor]),'route target');
  if(!Number.isInteger(next)||next<0||next>=field.count)throw Error('R671 route target out of bounds');
  cursor=next;
 }
 if(visited.has(cursor))cycleTo=cursor;
 const sourceNode=(i,id=String(i))=>({id,continuity:unit(Number(field.C[i]),'continuity'),plasticity:unit(Number(field.Phi[i]),'plasticity'),burden:Math.max(0,finite(Number(field.Lambda[i]),'burden')),contradiction:Math.max(0,finite(Number(field.q[i]),'contradiction')),scar:Math.max(0,finite(Number(field.scar[i]),'scar'))});
 const nodes=path.map(i=>sourceNode(i));
 const included=new Set(path),edges=[],typedResidue=[];
 for(const i of path){
  const to=Number(field.routeNext[i]);
  const gate=unit(Number(field.continuityGate[i]),'continuity gate'),evidence=unit(Number(field.evidence[i]),'evidence');
  if(!included.has(to))continue;
  const weight=Math.min(gate,evidence);
  const kind=gate===0?'BLOCKED':(path.indexOf(to)<=path.indexOf(i)?'RETURN':'INGRESS');
  edges.push({from:String(i),to:String(to),kind,weight});
  if(kind==='BLOCKED')typedResidue.push({from:i,to,reason:'ZERO_CANONICAL_CONTINUITY_GATE',weight:0});
 }
 const frame=runContinuityFrameR653({nodes,edges,step:0.1,mode});
 const diagnosticFrames=path.map(i=>[sourceNode(i,'OBSERVED_ROUTE_POSITION')]);
 const heightened=diagnosticFrames.length>=4?heightenedSequence(diagnosticFrames,1):null;
 const terminal=heightened?{velocity:heightened.velocity.at(-1)[0],acceleration:heightened.acceleration.at(-1)[0],jerk:heightened.jerk.at(-1)[0]}:null;
 const refs=path.map(i=>({address:i+1,stateIndex:i,continuity:Number(field.C[i]),plasticity:Number(field.Phi[i]),contradiction:Number(field.q[i]),burden:Number(field.Lambda[i]),scar:Number(field.scar[i]),next:Number(field.routeNext[i])+1}));
 return Object.freeze({schema:R671_SCHEMA,source:'src/mandala20736Runtime.ts',address,mode,states:path,sourceTrace:refs,cycleTo,edges,typedResidue,
  frame,developmental:{...terminal,derivativeBasis:'ORDERED_ROUTE_STEPS_NOT_PHYSICAL_TIME',status:terminal?'COMPUTED':'INSUFFICIENT_DISTINCT_STATES_FOR_JERK'},
  conservationResidual:frame.receipt.netContinuityDelta,modeProjectionChangedCanonical:false,canonicalMutation:false,
  executionProof:{class:'LOCAL_SOURCE_MODEL_EXECUTED',productionVerified:false,physicalModelValidated:false,sourceEvidence:'CANONICAL_FIELD_PACKET',gate:'DEPLOYMENT_AND_BROWSER_PROOF_REQUIRED'},
  orderRule:'READ_STATE -> TRACE_ADMITTED_ROUTE -> TYPED_CARRY -> NONMUTATING_MODE_PROJECTION -> HEIGHTENED_DIFFERENCE -> PROOF_GATE',
  boundary:'Address transitions and finite differences are canonical model operations, not measured elapsed physical time. Mode lenses alter projection, never source canonical packets.'});
}
