import {compileSkinCycleR265,compileWovenDimensionalRelativityR265,R265_REVISION} from './wovenDimensionalRelativityR265.js';
import {compileAdaptiveCoherenceR266,R266_REVISION} from './adaptiveCoherenceCycleR266.js';

export const R249_SCHEMA='OMEGA_OPERATIONAL_CONVERGENCE_R249';
export const R249_REVISION='R249';
export const R249_CONTINUITY_OPERATOR='PARTITION → EXCHANGE/TRANSFORM → INVARIANT CARRY → SCAR/RESIDUAL CARRY → RE-CONTEXTUALIZE/REPARTITION';
export const R249_BOUNDARY='R249 is a software-operational scheduling governor. R265 compiles Water/Woven/Violet/frame coherence and R266 may close proved carry into bounded next-cycle planning context. Neither layer creates execution authority, dispatch, native proof, source promotion, production deployment, empirical truth, foundation-weight training, or CanonState admission.';
export const R249_AUTHORITY=Object.freeze({planning:'R249_SCHEDULING_ONLY',mutation:'R153_PREIMAGE_BOUND_ONLY',dispatch:'R147',returnProof:'R141',history:'R146',sourcePromotion:'R240',canonAdmission:'R125',productionWriter:'.github/workflows/ci.yml'});

const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const clampInt=(n,min,max)=>Math.max(min,Math.min(max,Math.floor(Number(n)||0)));
const mean=(...xs)=>xs.reduce((a,b)=>a+Number(b||0),0)/Math.max(1,xs.length);
const severityWeight=v=>({LOW:.18,MEDIUM:.42,HIGH:.76,CRITICAL:1}[String(v||'').toUpperCase()]||0);
const modeWeight=v=>({OBSERVE_ONLY:.16,QUEUE_FOR_REVIEW:.55,BLOCK:1}[String(v||'').toUpperCase()]||0);
const failedStatus=s=>['FAILED','ERROR','REJECTED','TIMEOUT'].includes(String(s||'').toUpperCase());
const evidenceOps=new Set(['INDEX','READ_TEXT','SEARCH_TEXT','HASH_TREE','DESKTOP_HEALTH','FORENSIC_HASH_LEDGER','WORKBOOK_AUDIT','READ_VISIBLE_TEXT','SCREEN_CAPTURE','LIST_WINDOWS','ASSERT_WINDOW']);
const mutationOps=new Set(['APPLY_PATCH','WRITE_TEXT']);
const verifyOps=new Set(['BUILD','TEST']);
const terminalOps=new Set(['PACKAGE','SUPPORT_BUNDLE']);

export function decisionR249(metrics={}){
 const continuity=clamp01(metrics.continuity),plasticity=clamp01(metrics.plasticity),contradiction=clamp01(metrics.contradiction),burden=clamp01(metrics.burden),evidence=clamp01(metrics.evidence),uncertainty=clamp01(metrics.uncertainty),scar=clamp01(metrics.scar);
 const denom=Math.max(1e-9,burden+contradiction+burden*contradiction);
 const score=continuity/denom;
 const decision=score>=1.15?'STAY':score>=.72?'TURN':'ESCALATE';
 return{metrics:{continuity,plasticity,contradiction,burden,evidence,uncertainty,scar},score,decision};
}

export function metricsFromResidualGraphR249(evidence={},previousScars=[]){
 const residuals=Array.isArray(evidence?.residuals)?evidence.residuals:[];
 const summary=evidence?.summary||{};
 const strongest=residuals.reduce((m,r)=>Math.max(m,severityWeight(r?.severity),modeWeight(r?.mode)),0);
 const total=Math.max(residuals.length,Number(summary.total)||0);
 const blocking=Math.max(Number(summary.blocking)||0,residuals.filter(r=>String(r?.mode).toUpperCase()==='BLOCK').length);
 const review=Math.max(Number(summary.review)||0,residuals.filter(r=>String(r?.mode).toUpperCase()==='QUEUE_FOR_REVIEW').length);
 const carried=Array.isArray(previousScars)?previousScars:[];
 const carriedFailures=carried.filter(s=>failedStatus(s?.status)||['HIGH','CRITICAL'].includes(String(s?.severity||'').toUpperCase())).length;
 const state=String(evidence?.state||'UNPROVEN').toUpperCase();
 const graphObserved=String(evidence?.schema||'').includes('RESIDUAL_GRAPH')||state==='HEALTHY'||state==='RESIDUALS_PRESENT'||state==='BLOCKED';
 const contradiction=clamp01(Math.max(strongest*.72,(blocking+review*.45)/4));
 const burden=clamp01(total/12);
 const continuity=state==='HEALTHY'?1:state==='BLOCKED'?.12:state==='RESIDUALS_PRESENT'?clamp01(.82-.42*burden-.22*strongest):.38;
 const plasticity=clamp01(1-.55*burden-.30*strongest);
 const evidenceScore=graphObserved?clamp01(.92-.18*(state==='UNPROVEN'?1:0)):.25;
 const uncertainty=1-evidenceScore;
 const scar=clamp01(Math.max(strongest*.55,carried.length?carriedFailures/Math.max(1,carried.length):0));
 return{continuity,plasticity,contradiction,burden,evidence:evidenceScore,uncertainty,scar};
}

export function compileOperationalConvergenceR249({metrics={},evidence=null,previousScars=[],adaptiveHistory=[],configuredParallel=12,effectiveCpuWorkers=0,executionRequested=false}={}){
 const sourceMetrics=evidence?metricsFromResidualGraphR249(evidence,previousScars):metrics;
 const base=decisionR249(sourceMetrics),m=base.metrics;
 const commonKernel=(m.continuity*m.plasticity)/(m.contradiction+m.burden+1e-12);
 const invariantCarry=clamp01(mean(m.continuity,m.evidence,1-m.contradiction));
 const residualPressure=clamp01(mean(m.contradiction,m.burden,m.scar,m.uncertainty));
 const legacyFuturePlasticity=clamp01(m.plasticity*(1-.45*m.burden)*(1-.35*m.scar));
 const orientation=Math.abs(invariantCarry-residualPressure)<.04?0:invariantCarry>residualPressure?1:-1;
 const dimensionalRelativityR265=compileWovenDimensionalRelativityR265({
  metrics:{continuity:m.continuity,plasticity:m.plasticity,contradiction:m.contradiction,burden:m.burden,scar:m.scar,evidence:m.evidence},
  invariantCarry,residual:residualPressure,correspondence:clamp01(mean(invariantCarry,m.evidence,1-m.uncertainty)),orientation,
  water:{flow:clamp01(mean(m.continuity,m.plasticity)),boundary:clamp01(mean(m.contradiction,m.burden)),pressure:m.burden,memory:clamp01(mean(m.continuity,m.scar)),curvature:m.contradiction,hysteresis:m.scar},
  sourceFrame:'R249_RESIDUAL_GRAPH',targetFrame:'R249_OPERATIONAL_POLICY',sourceSkin:'EVIDENCE',targetSkin:'ORGANIZE',sourceResolution:20736,targetResolution:248832,
  provenance:[String(evidence?.schema||'R249_DIRECT_METRICS'),R249_SCHEMA]
 });
 const organizationSkinR265=compileSkinCycleR265(dimensionalRelativityR265,'ORGANIZE');
 const adaptiveCoherenceR266=compileAdaptiveCoherenceR266({current:dimensionalRelativityR265,history:adaptiveHistory});
 const futurePlasticity=clamp01(.80*legacyFuturePlasticity+.20*adaptiveCoherenceR266.adaptation.adaptiveFuturePreservation);
 const legacyCapacity=clamp01(mean(m.continuity,m.plasticity,m.evidence,1-m.burden,1-m.contradiction));
 const capacity=clamp01(.80*legacyCapacity+.20*adaptiveCoherenceR266.adaptation.adaptiveCoherence);
 const configured=clampInt(configuredParallel,1,12),cpu=clampInt(effectiveCpuWorkers||configured,1,12);
 const ceiling=Math.min(configured,cpu);
 const frontierWidth=base.decision==='STAY'?Math.max(1,Math.min(ceiling,Math.round(2+6*capacity))):base.decision==='TURN'?Math.max(1,Math.min(ceiling,Math.round(1+4*capacity))):1;
 const maxMissionCycles=base.decision==='STAY'?clampInt(Math.round(5+7*capacity),4,12):base.decision==='TURN'?clampInt(Math.round(4+5*capacity),4,9):4;
 const stepMode=base.decision==='STAY'?'PRESERVE_VALIDATED_ORDER':base.decision==='TURN'?'EVIDENCE_CAUSE_THEN_VERIFY':'EVIDENCE_ONLY_FIRST_CYCLE';
 return{schema:R249_SCHEMA,revision:R249_REVISION,continuityOperator:R249_CONTINUITY_OPERATOR,metrics:m,decision:base.decision,decisionScore:base.score,commonKernel,invariantCarry,residualPressure,futurePlasticity,orientation,capacity,policy:{frontierWidth,maxMissionCycles,stepMode,executionRequested:Boolean(executionRequested),parallelSourceMutation:false},wovenDimensionalRelativityR265:dimensionalRelativityR265,organizationSkinR265,adaptiveCoherenceR266,r265Revision:R265_REVISION,r266Revision:R266_REVISION,authority:R249_AUTHORITY,boundary:R249_BOUNDARY};
}

function stepRank(step){const op=String(step?.op||'').toUpperCase();if(evidenceOps.has(op))return 0;if(mutationOps.has(op))return 1;if(verifyOps.has(op))return 2;if(terminalOps.has(op))return 3;return 2}
export function sequenceGovernedStepsR249(steps=[],policy={}){
 const source=Array.isArray(steps)?steps.map((step,index)=>({...step,__r249Index:index})):[];
 const decision=String(policy?.decision||'STAY').toUpperCase();
 let selected=source;
 if(decision==='ESCALATE'){
  const evidenceOnly=source.filter(step=>evidenceOps.has(String(step?.op||'').toUpperCase()));
  selected=evidenceOnly.length?evidenceOnly:source.filter(step=>!mutationOps.has(String(step?.op||'').toUpperCase())&&!terminalOps.has(String(step?.op||'').toUpperCase())).slice(0,Math.max(1,Math.min(4,source.length)));
 }else if(decision==='TURN')selected=[...source].sort((a,b)=>stepRank(a)-stepRank(b)||a.__r249Index-b.__r249Index);
 return{schema:'OMEGA_OPERATIONAL_STEP_SEQUENCE_R249',decision,mode:decision==='ESCALATE'?'EVIDENCE_ONLY_FIRST_CYCLE':decision==='TURN'?'EVIDENCE_CAUSE_THEN_VERIFY':'PRESERVE_VALIDATED_ORDER',steps:selected.map(({__r249Index,...step})=>step),omitted:source.filter(step=>!selected.includes(step)).map(step=>({op:String(step?.op||''),id:step?.id||null,reason:'R249 evidence-first first-cycle hold; operation may be reconsidered only after returned proof.'})),authority:'ORDERING_AND_SUBSETTING_OF_ALREADY_VALIDATED_STEPS_ONLY',canonicalAdmission:false};
}

export function assertOperationalConvergenceR249(){
 if(R249_AUTHORITY.dispatch!=='R147'||R249_AUTHORITY.returnProof!=='R141'||R249_AUTHORITY.history!=='R146'||R249_AUTHORITY.sourcePromotion!=='R240'||R249_AUTHORITY.canonAdmission!=='R125')throw new Error('R249 authority boundary drift.');
 const compiled=compileOperationalConvergenceR249({metrics:{continuity:.9,plasticity:.8,contradiction:.1,burden:.2,evidence:.9,uncertainty:.1,scar:.1}});
 if(compiled.wovenDimensionalRelativityR265?.authority?.sourceMutation!=='R240_SINGLE_CANDIDATE_ONLY'||compiled.organizationSkinR265?.sourceMutationAuthorized!==false)throw new Error('R265 cross-skin contract may not gain source-mutation authority through R249.');
 if(compiled.adaptiveCoherenceR266?.authority?.sourceMutation!=='R240_SINGLE_CANDIDATE_ONLY'||compiled.adaptiveCoherenceR266?.adaptation?.foundationWeightsChanged!==false)throw new Error('R266 adaptive cycle may not gain source-mutation authority or fake weight training through R249.');
 const held=sequenceGovernedStepsR249([{id:'1',op:'INDEX'},{id:'2',op:'APPLY_PATCH'},{id:'3',op:'BUILD'}],{decision:'ESCALATE'});
 if(held.steps.some(step=>mutationOps.has(String(step.op).toUpperCase())))throw new Error('R249 ESCALATE may not put source mutation in its evidence-first first cycle.');
 return true;
}
