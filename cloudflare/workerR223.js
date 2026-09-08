import {inspectCycle,proposeCycle,promoteGreenCloudPr,runAutonomousCycle} from './lib/github-machine.mjs';
import {MACHINE_ID} from './lib/evolution-policy.mjs';

const json=(body,status=200)=>new Response(`${JSON.stringify(body,null,2)}\n`,{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const repoOf=env=>env.OMEGA_GITHUB_REPO||'medicinalElJefe/OMEGAv6';
const runtimeOf=env=>env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev';

async function execute(mode,env,url){
  const token=env.OMEGA_GITHUB_TOKEN;
  if(!token)return{ok:false,state:'FAILED_CLOSED',error:'OMEGA_GITHUB_TOKEN_REQUIRED'};
  const repo=repoOf(env),runtimeBase=runtimeOf(env);
  if(mode==='cycle')return runAutonomousCycle({token,repo,runtimeBase});
  if(mode==='inspect')return{ok:true,inspection:await inspectCycle({token,repo,runtimeBase})};
  if(mode==='propose')return{ok:true,proposal:await proposeCycle({token,repo,runtimeBase})};
  if(mode==='promote'){
    const prNumber=Number(url.searchParams.get('pr'));
    if(!Number.isInteger(prNumber)||prNumber<1)return{ok:false,error:'VALID_PR_REQUIRED'};
    return{ok:true,promotion:await promoteGreenCloudPr({token,repo,prNumber})};
  }
  return{ok:false,error:'UNKNOWN_MODE'};
}

export default{
  async scheduled(_controller,env,ctx){
    ctx.waitUntil((async()=>{
      try{const result=await execute('cycle',env,new URL('https://cloud-01.invalid/'));console.log(JSON.stringify({schema:'OMEGA_CLOUDFLARE_EVOLUTION_PULSE_R223',machineId:MACHINE_ID,...result}))}
      catch(error){console.error(JSON.stringify({schema:'OMEGA_CLOUDFLARE_EVOLUTION_PULSE_R223',machineId:MACHINE_ID,ok:false,state:'FAILED_CLOSED',error:error instanceof Error?error.message:String(error)}))}
    })());
  },
  async fetch(request,env){
    const secret=env.OMEGA_CRON_SECRET;
    if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return json({ok:false,machineId:MACHINE_ID,error:'UNAUTHORIZED'},401);
    const url=new URL(request.url);const mode=url.searchParams.get('mode')||(request.method==='GET'?'cycle':'inspect');
    try{const result=await execute(mode,env,url);return json({machineId:MACHINE_ID,...result},result.ok===false&&result.error==='OMEGA_GITHUB_TOKEN_REQUIRED'?503:200)}
    catch(error){return json({ok:false,machineId:MACHINE_ID,state:'FAILED_CLOSED',error:error instanceof Error?error.message:String(error)},500)}
  }
};
