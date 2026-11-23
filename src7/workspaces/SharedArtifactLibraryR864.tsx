import {makePortableAtlasR924,readPortableAtlasR924} from './omegaPortableAtlasR924';
import {useEffect,useRef,useState} from 'react';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {executeAtlasArtifactR865} from './omegaAtlasArtifactExecutorR865';
import {exportFullAtlasCsvR896,inspectAtlasAddressR897,traceAtlasRouteR899,exportAtlasRouteCsvR900,summarizeAtlasRouteR901,compareAtlasRoutesR902,parseAtlasAddressInputR916} from './omegaFullAtlasExportR896';
import {appendArtifactR862,notifyArtifactChangeR867,OMEGA_ARTIFACT_CHANGED_R867} from './omegaArtifactSpineR862';
import {OMEGA_ARTIFACT_STORAGE_R862,decodeArtifactsR862,exportArtifactBundleR863,importArtifactBundleR863,type OmegaArtifactR862} from './omegaArtifactSpineR862';
/** R864: one browser-local artifact collection consumed by Atlas, Projects and Assets. */
export function SharedArtifactLibraryR864({onNavigate}:{onNavigate:(route:string)=>void}){
 const [items,setItems]=useState<OmegaArtifactR862[]>([]);
 const [error,setError]=useState('');
 const [running,setRunning]=useState(false);
 const executionLease=useRef(false);
 const [executionStatus,setExecutionStatus]=useState('');
 const [latestCsv,setLatestCsv]=useState<{csv:string;address:number;rows:number;savedId?:string;savedSnapshot?:string}|null>(null);
 const [traceRow,setTraceRow]=useState(1);
 const [atlasLength,setAtlasLength]=useState('32');
 const [atlasAddress,setAtlasAddress]=useState(()=>{try{const stored=localStorage.getItem('omega.v6.address');return stored===null?'11498':stored}catch{return '11498'}});
 const refresh=()=>{try{const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));setItems(current);setLatestCsv(previous=>{if(!previous?.savedId)return previous;const saved=current.find(item=>item.id===previous.savedId);return saved&&JSON.stringify(saved)===previous.savedSnapshot?previous:null})}catch{setItems([]);setLatestCsv(previous=>previous?.savedId?null:previous)}};
 useEffect(()=>{refresh();window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);window.addEventListener(OMEGA_ARTIFACT_CHANGED_R867,refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh);window.removeEventListener(OMEGA_ARTIFACT_CHANGED_R867,refresh)}},[]);
 const [localTurnCount,setLocalTurnCount]=useState('12');
 const [selectedExecutionStep,setSelectedExecutionStep]=useState(0);
 const [traceFindAddress,setTraceFindAddress]=useState('');
 const [executionPlaying,setExecutionPlaying]=useState(false);
 const [executionIntervalMs,setExecutionIntervalMs]=useState(550);

 const [localTurnResult,setLocalTurnResult]=useState<{trace:{step:number;address:number;coordinates:number[]}[];artifact:{id:string;contentSha256:string}}|null>(null);
 useEffect(()=>{if(!executionPlaying||!localTurnResult)return;const max=localTurnResult.trace.length-1;if(selectedExecutionStep>=max){setExecutionPlaying(false);return}const timer=window.setInterval(()=>setSelectedExecutionStep(step=>Math.min(max,step+1)),executionIntervalMs);return()=>window.clearInterval(timer)},[executionPlaying,selectedExecutionStep,localTurnResult,executionIntervalMs]);

 const executeLocalTurns=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setLocalTurnResult(null);setSelectedExecutionStep(0);setInspectedAddress(null);setInspectedValues([]);setExecutionPlaying(false);
  try{
   const address=parseAtlasAddressInputR916(atlasAddress),turns=Number(localTurnCount);
   if(!Number.isInteger(address)||address<0||address>=20736||!Number.isInteger(turns)||turns<0||turns>256)throw Error('Address must be 0–20735 and turns 0–256');
   const input={D:Math.floor(address/1728)+1,P:Math.floor(address/144)%12+1,R:Math.floor(address/12)%12+1,L:address%12+1,turns};
   const response=await fetch('/__omega_local/execute/atlas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
   if(!response.ok)throw Error('Local executor unavailable or rejected input: HTTP '+response.status);
   const result=await response.json() as {trace:{step:number;address:number;coordinates:number[]}[];artifact:{id:string;contentSha256:string}};
   if(!Array.isArray(result.trace)||result.trace.length!==turns+1||typeof result.artifact?.id!=='string'||!/^[a-f0-9-]{36}$/.test(result.artifact.id)||!/^[a-f0-9]{64}$/.test(result.artifact.contentSha256)||result.trace.some((x,i)=>!x||x.step!==i||!Number.isInteger(x.address)||x.address<0||x.address>=20736||!Array.isArray(x.coordinates)||x.coordinates.length!==4||x.coordinates.some(n=>!Number.isInteger(n)||n<1||n>12)||x.address!==1728*(x.coordinates[0]-1)+144*(x.coordinates[1]-1)+12*(x.coordinates[2]-1)+x.coordinates[3]-1)||(i===0&&x.address!==address))throw Error('Malformed local executor result');
   const readback=await fetch('/__omega_local/artifacts/'+encodeURIComponent(result.artifact.id));
   if(!readback.ok)throw Error('Local executor artifact readback failed');
   const saved=await readback.json() as {id?:string;kind?:string;content:string;contentSha256:string};
   if(saved.id!==result.artifact.id||saved.kind!=='atlas_execution'||typeof saved.content!=='string')throw Error('Local executor artifact identity or kind mismatch');
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.content)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(new TextEncoder().encode(saved.content).byteLength>131072)throw Error('Local executor artifact exceeds 128 KiB verification limit');
   const artifactPayload=JSON.parse(saved.content) as {schema?:string;trace?:unknown};
   if(artifactPayload.schema!=='OMEGA_LOCAL_ATLAS_EXECUTION_R910_V1'||digest!==result.artifact.contentSha256||saved.contentSha256!==digest||JSON.stringify(artifactPayload.trace)!==JSON.stringify(result.trace))throw Error('Local executor result failed schema, SHA-256 or trace readback');
   setLocalTurnResult(result);setExecutionStatus('Local address-turn executor completed '+turns+' turns; recovered SHA-256 verified artifact '+result.artifact.id+'. Model-derived only.');
  }catch(e){setError('Local execution refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const recoverLocalTurns=async(id:string)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setExecutionPlaying(false);setLocalTurnResult(null);setSelectedExecutionStep(0);setInspectedAddress(null);setInspectedValues([]);
  try{
   if(!/^[a-f0-9-]{36}$/.test(id))throw Error('Invalid artifact ID');
   const response=await fetch('/__omega_local/artifacts/'+encodeURIComponent(id));
   if(!response.ok)throw Error('Artifact unavailable: HTTP '+response.status);
   const saved=await response.json() as {id:string;kind:string;content:string;contentSha256:string};
   if(saved.id!==id||saved.kind!=='atlas_execution'||typeof saved.content!=='string')throw Error('Not a local Atlas execution artifact');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.content)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(new TextEncoder().encode(saved.content).byteLength>131072)throw Error('Recovered artifact exceeds 128 KiB verification limit');
   if(hash!==saved.contentSha256)throw Error('Artifact checksum mismatch');
   const data=JSON.parse(saved.content) as {schema:string;trace:{step:number;address:number;coordinates:number[]}[]};
   if(data.schema!=='OMEGA_LOCAL_ATLAS_EXECUTION_R910_V1'||!Array.isArray(data.trace)||data.trace.length<1||data.trace.length>257||data.trace.some((x,i)=>x.step!==i||!Number.isInteger(x.address)||x.address<0||x.address>=20736||!Array.isArray(x.coordinates)||x.coordinates.length!==4||x.coordinates.some(n=>!Number.isInteger(n)||n<1||n>12)||x.address!==1728*(x.coordinates[0]-1)+144*(x.coordinates[1]-1)+12*(x.coordinates[2]-1)+x.coordinates[3]-1))throw Error('Artifact trace invalid');
   setLocalTurnResult({trace:data.trace,artifact:{id,contentSha256:hash}});setSelectedExecutionStep(0);
   setExecutionStatus('Recovered '+data.trace.length+' validated states from saved local execution '+id+'.');
  }catch(e){setError('Local execution recovery rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const executionMetrics=localTurnResult?(()=>{
  const trace=localTurnResult.trace;
  const step=Math.min(selectedExecutionStep,trace.length-1);
  const current=trace[step];
  const previous=step?trace[step-1]:null;
  const delta=previous?current.address-previous.address:0;
  const axisDelta=previous?current.coordinates.map((value,i)=>value-previous.coordinates[i]):[0,0,0,0];
  const visited=new Set(trace.map(x=>x.address)).size;
  let totalTravel=0;
  for(let i=1;i<trace.length;i++)totalTravel+=Math.abs(trace[i].address-trace[i-1].address);
  return {step,delta,axisDelta,visited,totalTravel,returns:trace.length-visited};
 })():null;
 const localTurnSvg=localTurnResult?(()=>{
  const trace=localTurnResult.trace;
  const points=trace.map((x,i)=>[24+(i/Math.max(1,trace.length-1))*752,224-(x.address/20735)*192] as const);
  const polyline=points.map(p=>p.join(',')).join(' ');
  const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 260" role="img" aria-label="Atlas address progression over executed turns"><rect width="800" height="260" fill="#101b29"/><path d="M24 32V224H776" fill="none" stroke="#8295a8" stroke-width="1"/><path d="M24 128H776" stroke="#40566c" stroke-dasharray="4 6"/><polyline points="'+polyline+'" fill="none" stroke="#64d8ca" stroke-width="2.5" stroke-linejoin="round"/><g fill="#e6f5f3" font-family="sans-serif" font-size="12"><text x="24" y="20">Address 20735</text><text x="24" y="243">0</text><text x="690" y="243">Turn '+trace[trace.length-1].step+'</text><text x="250" y="20">'+(localTurnResult.artifact.id==='offline-model-derived'?'Offline model-derived trace · ':'Verified local Atlas execution · ')+escape(localTurnResult.artifact.id)+'</text></g></svg>';
 })():null;
 const downloadLocalTurnSvg=()=>{
  if(!localTurnSvg||!localTurnResult)return;
  const url=URL.createObjectURL(new Blob([localTurnSvg],{type:'image/svg+xml;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-'+(localTurnResult.artifact.id==='offline-model-derived'?'offline-model-derived-':'verified-local-')+localTurnResult.artifact.id+'.svg';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const downloadAtlasVisitIndexR946=()=>{
  if(!localTurnResult||executionLease.current)return;
  const visits=new Map<number,{count:number;first:number;last:number}>();
  for(const state of localTurnResult.trace){const prior=visits.get(state.address);if(prior){prior.count++;prior.last=state.step}else visits.set(state.address,{count:1,first:state.step,last:state.step})}
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const lines=['address,visits,first_step,last_step,source_trace_sha256,provenance',...Array.from(visits.entries()).sort((a,b)=>a[0]-b[0]).map(([address,v])=>[address,v.count,v.first,v.last,localTurnResult.artifact.contentSha256,offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact'].join(','))];
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-address-visits-'+(offline?'offline-model':'verified-local')+'.csv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported '+visits.size+' distinct recorded addresses and their visit counts from '+localTurnResult.trace.length+' states. '+(offline?'Offline origin remains unverified.':'Local artifact provenance retained.')+' Model coordinates are not physical measurements.');
 };
 const downloadAtlasTransitionsR950=()=>{
  if(!localTurnResult||executionLease.current)return;
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const trace=localTurnResult.trace;
  const lines=['from_step,to_step,from_address,to_address,source_trace_sha256,provenance'];
  for(let i=1;i<trace.length;i++){
   const previous=trace[i-1],current=trace[i];
   if(current.address!==previous.address)lines.push([previous.step,current.step,previous.address,current.address,localTurnResult.artifact.contentSha256,offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact'].join(','));
  }
  const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-transitions-'+(offline?'offline-model':'verified-local')+'.csv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported '+(lines.length-1)+' recorded address transitions across '+trace.length+' states. '+(offline?'Offline origin remains unverified.':'Local artifact provenance retained.')+' Model transitions are not physical measurements.');
 };
 const downloadTransitionDeltasR958=()=>{
  if(!localTurnResult||executionLease.current)return;
  const trace=localTurnResult.trace;
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const rows=['from_step,to_step,from_address,to_address,delta_address,delta_D,delta_P,delta_R,delta_L,source_trace_sha256,provenance'];
  for(let i=1;i<trace.length;i++){
   const previous=trace[i-1],current=trace[i];
   if(current.address===previous.address)continue;
   const delta=current.coordinates.map((value,j)=>value-previous.coordinates[j]);
   rows.push([previous.step,current.step,previous.address,current.address,current.address-previous.address,...delta,localTurnResult.artifact.contentSha256,offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact'].join(','));
  }
  const url=URL.createObjectURL(new Blob([rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-transition-deltas-'+(offline?'offline-model':'local-verified')+'.csv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported '+(rows.length-1)+' signed Atlas transition deltas as CSV. '+(offline?'Offline origin remains unverified.':'Local artifact provenance retained.')+' Model coordinates are not physical measurements.');
 };
 const downloadAllTransitionsR957=()=>{
  if(!localTurnResult||executionLease.current)return;
  const trace=localTurnResult.trace;
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const transitions=trace.slice(1).flatMap((current,i)=>{
   const previous=trace[i];
   return current.address===previous.address?[]:[{from:{step:previous.step,address:previous.address,coordinates:previous.coordinates},to:{step:current.step,address:current.address,coordinates:current.coordinates},delta:{address:current.address-previous.address,coordinates:current.coordinates.map((value,j)=>value-previous.coordinates[j])}}];
  });
  const payload={schema:'OMEGA_ATLAS_TRANSITION_SERIES_R957_V1',provenance:offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact',originVerified:!offline,modelOnly:true,physicalMeasurement:false,canonAdmission:false,sourceTraceSha256:localTurnResult.artifact.contentSha256,artifactId:offline?null:localTurnResult.artifact.id,traceLength:trace.length,transitionCount:transitions.length,transitions};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-transition-series-'+(offline?'offline-model':'local-verified')+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported '+transitions.length+' recorded address transitions as JSON. '+(offline?'Offline origin remains unverified.':'Local artifact provenance retained.')+' Model coordinates are not physical measurements.');
 };
 const downloadSelectedTransitionR953=()=>{
  if(!localTurnResult||executionLease.current)return;
  const trace=localTurnResult.trace;
  const index=selectedExecutionStep;
  if(index<1||index>=trace.length||trace[index].address===trace[index-1].address){setExecutionStatus('Select an actual recorded address transition before exporting its details.');return;}
  const previous=trace[index-1],current=trace[index];
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const payload={schema:'OMEGA_ATLAS_SELECTED_TRANSITION_R953_V1',provenance:offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact',originVerified:!offline,modelOnly:true,physicalMeasurement:false,canonAdmission:false,sourceTraceSha256:localTurnResult.artifact.contentSha256,artifactId:offline?null:localTurnResult.artifact.id,traceLength:trace.length,from:{step:previous.step,address:previous.address,coordinates:previous.coordinates},to:{step:current.step,address:current.address,coordinates:current.coordinates},delta:{address:current.address-previous.address,coordinates:current.coordinates.map((value,i)=>value-previous.coordinates[i])}};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-transition-'+previous.step+'-'+current.step+(offline?'-offline-model':'-local-verified')+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported recorded address transition '+previous.address+' → '+current.address+'. '+(offline?'Offline origin remains unverified.':'Local artifact provenance retained.')+' Model coordinates are not physical measurements.');
 };
 const downloadSelectedAtlasStepR943=()=>{
  if(!localTurnResult||executionLease.current)return;
  const trace=localTurnResult.trace;
  const index=Math.min(Math.max(0,selectedExecutionStep),trace.length-1);
  const selected=trace[index];
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const payload={schema:'OMEGA_ATLAS_SELECTED_STEP_R943_V1',provenance:offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact',originVerified:!offline,modelOnly:true,artifactId:offline?null:localTurnResult.artifact.id,sourceTraceSha256:localTurnResult.artifact.contentSha256,step:selected.step,address:selected.address,coordinates:{D:selected.coordinates[0],P:selected.coordinates[1],R:selected.coordinates[2],L:selected.coordinates[3]},traceLength:trace.length,physicalMeasurement:false,canonAdmission:false};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-step-'+selected.step+'-'+selected.address+(offline?'-offline-model':'-local-verified')+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Exported selected Atlas step '+selected.step+' address '+selected.address+' with '+(offline?'unverified offline origin':'verified local artifact provenance')+'. This is a model state, not a physical measurement.');
 };
 const downloadLocalTurnJson=()=>{
  if(!localTurnResult)return;
  // The legacy R922 export asserts a verified local-host artifact. An R924 offline
  // import has no such provenance; use the explicitly unattested portable export.
  if(localTurnResult.artifact.id==='offline-model-derived'){
   setError('Offline model-derived traces cannot be exported as verified local-host artifacts. Use Portable Atlas JSON export.');
   return;
  }
  const payload={schema:'OMEGA_LOCAL_ATLAS_EXECUTION_EXPORT_R922_V1',provenance:'verified-local-executor-artifact',modelOnly:true,artifactId:localTurnResult.artifact.id,contentSha256:localTurnResult.artifact.contentSha256,coordinateOrder:['D','P','R','L'],addressRange:[0,20735],trace:localTurnResult.trace};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-execution-'+localTurnResult.artifact.id+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const downloadPortableAtlasR924=async()=>{
  if(!localTurnResult||executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');
  try{
   const payload=await makePortableAtlasR924(localTurnResult.trace);
   const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download='omega-portable-atlas-'+localTurnResult.artifact.id+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setExecutionStatus('Portable model-derived trace exported with SHA-256 integrity. No original-host authenticity or external execution claim.');
  }catch(e){setError('Portable export refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const importPortableAtlasR924=async(file:File)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setExecutionPlaying(false);setLocalTurnResult(null);setSelectedExecutionStep(0);setInspectedAddress(null);setInspectedValues([]);
  try{
   if(file.size>131072)throw Error('Portable JSON exceeds 128 KiB');
   const payload=await readPortableAtlasR924(JSON.parse(await file.text()));
   setLocalTurnResult({trace:payload.trace,artifact:{id:'offline-model-derived',contentSha256:payload.sha256}});
   setSelectedExecutionStep(0);
   setExecutionStatus('Offline portable trace recovered: '+payload.trace.length+' states. SHA-256 integrity checked; origin authenticity, host execution and Canon admission NOT verified.');
  }catch(e){setError('Portable import refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const saveOfflineAtlasR926=async()=>{
  if(!localTurnResult||executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');
  try{
   const payload=await makePortableAtlasR924(localTurnResult.trace);
   const serialized=JSON.stringify(payload);
   if(new TextEncoder().encode(serialized).byteLength>131072)throw Error('Offline Atlas trace exceeds 128 KiB browser recovery limit');
   localStorage.setItem('omega.portable.atlas.r926',serialized);
   const persisted=localStorage.getItem('omega.portable.atlas.r926');
   if(persisted!==serialized)throw Error('Browser storage readback differs from saved Atlas trace');
   const recovered=await readPortableAtlasR924(JSON.parse(persisted));
   if(recovered.trace.length!==payload.trace.length)throw Error('Browser storage trace count differs after integrity verification');
   setExecutionStatus('Saved and readback-verified '+recovered.trace.length+' model-derived Atlas states in this browser. Origin unverified; use Restore saved offline trace after reload.');
  }catch(e){setError('Offline Atlas save refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const clearSavedOfflineAtlasR936=()=>{
  if(executionLease.current)return;
  setError('');setExecutionStatus('');
  try{
   localStorage.removeItem('omega.portable.atlas.r926');
   if(localStorage.getItem('omega.portable.atlas.r926')!==null)throw Error('Browser storage still contains the saved Atlas trace after removal');
   setExecutionStatus('Saved browser-local Atlas trace cleared. The current on-screen trace is unchanged; no host artifact was deleted.');
  }catch(e){setError('Offline Atlas clear refused: '+String(e))}
 };
 const restoreOfflineAtlasR926=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setExecutionPlaying(false);setLocalTurnResult(null);setSelectedExecutionStep(0);setInspectedAddress(null);setInspectedValues([]);
  try{
   const stored=localStorage.getItem('omega.portable.atlas.r926');
   if(!stored||new TextEncoder().encode(stored).byteLength>131072)throw Error('Saved offline Atlas trace absent or exceeds 128 KiB');
   const payload=await readPortableAtlasR924(JSON.parse(stored));
   setLocalTurnResult({trace:payload.trace,artifact:{id:'offline-model-derived',contentSha256:payload.sha256}});
   setSelectedExecutionStep(0);
   setExecutionStatus('Restored '+payload.trace.length+' saved browser-local Atlas states; checksum verified. Origin and host execution NOT verified.');
  }catch(e){setError('Offline Atlas restore refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const verifyExportedExecutionJson=async(file:File)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setExecutionPlaying(false);setLocalTurnResult(null);setSelectedExecutionStep(0);setInspectedAddress(null);setInspectedValues([]);
  try{
   if(file.size>131072)throw Error('JSON export exceeds 128 KiB verification limit');
   const exported=JSON.parse(await file.text()) as {schema?:string;modelOnly?:boolean;artifactId?:string;contentSha256?:string;trace?:unknown};
   if(exported.schema!=='OMEGA_LOCAL_ATLAS_EXECUTION_EXPORT_R922_V1'||exported.modelOnly!==true||typeof exported.artifactId!=='string'||!/^[a-f0-9-]{36}$/.test(exported.artifactId)||typeof exported.contentSha256!=='string'||!/^[a-f0-9]{64}$/.test(exported.contentSha256)||!Array.isArray(exported.trace)||exported.trace.length<1||exported.trace.length>257)throw Error('Invalid exported Atlas execution metadata');
   const response=await fetch('/__omega_local/artifacts/'+encodeURIComponent(exported.artifactId));
   if(!response.ok)throw Error('Original local artifact unavailable: HTTP '+response.status);
   const saved=await response.json() as {id?:string;kind?:string;content?:string;contentSha256?:string};
   if(saved.id!==exported.artifactId||saved.kind!=='atlas_execution'||typeof saved.content!=='string'||saved.contentSha256!==exported.contentSha256)throw Error('Export does not match the original local artifact');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.content)))).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(new TextEncoder().encode(saved.content).byteLength>131072)throw Error('Original artifact exceeds 128 KiB verification limit');
   if(hash!==exported.contentSha256)throw Error('Original local artifact checksum mismatch');
   const original=JSON.parse(saved.content) as {schema?:string;trace?:unknown};
   if(original.schema!=='OMEGA_LOCAL_ATLAS_EXECUTION_R910_V1'||JSON.stringify(original.trace)!==JSON.stringify(exported.trace))throw Error('Exported trace differs from SHA-256 verified local artifact');
   const trace=exported.trace as {step:number;address:number;coordinates:number[]}[];
   if(trace.some((x,i)=>x.step!==i||!Number.isInteger(x.address)||x.address<0||x.address>=20736||!Array.isArray(x.coordinates)||x.coordinates.length!==4||x.coordinates.some(n=>!Number.isInteger(n)||n<1||n>12)||x.address!==1728*(x.coordinates[0]-1)+144*(x.coordinates[1]-1)+12*(x.coordinates[2]-1)+x.coordinates[3]-1))throw Error('Exported trace coordinates invalid');
   setLocalTurnResult({trace,artifact:{id:exported.artifactId,contentSha256:hash}});setSelectedExecutionStep(0);
   setExecutionStatus('R923 imported JSON verified against original local-host SHA-256 artifact: '+exported.artifactId+'. This does not verify offline portability or cloud execution.');
  }catch(e){setError('Exported execution verification refused: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const downloadLocalTurnCsv=()=>{
  if(!localTurnResult)return;
  const offline=localTurnResult.artifact.id==='offline-model-derived';
  const provenance=offline?'offline-model-derived-origin-unverified':'verified-local-executor-artifact';
  const rows=['step,address,d,p,r,l,provenance,origin_verified',...localTurnResult.trace.map(x=>[x.step,x.address,...x.coordinates,provenance,offline?'false':'true'].join(','))];
  const csv=rows.join('\r\n')+'\r\n';
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-'+(offline?'offline-model-derived-':'verified-local-')+localTurnResult.artifact.id+'.csv';
  document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const computeAndSave=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setLatestCsv(null);
  try{
   const address=parseAtlasAddressInputR916(atlasAddress);
   const length=Number(atlasLength.trim());
   if(atlasLength.trim()===''||!Number.isInteger(length)||length<2||length>64)throw Error('Atlas traversal length must be an integer from 2 to 64');
   const field=await getMandala20736Field();
   const result=executeAtlasArtifactR865(field,address,length);
   const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));
   const next=appendArtifactR862(latest,result.artifact);
   localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));
   setItems(next);notifyArtifactChangeR867();setTraceRow(1);setLatestCsv({csv:result.csv,address,rows:result.rowCount});
   setExecutionStatus('Computed '+result.rowCount+' source-model states; SVG saved locally. No external, device or Canon proof.');
  }catch(e){setError('Atlas execution rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const [routeTrace,setRouteTrace]=useState<{addresses:number[];cycleAt:number|null;truncated:boolean}|null>(null);
 const [routeSteps,setRouteSteps]=useState('32');
 const [compareAddress,setCompareAddress]=useState('0');
 const [routeComparison,setRouteComparison]=useState<ReturnType<typeof compareAtlasRoutesR902>|null>(null);
 const [routeSummary,setRouteSummary]=useState<ReturnType<typeof summarizeAtlasRouteR901>|null>(null);
 const downloadRouteCsv=async()=>{
  if(!routeTrace||executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');
  try{
   const field=await getMandala20736Field();
   const csv=exportAtlasRouteCsvR900(field,routeTrace);
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download='omega-atlas-route-'+routeTrace.addresses[0]+'.csv';link.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setExecutionStatus('Exported '+routeTrace.addresses.length+' validated route states and computed field values.');
  }catch(e){setError('Route CSV export rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };

 const [savedRouteReceipt,setSavedRouteReceipt]=useState('');
 const persistRouteCsv=async()=>{
  if(executionLease.current||!routeTrace)return;
  executionLease.current=true;setRunning(true);setError('');setSavedRouteReceipt('');
  try{
   const field=await getMandala20736Field();
   const csv=exportAtlasRouteCsvR900(field,routeTrace);
   const bytes=new TextEncoder().encode(csv);
   if(bytes.length>32768)throw Error('Route CSV exceeds the 32 KiB local-host limit; download the CSV instead or trace fewer steps');
   const response=await fetch('/__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'atlas_csv',content:csv})});
   if(!response.ok)throw Error('Local host rejected route CSV: HTTP '+response.status);
   const receipt=await response.json() as {id?:string;contentSha256?:string};
   if(!receipt.id||!receipt.contentSha256)throw Error('Local host returned incomplete receipt');
   const readback=await fetch('/__omega_local/artifacts/'+encodeURIComponent(receipt.id));
   if(!readback.ok)throw Error('Local host route readback failed: HTTP '+readback.status);
   const record=await readback.json() as {id?:string;kind?:string;content?:string;contentSha256?:string};
   const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
   if(record.id!==receipt.id||record.kind!=='atlas_csv'||record.content!==csv||record.contentSha256!==digest||receipt.contentSha256!==digest)throw Error('Local host route CSV readback integrity mismatch');
   setSavedRouteReceipt(receipt.id);setHostTraceId(receipt.id);
   void discoverHostArtifacts();
   setExecutionStatus('Route CSV persisted and independently SHA-256 verified on this local host: '+receipt.id+'. Not cloud or native-device proof.');
  }catch(e){setError('Route CSV host persistence unavailable: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };

 const executeRouteTrace=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setRouteTrace(null);setRouteSummary(null);setRouteComparison(null);setSavedRouteReceipt('');
  try{
   if(atlasAddress.trim()===''||routeSteps.trim()==='')throw Error('Enter a start address and step count');
   const field=await getMandala20736Field();
   const trace=traceAtlasRouteR899(field,parseAtlasAddressInputR916(atlasAddress),Number(routeSteps));
   setRouteSummary(summarizeAtlasRouteR901(field,trace));setRouteTrace(trace);
   setExecutionStatus('Executed '+trace.addresses.length+' compiled route states. Model-derived route, not geographic navigation.');
  }catch(e){setError('Atlas route execution rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const compareRoutes=async()=>{
  if(executionLease.current||!routeTrace)return;
  executionLease.current=true;setRunning(true);setError('');setRouteComparison(null);
  try{
   if(compareAddress.trim()==='')throw Error('Enter a comparison address');
   const field=await getMandala20736Field();
   const other=traceAtlasRouteR899(field,parseAtlasAddressInputR916(compareAddress),Number(routeSteps));
   const comparison=compareAtlasRoutesR902(field,routeTrace,other);
   setRouteComparison(comparison);
   setExecutionStatus('Compared two validated compiled Atlas routes. Overlap is model graph topology, not physical proximity.');
  }catch(e){setError('Route comparison rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const [inspectedAddress,setInspectedAddress]=useState<number|null>(null);
 const [inspectedValues,setInspectedValues]=useState<Array<{name:string;value:number}>>([]);
 const inspectAtlas=async(target?:number)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');
  // Never leave fields from a previous address visible when a new inspection fails.
  setInspectedAddress(null);setInspectedValues([]);
  try{
   const address=target??parseAtlasAddressInputR916(atlasAddress);
   if(target===undefined&&atlasAddress.trim()==='')throw Error('Enter an Atlas address');
   const field=await getMandala20736Field();
   const values=inspectAtlasAddressR897(field,address);
   setInspectedAddress(address);setInspectedValues(values);
   setExecutionStatus('Inspected compiled Atlas model address '+address+'. Values are model-derived, not physical measurements.');
  }catch(e){setError('Atlas inspection rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const downloadInspectedAtlasJsonR964=()=>{
  if(inspectedAddress===null||inspectedValues.length===0||executionLease.current||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress))return;
  const payload={schema:'OMEGA_ATLAS_INSPECTED_FIELDS_R964_V1',provenance:'BROWSER_LOCAL_COMPUTED',modelOnly:true,address:inspectedAddress,fields:inspectedValues};
  const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-inspection-'+inspectedAddress+'.json';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Downloaded compiled Atlas inspection for address '+inspectedAddress+' (model-derived, not a physical measurement).');
 };
 const downloadInspectedAtlasCsvR965=()=>{
  if(inspectedAddress===null||inspectedValues.length===0||executionLease.current||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress))return;
  const escapeCsv=(value:string|number)=>'"'+String(value).replace(/"/g,'""')+'"';
  const rows=[['address','field','computed_value','provenance','model_only'],...inspectedValues.map(item=>[inspectedAddress,item.name,item.value,'BROWSER_LOCAL_COMPUTED','true'])];
  const csv=rows.map(row=>row.map(value=>escapeCsv(value)).join(',')).join('\r\n')+'\r\n';
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-inspection-'+inspectedAddress+'.csv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Downloaded compiled Atlas inspection CSV for address '+inspectedAddress+' (model-derived only).');
 };
 const downloadInspectedAtlasTsvR971=()=>{
  if(inspectedAddress===null||inspectedValues.length===0||executionLease.current||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress))return;
  const safe=(value:string|number)=>String(value).replace(/[\t\r\n]/g,' ');
  const tsv=[['address','field','computed_value','provenance'],...inspectedValues.map(item=>[inspectedAddress,item.name,item.value,'BROWSER_LOCAL_COMPUTED'])].map(row=>row.map(safe).join('\t')).join('\r\n')+'\r\n';
  const url=URL.createObjectURL(new Blob([tsv],{type:'text/tab-separated-values;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='omega-atlas-inspection-'+inspectedAddress+'.tsv';document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  setExecutionStatus('Downloaded tab-separated compiled Atlas inspection for address '+inspectedAddress+' (model-derived only).');
 };
 const copyInspectedAtlasFieldsR967=async()=>{
  if(inspectedAddress===null||inspectedValues.length===0||executionLease.current||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress))return;
  const text=['address\tfield\tcomputed_value\tprovenance',...inspectedValues.map(item=>[inspectedAddress,item.name,item.value,'BROWSER_LOCAL_COMPUTED'].join('\t'))].join('\n')+'\n';
  try{
   if(!navigator.clipboard?.writeText)throw Error('Clipboard permission or secure context unavailable');
   await navigator.clipboard.writeText(text);
   setExecutionStatus('Copied '+inspectedValues.length+' computed Atlas fields for address '+inspectedAddress+' (model-derived only).');
  }catch(e){setError('Atlas clipboard copy rejected: '+String(e))}
 };
 const exportCompleteAtlas=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');
  try{
   const field=await getMandala20736Field();
   const csv=exportFullAtlasCsvR896(field);
   const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download='omega-atlas-all-20736-addresses.csv';link.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setExecutionStatus('Exported all 20,736 computed source-model addresses as CSV. This is a representational address space, not physical dimensions or external validation.');
  }catch(e){setError('Full Atlas export rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const exportRouteProvenance=async()=>{
  if(!routeTrace||executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');
  try{
   const field=await getMandala20736Field();
   const csv=exportAtlasRouteCsvR900(field,routeTrace);
   const bytes=new TextEncoder().encode(csv);
   const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
   const manifest={schema:'omega.atlas.route.provenance.v1',artifact:'omega-atlas-route-'+routeTrace.addresses[0]+'.csv',sha256,byteLength:bytes.length,route:{start:routeTrace.addresses[0],addresses:routeTrace.addresses,cycleAt:routeTrace.cycleAt,truncated:routeTrace.truncated},provenance:{tier:'DER',execution:'BROWSER_LOCAL_COMPUTED',source:'compiled_20736_address_model',physicalDimensions:false,physicalMeasurement:false,nativeDeviceAcceptance:false,externalValidation:false},admission:{status:'SCOPED_MODEL_OUTPUT',canonPromotion:false,orionGate:'HOLD_RULE_SOURCE_NEEDED',tit:'OPEN_CANDIDATE'}};
   const url=URL.createObjectURL(new Blob([JSON.stringify(manifest,null,2)],{type:'application/json'}));
   const link=document.createElement('a');link.href=url;link.download='omega-atlas-route-'+routeTrace.addresses[0]+'.provenance.json';link.click();
   window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setExecutionStatus('Exported route provenance with SHA-256 CSV digest and explicit model-only admission boundaries.');
  }catch(e){setError('Route provenance export rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const recoverSavedTrace=async(saved:OmegaArtifactR862)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setLatestCsv(null);
  try{
   const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===saved.id);
   if(!current||JSON.stringify(current)!==JSON.stringify(saved))throw Error('Saved artifact was removed or changed; refresh the library before recovery');
   const field=await getMandala20736Field();
   const address=saved.provenance.addressStart-1;
   const result=executeAtlasArtifactR865(field,address,saved.provenance.stateCount);
   if(result.artifact.payload!==saved.payload||result.rowCount!==saved.provenance.stateCount||result.artifact.provenance.addressStart!==saved.provenance.addressStart||result.artifact.provenance.addressEnd!==saved.provenance.addressEnd||result.artifact.provenance.engine!==saved.provenance.engine||result.artifact.provenance.source!==saved.provenance.source)throw Error('Saved SVG does not match current model traversal; trace recovery refused');
   const stillSaved=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===saved.id);
   if(!stillSaved||JSON.stringify(stillSaved)!==JSON.stringify(saved))throw Error('Saved artifact changed during model replay; trace recovery refused');
   setTraceRow(1);setLatestCsv({csv:result.csv,address,rows:result.rowCount,savedId:saved.id,savedSnapshot:JSON.stringify(saved)});
   setExecutionStatus('Recovered and verified '+result.rowCount+' model states against saved SVG. This is model replay, not external or device proof.');
  }catch(e){setError('Saved trace recovery rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const [hostTraceId,setHostTraceId]=useState('');
 const [hostTraceCsv,setHostTraceCsv]=useState('');
 const [hostTraceStatus,setHostTraceStatus]=useState('');
 const persistTraceToHost=async()=>{
  if(executionLease.current||!latestCsv)return;
  executionLease.current=true;setRunning(true);setError('');setHostTraceStatus('');
  try{
   const csv=latestCsv.csv;
   if(new TextEncoder().encode(csv).length>32768)throw Error('CSV exceeds bounded local host storage');
   const digest=async(text:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   const created=await fetch('/__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'atlas_csv',content:csv})});
   if(!created.ok)throw Error('Host rejected CSV: HTTP '+created.status);
   const receipt=await created.json() as {id:string;contentSha256:string};
   const response=await fetch('/__omega_local/artifacts/'+encodeURIComponent(receipt.id));
   if(!response.ok)throw Error('Host readback failed: HTTP '+response.status);
   const record=await response.json() as {id:string;kind:string;content:string;contentSha256:string};
   if(record.id!==receipt.id||record.kind!=='atlas_csv'||record.content!==csv||record.contentSha256!==receipt.contentSha256||await digest(csv)!==receipt.contentSha256)throw Error('CSV host receipt integrity mismatch');
   setHostTraceId(receipt.id);void discoverHostArtifacts();setHostTraceStatus('Verified CSV stored on local host: '+receipt.id);
  }catch(e){setError('CSV host persistence unavailable: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const recoverHostTrace=async(id:string)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setHostTraceCsv('');setHostTraceStatus('');
  try{
   const normalized=id.trim().toLowerCase();
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(normalized))throw Error('Invalid CSV artifact ID');
   const response=await fetch('/__omega_local/artifacts/'+encodeURIComponent(normalized));
   if(!response.ok)throw Error('Host CSV readback HTTP '+response.status);
   const record=await response.json() as {id:string;kind:string;content:string;contentSha256:string};
   if(record.id!==normalized||record.kind!=='atlas_csv'||typeof record.content!=='string'||new TextEncoder().encode(record.content).length>32768)throw Error('Invalid host CSV artifact');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(record.content)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(hash!==record.contentSha256)throw Error('CSV SHA-256 mismatch');
   setHostTraceCsv(record.content);setHostTraceId(normalized);setHostTraceStatus('Recovered SHA-256 verified CSV from local host.');
  }catch(e){setError('Host CSV recovery unavailable: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const [hostPersistence,setHostPersistence]=useState('');
 const [hostArtifactId,setHostArtifactId]=useState('');
 const [hostIndex,setHostIndex]=useState<{id:string;kind:string;createdAt:string}[]>([]);
 const [hostIndexStatus,setHostIndexStatus]=useState('');
 const discoverHostArtifacts=async()=>{
  setHostIndexStatus('');setHostIndex([]);
  try{
   const response=await fetch('/__omega_local/artifacts');
   if(!response.ok)throw Error('HTTP '+response.status);
   const data=await response.json() as {schema?:string;items?:Array<{id:string;kind:string;createdAt:string}>;limited?:boolean};
   if(data.schema!=='OMEGA_LOCAL_ARTIFACT_INDEX_R891'||!Array.isArray(data.items))throw Error('Unrecognized host index');
   const items=data.items.filter(item=>(item.kind==='atlas_svg'||item.kind==='atlas_csv'||item.kind==='atlas_execution')&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(item.id));
   setHostIndex(items);setHostIndexStatus(items.length+' recoverable Atlas SVG/CSV/execution artifacts found on this host'+(data.limited?' (bounded index)':'')+'.');
  }catch(e){setHostIndexStatus('Local host artifact discovery unavailable: '+String(e))}
 };

 const [recoveredHostSvg,setRecoveredHostSvg]=useState<{id:string;content:string}|null>(null);
 const recoverHostArtifact=async(selectedId?:string)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setRecoveredHostSvg(null);
  try{
   const id=(selectedId??hostArtifactId).trim().toLowerCase();
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))throw Error('Enter a valid local artifact UUID');
   const response=await fetch('/__omega_local/artifacts/'+encodeURIComponent(id));
   if(!response.ok)throw Error('Local host readback failed: HTTP '+response.status);
   const record=await response.json() as {id?:string;kind?:string;content?:string;contentSha256?:string};
   if(record.id!==id||record.kind!=='atlas_svg'||typeof record.content!=='string'||typeof record.contentSha256!=='string')throw Error('Host artifact identity or kind mismatch');
   if(new TextEncoder().encode(record.content).length>32768)throw Error('Host SVG exceeds bounded recovery size');
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(record.content)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(hash!==record.contentSha256)throw Error('Host SVG integrity verification failed');
   if(!/^<svg\b/i.test(record.content.trim())||!/<\/svg>\s*$/i.test(record.content))throw Error('Recovered artifact is not an SVG document');
   setRecoveredHostSvg({id,content:record.content});setHostPersistence('Recovered and SHA-256 verified local-host SVG '+id+'. This does not imply Canon or device proof.');
  }catch(e){setError('Local host SVG recovery unavailable: '+String(e))}finally{executionLease.current=false;setRunning(false)}
 };
 const persistToLocalHost=async(saved:OmegaArtifactR862)=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setHostPersistence('');
  try{
   const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===saved.id);
   if(!current||JSON.stringify(current)!==JSON.stringify(saved))throw Error('Artifact changed before host persistence; refresh and retry');
   if(new TextEncoder().encode(saved.payload).length>32768)throw Error('SVG exceeds local host artifact size limit (32768 bytes); browser copy remains available');
   const response=await fetch('/__omega_local/artifacts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'atlas_svg',content:saved.payload})});
   if(!response.ok)throw Error('Local host rejected artifact: HTTP '+response.status);
   const receipt=await response.json() as {id?:string;contentSha256?:string};
   if(!receipt.id||!receipt.contentSha256)throw Error('Host returned incomplete persistence receipt');
   const verified=await fetch('/__omega_local/artifacts/'+encodeURIComponent(receipt.id));
   if(!verified.ok)throw Error('Host persistence readback failed: HTTP '+verified.status);
   const record=await verified.json() as {content?:string;contentSha256?:string;kind?:string};
   if(record.content!==saved.payload||record.contentSha256!==receipt.contentSha256||record.kind!=='atlas_svg')throw Error('Host persistence readback differs from the saved SVG');
   const localSha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(saved.payload)))).map(x=>x.toString(16).padStart(2,'0')).join('');
   if(localSha256!==receipt.contentSha256)throw Error('Host persistence receipt does not match independently hashed SVG');
   setHostArtifactId(receipt.id);void discoverHostArtifacts();setHostPersistence('Verified local host SVG persistence · '+receipt.id+' · SHA-256 '+receipt.contentSha256+'. Browser artifact remains independently available.');
  }catch(e){setError('Local host persistence unavailable: '+String(e)+'. Browser artifact remains available; no cloud or native execution claim.')}finally{executionLease.current=false;setRunning(false)}
 };
 const downloadRouteProjectionSvg=()=>{
  if(!routeTrace||running)return;
  try{
   const addresses=routeTrace.addresses;
   if(addresses.length<1||addresses.length>256||addresses.some(a=>!Number.isInteger(a)||a<0||a>=20736))throw Error('Route addresses are invalid for deterministic SVG export');
   const x=(i:number)=>48+(addresses.length===1?0:i*776/(addresses.length-1));
   const y=(a:number)=>20+(11-(Math.floor(a/144)%12))*19;
   const grid=Array.from({length:12},(_,phase)=>'<line x1="48" y1="'+(20+phase*19)+'" x2="824" y2="'+(20+phase*19)+'" stroke="#32495a" stroke-width=".6"/><text x="8" y="'+(24+phase*19)+'" fill="#bed4e2" font-size="10">'+(11-phase)+'</text>').join('');
   const points=addresses.map((a,i)=>x(i).toFixed(4)+','+y(a)).join(' ');
   const dots=addresses.map((a,i)=>'<circle cx="'+x(i).toFixed(4)+'" cy="'+y(a)+'" r="'+(addresses.length>100?2:3)+'" fill="'+(i===0?'#ffd782':'#a9f1e6')+'"><title>Step '+(i+1)+' address '+a+' phase '+(Math.floor(a/144)%12)+'</title></circle>').join('');
   const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 840 260" role="img" aria-label="Computed Atlas route phase projection"><title>OMEGA Atlas route phase projection</title><desc>DER model-derived address-phase projection; browser-local computation; not geographic, physical, device or empirical proof. Cycle return: '+(routeTrace.cycleAt===null?'not observed':routeTrace.cycleAt)+'. Truncated: '+routeTrace.truncated+'.</desc><rect width="840" height="260" fill="#0a1725"/>'+grid+'<polyline fill="none" stroke="#55d9c5" stroke-width="2" points="'+points+'"/>'+dots+'</svg>';
   const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
   const link=document.createElement('a');link.href=url;link.download='omega-atlas-route-'+addresses[0]+'-'+addresses.length+'-DER.svg';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
   setError('');
  }catch(e){setError('Route projection SVG export refused: '+String(e))}
 };
 const downloadCsv=()=>{if(!latestCsv)return;if(latestCsv.savedId){const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===latestCsv.savedId);if(!current||JSON.stringify(current)!==latestCsv.savedSnapshot){setLatestCsv(null);setError('Saved artifact was removed or modified in another workspace; recovered CSV download refused');return}}const url=URL.createObjectURL(new Blob([latestCsv.csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='omega-atlas-'+latestCsv.address+'-'+latestCsv.rows+'-states.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const removeSaved=(id:string)=>{try{const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const next=latest.filter(item=>item.id!==id);if(next.length===latest.length){refresh();return}localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));setItems(next);setLatestCsv(previous=>previous?.savedId===id?null:previous);notifyArtifactChangeR867();setError('')}catch(e){setError('Unable to remove saved artifact: '+String(e))}};
 const exportAll=()=>{try{const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const json=exportArtifactBundleR863(latest);const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='omega-artifacts-r864.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setError('')}catch(e){setError(String(e))}};
 const importAll=async(file:File|null)=>{if(!file)return;try{if(file.size>2200000)throw Error('Bundle too large');const raw=await file.text();const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const next=importArtifactBundleR863(raw,latest);localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));setItems(next);notifyArtifactChangeR867();setError('')}catch(e){setError('Import rejected: '+String(e))}};
 return <section data-r864-shared-artifacts='local' className='o7-native-surface' aria-label='Shared computed artifact library' style={{marginTop:12,padding:12,border:'1px solid #56718a',borderRadius:8}}>
  <h2>Shared computed artifacts · {items.length}</h2><p>Validated local Atlas SVG results available to Projects and Assets. Browser-local only; no cloud sync, host receipt, Canon promotion or provider generation.</p>
  <label htmlFor='r865-atlas-address'>Atlas source address (0–20735)</label>{' '}<input id='r865-atlas-address' type='number' min={0} max={20735} step={1} value={atlasAddress} disabled={running} onChange={e=>setAtlasAddress(e.currentTarget.value)} style={{width:110}}/>{' '}
  <label htmlFor='r877-atlas-length'>Traversal states (2–64)</label>{' '}<input id='r877-atlas-length' type='number' min={2} max={64} step={1} value={atlasLength} disabled={running} onChange={e=>setAtlasLength(e.currentTarget.value)} style={{width:72}}/>{' '}
  <button type='button' disabled={running} onClick={()=>void computeAndSave()}>{running?'Computing Atlas artifact…':'Compute and save Atlas SVG here'}</button>{' '}<button type='button' onClick={()=>onNavigate('Atlas')}>Open Atlas workbench</button>{' '}
  <button type='button' disabled={running} onClick={()=>void inspectAtlas()}>Inspect Atlas address</button>{' '}
  <label htmlFor='r899-route-steps'>Route steps (1–256)</label>{' '}<input id='r899-route-steps' type='number' min={1} max={256} value={routeSteps} onChange={e=>setRouteSteps(e.currentTarget.value)} style={{width:70}}/>{' '}
  <button type='button' disabled={running} onClick={()=>void executeRouteTrace()}>Trace computed route</button>{' '}
  <button type='button' disabled={running} onClick={()=>void exportCompleteAtlas()}>Export complete 20,736-address Atlas CSV</button>{' '}<button type='button' disabled={running||!routeTrace} onClick={()=>void exportRouteProvenance()}>Export route provenance JSON (SHA-256)</button>{' '}
  <button type='button' onClick={refresh}>Refresh artifacts</button>{' '}
  <button type='button' onClick={exportAll}>Export portable bundle</button>{' '}
  <label>Import portable bundle <input type='file' accept='.json,application/json' onChange={e=>{const file=e.currentTarget.files?.[0]??null;void importAll(file);e.currentTarget.value=''}}/></label>
  <div><button type='button' disabled={running} onClick={()=>void discoverHostArtifacts()}>Find saved local-host artifacts</button>{' '}<span role='status'>{hostIndexStatus}</span>{hostIndex.length>0&&<ul aria-label='Saved host Atlas artifact receipts'>{hostIndex.map(item=><li key={item.id}><button type='button' disabled={running} onClick={()=>{if(item.kind==='atlas_execution'){void recoverLocalTurns(item.id)}else if(item.kind==='atlas_csv'){setHostTraceId(item.id);void recoverHostTrace(item.id)}else{setHostArtifactId(item.id);void recoverHostArtifact(item.id)}}}>Recover {item.createdAt} · {item.id}</button></li>)}</ul>}</div>
  <div><label htmlFor='r889-host-artifact-id'>Recover local-host SVG by receipt ID</label>{' '}<input id='r889-host-artifact-id' value={hostArtifactId} onChange={e=>setHostArtifactId(e.currentTarget.value)} placeholder='Local artifact UUID' style={{width:320,maxWidth:'100%'}}/>{' '}<button type='button' disabled={running} onClick={()=>void recoverHostArtifact()}>Recover host SVG</button></div>
  <div><label htmlFor='r893-host-csv-id'>Recover saved Atlas CSV</label>{' '}<input id='r893-host-csv-id' value={hostTraceId} onChange={e=>setHostTraceId(e.currentTarget.value)} placeholder='Local CSV UUID' style={{width:320,maxWidth:'100%'}}/>{' '}<button type='button' disabled={running} onClick={()=>void recoverHostTrace(hostTraceId)}>Recover CSV</button>{' '}<span role='status'>{hostTraceStatus}</span></div>
  {hostTraceCsv&&<div aria-label='Recovered verified host CSV'><pre style={{maxHeight:180,overflow:'auto'}}>{hostTraceCsv.split(/\r?\n/).slice(0,6).join('\n')}</pre><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([hostTraceCsv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='omega-recovered-atlas.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download recovered CSV</button></div>}
  {recoveredHostSvg&&<div aria-label='Recovered verified host SVG'><p>Verified local-host artifact {recoveredHostSvg.id}</p><img alt='Recovered Atlas SVG from local host' src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(recoveredHostSvg.content)} style={{width:'100%',maxWidth:420}}/><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([recoveredHostSvg.content],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=recoveredHostSvg.id+'.svg';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download recovered host SVG</button></div>}
  <div aria-label='Offline local Atlas turn executor'><h3>Local Atlas execution · saved and recoverable</h3><p>Requires the actual OMEGA loopback host. Executes the 12-state layer-turn operator using reversible 20,736-address indexing; no AI, native GPU, physical measurement or cloud claim.</p><label htmlFor='r910-turn-count'>Layer turns (0–256)</label>{' '}<input id='r910-turn-count' type='number' min={0} max={256} step={1} value={localTurnCount} disabled={running} onChange={e=>setLocalTurnCount(e.currentTarget.value)} style={{width:90}}/>{' '}<button type='button' disabled={running} onClick={()=>void executeLocalTurns()}>Execute on local host and verify saved result</button><button type='button' disabled={running||!localTurnResult} onClick={()=>void downloadPortableAtlasR924()}>Export portable offline Atlas trace (model-derived)</button><button type='button' disabled={running||!localTurnResult} onClick={()=>void saveOfflineAtlasR926()}>Save offline trace in this browser</button><button type='button' disabled={running} onClick={()=>void restoreOfflineAtlasR926()}>Restore saved offline trace</button><button type='button' disabled={running} onClick={clearSavedOfflineAtlasR936}>Clear saved offline trace from this browser</button><label htmlFor='r924-portable-import'>Import portable offline Atlas trace (integrity only)</label>{' '}<input id='r924-portable-import' type='file' accept='.json,application/json' disabled={running} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void importPortableAtlasR924(file);e.currentTarget.value=''}}/><label htmlFor='r923-execution-json-import'>Verify exported execution JSON against original local host</label>{' '}<input id='r923-execution-json-import' type='file' accept='.json,application/json' disabled={running} onChange={e=>{const file=e.currentTarget.files?.[0];if(file)void verifyExportedExecutionJson(file);e.currentTarget.value=''}}/>{localTurnResult&&<div role='status'><p>{localTurnResult.artifact.id==='offline-model-derived'?'Offline model-derived trace (origin unverified)':'Verified local artifact'} {localTurnResult.artifact.id} · {localTurnResult.trace.length} states</p><div aria-label='Interactive local Atlas execution timeline' style={{margin:'12px 0',padding:12,border:'1px solid rgba(160,190,210,.35)',borderRadius:10}}><label htmlFor='omega-execution-step'>Inspect execution step {Math.min(selectedExecutionStep,localTurnResult.trace.length-1)} of {localTurnResult.trace.length-1}</label><input id='omega-execution-step' type='range' min={0} max={localTurnResult.trace.length-1} step={1} value={Math.min(selectedExecutionStep,localTurnResult.trace.length-1)} onChange={e=>{setExecutionPlaying(false);setSelectedExecutionStep(Number(e.currentTarget.value))}} style={{width:'100%',display:'block',margin:'10px 0'}}/><p role='status'>Address {localTurnResult.trace[Math.min(selectedExecutionStep,localTurnResult.trace.length-1)].address} · D/P/R/L {localTurnResult.trace[Math.min(selectedExecutionStep,localTurnResult.trace.length-1)].coordinates.join(' / ')}</p>{executionMetrics&&<div aria-label='Computed execution movement and recurrence' style={{display:'flex',flexWrap:'wrap',gap:12,margin:'8px 0'}}><span>Address change: <strong>{executionMetrics.delta>0?'+':''}{executionMetrics.delta}</strong></span><span>Axis change D/P/R/L: <strong>{executionMetrics.axisDelta.map(x=>(x>0?'+':'')+x).join(' / ')}</strong></span><span>Unique addresses: <strong>{executionMetrics.visited}</strong></span><span>Repeated visits: <strong>{executionMetrics.returns}</strong></span><span>Total absolute address movement: <strong>{executionMetrics.totalTravel}</strong></span><small>Computed from the verified trace; address differences are index distances, not physical displacement.</small></div>}<button type='button' onClick={()=>void inspectAtlas(localTurnResult.trace[Math.min(selectedExecutionStep,localTurnResult.trace.length-1)].address)}>Inspect selected address and computed fields</button> <label htmlFor='omega-execution-speed'>Playback speed</label> <select id='omega-execution-speed' aria-label='Atlas execution playback speed' value={executionIntervalMs} onChange={e=>setExecutionIntervalMs(Number(e.currentTarget.value))}><option value={1100}>0.5×</option><option value={550}>1×</option><option value={275}>2×</option><option value={110}>5×</option></select> <button type='button' aria-label={executionPlaying?'Pause Atlas execution playback':'Play Atlas execution playback'} onClick={()=>{if(!executionPlaying&&selectedExecutionStep>=localTurnResult.trace.length-1)setSelectedExecutionStep(0);setExecutionPlaying(x=>!x)}}>{executionPlaying?'Pause playback':'Play trace'}</button> <button type='button' onClick={()=>{setExecutionPlaying(false);setSelectedExecutionStep(0)}}>Restart trace</button> <button type='button' disabled={running} onClick={()=>{const step=localTurnResult.trace[Math.min(selectedExecutionStep,localTurnResult.trace.length-1)];setExecutionPlaying(false);setAtlasAddress(String(step.address));setExecutionStatus('Loaded trace step '+step.step+' address '+step.address+' into Atlas start address. Run a new task or inspect it; this is model-derived, not host execution.')}} aria-label='Use selected Atlas trace address as next start'>Use step as Atlas start</button> <button type='button' disabled={running} onClick={downloadSelectedAtlasStepR943}>Download selected step JSON</button> <label htmlFor='omega-trace-find-address'>Find recorded address</label> <input id='omega-trace-find-address' type='number' min={0} max={20735} step={1} value={traceFindAddress} onChange={e=>setTraceFindAddress(e.currentTarget.value)} style={{width:100}}/> <button type='button' disabled={running} onClick={()=>{const raw=traceFindAddress.trim();const address=Number(raw);if(!/^(0|[1-9][0-9]*)$/.test(raw)||!Number.isSafeInteger(address)||address>20735){setExecutionStatus('Enter a whole Atlas address from 0 to 20735.');return}const matches=localTurnResult.trace.filter(x=>x.address===address);if(!matches.length){setExecutionStatus('Address '+address+' is not recorded in this '+localTurnResult.trace.length+'-state trace.');return}const next=matches.find(x=>x.step>selectedExecutionStep)??matches[0];setExecutionPlaying(false);setSelectedExecutionStep(next.step);setExecutionStatus('Found recorded address '+address+' at step '+next.step+' ('+matches.length+' visit'+(matches.length===1?'':'s')+').');}}>Find next visit</button> <button type='button' disabled={running} onClick={()=>{const raw=traceFindAddress.trim();const address=Number(raw);if(!/^(0|[1-9][0-9]*)$/.test(raw)||!Number.isSafeInteger(address)||address>20735){setExecutionStatus('Enter a whole Atlas address from 0 to 20735.');return}const matches=localTurnResult.trace.filter(x=>x.address===address);if(!matches.length){setExecutionStatus('Address '+address+' is not recorded in this '+localTurnResult.trace.length+'-state trace.');return}const previous=matches.filter(x=>x.step<selectedExecutionStep).at(-1)??matches[matches.length-1];setExecutionPlaying(false);setSelectedExecutionStep(previous.step);setExecutionStatus('Found previous recorded address '+address+' at step '+previous.step+' ('+matches.length+' visit'+(matches.length===1?'':'s')+').');}}>Find previous visit</button> <button type='button' disabled={running||selectedExecutionStep>=localTurnResult.trace.length-1} onClick={()=>{const current=localTurnResult.trace[selectedExecutionStep].address;const changed=localTurnResult.trace.find(x=>x.step>selectedExecutionStep&&x.address!==current);if(!changed){setExecutionPlaying(false);setExecutionStatus('No later address change in this recorded trace.');return}setExecutionPlaying(false);setSelectedExecutionStep(changed.step);setExecutionStatus('Next address change: '+current+' → '+changed.address+' at step '+changed.step+'. Model-derived trace navigation only.');}}>Next address change</button> <button type='button' disabled={running||selectedExecutionStep===0} onClick={()=>{const current=localTurnResult.trace[selectedExecutionStep].address;let previousIndex=selectedExecutionStep-1;while(previousIndex>=0&&localTurnResult.trace[previousIndex].address===current)previousIndex--;if(previousIndex<0){setExecutionPlaying(false);setExecutionStatus('No earlier address change in this recorded trace.');return}const previous=localTurnResult.trace[previousIndex];setExecutionPlaying(false);setSelectedExecutionStep(previousIndex);setExecutionStatus('Previous address change: '+current+' → '+previous.address+' at step '+previous.step+'. Model-derived trace navigation only.');}}>Previous address change</button> <button type='button' disabled={selectedExecutionStep===0} onClick={()=>setSelectedExecutionStep(x=>Math.max(0,x-1))}>Previous step</button> <button type='button' disabled={selectedExecutionStep>=localTurnResult.trace.length-1} onClick={()=>setSelectedExecutionStep(x=>Math.min(localTurnResult.trace.length-1,x+1))}>Next step</button> <button type='button' aria-label='Inspect selected recorded Atlas state' disabled={running||!localTurnResult.trace[selectedExecutionStep]} onClick={()=>{setExecutionPlaying(false);void inspectAtlas(localTurnResult.trace[selectedExecutionStep].address)}}>Inspect selected state</button> <button type='button' aria-label='Download inspected Atlas fields JSON' disabled={running||inspectedAddress===null||inspectedValues.length===0||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress)} onClick={downloadInspectedAtlasJsonR964}>Download inspected fields JSON</button> <button type='button' aria-label='Download inspected Atlas fields CSV' disabled={running||inspectedAddress===null||inspectedValues.length===0||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress)} onClick={downloadInspectedAtlasCsvR965}>Download inspected fields CSV</button> <button type='button' aria-label='Download inspected Atlas fields TSV' disabled={running||inspectedAddress===null||inspectedValues.length===0||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress)} onClick={downloadInspectedAtlasTsvR971}>Download inspected fields TSV</button> <button type='button' aria-label='Copy inspected Atlas fields' disabled={running||inspectedAddress===null||inspectedValues.length===0||(localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress)} onClick={()=>{void copyInspectedAtlasFieldsR967()}}>Copy inspected fields</button></div>{localTurnResult.trace.length>1&&<div aria-label='Recorded Atlas address transitions' style={{maxHeight:180,overflow:'auto',margin:'8px 0'}}><strong>Recorded address transitions</strong><div>{localTurnResult.trace.slice(1).filter((state,i)=>state.address!==localTurnResult.trace[i].address).map(state=><button key={state.step} type='button' disabled={running} aria-pressed={selectedExecutionStep===state.step} onClick={()=>{setExecutionPlaying(false);setSelectedExecutionStep(state.step);void inspectAtlas(state.address)}} style={{margin:3}}>Step {state.step}: {localTurnResult.trace[state.step-1].address} → {state.address}</button>)}</div></div>}{selectedExecutionStep>0&&localTurnResult.trace[selectedExecutionStep]&&localTurnResult.trace[selectedExecutionStep-1]&&localTurnResult.trace[selectedExecutionStep].address!==localTurnResult.trace[selectedExecutionStep-1].address&&<p aria-label='Selected Atlas transition coordinate deltas'>Selected transition · step {localTurnResult.trace[selectedExecutionStep-1].step} → {localTurnResult.trace[selectedExecutionStep].step} · address {localTurnResult.trace[selectedExecutionStep-1].address} → {localTurnResult.trace[selectedExecutionStep].address} · coordinate change (D, P, R, L): {localTurnResult.trace[selectedExecutionStep].coordinates.map((value,i)=>value-localTurnResult.trace[selectedExecutionStep-1].coordinates[i]).join(', ')}. Computed model coordinates, not physical displacement.</p>}<p aria-label='Recorded Atlas traversal summary'>Recorded model traversal: {localTurnResult.trace.length} states · {new Set(localTurnResult.trace.map(state=>state.address)).size} distinct addresses · {localTurnResult.trace.slice(1).filter((state,i)=>state.address!==localTurnResult.trace[i].address).length} address changes · {localTurnResult.trace.length-new Set(localTurnResult.trace.map(state=>state.address)).size} revisits. These are counts from this recorded trace, not proof of full 20,736-state coverage.</p><button type='button' disabled={running} onClick={downloadAtlasVisitIndexR946}>Download address visit index CSV</button> <button type='button' disabled={running} onClick={downloadAtlasTransitionsR950}>Download address transitions CSV</button> <button type='button' disabled={running} onClick={downloadAllTransitionsR957}>Download all transitions JSON</button> <button type='button' disabled={running} onClick={downloadTransitionDeltasR958}>Download transition deltas CSV</button> <button type='button' disabled={running||selectedExecutionStep===0||localTurnResult.trace[selectedExecutionStep]?.address===localTurnResult.trace[selectedExecutionStep-1]?.address} onClick={downloadSelectedTransitionR953}>Download selected transition JSON</button> <button type='button' disabled={running||localTurnResult.artifact.id==='offline-model-derived'} onClick={downloadLocalTurnJson} aria-label={localTurnResult.artifact.id==='offline-model-derived'?'Verified local Atlas execution JSON unavailable for offline traces':'Download verified local Atlas execution JSON'} title={localTurnResult.artifact.id==='offline-model-derived'?'Offline origin is unverified; use Portable Atlas JSON export.':'Export the verified local executor artifact'}>{localTurnResult.artifact.id==='offline-model-derived'?'Verified execution JSON unavailable (offline)':'Download verified execution JSON'}</button> <button type='button' onClick={downloadLocalTurnCsv} aria-label={localTurnResult.artifact.id==='offline-model-derived'?'Download offline model-derived Atlas CSV with unverified origin':'Download verified local Atlas execution CSV'}>{localTurnResult.artifact.id==='offline-model-derived'?'Download offline model-derived CSV':'Download verified execution CSV'}</button> <button type='button' onClick={downloadLocalTurnSvg} aria-label='Download verified local Atlas execution SVG'>{localTurnResult.artifact.id==='offline-model-derived'?'Download offline model-derived chart SVG':'Download execution chart SVG'}</button>{localTurnSvg&&<div aria-label='Atlas execution address progression chart' style={{maxWidth:800,margin:'10px 0'}}><img src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(localTurnSvg)} alt={'Executed Atlas address progression across '+localTurnResult.trace.length+' states'} style={{width:'100%',height:'auto'}}/><p>Address progression by turn. Vertical position is the model address, not a physical measurement.</p></div>}<div style={{maxHeight:160,overflow:'auto'}}>{localTurnResult.trace.map(x=><button key={x.step} type='button' onClick={()=>{setExecutionPlaying(false);setSelectedExecutionStep(x.step);void inspectAtlas(x.address)}} style={{margin:3}} aria-pressed={selectedExecutionStep===x.step}>Turn {x.step}: address {x.address}</button>)}</div></div>}</div>
  {routeTrace&&<div aria-label='Computed Atlas route trace'><h3>Compiled route · {routeTrace.addresses.length} visited states</h3><p>{routeTrace.cycleAt!==null?'Cycle returns to visited step '+(routeTrace.cycleAt+1):routeTrace.truncated?'Step limit reached':'Route ended'}. Select any address to inspect its 22 computed fields.</p>{routeSummary&&<p aria-label='Atlas route topology summary'>Unique visited addresses: {routeSummary.visited}. {routeSummary.cycleLength===null?'No cycle observed within step limit.':'Cycle length: '+routeSummary.cycleLength+'; pre-cycle steps: '+routeSummary.transientLength+'.'} Mean traversed-edge model-coordinate displacement (including cycle return): {routeSummary.meanStepDistance.toFixed(6)}; maximum: {routeSummary.maxStepDistance.toFixed(6)}. These are compiled coordinate differences, not measured physical distances.</p>}<button type='button' disabled={running} onClick={()=>void downloadRouteCsv()}>Download route trace CSV · all computed fields</button> <button type='button' disabled={running} onClick={()=>void persistRouteCsv()}>Save route CSV to local host and verify</button>{savedRouteReceipt&&<span role='status'> Verified local receipt: {savedRouteReceipt}</span>}<div style={{maxHeight:220,overflow:'auto'}}>{routeTrace.addresses.map((address,index)=><button key={index} type='button' disabled={running} onClick={()=>void inspectAtlas(address)} style={{margin:3}}>{index+1}: {address}</button>)}</div></div>}
  {routeTrace&&<div aria-label='Computed Atlas route projection' style={{marginTop:12}}><h3>Route projection · address axes</h3><button type='button' disabled={running} onClick={downloadRouteProjectionSvg}>Download deterministic route projection SVG</button><p>Model-derived projection: horizontal position is traversal step; vertical position is the phase coordinate (0–11) decoded from each address. Repeated phase coordinates are not identical states. This is not geographic or physical space.</p><svg role='img' aria-label={'Atlas route phase projection of '+routeTrace.addresses.length+' visited addresses'} viewBox='0 0 840 260' style={{width:'100%',maxWidth:840,background:'#0a1725',border:'1px solid #56718a'}}><title>Computed route phase-coordinate projection</title>{Array.from({length:12},(_,phase)=><g key={phase}><line x1={48} y1={20+phase*19} x2={824} y2={20+phase*19} stroke='#32495a' strokeWidth={0.6}/><text x={8} y={24+phase*19} fill='#bed4e2' fontSize={10}>{11-phase}</text></g>)}<polyline fill='none' stroke='#55d9c5' strokeWidth={2} points={routeTrace.addresses.map((address,i)=>[48+(routeTrace.addresses.length===1?0:i*776/(routeTrace.addresses.length-1)),20+(11-(Math.floor(address/144)%12))*19].join(',')).join(' ')}/>{routeTrace.addresses.map((address,i)=><circle key={i} cx={48+(routeTrace.addresses.length===1?0:i*776/(routeTrace.addresses.length-1))} cy={20+(11-(Math.floor(address/144)%12))*19} r={routeTrace.addresses.length>100?2:3} fill={i===0?'#ffd782':'#a9f1e6'} role='button' tabIndex={running?-1:0} aria-label={'Inspect route step '+(i+1)+' at Atlas address '+address} style={{cursor:running?'default':'pointer'}} onClick={()=>{if(!running)void inspectAtlas(address)}} onKeyDown={e=>{if(!running&&(e.key==='Enter'||e.key===' ')){e.preventDefault();void inspectAtlas(address)}}}><title>{'Step '+(i+1)+' · address '+address+' · phase '+(Math.floor(address/144)%12)}</title></circle>)}</svg><p>Cycle return: {routeTrace.cycleAt===null?'not observed':'step '+(routeTrace.cycleAt+1)}. The closing transition is recorded as topology, not an invented extra state.</p></div>}
  {routeTrace&&<div aria-label='Compare compiled Atlas routes'><label htmlFor='r902-compare-address'>Second route start address</label>{' '}<input id='r902-compare-address' type='number' min={0} max={20735} step={1} value={compareAddress} disabled={running} onChange={e=>setCompareAddress(e.currentTarget.value)} style={{width:110}}/>{' '}<button type='button' disabled={running} onClick={()=>void compareRoutes()}>Compare route overlap</button>{routeComparison&&<p role='status'>Shared addresses: {routeComparison.sharedAddresses}; first-only: {routeComparison.firstOnly}; second-only: {routeComparison.secondOnly}; common initial steps: {routeComparison.commonPrefix}; first shared step: {routeComparison.firstSharedStep??'none'}; second shared step: {routeComparison.secondSharedStep??'none'}. First cycle length: {routeComparison.firstCycleLength??'not observed'}; second: {routeComparison.secondCycleLength??'not observed'}. Model-derived topology only.</p>}</div>}
  {inspectedAddress!==null&&localTurnResult!==null&&localTurnResult.trace[selectedExecutionStep]?.address!==inspectedAddress&&<p role='status' aria-label='Atlas inspection address mismatch'>Inspection is for address {inspectedAddress}, not selected replay address {localTurnResult.trace[selectedExecutionStep]?.address}. Select Inspect selected state before exporting or copying these fields.</p>}
  {inspectedAddress!==null&&<div aria-label='Compiled Atlas address inspection'><h3>Atlas address {inspectedAddress} · 22 computed fields</h3><table><thead><tr><th scope='col'>Field</th><th scope='col'>Computed value</th></tr></thead><tbody>{inspectedValues.map(item=><tr key={item.name}><th scope='row'>{item.name}</th><td>{item.value}</td></tr>)}</tbody></table><button type='button' disabled={running||inspectedAddress===0} onClick={()=>void inspectAtlas(inspectedAddress-1)}>Previous address</button>{' '}<button type='button' disabled={running||inspectedAddress===20735} onClick={()=>void inspectAtlas(inspectedAddress+1)}>Next address</button>{' '}<button type='button' disabled={running} onClick={()=>{const next=inspectedValues.find(x=>x.name==='routeNext')?.value;if(next!==undefined)void inspectAtlas(next)}}>Follow computed route</button></div>}
  {executionStatus&&<p role='status'>{executionStatus}</p>}{hostPersistence&&<p role='status'>{hostPersistence}</p>}
  {latestCsv&&<div aria-label='Computed Atlas trace preview'><p>Computed trace · address {latestCsv.address} · {latestCsv.rows} states. Inspect any computed row below; download for the complete trace.</p><label htmlFor='r886-trace-row'>Trace row (1–{latestCsv.rows})</label>{' '}<input id='r886-trace-row' type='number' min={1} max={latestCsv.rows} step={1} value={traceRow} onChange={e=>{const value=Number(e.currentTarget.value);if(Number.isInteger(value)&&value>=1&&value<=latestCsv.rows)setTraceRow(value)}} style={{width:85}}/><pre aria-label='Selected computed Atlas trace row' style={{maxHeight:180,overflow:'auto',whiteSpace:'pre',fontSize:12}}>{[latestCsv.csv.split(/\r?\n/)[0],latestCsv.csv.split(/\r?\n/)[traceRow]].join('\n')}</pre><button type='button' onClick={downloadCsv}>Download computed trace CSV · {latestCsv.rows} states</button>{' '}<button type='button' disabled={running} onClick={()=>void persistTraceToHost()}>Save full trace CSV to local host</button></div>}
  {error&&<p role='alert'>{error}</p>}
  {items.map(a=><article key={a.id} style={{padding:'12px 0',borderTop:'1px solid #56718a'}}><strong>Atlas · {a.provenance.stateCount} states</strong> <small>{a.createdAt} · addresses {a.provenance.addressStart}–{a.provenance.addressEnd} · MODEL_DERIVED</small><div><img alt={'Saved model traversal '+a.id} src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.payload)} style={{width:'100%',maxWidth:420}}/></div><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([a.payload],{type:a.mediaType}));const link=document.createElement('a');link.href=url;link.download=a.id+'.svg';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download SVG</button>{' '}<button type='button' disabled={running} aria-label={'Persist Atlas SVG to local host '+a.id} onClick={()=>void persistToLocalHost(a)}>Persist SVG to local host</button>{' '}<button type='button' disabled={running} aria-label={'Recover verified CSV trace '+a.id} onClick={()=>void recoverSavedTrace(a)}>Recover verified CSV trace</button>{' '}<button type='button' aria-label={'Remove saved artifact '+a.id} onClick={()=>removeSaved(a.id)}>Remove saved artifact</button></article>)}
 </section>;
}
