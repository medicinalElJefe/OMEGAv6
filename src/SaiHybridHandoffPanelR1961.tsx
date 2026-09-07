import {useMemo,useState} from 'react';
import {ArrowRight,CheckCircle2,GitBranch,Route,ShieldCheck,TriangleAlert} from 'lucide-react';
import {api} from './platformAdapter';
import {appendSaiLedger,compileSaiImprovementProposal} from './saiB059Runtime';
import {compileSaiHybridHandoffR1961,verifyHybridDraftForSaiR1961} from './saiHybridHandoffR1961';
import './saiHybridHandoffR1961.css';

export default function SaiHybridHandoffPanelR1961({record,modeSummary}:{record:any;modeSummary:{appliedCount:number;gatedCount:number;catalogCount:number}}){
 const proposal=useMemo(()=>compileSaiImprovementProposal(record,modeSummary),[record,modeSummary.appliedCount,modeSummary.gatedCount,modeSummary.catalogCount]);
 const handoff=useMemo(()=>compileSaiHybridHandoffR1961(proposal),[proposal]);
 const[draft,setDraft]=useState<any>(null),[validation,setValidation]=useState<any>(null),[busy,setBusy]=useState(''),[error,setError]=useState('');
 const proof=useMemo(()=>draft?verifyHybridDraftForSaiR1961(handoff,draft,validation):null,[handoff,draft,validation]);
 const prepare=async()=>{
  if(busy)return;setBusy('prepare');setError('');setValidation(null);
  try{
   const r=await api.post<any>('/api/hybrid/plan',{prompt:handoff.prompt,root:handoff.root});
   const next=r.data?.draft||null;
   const held=verifyHybridDraftForSaiR1961(handoff,next);
   if(!held.passed)throw new Error(`Hybrid draft violated R196.1 hold boundary: ${held.errors.join(', ')}`);
   setDraft(next);
   await appendSaiLedger('R196_1_HYBRID_DRAFT_PREPARED',{proposalId:handoff.proposalId,draftFingerprint:next?.fingerprint??null,state:next?.state,confirmed:next?.confirmed,deviceId:next?.deviceId,operationCount:next?.operations?.length||0,queueMutation:false,executionClaimed:false});
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy('')}
 };
 const validate=async()=>{
  if(!draft||busy)return;setBusy('validate');setError('');
  try{
   const r=await api.post<any>('/api/hybrid/validate',{plan:draft}),next=r.data;
   const checked=verifyHybridDraftForSaiR1961(handoff,draft,next);
   setValidation(next);
   await appendSaiLedger('R196_1_HYBRID_DRAFT_VALIDATED',{proposalId:handoff.proposalId,draftFingerprint:draft?.fingerprint??null,valid:next?.valid===true,proof:checked});
   if(!checked.passed)throw new Error(`Hybrid validation did not satisfy R196.1: ${checked.errors.join(', ')}`);
  }catch(e){setError(e instanceof Error?e.message:String(e))}finally{setBusy('')}
 };
 return <section className='sai-r1961' data-sai-hybrid-handoff='R196.1' data-queue-mutation='false'>
  <header><div><span>R196.1 · SAI → HYBRID GOVERNED HANDOFF</span><h3>Proposal becomes a typed draft—not a hidden action.</h3><p>B059 diagnoses and proposes. R196.1 translates that exact proposal into the existing V90 Hybrid planning contract, proves the returned draft is held and unbound, then allows validation. Execution still requires the existing operator confirmation and authenticated Hybrid path.</p></div><ShieldCheck/></header>
  <div className='sai-r1961-chain'>{handoff.authorityChain.map((x,i)=><span key={x} className={i<4?'prepared':i===4?'operator':''}><code>{String(i+1).padStart(2,'0')}</code><b>{x.replaceAll('_',' ')}</b></span>)}</div>
  <div className='sai-r1961-body'><article><span>CURRENT SAI PROPOSAL</span><b>{proposal.proposalId}</b><strong>{proposal.priority} · {proposal.decision}</strong><p>{proposal.observations[0]}</p><small>{proposal.targets.length} bounded target{proposal.targets.length===1?'':'s'} · state {proposal.stateId} · address {proposal.address}</small></article><article><span>HANDOFF LAW</span><b>{handoff.expectedDraftState.replaceAll('_',' ')}</b><strong>CONFIRMATION REQUIRED</strong><p>Device binding, queue mutation, native execution, deployment and Canon admission are forbidden at this stage.</p><small>Canon admission authority · {handoff.canonicalAdmissionAuthority}</small></article></div>
  <div className='sai-r1961-actions'><button className='primary' onClick={()=>void prepare()} disabled={!!busy}><Route/>{busy==='prepare'?'Preparing held draft…':draft?'Rebuild held draft':'Prepare governed Hybrid draft'}</button><ArrowRight/><button onClick={()=>void validate()} disabled={!draft||!!busy}><GitBranch/>{busy==='validate'?'Validating…':'Validate exact draft'}</button>{proof&&<div className={proof.passed?'pass':'hold'}>{proof.passed?<CheckCircle2/>:<TriangleAlert/>}<span><b>{proof.passed?'BOUNDARY PASS':'BOUNDARY HOLD'}</b><small>{proof.draftState||'NO DRAFT'} · {proof.operationCount} ops · validation {proof.validationPassed?'PASS':'pending'}</small></span></div>}</div>
  {draft&&<details><summary>Inspect typed Hybrid draft · {draft.operations?.length||0} operations</summary><div className='sai-r1961-ops'>{draft.operations?.map((x:any)=><span key={x.step}><code>{String(x.step).padStart(2,'0')}</code><b>{x.op}</b><small>{x.profile||'typed operation'}</small></span>)}</div><footer><ShieldCheck/><p><b>{draft.state}</b> · confirmed={String(draft.confirmed)} · device={String(draft.deviceId)}. This panel has no queue/confirm/execute call. Continue through the existing Hybrid Mission Control for explicit governed execution.</p></footer></details>}
  {error&&<div className='sai-r1961-error'>{error}</div>}
 </section>;
}
