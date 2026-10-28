import {replayInheritedDevelopmentR623} from './inheritedDevelopmentReplayR623.mjs';

export const DEFAULT_SCENARIO_R706 = Object.freeze({
  schema:'OMEGA_RELATIONAL_SCENARIO_R706',
  nodes:[{id:'A',continuity:0.8,scar:0.15,contradiction:0.1,plasticity:1},{id:'B',continuity:0.2,scar:0,contradiction:0,plasticity:1}],
  edgeFrames:[
    [{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.3}],
    [{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.3}],
    [{from:'A',to:'B',kind:'INGRESS',weight:0.5},{from:'B',to:'A',kind:'RETURN',weight:0.3}]
  ],step:0.2,mode:'STABILIZE',alpha:0.5
});
const kinds=new Set(['INGRESS','EGRESS','BLOCKED','RESIDUE','RETURN']);
const modes=new Set(['STABILIZE','TRANSPORT','EXPLORE','HEIGHTENED','PROOF']);
const own=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys,label)=>{if(!own(x)||Object.keys(x).some(k=>!keys.includes(k)))throw Error('R706 invalid '+label+' fields');};
const finite=(x,label,min,max)=>{if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max)throw Error('R706 invalid '+label);return x;};
export function normalizeScenarioR706(input){
 exact(input,['schema','nodes','edgeFrames','step','mode','alpha'],'scenario');
 if(input.schema!==undefined&&input.schema!=='OMEGA_RELATIONAL_SCENARIO_R706')throw Error('R706 unsupported scenario schema');
 if(!Array.isArray(input.nodes)||input.nodes.length<1||input.nodes.length>12)throw Error('R706 nodes must be 1..12');
 const ids=new Set();
 const nodes=input.nodes.map(n=>{
  exact(n,['id','continuity','burden','scar','contradiction','plasticity'],'node');
  if(typeof n.id!=='string'||!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(n.id)||ids.has(n.id))throw Error('R706 invalid or duplicate node id');
  ids.add(n.id);
  return {id:n.id,continuity:finite(n.continuity,'continuity',0,1),burden:finite(n.burden??0,'burden',0,1e6),scar:finite(n.scar??0,'scar',0,1e6),contradiction:finite(n.contradiction??0,'contradiction',0,1e6),plasticity:finite(n.plasticity??1,'plasticity',0,1)};
 });
 if(!Array.isArray(input.edgeFrames)||input.edgeFrames.length<3||input.edgeFrames.length>12)throw Error('R706 requires 3..12 transport frames');
 const edgeFrames=input.edgeFrames.map(edges=>{
  if(!Array.isArray(edges)||edges.length>48)throw Error('R706 frame exceeds 48 edges');
  return edges.map(e=>{
   exact(e,['from','to','kind','weight'],'edge');
   if(!ids.has(e.from)||!ids.has(e.to)||!kinds.has(e.kind))throw Error('R706 invalid edge endpoint or kind');
   return {from:e.from,to:e.to,kind:e.kind,weight:finite(e.weight??1,'edge weight',0,1)};
  });
 });
 const step=finite(input.step??0.2,'step',Number.MIN_VALUE,1);
 const alpha=finite(input.alpha??0.5,'alpha',0,1);
 const mode=input.mode??'TRANSPORT';
 if(!modes.has(mode))throw Error('R706 invalid projection mode');
 return {schema:'OMEGA_RELATIONAL_SCENARIO_R706',nodes,edgeFrames,step,mode,alpha};
}
export function parseScenarioR706(text){
 if(typeof text!=='string'||text.length>24000)throw Error('R706 scenario text exceeds bounded input');
 return normalizeScenarioR706(JSON.parse(text));
}
export function exportScenarioR706(input){return JSON.stringify(normalizeScenarioR706(input),null,2);}
export function replayScenarioR706(input){
 const scenario=normalizeScenarioR706(input);
 const result=replayInheritedDevelopmentR623(scenario);
 const initial=result.history[0],final=result.history.at(-1);
 return {scenario,canonicalHistory:result.history,developmental:result.developmental,proof:result.proof,
  summary:{truthClass:result.truthClass,frames:scenario.edgeFrames.length,nodes:scenario.nodes.length,
   changes:initial.map((node,i)=>({id:node.id,continuityBefore:node.continuity,continuityAfter:final[i].continuity,
    continuityDelta:final[i].continuity-node.continuity,scarBefore:node.scar,scarAfter:final[i].scar,
    contradictionBefore:node.contradiction,contradictionAfter:final[i].contradiction})),
   boundary:'Local source-model replay; neither canonical admission nor physical or historical parity proof.'}};
}
