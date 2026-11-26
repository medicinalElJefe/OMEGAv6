import {useRef,useState} from 'react';
import {api,getHybridBridge} from './platformAdapter';
import {operationContractForRouteR143} from './authoritativeOperationChainR143';
import {createAuthorizedOperationRunR146,replayDurableOperationRunR146} from './durableExecutionClientR146';
import {dispatchExecutionRunR147,executionResultR147,executorDirectoryR147} from './executorFabricClientR147';
import {compileSaiRetrievalPlan,compileSaiImprovementProposal} from './saiB059Runtime';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';

const HEX=/^[a-f0-9]{64}$/;
const RUN=/^run_[a-f0-9]{32}$/;
type Snapshot={id:string;headSha256:string;state:string;address:number;prompt:string};
export default function SaiCloudExecution({record,query,onNavigate}:{record:any;query:string;onNavigate?:(route:string)=>void}){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('No cloud run selected.'),[result,setResult]=useState<any>(null),[runId,setRunId]=useState('');
 const lock=useRef(false);
 const buildPrompt=()=>{
  const request=query.trim();if(!request||request.length>1200)throw Error('Enter a query of 1–1200 characters.');
  const plan=compileSaiRetrievalPlan(request,record.address),proposal=compileSaiImprovementProposal(record);
  return JSON.stringify({task:request,sourcePacket:{address:plan.address,stateId:plan.stateId,kernel:plan.kernel,roles:plan.roles,workflow:plan.workflow,proposal},limitations:['This is the current canonical packet and source-role plan, not retrieved historical donor documents.','Identify uncertainty and missing evidence. Return analysis only, no shell commands or execution authorization.']});
 };
 const act=async(fn:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);try{await fn()}catch(e){setMessage((e instanceof Error?e.message:String(e))+' Inspect the durable run before retrying; no automatic dispatch.')}finally{lock.current=false;setBusy(false)}};
 const prepare=()=>void act(async()=>{
  if(!getHybridBridge())throw Error('Pair the authenticated runtime in Hybrid Link first.');
  const prompt=buildPrompt(),directory=await executorDirectoryR147();
  if(directory.executors?.WORKERS_AI?.state!=='AVAILABLE')throw Error('Cloud model executor is not available.');
  setResult(null);setMessage('Authorizing exact source-bound SAI request…');
  const run=await createAuthorizedOperationRunR146(operationContractForRouteR143('SAI Lab'),{saiCloudExecution:true,address:record.address,stateId:record.stateId,sourcePrompt:prompt});
  if(!run||!RUN.test(run.id)||run.state!=='AUTHORIZED'||!HEX.test(run.headSha256||''))throw Error('No authorized durable run returned.');
  setSnapshot({id:run.id,headSha256:run.headSha256!,state:run.state,address:record.address,prompt});setRunId(run.id);setMessage('Authorized, not dispatched. Review and execute explicitly.');
 });
 const read=async(id:string)=>{
  if(!RUN.test(id))throw Error('Enter a valid durable run ID.');
  const r=(await api.get<any>('/api/execution/runs/'+encodeURIComponent(id))).data,run=r?.run;
  if(r?.ok!==true||run?.id!==id||run?.contract?.executionDomain!=='SAI'||run?.metadata?.saiCloudExecution!==true||!HEX.test(run?.headSha256||''))throw Error('No matching SAI cloud run.');
  const receipt=await replayDurableOperationRunR146(id);if(receipt?.ok!==true||receipt?.headMatch!==true||receipt?.storedHeadSha256!==run.headSha256)throw Error('Durable replay did not match the current run.');
  return run;
 };
 const inspect=()=>void act(async()=>{
  const id=runId.trim(),run=await read(id);setResult(null);
  setSnapshot({id,headSha256:run.headSha256,state:run.state,address:Number(run.metadata.address),prompt:String(run.metadata.sourcePrompt||'')});
  if(run.state==='VERIFIED'){
   const v=await executionResultR147(id),stored=v?.result;
   if(v?.runId!==id||v?.state!=='VERIFIED'||stored?.runId!==id||stored?.executorId!=='WORKERS_AI'||!HEX.test(stored?.resultFingerprint||'')||stored?.canonicalMutation!==false)throw Error('Persisted model return did not match SAI run.');
   const terminal=run.events?.at(-1);
   if(terminal?.evidence?.resultFingerprint!==stored.resultFingerprint)throw Error('Model result fingerprint differs from durable verification event.');
   const {resultFingerprint,...body}=stored;if(await inspectionSHA(body)!==resultFingerprint)throw Error('Persisted model result content hash mismatch.');
   setResult(stored);setMessage('Persisted model return and R146 replay agree. This is not factual or Canon proof.');
  }else setMessage('Observed durable state: '+run.state+'. No new dispatch performed.');
 });
 const execute=()=>void act(async()=>{
  if(!snapshot||snapshot.state!=='AUTHORIZED'||snapshot.address!==record.address||snapshot.prompt!==buildPrompt())throw Error('Current state or query differs from authorized request.');
  const current=await read(snapshot.id);
  if(current.state!=='AUTHORIZED'||current.headSha256!==snapshot.headSha256||current.metadata.sourcePrompt!==snapshot.prompt)throw Error('Authorization changed; inspect before continuing.');
  const directory=await executorDirectoryR147();if(directory.executors?.WORKERS_AI?.state!=='AVAILABLE')throw Error('Cloud model unavailable.');
  // Preserve the run ID before invocation. A network timeout may occur after execution.
  setMessage('Dispatching bounded Cloudflare Workers AI run…');setSnapshot({...snapshot,state:'DISPATCH_REQUESTED'});
  const r=await dispatchExecutionRunR147(snapshot.id,{executorId:'WORKERS_AI',prompt:snapshot.prompt,maxTokens:900,temperature:.2});
  if(r?.run?.id!==snapshot.id||r?.run?.state!=='VERIFIED'||r?.result?.executorId!=='WORKERS_AI')throw Error('Cloud return not verified; inspect the durable run.');
  setMessage('Cloud return received. Inspect saved result and replay to verify.');setSnapshot({...snapshot,state:'RETURN_INSPECTION_REQUIRED'});
 });
 return <section aria-label='SAI cloud execution' data-sai-cloud-execution='R146_R147' style={{border:'1px solid #527286',padding:12,borderRadius:10,margin:'12px 0',minWidth:0,overflowWrap:'anywhere'}}>
 <h3>SAI · Cloud execution</h3><p>Use the current canonical packet to invoke the existing Workers AI executor. Pairing authenticates the durable runtime; a PC need not be online for cloud inference. No model output can authorize a host job.</p>
 <button type='button' disabled={busy||!query.trim()||query.trim().length>1200} onClick={prepare}>Authorize cloud synthesis</button> <button type='button' disabled={busy||snapshot?.state!=='AUTHORIZED'} onClick={execute}>Execute authorized synthesis</button>
 <label style={{display:'block'}}>Durable run ID<input style={{maxWidth:'100%'}} value={runId} onChange={e=>{setRunId(e.target.value);setSnapshot(null);setResult(null)}} disabled={busy}/></label>
 <button type='button' disabled={busy||!RUN.test(runId.trim())} onClick={inspect}>Inspect saved run and proof</button>
 {snapshot&&<p>Run {snapshot.id} · {snapshot.state} · address {snapshot.address}</p>}
 {result&&<><p style={{whiteSpace:'pre-wrap'}}>{String(result.payload?.text||'')}</p><details><summary>Returned model receipt</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:240,overflow:'auto'}}>{JSON.stringify(result,null,2)}</pre></details></>}
 {onNavigate&&<button type='button' disabled={busy} onClick={()=>onNavigate('Hybrid Link')}>Open full Hybrid Link</button>}
 <p role='status'>{message}</p><small>R146 durable authorization → R147 model invocation → stored return and replay. Separate R196.1/R209 held host draft, R237 command and R141 proof. R125 unchanged.</small></section>
}
