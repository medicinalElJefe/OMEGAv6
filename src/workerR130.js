import r116,{OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator} from './workerR116.js';
import {withSwarmCorsR121} from './swarm/swarmApiR121.js';
import {cortexApiR130} from './swarm/swarmCortexApiR130.js';
import {OmegaSwarmCortexR130} from './swarm/swarmCortexR130.js';

export {OmegaRuntime,OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator,OmegaSwarmCortexR130};
export const R130_RUNTIME='OMEGA_R130_MAX_CAPACITY_ORGANISM';

export default{
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/swarm/cortex/'))return withSwarmCorsR121(await cortexApiR130(request,env,url),request);
  return r116.fetch(request,env);
 }
};
