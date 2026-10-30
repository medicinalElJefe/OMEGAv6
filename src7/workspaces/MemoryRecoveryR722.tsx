import {useEffect,useState,type ChangeEvent} from 'react';
import {localState} from '../../src/platformAdapter';
import {MEMORY_KEY_R722,exportMemoryBundleR722,mergeMemoryBundleR722,verifyMemoryRowsR722} from '../../src/portableMemoryRecoveryR722.mjs';

const readRows=()=>{const raw=localStorage.getItem(MEMORY_KEY_R722);if(raw===null)return [];if(raw.length>524288)throw Error('R722 local memory exceeds recovery limit');try{return JSON.parse(raw)}catch{throw Error('R722 existing local memory JSON is damaged; no overwrite allowed')}};
export function MemoryRecoveryR722(){
 const [count,setCount]=useState(0);
 const [portable,setPortable]=useState('');
 const [incoming,setIncoming]=useState('');
 const [status,setStatus]=useState('');
 const [error,setError]=useState('');
 const refresh=()=>{try{const rows=readRows();setCount(Array.isArray(rows)?rows.length:0)}catch(e){setError(e instanceof Error?e.message:'R722 local memory unavailable')}};
 useEffect(()=>{
  refresh();
  window.addEventListener('omega-r722-memory-updated',refresh);
  window.addEventListener('storage',refresh);
  return()=>{window.removeEventListener('omega-r722-memory-updated',refresh);window.removeEventListener('storage',refresh)};
 },[]);
 const fail=(e:unknown)=>{setStatus('');setError(e instanceof Error?e.message:'R722 recovery refused')};
 const verify=async()=>{
  try{
   const result=await verifyMemoryRowsR722(readRows());
   setStatus(result.count+' local snapshot digests verified; browser-local evidence only.');setError('');
  }catch(e){fail(e)}
 };
 const prepare=async()=>{
  try{
   const bundle=await exportMemoryBundleR722(readRows());
   setPortable(JSON.stringify(bundle,null,2));
   setStatus(bundle.rows.length+' verified snapshots prepared for portable recovery.');setError('');
  }catch(e){setPortable('');fail(e)}
 };
 const download=()=>{
  if(!portable)return;
  const blob=new Blob([portable],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='omega-memory-r722-verified.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const restore=async()=>{
  try{
   const result=await mergeMemoryBundleR722(readRows(),incoming);
   if(!localState.write(MEMORY_KEY_R722,result.rows))throw Error('R722 browser storage write failed; no recovery claimed');
   window.dispatchEvent(new Event('omega-r722-memory-updated'));
   setStatus('Verified recovery: '+result.added+' new, '+result.existing+' already present; '+result.rows.length+' total.');
   setError('');refresh();
  }catch(e){fail(e)}
 };
 const fileInput=async(e:ChangeEvent<HTMLInputElement>)=>{
  const file=e.target.files?.[0];
  if(!file)return;
  if(file.size>524288){fail(Error('R722 portable file exceeds 512 KiB'));return}
  try{setIncoming(await file.text());setStatus('Portable file loaded; verification required before import.');setError('')}
  catch(e){fail(e)}
 };
 return <section data-r722-memory-recovery aria-label='Verified portable memory recovery'
  style={{maxWidth:'100%',minWidth:0,overflowWrap:'anywhere',padding:'12px',margin:'12px 0',border:'1px solid #65727d',borderRadius:8}}>
  <h2>R722 · Portable memory recovery</h2>
  <p>Verify and carry existing R28 packet snapshots between browsers. Each source digest and the portable envelope are independently checked before any import. No cloud account or paid storage is used.</p>
  <p data-r722-count>{count} browser-local snapshots</p>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button type='button' data-r722-verify onClick={()=>void verify()}>Verify local snapshots</button>
   <button type='button' data-r722-export onClick={()=>void prepare()}>Prepare verified export</button>
   <button type='button' data-r722-download disabled={!portable} onClick={download}>Download portable JSON</button>
  </div>
  {portable&&<label style={{display:'block',marginTop:8}}>Verified export JSON
   <textarea data-r722-export-json readOnly value={portable} rows={3} style={{display:'block',width:'100%',boxSizing:'border-box'}}/>
  </label>}
  <label style={{display:'block',marginTop:12}}>Choose a portable memory JSON file
   <input data-r722-file type='file' accept='.json,application/json' onChange={e=>void fileInput(e)}/>
  </label>
  <label style={{display:'block',marginTop:8}}>Or paste portable JSON
   <textarea data-r722-import-json value={incoming} onChange={e=>setIncoming(e.target.value)}
    rows={4} placeholder='Paste an OMEGA_PORTABLE_MEMORY_R722_V1 export'
    style={{display:'block',width:'100%',boxSizing:'border-box'}}/>
  </label>
  <button type='button' data-r722-import disabled={!incoming.trim()} onClick={()=>void restore()}>Verify and import without overwriting</button>
  {error&&<p data-r722-error role='alert'>REFUSED: {error}</p>}
  {status&&<p data-r722-status role='status'>{status}</p>}
  <small data-r722-boundary>SHA-256 is tamper detection, not an authenticated signature. This restores browser-local R28 notes and addresses only. No CanonState admission, model training, cross-device synchronization, external donor verification or native execution is claimed. Existing snapshots are never silently overwritten.</small>
 </section>;
}
