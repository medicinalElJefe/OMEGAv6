import {useEffect,useRef,useState} from 'react';
import {api} from './platformAdapter';
import {operationContractForRouteR143} from './authoritativeOperationChainR143';
import {createAuthorizedOperationRunR146,replayDurableOperationRunR146} from './durableExecutionClientR146';
import {dispatchExecutionRunR147,executionResultR147} from './executorFabricClientR147';
import {readPendingLineageR209,readAcceptedLineageR209,verifyPendingLineageR209,R209_EVENT,R209_ACCEPTED_EVENT} from './missionLineageR209';
import {saiInspectionSteps,stableInspectionJSON,verifySaiInspectionDraft,inspectionSHA} from './execution/saiHostInspectionR209.js';

type Props={deviceId:string;ready:boolean;hashMaxResults:number;refresh:()=>Promise<void>};
const RUN=/^run_[a-f0-9]{32}$/;
const HEX=/^[a-f0-9]{64}$/;
export default function SaiHostInspectionControls({deviceId,ready,hashMaxResults,refresh}:Props){
 const [lineage,setLineage]=useState(readPendingLineageR209),[imported,setImported]=useState(readAcceptedLineageR209),[runId,setRunId]=useState(''),[run,setRun]=useState<any>(null),[result,setResult]=useState<any>(null),[message,setMessage]=useState('Import the exact held SAI draft in the R209 review surface.'),[busy,setBusy]=useState(false);
 const lock=useRef(false),current=useRef({deviceId,ready,hashMaxResults});current.current={deviceId,ready,hashMaxResults};
 useEffect(()=>{const sync=()=>{setLineage(readPendingLineageR209());setImported(readAcceptedLineageR209());setRun(null);setResult(null)};window.addEventListener(R209_EVENT,sync);window.addEventListener(R209_ACCEPTED_EVENT,sync);return()=>{window.removeEventListener(R209_EVENT,sync);window.removeEventListener(R209_ACCEPTED_EVENT,sync)}},[]);
 const accepted=!!lineage&&!!imported&&lineage.lineageId===imported.lineageId&&lineage.draftFingerprint===imported.draftFingerprint;
 const act=async(fn:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);try{await fn()}catch(e){setMessage((e instanceof Error?e.message:String(e))+' Inspect the durable run; no automatic retry.')}finally{lock.current=false;setBusy(false)}};
 const source=async()=>{
  const l=readPendingLineageR209(),a=readAcceptedLineageR209();
  if(!l||!a||a.lineageId!==l.lineageId||a.draftFingerprint!==l.draftFingerprint||!await verifyPendingLineageR209(l)||!await verifySaiInspectionDraft(l.heldDraft))throw Error('Prepare and explicitly import the exact typed SAI draft.');
  return l;
 };
 const read=async(id:string)=>{
  if(!RUN.test(id))throw Error('Enter a valid durable run ID.');
  const r=(await api.get<any>('/api/execution/runs/'+encodeURIComponent(id))).data,observed=r?.run;
  if(r?.ok!==true||observed?.id!==id||observed?.contract?.executionDomain!=='HYBRID'||!observed?.metadata?.saiHostInspection||!HEX.test(observed.headSha256||''))throw Error('No matching SAI host inspection run.');
  const proof=await replayDurableOperationRunR146(id);if(proof?.ok!==true||proof?.headMatch!==true||proof.storedHeadSha256!==observed.headSha256)throw Error('Durable run replay failed.');
  return observed;
 };
 const authorize=()=>void act(async()=>{
  const l=await source(),host=current.current;
  if(!host.ready||!host.deviceId)throw Error('Current authenticated host and R239 admission required.');
  const maxResults=Math.min(750,host.hashMaxResults),steps=await saiInspectionSteps(l.heldDraft,maxResults);
  if(!current.current.ready||current.current.deviceId!==host.deviceId||current.current.hashMaxResults<maxResults)throw Error('Host or resource envelope changed.');
  const created=await createAuthorizedOperationRunR146(operationContractForRouteR143('Hybrid Link'),{saiHostInspection:{lineageId:l.lineageId,ancestrySha256:l.ancestrySha256,draft:l.heldDraft,targetDeviceId:host.deviceId,maxResults,steps}});
  if(!created||!RUN.test(created.id)||created.state!=='AUTHORIZED'||!HEX.test(created.headSha256||''))throw Error('No authorized durable host run returned.');
  setRun(created);setRunId(created.id);setResult(null);setMessage('Authorized exact source inspection; not dispatched. Confirm execution separately.');
 });
 const inspect=()=>void act(async()=>{
  const id=runId.trim(),observed=await read(id),view=await executionResultR147(id);
  if(view?.runId!==id||view?.state!==observed.state)throw Error('Run changed during inspection; refresh.');
  setRun(observed);setResult(view);
  if(observed.state==='VERIFIED'){
   const stored=view.result,terminal=observed.events?.at(-1),closure=stored?.payload?.closure;
   if(stored?.runId!==id||stored?.executorId!=='HYBRID_HOST'||stored?.payload?.jobId!==view.binding?.artifactId||closure?.state!=='VERIFIED_EXECUTION_RETURN'||closure.fingerprint?.verified!==true||closure.fingerprint?.digestMatch!==true||closure.fingerprint?.semanticMatch!==true||terminal?.evidence?.providerReceipt!==stored.resultFingerprint)throw Error('Host proof is incomplete.');
   const {resultFingerprint,...body}=stored;if(await inspectionSHA(body)!==resultFingerprint)throw Error('Stored result content hash does not match.');
   setMessage('Verified actual R141 host return, R146 replay and persisted result. No Canon admission.');
  }else setMessage('Observed '+observed.state+(view?.hostDispatchReservation?.state==='PENDING_OR_UNCERTAIN'?' · queue reservation held for reconciliation':'')+'. No additional dispatch.');
 });
 const dispatch=()=>void act(async()=>{
  if(run?.state!=='AUTHORIZED')throw Error('Current authorized run required.');
  const l=await source(),observed=await read(run.id),m=observed.metadata.saiHostInspection,host=current.current;
  if(observed.state!=='AUTHORIZED'||observed.headSha256!==run.headSha256||m.lineageId!==l.lineageId||m.ancestrySha256!==l.ancestrySha256||stableInspectionJSON(m.draft)!==stableInspectionJSON(l.heldDraft)||!host.ready||host.deviceId!==m.targetDeviceId||host.hashMaxResults<m.maxResults)throw Error('Stale lineage, run or host admission.');
  const steps=await saiInspectionSteps(l.heldDraft,m.maxResults);if(stableInspectionJSON(steps)!==stableInspectionJSON(m.steps)||!current.current.ready||current.current.deviceId!==m.targetDeviceId||current.current.hashMaxResults<m.maxResults)throw Error('Exact step or resource mismatch.');
  setRun({...observed,state:'DISPATCH_REQUESTED'});setMessage('Submitting exact authorized inspection; native claim and return still required.');
  const r=await dispatchExecutionRunR147(observed.id,{executorId:'HYBRID_HOST',targetDeviceId:m.targetDeviceId,projectPath:l.heldDraft.root,steps,confirmed:true,instructions:'SAI source inspection '+l.lineageId});
  if(r?.ok!==true||r?.run?.id!==observed.id||r?.binding?.targetDeviceId!==m.targetDeviceId||!r?.job?.id)throw Error('No exact host queue receipt.');
  setRun(r.run);setResult(r);setMessage('Queued '+r.job.id+'; not a verified host return. Inspect saved run after host execution.');await refresh();
 });
 return <section aria-label='SAI authorized host inspection' style={{border:'1px solid #527286',padding:12,borderRadius:10,margin:'12px 0',overflowWrap:'anywhere'}}>
 <h4>SAI → Hybrid Link · source inspection</h4><p>Execute the imported exact INDEX / HASH_TREE draft through the existing R147 host dispatcher. Later build, repair and training use their existing governed command authorities.</p>
 <p>{accepted?'Imported lineage '+lineage?.lineageId:'No imported typed lineage'} · {ready?'Current host admission':'Host admission held'}</p>
 <button type='button' disabled={busy||!accepted||!ready||!!run&&!['VERIFIED','FAILED','REJECTED','STALE','UNAVAILABLE'].includes(run.state)} onClick={authorize}>Authorize imported inspection</button> <button type='button' disabled={busy||!ready||!accepted||run?.state!=='AUTHORIZED'} onClick={dispatch}>Execute on selected PC</button>
 <label style={{display:'block'}}>Inspection run ID<input value={runId} disabled={busy} onChange={e=>{setRunId(e.target.value);setRun(null);setResult(null)}} style={{maxWidth:'100%'}}/></label>
 <button type='button' disabled={busy||!RUN.test(runId.trim())} onClick={inspect}>Inspect host run and proof</button>
 {run&&<p>Durable state: {run.state}</p>}{result&&<details><summary>Exact run / queue / return receipt</summary><pre style={{whiteSpace:'pre-wrap',maxHeight:260,overflow:'auto'}}>{JSON.stringify(result,null,2)}</pre></details>}
 <p role='status'>{message}</p></section>
}
