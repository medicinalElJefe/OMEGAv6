import {AUTHORITY_BOUNDARIES,MACHINE_ID,decideCycle,reconcileObservedSource} from './evolution-policy.mjs';
import {capsuleBody} from './generated-capsules.mjs';
import {buildCloudResidualStateR314} from './r314-residual-adapter.mjs';
import {selectRepairTargetR314} from './r314-target-registry.mjs';
import {proposeAiRepairR314} from './r314-ai-repair.mjs';
import {canAttemptRepairR314,recordRepairAttemptR314} from '../../src/system/autonomousConvergenceR314.js';
import {R314_AI_REPAIR_MODEL_DEFAULT,repairPathPolicyR314} from '../../src/system/autonomousRepairPolicyR314.js';
import {selectNextConvergenceItemR388,validateConvergenceRepairR450} from '../../src/system/convergenceBacklogR388.js';
import {autonomousCandidatePrefixesR245,isAutonomousCandidateBranchR245,validateAutonomousCandidatePolicyR245,R245_CAPSULE_GENERATOR_REVISION,R245_GOVERNED_SELFBUILD_CONTRACT} from '../../src/system/governedSelfBuildContractR245.js';
import {cloudCandidateResolutionR436} from './canonical-resolution-r436.mjs';

const API='https://api.github.com';
function utf8ToBase64(value){const bytes=new TextEncoder().encode(String(value));let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
function base64ToUtf8(value){const raw=atob(String(value||'').replace(/\n/g,''));const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
function headers(token){return{'accept':'application/vnd.github+json','authorization':`Bearer ${token}`,'x-github-api-version':'2022-11-28','user-agent':'omega-cloud-01-evolution-machine'}}
async function gh(token,path,init={}){const r=await fetch(`${API}${path}`,{...init,headers:{...headers(token),...(init.headers||{})}});const text=await r.text();let body=null;try{body=text?JSON.parse(text):null}catch{body=text}if(!r.ok)throw new Error(`GitHub ${init.method||'GET'} ${path} -> ${r.status}: ${typeof body==='string'?body:JSON.stringify(body)}`);return body}
async function getRepoTextFile(token,repo,path,ref){const body=await gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(ref)}`);return{path,sha:body.sha,text:base64ToUtf8(body.content)}}
async function getRepoFile(token,repo,path,ref){const file=await getRepoTextFile(token,repo,path,ref);return{...file,json:JSON.parse(file.text)}}
async function repoPathExists(token,repo,path,ref){try{await gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}?ref=${encodeURIComponent(ref)}`);return true}catch(error){if(String(error).includes('-> 404:'))return false;throw error}}
async function putRepoFile(token,repo,path,branch,message,content,sha){const payload={message,content:utf8ToBase64(content),branch};if(sha)payload.sha=sha;return gh(token,`/repos/${repo}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})}
async function liveJson(base,path){const r=await fetch(`${base.replace(/\/$/,'')}${path}?cloud01_cycle=${Date.now()}`,{headers:{'cache-control':'no-cache'}});const text=await r.text();if(!r.ok)throw new Error(`${path} HTTP ${r.status}: ${text.slice(0,300)}`);return JSON.parse(text)}
const slug=value=>String(value||'repair').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||'repair';

async function gitBlobShaR430(value){
  const body=new TextEncoder().encode(String(value));
  const header=new TextEncoder().encode(`blob ${body.byteLength}\0`);
  const framed=new Uint8Array(header.byteLength+body.byteLength);
  framed.set(header,0);framed.set(body,header.byteLength);
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-1',framed));
  return[...digest].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function productPatchIdentityR430(patches){
  const rows=[];
  for(const patch of [...(patches||[])].sort((a,b)=>String(a.path).localeCompare(String(b.path)))){
    rows.push({path:String(patch.path),blobSha:await gitBlobShaR430(patch.content)});
  }
  return{schema:'OMEGA_R430_PRODUCT_PATCH_IDENTITY',rows,key:rows.map(row=>`${row.path}:${row.blobSha}`).join('|')};
}

async function commitProductPatchIdentityR430(token,repo,commitSha,paths){
  const rows=[];
  for(const path of [...paths].sort()){
    try{const file=await getRepoTextFile(token,repo,path,commitSha);rows.push({path,blobSha:file.sha})}
    catch{return null}
  }
  return{schema:'OMEGA_R430_PRODUCT_PATCH_IDENTITY',rows,key:rows.map(row=>`${row.path}:${row.blobSha}`).join('|')};
}

const R430_REJECTION_COMMENT=/(governed rejection|proof[- ]invalid|proof[- ]backed rejection|known[- ]invalid repeat|must not be promoted|proof[- ]rejected)/i;
const R430_REQUIRED_PROOF_WORKFLOWS=new Set(['OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority','R210 Release Controller','R223 Cloudflare Evolution Authority','OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence','R241 Archive Convergence Visual Intelligence']);

async function findClosedProofRejectedPatchRepeatR430({token,repo,itemId,patches}){
  const proposed=await productPatchIdentityR430(patches);
  if(!proposed.rows.length)return{matched:false,proposed};
  const closed=await gh(token,`/repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100`);
  const itemSlug=slug(itemId);
  const relevant=(closed||[]).filter(pr=>{const branch=String(pr.head?.ref||'');return!pr.merged_at&&branch.startsWith('cloud/evolution-r388-')&&(String(pr.title||'').includes(String(itemId))||branch.includes(itemSlug))}).slice(0,24);
  for(const pr of relevant){
    let comments=[];try{comments=await gh(token,`/repos/${repo}/issues/${pr.number}/comments?per_page=100`)}catch{}
    const commentRejected=(comments||[]).some(comment=>R430_REJECTION_COMMENT.test(String(comment?.body||'')));
    let commits=[];try{commits=await gh(token,`/repos/${repo}/pulls/${pr.number}/commits?per_page=100`)}catch{}
    for(const commit of [...(commits||[])].reverse()){
      const commitSha=String(commit?.sha||'');if(!/^[0-9a-f]{40}$/i.test(commitSha))continue;
      const prior=await commitProductPatchIdentityR430(token,repo,commitSha,proposed.rows.map(row=>row.path));
      if(!prior||prior.key!==proposed.key)continue;
      let failedWorkflows=[];
      if(!commentRejected){
        try{
          const runs=await gh(token,`/repos/${repo}/actions/runs?head_sha=${commitSha}&event=pull_request&per_page=100`);
          failedWorkflows=(runs.workflow_runs||[]).filter(run=>R430_REQUIRED_PROOF_WORKFLOWS.has(run.name)&&run.status==='completed'&&run.conclusion==='failure').map(run=>run.name);
        }catch{}
      }
      if(commentRejected||failedWorkflows.length){
        return{matched:true,proposed,prNumber:pr.number,prHeadSha:pr.head?.sha||null,matchedCommitSha:commitSha,rejectionEvidence:commentRejected?'GOVERNED_REJECTION_COMMENT':'FAILED_EXACT_HEAD_PROOF',failedWorkflows:[...new Set(failedWorkflows)],closedAt:pr.closed_at||null};
      }
    }
  }
  return{matched:false,proposed};
}


async function collectCandidates(token,repo,policy){
  const open=await gh(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);
  const heldBranches=new Set((open||[]).filter(pr=>isAutonomousCandidateBranchR245(pr.head?.ref,policy)).map(pr=>String(pr.head?.ref||'')));
  const candidates=[];
  for(const prefix of autonomousCandidatePrefixesR245(policy)){
    let refs=[];try{refs=await gh(token,`/repos/${repo}/git/matching-refs/heads/${prefix}`)}catch{}
    for(const ref of refs||[]){
      const branch=String(ref.ref||'').replace(/^refs\/heads\//,'');
      if(!heldBranches.has(branch))continue;
      try{const candidate=await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch);candidates.push({...candidate.json,branch,headSha:ref.object?.sha||null})}
      catch(error){candidates.push({branch,headSha:ref.object?.sha||null,unreadable:true,error:String(error)})}
    }
  }
  return candidates;
}

async function reconcileMainState(token,repo,mainSha,state){
  const presentTargets=new Set();
  for(const capsule of state.roadmap||[])if(await repoPathExists(token,repo,capsule.target,mainSha))presentTargets.add(capsule.target);
  return reconcileObservedSource(state,presentTargets);
}

export function canonicalAdvancedItemIdsR465(state={}){
 const rows=Array.isArray(state?.r388CanonicalAdvancements)?state.r388CanonicalAdvancements:[];
 return rows.filter(row=>
  /^R388-[A-Y]-\d{2}$/.test(String(row?.itemId||''))&&
  row?.status==='RELEASE_CLEAN'&&
  /^[0-9a-f]{40}$/.test(String(row?.mergeSha||''))&&
  Number.isInteger(Number(row?.productionRunId))&&Number(row.productionRunId)>0&&
  row?.canonicalAdmission===false
 ).map(row=>String(row.itemId));
}

export function observedCanonicalAdvancedItemIdsR465({pulls=[],runs=[],mainSha='',ancestorMergeShas=[]}={}){
 const cleanPushShas=new Set((Array.isArray(runs)?runs:[]).filter(run=>
  run?.event==='push'&&
  run?.head_branch==='main'&&
  run?.status==='completed'&&
  run?.conclusion==='success'&&
  /^[0-9a-f]{40}$/.test(String(run?.head_sha||''))
 ).map(run=>String(run.head_sha)));
 const ancestors=new Set([String(mainSha||''),...(Array.isArray(ancestorMergeShas)?ancestorMergeShas:[]).map(String)]);
 return [...new Set((Array.isArray(pulls)?pulls:[]).flatMap(pr=>{
  const match=String(pr?.title||'').match(/^R388 CLOUD-01 convergence — (R388-[A-Y]-\d{2})$/);
  const mergeSha=String(pr?.merge_commit_sha||'');
  if(!match||!pr?.merged_at||!cleanPushShas.has(mergeSha)||!ancestors.has(mergeSha))return[];
  return[match[1]];
 }))];
}

async function observedRepositoryAdvancedItemIdsR465(token,repo,mainSha,runs=[]){
 const closed=await gh(token,`/repos/${repo}/pulls?state=closed&base=main&sort=updated&direction=desc&per_page=100`);
 const cleanPushShas=new Set((Array.isArray(runs)?runs:[]).filter(run=>
  run?.event==='push'&&run?.head_branch==='main'&&run?.status==='completed'&&run?.conclusion==='success'
 ).map(run=>String(run?.head_sha||'')).filter(sha=>/^[0-9a-f]{40}$/.test(sha)));
 const candidates=(Array.isArray(closed)?closed:[]).filter(pr=>{
  const title=String(pr?.title||'');
  const mergeSha=String(pr?.merge_commit_sha||'');
  return /^R388 CLOUD-01 convergence — R388-[A-Y]-\d{2}$/.test(title)&&Boolean(pr?.merged_at)&&cleanPushShas.has(mergeSha);
 });
 const ancestorMergeShas=[];
 for(const pr of candidates){
  const mergeSha=String(pr.merge_commit_sha||'');
  if(mergeSha===mainSha){ancestorMergeShas.push(mergeSha);continue}
  try{
   const cmp=await gh(token,`/repos/${repo}/compare/${mergeSha}...${mainSha}`);
   if(cmp?.status==='ahead'&&Number(cmp?.behind_by||0)===0)ancestorMergeShas.push(mergeSha);
  }catch{}
 }
 return observedCanonicalAdvancedItemIdsR465({pulls:closed,runs,mainSha,ancestorMergeShas});
}

function workflowEvidenceForSha(runs,sha){
  return (runs||[]).filter(run=>run?.head_sha===sha).map(run=>({databaseId:run.id,workflowName:run.name||'OMEGA Cloud Bridge CI',status:run.status,conclusion:run.conclusion,url:run.html_url,headSha:run.head_sha}));
}

export async function inspectCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase='https://omegav6.jeffdeweyeljefe.workers.dev'}){
  const main=await gh(token,`/repos/${repo}/branches/main`);const mainSha=main.commit.sha;
  const runs=await gh(token,`/repos/${repo}/actions/workflows/ci.yml/runs?branch=main&event=push&per_page=30`);
  const productionProof=(runs.workflow_runs||[]).find(r=>r.head_sha===mainSha&&r.status==='completed'&&r.conclusion==='success')||null;
  const stateFile=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',mainSha);
  const state=await reconcileMainState(token,repo,mainSha,stateFile.json);
  const candidatePolicy=validateAutonomousCandidatePolicyR245(state.autonomousCandidatePolicy);
  const candidates=candidatePolicy.valid?await collectCandidates(token,repo,candidatePolicy.policy):[];
  let accuracyState={};try{accuracyState=(await getRepoFile(token,repo,'public/omega-r125-accuracy-state.json',mainSha)).json}catch{}
  let convergenceMarkdown='';try{convergenceMarkdown=(await getRepoTextFile(token,repo,'docs/OMEGA_MISSING_CAPABILITY_CONVERGENCE_R386.md',mainSha)).text}catch{}
  const recentDeclinedItemIds=[...new Set((state.r388Receipts||[]).slice(-8).flatMap(receipt=>(Array.isArray(receipt?.declinedItemScars)?receipt.declinedItemScars:[]).map(row=>String(row?.itemId||'')).filter(Boolean)))];
  const durableCanonicalAdvancedItemIds=canonicalAdvancedItemIdsR465(state);
  const observedCanonicalAdvancedItemIds=await observedRepositoryAdvancedItemIdsR465(token,repo,mainSha,runs.workflow_runs||[]);
  const canonicalAdvancedItemIds=[...new Set([...durableCanonicalAdvancedItemIds,...observedCanonicalAdvancedItemIds])];
  const reconciledAdvancedItemIds=[...new Set([...(state.r388AdvancedItemIds||[]),...canonicalAdvancedItemIds])];
  const backlog=selectNextConvergenceItemR388({markdown:convergenceMarkdown,advancedItemIds:reconciledAdvancedItemIds,heldItemIds:recentDeclinedItemIds});
  const backlogTargets=[];
  for(const item of backlog.candidates||[]){
    const paths=[];
    for(const candidate of item.affected||[]){const policy=repairPathPolicyR314(candidate);if(policy.allowed&&await repoPathExists(token,repo,policy.path,mainSha))paths.push(policy.path)}
    backlogTargets.push(paths.length?{targetable:true,residualId:item.id,paths:paths.slice(0,2),item,residual:{id:item.id,severity:'MEDIUM',mode:'AUTO_REPAIR',confidence:1,reproducible:true,affected:paths.slice(0,2),summary:`Advance one bounded source step for convergence backlog item ${item.id}: ${item.objective}. The full item remains open until independently proved. Make the smallest material current-runtime improvement inside the supplied target source only; do not claim external/device completion without returned proof.`,evidenceId:'R387_CONVERGENCE_MATRIX',source:'R388',externalProofRequired:item.externalProofRequired===true,expectedProofs:item.expectedProofs||[]},reason:'R388_CONVERGENCE_ITEM_READY'}:{targetable:false,reason:'R388_ITEM_HAS_NO_EXISTING_ALLOWED_PRODUCT_SOURCE_TARGET',item,paths:[]});
  }
  const backlogTarget=backlogTargets.find(target=>target.targetable)||{targetable:false,reason:'NO_SELF_EDITABLE_CONVERGENCE_ITEM',item:backlog.selected||null,paths:[]};
  const [coreHealth,releaseEvidence,runtimeAttestation,hybrid]=await Promise.all([liveJson(runtimeBase,'/api/core-health'),liveJson(runtimeBase,'/api/release-evidence'),liveJson(runtimeBase,'/api/runtime-attestation'),liveJson(runtimeBase,'/api/hybrid/status')]);
  const evidence={coreHealth,releaseEvidence,runtimeAttestation,hybrid};
  const residualState=buildCloudResidualStateR314({accuracyState,runtimeEvidence:evidence,workflowEvidence:workflowEvidenceForSha(runs.workflow_runs,mainSha)});
  const selectedTarget=selectRepairTargetR314(residualState);
  const repairId=selectedTarget.targetable?`R314-AI:${selectedTarget.residualId}:${selectedTarget.paths.join('|')}`:null;
  const retry=repairId?canAttemptRepairR314({history:state.r314RepairHistory||[],fingerprint:residualState.vector.fingerprint,repairId}):null;
  const repairTarget=selectedTarget.targetable&&retry&&!retry.allow?{...selectedTarget,targetable:false,reasons:[...selectedTarget.reasons,'R314_RETRY_BUDGET_EXHAUSTED']}:{...selectedTarget,repairId};
  const decision=candidatePolicy.valid?decideCycle({currentMainSha:mainSha,productionProofGreen:Boolean(productionProof),state,candidates,evidence,repairTarget,backlogTarget}):{action:'OBSERVE_ONLY',reason:`canonical autonomous candidate policy invalid: ${candidatePolicy.reasons.join(',')}`,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT};
  return{machineId:MACHINE_ID,mainSha,productionProof,state,candidatePolicy,candidates,evidence,r314:{residualState,repairTarget,retry},r388:{backlog,backlogTarget,backlogTargets,recentDeclinedItemIds,durableCanonicalAdvancedItemIds,observedCanonicalAdvancedItemIds,canonicalAdvancedItemIds,reconciledAdvancedItemIds},decision};
}

async function ensureNoCompetingCandidate(token,repo,state,mainSha){
  const recheck=await gh(token,`/repos/${repo}/branches/main`);if(recheck.commit.sha!==mainSha)throw new Error(`main drifted from ${mainSha} to ${recheck.commit.sha}; candidate held, PR refused`);
  const open=await gh(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);const competing=(open||[]).filter(pr=>isAutonomousCandidateBranchR245(pr.head?.ref,state.autonomousCandidatePolicy));if(competing.length)throw new Error(`autonomous candidate appeared before CLOUD-01 PR creation: ${competing.map(pr=>`#${pr.number}:${pr.head?.ref}`).join(',')}`);
}

async function proposeR314AiCycle({inspection,token,repo,ai,model}){
  const{mainSha,state,decision,r314}=inspection;const target=decision.repairTarget;
  if(!target?.targetable)return{...inspection,mutation:'NONE',reason:'R314 repair target is not targetable'};
  const contextFiles=[];for(const path of target.paths)contextFiles.push(await getRepoTextFile(token,repo,path,mainSha));
  const stage={id:'CLOUD-01-R314-AI-REPAIR',baseSha:mainSha,residualFingerprint:r314.residualState.vector.fingerprint,repairId:target.repairId,paths:target.paths};
  const repair=await proposeAiRepairR314({ai,model:model||R314_AI_REPAIR_MODEL_DEFAULT,residual:target.residual,stage,contextFiles});
  if(!repair.ok)return{...inspection,mutation:'NONE',reason:repair.state,repair:{state:repair.state,reasons:repair.reasons||repair.validation?.reasons||[],attempts:repair.attempts||[],rejectionHistory:repair.rejectionHistory||[],reformulated:repair.reformulated===true}};
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  const generation=Number(state.generation||0)+1;const branch=`cloud/evolution-r314-${slug(target.residualId)}-${r314.residualState.vector.fingerprint.slice(-8)}-${mainSha.slice(0,8)}`;
  await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
  for(const patch of repair.patches)await putRepoFile(token,repo,patch.path,branch,`CLOUD-01 R314 repair ${target.residualId}: ${patch.path}`,patch.content,patch.preimageSha);
  const receipt={schema:'OMEGA_CLOUDFLARE_R314_AI_REPAIR_RECEIPT',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R314_AI_REPAIR',residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,generation,residualId:target.residualId,residualFingerprint:r314.residualState.vector.fingerprint,repairId:target.repairId,targetPaths:repair.patches.map(p=>p.path),baseSha:mainSha,branch,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false,directProductionMutation:false,model:repair.model,expectedProofs:repair.proposal.expectedProofs,reformulated:repair.reformulated===true,repairAttemptLedger:repair.attempts||[],rejectionScars:repair.rejectionHistory||[],createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
  const branchState=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
  const history=recordRepairAttemptR314(state.r314RepairHistory||[],{fingerprint:r314.residualState.vector.fingerprint,repairId:target.repairId,outcome:'PROPOSED',evidenceId:target.residual?.evidenceId||null});
  const nextState={...state,generation,r314RepairHistory:history,receipts:[...(state.receipts||[]),receipt].slice(-64)};
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Bind CLOUD-01 R314 repair receipt g${generation}`,`${JSON.stringify(nextState,null,2)}\n`,branchState.sha);
  const candidate={schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R314',revision:'R314.1',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R314_AI_REPAIR',residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,repair:{residualId:target.residualId,residualFingerprint:r314.residualState.vector.fingerprint,repairId:target.repairId,paths:repair.patches.map(p=>p.path),expectedProofs:repair.proposal.expectedProofs,reformulated:repair.reformulated===true,rejectionScars:repair.rejectionHistory||[]},receipt,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false,directProductionMutation:false};
  candidate.canonicalResolution=cloudCandidateResolutionR436(candidate);
  let candidateSha=null;try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record CLOUD-01 R314 candidate g${generation}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R314 CLOUD-01 repair g${generation} — ${target.residualId}`,head:branch,base:'main',draft:false,body:`CLOUD-01 generated a bounded R314 product-source repair from an explicit residual.\n\nExact base: ${mainSha}\nResidual: ${target.residualId}\nResidual fingerprint: ${r314.residualState.vector.fingerprint}\nRepair hypothesis: ${target.repairId}\nPaths: ${repair.patches.map(p=>p.path).join(', ')}\nExpected independent proofs: ${(repair.proposal.expectedProofs||[]).join(', ')}\n\nThe model was supplied only exact-base allowlisted product source. R314 rejected governance/tests/deployment/secrets/Canon/Worker mutation. This PR is source proposal only: R125 Canon admission remains separate and ci.yml remains sole production deployment authority.`})});
  return{...inspection,mutation:'R314_AI_BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,generation,residualId:target.residualId,residualFingerprint:r314.residualState.vector.fingerprint,changedPaths:repair.patches.map(p=>p.path)};
}

async function proposeR388BacklogCycle({inspection,token,repo,ai,model}){
  const{mainSha,state,decision,r388}=inspection;
  const targets=(Array.isArray(r388?.backlogTargets)&&r388.backlogTargets.length?r388.backlogTargets:[decision.repairTarget]).filter(target=>target?.targetable&&target?.item).slice(0,3);
  if(!targets.length)return{...inspection,mutation:'NONE',reason:'R388 convergence item is not safely targetable'};
  const declinedItemScars=[];
  let chosen=null,lastRepair=null,lastItem=null;
  for(const target of targets){
    const item=target.item;lastItem=item;
    const contextFiles=[];for(const path of target.paths)contextFiles.push(await getRepoTextFile(token,repo,path,mainSha));
    const stage={id:'CLOUD-01-R388-CONVERGENCE-BUILD',baseSha:mainSha,itemId:item.id,section:item.section,paths:target.paths,externalProofRequired:item.externalProofRequired===true,semanticAcceptanceContract:item.acceptanceContract||null};
    const repair=await proposeAiRepairR314({ai,model:model||R314_AI_REPAIR_MODEL_DEFAULT,residual:target.residual,stage,contextFiles});
    lastRepair=repair;
    if(repair.ok){
      const semantic=validateConvergenceRepairR450({item,proposal:repair.proposal});
      if(!semantic.valid){
        const scar={itemId:item.id,section:item.section,state:'SEMANTIC_ACCEPTANCE_REJECTED',reasons:semantic.reasons,attempts:repair.attempts||[],rejectionHistory:repair.rejectionHistory||[],reformulated:repair.reformulated===true,semanticAcceptance:{changedChars:semantic.changedChars,missingTokens:semantic.missingTokens||[],contract:semantic.contract}};
        declinedItemScars.push(scar);
        lastRepair={...repair,state:'SEMANTIC_ACCEPTANCE_REJECTED',reasons:semantic.reasons,semanticAcceptance:scar.semanticAcceptance};
        continue;
      }
      const rejectedRepeat=await findClosedProofRejectedPatchRepeatR430({token,repo,itemId:item.id,patches:repair.patches});
      if(rejectedRepeat.matched){
        const scar={itemId:item.id,section:item.section,state:'PROOF_REJECTED_PATCH_REPEAT',reasons:[`exact product patch identity already proof-rejected by closed unmerged CLOUD-01 PR #${rejectedRepeat.prNumber}`],attempts:repair.attempts||[],rejectionHistory:repair.rejectionHistory||[],reformulated:repair.reformulated===true,patchIdentity:rejectedRepeat.proposed,matchedClosedPr:{number:rejectedRepeat.prNumber,headSha:rejectedRepeat.prHeadSha,matchedCommitSha:rejectedRepeat.matchedCommitSha,rejectionEvidence:rejectedRepeat.rejectionEvidence,failedWorkflows:rejectedRepeat.failedWorkflows,closedAt:rejectedRepeat.closedAt}};
        declinedItemScars.push(scar);
        lastRepair={...repair,state:'PROOF_REJECTED_PATCH_REPEAT',reasons:scar.reasons,proofRejectedPatchRepeat:scar.matchedClosedPr,patchIdentity:scar.patchIdentity};
        continue;
      }
      chosen={target,item,repair,patchIdentity:rejectedRepeat.proposed};break
    }
    const scar={itemId:item.id,section:item.section,state:repair.state,reasons:repair.reasons||repair.validation?.reasons||[],attempts:repair.attempts||[],rejectionHistory:repair.rejectionHistory||[],reformulated:repair.reformulated===true};
    declinedItemScars.push(scar);
    if(repair.state!=='NO_SAFE_PATCH')return{...inspection,mutation:'NONE',reason:repair.state,repair:{state:repair.state,reasons:scar.reasons,attempts:scar.attempts,rejectionHistory:scar.rejectionHistory,reformulated:scar.reformulated},itemId:item.id,declinedItemScars};
  }
  if(!chosen){
    const repair=lastRepair||{state:'NO_SAFE_PATCH',reasons:['R388_BOUNDED_CANDIDATE_QUEUE_DECLINED'],attempts:[],rejectionHistory:[],reformulated:false};
    if(declinedItemScars.length){
      await ensureNoCompetingCandidate(token,repo,state,mainSha);
      const observationGeneration=Number(state.r388ObservationGeneration||0)+1;
      const branch=`cloud/evolution-r388-scar-${observationGeneration}-${mainSha.slice(0,8)}`;
      await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
      const expectedProofs=['R241 Archive Convergence Visual Intelligence','OMEGA Cloud Bridge CI'];
      const receipt={schema:'OMEGA_CLOUDFLARE_R388_DECLINE_SCAR_RECEIPT',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R388_DECLINE_SCAR_CARRY',observationGeneration,baseSha:mainSha,branch,status:'DECLINE_SCARS_PENDING_PROOF',sourceAdvance:false,advancedItemIdsChanged:false,canonicalAdmission:false,directProductionMutation:false,expectedProofs,declinedItemScars,createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
      const branchState=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
      const nextState={...state,r388ObservationGeneration:observationGeneration,r388Receipts:[...(state.r388Receipts||[]),receipt].slice(-256)};
      await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Carry CLOUD-01 R388 decline scars observation ${observationGeneration}`,`${JSON.stringify(nextState,null,2)}\n`,branchState.sha);
      const candidate={schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R388',revision:'R388.1',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R388_DECLINE_SCAR_CARRY',item:null,repair:{paths:[],expectedProofs,reformulated:false,rejectionScars:[],declinedItemScars},receipt,status:'DECLINE_SCARS_PENDING_PROOF',sourceAdvance:false,canonicalAdmission:false,directProductionMutation:false};
  candidate.canonicalResolution=cloudCandidateResolutionR436(candidate);
      let candidateSha=null;try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
      await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record CLOUD-01 R388 decline-scar observation ${observationGeneration}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
      await ensureNoCompetingCandidate(token,repo,state,mainSha);
      const declinedSummary=declinedItemScars.map(row=>`${row.itemId}:${row.state}`).join(', ');
      const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R388 CLOUD-01 decline-scar carry · observation ${observationGeneration}`,head:branch,base:'main',draft:false,body:`CLOUD-01 is carrying bounded R388 decline scars into canonical self-build state without advancing any convergence item.\n\nExact base: ${mainSha}\nDeclined items: ${declinedSummary}\nProduct-source changes: NONE\nr388AdvancedItemIds changed: NO\nExpected independent proofs: ${expectedProofs.join(', ')}\n\nThis state-only governed candidate exists only so later cycles can retain exact decline history and bypass recently declined items without false advancement. It does not widen source mutation, deployment, CanonState, evidence or production authority. R125 remains sole CanonState admission authority and ci.yml remains sole production writer.`})});
      return{...inspection,mutation:'R388_BACKLOG_BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,itemId:lastItem?.id||targets[0]?.item?.id||null,reason:'R388_DECLINE_SCARS_PENDING_PROOF',changedPaths:['public/omega-r170-selfbuild-state.json','public/omega-r170-selfbuild-candidate.json'],declinedItemScars};
    }
    return{...inspection,mutation:'NONE',reason:repair.state||'NO_SAFE_PATCH',repair:{state:repair.state||'NO_SAFE_PATCH',reasons:repair.reasons||repair.validation?.reasons||[],attempts:repair.attempts||[],rejectionHistory:repair.rejectionHistory||[],reformulated:repair.reformulated===true},itemId:lastItem?.id||targets[0]?.item?.id||null,declinedItemScars};
  }
  const{target,item,repair,patchIdentity}=chosen;
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  const convergenceGeneration=Number(state.r388Generation||0)+1,branch=`cloud/evolution-r388-${slug(item.id)}-${mainSha.slice(0,8)}`;
  await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
  for(const patch of repair.patches)await putRepoFile(token,repo,patch.path,branch,`CLOUD-01 R388 convergence ${item.id}: ${patch.path}`,patch.content,patch.preimageSha);
  const receipt={schema:'OMEGA_CLOUDFLARE_R388_CONVERGENCE_RECEIPT',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R388_BACKLOG_AI_BUILD',convergenceGeneration,itemId:item.id,section:item.section,objective:item.objective,externalProofRequired:item.externalProofRequired===true,targetPaths:repair.patches.map(p=>p.path),productPatchIdentity:patchIdentity,baseSha:mainSha,branch,status:'SOURCE_ADVANCED_PENDING_PROOF',canonicalAdmission:false,directProductionMutation:false,model:repair.model,expectedProofs:repair.proposal.expectedProofs,reformulated:repair.reformulated===true,repairAttemptLedger:repair.attempts||[],rejectionScars:repair.rejectionHistory||[],declinedItemScars,createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
  const branchState=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
  const nextState={...state,r388Generation:convergenceGeneration,r388AdvancedItemIds:[...new Set([...(state.r388AdvancedItemIds||[]),item.id])],r388Receipts:[...(state.r388Receipts||[]),receipt].slice(-256)};
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Bind CLOUD-01 R388 convergence receipt ${item.id}`,`${JSON.stringify(nextState,null,2)}\n`,branchState.sha);
  const candidate={schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R388',revision:'R388',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:'R388_BACKLOG_AI_BUILD',item,repair:{paths:repair.patches.map(p=>p.path),productPatchIdentity:patchIdentity,expectedProofs:repair.proposal.expectedProofs,reformulated:repair.reformulated===true,rejectionScars:repair.rejectionHistory||[],declinedItemScars},receipt,status:'SOURCE_ADVANCED_PENDING_PROOF',canonicalAdmission:false,directProductionMutation:false};
  candidate.canonicalResolution=cloudCandidateResolutionR436(candidate);
  let candidateSha=null;try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record CLOUD-01 R388 candidate ${item.id}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  const priorDeclines=declinedItemScars.length?declinedItemScars.map(row=>`${row.itemId}:${row.state}`).join(', '):'none';
  const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R388 CLOUD-01 convergence — ${item.id}`,head:branch,base:'main',draft:false,body:`CLOUD-01 advanced one explicit item from the R387 convergence matrix.\n\nExact base: ${mainSha}\nItem: ${item.id} — ${item.objective}\nPaths: ${repair.patches.map(p=>p.path).join(', ')}\nProduct patch identity: ${patchIdentity.key}\nPrior bounded item declines carried without false advancement: ${priorDeclines}\nExternal/device proof still required: ${item.externalProofRequired===true?'YES':'NO'}\nExpected independent proofs: ${(repair.proposal.expectedProofs||[]).join(', ')}\n\nThis is one bounded source-improvement step, not a claim that the entire section or any external/device condition is complete. Declined items remain open. The AI cannot edit its own governance, workflows, tests, secrets, workers, deployment authority or Canon admission. R125 remains sole CanonState admission authority and ci.yml remains sole production writer.`})});
  return{...inspection,mutation:'R388_BACKLOG_BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,convergenceGeneration,itemId:item.id,changedPaths:repair.patches.map(p=>p.path),declinedItemScars};
}

async function proposeStaticCapsuleCycle({inspection,token,repo}){
  const{mainSha,state,decision}=inspection;const capsule=decision.capsule;const generation=Number(state.generation||0)+1;const branch=`cloud/evolution-g${generation}-${capsule.id.toLowerCase()}-${mainSha.slice(0,10)}`;
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  await gh(token,`/repos/${repo}/git/refs`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ref:`refs/heads/${branch}`,sha:mainSha})});
  await putRepoFile(token,repo,capsule.target,branch,`CLOUD-01 evolution g${generation}: ${capsule.id}`,capsuleBody(capsule.id));
  const branchState=await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch);
  const receipt={schema:'OMEGA_CLOUDFLARE_EVOLUTION_RECEIPT_R223',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,generation,capsuleId:capsule.id,target:capsule.target,baseSha:mainSha,branch,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false,createdAt:new Date().toISOString(),authorityBoundaries:AUTHORITY_BOUNDARIES};
  const nextState={...state,generation,currentCapsuleId:capsule.id,receipts:[...(state.receipts||[]),receipt].slice(-64)};
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',branch,`Bind CLOUD-01 evolution receipt g${generation}`,`${JSON.stringify(nextState,null,2)}\n`,branchState.sha);
  const candidate={schema:'OMEGA_CLOUDFLARE_EVOLUTION_CANDIDATE_R223',revision:'R223',machineId:MACHINE_ID,governedContract:R245_GOVERNED_SELFBUILD_CONTRACT,generatorContract:R245_CAPSULE_GENERATOR_REVISION,residualPolicy:state.residualPolicy?.schema||null,candidatePolicy:state.autonomousCandidatePolicy?.schema||null,capsule,receipt,status:'GENERATED_PENDING_PROOF',canonicalAdmission:false};
  candidate.canonicalResolution=cloudCandidateResolutionR436(candidate);
  let candidateSha=null;try{candidateSha=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch)).sha}catch{}
  await putRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',branch,`Record CLOUD-01 candidate g${generation}`,`${JSON.stringify(candidate,null,2)}\n`,candidateSha);
  await ensureNoCompetingCandidate(token,repo,state,mainSha);
  const pr=await gh(token,`/repos/${repo}/pulls`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({title:`R223 CLOUD-01 evolution g${generation} — ${capsule.id}: ${capsule.title}`,head:branch,base:'main',draft:false,body:`Cloudflare CLOUD-01 generated bounded source candidate through the shared R245 governed self-build contract.\n\nExact base: ${mainSha}\nProduction proof run: ${inspection.productionProof?.id||'none'}\nCapsule: ${capsule.id} — ${capsule.objective}\n\nR170 and CLOUD-01 share one R164 residual policy, R240/R243 selection law, capsule generator and one-open-candidate fence. Source proposal only. No Canon admission, PC-online, solver, renderer, empirical or federation-closure claim is synthesized. R125/R147/R146/R141 remain authoritative; R201/R203 tombstones remain retired. ci.yml remains the sole production deployment authority.`})});
  return{...inspection,mutation:'BRANCH_AND_PR_CREATED',branch,prNumber:pr.number,prUrl:pr.html_url,generation,capsuleId:capsule.id};
}

export async function proposeCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase,ai=null,model=R314_AI_REPAIR_MODEL_DEFAULT}){
  const inspection=await inspectCycle({token,repo,runtimeBase});
  if(inspection.decision.action!=='PROPOSE')return{...inspection,mutation:'NONE'};
  if(inspection.decision.strategy==='R314_AI_REPAIR')return proposeR314AiCycle({inspection,token,repo,ai,model});
  if(inspection.decision.strategy==='R388_BACKLOG_AI_BUILD')return proposeR388BacklogCycle({inspection,token,repo,ai,model});
  return proposeStaticCapsuleCycle({inspection,token,repo});
}

export async function promoteGreenCloudPr({token,repo='medicinalElJefe/OMEGAv6',prNumber,requiredWorkflows=['OMEGA Cloud Bridge CI','R170 Current Convergence','R202 Operational Source Authority','R210 Release Controller','R223 Cloudflare Evolution Authority','OMEGA R237 Hybrid Command Authority Proof','OMEGA R238 Woven Hybrid Continuity Convergence','R241 Archive Convergence Visual Intelligence']}){
  const pr=await gh(token,`/repos/${repo}/pulls/${prNumber}`);if(pr.state!=='open')return{action:'NONE',reason:`PR is ${pr.state}`};if(!String(pr.head?.ref||'').startsWith('cloud/evolution-'))return{action:'NONE',reason:'not a CLOUD-01 evolution PR'};
  const candidate=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-candidate.json',pr.head.ref)).json;const expectedBase=candidate?.receipt?.baseSha||null;const currentMain=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;
  if(!expectedBase||expectedBase!==currentMain)return{action:'NONE',reason:'main drifted or candidate lacks exact-base receipt; stale candidate must not promote',expectedBase,currentMain};
  const headSha=pr.head.sha;const runs=await gh(token,`/repos/${repo}/actions/runs?head_sha=${headSha}&event=pull_request&per_page=100`);const byName=new Map((runs.workflow_runs||[]).map(r=>[r.name,r]));const missing=requiredWorkflows.filter(name=>!byName.has(name));const red=requiredWorkflows.filter(name=>{const r=byName.get(name);return r&&!(r.status==='completed'&&r.conclusion==='success')});
  if(missing.length||red.length)return{action:'NONE',reason:'exact candidate proof stack not fully green',missing,notGreen:red,headSha,currentMain};
  const recheck=(await gh(token,`/repos/${repo}/branches/main`)).commit.sha;if(recheck!==expectedBase)return{action:'NONE',reason:'main drifted during promotion gate',expectedBase,currentMain:recheck};
  const stateOnly=candidate?.sourceAdvance===false||candidate?.status==='DECLINE_SCARS_PENDING_PROOF';
  const merge=await gh(token,`/repos/${repo}/pulls/${prNumber}/merge`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({sha:headSha,merge_method:'merge',commit_title:`Promote ${pr.title}`,commit_message:stateOnly?`Expected-head-locked CLOUD-01 governed state-receipt promotion; no product source advancement. ci.yml remains sole production deployment authority. R125/R147/R146/R141 preserved; R201/R203 tombstones remain retired.`:`Expected-head-locked CLOUD-01 source promotion. ci.yml remains sole production deployment authority. R125/R147/R146/R141 preserved; R201/R203 tombstones remain retired.`})});
  return{action:'MERGED_GREEN_EXACT_HEAD',headSha,baseSha:expectedBase,mergeSha:merge.sha,merged:merge.merged===true};
}

export async function runAutonomousCycle({token,repo='medicinalElJefe/OMEGAv6',runtimeBase,ai=null,model=R314_AI_REPAIR_MODEL_DEFAULT}){
  const main=await gh(token,`/repos/${repo}/branches/main`);const state=(await getRepoFile(token,repo,'public/omega-r170-selfbuild-state.json',main.commit.sha)).json;const candidatePolicy=validateAutonomousCandidatePolicyR245(state.autonomousCandidatePolicy);
  if(!candidatePolicy.valid)return{ok:false,state:'BLOCKED',reason:`canonical autonomous candidate policy invalid: ${candidatePolicy.reasons.join(',')}`};
  const open=await gh(token,`/repos/${repo}/pulls?state=open&base=main&per_page=100`);const autonomous=(open||[]).filter(pr=>isAutonomousCandidateBranchR245(pr.head?.ref,candidatePolicy.policy)).sort((a,b)=>a.number-b.number);
  if(autonomous.length>1)return{ok:false,state:'BLOCKED',reason:'multiple open governed autonomous candidate PRs require review',prs:autonomous.map(x=>x.number),branches:autonomous.map(x=>x.head?.ref)};
  if(autonomous.length===1){const held=autonomous[0];if(String(held.head?.ref||'').startsWith('cloud/evolution-')){const promotion=await promoteGreenCloudPr({token,repo,prNumber:held.number});return{ok:true,state:promotion.action==='MERGED_GREEN_EXACT_HEAD'?'PROMOTED':'HELD_FOR_PROOF',promotion}}return{ok:true,state:'HELD_FOR_R170_CANDIDATE',reason:'shared one-open-autonomous-candidate fence holds CLOUD-01 while the R170 candidate exists',prNumber:held.number,branch:held.head?.ref}}
  const proposal=await proposeCycle({token,repo,runtimeBase,ai,model});return{ok:true,state:['BRANCH_AND_PR_CREATED','R314_AI_BRANCH_AND_PR_CREATED','R388_BACKLOG_BRANCH_AND_PR_CREATED'].includes(proposal.mutation)?'PROPOSED':'OBSERVE_ONLY',proposal:{mainSha:proposal.mainSha,mutation:proposal.mutation,decision:proposal.decision,branch:proposal.branch||null,prNumber:proposal.prNumber||null,prUrl:proposal.prUrl||null,capsuleId:proposal.capsuleId||null,residualId:proposal.residualId||null,residualFingerprint:proposal.residualFingerprint||null,itemId:proposal.itemId||null,reason:proposal.reason||null,repair:proposal.repair?{state:proposal.repair.state||null,reasons:proposal.repair.reasons||[],attempts:proposal.repair.attempts||[],rejectionHistory:proposal.repair.rejectionHistory||[],reformulated:proposal.repair.reformulated===true}:null,declinedItemScars:proposal.declinedItemScars||[]}}
}
