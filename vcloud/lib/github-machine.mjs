import { decideCycle, AUTHORITY_BOUNDARIES } from './evolution-policy.mjs';
import { capsuleBody } from './generated-capsules.mjs';

const API='https://api.github.com';
const enc=value=>Buffer.from(String(value),'utf8').toString('base64');
const dec=value=>Buffer.from(String(value||'').replace(/\n/g,''),'base64').toString('utf8');

function headers(token){return {'accept':'application/vnd.github+json','authorization':`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'omega-vcloud-evolution-machine'};}
async function gh(token,path,init={}){
  const response=await fetch(`${API}${path}`,{...init,headers:{...headers(token),...(init.headers||{})}});
  const text=await response.text(); let body=null; try{body=text?JSON.parse(text):null}catch{body=text}
  if(!response.ok)throw new Error(`GitHub ${init.method||'GET'} ${path} -> ${response.status}: ${typeof body==='string'?body:JSON.stringify(body)}`);
  return body;
}
async function getRepoFile(token,repo,path,ref){
  const body=await gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(ref)}`);
  return {sha:body.sha,text:dec(body.content),json:JSON.parse(dec(body.content))};
}
async function putRepoFile(token,repo,path,branch,message,content,sha){
  const payload={message,content:enc(content),branch}; if(sha)payload.sha=sha;
  return gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
}
async function liveJson(base,path){
  const r=await fetch(`${base.replace(/\/$/,'')}${path}?vcloud_cycle=${Date.now()}`,{headers:{'cache-control':'no-cache'}});
  const text=await r.text(); if(!r.ok)throw new Error(`${path} HTTP ${r.status}: ${text.slice(0,300)}`); return JSON.parse(text);
}

export async function inspectCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase='https://omegav6.jeffdeweyeljefe.workers.dev'}){
  const main=await gh(token,`/repos/${repo}/branches/main`); const mainSha=main.commit.sha;
  const runs=await gh(token,`/repos/${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&per_page=30`);
  const productionProof=(runs.workflow_runs||[]).find(r=>r.head_sha===mainSha&&r.status==='completed'&&r.conclusion==='success')||null;
  const stateFile=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',mainSha);
  const refs=await gh(token,`/repos/${repo}/git/matching-refs/heads/selfbuild/r170-`);
  const candidates=[];
  for(const ref of refs||[]){
    const branch=String(ref.ref||'').replace(/^refs\/heads\//,'');
    try{const candidate=await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch);candidates.push({...candidate.json,branch,headSha:ref.object?.sha||null});}
    catch(error){candidates.push({branch,headSha:ref.object?.sha||null,unreadable:true,error:String(error)});}
  }
  const [coreHealth,releaseEvidence,runtimeAttestation,hybrid]=await Promise.all([
    liveJson(runtimeBase,'/api/core-health'),liveJson(runtimeBase,'/api/release-evidence'),liveJson(runtimeBase,'/api/runtime-attestation'),liveJson(runtimeBase,'/api/hybrid/status')
  ]);
  const decision=decideCycle({currentMainSha:mainSha,productionProofGreen:Boolean(productionProof),state:stateFile.json,candidates,evidence:{coreHealth,releaseEvidence,runtimeAttestation,hybrid}});
  return {mainSha,productionProof,state:stateFile.json,candidates,evidence:{coreHealth,releaseEvidence,runtimeAttestation,hybrid},decision};
}

export async function proposeCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase}){
  const inspection=await inspectCycle({token,repo,runtimeBase});
  if(inspection.decision.action!=='PROPOSE')return {...inspection,mutation:'NONE'};
  const {mainSha,state,decision}=inspection; const capsule=decision.capsule; const generation=Number(state.generation||0)+1;
  const branch=`vcloud/evolution-g${generation}-${capsule.id.toLowerCase()}-${mainSha.slice(0,10)}`;
  await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
  await putRepoFile(token,repo,capsule.target,branch,`VCloud evolution g${generation}: ${capsule.id}`,capsuleBody(capsule.id));
  const stateOnBranch=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
  const receipt={schema:'OMEGA_VCLOUD_EVOLUTION_RECEIPT_R223',generation,capsuleId:capsule.id,target:capsule.target,baseSha:mainSha,branch,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false,createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
  const nextState={...stateOnBranch.json,generation,currentCapsuleId:capsule.id,receipts:[...(stateOnBranch.json.receipts||[]),receipt].slice(-64)};
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Bind VCloud evolution receipt g${generation}`,`${JSON.stringify(nextState,null,2)}\n`,stateOnBranch.sha);
  const candidate={schema:'OMEGA_VCLOUD_EVOLUTION_CANDIDATE_R223',revision:'R223',capsule,receipt,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false};
  let candidateSha=null; try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record VCloud candidate g${generation}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
  const recheck=await gh(token,`/repos/${repo}/branches/main`); if(recheck.commit.sha!==mainSha)throw new Error(`main drifted from ${mainSha} to ${recheck.commit.sha}; branch held, PR refused`);
  const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R223 VCloud evolution g${generation} — ${capsule.id}: ${capsule.title}`,head:branch,base:'main',draft:false,body:`VCloud-generated bounded source candidate.\n\nExact base: ${mainSha}\nProduction proof run: ${inspection.productionProof?.id||'none'}\nCapsule: ${capsule.id} — ${capsule.objective}\n\nThis PR is source proposal only. It does not admit CanonState, does not prove a PC/solver/renderer/empirical claim, cannot deploy production directly, and preserves R125/R147/R146/R141 plus retired R201/R203 tombstones. Canonical ci.yml remains the sole main-push deployment authority.`})});
  return {...inspection,mutation:'BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,generation,capsuleId:capsule.id};
}

export async function promoteGreenVCloudPr({token,repo='medicinalElJefe/OMEGAv6',prNumber,requiredWorkflows=['OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority','R210 Release Controller','R223 VCloud Evolution Authority']}){
  const pr=await gh(token,`/repos/${repo}/pulls/${prNumber}`);
  if(pr.state!=='open')return {action:'NONE',reason:`PR is ${pr.state}`};
  if(!String(pr.head?.ref||'').startsWith('vcloud/evolution-'))return {action:'NONE',reason:'not a VCloud evolution PR'};
  const candidate=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',pr.head.ref)).json;
  const expectedBase=candidate?.receipt?.baseSha||null;
  const currentMain=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;
  if(!expectedBase||expectedBase!==currentMain)return {action:'NONE',reason:'main drifted or candidate lacks exact-base receipt; stale candidate must not promote',expectedBase,currentMain};
  const headSha=pr.head.sha;
  const runs=await gh(token,`/repos/${repo}/actions/runs?head_sha=${headSha}&event=pull_request&per_page=100`);
  const byName=new Map((runs.workflow_runs||[]).map(r=>[r.name,r]));
  const missing=requiredWorkflows.filter(name=>!byName.has(name));
  const red=requiredWorkflows.filter(name=>{const r=byName.get(name);return r&&!(r.status==='completed'&&r.conclusion==='success')});
  if(missing.length||red.length)return {action:'NONE',reason:'exact candidate proof stack not fully green',missing,notGreen:red,headSha,currentMain};
  const recheck=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;
  if(recheck!==expectedBase)return {action:'NONE',reason:'main drifted during promotion gate',expectedBase,currentMain:recheck};
  const merge=await gh(token,`/repos/${repo}/pulls/${prNumber}/merge`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({sha:headSha,merge_method:'merge',commit_title:`Promote ${pr.title}`,commit_message:`Expected-head-locked VCloud source promotion. Canonical ci.yml remains sole production deployment authority. R125/R147/R146/R141 boundaries preserved; R201/R203 tombstones remain retired.`})});
  return {action:'MERGED_GREEN_EXACT_HEAD',headSha,baseSha:expectedBase,mergeSha:merge.sha,merged:merge.merged===true};
}
