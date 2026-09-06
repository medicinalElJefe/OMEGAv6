import {useEffect,useMemo,useState} from 'react';
import {Activity,CheckCircle2,CircleDot,GitBranch,PauseCircle,Play,RefreshCw,RotateCcw,ShieldCheck,Square,Workflow} from 'lucide-react';
import {authorizeOperationGraphR148,cancelOperationGraphR148,confirmOperationGraphNodeR148,createOperationGraphR148,graphTemplateR148,readOperationGraphR148,replayOperationGraphR148,resumeOperationGraphNodeR148,tickOperationGraphR148,type R148Template,R148_GRAPH_BOUNDARY} from './executionGraphClientR148';
import './omegaOperationGraphR148.css';

type Props={panel:string;address:number;record:any};
const TEMPLATES:Array<{id:R148Template;label:string;detail:string}>=[
 {id:'FULL_BUILD',label:'FULL BUILD',detail:'parallel intelligence + swarm planning → confirmed PC build → validation → evidence'},
 {id:'SWARM_SYNTHESIS',label:'SWARM SYNTHESIS',detail:'source intelligence + autonomic swarm → federation convergence → proof'},
 {id:'FEDERATION_PROOF',label:'FEDERATION PROOF',detail:'candidate framing → Genesis PROPOSE / Optical SCREEN → evidence audit'},
 {id:'LOCAL_INTEGRITY',label:'LOCAL INTEGRITY',detail:'bounded runtime inspection → deterministic execution-ledger replay'}
];
const activeStates=new Set(['AUTHORIZED','RUNNING']);
const nodeActive=new Set(['PENDING','WAITING_DEPENDENCY','READY','DISPATCHED','RUNNING']);
const short=(v:any,n=14)=>String(v??'').slice(0,n);

export default function OmegaOperationGraphR148({panel,address,record}:Props){
 const[template,setTemplate]=useState<R148Template>('FULL_BUILD'),[intent,setIntent]=useState(`Advance ${panel} from canonical STATE ${record?.stateId||address+1} while preserving inherited proof, Hybrid root safety, all-mode computation and R125 admission boundaries.`),[projectPath,setProjectPath]=useState('.'),[graph,setGraph]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[replay,setReplay]=useState<any>(null);
 const spec=useMemo(()=>graphTemplateR148(template,intent,{projectPath}),[template,intent,projectPath]);
 const needsTick=Boolean(graph&&activeStates.has(graph.state)&&graph.nodes?.some((n:any)=>nodeActive.has(n.state)));
 const waitingConfirmation=graph?.nodes?.filter((n:any)=>n.state==='WAITING_CONFIRMATION')||[];
 const held=graph?.nodes?.filter((n:any)=>n.state==='HOLD')||[];
 const verified=graph?.nodes?.filter((n:any)=>n.state==='VERIFIED').length||0;
 const run=async(fn:()=>Promise<any>)=>{setBusy(true);setError('');try{const next=await fn();if(next?.id||next?.schema==='OMEGA_DURABLE_OPERATION_GRAPH_R148')setGraph(next);return next}catch(e:any){setError(e?.message||String(e));return null}finally{setBusy(false)}};
 const create=()=>run(()=>createOperationGraphR148(spec));
 const authorize=async()=>{if(!graph)return;const next=await run(()=>authorizeOperationGraphR148(graph.id,true));if(next)await run(()=>tickOperationGraphR148(next.id))};
 const tick=()=>graph?run(()=>tickOperationGraphR148(graph.id)):Promise.resolve(null);
 const confirm=async(node:any)=>{const next=await run(()=>confirmOperationGraphNodeR148(graph.id,node.id,{projectPath,instructions:intent}));if(next)await run(()=>tickOperationGraphR148(graph.id))};
 const resume=async(node:any)=>{const next=await run(()=>resumeOperationGraphNodeR148(graph.id,node.id,{projectPath,instructions:intent}));if(next)await run(()=>tickOperationGraphR148(graph.id))};
 const cancel=()=>graph?run(()=>cancelOperationGraphR148(graph.id)):Promise.resolve(null);
 const verifyReplay=async()=>{if(!graph)return;setBusy(true);setError('');try{setReplay(await replayOperationGraphR148(graph.id))}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 useEffect(()=>{if(!needsTick||!graph?.id)return;let live=true;const id=window.setInterval(async()=>{try{const current=await readOperationGraphR148(graph.id);if(!live)return;setGraph(current);if(current&&activeStates.has(current.state)&&current.nodes?.some((n:any)=>nodeActive.has(n.state))){const next=await tickOperationGraphR148(current.id);if(live)setGraph(next)}}catch{}},2600);return()=>{live=false;window.clearInterval(id)}},[graph?.id,needsTick]);
 return <section className='r148-graph' data-r148-operation-graph data-canonical-mutation='false'>
  <header className='r148-head'><div><span>R148 · DURABLE MULTI-OPERATION GRAPH</span><h3>One mission lineage across R146 runs and R147 executors</h3><p>Compose dependencies instead of launching disconnected tools. Graph creation is inert; authorization starts safe scheduling; Hybrid/BUILD nodes stop again for explicit PC execution confirmation. Every node still keeps its own R143 route contract, R146 hash chain and R147 executor proof boundary.</p></div><div className='r148-status'><b>{graph?.state||'NO GRAPH'}</b><small>{graph?`${verified}/${graph.nodes?.length||0} verified · ${short(graph.id,18)}`:`${spec.nodes.length} planned nodes`}</small></div></header>
  {!graph&&<div className='r148-builder'>
   <div className='r148-templates'>{TEMPLATES.map(x=><button key={x.id} className={template===x.id?'active':''} onClick={()=>setTemplate(x.id)}><Workflow/><span><b>{x.label}</b><small>{x.detail}</small></span></button>)}</div>
   <label className='r148-intent'><span>MISSION OBJECTIVE</span><textarea value={intent} onChange={e=>setIntent(e.target.value)} rows={4}/></label>
   {template==='FULL_BUILD'&&<label className='r148-path'><span>APPROVED PROJECT PATH</span><input value={projectPath} onChange={e=>setProjectPath(e.target.value)} placeholder='.'/><small>The PC agent still enforces the approved Sovereign root; this field does not grant filesystem authority.</small></label>}
   <div className='r148-plan'>{spec.nodes.map((n,i)=><article key={n.id}><i>{i+1}</i><div><b>{n.label}</b><small>{n.contract.executionDomain} · {n.strategy} · {n.dependsOn.length?`after ${n.dependsOn.join(', ')}`:'root-ready'}{['HYBRID','BUILD'].includes(n.contract.executionDomain)?' · explicit confirmation required':''}</small></div></article>)}</div>
   <button className='r148-primary' disabled={busy||!intent.trim()} onClick={create}><GitBranch/>CREATE INERT DURABLE GRAPH</button>
  </div>}
  {graph&&<div className='r148-runtime'>
   <div className='r148-controls'><button className='primary' disabled={busy||graph.state!=='DRAFT'} onClick={authorize}><Play/>AUTHORIZE + RUN SAFE NODES</button><button disabled={busy||!['AUTHORIZED','RUNNING','WAITING'].includes(graph.state)} onClick={tick}><RefreshCw/>TICK</button><button disabled={busy} onClick={verifyReplay}><ShieldCheck/>REPLAY PROOF</button><button disabled={busy||['VERIFIED_EXECUTION_GRAPH','FAILED','CANCELLED'].includes(graph.state)} onClick={cancel}><Square/>STOP SCHEDULING</button><button disabled={busy} onClick={()=>{setGraph(null);setReplay(null);setError('')}}><RotateCcw/>NEW GRAPH</button></div>
   <div className='r148-nodes'>{graph.nodes?.map((n:any,i:number)=><article key={n.id} data-state={n.state}><div className='r148-node-index'>{n.state==='VERIFIED'?<CheckCircle2/>:n.state==='RUNNING'||n.state==='DISPATCHED'?<Activity/>:n.state==='WAITING_CONFIRMATION'?<PauseCircle/>:<CircleDot/>}<i>{i+1}</i></div><div className='r148-node-body'><div><b>{n.label}</b><strong>{n.state}</strong></div><small>{n.contract?.routeId} → {n.contract?.capabilityId} → {n.contract?.executionDomain}{n.executorId?` → ${n.executorId}`:''}</small><p>{n.intent}</p><code>{n.runId?`RUN ${short(n.runId,24)} · ${n.resultFingerprint?`RESULT ${short(n.resultFingerprint,18)}`:'result pending'}`:`dependencies ${n.dependsOn?.length?n.dependsOn.join(', '):'none'}`}</code>{n.lastError&&<em>{n.lastError}</em>}</div>{n.state==='WAITING_CONFIRMATION'&&<button className='confirm' disabled={busy} onClick={()=>confirm(n)}>CONFIRM PC EXECUTION</button>}{n.state==='HOLD'&&<button className='resume' disabled={busy} onClick={()=>resume(n)}>RESUME NODE</button>}</article>)}</div>
   <footer className='r148-ledger'><span>graph head <b>{short(graph.headSha256,24)||'—'}</b></span><span>events <b>{graph.events?.length||0}</b></span><span>native confirmations <b>{waitingConfirmation.length}</b></span><span>held <b>{held.length}</b></span><span>authority <b>EXECUTION GRAPH ≠ CANON ADMISSION</b></span></footer>
  </div>}
  {replay&&<div className={'r148-replay '+(replay.ok?'pass':'hold')}><ShieldCheck/><div><b>GRAPH REPLAY {replay.ok?'PASS':'HOLD'}</b><small>event chain {replay.eventChainOk?'PASS':'FAIL'} · graph head {replay.graphHeadMatch?'MATCH':'MISMATCH'} · linked R146 runs {replay.runReplayOk?'PASS':'FAIL'}</small></div></div>}
  {error&&<div className='r148-error'>{error}</div>}
  <p className='r148-boundary'>{R148_GRAPH_BOUNDARY}</p>
 </section>
}
