/**
 * R813 independent read-only production verifier.
 * Caller supplies the trusted production URL and GitHub credentials via environment.
 * No repository write, workflow dispatch, promotion, or Canon authority.
 */
const SHA=/^[a-f0-9]{40}$/;
const SAFE_REPO=/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const shaOf=(value)=>typeof value==='string'&&SHA.test(value)?value:null;
const validRun=(run,expected)=>run&&run.head_sha===expected&&run.status==='completed'&&run.conclusion==='success'&&
 ['push','workflow_dispatch'].includes(run.event)&&run.head_branch==='main'&&Number.isSafeInteger(run.id)&&run.id>0;
export async function verifyIndependentProductionR813({
 expectedSha,repository,productionUrl,token,fetchImpl=fetch,verifyBrowser,timeoutMs=12000
}={}){
 const fail=(reason)=>({verified:false,reason});
 if(!shaOf(expectedSha))return fail('INVALID_EXPECTED_SHA');
 if(!SAFE_REPO.test(String(repository||'')))return fail('INVALID_REPOSITORY');
 if(typeof token!=='string'||!token.trim())return fail('GITHUB_TOKEN_REQUIRED');
 let target;
 try{target=new URL(productionUrl)}catch{return fail('INVALID_PRODUCTION_URL')}
 if(target.protocol!=='https:'||target.username||target.password||target.search||target.hash||target.pathname!=='/'||
  !/^[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(target.hostname))return fail('UNTRUSTED_PRODUCTION_URL');
 if(!Number.isInteger(timeoutMs)||timeoutMs<1000||timeoutMs>30000)return fail('INVALID_TIMEOUT');
 const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
 const get=async(url,init={})=>{
  const response=await fetchImpl(url,{...init,redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
  if(!response.ok)throw Error('HTTP_'+response.status);
  return response.json();
 };
 try{
  const runs=await get('https://api.github.com/repos/'+repository+'/actions/runs?head_sha='+expectedSha+'&per_page=100',{headers});
  const run=(Array.isArray(runs.workflow_runs)?runs.workflow_runs:[]).find(r=>validRun(r,expectedSha));
  if(!run)return fail('NO_SUCCESSFUL_EXACT_MAIN_WORKFLOW_RUN');
  const deployment=await get(target.href,{headers:{Accept:'application/json','Cache-Control':'no-cache'}});
  // Explicit identity contract: never infer SHA from HTML, package versions, or manifest claims.
  const live=shaOf(deployment?.gitSha)||shaOf(deployment?.commitSha);
  if(live!==expectedSha)return fail('LIVE_RUNTIME_SHA_MISMATCH_OR_ABSENT');
  if(deployment?.production!==true)return fail('LIVE_PRODUCTION_IDENTITY_ABSENT');
  // A JSON flag from the Worker cannot independently prove browser behavior.
  if(typeof verifyBrowser!=='function')return fail('INDEPENDENT_BROWSER_VERIFIER_REQUIRED');
  const browser=await verifyBrowser({url:target.href,expectedSha,timeoutMs});
  if(browser?.verified!==true||browser?.observedSha!==expectedSha||browser?.origin!==target.origin)return fail('INDEPENDENT_BROWSER_PROOF_FAILED');
  return{verified:true,source:'GITHUB_CI_AND_LIVE_WORKER',exactPromotedSha:expectedSha,
   liveRuntimeSha:live,productionBrowserVerified:true,githubRunConclusion:'success',githubRunId:run.id};
 }catch(e){return fail('INDEPENDENT_PRODUCTION_QUERY_FAILED:'+String(e?.message||e))}
}
