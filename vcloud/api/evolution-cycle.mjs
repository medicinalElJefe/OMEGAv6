import { inspectCycle, proposeCycle, promoteGreenVCloudPr } from '../lib/github-machine.mjs';

const json=(body,status=200)=>new Response(`${JSON.stringify(body,null,2)}\n`,{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

async function github(token,path,init={}){
  const r=await fetch(`https://api.github.com${path}`,{...init,headers:{accept:'application/vnd.github+json',authorization:`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'omega-vcloud-evolution-cycle',...(init.headers||{})}});
  const text=await r.text(); let body; try{body=text?JSON.parse(text):null}catch{body=text}
  if(!r.ok)throw new Error(`GitHub ${r.status}: ${typeof body==='string'?body:JSON.stringify(body)}`); return body;
}

export async function GET(request){
  const secret=process.env.CRON_SECRET;
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return json({ok:false,error:'UNAUTHORIZED'},401);
  const token=process.env.OMEGA_GITHUB_TOKEN;
  if(!token)return json({ok:false,error:'OMEGA_GITHUB_TOKEN_REQUIRED'},503);
  const repo=process.env.OMEGA_GITHUB_REPO||'medicinalElJefe/OMEGAv6';
  const runtimeBase=process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev';
  try{
    const open=await github(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);
    const vcloud=(open||[]).filter(pr=>String(pr.head?.ref||'').startsWith('vcloud/evolution-')).sort((a,b)=>a.number-b.number);
    if(vcloud.length>1)return json({ok:false,state:'BLOCKED',reason:'multiple open VCloud evolution PRs require review',prs:vcloud.map(x=>x.number)},409);
    if(vcloud.length===1){
      const promotion=await promoteGreenVCloudPr({token,repo,prNumber:vcloud[0].number});
      return json({ok:true,state:promotion.action==='MERGED_GREEN_EXACT_HEAD'?'PROMOTED':'HELD_FOR_PROOF',promotion});
    }
    const proposal=await proposeCycle({token,repo,runtimeBase});
    return json({ok:true,state:proposal.mutation==='BRANCH_AND_PR_CREATED'?'PROPOSED':'OBSERVE_ONLY',proposal:{mainSha:proposal.mainSha,mutation:proposal.mutation,decision:proposal.decision,branch:proposal.branch||null,prNumber:proposal.prNumber||null,prUrl:proposal.prUrl||null,capsuleId:proposal.capsuleId||null}});
  }catch(error){
    return json({ok:false,state:'FAILED_CLOSED',error:error instanceof Error?error.message:String(error)},500);
  }
}

export async function POST(request){
  const secret=process.env.CRON_SECRET;
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return json({ok:false,error:'UNAUTHORIZED'},401);
  const token=process.env.OMEGA_GITHUB_TOKEN;
  if(!token)return json({ok:false,error:'OMEGA_GITHUB_TOKEN_REQUIRED'},503);
  const repo=process.env.OMEGA_GITHUB_REPO||'medicinalElJefe/OMEGAv6';
  const runtimeBase=process.env.OMEGA_PUBLIC_URL||'https://omegav6.jeffdeweyeljefe.workers.dev';
  const mode=new URL(request.url).searchParams.get('mode')||'inspect';
  try{
    if(mode==='inspect')return json({ok:true,inspection:await inspectCycle({token,repo,runtimeBase})});
    if(mode==='propose')return json({ok:true,proposal:await proposeCycle({token,repo,runtimeBase})});
    if(mode==='promote'){
      const prNumber=Number(new URL(request.url).searchParams.get('pr'));
      if(!Number.isInteger(prNumber)||prNumber<1)return json({ok:false,error:'VALID_PR_REQUIRED'},400);
      return json({ok:true,promotion:await promoteGreenVCloudPr({token,repo,prNumber})});
    }
    return json({ok:false,error:'UNKNOWN_MODE'},400);
  }catch(error){return json({ok:false,state:'FAILED_CLOSED',error:error instanceof Error?error.message:String(error)},500);}
}
