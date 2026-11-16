import {useEffect,useState} from 'react';
import {getMandala20736Field} from '../../src/mandala20736Runtime';
import {executeAtlasArtifactR865} from './omegaAtlasArtifactExecutorR865';
import {appendArtifactR862,notifyArtifactChangeR867,OMEGA_ARTIFACT_CHANGED_R867} from './omegaArtifactSpineR862';
import {OMEGA_ARTIFACT_STORAGE_R862,decodeArtifactsR862,exportArtifactBundleR863,importArtifactBundleR863,type OmegaArtifactR862} from './omegaArtifactSpineR862';
/** R864: one browser-local artifact collection consumed by Atlas, Projects and Assets. */
export function SharedArtifactLibraryR864({onNavigate}:{onNavigate:(route:string)=>void}){
 const [items,setItems]=useState<OmegaArtifactR862[]>([]);
 const [error,setError]=useState('');
 const [running,setRunning]=useState(false);
 const [executionStatus,setExecutionStatus]=useState('');
 const [latestCsv,setLatestCsv]=useState<{csv:string;address:number;rows:number;savedId?:string}|null>(null);
 const [atlasAddress,setAtlasAddress]=useState(()=>{try{const stored=localStorage.getItem('omega.v6.address');return stored===null?'11498':stored}catch{return '11498'}});
 const refresh=()=>{try{setItems(decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)))}catch{setItems([])}};
 useEffect(()=>{refresh();window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);window.addEventListener(OMEGA_ARTIFACT_CHANGED_R867,refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh);window.removeEventListener(OMEGA_ARTIFACT_CHANGED_R867,refresh)}},[]);
 const computeAndSave=async()=>{
  if(running)return;
  setRunning(true);setError('');setExecutionStatus('');setLatestCsv(null);
  try{
   const address=Number(atlasAddress.trim());
   if(atlasAddress.trim()===''||!Number.isInteger(address)||address<0||address>=20736)throw Error('Atlas address must be an integer from 0 to 20735');
   const field=await getMandala20736Field();
   const result=executeAtlasArtifactR865(field,address,32);
   const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));
   const next=appendArtifactR862(latest,result.artifact);
   localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));
   setItems(next);notifyArtifactChangeR867();setLatestCsv({csv:result.csv,address,rows:result.rowCount});
   setExecutionStatus('Computed '+result.rowCount+' source-model states; SVG saved locally. No external, device or Canon proof.');
  }catch(e){setError('Atlas execution rejected: '+String(e))}finally{setRunning(false)}
 };
 const recoverSavedTrace=async(saved:OmegaArtifactR862)=>{
  if(running)return;
  setRunning(true);setError('');setExecutionStatus('');setLatestCsv(null);
  try{
   const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===saved.id);
   if(!current||JSON.stringify(current)!==JSON.stringify(saved))throw Error('Saved artifact was removed or changed; refresh the library before recovery');
   const field=await getMandala20736Field();
   const address=saved.provenance.addressStart-1;
   const result=executeAtlasArtifactR865(field,address,saved.provenance.stateCount);
   if(result.artifact.payload!==saved.payload||result.rowCount!==saved.provenance.stateCount||result.artifact.provenance.addressStart!==saved.provenance.addressStart||result.artifact.provenance.addressEnd!==saved.provenance.addressEnd||result.artifact.provenance.engine!==saved.provenance.engine||result.artifact.provenance.source!==saved.provenance.source)throw Error('Saved SVG does not match current model traversal; trace recovery refused');
   const stillSaved=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===saved.id);
   if(!stillSaved||JSON.stringify(stillSaved)!==JSON.stringify(saved))throw Error('Saved artifact changed during model replay; trace recovery refused');
   setLatestCsv({csv:result.csv,address,rows:result.rowCount,savedId:saved.id});
   setExecutionStatus('Recovered and verified '+result.rowCount+' model states against saved SVG. This is model replay, not external or device proof.');
  }catch(e){setError('Saved trace recovery rejected: '+String(e))}finally{setRunning(false)}
 };
 const downloadCsv=()=>{if(!latestCsv)return;if(latestCsv.savedId){const current=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862)).find(item=>item.id===latestCsv.savedId);if(!current){setLatestCsv(null);setError('Saved artifact was removed in another workspace; recovered CSV download refused');return}}const url=URL.createObjectURL(new Blob([latestCsv.csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='omega-atlas-'+latestCsv.address+'-'+latestCsv.rows+'-states.csv';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)};
 const removeSaved=(id:string)=>{try{const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const next=latest.filter(item=>item.id!==id);if(next.length===latest.length){refresh();return}localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));setItems(next);setLatestCsv(previous=>previous?.savedId===id?null:previous);notifyArtifactChangeR867();setError('')}catch(e){setError('Unable to remove saved artifact: '+String(e))}};
 const exportAll=()=>{try{const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const json=exportArtifactBundleR863(latest);const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='omega-artifacts-r864.json';a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);setError('')}catch(e){setError(String(e))}};
 const importAll=async(file:File|null)=>{if(!file)return;try{if(file.size>2200000)throw Error('Bundle too large');const raw=await file.text();const latest=decodeArtifactsR862(localStorage.getItem(OMEGA_ARTIFACT_STORAGE_R862));const next=importArtifactBundleR863(raw,latest);localStorage.setItem(OMEGA_ARTIFACT_STORAGE_R862,JSON.stringify(next));setItems(next);notifyArtifactChangeR867();setError('')}catch(e){setError('Import rejected: '+String(e))}};
 return <section data-r864-shared-artifacts='local' className='o7-native-surface' aria-label='Shared computed artifact library' style={{marginTop:12,padding:12,border:'1px solid #56718a',borderRadius:8}}>
  <h2>Shared computed artifacts · {items.length}</h2><p>Validated local Atlas SVG results available to Projects and Assets. Browser-local only; no cloud sync, host receipt, Canon promotion or provider generation.</p>
  <label htmlFor='r865-atlas-address'>Atlas source address (0–20735)</label>{' '}<input id='r865-atlas-address' type='number' min={0} max={20735} step={1} value={atlasAddress} disabled={running} onChange={e=>setAtlasAddress(e.currentTarget.value)} style={{width:110}}/>{' '}
  <button type='button' disabled={running} onClick={()=>void computeAndSave()}>{running?'Computing Atlas artifact…':'Compute and save Atlas SVG here'}</button>{' '}<button type='button' onClick={()=>onNavigate('Atlas')}>Open Atlas workbench</button>{' '}
  <button type='button' onClick={refresh}>Refresh artifacts</button>{' '}
  <button type='button' onClick={exportAll}>Export portable bundle</button>{' '}
  <label>Import portable bundle <input type='file' accept='.json,application/json' onChange={e=>{const file=e.currentTarget.files?.[0]??null;void importAll(file);e.currentTarget.value=''}}/></label>
  {executionStatus&&<p role='status'>{executionStatus}</p>}
  {latestCsv&&<div aria-label='Computed Atlas trace preview'><p>Computed trace · address {latestCsv.address} · {latestCsv.rows} states. First five data rows shown below; download for the complete trace.</p><pre style={{maxHeight:180,overflow:'auto',whiteSpace:'pre',fontSize:12}}>{latestCsv.csv.split(/\r?\n/).slice(0,6).join('\n')}</pre><button type='button' onClick={downloadCsv}>Download computed trace CSV · {latestCsv.rows} states</button></div>}
  {error&&<p role='alert'>{error}</p>}
  {items.map(a=><article key={a.id} style={{padding:'12px 0',borderTop:'1px solid #56718a'}}><strong>Atlas · {a.provenance.stateCount} states</strong> <small>{a.createdAt} · addresses {a.provenance.addressStart}–{a.provenance.addressEnd} · MODEL_DERIVED</small><div><img alt={'Saved model traversal '+a.id} src={'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.payload)} style={{width:'100%',maxWidth:420}}/></div><button type='button' onClick={()=>{const url=URL.createObjectURL(new Blob([a.payload],{type:a.mediaType}));const link=document.createElement('a');link.href=url;link.download=a.id+'.svg';link.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000)}}>Download SVG</button>{' '}<button type='button' disabled={running} aria-label={'Recover verified CSV trace '+a.id} onClick={()=>void recoverSavedTrace(a)}>Recover verified CSV trace</button>{' '}<button type='button' aria-label={'Remove saved artifact '+a.id} onClick={()=>removeSaved(a.id)}>Remove saved artifact</button></article>)}
 </section>;
}
