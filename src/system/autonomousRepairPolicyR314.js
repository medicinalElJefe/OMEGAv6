import {buildResultConditionedAnchorSurfaceR506,requiresResultConditionedReanchorR506} from './resultConditionedCorrectionR506.js';

export const R314_AUTONOMOUS_REPAIR_SCHEMA='OMEGA_AUTONOMOUS_REPAIR_POLICY_R314';
export const R314_AI_REPAIR_MODEL_DEFAULT='@cf/meta/llama-3.3-70b-instruct-fp8-fast';
export const R314_AI_MAX_FILES=2;
export const R314_AI_MAX_REPLACEMENTS_PER_FILE=8;
export const R314_AI_MAX_CHANGED_CHARS=12000;
export const R314_AI_MAX_ATTEMPTS=2;
export const R314_AI_MAX_OUTPUT_TOKENS=3500;
export const R314_AI_CORRECTION_MAX_OUTPUT_TOKENS=5000;

const ALLOWED_PREFIXES=Object.freeze(['src/']);
const FORBIDDEN_PREFIXES=Object.freeze([
 '.github/','cloudflare/','tests/','scripts/','public/','docs/','node_modules/',
 'src/generated/','src/system/governedSelfBuild','src/system/autonomousConvergence','src/system/autonomousRepairPolicy',
 'src/canon','src/worker','src/workerR','src/api/','src/release','src/deploy','src/auth','src/security',
]);
const FORBIDDEN_FILES=new Set(['package.json','package-lock.json','wrangler.jsonc','wrangler.evolution-machine-r223.jsonc']);
const SECRET_PATTERN=/(api[_-]?key|secret|password|token|private[_-]?key|authorization\s*:|bearer\s+[a-z0-9._-]{10,})/i;
const CONTROL_PATTERN=/(github\.token|process\.env|env\.[A-Z0-9_]*(TOKEN|SECRET|KEY)|wrangler\s+deploy|gh\s+pr\s+merge|git\s+push\s+.*main|canonicalAdmission\s*:\s*true)/i;
const pathText=value=>String(value??'').trim().replace(/\\/g,'/').replace(/^\.\//,'');
const safePath=path=>{
 const p=pathText(path);
 if(!p||p.startsWith('/')||/^[A-Za-z]:/.test(p)||p.split('/').includes('..')||p.includes('\0'))return false;
 if(FORBIDDEN_FILES.has(p)||FORBIDDEN_PREFIXES.some(prefix=>p.startsWith(prefix)))return false;
 return ALLOWED_PREFIXES.some(prefix=>p.startsWith(prefix));
};

export function repairPathPolicyR314(path){
 const normalized=pathText(path);
 return{path:normalized,allowed:safePath(normalized),reason:safePath(normalized)?'product source path is inside R314 bounded mutation membrane':'path is outside the bounded product-source membrane'};
}

export function parseAiJsonR314(value){
 if(value&&typeof value==='object')return value;
 const raw=String(value??'').trim();
 if(!raw)throw new Error('R314 AI repair returned no content');
 const fenced=raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
 const candidate=fenced||raw.slice(raw.indexOf('{'),raw.lastIndexOf('}')+1);
 if(!candidate||!candidate.startsWith('{'))throw new Error('R314 AI repair did not return a JSON object');
 return JSON.parse(candidate);
}

export function validateAiRepairProposalR314(proposal,{contextFiles=[],residualId=null}={}){
 const reasons=[];
 if(!proposal||proposal.schema!==R314_AUTONOMOUS_REPAIR_SCHEMA)reasons.push('SCHEMA_MISMATCH');
 if(residualId&&String(proposal?.residualId||'')!==String(residualId))reasons.push('RESIDUAL_BINDING_MISMATCH');
 const files=Array.isArray(proposal?.files)?proposal.files:[];
 if(files.length<1||files.length>R314_AI_MAX_FILES)reasons.push('FILE_COUNT_OUT_OF_BOUNDS');
 const supplied=new Map((contextFiles||[]).map(file=>[pathText(file.path),file]));
 let changedChars=0;
 const seenPaths=new Set();
 for(const [index,file] of files.entries()){
  const path=pathText(file?.path),policy=repairPathPolicyR314(path),context=supplied.get(path);
  if(seenPaths.has(path))reasons.push(`FILE_${index+1}_DUPLICATE_PATH`);else seenPaths.add(path);
  if(!policy.allowed)reasons.push(`FILE_${index+1}_PATH_FORBIDDEN`);
  if(!context)reasons.push(`FILE_${index+1}_NOT_IN_CONTEXT`);
  if(context&&String(file?.preimageSha||'')!==String(context.sha||''))reasons.push(`FILE_${index+1}_SHA_MISMATCH`);
  const replacements=Array.isArray(file?.replacements)?file.replacements:[];
  if(replacements.length<1||replacements.length>R314_AI_MAX_REPLACEMENTS_PER_FILE)reasons.push(`FILE_${index+1}_REPLACEMENT_COUNT`);
  const source=String(context?.text??'');
  let working=source;
  for(const [rIndex,replacement] of replacements.entries()){
   const before=String(replacement?.before??''),after=String(replacement?.after??'');
   if(!before||before===after)reasons.push(`FILE_${index+1}_REPLACEMENT_${rIndex+1}_NOOP`);
   if(SECRET_PATTERN.test(after)||CONTROL_PATTERN.test(after))reasons.push(`FILE_${index+1}_REPLACEMENT_${rIndex+1}_CONTROL_OR_SECRET_PATTERN`);
   const occurrences=before?working.split(before).length-1:0;
   if(occurrences!==1)reasons.push(`FILE_${index+1}_REPLACEMENT_${rIndex+1}_PREIMAGE_OCCURRENCES_${occurrences}`);
   if(occurrences===1)working=working.replace(before,after);
   changedChars+=Math.abs(after.length-before.length)+before.length+after.length;
  }
 }
 if(changedChars>R314_AI_MAX_CHANGED_CHARS)reasons.push('PATCH_SIZE_OUT_OF_BOUNDS');
 if(proposal?.canonicalAdmission!==false)reasons.push('CANON_ADMISSION_MUST_BE_FALSE');
 if(proposal?.directProductionMutation!==false)reasons.push('DIRECT_PRODUCTION_MUTATION_MUST_BE_FALSE');
 if(!Array.isArray(proposal?.expectedProofs)||proposal.expectedProofs.length<1)reasons.push('EXPECTED_PROOFS_REQUIRED');
 return{valid:reasons.length===0,reasons,changedChars,fileCount:files.length};
}

export function applyAiRepairProposalR314(proposal,{contextFiles=[],residualId=null}={}){
 const checked=validateAiRepairProposalR314(proposal,{contextFiles,residualId});
 if(!checked.valid)throw new Error(`R314 AI repair rejected: ${checked.reasons.join(',')}`);
 const supplied=new Map(contextFiles.map(file=>[pathText(file.path),file]));
 return proposal.files.map(file=>{
  const path=pathText(file.path),context=supplied.get(path);let next=String(context.text);
  for(const replacement of file.replacements)next=next.replace(String(replacement.before),String(replacement.after));
  if(next===String(context.text))throw new Error(`R314 AI repair produced no change for ${path}`);
  return{path,preimageSha:String(context.sha),content:next,replacementCount:file.replacements.length};
 });
}

export function calculusNativeRepairInstructionsR504(stage){
 const packet=stage?.calculusWorkerPacket;
 if(!packet)return '';
 return `
R503/R504 CALCULUS-NATIVE WORKER ADMISSION AND DECISION CONTINUITY\nR505 APPLIED CALCULUS REASONING LAYER
- The supplied calculusWorkerPacket is an exact-base governing envelope. Do not rewrite or invent its immutable authority law.
- Return calculusContextId exactly equal to calculusWorkerPacket.contextId.
- The system deterministically binds the immutable R503 workerAttestation from that exact packet. Your job is to APPLY the calculus, not recite boilerplate.
- Return alternativesConsidered with at least two distinct admissible options and selectedAlternative equal to exactly one member of alternativesConsidered.
- Return appliedCalculus with at least two distinct operators/laws actually used in the decision. Values must come from the supplied packet calculus/decision/proof/relational law or CAPABILITY_LINEAGE_NOT_ROUTE / HEIGHTENED_MODE.
- Return decision as exactly STAY, TURN, or ESCALATE and decisionRationale as a concise explanation grounded in the supplied residual, evidence and exact source.
- Return residualEvidenceIds with at least one bound evidence id.
- Return developmentalDelta with EXACTLY these required [0,1] numeric fields in addition to targetCapability and intendedResidual: capabilityGain, coherenceGain, autonomyGain, usabilityGain, recoverabilityGain, regressionRisk, duplicationRisk, authorityFragmentationRisk.
- developmentalDelta.intendedResidual must equal the supplied residual id.
- A source mutation requires decision TURN and a positive R503 ΔΩ score. STAY or ESCALATE must not fabricate a source mutation.
- A claimed positive delta is planning evidence only and never proof of runtime, production, scientific or Canon truth.
- If correcting a rejected patch, preserve calculusContextId, appliedCalculus, alternatives, evidence, delta and decision continuity while correcting only the rejected defect.
- Never drop workerAttestation semantics: R505 binds the immutable attestation deterministically after your applied-reasoning payload is returned.
`;
}

export function autonomousRepairPromptR314({residual,stage,contextFiles}){
 const context=contextFiles.map(file=>({path:file.path,sha:file.sha,text:file.text}));


 return `You are the bounded OMEGAv6 R314 product-source repair proposer. Return JSON only.\n\nRules:\n- Schema must be ${R314_AUTONOMOUS_REPAIR_SCHEMA}.\n- Repair only the supplied files and bind every file to its supplied preimage SHA.\n- Maximum ${R314_AI_MAX_FILES} files and ${R314_AI_MAX_REPLACEMENTS_PER_FILE} exact replacements per file.\n- Use replacements [{before,after}] where before occurs exactly once in the supplied source.\n- Prefer the smallest material patch: one file when sufficient and 1-3 replacements per file when possible.\n- Do not edit tests, workflows, deployment, cloud evolution, self-build governance, authentication, secrets, Canon admission, workers, or generated projections.\n- Do not claim scientific, device, runtime, deployment or Canon truth.\n- canonicalAdmission and directProductionMutation must both be false.\n- expectedProofs must name existing independent proof families that should validate the change.\n- No safe patch is a valid outcome: if the residual cannot be safely improved using only supplied source, return files:[]; the governor will reject it rather than fabricate progress.\n${calculusNativeRepairInstructionsR504(stage)}\nRESIDUAL\n${JSON.stringify(residual)}\n\nBUILD STAGE\n${JSON.stringify(stage)}\n\nEXACT SOURCE CONTEXT\n${JSON.stringify(context)}`;
}

export function summarizeAiProposalR314(proposal){
 const files=Array.isArray(proposal?.files)?proposal.files:[];
 return{
  schema:proposal?.schema||null,
  residualId:proposal?.residualId||null,
  files:files.map(file=>({path:pathText(file?.path),preimageSha:String(file?.preimageSha||''),replacementCount:Array.isArray(file?.replacements)?file.replacements.length:0})),
  canonicalAdmission:proposal?.canonicalAdmission,
  directProductionMutation:proposal?.directProductionMutation,
  expectedProofs:Array.isArray(proposal?.expectedProofs)?proposal.expectedProofs.slice(0,16):[],
  workerContextId:proposal?.workerAttestation?.contextId||proposal?.calculusContextId||null,
  calculusContextId:proposal?.calculusContextId||null,
  appliedCalculus:Array.isArray(proposal?.appliedCalculus)?proposal.appliedCalculus.slice(0,12):[],
  selectedAlternative:proposal?.selectedAlternative||null,
  decision:proposal?.decision||null,
  decisionRationale:proposal?.decisionRationale||null,
  developmentalDelta:proposal?.developmentalDelta||null,
 };
}

const clipFeedback=value=>{const text=String(value??'');return text.length<=1200?text:`${text.slice(0,1200)}…[TRUNCATED]`};
const stalePreimageTokensR461=value=>{
 const raw=String(value??'');
 return[...new Set((raw.match(/[A-Za-z_$][A-Za-z0-9_$]{2,}/g)||[]).filter(token=>!/^(const|let|var|return|function|true|false|null|undefined|class|export|import|from|async|await|new|if|else|for|while|switch|case|break|default|throw|try|catch|finally|this|typeof|instanceof)$/.test(token)))].slice(0,12);
};
const stalePreimageRecoveryR461=({rejection,contextFiles=[]}={})=>{
 const reasons=Array.isArray(rejection?.reasons)?rejection.reasons.map(String):[];
 if(!reasons.some(reason=>/_PREIMAGE_OCCURRENCES_0$/.test(reason)))return null;
 const supplied=new Map((contextFiles||[]).map(file=>[pathText(file.path),file]));
 const anchors=[];
 for(const file of Array.isArray(rejection?.proposal?.files)?rejection.proposal.files:[]){
  const path=pathText(file?.path),context=supplied.get(path);if(!context)continue;
  const source=String(context.text??'');
  for(const replacement of Array.isArray(file?.replacements)?file.replacements:[]){
   const rejectedBefore=String(replacement?.before??'');
   const tokens=stalePreimageTokensR461(rejectedBefore);
   const windows=[];
   for(const token of tokens){
    let from=0;
    while(windows.length<4){
     const at=source.indexOf(token,from);if(at<0)break;
     const start=Math.max(0,at-180),end=Math.min(source.length,at+token.length+260);
     const exact=source.slice(start,end);
     if(exact&&!windows.some(row=>row.exact===exact))windows.push({token,start,end,exact});
     from=at+token.length;
    }
    if(windows.length>=4)break;
   }
   anchors.push({
    path,
    currentSha:String(context.sha||''),
    rejectedBefore:clipFeedback(rejectedBefore),
    rejectedBeforeCurrentOccurrences:rejectedBefore?source.split(rejectedBefore).length-1:0,
    exactCurrentAnchors:windows,
   });
  }
 }
 return{schema:'OMEGA_R461_STALE_PREIMAGE_RECOVERY',anchors};
};
const currentSourceAnchorsR463=({residual,stage,contextFiles=[]}={})=>{
 const semanticText=JSON.stringify({residual,stage});
 const tokens=[...new Set((semanticText.match(/[A-Za-z_$][A-Za-z0-9_$]{3,}/g)||[]).filter(token=>!/^(schema|state|stage|false|true|null|undefined|source|repair|residual|expected|proofs|current|exact|files|file|path|target|objective|section|item|canonical|admission|production|mutation)$/i.test(token)))].slice(0,32);
 const files=[];
 for(const context of contextFiles||[]){
  const source=String(context?.text??'');if(!source)continue;
  const anchors=[];
  for(const token of tokens){
   let from=0;
   while(anchors.length<8){
    const at=source.indexOf(token,from);if(at<0)break;
    let start=source.lastIndexOf('\n',Math.max(0,at-1));start=start<0?0:start+1;
    let end=source.indexOf('\n',at+token.length);end=end<0?source.length:end;
    if(end-start<48){
     const next=source.indexOf('\n',Math.min(source.length,end+1));
     if(next>0)end=next;
    }
    const exact=source.slice(start,end);
    const occurrences=exact?source.split(exact).length-1:0;
    if(exact&&occurrences===1&&!anchors.some(row=>row.exact===exact))anchors.push({id:`A${anchors.length+1}`,token,start,end,exact});
    from=at+token.length;
   }
   if(anchors.length>=8)break;
  }
  if(anchors.length)files.push({path:pathText(context.path),currentSha:String(context.sha||''),anchors});
 }
 return{schema:'OMEGA_R463_CURRENT_SOURCE_ANCHORS',files};
};
const correctionProposalR314=proposal=>({
 ...summarizeAiProposalR314(proposal),
 files:(Array.isArray(proposal?.files)?proposal.files:[]).map(file=>({
  path:pathText(file?.path),
  preimageSha:String(file?.preimageSha||''),
  replacements:(Array.isArray(file?.replacements)?file.replacements:[]).slice(0,R314_AI_MAX_REPLACEMENTS_PER_FILE).map(row=>({before:clipFeedback(row?.before),after:clipFeedback(row?.after)})),
 })),
});
const validatorGuidanceR314=reason=>{
 const r=String(reason||'');
 if(r==='SCHEMA_MISMATCH')return `Use schema exactly ${R314_AUTONOMOUS_REPAIR_SCHEMA}.`;
 if(r==='RESIDUAL_BINDING_MISMATCH')return 'Set residualId exactly to the supplied residual id.';
 if(r==='FILE_COUNT_OUT_OF_BOUNDS')return `Return between 1 and ${R314_AI_MAX_FILES} files, unless explicitly declining with files:[].`;
 if(/_PATH_FORBIDDEN$/.test(r)||/_NOT_IN_CONTEXT$/.test(r))return 'Use only paths present in EXACT SOURCE CONTEXT; do not substitute adjacent governance/test/deployment files.';
 if(/_DUPLICATE_PATH$/.test(r))return 'Return each exact source path at most once; combine replacements for the same file into one file entry.';
 if(/_SHA_MISMATCH$/.test(r))return 'Copy the supplied exact source SHA for that file without modification.';
 if(/_REPLACEMENT_COUNT$/.test(r))return `Use 1..${R314_AI_MAX_REPLACEMENTS_PER_FILE} replacements for each proposed file.`;
 if(/_NOOP$/.test(r))return 'Make before and after materially different, or remove that replacement.';
 if(/_CONTROL_OR_SECRET_PATTERN$/.test(r))return 'Remove control-plane, credential, deployment, Canon-admission, or secret-like content; keep the patch product-source only.';
 if(/_PREIMAGE_OCCURRENCES_0$/.test(r))return 'R506 result channel: select anchorId from resultConditionedAnchorsR506. The runtime binds before and current preimage SHA from that exact current-source anchor; do not freehand or reuse the stale before string.';
 if(/_PREIMAGE_OCCURRENCES_[2-9]\d*$/.test(r))return 'Make the before string more specific until it occurs exactly once in supplied source.';
 if(r==='PATCH_SIZE_OUT_OF_BOUNDS')return `Narrow the patch below the unchanged ${R314_AI_MAX_CHANGED_CHARS}-character validator limit.`;
 if(r==='CANON_ADMISSION_MUST_BE_FALSE')return 'Set canonicalAdmission to false.';
 if(r==='DIRECT_PRODUCTION_MUTATION_MUST_BE_FALSE')return 'Set directProductionMutation to false.';
 if(r==='EXPECTED_PROOFS_REQUIRED')return 'Name at least one existing independent proof family in expectedProofs.';
 if(r.startsWith('R504_'))return 'Restore the exact R503/R504 calculus decision contract: exact context/base, named alternative, STAY/TURN/ESCALATE, residual-bound eight-field developmental delta, vetoes, and positive delta for mutation.';
 if(r==='MODEL_DECLINED_BOUNDED_PATCH')return 'Reassess the supplied exact source against the residual and attempt the smallest material compliant patch; return files:[] again only if no such patch exists.';
 if(r.startsWith('AI_RESPONSE_PARSE_ERROR:'))return 'Return one valid JSON object only, with no prose or markdown.';
 if(r.startsWith('AI_RUN_ERROR:'))return 'Retry the same bounded task under the unchanged structured-output schema; do not widen scope or authority.';
 return 'Correct only the stated validator defect; do not widen paths, authority, or claims.';
};

export function autonomousRepairCorrectionPromptR314({residual,stage,contextFiles,rejection,attempt}){
 const context=contextFiles.map(file=>({path:file.path,sha:file.sha,text:file.text}));
 const stalePreimageRecovery=stalePreimageRecoveryR461({rejection,contextFiles});
 const resultConditionedAnchorsR506=requiresResultConditionedReanchorR506(rejection)
  ?buildResultConditionedAnchorSurfaceR506({residual,stage,contextFiles,rejection})
  :null;
 const rejectionEvidence={
  attempt:Number(attempt||0),
  state:String(rejection?.state||'REJECTED_BY_R314_POLICY'),
  reasons:Array.isArray(rejection?.reasons)?rejection.reasons.map(String):[],
  guidance:(Array.isArray(rejection?.reasons)?rejection.reasons:[]).map(validatorGuidanceR314),
  validation:rejection?.validation?{
   changedChars:Number(rejection.validation.changedChars||0),
   fileCount:Number(rejection.validation.fileCount||0),
  }:null,
  proposal:correctionProposalR314(rejection?.proposal),
  stalePreimageRecovery,
  resultConditionedAnchorsR506,
  currentSourceAnchors:currentSourceAnchorsR463({residual,stage,contextFiles}),
 };
 return `You are correcting a previously rejected bounded OMEGAv6 R314 product-source proposal. Return JSON only. This is a correction under the SAME authority membrane, not permission to widen it.\n\nImmutable rules:\n- Schema must be ${R314_AUTONOMOUS_REPAIR_SCHEMA}.\n- Repair only the supplied files and bind every file to its supplied preimage SHA.\n- Maximum ${R314_AI_MAX_FILES} files and ${R314_AI_MAX_REPLACEMENTS_PER_FILE} exact replacements per file.\n- Every before string must occur exactly once in the supplied exact source.
- If stalePreimageRecovery is present, rebuild the rejected replacement from one of its exactCurrentAnchors or another exact unique fragment copied from CURRENT source. Do not reuse rejectedBefore unless its current occurrence count is exactly 1.
- R506 RESULT CHANNEL: when resultConditionedAnchorsR506 is present, every corrected replacement MUST set anchorId to one exact anchor id from the matching file. You may omit before or leave it stale: the runtime will replace before and preimageSha with the exact current-source anchor and current SHA before the unchanged R314 validator runs. Prefer the anchor whose token and exact text best match the intended change. If no supplied anchor safely expresses the intended change, return files:[].
- Treat currentSha and CURRENT source text as authoritative; stale rejected proposal text is evidence only, never a source of truth.\n- If the previous attempt was NO_SAFE_PATCH, currentSourceAnchors is the machine-derived re-entry surface: choose a semantically relevant anchor and copy its exact text verbatim as before. Do not reconstruct before from memory, the residual narrative, or an older proposal.\n- currentSourceAnchors contain only exact fragments that occur once in the CURRENT supplied blob; using one does not waive any unchanged R314 validator rule.
${calculusNativeRepairInstructionsR504(stage)}
- Prefer the smallest correction that resolves the listed validator defects; do not expand scope.\n- Keep the correction response compact enough to complete as one JSON object: prefer one file, no more than 3 replacements, and short exact local before/after fragments rather than whole functions or files.\n- Do not emit a replacement whose before or after text exceeds 1600 characters. If the only conceivable change would require a larger response, return files:[] instead of risking a truncated proposal.\n- Do not edit tests, workflows, deployment, cloud evolution, self-build governance, authentication, secrets, Canon admission, workers, or generated projections.\n- Do not claim scientific, device, runtime, deployment or Canon truth.\n- canonicalAdmission and directProductionMutation must both be false.\n- expectedProofs must name existing independent proof families.\n- Never work around a rejection code. Correct the proposal so the unchanged validator accepts it.\n- If no compliant patch exists, return files:[].\n\nVALIDATOR REJECTION EVIDENCE\n${JSON.stringify(rejectionEvidence)}\n\nRESIDUAL\n${JSON.stringify(residual)}\n\nBUILD STAGE\n${JSON.stringify(stage)}\n\nEXACT SOURCE CONTEXT\n${JSON.stringify(context)}`;
}

export const R314_AUTONOMOUS_REPAIR_LAWS=Object.freeze([
 'AI_NEVER_EDITS_ITS_OWN_GOVERNANCE',
 'AI_NEVER_EDITS_TESTS_OR_PROOF_GATES',
 'AI_NEVER_EDITS_DEPLOYMENT_OR_SECRETS',
 'AI_PATCH_BINDS_EXACT_PREIMAGE_SHA',
 'AI_PATCH_USES_EXACT_UNIQUE_REPLACEMENTS',
 'AI_PATCH_IS_BRANCH_ONLY_AND_PROOF_GATED',
 'AI_NO_SAFE_PATCH_MEANS_NO_MUTATION',
 'AI_VALIDATOR_REJECTIONS_MAY_ONLY_NARROW_AND_REFORMULATE_WITHIN_THE_SAME_EXACT_SOURCE_MEMBRANE',
 'AI_REFORMULATION_BUDGET_IS_BOUNDED_AND_EVERY_ATTEMPT_REVALIDATES_FROM_SCRATCH',
 'AI_CORRECTION_TRANSPORT_HEADROOM_DOES_NOT_WIDEN_SEMANTIC_PATCH_AUTHORITY',
 'AI_ZERO_OCCURRENCE_PREIMAGE_MUST_REANCHOR_TO_CURRENT_EXACT_SOURCE_BEFORE_RETRY',
 'AI_DECLINED_FIRST_ATTEMPT_MUST_RECEIVE_MACHINE_DERIVED_CURRENT_SOURCE_ANCHORS_BEFORE_FINAL_REFORMULATION',
 'AI_DECODER_GUARANTEES_JSON_OBJECT_ONLY_R314_REMAINS_SOLE_SEMANTIC_PATCH_VALIDATOR',
]);
