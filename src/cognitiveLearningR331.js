export const R331_COGNITIVE_LEARNING_SCHEMA='OMEGA_COGNITIVE_LEARNING_R331';
export const R331_COGNITIVE_LEARNING_REVISION='R331';
export const R331_MEMORY_KINDS=Object.freeze(['WORKING','EPISODIC','SEMANTIC','PROCEDURAL']);
export const R331_EVIDENCE_CLASSES=Object.freeze(['MODEL_SYNTHESIS','USER_CONFIRMED','RETURN_VERIFIED','SOURCE_BOUND']);
export const R331_QTI_OUTCOMES=Object.freeze(['PASS','REVISE','ESCALATE','DENY']);

const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(Number(v))?Number(v):0));
const text=v=>String(v??'').trim();
const words=v=>[...new Set(text(v).toLowerCase().match(/[a-z0-9_ΩΦΛ]+/g)||[])];
const stable=value=>{
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable(value[k])).join(',')+'}';
};
export async function sha256R331(value){
 const bytes=new TextEncoder().encode(typeof value==='string'?value:stable(value));
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

export function memoryGateR331(input){
 const kind=R331_MEMORY_KINDS.includes(input?.kind)?input.kind:'EPISODIC';
 const evidenceClass=R331_EVIDENCE_CLASSES.includes(input?.evidenceClass)?input.evidenceClass:'MODEL_SYNTHESIS';
 const content=text(input?.content);
 const confidence=clamp(input?.confidence);
 const semantic=kind==='SEMANTIC'||kind==='PROCEDURAL';
 const g1=content.length>0&&confidence>=.2?'PASS':'REVISE';
 const g2=text(input?.scope).length>0?'PASS':'REVISE';
 const g3=!semantic||['USER_CONFIRMED','RETURN_VERIFIED','SOURCE_BOUND'].includes(evidenceClass)?'PASS':'DENY';
 const g4=content.length<=4000?'PASS':'REVISE';
 const g5=input?.status==='SUPERSEDED'||input?.status==='REVOKED'||input?.supersedes!==undefined?'PASS':'PASS';
 const gates={G1_EVIDENCE_SUFFICIENCY:g1,G2_STATE_CONSISTENCY:g2,G3_PERMISSION:g3,G4_RESOURCE_BUDGET:g4,G5_REVERSIBILITY:g5};
 const values=Object.values(gates);
 const outcome=values.includes('DENY')?'DENY':values.includes('REVISE')?'REVISE':'PASS';
 return{schema:'OMEGA_QTI_MEMORY_GATE_R331',outcome,gates,canonicalAdmission:false,boundary:'Memory admission is not CanonState admission. Semantic/procedural promotion requires user-confirmed, returned-verified, or source-bound evidence.'};
}

export async function createMemoryR331(input){
 const now=Number.isFinite(Number(input?.timestamp))?Number(input.timestamp):Date.now();
 const record={
  schema:'OMEGA_MEMORY_OBJECT_R331',
  id:text(input?.id)||'mem_'+now.toString(36)+'_'+(await sha256R331({content:input?.content,now})).slice(0,10),
  kind:R331_MEMORY_KINDS.includes(input?.kind)?input.kind:'EPISODIC',
  content:text(input?.content).slice(0,4000),
  source:text(input?.source)||'OMEGA_COGNITIVE_LEARNING_R331',
  timestamp:now,
  confidence:clamp(input?.confidence??.5),
  writer:text(input?.writer)||'OMEGA_R331',
  scope:text(input?.scope)||'SESSION',
  evidenceClass:R331_EVIDENCE_CLASSES.includes(input?.evidenceClass)?input.evidenceClass:'MODEL_SYNTHESIS',
  stateVersion:text(input?.stateVersion)||null,
  supersedes:text(input?.supersedes)||null,
  status:['ACTIVE','SUPERSEDED','REVOKED'].includes(input?.status)?input.status:'ACTIVE',
  canonicalAdmission:false
 };
 record.hash=await sha256R331(record);
 const gate=memoryGateR331(record);
 if(gate.outcome==='DENY')throw new Error('R331 memory promotion denied by QTI permission gate');
 if(gate.outcome==='REVISE')throw new Error('R331 memory record requires revision before admission');
 return Object.freeze({...record,gate});
}

function lexicalScore(query,content){
 const q=words(query),c=new Set(words(content));
 if(!q.length||!c.size)return 0;
 let hit=0;for(const w of q)if(c.has(w))hit++;
 return hit/Math.max(1,q.length);
}
export function selectMemoriesR331(memories,query,limit=8,now=Date.now()){
 const rows=(Array.isArray(memories)?memories:[]).filter(m=>m?.status==='ACTIVE'&&text(m?.content));
 return rows.map(m=>{
  const age=Math.max(0,now-Number(m.timestamp||0));
  const recency=Math.exp(-age/(1000*60*60*24*30));
  const kindBonus=m.kind==='PROCEDURAL'?.18:m.kind==='SEMANTIC'?.14:m.kind==='EPISODIC'?.07:.03;
  const evidenceBonus=['USER_CONFIRMED','RETURN_VERIFIED','SOURCE_BOUND'].includes(m.evidenceClass)?.12:0;
  const score=lexicalScore(query,m.content)*.56+clamp(m.confidence)*.18+recency*.14+kindBonus+evidenceBonus;
  return{...m,retrievalScore:score};
 }).sort((a,b)=>b.retrievalScore-a.retrievalScore||Number(b.timestamp)-Number(a.timestamp)).slice(0,Math.max(1,Math.min(12,limit)));
}

export function coherenceVectorR331({runtimeContext={},selectedMemories=[],ledger=[]}={}){
 const metrics=runtimeContext?.metrics||{};
 const contradiction=clamp(metrics.contradiction??metrics.q??.5);
 const continuity=clamp(metrics.continuity??metrics.C??.5);
 const evidence=clamp(metrics.evidence??.5);
 const active=(Array.isArray(selectedMemories)?selectedMemories:[]).filter(Boolean);
 const trusted=active.filter(m=>['USER_CONFIRMED','RETURN_VERIFIED','SOURCE_BOUND'].includes(m.evidenceClass));
 const avgConfidence=active.length?active.reduce((s,m)=>s+clamp(m.confidence),0)/active.length:.5;
 const last=Array.isArray(ledger)&&ledger.length?ledger[ledger.length-1]:null;
 const temporal=last&&Number(last.timestamp)>0?.92:.72;
 const logical=1-contradiction;
 const causal=.55+.35*continuity;
 const memory=.45+.35*avgConfidence+.2*(trusted.length/Math.max(1,active.length));
 const evidenceCoherence=.4+.6*evidence;
 const goal=.5+.35*continuity+.15*(active.length?1:0);
 const components={
  logical:clamp(logical),
  temporal:clamp(temporal),
  causal:clamp(causal),
  memory:clamp(memory),
  evidence:clamp(evidenceCoherence),
  goal:clamp(goal)
 };
 const weights={logical:.2,temporal:.12,causal:.16,memory:.18,evidence:.22,goal:.12};
 const composite=Object.entries(weights).reduce((s,[k,w])=>s+components[k]*w,0);
 return{schema:'OMEGA_COHERENCE_VECTOR_R331',components,weights,composite:clamp(composite),validatedScientificMetric:false,boundary:'Software coherence heuristic derived from declared runtime/memory state; it is not an empirical cognitive-science measurement.'};
}

export async function appendLearningEventR331(ledger,event){
 const rows=Array.isArray(ledger)?ledger:[];
 const previousHash=rows.length?rows[rows.length-1].eventHash:null;
 const core={
  schema:'OMEGA_LEARNING_EVENT_R331',
  id:text(event?.id)||'evt_'+Date.now().toString(36),
  type:text(event?.type)||'TURN',
  timestamp:Number.isFinite(Number(event?.timestamp))?Number(event.timestamp):Date.now(),
  payload:event?.payload&&typeof event.payload==='object'?event.payload:{},
  previousHash,
  canonicalAdmission:false
 };
 const eventHash=await sha256R331(core);
 return[...rows,Object.freeze({...core,eventHash})].slice(-512);
}

export function communicationContextR331({memories=[],ledger=[],query='',runtimeContext={}}={}){
 const selected=selectMemoriesR331(memories,query,8);
 const coherence=coherenceVectorR331({runtimeContext,selectedMemories:selected,ledger});
 const recentTurns=(Array.isArray(ledger)?ledger:[]).filter(x=>x?.type==='TURN').slice(-6).map(x=>({
  id:x.id,
  timestamp:x.timestamp,
  userText:text(x.payload?.userText).slice(0,600),
  assistantReply:text(x.payload?.assistantReply).slice(0,900),
  provider:text(x.payload?.provider),
  evidenceStatus:text(x.payload?.evidenceStatus)
 }));
 return{
  schema:'OMEGA_COMMUNICATION_CONTEXT_R331',
  revision:R331_COGNITIVE_LEARNING_REVISION,
  selectedMemories:selected.map(m=>({id:m.id,kind:m.kind,content:m.content,confidence:m.confidence,evidenceClass:m.evidenceClass,stateVersion:m.stateVersion,retrievalScore:m.retrievalScore})),
  recentTurns,
  coherence,
  learningPolicy:{
   foundationWeightsChanged:false,
   modelOutputMayCreateEpisodicMemory:true,
   modelOutputMaySelfPromoteSemantic:false,
   semanticOrProceduralPromotionRequires:['USER_CONFIRMED','RETURN_VERIFIED','SOURCE_BOUND'],
   canonicalAdmission:false
  },
  communicationPolicy:[
   'Use memory for continuity, not authority.',
   'Prefer explicit correction over stale memory.',
   'Distinguish source facts, returned evidence, user-confirmed memory, and model interpretation.',
   'When evidence is weak or conflicting, say so and ask or abstain rather than inventing closure.',
   'Preserve the user goal across turns while allowing newer verified evidence to supersede older memory.'
  ]
 };
}

export const R331_B12_PROGRESS_RECEIPT=Object.freeze({
 revision:'R331',
 stage:'R314-B12',
 state:'ACTIVE_PARTIAL',
 source:'AGI_QTI_LLM_FULL_ARCHITECTURE_ATLAS',
 implemented:['working/episodic retrieval context','typed memory object','append-only hashed learning ledger','feedback-driven semantic/procedural promotion gate','coherence vector','session-scoped communication continuity'],
 remaining:['full QTI G1-G10 action gate engine','independent safety controller expansion','watchdog vector integration','transactional cognition-to-action pipeline','external benchmark/evaluation'],
 canonicalAdmission:false,
 foundationWeightsChanged:false
});
