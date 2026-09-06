import r116,{OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';
import {withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {cortexApiR127} from './swarm/swarmCortexApiR127.js';
import {OmegaSwarmCortex} from './swarm/swarmCortexR127.js';

export {OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator,OmegaSwarmCortex};

export const R127_RUNTIME='OMEGA_R127_SYNAPTIC_ORGANISM_CORTEX';

export default{
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/swarm/cortex/'))return withSwarmCorsR121(await cortexApiR127(request,env,url),request);
  return r116.fetch(request,env);
 }
};
