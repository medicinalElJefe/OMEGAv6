// R626: capability-graph -> Genesis observation adapter, read-only and fail-closed.
// Caller must supply records extracted from a separately verified canonical registry.
// This adapter neither discovers the registry nor grants execution authority.
import {createHash} from 'node:crypto';
import {ingestObservation,initializeCycle,type GenesisCycle} from './cycleR607';
import type {Observation,Truth} from './kernelR606';
export type CapabilityRecord={
 id:string;lineage:string;function:string;strongestImplementation:string;
 evidenceIds:string[];truthClass:Truth;dependencies:string[];
 currentExecutor:string|null;presentationSurface:string|null;remainingGap:string[];
 supersedes:string[];sourceDigest:string
};
export type CapabilityBridge={cycle:GenesisCycle;accepted:string[];held:{id:string;reasons:string[]}[];dependencyEdges:{from:string;to:string}[]};
const hex=/^[a-f0-9]{64}$/;
export function bridgeCapabilityRecords(cycleId:string,records:readonly CapabilityRecord[],at:string,source:string,consent:string):CapabilityBridge{
 if(!Number.isFinite(Date.parse(at))||!source.trim()||!consent.trim())throw Error('valid provenance required');
 const cycle=initializeCycle(cycleId),accepted:string[]=[],held:{id:string;reasons:string[]}[]=[],dependencyEdges:{from:string;to:string}[]=[];
 const ids=new Set<string>(),index=new Set(records.map(r=>r.id));
 let current=cycle;
 for(const r of records){
  const reasons:string[]=[];
  if(!r.id.trim()||ids.has(r.id))reasons.push('missing or duplicate capability identity');
  ids.add(r.id);
  if(!r.lineage.trim()||!r.function.trim()||!r.strongestImplementation.trim())reasons.push('incomplete capability lineage');
  if(!hex.test(r.sourceDigest)||!r.evidenceIds.length)reasons.push('unproven source digest or missing evidence');
  if(!['OBSERVED','INFERRED','HYPOTHESIS','VERIFIED','REJECTED'].includes(r.truthClass))reasons.push('invalid truth class');
  if(r.dependencies.some(d=>!index.has(d)||d===r.id))reasons.push('missing or self dependency');
  if(r.supersedes.some(d=>d===r.id))reasons.push('self supersession');
  if(reasons.length){held.push({id:r.id,reasons});continue;}
  const observation:Observation={
   id:'cap:'+r.id,source,timestamp:at,truth:r.truthClass,consent,uncertainty:r.truthClass==='VERIFIED'?0:r.truthClass==='OBSERVED'?0.25:1,
   value:{identity:r.id,lineage:r.lineage,function:r.function,strongestImplementation:r.strongestImplementation,
    evidenceIds:[...r.evidenceIds],dependencies:[...r.dependencies],currentExecutor:r.currentExecutor,
    presentationSurface:r.presentationSurface,remainingGap:[...r.remainingGap],supersedes:[...r.supersedes],
    sourceDigest:r.sourceDigest,recordDigest:createHash('sha256').update(JSON.stringify(r)).digest('hex')}
  };
  current=ingestObservation(current,observation);accepted.push(r.id);
  for(const dependency of r.dependencies)dependencyEdges.push({from:r.id,to:dependency});
 }
 return {cycle:current,accepted,held,dependencyEdges};
}
export const CAPABILITY_BRIDGE_AUTHORITY='READ_ONLY_NO_CANONICAL_WRITE_NO_EXECUTION' as const;
