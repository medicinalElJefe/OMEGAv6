import {R200_REVISION,reconcileRunLifecycleR200,reconcileSystemLifecycleR200} from './omega-operational-lifecycle-r200-core.js';

const SESSION_KEY='omega.v6.runtime.session.r32';
const BRIDGE_KEY='omega.v6.hybrid.bridge.r32';
const byId=id=>document.getElementById(id);
const ui={
  refresh:byId('refreshBtn'),coreState:byId('coreState'),coreDetail:byId('coreDetail'),workerVersion:byId('workerVersion'),spineState:byId('spineState'),spineDetail:byId('spineDetail'),hybridState:byId('hybridState'),hybridDetail:byId('hybridDetail'),executorState:byId('executorState'),executorDetail:byId('executorDetail'),runCount:byId('runCount'),runDetail:byId('runDetail'),privateProofState:byId('privateProofState'),privateProofMessage:byId('privateProofMessage'),runList:byId('runList'),selectedRunState:byId('selectedRunState'),selectedRunMeta:byId('selectedRunMeta'),lifecycle:byId('lifecycle'),nextAction:byId('nextAction'),projectPath:byId('projectPath'),confirm:byId('confirmExecution'),dispatch:byId('dispatchBtn'),poll:byId('pollBtn'),replay:byId('replayBtn'),actionMessage:byId('actionMessage'),r147ManifestState:byId('r147ManifestState'),fabricDetail:byId('fabricDetail'),lastObserved:byId('lastObserved')
};
const state={core:null,operational:null,hybrid:null,manifest:null,capacityManifest:null,directory:null,runs:[],privateError:null,selectedRunId:null,resultView:null,lifecycle:null,refreshing:false};
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const short=(value,n=18)=>{const s=String(value??'');return s.length>n?`${s.slice(0,n)}…`:s};
const safeId=value=>/^[A-Za-z0-9._:-]{8,128}$/.test(String(value||''))?String(value):'';
function randomSession(){try{return `session_${crypto.randomUUID()}`}catch{return `session_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}}
function sessionId(){let id='';try{id=localStorage.getItem(SESSION_KEY)||''}catch{}if(!safeId(id)){id=randomSession();try{localStorage.setItem(SESSION_KEY,id)}catch{}}return id}
function bridge(){try{const raw=localStorage.getItem(BRIDGE_KEY);if(!raw)return null;const parsed=JSON.parse(raw);return parsed?.bridgeId&&parsed?.secret?parsed:null}catch{return null}}
function requestHeaders(hasBody=false){const h={'x-omega-session-id':sessionId(),'cache-control':'no-cache'},b=bridge();if(hasBody)h['content-type']='application/json';if(b){h['x-omega-bridge-id']=b.bridgeId;h['x-omega-bridge-secret']=b.secret}return h}
async function api(method,path,body){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const response=await fetch(path,{method,headers:requestHeaders(body!==undefined),body:body===undefined?undefined:JSON.stringify(body),cache:'no-store',credentials:'same-origin',signal:controller.signal}),raw=await response.text();let data=null;try{data=raw?JSON.parse(raw):null}catch{data={raw}}if(!response.ok){const error=new Error(String(data?.reply||data?.message||data?.code||`HTTP ${response.status}`));error.status=response.status;error.code=data?.code||null;error.payload=data;throw error}return data}finally{clearTimeout(timer)}}
async function safe(path){try{return{ok:true,data:await api('GET',path)}}catch(error){return{ok:false,error}}}
function runTime(run){const t=Number(run?.updatedAt||run?.createdAt||0);return Number.isFinite(t)&&t>0?new Date(t).toLocaleString():'unknown time'}
function terminalFailure(run){return['UNAVAILABLE','FAILED','REJECTED','STALE'].includes(String(run?.state||''))}
function currentHybridOnline(){return state.hybrid?.nativeExecutionClaimed===true&&Array.isArray(state.hybrid?.devices)&&state.hybrid.devices.some(d=>d?.online&&!d?.revoked)}
function selectedRun(){return state.runs.find(r=>r?.id===state.selectedRunId)||null}

async function loadPublicEvidence(){
  const [core,operational,hybrid,manifest,capacity]=await Promise.all([
    safe('/api/core-health'),safe('/api/system/operational'),safe('/api/hybrid/status'),safe('/api/execution/r147/manifest'),safe('/api/relative-capacity-r154')
  ]);
  state.core=core.ok?core.data:{error:core.error?.message||'core health unavailable'};
  state.operational=operational.ok?operational.data:{error:operational.error?.message||'operational matrix unavailable'};
  state.hybrid=hybrid.ok?hybrid.data:{error:hybrid.error?.message||'Hybrid status unavailable'};
  state.manifest=manifest.ok?manifest.data:{error:manifest.error?.message||'R147 manifest unavailable'};
  state.capacityManifest=capacity.ok?capacity.data:{error:capacity.error?.message||'R154 manifest unavailable'};
}
async function loadPrivateEvidence(){
  const [directory,runs]=await Promise.all([safe('/api/execution/executors'),safe('/api/execution/runs')]);
  state.directory=directory.ok?directory.data:null;
  state.runs=runs.ok&&Array.isArray(runs.data?.runs)?runs.data.runs.slice().sort((a,b)=>Number(b.updatedAt||0)-Number(a.updatedAt||0)):[];
  state.privateError=!directory.ok?(directory.error||runs.error):!runs.ok?runs.error:null;
  if(state.selectedRunId&&!state.runs.some(r=>r.id===state.selectedRunId))state.selectedRunId=null;
  if(!state.selectedRunId&&state.runs[0]?.id)state.selectedRunId=state.runs[0].id;
}
async function loadSelectedEvidence(){
  const run=selectedRun();state.resultView=null;state.lifecycle=null;if(!run)return;
  const result=await safe(`/api/execution/runs/${encodeURIComponent(run.id)}/result`);
  state.resultView=result.ok?result.data:null;
  state.lifecycle=reconcileRunLifecycleR200({run,resultView:state.resultView,directory:state.directory});
}

function renderMetrics(){
  const system=reconcileSystemLifecycleR200({core:state.core,operational:state.operational,hybrid:state.hybrid,directory:state.directory,runs:state.runs});
  ui.coreState.textContent=system.core.state;ui.coreState.className=system.core.state==='LIVE'?'ok':'held';
  ui.coreDetail.textContent=state.core?.requiredBindings?`assets ${state.core.requiredBindings.assets?'✓':'×'} · durable runtime ${state.core.requiredBindings.durableRuntime?'✓':'×'}`:(state.core?.error||'No R163 binding evidence');
  ui.workerVersion.textContent=short(system.core.workerVersion||'UNPROVED',22);
  ui.spineState.textContent=system.routeSpine.state;ui.spineState.className=system.routeSpine.state==='REACHABLE'?'ok':'held';
  ui.spineDetail.textContent=`${system.registeredRoutes.count||0} registered destinations observed · ${state.operational?.summary?.reachableCount??'—'}/${state.operational?.summary?.requiredCount??'—'} R130 probes`;
  ui.hybridState.textContent=system.hybrid.state;ui.hybridState.className=system.hybrid.nativeExecutionClaimed?'ok':'held';
  ui.hybridDetail.textContent=`nativeExecutionClaimed=${system.hybrid.nativeExecutionClaimed} · ${system.hybrid.currentOnlineDevices} current authenticated device${system.hybrid.currentOnlineDevices===1?'':'s'}`;
  ui.executorState.textContent=system.executors.state==='OBSERVED'?`${system.executors.available.length} AVAILABLE`:system.executors.state;ui.executorState.className=system.executors.state==='OBSERVED'?'ok':'held';
  ui.executorDetail.textContent=system.executors.state==='OBSERVED'?`${system.executors.total} directory entries · ${system.executors.available.join(', ')||'none currently available'}`:'Pair/authenticate this browser to observe the private R147 executor directory.';
  ui.runCount.textContent=system.durableRuns.state==='SESSION_BOUND'?String(system.durableRuns.count):'UNKNOWN';
  ui.runDetail.textContent=system.durableRuns.state==='SESSION_BOUND'?Object.entries(system.durableRuns.counts).filter(([,v])=>v).map(([k,v])=>`${k} ${v}`).join(' · ')||'No runs in this authenticated runtime session':'Private execution history is not converted into zero when session proof is unavailable.';
  ui.lastObserved.textContent=`R200 observed ${new Date().toLocaleTimeString()}`;
}
function renderManifest(){
  const m=state.manifest,r197=m?.adaptivePartitionBackpressure,ok=m?.schema==='OMEGA_UNIFIED_EXECUTOR_FABRIC_MANIFEST_R147'&&m?.performance?.revision==='R185'&&m?.performance?.multiAxis?.revision==='R193'&&m?.contentReuse?.revision==='R194'&&m?.differentialPartitionExecution?.revision==='R195'&&m?.boundedPartitionParallelism?.revision==='R196'&&r197?.revision==='R197'&&m?.canonicalAdmissionAuthority==='R125';
  ui.r147ManifestState.textContent=ok?'FIRST-HAND LIVE':'UNPROVED';ui.r147ManifestState.className=`pill ${ok?'ok':'held'}`;
  ui.fabricDetail.textContent=ok?`R147 live manifest · R196 hard max ${m.boundedPartitionParallelism?.hardConcurrencyMax??'—'} · R197 ${r197?.controller?.type||'—'} · ${r197?.dynamicTurn?.states?.join('/')||'—'} · ${r197?.dynamicTurn?.directions?.join('/')||'—'} · R125 admission preserved`:(m?.error||'The deployed R147 composition could not be verified in this browser response.');
}
function renderRuns(){
  if(state.privateError){ui.privateProofState.textContent=state.privateError?.status===401?'PAIR AUTH REQUIRED':'PRIVATE PROOF REQUIRED';ui.privateProofState.className='pill held';ui.privateProofMessage.textContent=`${state.privateError?.message||'Authenticated execution evidence unavailable'}. Public runtime proof remains separate and visible above.`}
  else{ui.privateProofState.textContent='SESSION PROOF LIVE';ui.privateProofState.className='pill ok';ui.privateProofMessage.textContent='R146 run history and R147 executor evidence are being read from this authenticated runtime session. No missing private evidence is synthesized.'}
  if(!state.runs.length){ui.runList.innerHTML=`<div class="empty">${state.privateError?'Pair this canonical browser in Hybrid Link to reveal its real session-bound execution history.':'No durable runs are stored in this session yet. Select a routed capability in OMEGA to create an R146 AUTHORIZED run.'}</div>`;return}
  ui.runList.innerHTML=state.runs.map(run=>`<button class="run-row${run.id===state.selectedRunId?' selected':''}" type="button" data-run-id="${esc(run.id)}" role="option" aria-selected="${run.id===state.selectedRunId?'true':'false'}"><span class="run-row-top"><b>${esc(run.contract?.route||run.intent||run.id)}</b><span class="state-tag">${esc(run.state)}</span></span><small>${esc(run.contract?.executionDomain||'UNKNOWN')} · ${esc(short(run.id,24))} · ${esc(runTime(run))}</small></button>`).join('');
  ui.runList.querySelectorAll('[data-run-id]').forEach(node=>node.addEventListener('click',async()=>{state.selectedRunId=node.dataset.runId;ui.confirm.checked=false;renderRuns();await loadSelectedEvidence();renderLifecycle()}));
}
function renderLifecycle(){
  const run=selectedRun(),life=state.lifecycle;
  if(!run||!life){ui.selectedRunState.textContent='NO RUN';ui.selectedRunState.className='pill';ui.selectedRunMeta.textContent='Select a durable run to inspect every proof boundary.';ui.lifecycle.innerHTML='<div class="empty">No selected R146 run.</div>';ui.nextAction.textContent='No run selected. R200 never dispatches automatically.';ui.dispatch.disabled=true;ui.poll.disabled=true;ui.replay.disabled=true;return}
  ui.selectedRunState.textContent=run.state;ui.selectedRunState.className=`pill ${run.state==='VERIFIED'?'ok':terminalFailure(run)?'held':''}`;
  ui.selectedRunMeta.textContent=`${life.route||'unknown route'} · ${life.routeId||'no route id'} → ${life.capabilityId||'no capability id'} → ${life.executionDomain||'unknown domain'} · ${short(run.id,30)}`;
  ui.lifecycle.innerHTML=life.stages.map(s=>`<article class="life-stage" data-state="${esc(s.state)}" title="${esc(`${s.authority} · ${s.detail}${s.evidence?` · ${s.evidence}`:''}`)}"><strong>${esc(s.id)}</strong><em>${esc(s.state)}</em><span class="stage-detail">${esc(s.detail)}</span></article>`).join('');
  ui.nextAction.textContent=`Next lawful action: ${life.nextLawfulAction}. R200 will not advance it without an explicit operator control below.`;
  const canDispatch=['AUTHORIZED','AVAILABLE'].includes(run.state)&&!terminalFailure(run),canPoll=run.state==='INVOKED';
  ui.dispatch.disabled=!(canDispatch&&ui.confirm.checked);ui.poll.disabled=!canPoll;ui.replay.disabled=false;
}
function renderAll(){renderMetrics();renderManifest();renderRuns();renderLifecycle()}

async function refresh({quiet=false}={}){
  if(state.refreshing)return;state.refreshing=true;ui.refresh.disabled=true;if(!quiet)ui.actionMessage.textContent='Refreshing first-hand public and authenticated execution evidence…';
  try{await Promise.all([loadPublicEvidence(),loadPrivateEvidence()]);await loadSelectedEvidence();renderAll();if(!quiet)ui.actionMessage.textContent='Evidence refreshed. No lifecycle state was promoted without its source proof.'}
  catch(error){ui.actionMessage.textContent=`Refresh failed closed: ${error instanceof Error?error.message:String(error)}`;ui.actionMessage.className='action-message error'}
  finally{state.refreshing=false;ui.refresh.disabled=false}
}
async function dispatchSelected(){
  const run=selectedRun();if(!run||!ui.confirm.checked)return;const domain=String(run.contract?.executionDomain||'').toUpperCase();if((domain==='HYBRID'||domain==='BUILD')&&!currentHybridOnline()){ui.actionMessage.textContent='Native dispatch held: a current authenticated Hybrid heartbeat is required. Heartbeat availability will not be fabricated.';ui.actionMessage.className='action-message held';return}
  const projectPath=String(ui.projectPath.value||'.').trim();if((domain==='HYBRID'||domain==='BUILD')&&(!projectPath||projectPath.startsWith('/')||/^[A-Za-z]:[\\/]/.test(projectPath)||projectPath.includes('..'))){ui.actionMessage.textContent='Native dispatch held: use a safe relative project path inside the approved Hybrid root.';ui.actionMessage.className='action-message held';return}
  ui.dispatch.disabled=true;ui.actionMessage.textContent=`Dispatching ${run.id} through existing R147 authority…`;ui.actionMessage.className='action-message';
  try{const out=await api('POST',`/api/execution/runs/${encodeURIComponent(run.id)}/dispatch`,{confirmed:true,projectPath,instructions:run.intent||run.contract?.route||'Execute the authorized durable run.'});ui.actionMessage.textContent=`R147 dispatch returned ${out?.run?.state||out?.state||'accepted'}. Dispatch acceptance is not execution success; refreshing proof now.`;ui.actionMessage.className='action-message ok';ui.confirm.checked=false;await refresh({quiet:true})}
  catch(error){ui.actionMessage.textContent=`Dispatch held/failed: ${error instanceof Error?error.message:String(error)}`;ui.actionMessage.className='action-message error';await refresh({quiet:true})}
}
async function pollSelected(){const run=selectedRun();if(!run)return;ui.poll.disabled=true;ui.actionMessage.textContent=`Polling R147 execution state for ${run.id}…`;try{const out=await api('POST',`/api/execution/runs/${encodeURIComponent(run.id)}/poll`,{});ui.actionMessage.textContent=`Poll returned ${out?.run?.state||'state unavailable'}.`;ui.actionMessage.className='action-message ok'}catch(error){ui.actionMessage.textContent=`Poll failed closed: ${error instanceof Error?error.message:String(error)}`;ui.actionMessage.className='action-message error'}await refresh({quiet:true})}
async function replaySelected(){const run=selectedRun();if(!run)return;ui.replay.disabled=true;ui.actionMessage.textContent=`Replaying R146 hash chain for ${run.id}…`;try{const out=await api('POST',`/api/execution/runs/${encodeURIComponent(run.id)}/replay`,{}),receipt=out?.receipt||out;ui.actionMessage.textContent=`R146 replay ${receipt?.ok===true?'PASS':'HOLD'} · ${receipt?.eventCount??'—'} events · head match ${receipt?.headMatch===true?'yes':'no'}. Replay integrity is not CanonState admission.`;ui.actionMessage.className=`action-message ${receipt?.ok===true?'ok':'held'}`}catch(error){ui.actionMessage.textContent=`Replay failed closed: ${error instanceof Error?error.message:String(error)}`;ui.actionMessage.className='action-message error'}await refresh({quiet:true})}

ui.refresh.addEventListener('click',()=>refresh());
ui.confirm.addEventListener('change',renderLifecycle);
ui.dispatch.addEventListener('click',dispatchSelected);
ui.poll.addEventListener('click',pollSelected);
ui.replay.addEventListener('click',replaySelected);
window.addEventListener('storage',event=>{if(event.key===BRIDGE_KEY||event.key===SESSION_KEY)void refresh({quiet:true})});

byId('lastObserved').textContent=`R${R200_REVISION.slice(1)} initializing…`;
await refresh();
setInterval(()=>{if(document.visibilityState==='visible')void refresh({quiet:true})},8000);
