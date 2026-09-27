export const UNIFIED_PCWD_SCHEMA='OMEGA_UNIFIED_PROOF_TRANSPORT_KERNEL_v1' as const;
export const UNIFIED_PCWD_STAGES=['Sense','Normalize','Decompose','Lemma','Transport','Recover','Prove'] as const;
export const UNIFIED_PCWD_GATES=['continuityValid','invariantsPreserved','scarRetained','recoveryBounded','dynamicsBounded','observablesBounded','evidenceAdmissible','pathRecoverable'] as const;
export const UNIFIED_PCWD_BOUNDARY='The unified PCWD kernel is a domain-neutral software proof contract. Domain adapters remain responsible for the meaning of their states, observables, evidence and transforms. Passing this kernel proves only the declared software contract and never creates physical, observational, CanonState, dispatch, durable-history or production authority.' as const;

export type UnifiedDecisionV1='STAY'|'TURN'|'ESCALATE';
export type UnifiedErrorsV1={recovery:number;dynamics:number;observables:number;path:number;invariants:number};
export type UnifiedTolerancesV1={recovery:number;dynamics:number;observables:number;path:number;invariants:number;continuity:number};
export type UnifiedMeasuresV1={
 continuity:number;
 futurePlasticity:number;
 contradiction:number;
 burden:number;
 errors:UnifiedErrorsV1;
 tolerances:UnifiedTolerancesV1;
 scarRetained:boolean;
 evidenceAdmissible:boolean;
 pathRecoverable:boolean;
};
export type UnifiedGateSetV1={continuityValid:boolean;invariantsPreserved:boolean;scarRetained:boolean;recoveryBounded:boolean;dynamicsBounded:boolean;observablesBounded:boolean;evidenceAdmissible:boolean;pathRecoverable:boolean};
export type UnifiedStageReceiptV1={stage:(typeof UNIFIED_PCWD_STAGES)[number];fingerprint:string;detail:string};
export type UnifiedEnvelopeSealV1={schema:'OMEGA_UNIFIED_PCWD_ENVELOPE_SEAL_v1';packetDigest:string;proofDigest:string;stageChainDigest:string;envelopeDigest:string};
export type UnifiedCompactProofIndexV1={
 schema:'OMEGA_UNIFIED_PCWD_COMPACT_INDEX_v1';
 domain:string;
 domainVersion:string;
 address:unknown;
 decision:UnifiedDecisionV1;
 promotionEligible:boolean;
 gateMask:number;
 errors:[number,number,number,number,number];
 tolerances:[number,number,number,number,number,number];
 previousProofDigest:string;
 stageChainDigest:string;
 proofDigest:string;
 packetDigest:string;
 envelopeDigest:string;
 requiresFullEnvelopeForSemanticVerification:true;
 boundary:typeof UNIFIED_PCWD_BOUNDARY;
};

export type UnifiedDomainContractV1<Input,Sensed,Normalized,Decomposed,LemmaState,Transported,Recovered>={
 id:string;
 version:string;
 address:(input:Input)=>unknown;
 sense:(input:Input)=>Promise<Sensed>|Sensed;
 normalize:(sensed:Sensed,input:Input)=>Promise<Normalized>|Normalized;
 decompose:(normalized:Normalized,input:Input)=>Promise<Decomposed>|Decomposed;
 lemma:(decomposed:Decomposed,input:Input)=>Promise<LemmaState>|LemmaState;
 transport:(lemma:LemmaState,input:Input)=>Promise<Transported>|Transported;
 recover:(transported:Transported,lemma:LemmaState,decomposed:Decomposed,input:Input)=>Promise<Recovered>|Recovered;
 measures:(ctx:{input:Input;sensed:Sensed;normalized:Normalized;decomposed:Decomposed;lemma:LemmaState;transported:Transported;recovered:Recovered})=>Promise<UnifiedMeasuresV1>|UnifiedMeasuresV1;
 packet:(ctx:{input:Input;sensed:Sensed;normalized:Normalized;decomposed:Decomposed;lemma:LemmaState;transported:Transported;recovered:Recovered;proof:UnifiedProofReceiptV1;stages:UnifiedStageReceiptV1[]})=>unknown;
 stageDetail?:(stage:(typeof UNIFIED_PCWD_STAGES)[number],value:unknown,input:Input)=>string;
 boundary:string;
};
export type UnifiedProofReceiptV1={
 schema:'OMEGA_UNIFIED_PCWD_PROOF_RECEIPT_v1';
 domain:string;
 domainVersion:string;
 previousProofDigest:string;
 gates:UnifiedGateSetV1;
 errors:UnifiedErrorsV1;
 tolerances:UnifiedTolerancesV1;
 decisionScore:number;
 decision:UnifiedDecisionV1;
 promotionEligible:boolean;
 stageChainDigest:string;
 proofDigest:string;
 canonicalMutation:false;
 observedHistoryClaimed:false;
 physicalPrimitiveAdded:false;
 boundary:typeof UNIFIED_PCWD_BOUNDARY;
 domainBoundary:string;
};

const finite=(n:unknown,d=0)=>Number.isFinite(Number(n))?Number(n):d;
const nonneg=(n:unknown,d=0)=>Math.max(0,finite(n,d));
const clamp01=(n:unknown)=>Math.max(0,Math.min(1,finite(n)));
function stable(v:any):string{
 if(v===null||typeof v!=='object')return JSON.stringify(v);
 if(ArrayBuffer.isView(v))return stable(Array.from(v as any));
 if(Array.isArray(v))return'['+v.map(stable).join(',')+']';
 return'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
}
async function sha256(v:any){
 if(!globalThis.crypto?.subtle)throw new Error('Unified PCWD requires Web Crypto SHA-256');
 const d=await globalThis.crypto.subtle.digest('SHA-256',new TextEncoder().encode(typeof v==='string'?v:stable(v)));
 return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
async function receipt(stage:(typeof UNIFIED_PCWD_STAGES)[number],value:unknown,detail:string){
 return{stage,fingerprint:await sha256({stage,value}),detail} as UnifiedStageReceiptV1;
}
function validateMeasures(m:UnifiedMeasuresV1):UnifiedMeasuresV1{
 const tolerances:UnifiedTolerancesV1={
  recovery:nonneg(m?.tolerances?.recovery,1e-9),
  dynamics:nonneg(m?.tolerances?.dynamics,1e-9),
  observables:nonneg(m?.tolerances?.observables,1e-9),
  path:nonneg(m?.tolerances?.path,1e-9),
  invariants:nonneg(m?.tolerances?.invariants,1e-9),
  continuity:nonneg(m?.tolerances?.continuity,0),
 };
 const errors:UnifiedErrorsV1={
  recovery:nonneg(m?.errors?.recovery,Number.POSITIVE_INFINITY),
  dynamics:nonneg(m?.errors?.dynamics,Number.POSITIVE_INFINITY),
  observables:nonneg(m?.errors?.observables,Number.POSITIVE_INFINITY),
  path:nonneg(m?.errors?.path,Number.POSITIVE_INFINITY),
  invariants:nonneg(m?.errors?.invariants,Number.POSITIVE_INFINITY),
 };
 return{
  continuity:clamp01(m?.continuity),
  futurePlasticity:clamp01(m?.futurePlasticity),
  contradiction:nonneg(m?.contradiction),
  burden:nonneg(m?.burden),
  errors,tolerances,
  scarRetained:m?.scarRetained===true,
  evidenceAdmissible:m?.evidenceAdmissible===true,
  pathRecoverable:m?.pathRecoverable===true,
 };
}
export function evaluateUnifiedProofGatesV1(m:UnifiedMeasuresV1):UnifiedGateSetV1{
 const x=validateMeasures(m);
 return{
  continuityValid:x.continuity>=x.tolerances.continuity,
  invariantsPreserved:x.errors.invariants<=x.tolerances.invariants,
  scarRetained:x.scarRetained,
  recoveryBounded:x.errors.recovery<=x.tolerances.recovery,
  dynamicsBounded:x.errors.dynamics<=x.tolerances.dynamics,
  observablesBounded:x.errors.observables<=x.tolerances.observables,
  evidenceAdmissible:x.evidenceAdmissible,
  pathRecoverable:x.pathRecoverable&&x.errors.path<=x.tolerances.path,
 };
}
export function decideUnifiedProofV1(gates:UnifiedGateSetV1):UnifiedDecisionV1{
 const all=UNIFIED_PCWD_GATES.every(k=>gates[k]);
 if(all)return'STAY';
 if(!gates.continuityValid||!gates.invariantsPreserved||!gates.evidenceAdmissible||!gates.pathRecoverable)return'ESCALATE';
 return'TURN';
}
export function unifiedDecisionScoreV1(m:UnifiedMeasuresV1){
 const x=validateMeasures(m),e=x.errors;
 const denom=x.contradiction+x.burden+e.recovery+e.dynamics+e.observables+e.path+e.invariants+1e-12;
 return(x.continuity*x.futurePlasticity)/denom;
}

export async function executeUnifiedProofTransportV1<I,S,N,D,L,T,R>(
 contract:UnifiedDomainContractV1<I,S,N,D,L,T,R>,
 input:I,
 previousProofDigest='UNIFIED-PCWD-GENESIS'
){
 if(!contract?.id||!contract?.version)throw new Error('Unified PCWD domain contract requires id and version');
 const stages:UnifiedStageReceiptV1[]=[];
 const detail=(stage:(typeof UNIFIED_PCWD_STAGES)[number],value:unknown)=>contract.stageDetail?.(stage,value,input)||contract.id+' '+stage.toLowerCase();

 const sensed=await contract.sense(input);
 stages.push(await receipt('Sense',sensed,detail('Sense',sensed)));
 const normalized=await contract.normalize(sensed,input);
 stages.push(await receipt('Normalize',normalized,detail('Normalize',normalized)));
 const decomposed=await contract.decompose(normalized,input);
 stages.push(await receipt('Decompose',decomposed,detail('Decompose',decomposed)));
 const lemma=await contract.lemma(decomposed,input);
 stages.push(await receipt('Lemma',lemma,detail('Lemma',lemma)));
 const transported=await contract.transport(lemma,input);
 stages.push(await receipt('Transport',transported,detail('Transport',transported)));
 const recovered=await contract.recover(transported,lemma,decomposed,input);
 stages.push(await receipt('Recover',recovered,detail('Recover',recovered)));

 const measures=validateMeasures(await contract.measures({input,sensed,normalized,decomposed,lemma,transported,recovered}));
 const gates=evaluateUnifiedProofGatesV1(measures);
 const promotionEligible=UNIFIED_PCWD_GATES.every(k=>gates[k]);
 const decision=decideUnifiedProofV1(gates);
 const decisionScore=unifiedDecisionScoreV1(measures);
 const stageChainDigest=await sha256(stages);
 const core={
  schema:'OMEGA_UNIFIED_PCWD_PROOF_RECEIPT_v1',
  domain:contract.id,domainVersion:contract.version,previousProofDigest,
  gates,errors:measures.errors,tolerances:measures.tolerances,decisionScore,decision,promotionEligible,stageChainDigest,
  canonicalMutation:false,observedHistoryClaimed:false,physicalPrimitiveAdded:false,
  boundary:UNIFIED_PCWD_BOUNDARY,domainBoundary:contract.boundary,
 } as const;
 const proofDigest=await sha256(core);
 const proof:UnifiedProofReceiptV1={...core,proofDigest};
 stages.push(await receipt('Prove',proof,detail('Prove',proof)));
 const packet=contract.packet({input,sensed,normalized,decomposed,lemma,transported,recovered,proof,stages});
 const packetDigest=await sha256(packet);
 const sealCore={schema:'OMEGA_UNIFIED_PCWD_ENVELOPE_SEAL_v1',packetDigest,proofDigest:proof.proofDigest,stageChainDigest:proof.stageChainDigest} as const;
 const seal:UnifiedEnvelopeSealV1={...sealCore,envelopeDigest:await sha256(sealCore)};
 return{
  schema:UNIFIED_PCWD_SCHEMA,
  address:contract.address(input),
  domain:contract.id,
  domainVersion:contract.version,
  packet,
  proof,
  stages,
  seal,
  promotionEligible,
  decision,
  boundary:UNIFIED_PCWD_BOUNDARY,
  domainBoundary:contract.boundary,
 };
}

export async function verifyUnifiedProofTransportV1(result:any){
 if(result?.schema!==UNIFIED_PCWD_SCHEMA||result?.proof?.schema!=='OMEGA_UNIFIED_PCWD_PROOF_RECEIPT_v1'||result?.seal?.schema!=='OMEGA_UNIFIED_PCWD_ENVELOPE_SEAL_v1')return false;
 const p=result.proof as UnifiedProofReceiptV1;
 const all=UNIFIED_PCWD_GATES.every(k=>p.gates[k]);
 if(p.promotionEligible!==all||p.decision!==decideUnifiedProofV1(p.gates))return false;
 if(p.canonicalMutation!==false||p.observedHistoryClaimed!==false||p.physicalPrimitiveAdded!==false||p.boundary!==UNIFIED_PCWD_BOUNDARY)return false;
 const core={schema:p.schema,domain:p.domain,domainVersion:p.domainVersion,previousProofDigest:p.previousProofDigest,gates:p.gates,errors:p.errors,tolerances:p.tolerances,decisionScore:p.decisionScore,decision:p.decision,promotionEligible:p.promotionEligible,stageChainDigest:p.stageChainDigest,canonicalMutation:p.canonicalMutation,observedHistoryClaimed:p.observedHistoryClaimed,physicalPrimitiveAdded:p.physicalPrimitiveAdded,boundary:p.boundary,domainBoundary:p.domainBoundary};
 if(await sha256(core)!==p.proofDigest)return false;
 const preProofStages=(result.stages||[]).filter((s:any)=>s.stage!=='Prove');
 if(await sha256(preProofStages)!==p.stageChainDigest)return false;
 const packetDigest=await sha256(result.packet);
 if(packetDigest!==result.seal.packetDigest)return false;
 const sealCore={schema:result.seal.schema,packetDigest:result.seal.packetDigest,proofDigest:p.proofDigest,stageChainDigest:p.stageChainDigest};
 return result.seal.proofDigest===p.proofDigest&&result.seal.stageChainDigest===p.stageChainDigest&&await sha256(sealCore)===result.seal.envelopeDigest;
}


export function compileCompactProofIndexV1(result:any):UnifiedCompactProofIndexV1{
 if(result?.schema!==UNIFIED_PCWD_SCHEMA||result?.proof?.schema!=='OMEGA_UNIFIED_PCWD_PROOF_RECEIPT_v1'||result?.seal?.schema!=='OMEGA_UNIFIED_PCWD_ENVELOPE_SEAL_v1')throw new Error('Compact PCWD index requires a complete unified proof envelope');
 const p=result.proof as UnifiedProofReceiptV1,s=result.seal as UnifiedEnvelopeSealV1;
 let gateMask=0;UNIFIED_PCWD_GATES.forEach((k,i)=>{if(p.gates[k])gateMask|=(1<<i)});
 return{
  schema:'OMEGA_UNIFIED_PCWD_COMPACT_INDEX_v1',
  domain:p.domain,domainVersion:p.domainVersion,address:result.address,
  decision:p.decision,promotionEligible:p.promotionEligible,gateMask,
  errors:[p.errors.recovery,p.errors.dynamics,p.errors.observables,p.errors.path,p.errors.invariants],
  tolerances:[p.tolerances.recovery,p.tolerances.dynamics,p.tolerances.observables,p.tolerances.path,p.tolerances.invariants,p.tolerances.continuity],
  previousProofDigest:p.previousProofDigest,stageChainDigest:p.stageChainDigest,proofDigest:p.proofDigest,
  packetDigest:s.packetDigest,envelopeDigest:s.envelopeDigest,
  requiresFullEnvelopeForSemanticVerification:true,
  boundary:UNIFIED_PCWD_BOUNDARY,
 };
}
export async function verifyCompactProofIndexV1(index:UnifiedCompactProofIndexV1,result:any){
 if(index?.schema!=='OMEGA_UNIFIED_PCWD_COMPACT_INDEX_v1'||index.requiresFullEnvelopeForSemanticVerification!==true)return false;
 if(!await verifyUnifiedProofTransportV1(result))return false;
 const expected=compileCompactProofIndexV1(result);
 return stable(index)===stable(expected);
}

export async function executeUnifiedProofChainV1<I,S,N,D,L,T,R>(
 contract:UnifiedDomainContractV1<I,S,N,D,L,T,R>,
 inputs:I[]
){
 const results=[] as any[];
 let previous='UNIFIED-PCWD-GENESIS';
 for(const input of inputs){
  const result=await executeUnifiedProofTransportV1(contract,input,previous);
  results.push(result);previous=result.proof.proofDigest;
 }
 return{
  schema:'OMEGA_UNIFIED_PCWD_CHAIN_v1' as const,
  domain:contract.id,
  results,
  chainDigest:previous,
  linkIntegrity:results.every((r,i)=>r.proof.previousProofDigest===(i===0?'UNIFIED-PCWD-GENESIS':results[i-1].proof.proofDigest)),
  proofIntegrity:(await Promise.all(results.map(verifyUnifiedProofTransportV1))).every(Boolean),
  boundary:UNIFIED_PCWD_BOUNDARY,
 };
}
