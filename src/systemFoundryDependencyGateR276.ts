import type {CompiledCapability} from './systemFoundryR268';

const PREFIX='DEPENDENCY_BLOCKED:';

export function propagateDependencyBlocksR276(frontier:CompiledCapability[]):CompiledCapability[]{
 let current=frontier.map(capability=>({...capability,blockers:[...capability.blockers]}));
 let changed=true;
 while(changed){
  changed=false;
  const byId=new Map(current.map(capability=>[capability.id,capability]));
  current=current.map(capability=>{
   const propagated=(capability.dependsOn||[])
    .filter(id=>byId.get(id)?.status==='BLOCKED')
    .sort()
    .map(id=>`${PREFIX}${id}`);
   if(!propagated.length)return capability;
   const blockers=[...new Set([...capability.blockers,...propagated])];
   const same=blockers.length===capability.blockers.length&&blockers.every((blocker,index)=>blocker===capability.blockers[index]);
   if(capability.status==='BLOCKED'&&same&&capability.executor===null)return capability;
   changed=true;
   return {...capability,status:'BLOCKED' as const,executor:null,blockers};
  });
 }
 return current;
}

export const FOUNDRY_DEPENDENCY_GATE_BOUNDARY_R276={
 revision:'R276',
 failClosed:true,
 timing:'after direct evidence/executor gates and after R239 device-resource overlay',
 rule:'a capability with any declared dependency currently BLOCKED is also BLOCKED',
 blockerFormat:'DEPENDENCY_BLOCKED:<capability-id>',
 directBlockers:'preserved; propagation is additive and never clears evidence/resource blockers',
 cycleSafety:'fixed-point propagation terminates when no blocker/status changes remain',
 authority:'classification only; no polling, dispatch, execution, evidence acquisition, source mutation, CanonState admission or deployment authority'
} as const;
