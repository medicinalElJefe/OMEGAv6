const upper=v=>String(v??'').trim().toUpperCase();

export const R246_AUTONOMOUS_CANDIDATE_LIFECYCLE='OMEGA_AUTONOMOUS_CANDIDATE_LIFECYCLE_R246';

export function decideAutonomousCandidateLifecycleR246(input={}){
  const branch=String(input.branch||'').trim();
  const baseSha=String(input.baseSha||'').trim();
  const currentMainSha=String(input.currentMainSha||'').trim();
  const prState=upper(input.prState||'NONE');
  const productionProven=input.productionProven===true;
  const prCi=upper(input.prCi||'NOT_ATTEMPTED');

  const result={
    schema:R246_AUTONOMOUS_CANDIDATE_LIFECYCLE,
    branch,
    baseSha,
    currentMainSha,
    prState,
    prCi,
    productionProven,
    action:'NOOP',
    reason:'NO_CANDIDATE_BRANCH',
    closePr:false,
    deleteBranch:false,
    requiresAttention:false,
  };

  if(!branch)return result;
  if(productionProven){
    return {...result,action:'DELETE_BRANCH',reason:'PRODUCTION_PROVEN_TERMINAL_CLEANUP',deleteBranch:true};
  }
  if(prState==='NONE'){
    return {...result,action:'DELETE_BRANCH',reason:'ORPHAN_BRANCH_WITHOUT_PR',deleteBranch:true};
  }
  if(prState==='CLOSED'){
    return {...result,action:'DELETE_BRANCH',reason:'CLOSED_UNMERGED_CANDIDATE',deleteBranch:true};
  }
  if(prState==='MERGED'){
    return {...result,action:'PRESERVE',reason:'MERGED_SOURCE_AWAITS_CANONICAL_PRODUCTION_PROOF',requiresAttention:true};
  }
  if(prState==='OPEN'&&baseSha&&currentMainSha&&baseSha!==currentMainSha){
    return {...result,action:'CLOSE_PR_DELETE_BRANCH',reason:'STALE_BASE_AFTER_LEGITIMATE_MAIN_ADVANCEMENT',closePr:true,deleteBranch:true};
  }
  if(prState==='OPEN'){
    return {...result,action:'PRESERVE',reason:prCi==='PASS'?'OPEN_EXACT_HEAD_AWAITS_PROMOTION':'OPEN_EXACT_HEAD_REQUIRES_GATE_ATTENTION',requiresAttention:prCi!=='PASS'};
  }
  return {...result,action:'PRESERVE',reason:'UNKNOWN_PR_STATE_FAIL_CLOSED',requiresAttention:true};
}

if(import.meta.url===`file://${process.argv[1]}`){
  const input=JSON.parse(process.env.OMEGA_R246_LIFECYCLE_INPUT||'{}');
  process.stdout.write(`${JSON.stringify(decideAutonomousCandidateLifecycleR246(input))}\n`);
}
