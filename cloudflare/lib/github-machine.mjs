import {AUTHORITY_BOUNDARIES,MACHINE_ID,decideCycle,reconcileObservedSource} from './evolution-policy.mjs';
import {capsuleBody} from './generated-capsules.mjs';
import {autonomousCandidatePrefixesR245,isAutonomousCandidateBranchR245,validateAutonomousCandidatePolicyR245,R245_CAPSULE_GENERATOR_REVISION,R245_GOVERNED_SELFBUILD_CONTRACT} from '../../src/system/governedSelfBuildContractR245.js';

const API='https://api.github.com';
function utf8ToBase64(value){const bytes=new TextEncoder().encode(String(value));let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
function base64ToUtf8(value){const raw=atob(String(value||'').replace(/\n/g,''));const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
function headers(token){return{'accept':'application/vnd.github+json','authorization':`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'omega-cloud-01-evolution-machine'}}
async function gh(token,path,init={}){const r=await fetch(`${API}${path}`,{...init,headers:{...headers(token),...(init.headers||{})}});const text=await r.text();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}if(!r.ok)throw new Error(`GitHub ${init.method||'GET'} ${path} -> ${r.status}: ${typeof body==='string'?body:JSON.stringify(body)}`);return body}
async function getRepoFile(token,repo,path,ref){const body=await gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(ref)}`);return{sha:body.sha,text:base64ToUtf8(body.content),json:JSON.parse(base64ToUtf8(body.content))}}
async function repoPathExists(token,repo,path,ref){try{await gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(ref)}`);return true}catch(error){if(String(error).includes('-> 404:'))return false;throw error}}
async function putRepoFile(token,repo,path,branch,message,content,sha){const payload={message,content:utf8ToBase64(content),branch};if(sha)payload.sha=sha;return gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})}
async function liveJson(base,path){const r=await fetch(`${base.replace(/\/$/,'')}${path}?cloud01_cycle=${Date.now()}`,{headers:{'cache-control':'no-cache'}});const text=await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}: ${text.slice(0,300)}`);return JSON.parse(text)}

async function collectCandidates(token,repo,policy){
  const candidates=[];
  for(const prefix of autonomousCandidatePrefixesR245(policy)){
    let refs=[];try{refs=await gh(token,`/repos/${repo}/git/matching-refs/heads/${prefix}`)}catch{}
    for(const ref of refs||[]){const branch=String(ref.ref||'').replace(/^refs\/heads\//,'');try{const candidate=await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch);candidates.push({...candidate.json,branch,headSha:ref.object?.sha||null})}catch(error){candidates.push({branch,headSha:ref.object?.sha||null,unreadable:true,error:String(error)})}}
  }
  return candidates;
}

async function reconcileMainState(token,repo,mainSha,state){
  const presentTargets=new Set();
  for(const capsule of state.roadmap||[])if(await repoPathExists(token,repo,capsule.target,mainSha))presentTargets.add(capsule.target);
  return reconcileObservedSource(state,presentTargets);
}

export async function inspectCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase='https://omegav6.jeffdeweyeljefe.workers.dev'}){
  const main=await gh(token,`/repos/${repo}/branches/main`);const mainSha=main.commit.sha;
  const runs=await gh(token,`/repos/${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&per_page=30`);
  const productionProof=(runs.workflow_runs||[]).find(r=>r.head_sha===mainSha&&r.status==='completed'&&r.conclusion==='success')||null;
  const stateFile=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',mainSha);
  const state=await reconcileMainState(token,repo,mainSha,stateFile.json);
  const candidatePolicy=validateAutonomousCandidatePolicyR245(state.autonomousCandidatePolicy);
  const candidates=candidatePolicy.valid?await collectCandidates(token,repo,candidatePolicy.policy):[];
  const [coreHealth,releaseEvidence,runtimeAttestation,hybrid]=await Promise.all([liveJson(runtimeBase,'/api/core-health'),liveJson(runtimeBase,'/api/release-evidence'),liveJson(runtimeBase,'/api/runtime-attestation'),liveJson(runtimeBase,'/api/hybrid/status')]);
  const evidence={coreHealth,releaseEvidence,runtimeAttestation,hybrid};
  const decision=candidatePolicy.valid?decideCycle({currentMainSha:mainSha,productionProofGreen:Boolean(productionProof),state,candidates,evidence}):{action:'OBSERVE_ONLY',reason:`canonical autonomous candidate policy invalid: ${candidatePolicy.reasons.join(',')}`,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT};
  return{machineId:MACHINE_ID,mainSha,productionProof,state,candidatePolicy,candidates,evidence,decision};
}

export async function proposeCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase}){
  const inspection=await inspectCycle({token,repo,runtimeBase});
  if(inspection.decision.action!=='PROPOSE')return{...inspection,mutation:'NONE'};
  const{mainSha,state,decision}=inspection;const capsule=decision.capsule;const generation=Number(state.generation||0)+1;const branch=`cloud/evolution-g${generation}-${capsule.id.toLowerCase()}-${mainSha.slice(0,10)}`;
  await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
  await putRepoFile(token,repo,capsule.target,branch,`CLOUD-01 evolution g${generation}: ${capsule.id}`,capsuleBody(capsule.id));
  const branchState=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
  const receipt={schema:'OMEGA_CLOUDFLARE_EVOLUTION_RECEIPT_R223',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,generation,capsuleId:capsule.id,target:capsule.target,baseSha:mainSha,branch,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false,createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
  const nextState={...state,generation,currentCapsuleId:capsule.id,receipts:[...(state.receipts||[]),receipt].slice(-64)};
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Bind CLOUD-01 evolution receipt g${generation}`,`${JSON.stringify(nextState,null,2)}\n`,branchState.sha);
  const candidate={schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R223',revision:'R223',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,capsule,receipt,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false};
  let candidateSha=null;try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record CLOUD-01 candidate g${generation}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
  const recheck=await gh(token,`/repos/${repo}/branches/main`);if(recheck.commit.sha!==mainSha)throw new Error(`main drifted from ${mainSha} to ${recheck.commit.sha}; branch held, PR refused`);
  const open=await gh(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);const competing=(open||[]).filter(pr=>isAutonomousCandidateBranchR245(pr.head?.ref,state.autonomousCandidatePolicy));if(competing.length){throw new Error(`autonomous candidate appeared before CLOUD-01 PR creation: ${competing.map(pr=>`#${pr.number}:${pr.head?.ref}`).join(',')}`)}
  const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R223 CLOUD-01 evolution g${generation} — ${capsule.id}: ${capsule.title}`,head:branch,base:'main',draft:false,body:`Cloudflare CLOUD-01 generated bounded source candidate through the shared R245 governed self-build contract.\n\nExact base: ${mainSha}\nProduction proof run: ${inspection.productionProof?.id||'none'}\nCapsule: ${capsule.id} — ${capsule.objective}\n\nR170 and CLOUD-01 share one R164 residual policy, R240/R243 selection law, capsule generator and one-open-candidate fence. Source proposal only. No Canon admission, PC-online, solver, renderer, empirical or federation-closure claim is synthesized. R125/R147/R146/R141 remain authoritative; R201/R203 tombstones remain retired. ci.yml remains the sole production deployment authority.`})});
  return{...inspection,mutation:'BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,generation,capsuleId:capsule.id};
}

export async function promoteGreenCloudPr({token,repo='medicinalElJefe/OMEGAv6',prNumber,requiredWorkflows=['OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority','R210 Release Controller','R223 Cloudflare Evolution Authority']}){
  const pr=await gh(token,`/repos/${repo}/pulls/${prNumber}`);if(pr.state!=='open')return{action:'NONE',reason:`PR is ${pr.state}`};if(!String(pr.head?.ref||'').startsWith('cloud/evolution-'))return{action:'NONE',reason:'not a CLOUD-01 evolution PR'};
  const candidate=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',pr.head.ref)).json;const expectedBase=candidate?.receipt?.baseSha||null;const currentMain=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;
  if(!expectedBase||expectedBase!==currentMain)return{action:'NONE',reason:'main drifted or candidate lacks exact-base receipt; stale candidate must not promote',expectedBase,currentMain};
  const headSha=pr.head.sha;const runs=await gh(token,`/repos/${repo}/actions/runs?head_sha=${headSha}&event=pull_request&per_page=100`);const byName=new Map((runs.workflow_runs||[]).map(r=>[r.name,r]));const missing=requiredWorkflows.filter(name=>!byName.has(name));const red=requiredWorkflows.filter(name=>{const r=byName.get(name);return r&&!(r.status==='completed'&&r.conclusion==='success')});
  if(missing.length||red.length)return{action:'NONE',reason:'exact candidate proof stack not fully green',missing,notGreen:red,headSha,currentMain};
  const recheck=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;if(recheck!==expectedBase)return{action:'NONE',reason:'main drifted during promotion gate',expectedBase,currentMain:recheck};
  const merge=await gh(token,`/repos/${repo}/pulls/${prNumber}/merge`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({sha:headSha,merge_method:'merge',commit_title:`Promote ${pr.title}`,commit_message:`Expected-head-locked CLOUD-01 source promotion. ci.yml remains sole production deployment authority. R125/R147/R146/R141 preserved; R201/R203 tombstones remain retired.`})});
  return{action:'MERGED_GREEN_EXACT_HEAD',headSha,baseSha:expectedBase,mergeSha:merge.sha,merged:merge.merged===true};
}

export async function runAutonomousCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase}){
  const main=await gh(token,`/repos/${repo}/branches/main`);const state=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',main.commit.sha)).json;const candidatePolicy=validateAutonomousCandidatePolicyR245(state.autonomousCandidatePolicy);
  if(!candidatePolicy.valid)return{ok:false,state:'BLOCKED',reason:`canonical autonomous candidate policy invalid: ${candidatePolicy.reasons.join(',')}`};
  const open=await gh(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);const autonomous=(open||[]).filter(pr=>isAutonomousCandidateBranchR245(pr.head?.ref,candidatePolicy.policy)).sort((a,b)=>a.number-b.number);
  if(autonomous.length>1)return{ok:false,state:'BLOCKED',reason:'multiple open governed autonomous candidate PRs require review',prs:autonomous.map(x=>x.number),branches:autonomous.map(x=>x.head?.ref)};
  if(autonomous.length===1){const held=autonomous[0];if(String(held.head?.ref||'').startsWith('cloud/evolution-')){const promotion=await promoteGreenCloudPr({token,repo,prNumber:held.number});return{ok:true,state:promotion.action==='MERGED_GREEN_EXACT_HEAD'?'PROMOTED':'HELD_FOR_PROOF',promotion}}return{ok:true,state:'HELD_FOR_R170_CANDIDATE',reason:'shared one-open-autonomous-candidate fence holds CLOUD-01 while the R170 candidate exists',prNumber:held.number,branch:held.head?.ref}}
  const proposal=await proposeCycle({token,repo,runtimeBase});return{ok:true,state:proposal.mutation==='BRANCH_AND_PR_CREATED'?'PROPOSED':'OBSERVE_ONLY',proposal:{mainSha:proposal.mainSha,mutation:proposal.mutation,decision:proposal.decision,branch:proposal.branch||null,prNumber:proposal.prNumber||null,prUrl:proposal.prUrl||null,capsuleId:proposal.capsuleId||null}}
}
