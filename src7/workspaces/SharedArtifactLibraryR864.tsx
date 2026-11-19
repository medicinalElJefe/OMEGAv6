import {useEffect,useRef,useState} from 'react';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {executeAtlasArtifactR865} from './omegaAtlasArtifactExecutorR865';
import {exportFullAtlasCsvR896,inspectAtlasAddressR897,traceAtlasRouteR899,exportAtlasRouteCsvR900,summarizeAtlasRouteR901,compareAtlasRoutesR902} from './omegaFullAtlasExportR896';
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
 const computeAndSave=async()=>{
  if(executionLease.current)return;
  executionLease.current=true;setRunning(true);setError('');setExecutionStatus('');setLatestCsv(null);
  try{
   const address=Number(atlasAddress.trim());
   if(atlasAddress.trim()===''||!Number.isInteger(address)||address<0||address>=20736)throw Error('Atlas address must be an integer from 0 to 20735');
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
  executionLease.current=true;setRunning(true);setError('');setRouteTrace(null);setRouteSummary(null);
  try{
   if(atlasAddress.trim()===''||routeSteps.trim()==='')throw Error('Enter a start address and step count');
   const field=await getMandala20736Field();
   const trace=traceAtlasRouteR899(field,Number(atlasAddress),Number(routeSteps));
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
   const other=traceAtlasRouteR899(field,Number(compareAddress),Number(routeSteps));
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
  try{
   const address=target??Number(atlasAddress.trim());
   if(target===undefined&&atlasAddress.trim()==='')throw Error('Enter an Atlas address');
   const field=await getMandala20736Field();
   const values=inspectAtlasAddressR897(field,address);
   setInspectedAddress(address);setInspectedValues(values);
   setExecutionStatus('Inspected compiled Atlas model address '+address+'. Values are model-derived, not physical measurements.');
  }catch(e){setError('Atlas inspection rejected: '+String(e))}finally{executionLease.current=false;setRunning(false)}
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
   const items=data.items.filter(item=>(item.kind==='atlas_svg'||item.kind==='atlas_csv')&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(item.id));
   setHostIndex(items);setHostIndexStatus(items.length+' recoverable Atlas SVG/CSV receipts found on this host'+(data.limited?' (bounded index)':'')+'.');
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
  <button type='button' disabled={running} onClick={()=>void exportCompleteAtlas()}>Export complete 20,736-address Atlas CSV</button>{' '}
  <button type='button' onClick={refresh}>Refresh artifacts</button>{' '}
  <button type='button' onClick={exportAll}>Export portable bundle</button>{' '}
  <label>Import portable bundle <input type='file' accept='.json,application/json' onChange={e=>{const file=e.currentTarget.files?.[0]??null;void importAll(file);e.currentTarget.value=''}}/></label>
  <div><button type='button' disabled={running} onClick={()=>void discoverHostArtifacts()}>Find saved local-host artifacts</button>{' '}<span role='status'>{hostIndexStatus}</span>{hostIndex.length>0&&<ul aria-label='Saved host Atlas artifact receipts'>{hostIndex.map(item=><li key={item.id}><button type='button' disabled={running} onClick={()=>{if(item.kind==='atlas_csv'){setHostTraceId(item.id);void recoverHostTrace(item.id)}else{setHostArtifactId(item.id);void recoverHostArtifact(item.id)}}}>Recover {item.createdAt} · {item.id}</button></li>)}</ul>}</div>
  <div><label htmlFor='r889-host-artifact-id'>Recover local-host SVG by receipt ID</label>{' '}<input id='r889-host-artifact-id' value={hostArtifactId} onChange={e=>setHostArtifactId(e.currentTarget.value)} placeholder='Local artifact UUID' style={{width:320,maxWidth:'100%'}}/>{' '}<button type='button' disabled={running} onClick={()=>void recoverHostArtifact()}>Recover host SVG</button></div>
  <div><label htmlFor='r893-host-csv-id'>Recover saved Atlas CSV</label>{' '}<input id='r893-host-csv-id' value={hostTraceId} onChange={e=>setHostTraceId(e.currentTarget.value)} placeholder='Local CSV UUID' style={{width:320,maxWidth:'100%'}}/>{' '}<button type='button' disabled={running} onClick={()=>void recoverHostTrace(hostTraceId)}>Recover CSV</button>{' '}<span role='status'>{hostTraceStatus}</span></div>
  {hostTraceCsv&&<div aria-label='Recovered verified host CSV'><pre style={{maxHeight:180,overflow:'auto'}}>{hostTraceCsv.split(/\r?\n/).slice(0,6).join('\n')}</pre><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([hostTraceCsv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='omega-recovered-atlas.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download recovered CSV</button></div>}
  {recoveredHostSvg&&<div aria-label='Recovered verified host SVG'><p>Verified local-host artifact {recoveredHostSvg.id}</p><img alt='Recovered Atlas SVG from local host' src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(recoveredHostSvg.content)} style={{width:'100%',maxWidth:420}}/><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([recoveredHostSvg.content],{type:'image/svg+xml'}));const a=document.createElement('a');a.href=url;a.download=recoveredHostSvg.id+'.svg';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download recovered host SVG</button></div>}
  {routeTrace&&<div aria-label='Computed Atlas route trace'><h3>Compiled route · {routeTrace.addresses.length} visited states</h3><p>{routeTrace.cycleAt!==null?'Cycle returns to visited step '+(routeTrace.cycleAt+1):routeTrace.truncated?'Step limit reached':'Route ended'}. Select any address to inspect its 22 computed fields.</p>{routeSummary&&<p aria-label='Atlas route topology summary'>Unique visited addresses: {routeSummary.visited}. {routeSummary.cycleLength===null?'No cycle observed within step limit.':'Cycle length: '+routeSummary.cycleLength+'; pre-cycle steps: '+routeSummary.transientLength+'.'} Mean traversed-edge model-coordinate displacement (including cycle return): {routeSummary.meanStepDistance.toFixed(6)}; maximum: {routeSummary.maxStepDistance.toFixed(6)}. These are compiled coordinate differences, not measured physical distances.</p>}<button type='button' disabled={running} onClick={()=>void downloadRouteCsv()}>Download route trace CSV · all computed fields</button> <button type='button' disabled={running} onClick={()=>void persistRouteCsv()}>Save route CSV to local host and verify</button>{savedRouteReceipt&&<span role='status'> Verified local receipt: {savedRouteReceipt}</span>}<div style={{maxHeight:220,overflow:'auto'}}>{routeTrace.addresses.map((address,index)=><button key={index} type='button' disabled={running} onClick={()=>void inspectAtlas(address)} style={{margin:3}}>{index+1}: {address}</button>)}</div></div>}
  {routeTrace&&<div aria-label='Compare compiled Atlas routes'><label htmlFor='r902-compare-address'>Second route start address</label>{' '}<input id='r902-compare-address' type='number' min={0} max={20735} step={1} value={compareAddress} disabled={running} onChange={e=>setCompareAddress(e.currentTarget.value)} style={{width:110}}/>{' '}<button type='button' disabled={running} onClick={()=>void compareRoutes()}>Compare route overlap</button>{routeComparison&&<p role='status'>Shared addresses: {routeComparison.sharedAddresses}; first-only: {routeComparison.firstOnly}; second-only: {routeComparison.secondOnly}; common initial steps: {routeComparison.commonPrefix}; first shared step: {routeComparison.firstSharedStep??'none'}; second shared step: {routeComparison.secondSharedStep??'none'}. First cycle length: {routeComparison.firstCycleLength??'not observed'}; second: {routeComparison.secondCycleLength??'not observed'}. Model-derived topology only.</p>}</div>}
  {inspectedAddress!==null&&<div aria-label='Compiled Atlas address inspection'><h3>Atlas address {inspectedAddress} · 22 computed fields</h3><table><thead><tr><th scope='col'>Field</th><th scope='col'>Computed value</th></tr></thead><tbody>{inspectedValues.map(item=><tr key={item.name}><th scope='row'>{item.name}</th><td>{item.value}</td></tr>)}</tbody></table><button type='button' disabled={running||inspectedAddress===0} onClick={()=>void inspectAtlas(inspectedAddress-1)}>Previous address</button>{' '}<button type='button' disabled={running||inspectedAddress===20735} onClick={()=>void inspectAtlas(inspectedAddress+1)}>Next address</button>{' '}<button type='button' disabled={running} onClick={()=>{const next=inspectedValues.find(x=>x.name==='routeNext')?.value;if(next!==undefined)void inspectAtlas(next)}}>Follow computed route</button></div>}
  {executionStatus&&<p role='status'>{executionStatus}</p>}{hostPersistence&&<p role='status'>{hostPersistence}</p>}
  {latestCsv&&<div aria-label='Computed Atlas trace preview'><p>Computed trace · address {latestCsv.address} · {latestCsv.rows} states. Inspect any computed row below; download for the complete trace.</p><label htmlFor='r886-trace-row'>Trace row (1–{latestCsv.rows})</label>{' '}<input id='r886-trace-row' type='number' min={1} max={latestCsv.rows} step={1} value={traceRow} onChange={e=>{const value=Number(e.currentTarget.value);if(Number.isInteger(value)&&value>=1&&value<=latestCsv.rows)setTraceRow(value)}} style={{width:85}}/><pre aria-label='Selected computed Atlas trace row' style={{maxHeight:180,overflow:'auto',whiteSpace:'pre',fontSize:12}}>{[latestCsv.csv.split(/\r?\n/)[0],latestCsv.csv.split(/\r?\n/)[traceRow]].join('\n')}</pre><button type='button' onClick={downloadCsv}>Download computed trace CSV · {latestCsv.rows} states</button>{' '}<button type='button' disabled={running} onClick={()=>void persistTraceToHost()}>Save full trace CSV to local host</button></div>}
  {error&&<p role='alert'>{error}</p>}
  {items.map(a=><article key={a.id} style={{padding:'12px 0',borderTop:'1px solid #56718a'}}><strong>Atlas · {a.provenance.stateCount} states</strong> <small>{a.createdAt} · addresses {a.provenance.addressStart}–{a.provenance.addressEnd} · MODEL_DERIVED</small><div><img alt={'Saved model traversal '+a.id} src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.payload)} style={{width:'100%',maxWidth:420}}/></div><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([a.payload],{type:a.mediaType}));const link=document.createElement('a');link.href=url;link.download=a.id+'.svg';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download SVG</button>{' '}<button type='button' disabled={running} aria-label={'Persist Atlas SVG to local host '+a.id} onClick={()=>void persistToLocalHost(a)}>Persist SVG to local host</button>{' '}<button type='button' disabled={running} aria-label={'Recover verified CSV trace '+a.id} onClick={()=>void recoverSavedTrace(a)}>Recover verified CSV trace</button>{' '}<button type='button' aria-label={'Remove saved artifact '+a.id} onClick={()=>removeSaved(a.id)}>Remove saved artifact</button></article>)}
 </section>;
}
