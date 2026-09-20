export const R331_INTELLIGENCE_SCHEMA='OMEGA_COHERENT_LEARNING_R331';
export const R331_INTELLIGENCE_REVISION='R331';
export const R331_MEMORY_LIMIT=240;
export const R331_CONTEXT_LIMIT=10;

const clamp01=n=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const txt=(v,max=4000)=>String(v??'').trim().slice(0,max);
const words=value=>new Set(txt(value,12000).toLowerCase().match(/[a-z0-9_ΩΦΛ]+/gu)||[]);
const overlap=(a,b)=>{if(!a.size||!b.size)return 0;let hit=0;for(const x of a)if(b.has(x))hit++;return hit/Math.max(a.size,b.size)};
const nowIso=()=>new Date().toISOString();

export function memoryIdR331(seed){
 const source=JSON.stringify(seed,Object.keys(seed||{}).sort());let h=0x811c9dc5;
 for(let i=0;i<source.length;i++){h^=source.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0}
 return 'r331-'+h.toString(16).padStart(8,'0');
}

export function sanitizeMemoryTextR331(value,max=6000){
 return txt(value,max).replace(/\u0000/g,'');
}

export function compileConversationMemoryR331({role,text,provider=null,evidenceStatus=null,at=nowIso()}){
 const normalizedRole=String(role||'').toUpperCase()==='ASSISTANT'?'ASSISTANT':'USER';
 const body=sanitizeMemoryTextR331(text);
 if(!body)throw new Error('R331 conversation memory requires text');
 const source=normalizedRole==='USER'?'USER_TURN':'MODEL_TURN';
 const truthClass=normalizedRole==='USER'?'USER_STATED':'MODEL_SYNTHESIS';
 const row={
  schema:R331_INTELLIGENCE_SCHEMA,revision:R331_INTELLIGENCE_REVISION,
  memoryClass:'EPISODIC',source,truthClass,state:'RECORDED',
  role:normalizedRole,text:body,provider:provider?txt(provider,160):null,evidenceStatus:evidenceStatus?txt(evidenceStatus,160):null,
  evidenceReceiptIds:[],proofReceiptIds:[],contradictionOf:[],trainingApproved:false,createdAt:at,canonicalAdmission:false
 };
 return Object.freeze({...row,memoryId:memoryIdR331(row)});
}

export function compileLearningMemoryR331(input={}){
 const kind=String(input.kind||'').toUpperCase();
 const text=sanitizeMemoryTextR331(input.text||input.lesson||input.correction||input.preference);
 if(!text)throw new Error('R331 learning memory requires text');
 const evidenceReceiptIds=Array.isArray(input.evidenceReceiptIds)?input.evidenceReceiptIds.map(x=>txt(x,220)).filter(Boolean).slice(0,32):[];
 const proofReceiptIds=Array.isArray(input.proofReceiptIds)?input.proofReceiptIds.map(x=>txt(x,220)).filter(Boolean).slice(0,32):[];
 const trainingApproved=input.trainingApproved===true;
 let memoryClass='SCAR',truthClass='USER_STATED_CORRECTION',state='REVIEW_REQUIRED';
 if(kind==='USER_PREFERENCE'){memoryClass='COMMUNICATION_PREFERENCE';truthClass='USER_STATED_PREFERENCE';state='ADMITTED_USER_PREFERENCE'}
 else if(kind==='CORRECTION'){memoryClass='SCAR';truthClass='USER_STATED_CORRECTION';state='ADMITTED_USER_CORRECTION'}
 else if(kind==='FACTUAL_LESSON'){
  memoryClass='SEMANTIC_LESSON';truthClass='EVIDENCE_BOUND';
  state=evidenceReceiptIds.length?'ADMITTED_EVIDENCE_BOUND':'REVIEW_REQUIRED_MISSING_EVIDENCE';
 }
 else if(kind==='PROCEDURAL_LESSON'){
  memoryClass='PROCEDURAL_LESSON';truthClass='PROOF_BOUND';
  state=proofReceiptIds.length&&String(input.outcome||'').toUpperCase()==='SUCCESS'?'ADMITTED_PROOF_BOUND':'REVIEW_REQUIRED_MISSING_PROOF';
 }
 else throw new Error('R331 unsupported learning kind');
 const row={
  schema:R331_INTELLIGENCE_SCHEMA,revision:R331_INTELLIGENCE_REVISION,memoryClass,source:'EXPLICIT_FEEDBACK',truthClass,state,
  role:'USER',text,evidenceReceiptIds,proofReceiptIds,
  contradictionOf:Array.isArray(input.contradictionOf)?input.contradictionOf.map(x=>txt(x,220)).filter(Boolean).slice(0,24):[],
  trainingApproved,createdAt:txt(input.createdAt,64)||nowIso(),canonicalAdmission:false
 };
 return Object.freeze({...row,memoryId:memoryIdR331(row)});
}

function classWeight(row){
 switch(row?.memoryClass){
  case'COMMUNICATION_PREFERENCE':return 1;
  case'SEMANTIC_LESSON':return .95;
  case'PROCEDURAL_LESSON':return .92;
  case'SCAR':return .90;
  default:return .55;
 }
}
function evidenceWeight(row){
 if(row?.truthClass==='PROOF_BOUND')return row?.proofReceiptIds?.length?1:.25;
 if(row?.truthClass==='EVIDENCE_BOUND')return row?.evidenceReceiptIds?.length?1:.25;
 if(row?.truthClass==='USER_STATED_PREFERENCE'||row?.truthClass==='USER_STATED_CORRECTION')return .85;
 if(row?.truthClass==='USER_STATED')return .62;
 return .35;
}
export function scoreMemoryR331(row,prompt,nowMs=Date.now()){
 const created=Date.parse(row?.createdAt||'');
 const age=Number.isFinite(created)?Math.max(0,nowMs-created):365*86400000;
 const recency=Math.exp(-age/(30*86400000));
 const lexical=overlap(words(prompt),words(row?.text));
 const admitted=String(row?.state||'').startsWith('ADMITTED')?1:0;
 return clamp01(.32*lexical+.24*classWeight(row)+.2*evidenceWeight(row)+.14*recency+.1*admitted);
}

export function selectMemoryR331(entries,prompt,limit=R331_CONTEXT_LIMIT){
 const rows=Array.isArray(entries)?entries:[];
 return rows
  .filter(x=>x&&x.canonicalAdmission===false&&x.text)
  .map(x=>({...x,relevance:scoreMemoryR331(x,prompt)}))
  .sort((a,b)=>b.relevance-a.relevance||String(b.createdAt).localeCompare(String(a.createdAt)))
  .slice(0,Math.max(1,Math.min(20,Number(limit)||R331_CONTEXT_LIMIT)));
}

export function coherenceVectorR331(runtimeContext={},selectedMemory=[]){
 const m=runtimeContext?.metrics||{};
 const C=clamp01(m.continuity??runtimeContext.continuity??.5);
 const Phi=clamp01(m.plasticity??runtimeContext.plasticity??.5);
 const baseQ=clamp01(m.contradiction??runtimeContext.contradiction??0);
 const L=clamp01(m.burden??runtimeContext.burden??.25);
 const evidence=clamp01(m.evidence??runtimeContext.evidence??.5);
 const corrections=selectedMemory.filter(x=>x.memoryClass==='SCAR').length;
 const admitted=selectedMemory.filter(x=>String(x.state||'').startsWith('ADMITTED')).length;
 const q=clamp01(baseQ+Math.min(.3,corrections*.035));
 const memorySupport=clamp01(admitted/Math.max(1,selectedMemory.length));
 const stability=clamp01((C*Phi*(.55+.45*evidence))/(q+L+.15));
 const components={
  logical:clamp01(1-q),
  temporal:clamp01(selectedMemory.length?.9:.72),
  causal:clamp01(.5+.4*C-.15*q),
  memory:clamp01(.45+.55*memorySupport),
  evidence:clamp01(evidence),
  goal:clamp01(.4+.4*C+.2*Phi)
 };
 const weights={logical:.2,temporal:.12,causal:.16,memory:.18,evidence:.22,goal:.12};
 const composite=clamp01(Object.entries(weights).reduce((sum,[key,weight])=>sum+components[key]*weight,0));
 const communicationCoherence=clamp01(.35*C+.2*Phi+.2*evidence+.15*memorySupport+.1*(1-q));
 const decision=stability>=.72?'STAY':stability>=.34?'TURN':'ESCALATE';
 return{continuity:C,plasticity:Phi,contradiction:q,burden:L,evidence,memorySupport,components,weights,composite,stability,communicationCoherence,decision,validatedScientificMetric:false};
}

export function buildCommunicationContextR331(entries,prompt,runtimeContext={}){
 const selected=selectMemoryR331(entries,prompt,R331_CONTEXT_LIMIT);
 const coherence=coherenceVectorR331(runtimeContext,selected);
 return{
  schema:R331_INTELLIGENCE_SCHEMA,revision:R331_INTELLIGENCE_REVISION,
  selected:selected.map(x=>({
   memoryId:x.memoryId,memoryClass:x.memoryClass,truthClass:x.truthClass,state:x.state,text:sanitizeMemoryTextR331(x.text,1200),
   evidenceReceiptIds:x.evidenceReceiptIds||[],proofReceiptIds:x.proofReceiptIds||[],createdAt:x.createdAt,relevance:x.relevance
  })),
  coherence,
  communicationLaws:[
   'LATEST_EXPLICIT_USER_CORRECTION_OUTRANKS_EARLIER_CONFLICTING_CONVERSATION_MEMORY',
   'USER_PREFERENCE_MAY_GUIDE_COMMUNICATION_BUT_IS_NOT_EXTERNAL_FACTUAL_AUTHORITY',
   'MODEL_SYNTHESIS_MEMORY_MAY_SUPPORT_CONTINUITY_BUT_NEVER_SELF_PROMOTES_TO_FACT',
   'FACTUAL_LESSONS_REQUIRE_EVIDENCE_RECEIPTS',
   'PROCEDURAL_LESSONS_REQUIRE_SUCCESSFUL_PROOF_RECEIPTS',
   'SCARS_AND_CONTRADICTIONS_ARE_RETAINED_AS_LEARNING_SIGNAL',
   'LEARNING_NEVER_SELF_ADMITS_CANONSTATE'
  ],
  canonicalAdmission:false
 };
}

export function compileTrainingBatchR331(entries){
 const eligible=(Array.isArray(entries)?entries:[]).filter(row=>
  row?.canonicalAdmission===false&&row?.trainingApproved===true&&String(row?.state||'').startsWith('ADMITTED')&&
  ['COMMUNICATION_PREFERENCE','SEMANTIC_LESSON','PROCEDURAL_LESSON','SCAR'].includes(row?.memoryClass)
 );
 const examples=eligible.slice(-64).map(row=>({
  schema:'OMEGA_TRAINING_EXAMPLE_R331',memoryId:row.memoryId,memoryClass:row.memoryClass,truthClass:row.truthClass,
  messages:[
   {role:'system',content:'Preserve this approved OMEGA learning item according to its truth class. Do not promote preference, correction, model output, or procedural guidance into external factual authority.'},
   {role:'user',content:sanitizeMemoryTextR331(row.text,4000)},
   {role:'assistant',content:'Acknowledged as '+row.memoryClass+' with '+row.truthClass+' authority.'}
  ],
  evidenceReceiptIds:row.evidenceReceiptIds||[],proofReceiptIds:row.proofReceiptIds||[],canonicalAdmission:false
 }));
 return{
  schema:'OMEGA_TRAINING_BATCH_R331',revision:R331_INTELLIGENCE_REVISION,count:examples.length,examples,
  jsonl:examples.map(x=>JSON.stringify(x)).join('\n'),
  directWeightMutation:false,requiresTrainLocalReceipt:true,canonicalAdmission:false
 };
}

export function intelligenceManifestR331(){
 return{
  schema:R331_INTELLIGENCE_SCHEMA,revision:R331_INTELLIGENCE_REVISION,
  loops:['WORKING_CONTEXT','CONVERSATION_CONTINUITY','EPISODIC_MEMORY','EVIDENCE_GATED_SEMANTIC_LEARNING','PROOF_GATED_PROCEDURAL_LEARNING','APPEND_ONLY_LEARNING_LEDGER','EXPLICIT_TRAINING_EXPORT'],
  persistence:'OMEGA_RUNTIME_DURABLE_OBJECT_SESSION_SCOPED',
  training:'APPROVED_LESSONS_EXPORT_TO_EXISTING_TRAIN_LOCAL_PIPELINE',
  directFoundationWeightMutation:false,
  canonicalAdmission:false,
  boundary:'R331 improves communication immediately through durable session memory and coherence-aware context. It prepares approved training examples but does not claim foundation-model weight training unless an authenticated TRAIN_LOCAL host returns a compatible training receipt.'
 };
}
