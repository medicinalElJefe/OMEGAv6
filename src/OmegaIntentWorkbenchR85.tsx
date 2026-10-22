import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,CheckCircle2,Download,FastForward,Flag,PlayCircle,Route,Save,ShieldCheck,SkipForward,Sparkles,X} from 'lucide-react';
import {localState} from './platformAdapter';
import {
 WORKFLOW_INTENTS_R85,activeWorkflowStepR85,admittedNextR85,applyOperationToWorkflowR86,cancelWorkflowR85,completeWorkflowStepR85,
 readWorkflowR85,skipWorkflowStepR85,startWorkflowR85,workflowProgressR85,type WorkflowIntentR85,type WorkflowSessionR85
} from './omegaWorkflowRuntimeR85';
import {applyWorkflowVisualIntentR86,emitOperationR86,readOperationLedgerR86,type OmegaOperationR86} from './omegaOperationBusR86';
import {activeProjectIdR87,attachWorkflowToProjectR87,createProjectR87,getProjectR87,readProjectsR87,recordProjectOperationR87,updateProjectWorkflowR87} from './omegaProjectContinuityR87';
import UltimateCapabilityMembraneR108 from './UltimateCapabilityMembraneR108';
import './omegaIntentWorkbenchR85.css';

type Props={record:any;address:number;currentPanel:string;onAddress:(n:number)=>void;onNavigate:(p:string)=>void;variant?:'HOME'|'STRIP'};

const enc=new TextEncoder();
async function hashJson(x:any){const d=await crypto.subtle.digest('SHA-256',enc.encode(JSON.stringify(x)));return [...new Uint8Array(d)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function downloadJson(name:string,data:any){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),800)}
function phase(address:number){return Math.floor(Math.max(0,address)/144)%12+1}
function packetCore(record:any){return{address:record?.address,stateId:record?.stateId,identity:record?.identity,metrics:record?.metrics,psc:record?.psc,predict:record?.predict,autoPing:record?.autoPing}}

export default function OmegaIntentWorkbenchR85({record,address,currentPanel,onAddress,onNavigate,variant='HOME'}:Props){
 const[session,setSession]=useState<WorkflowSessionR85|null>(()=>readWorkflowR85());
 const[intent,setIntent]=useState<WorkflowIntentR85>('REPAIR');
 const[goal,setGoal]=useState('');
 const[working,setWorking]=useState(false);
 const[operations,setOperations]=useState<OmegaOperationR86[]>(()=>readOperationLedgerR86());
 const[projects,setProjects]=useState(()=>readProjectsR87());
 const[projectChoice,setProjectChoice]=useState(()=>{const id=activeProjectIdR87();return id&&readProjectsR87().some(x=>x.id===id)?id:'NEW'});
 useEffect(()=>{const sync=(e:Event)=>setSession((e as CustomEvent).detail??readWorkflowR85());window.addEventListener('omega-r85-workflow-changed',sync as EventListener);return()=>window.removeEventListener('omega-r85-workflow-changed',sync as EventListener)},[]);
 useEffect(()=>{const sync=(e:Event)=>{const rows=(e as CustomEvent).detail;setProjects(Array.isArray(rows)?rows:readProjectsR87())};window.addEventListener('omega-r87-projects-changed',sync as EventListener);return()=>window.removeEventListener('omega-r87-projects-changed',sync as EventListener)},[]);
 useEffect(()=>{const apply=(e:Event)=>{const event=(e as CustomEvent<OmegaOperationR86>).detail;if(!event)return;setOperations(rows=>[...rows,event].slice(-188));setSession(prev=>{if(!prev)return prev;void recordProjectOperationR87(prev.projectId,event);const next=applyOperationToWorkflowR86(prev,event);if(next.status==='COMPLETE')void updateProjectWorkflowR87(next.projectId,next,'COMPLETE');return next.status==='COMPLETE'?null:next})};window.addEventListener('omega-r86-operation',apply as EventListener);return()=>window.removeEventListener('omega-r86-operation',apply as EventListener)},[]);
 const step=activeWorkflowStepR85(session),progress=workflowProgressR85(session),nextAddress=admittedNextR85(record);
 const selected=WORKFLOW_INTENTS_R85.find(x=>x.id===intent)||WORKFLOW_INTENTS_R85[0];
 const modeSummary=useMemo(()=>session?{intent:session.modePlan?.intent||session.intent,policy:session.modePlan?.policy||'INTENT_ADAPTIVE',applied:Number(session.modePlan?.sourceBackedApplied)||0,gated:Number(session.modePlan?.sourceBackedGated)||0,deep:Number(session.modePlan?.performance?.activeDeepCount)||0}:null,[session]);
 const capabilitySummary=useMemo(()=>session?{required:Number(session.capabilityPlan?.capabilityCounts?.required)||0,total:Number(session.capabilityPlan?.capabilityCounts?.total)||18,sources:Array.isArray(session.capabilityPlan?.sources)?session.capabilityPlan.sources.filter((x:any)=>x.state==='ACTIVE').length:0}:null,[session]);
 const activeProject=useMemo(()=>getProjectR87(session?.projectId),[session?.projectId,projects]);

 const start=async()=>{if(working)return;setWorking(true);try{let project=projectChoice==='NEW'?null:getProjectR87(projectChoice);if(!project)project=await createProjectR87(goal,intent,record);const s=startWorkflowR85(intent,goal,record,project.id);await attachWorkflowToProjectR87(project.id,s);setProjects(readProjectsR87());setProjectChoice(project.id);setSession(s);setGoal('')}finally{setWorking(false)}};
 const finish=(s:WorkflowSessionR85)=>{void updateProjectWorkflowR87(s.projectId,s,s.status);setSession(s.status==='COMPLETE'?null:s)};
 const complete=()=>{if(!session)return;finish(completeWorkflowStepR85(session,{beforeAddress:address,afterAddress:address,note:`Completed in ${currentPanel}`}))};
 const skip=()=>{if(!session)return;finish(skipWorkflowStepR85(session))};
 const cancel=()=>{if(!session)return;const cancelled=cancelWorkflowR85(session);void updateProjectWorkflowR87(cancelled.projectId,cancelled,'CANCELLED');setSession(null)};
 const capture=async()=>{if(!session||!step||working)return;setWorking(true);try{
   const core=packetCore(record),packetHash=await hashJson(core),rows=localState.read<any[]>('omega.r18.workspace.snapshots',[]);
   const snap={id:crypto.randomUUID(),at:Date.now(),name:`${session.intent} · ${session.goal.slice(0,48)}`,address,stateId:record.stateId,decision:String(record.metrics?.decision||'—'),phase:phase(address),view:currentPanel.toUpperCase(),metrics:{continuity:record.metrics?.continuity,plasticity:record.metrics?.plasticity,contradiction:record.metrics?.contradiction,burden:record.metrics?.burden,scar:record.metrics?.scar,evidence:record.metrics?.evidence},packetHash,note:`R85/R108 workflow ${session.id} · ${step.label} · ${capabilitySummary?.required||0} required capabilities`};
   localState.write('omega.r18.workspace.snapshots',[...rows,snap].slice(-80));
   await emitOperationR86({type:'CHECKPOINT_CAPTURED',surface:'Workflow Engine',stateId:record.stateId,address,status:'PASS',detail:'R85/R108 workflow checkpoint captured into Workspace snapshots',payload:{snapshotId:snap.id,packetHash,capabilityPlan:session.capabilityPlan||null}});
  }finally{setWorking(false)}};
 const enactAdvance=()=>{if(!session||nextAddress===null)return;const from=address;onAddress(nextAddress);void emitOperationR86({type:'CANONICAL_TRANSITION_COMMITTED',surface:'Workflow Engine',stateId:record.stateId,address:from,nextAddress,status:'PASS',detail:`Committed admitted AutoPing candidate ${nextAddress+1}`,payload:{fromAddress:from,toAddress:nextAddress}})};
 const primary=()=>{
  if(!session||!step)return null;
  if(step.kind==='ADVANCE')return <button className='r85-primary' disabled={nextAddress===null} onClick={enactAdvance}><FastForward/>{nextAddress===null?'No admitted candidate':`Commit admitted state ${nextAddress+1}`}</button>;
  if(step.kind==='CHECKPOINT')return <button className='r85-primary' disabled={working} onClick={()=>void capture()}><Save/>{working?'Hashing checkpoint…':'Capture checkpoint'}</button>;
  if(step.route&&currentPanel!==step.route)return <button className='r85-primary' onClick={()=>{if(step.route==='Visual Instrument')applyWorkflowVisualIntentR86(session.intent);onNavigate(step.route!)}}><PlayCircle/>Open {step.route}<ArrowRight/></button>;
  if(step.expects?.length)return <div className='r86-operation-wait'><ShieldCheck/><span><b>Perform the real operation in {step.route||currentPanel}</b><small>Waiting for {step.expects.join(' / ')}. The workflow will advance from the returned operation receipt.</small></span></div>;
  return <button className='r85-primary' onClick={complete}><CheckCircle2/>Complete this step</button>;
 };

 if(variant==='STRIP'){
  if(!session||!step)return null;
  return <section className='r85-workflow-strip' data-intent={session.intent} data-capability-fabric='R108'>
   <div className='r85-strip-progress'><i style={{transform:`scaleX(${progress.pct})`}}/></div>
   <div className='r85-strip-copy'><span><Route/><b>{session.intent}</b><small>{progress.done}/{progress.total}</small></span><div><b>{step.label}</b><small>{activeProject?.name||'unbound project'} · {step.reason} · R108 {capabilitySummary?.required||0}/{capabilitySummary?.total||18} capabilities</small></div></div>
   <div className='r85-strip-actions'>{primary()}<button onClick={skip} title='Skip current step'><SkipForward/></button><button onClick={()=>downloadJson(`omega-workflow-${session.id}.json`,session)} title='Export workflow receipt'><Download/></button></div>
  </section>;
 }

 return <section className='r85-workbench' aria-label='OMEGA intent workflow engine' data-capability-fabric='R108'>
  <header><div><span>INTENT → SOURCE → CALCULUS → MODES → CAPABILITY → ACTION → PROOF</span><h3>Operational workflow engine</h3><p>Start with the outcome. OMEGA correlates the current packet, Drive/source authority, lawful calculus, modes, eight functional layers, recovered capabilities, specialist runtimes and proof gates without creating a second state or router.</p></div><div className='r85-head-state'><Sparkles/><b>{session?'ACTIVE WORKFLOW':'READY'}</b><small>{session?session.intent:'select an intent'}</small></div></header>
  {!session?<>
   <div className='r85-intents'>{WORKFLOW_INTENTS_R85.map(x=><button key={x.id} className={intent===x.id?'active':''} onClick={()=>setIntent(x.id)}><b>{x.label}</b><small>{x.purpose}</small></button>)}</div>
   <div className='r85-compose'><div><b>{selected.label}</b><small>{selected.purpose}</small><label className='r87-project-choice'><span>Project continuity</span><select value={projectChoice} onChange={e=>setProjectChoice(e.target.value)}><option value='NEW'>New project from this goal</option>{projects.filter(x=>x.status==='ACTIVE_LOCAL').map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div><textarea value={goal} onChange={e=>setGoal(e.target.value)} placeholder={`Describe the ${selected.label.toLowerCase()} goal. The workflow will use existing OMEGA tools and preserve the current canonical state.`}/><button className='r85-primary' onClick={()=>void start()} disabled={working}><Flag/>{working?'Binding project…':'Start workflow'}</button></div>
   <UltimateCapabilityMembraneR108 intent={intent} goal={goal||selected.purpose} surface={selected.anchorPanel} record={record} compact/>
  </>:<>
   <div className='r85-active-head'><div><span>{session.intent} WORKFLOW · PROJECT {activeProject?.name||'UNBOUND'}</span><h4>{session.goal}</h4><small>Started at state {session.startStateId} · current state {record.stateId} · {modeSummary?.policy} · {modeSummary?.applied} source-backed applied · {modeSummary?.gated} gated · {modeSummary?.deep} intent-deep lenses · R108 {capabilitySummary?.required}/{capabilitySummary?.total} capabilities · {capabilitySummary?.sources} source authorities · {activeProject?.operationRefs?.length||0} project operations</small></div><div><button onClick={()=>downloadJson(`omega-workflow-${session.id}.json`,session)}><Download/>Export</button><button className='danger' onClick={cancel}><X/>Cancel</button></div></div>
   <div className='r85-progress'><i style={{transform:`scaleX(${progress.pct})`}}/><span>{progress.done} / {progress.total} complete</span></div>
   <div className='r85-active-grid'>
    <main>{session.steps.map((s,i)=><article key={s.id} className={s.state.toLowerCase()} data-current={i===session.currentStep?'true':'false'}><code>{String(i+1).padStart(2,'0')}</code><div><b>{s.label}</b><small>{s.reason}</small>{s.receiptHash&&<em>{s.receiptHash.slice(0,20)}…</em>}</div><strong>{s.state}</strong></article>)}</main>
    <aside>{step&&<><span>NEXT ACTION</span><h4>{step.label}</h4><p>{step.reason}</p>{step.route&&<small>Target · {step.route}</small>}{step.kind==='ADVANCE'&&<small>Admitted candidate · {nextAddress===null?'none':`STATE ${nextAddress+1}`}</small>}<div>{primary()}<button onClick={skip}><SkipForward/>Skip</button></div></>}</aside>
   </div>
   <UltimateCapabilityMembraneR108 intent={session.intent} goal={session.goal} surface={step?.route||currentPanel} record={record}/>
   <section className='r86-operation-ledger'><header><div><span>LIVE OPERATION RECEIPTS</span><b>{operations.filter(x=>x.workflowId===session.id).length} workflow-bound · {operations.length} retained</b></div><small>actual browser/runtime actions only</small></header><div>{operations.filter(x=>x.workflowId===session.id).slice(-6).reverse().map(x=><article key={x.id} data-status={x.status}><code>{x.type}</code><span><b>{x.detail}</b><small>{x.surface} · {new Date(x.at).toLocaleTimeString()} · STATE {x.stateId||'—'}</small></span><strong>{x.status}<small>{x.sha256.slice(0,12)}…</small></strong></article>)}</div>{!operations.some(x=>x.workflowId===session.id)&&<p>No workflow-bound operation receipt yet. Navigation alone is not counted as execution.</p>}</section>
   <div className='r85-boundary'><ShieldCheck/><span>{session.truthBoundary}</span></div>
  </>}
 </section>;
}
