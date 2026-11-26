import {useRef,useState} from 'react';
import {api,getHybridBridge} from './platformAdapter';
import {operationContractForRouteR143} from './authoritativeOperationChainR143';
import {createAuthorizedOperationRunR146,replayDurableOperationRunR146} from './durableExecutionClientR146';
import {dispatchExecutionRunR147,executionResultR147,executorDirectoryR147} from './executorFabricClientR147';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';

const HEX=/^[a-f0-9]{64}$/;
const RUN=/^run_[a-f0-9]{32}$/;
type Kind='SYNTHESIS'|'TRAIN_REGIONAL';
type Snapshot={id:string;headSha256:string;state:string;address:number;kind:Kind;query:string;sourceSha256:string;packet:any};
async function snapshotOf(run:any):Promise<Snapshot>{
 const p=run?.metadata?.sourcePacket;
 if(!RUN.test(run?.id||'')||!HEX.test(run?.headSha256||'')||run?.contract?.executionDomain!=='SAI'||p?.schema!=='OMEGA_SAI_SERVER_SOURCE_V1'||!['SYNTHESIS','TRAIN_REGIONAL'].includes(p.kind)||!HEX.test(p.packetSha256||'')||p.canonicalMutation!==false||p.empirical!==false)throw Error('No matching server-source-bound SAI run.');
 const {packetSha256,prompt,...body}=p;if(await inspectionSHA(body)!==packetSha256)throw Error('Server source packet digest mismatch.');
 return {id:run.id,headSha256:run.headSha256,state:run.state,address:p.address,kind:p.kind,query:p.query||'',sourceSha256:packetSha256,packet:p};
}
export default function SaiCloudExecution({record,query,onNavigate}:{record:any;query:string;onNavigate?:(route:string)=>void}){
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('No cloud run selected.'),[result,setResult]=useState<any>(null),[runId,setRunId]=useState('');
 const lock=useRef(false);
 const act=async(fn:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);try{await fn()}catch(e){setMessage((e instanceof Error?e.message:String(e))+' Inspect the durable run before retrying; no automatic dispatch.')}finally{lock.current=false;setBusy(false)}};
 const prepare=(kind:Kind)=>void act(async()=>{
  if(!getHybridBridge())throw Error('Pair the authenticated runtime in Hybrid Link first.');
  const directory=await executorDirectoryR147(),executor=kind==='SYNTHESIS'?'WORKERS_AI':'LOCAL_RUNTIME';
  if(directory.executors?.[executor]?.state!=='AVAILABLE')throw Error('Requested cloud executor unavailable.');
  const request=kind==='SYNTHESIS'?{kind,address:record.address,query:query.trim()}:{kind,address:record.address,epochs:24};
  if(kind==='SYNTHESIS'&&(!query.trim()||query.trim().length>1200))throw Error('Enter a query of 1–1200 characters.');
  setResult(null);setMessage('Reconstructing and authorizing source packet in the cloud Worker…');
  const run=await createAuthorizedOperationRunR146(operationContractForRouteR143('SAI Lab'),{saiCloudExecution:kind==='SYNTHESIS',saiCloudTraining:kind==='TRAIN_REGIONAL',saiRequest:request});
  const next=await snapshotOf(run);
  if(next.state!=='AUTHORIZED'||next.address!==record.address||next.kind!==kind)throw Error('No exact authorized source run returned.');
  setSnapshot(next);setRunId(next.id);setMessage('Server source packet bound; authorized, not dispatched. Review before execution.');
 });
 const read=async(id:string)=>{
  if(!RUN.test(id))throw Error('Enter a valid durable run ID.');
  const r=(await api.get<any>('/api/execution/runs/'+encodeURIComponent(id))).data,run=r?.run;
  if(r?.ok!==true||run?.id!==id)throw Error('No matching SAI cloud run.');
  const next=await snapshotOf(run),receipt=await replayDurableOperationRunR146(id);
  if(receipt?.ok!==true||receipt?.intentBound!==true||receipt?.headMatch!==true||receipt?.storedHeadSha256!==next.headSha256)throw Error('Durable source-bound replay did not match.');
  return {run,next};
 };
 const inspect=()=>void act(async()=>{
  const id=runId.trim(),{run,next}=await read(id);setResult(null);setSnapshot(next);
  if(next.state==='VERIFIED'){
   const v=await executionResultR147(id),stored=v?.result,executor=next.kind==='SYNTHESIS'?'WORKERS_AI':'LOCAL_RUNTIME';
   if(v?.runId!==id||v?.state!=='VERIFIED'||stored?.runId!==id||stored?.executorId!==executor||!HEX.test(stored?.resultFingerprint||'')||stored?.canonicalMutation!==false)throw Error('Persisted return did not match SAI run.');
   const terminal=run.events?.at(-1);
   if(terminal?.evidence?.resultFingerprint!==stored.resultFingerprint)throw Error('Result fingerprint differs from verification event.');
   const {resultFingerprint,...body}=stored;if(await inspectionSHA(body)!==resultFingerprint)throw Error('Persisted result content hash mismatch.');
   if(next.kind==='TRAIN_REGIONAL'&&stored.payload?.sourceSha256!==next.sourceSha256)throw Error('Training source mismatch.');
   setResult(stored);setMessage('Persisted execution return and source-bound R146 replay agree. Not empirical or Canon proof.');
  }else setMessage('Observed durable state: '+next.state+'. No new dispatch performed.');
 });
 const execute=()=>void act(async()=>{
  if(!snapshot||snapshot.state!=='AUTHORIZED'||snapshot.address!==record.address||(snapshot.kind==='SYNTHESIS'&&snapshot.query!==query.trim()))throw Error('Current address or query differs from authorized request.');
  const {next}=await read(snapshot.id);
  if(next.state!=='AUTHORIZED'||next.headSha256!==snapshot.headSha256||next.sourceSha256!==snapshot.sourceSha256)throw Error('Authorization changed; inspect before continuing.');
  const executor=next.kind==='SYNTHESIS'?'WORKERS_AI':'LOCAL_RUNTIME',directory=await executorDirectoryR147();if(directory.executors?.[executor]?.state!=='AVAILABLE')throw Error('Requested executor unavailable.');
  setMessage('Dispatching authorized '+next.kind+'…');setSnapshot({...next,state:'DISPATCH_REQUESTED'});
  const r=await dispatchExecutionRunR147(next.id,{executorId:executor,sourceSha256:next.sourceSha256});
  if(r?.run?.id!==next.id||r?.run?.state!=='VERIFIED'||r?.result?.executorId!==executor)throw Error('Cloud return not verified; inspect the durable run.');
  setMessage('Cloud return received. Inspect saved result and replay to verify.');setSnapshot({...next,state:'RETURN_INSPECTION_REQUIRED'});
 });
 const download=()=>{if(!result)return;const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='omega-sai-cloud-'+runId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 return <section aria-label='SAI cloud execution' data-sai-cloud-execution='R146_R147' style={{border:'1px solid #527286',padding:12,borderRadius:10,margin:'12px 0',minWidth:0,overflowWrap:'anywhere'}}>
 <h3>SAI · Cloud execution and supervised learning</h3><p>The Worker reconstructs source evidence from its packaged 20,736-address field. Query synthesis uses actual region witnesses and source-backed modes. Regional training runs the recovered R995 optimizer against the source-derived scar channel (not empirical data or foundation weights).</p>
 <button type='button' disabled={busy||!query.trim()||query.trim().length>1200} onClick={()=>prepare('SYNTHESIS')}>Authorize cloud synthesis</button> <button type='button' disabled={busy} onClick={()=>prepare('TRAIN_REGIONAL')}>Authorize regional learning</button> <button type='button' disabled={busy||snapshot?.state!=='AUTHORIZED'} onClick={execute}>Execute authorized operation</button>
 <label style={{display:'block'}}>Durable run ID<input style={{maxWidth:'100%'}} value={runId} onChange={e=>{setRunId(e.target.value);setSnapshot(null);setResult(null)}} disabled={busy}/></label>
 <button type='button' disabled={busy||!RUN.test(runId.trim())} onClick={inspect}>Inspect saved run and proof</button>
 {snapshot&&<><p>Run {snapshot.id} · {snapshot.state} · address {snapshot.address} · {snapshot.kind}</p><details><summary>Review server-authorized source packet</summary><pre style={{whiteSpace:'pre-wrap',maxHeight:240,overflow:'auto'}}>{JSON.stringify(snapshot.packet,null,2)}</pre></details></>}
 {result&&<>{snapshot?.kind==='SYNTHESIS'?<p style={{whiteSpace:'pre-wrap'}}>{String(result.payload?.text||'')}</p>:<p>Completed regional learning · held-out MSE {String(result.payload?.evaluation?.partitions?.test?.mse??'unavailable')} · no foundation weight mutation.</p>}<details><summary>Returned result and checkpoint</summary><pre style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:240,overflow:'auto'}}>{JSON.stringify(result,null,2)}</pre></details><button type='button' onClick={download}>Export verified cloud result</button></>}
 {onNavigate&&<button type='button' disabled={busy} onClick={()=>onNavigate('Hybrid Link')}>Open full Hybrid Link</button>}
 <p role='status'>{message}</p><small>Server-derived projected source, R146 immutable intent, R147 existing executor, independent R141 host proof and R125 admission. Original donor data and external evidence remain distinct.</small></section>
}
