import r116,{OmegaRuntime as OmegaRuntimeR116} from './workerR116.js';
import {swarmApiR121,withSwarmCorsR121} from './swarm/swarmApiR121.js';
export {OmegaSwarmCell} from './swarm/swarmCellR121.js';
export {OmegaSwarmCoordinator} from './swarm/swarmCoordinatorR121.js';

const REVISION='R121';
async function fetchR121(request,env){const url=new URL(request.url);if(url.pathname.startsWith('/api/swarm/'))return withSwarmCorsR121(await swarmApiR121(request,env,url),request);const response=await r116.fetch(request,env);const headers=new Headers(response.headers);headers.set('x-omega-runtime-successor',REVISION);headers.set('x-omega-swarm-runtime',REVISION);return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}
export class OmegaRuntime extends OmegaRuntimeR116{}
export default{async fetch(request,env){return fetchR121(request,env)}};
