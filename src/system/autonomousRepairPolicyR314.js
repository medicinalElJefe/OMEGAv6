export const R314_AUTONOMOUS_REPAIR_SCHEMA='OMEGA_AUTONOMOUS_REPAIR_POLICY_R314';
export const R314_AI_REPAIR_MODEL_DEFAULT='@cf/google/gemma-4-26b-a4b-it';
export const R314_AI_MAX_FILES=2;
export const R314_AI_MAX_REPLACEMENTS_PER_FILE=8;
export const R314_AI_MAX_CHANGED_CHARS=12000;
export const R314_AI_MAX_ATTEMPTS=3;

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
 for(const [index,file] of files.entries()){
  const path=pathText(file?.path),policy=repairPathPolicyR314(path),context=supplied.get(path);
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

export function autonomousRepairPromptR314({residual,stage,contextFiles}){
 const context=contextFiles.map(file=>({path:file.path,sha:file.sha,text:file.text}));
 return `You are the bounded OMEGAv6 R314 product-source repair proposer. Return JSON only.\n\nRules:\n- Schema must be ${R314_AUTONOMOUS_REPAIR_SCHEMA}.\n- Repair only the supplied files and bind every file to its supplied preimage SHA.\n- Maximum ${R314_AI_MAX_FILES} files and ${R314_AI_MAX_REPLACEMENTS_PER_FILE} exact replacements per file.\n- Use replacements [{before,after}] where before occurs exactly once in the supplied source.\n- Do not edit tests, workflows, deployment, cloud evolution, self-build governance, authentication, secrets, Canon admission, workers, or generated projections.\n- Do not claim scientific, device, runtime, deployment or Canon truth.\n- canonicalAdmission and directProductionMutation must both be false.\n- expectedProofs must name existing independent proof families that should validate the change.\n- No safe patch is a valid outcome: if the residual cannot be safely improved using only supplied source, return files:[]; the governor will reject it rather than fabricate progress.\n\nRESIDUAL\n${JSON.stringify(residual)}\n\nBUILD STAGE\n${JSON.stringify(stage)}\n\nEXACT SOURCE CONTEXT\n${JSON.stringify(context)}`;
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
 };
}

const clipFeedback=value=>{const text=String(value??'');return text.length<=1200?text:`${text.slice(0,1200)}…[TRUNCATED]`};
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
 if(/_SHA_MISMATCH$/.test(r))return 'Copy the supplied exact source SHA for that file without modification.';
 if(/_REPLACEMENT_COUNT$/.test(r))return `Use 1..${R314_AI_MAX_REPLACEMENTS_PER_FILE} replacements for each proposed file.`;
 if(/_NOOP$/.test(r))return 'Make before and after materially different, or remove that replacement.';
 if(/_CONTROL_OR_SECRET_PATTERN$/.test(r))return 'Remove control-plane, credential, deployment, Canon-admission, or secret-like content; keep the patch product-source only.';
 if(/_PREIMAGE_OCCURRENCES_0$/.test(r))return 'Choose a before string copied exactly from supplied source.';
 if(/_PREIMAGE_OCCURRENCES_[2-9]\d*$/.test(r))return 'Make the before string more specific until it occurs exactly once in supplied source.';
 if(r==='PATCH_SIZE_OUT_OF_BOUNDS')return `Narrow the patch below the unchanged ${R314_AI_MAX_CHANGED_CHARS}-character validator limit.`;
 if(r==='CANON_ADMISSION_MUST_BE_FALSE')return 'Set canonicalAdmission to false.';
 if(r==='DIRECT_PRODUCTION_MUTATION_MUST_BE_FALSE')return 'Set directProductionMutation to false.';
 if(r==='EXPECTED_PROOFS_REQUIRED')return 'Name at least one existing independent proof family in expectedProofs.';
 if(r.startsWith('AI_RESPONSE_PARSE_ERROR:'))return 'Return one valid JSON object only, with no prose or markdown.';
 return 'Correct only the stated validator defect; do not widen paths, authority, or claims.';
};

export function autonomousRepairCorrectionPromptR314({residual,stage,contextFiles,rejection,attempt}){
 const context=contextFiles.map(file=>({path:file.path,sha:file.sha,text:file.text}));
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
 };
 return `You are correcting a previously rejected bounded OMEGAv6 R314 product-source proposal. Return JSON only. This is a correction under the SAME authority membrane, not permission to widen it.\n\nImmutable rules:\n- Schema must be ${R314_AUTONOMOUS_REPAIR_SCHEMA}.\n- Repair only the supplied files and bind every file to its supplied preimage SHA.\n- Maximum ${R314_AI_MAX_FILES} files and ${R314_AI_MAX_REPLACEMENTS_PER_FILE} exact replacements per file.\n- Every before string must occur exactly once in the supplied exact source.\n- Do not edit tests, workflows, deployment, cloud evolution, self-build governance, authentication, secrets, Canon admission, workers, or generated projections.\n- Do not claim scientific, device, runtime, deployment or Canon truth.\n- canonicalAdmission and directProductionMutation must both be false.\n- expectedProofs must name existing independent proof families.\n- Never work around a rejection code. Correct the proposal so the unchanged validator accepts it.\n- If no compliant patch exists, return files:[].\n\nVALIDATOR REJECTION EVIDENCE\n${JSON.stringify(rejectionEvidence)}\n\nRESIDUAL\n${JSON.stringify(residual)}\n\nBUILD STAGE\n${JSON.stringify(stage)}\n\nEXACT SOURCE CONTEXT\n${JSON.stringify(context)}`;
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
]);
