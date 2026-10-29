import {normalizeScenarioR706,replayScenarioR706,exportScenarioR706} from './relationalScenarioWorkbenchR706.mjs';
import {projectWovenTopologyR707,exportWovenTopologySvgR707} from './wovenTopologyProjectionR707.mjs';
import {traceWovenRouteR709} from './wovenRouteContinuityR709.mjs';
import {inspectWovenEdgeResilienceR710} from './wovenEdgeResilienceR710.mjs';

// R711 composes existing source executors into one reproducible session.
// This is a bounded local computational session, not a native GPU/world reconstruction.
export function executeComputationalSessionR711(input,{origin,target,mirrored=false}={}){
 const scenario=normalizeScenarioR706(input);
 const ids=scenario.nodes.map(n=>n.id);
 const from=origin??ids[0],to=target??ids.at(-1);
 if(!ids.includes(from)||!ids.includes(to))throw Error('R711 endpoints must belong to source scenario');
 if(typeof mirrored!=='boolean')throw Error('R711 reflection must be boolean');
 const replay=replayScenarioR706(scenario);
 const continuity=traceWovenRouteR709(scenario,from,to,mirrored);
 const frames=Array.from({length:scenario.edgeFrames.length},(_,frameIndex)=>{
  const projection=projectWovenTopologyR707(scenario,frameIndex,mirrored);
  return {frameIndex,projection,svg:exportWovenTopologySvgR707(scenario,frameIndex,mirrored),
   resilience:inspectWovenEdgeResilienceR710(projection,from,to)};
 });
 return {schema:'OMEGA_COMPUTATIONAL_SESSION_R711',truthClass:'LOCAL_SOURCE_EXECUTION_ONLY',
  sourceScenario:scenario,sourceJson:exportScenarioR706(scenario),origin:from,target:to,mirrored,
  sessionJson:JSON.stringify({schema:'OMEGA_COMPUTATIONAL_SESSION_INPUT_R711',scenario,origin:from,target:to,mirrored}),
  replay,continuity,frames,
  boundary:'Composed deterministic R706/R707/R709/R710 source execution. No historical AG-009 equation parity, CanonState admission, native GPU, empirical prediction or production acceptance is implied.'};
}
export function restoreComputationalSessionR711(serialized){
 if(typeof serialized!=='string'||serialized.length>24000)throw Error('R711 serialized session exceeds limit');
 const envelope=JSON.parse(serialized);
 if(envelope===null||typeof envelope!=='object'||Array.isArray(envelope)||
  envelope.schema!=='OMEGA_COMPUTATIONAL_SESSION_INPUT_R711'||
  Object.keys(envelope).some(k=>!['schema','scenario','origin','target','mirrored'].includes(k)))throw Error('R711 unsupported session envelope');
 return executeComputationalSessionR711(envelope.scenario,{origin:envelope.origin,target:envelope.target,mirrored:envelope.mirrored});
}
