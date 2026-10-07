import {
  R503_DECISION_LAW,
  R503_DELTA_FIELDS,
  R503_WORKER_ATTESTATION_SCHEMA,
  developmentalDeltaScoreR503,
} from '../../src/system/calculusNativeAutonomyR503.js';

export const R505_DECISION_CAPSULE_SCHEMA='OMEGA_RESULT_CONDITIONED_CALCULUS_DECISION_R505';
export const R505_DECISION_CONSEQUENCES=Object.freeze({
  STAY:'CARRY_OBSERVE',
  TURN:'PROPOSE_BOUNDED_SOURCE',
  ESCALATE:'REQUEST_ADDITIONAL_EVIDENCE',
});

const nonEmpty=v=>typeof v==='string'&&v.trim().length>0;
const bounded01=v=>Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=1;
const exactArray=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const unique=a=>[...new Set(Array.isArray(a)?a.map(String):[])];

const EXPECTED_RECONSTRUCTION=Object.freeze({
  canonAdmission:'R125',
  executionReceipt:'R142',
  residualEvidence:'R164',
  sourcePromotion:'R240',
  productionWriter:'ci.yml',
  capabilityConvergenceUnit:'CAPABILITY_LINEAGE_NOT_ROUTE',
  developmentalMode:'HEIGHTENED_MODE',
  decisionLaw:Object.freeze(['STAY','TURN','ESCALATE']),
  growthDefinition:'INCREASE_IN_REACHABLE_COHERENT_LAWFUL_POSSIBILITY',
  proofSequence:Object.freeze(['PRUNE','TRANSLATE','PROVE']),
  physicalDimensionInflation:false,
  presentationDefinesCapability:false,
  rendererMayRewriteTruth:false,
  canonicalMutation:false,
});

const EXPECTED_VETOES=Object.freeze({
  newPhysicalPrimitive:false,
  canonAuthorityChange:false,
  truthClassInflation:false,
  presentationAsAuthority:false,
  directProductionMutation:false,
});

function responsePayload(result){
  if(typeof result==='string')return result;
  if(result?.response!==undefined)return result.response;
  if(result?.text!==undefined)return result.text;
  if(result?.result?.response!==undefined)return result.result.response;
  if(result?.result?.text!==undefined)return result.result.text;
  return result??{};
}

function parseObject(raw){
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))return raw;
  const text=String(raw??'').trim();
  if(!text)throw new Error('R505_EMPTY_DECISION_RESPONSE');
  return JSON.parse(text);
}

export function validateCalculusDecisionCapsuleR505(packet,capsule,{residualId=null}={}){
  const reasons=[];
  if(capsule?.schema!==R505_DECISION_CAPSULE_SCHEMA)reasons.push('R505_SCHEMA_INVALID');
  if(capsule?.contextId!==packet?.contextId)reasons.push('R505_CONTEXT_ID_MISMATCH');
  if(capsule?.baseSha!==packet?.baseSha)reasons.push('R505_BASE_SHA_MISMATCH');
  if(residualId&&String(capsule?.residualId||'')!==String(residualId))reasons.push('R505_RESIDUAL_ID_MISMATCH');

  const reconstruction=capsule?.reconstruction||{};
  for(const [key,value] of Object.entries(EXPECTED_RECONSTRUCTION)){
    if(Array.isArray(value)){
      if(!exactArray(reconstruction[key],value))reasons.push('R505_RECONSTRUCTION_'+key.toUpperCase()+'_INVALID');
    }else if(reconstruction[key]!==value)reasons.push('R505_RECONSTRUCTION_'+key.toUpperCase()+'_INVALID');
  }

  const vetoes=capsule?.vetoes||{};
  for(const [key,value] of Object.entries(EXPECTED_VETOES)){
    if(vetoes[key]!==value)reasons.push('R505_VETO_'+key.toUpperCase()+'_INVALID');
  }

  const alternatives=unique(capsule?.alternativesConsidered);
  if(alternatives.length<2)reasons.push('R505_MULTIPLE_ALTERNATIVES_REQUIRED');
  if(!nonEmpty(capsule?.selectedAlternative)||!alternatives.includes(String(capsule.selectedAlternative)))reasons.push('R505_SELECTED_ALTERNATIVE_INVALID');
  const decision=String(capsule?.decision||'');
  if(!R503_DECISION_LAW.includes(decision))reasons.push('R505_DECISION_INVALID');
  if(String(capsule?.decisionRationale||'').trim().length<24)reasons.push('R505_DECISION_RATIONALE_TOO_THIN');

  const evidence=unique(capsule?.residualEvidenceIds).filter(nonEmpty);
  if(evidence.length<1)reasons.push('R505_RESIDUAL_EVIDENCE_REQUIRED');

  const delta=capsule?.developmentalDelta||{};
  if(!nonEmpty(delta.targetCapability)||!nonEmpty(delta.intendedResidual))reasons.push('R505_DELTA_TARGET_REQUIRED');
  if(residualId&&String(delta.intendedResidual||'')!==String(residualId))reasons.push('R505_DELTA_RESIDUAL_MISMATCH');
  for(const field of R503_DELTA_FIELDS)if(!bounded01(delta[field]))reasons.push('R505_DELTA_'+field.toUpperCase()+'_INVALID');
  const score=developmentalDeltaScoreR503(delta);
  if(decision==='TURN'&&!(score>0))reasons.push('R505_TURN_REQUIRES_POSITIVE_DELTA');

  return{
    schema:R505_DECISION_CAPSULE_SCHEMA,
    valid:reasons.length===0,
    reasons,
    decision:decision||null,
    consequence:R505_DECISION_CONSEQUENCES[decision]||null,
    developmentalDeltaScore:score,
    sourceMutationRequested:decision==='TURN',
    canonicalMutation:false,
    canonicalAdmission:false,
  };
}

export function bindCalculusDecisionCapsuleR505(packet,proposal,capsule,{residualId=null}={}){
  const checked=validateCalculusDecisionCapsuleR505(packet,capsule,{residualId});
  if(!checked.valid)return{valid:false,reasons:checked.reasons,proposal:null,decision:checked};
  const reconstruction={
    ...capsule.reconstruction,
    decisionLaw:[...capsule.reconstruction.decisionLaw],
    proofSequence:[...capsule.reconstruction.proofSequence],
  };
  const workerAttestation={
    schema:R503_WORKER_ATTESTATION_SCHEMA,
    revision:'R503',
    workerClass:'REASONING_DEVELOPER',
    contextId:packet.contextId,
    baseSha:packet.baseSha,
    reconstruction,
    alternativesConsidered:[...capsule.alternativesConsidered],
    residualEvidenceIds:[...capsule.residualEvidenceIds],
    developmentalDelta:{...capsule.developmentalDelta},
    vetoes:{...capsule.vetoes},
    canonicalMutation:false,
  };
  return{
    valid:true,
    reasons:[],
    decision:checked,
    proposal:{
      ...proposal,
      workerAttestation,
      developmentalDelta:{...capsule.developmentalDelta},
      alternativesConsidered:[...capsule.alternativesConsidered],
      residualEvidenceIds:[...capsule.residualEvidenceIds],
      selectedAlternative:capsule.selectedAlternative,
      decision:capsule.decision,
      decisionRationale:capsule.decisionRationale,
    },
  };
}

function decisionPrompt(packet,residual,stage,rejection=null){
  const compactPacket={
    schema:packet?.schema,
    revision:packet?.revision,
    contextId:packet?.contextId,
    baseSha:packet?.baseSha,
    architecture:packet?.architecture,
    calculus:packet?.calculus,
    authority:packet?.authority,
    truthBoundaries:packet?.truthBoundaries,
    developmentalContinuity:packet?.developmentalContinuity,
    workerContract:packet?.workerContract,
  };
  const correction=rejection?`\nPREVIOUS DECISION REJECTION\n${JSON.stringify(rejection)}\nCorrect exactly these defects without widening authority or changing the residual.\n`:'';
  return `You are the OMEGAv6 R505 result-conditioned calculus decision stage. Decide what the returned residual permits BEFORE any source patch is generated.

Return exactly one JSON object with:
- schema exactly ${R505_DECISION_CAPSULE_SCHEMA}
- exact contextId, baseSha and residualId
- reconstruction containing the exact R125/R142/R164/R240/ci.yml authority chain, CAPABILITY_LINEAGE_NOT_ROUTE, HEIGHTENED_MODE, STAY/TURN/ESCALATE, PRUNE/TRANSLATE/PROVE, the exact growth definition, and all false truth/authority mutation flags
- vetoes with every mutation/authority inflation veto false
- at least two distinct alternativesConsidered
- selectedAlternative exactly equal to one alternative
- decision exactly STAY, TURN or ESCALATE
- decisionRationale grounded in this residual and current authority
- residualEvidenceIds with at least one residual-bound evidence id
- developmentalDelta with targetCapability, intendedResidual and exactly these [0,1] metrics: capabilityGain, coherenceGain, autonomyGain, usabilityGain, recoverabilityGain, regressionRisk, duplicationRisk, authorityFragmentationRisk

Decision law:
- STAY means carry/observe; no source proposal follows.
- TURN means a bounded source proposal may follow only when developmental gain minus risk is positive.
- ESCALATE means request more evidence/proof; no source proposal follows.
- Planning delta is never runtime, deployment, scientific, or Canon proof.
- 12/144/1728/20736 and higher atlas values are representational address resolutions, never new physical dimensions.
- Do not invent observations, execution, device state, or Canon admission.
${correction}
CANONICAL CALCULUS PACKET
${JSON.stringify(compactPacket)}

RESIDUAL
${JSON.stringify(residual)}

STAGE IDENTITY
${JSON.stringify({id:stage?.id||null,paths:stage?.paths||[],itemId:stage?.itemId||null,section:stage?.section||null})}`;
}

export async function proposeCalculusDecisionR505({ai,model,packet,residual,stage,maxAttempts=2}={}){
  if(!ai||typeof ai.run!=='function')return{ok:false,state:'R505_AI_BINDING_UNAVAILABLE',reasons:['R505 requires an AI binding'],attempts:[]};
  const attempts=[];
  let rejection=null;
  for(let attempt=1;attempt<=Math.max(1,Math.min(2,Number(maxAttempts)||2));attempt++){
    let capsule;
    try{
      const result=await ai.run(model,{messages:[
        {role:'system',content:'Return one valid JSON object only. This is a decision/proof-planning stage, not source mutation.'},
        {role:'user',content:decisionPrompt(packet,residual,stage,rejection)},
      ],response_format:{type:'json_object'},temperature:0,max_tokens:2400,seed:505});
      capsule=parseObject(responsePayload(result));
    }catch(error){
      const reasons=[`R505_DECISION_PARSE_OR_RUN_ERROR:${error instanceof Error?error.message:String(error)}`];
      attempts.push({attempt,accepted:false,reasons});
      rejection={reasons};
      continue;
    }
    const checked=validateCalculusDecisionCapsuleR505(packet,capsule,{residualId:residual?.id||null});
    attempts.push({attempt,accepted:checked.valid,reasons:checked.reasons,decision:checked.decision,consequence:checked.consequence,developmentalDeltaScore:checked.developmentalDeltaScore});
    if(checked.valid)return{ok:true,state:'R505_DECISION_ACCEPTED',capsule,validation:checked,attempts};
    rejection={reasons:checked.reasons,capsule};
  }
  return{ok:false,state:'BLOCKED_BY_R505_CALCULUS_DECISION_TRANSPORT',reasons:attempts.at(-1)?.reasons||['R505_DECISION_RETRY_EXHAUSTED'],attempts};
}
