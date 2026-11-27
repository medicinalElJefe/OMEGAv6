
import {useEffect,useMemo,useRef,useState} from 'react';
import {SAI_SPHERE_KEY_R1003,SAI_SPHERE_LIMIT_R1003,packSaiSphereR1004} from './saiSphereBridgeR1003.mjs';
import {corpusState} from './corpusRuntime';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';
import {projectedRegionR998,trainProjectedRegionR998,summarizeBankR998,predictRegionalR998,verifyRegionalModelR998,R998_BANK,R998_FEATURES,correlateFieldR999,fieldReceiptR1000,verifyFieldReceiptR1000,auditCorrelationR1001,selectCorrelationR1002,verifySelectionR1002} from './saiRelationalLearningR992.mjs';
type Model=ReturnType<typeof trainProjectedRegionR998>;
type Row={region:number;weights:readonly number[];bestEpoch:number;partitions:Model['partitions'];sourceSha256:string};
const KEY='omega.sai.r998.regional-bank',LIMIT=2097152;
const compact=(model:Model,sourceSha256:string):Row=>({region:model.region,weights:model.weights,bestEpoch:model.bestEpoch,partitions:model.partitions,sourceSha256});
export default function SaiRegionalBankR998({address}:{address:number}){
 const [models,setModels]=useState<Row[]>([]),[authorized,setAuthorized]=useState(false),[busy,setBusy]=useState(false),[training,setTraining]=useState(false),[message,setMessage]=useState(''),[prediction,setPrediction]=useState<ReturnType<typeof predictRegionalR998>|null>(null);
 const [correlation,setCorrelation]=useState<ReturnType<typeof correlateFieldR999>|null>(null);
 useEffect(()=>setCorrelation(null),[models]);
 const [receipt,setReceipt]=useState<ReturnType<typeof fieldReceiptR1000>|null>(null);
 useEffect(()=>setReceipt(null),[models]);
 const [audit,setAudit]=useState<ReturnType<typeof auditCorrelationR1001>|null>(null);
 useEffect(()=>setAudit(null),[receipt]);
 const [selection,setSelection]=useState<ReturnType<typeof selectCorrelationR1002>|null>(null);
 useEffect(()=>setSelection(null),[models]);
 const lock=useRef(false),alive=useRef(true),pause=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;pause.current=true}},[]);
 useEffect(()=>setPrediction(null),[address,models]);
 const summary=useMemo(()=>summarizeBankR998(models),[models]);
 const work=async(fn:()=>Promise<void>)=>{if(lock.current)return;lock.current=true;setBusy(true);try{await fn()}catch(e){if(alive.current)setMessage(String(e))}finally{lock.current=false;if(alive.current)setBusy(false)}};
 const train=()=>void work(async()=>{
  if(!authorized)throw Error('Explicit regional training authorization required');
  const next=models.slice(),done=new Set(next.map(x=>x.region));pause.current=false;setTraining(true);
  try{for(let region=0;region<144;region++){
   if(done.has(region))continue;
   await new Promise<void>(resolve=>window.setTimeout(resolve,0));if(!alive.current||pause.current)break;
   const dataset=projectedRegionR998(corpusState,region),sha=await inspectionSHA(dataset);if(!alive.current||pause.current)break;
   const model=trainProjectedRegionR998(dataset,region);next.push(compact(model,sha));next.sort((a,b)=>a.region-b.region);
   setModels(next.slice());setMessage('Trained '+next.length+' / 144 regional models');
  }
  if(alive.current)setMessage(next.length===144?'Complete projected field trained; inspect or save model bank.':'Paused at region boundary; resume or save.');
  }finally{if(alive.current)setTraining(false)}
 });
 const pack=async()=>{const body={schema:R998_BANK,models,summary:summarizeBankR998(models),featureNames:R998_FEATURES,target:'scar',canonicalMutation:false};const text=JSON.stringify({body,sha256:await inspectionSHA(body)});if(text.length>LIMIT)throw Error('Bank exceeds checkpoint budget');return text};
 const restore=async(text:string)=>{
  if(!text||text.length>LIMIT)throw Error('Invalid bank checkpoint size');
  const envelope=JSON.parse(text),body=envelope?.body;
  if(body?.schema!==R998_BANK||body.canonicalMutation!==false||body.target!=='scar'||JSON.stringify(body.featureNames)!==JSON.stringify(R998_FEATURES)||await inspectionSHA(body)!==envelope.sha256)throw Error('Bank checkpoint digest mismatch');
  const census=summarizeBankR998(body.models);
  if(await inspectionSHA(census)!==await inspectionSHA(body.summary))throw Error('Bank summary mismatch');
  const next:Row[]=[];
  for(const row of body.models){
   await new Promise<void>(resolve=>window.setTimeout(resolve,0));if(!alive.current)return;
   const dataset=projectedRegionR998(corpusState,row.region),sha=await inspectionSHA(dataset);
   if(sha!==row.sourceSha256)throw Error('Projected region source changed: '+row.region);
   const model=verifyRegionalModelR998(dataset,row);next.push(compact(model,sha));setMessage('Verified '+next.length+' / '+census.regions+' regional checkpoints');
  }
  if(!alive.current)return;setModels(next.sort((a,b)=>a.region-b.region));setAuthorized(false);setMessage('Source digests and optimizer replay verified; bank restored.');
 };
 const infer=()=>void work(async()=>{const model=models.find(x=>x.region===Math.floor(address/144));if(!model)throw Error('Selected region has not been trained');const dataset=projectedRegionR998(corpusState,model.region);if(await inspectionSHA(dataset)!==model.sourceSha256)throw Error('Projected source changed');setPrediction(predictRegionalR998(dataset,model,address));setMessage('Selected address evaluated by its source-bound regional model.')});
 const fieldInputs=async()=>{
  if(!summary.complete)throw Error('Complete model bank required');
  const values:number[]=[],bindings:{region:number;sourceSha256:string;modelSha256:string}[]=[];
  for(const model of models.slice().sort((a,b)=>a.region-b.region)){
   await new Promise<void>(resolve=>window.setTimeout(resolve,0));if(!alive.current)return null;
   const dataset=projectedRegionR998(corpusState,model.region);
   if(await inspectionSHA(dataset)!==model.sourceSha256)throw Error('Projected source changed');
   bindings.push({region:model.region,sourceSha256:model.sourceSha256,modelSha256:await inspectionSHA(model)});
   for(const row of dataset.rows)values.push(predictRegionalR998(dataset,model,row.address).prediction);
  }
  return alive.current?{values,bindings}:null;
 };
 const correlate=()=>void work(async()=>{
  const inputs=await fieldInputs();if(!inputs)return;
  const next=fieldReceiptR1000(inputs.values,inputs.bindings,{steps:4});
  setSelection(null);setReceipt(next);setCorrelation(next.result);setMessage('Source/model-bound prediction exchange completed; CanonState unchanged.');
 });
 const auditField=()=>void work(async()=>{
  if(!receipt)throw Error('No field receipt');
  const inputs=await fieldInputs();if(!inputs)return;
  const verified=verifyFieldReceiptR1000(receipt,inputs.values,inputs.bindings);
  setAudit(auditCorrelationR1001(verified,corpusState));setMessage('Compared original and exchanged predictions against disjoint projected source partitions.');
 });
 const optimizeField=()=>void work(async()=>{
  const inputs=await fieldInputs();if(!inputs)return;
  const next=selectCorrelationR1002(inputs.values,inputs.bindings,corpusState);
  setSelection(next);setReceipt(next.field);setCorrelation(next.field.result);
  setMessage('Validation-only exchange selection complete; held-out metrics are reported separately.');
 });
 const exportSelection=()=>void work(async()=>{
  if(!selection)throw Error('No selection receipt');
  const text=JSON.stringify(selection);if(new TextEncoder().encode(text).length>LIMIT)throw Error('Selection receipt exceeds byte budget');
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));try{const a=document.createElement('a');a.href=url;a.download='omega-sai-r1002-selection.json';a.click()}finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
 });
 const importSelection=(file:File)=>void work(async()=>{
  if(file.size>LIMIT)throw Error('Selection receipt exceeds byte budget');
  const packet=JSON.parse(await file.text()),inputs=await fieldInputs();if(!inputs)return;
  const next=verifySelectionR1002(packet,inputs.values,inputs.bindings,corpusState);
  setSelection(next);setReceipt(next.field);setCorrelation(next.field.result);setMessage('Validation selection replay verified.');
 });
 const makeSphereTransfer=async()=>{
  if(!receipt||!summary.complete)throw Error('Complete verified field required');
  const inputs=await fieldInputs();if(!inputs)return null;
  const field=verifyFieldReceiptR1000(receipt,inputs.values,inputs.bindings);
  return {schema:'OMEGA_SAI_SPHERE_READONLY_R1003',models,field,canonicalMutation:false};
 };
 const publishSphere=()=>void work(async()=>{
  const packet=await makeSphereTransfer();if(!packet)return;
  const text=JSON.stringify(packet);
  if(new TextEncoder().encode(text).length>SAI_SPHERE_LIMIT_R1003)throw Error('SPHERE transfer exceeds byte budget');
  localStorage.setItem(SAI_SPHERE_KEY_R1003,text);setMessage('Published read-only field; open SPHERE and replay to verify.');
 });
 const exportSphere=()=>void work(async()=>{
  const packet=await makeSphereTransfer();if(!packet)return;
  const text=await packSaiSphereR1004(packet),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));
  try{const a=document.createElement('a');a.href=url;a.download='omega-sai-sphere-r1004.json';a.click()}finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
 });
 const exportField=()=>void work(async()=>{
  if(!receipt)throw Error('No field receipt');
  const text=JSON.stringify(receipt);if(new TextEncoder().encode(text).length>LIMIT)throw Error('Field receipt exceeds byte budget');
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));try{const a=document.createElement('a');a.href=url;a.download='omega-sai-r1000-field.json';a.click()}finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000)}
 });
 const importField=(file:File)=>void work(async()=>{
  if(file.size>LIMIT)throw Error('Field receipt exceeds byte budget');
  const packet=JSON.parse(await file.text()),inputs=await fieldInputs();if(!inputs)return;
  const next=verifyFieldReceiptR1000(packet,inputs.values,inputs.bindings);
  setSelection(null);setReceipt(next);setCorrelation(next.result);setMessage('Field receipt replay verified against active source and model bank.');
 });
 const exportBank=()=>void work(async()=>{const text=await pack(),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));try{const a=document.createElement('a');a.href=url;a.download='omega-sai-r998-regional-bank.json';a.click()}finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000)}});
 return <section data-r998-regional-bank='LOCAL_PROJECTED_CORPUS_TRAINING' aria-label='Full projected atlas model bank' style={{border:'1px solid #60758c',borderRadius:10,padding:12,marginBottom:12,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
 <h3>SAI · Whole projected atlas learning</h3><p>Train 144 regional regressors on the embedded 20,736-address projected corpus. Each model learns the projected scar channel from eight projected features, with separate training, validation and held-out addresses. These are not raw donor data, empirical observations, or foundation-model weights.</p>
 <label style={{display:'flex',alignItems:'center',gap:8}}><input type='checkbox' checked={authorized} disabled={busy} onChange={e=>setAuthorized(e.target.checked)}/>Authorize local projected-source training</label>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button disabled={busy||!authorized||summary.complete} onClick={train}>{models.length?'Resume whole-field training':'Train all 144 regions'}</button><button disabled={!training} onClick={()=>{pause.current=true}}>Pause at region boundary</button><button disabled={busy||!models.length} onClick={()=>void work(async()=>{localStorage.setItem(KEY,await pack());setMessage('Saved local bank with regional source digests.')})}>Save model bank</button><button disabled={busy} onClick={()=>void work(async()=>restore(localStorage.getItem(KEY)||''))}>Restore and replay bank</button><button disabled={busy||!models.length} onClick={exportBank}>Export model bank</button><button disabled={busy||!models.some(x=>x.region===Math.floor(address/144))} onClick={infer}>Infer selected address</button><button disabled={busy} onClick={()=>{setModels([]);setAuthorized(false);setMessage('Active model bank cleared; saved bank remains.')}}>Clear active bank</button></div>
 <button disabled={busy||!summary.complete} onClick={correlate}>Correlate all 20,736 predictions</button>
 <p>R999 · Four simultaneous periodic lattice exchanges of model predictions only; not learned communication or empirical evidence.</p>
 {correlation&&<output>Selected address correlated prediction {correlation.values[address]?.toFixed(6)} · conservation residual {correlation.residual.toExponential(3)} · {correlation.edges.toLocaleString()} undirected edges</output>}
 <button disabled={busy||!receipt||!summary.complete} onClick={publishSphere}>Publish verified field to SPHERE</button>
 <button disabled={busy||!receipt||!summary.complete} onClick={exportSphere}>Export portable SAI–SPHERE transfer</button>
 <button disabled={busy||!receipt} onClick={exportField}>Export replayable field receipt</button>
 <button disabled={busy||!receipt} onClick={auditField}>Evaluate correlation against source</button>
 {audit&&<div><p>Full-field MSE: {audit.full.before.mse?.toPrecision(6)} → {audit.full.after.mse?.toPrecision(6)}</p>{Object.entries(audit.partitions).map(([kind,p])=><p key={kind}>{kind}: {p.before.count} addresses · MSE {p.before.mse?.toPrecision(6)} → {p.after.mse?.toPrecision(6)}</p>)}<p>Selected region MSE: {audit.regions[Math.floor(address/144)]?.before.mse?.toPrecision(6)} → {audit.regions[Math.floor(address/144)]?.after.mse?.toPrecision(6)}. Exchange is not assumed to improve accuracy.</p></div>}
 <button disabled={busy||!summary.complete} onClick={optimizeField}>Select exchange by validation</button>
 <button disabled={busy||!selection} onClick={exportSelection}>Export selection receipt</button>
 <label>Verify selection receipt <input type='file' accept='.json,application/json' disabled={busy||!summary.complete} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)importSelection(file)}}/></label>
 {selection&&<div><p>Selected weight {selection.selected.weight} · steps {selection.selected.steps} · {selection.candidates.length} bounded candidates including identity.</p><p>Validation MSE: {selection.audit.partitions.validation.before.mse?.toPrecision(6)} → {selection.audit.partitions.validation.after.mse?.toPrecision(6)}. Held-out MSE: {selection.audit.partitions.test.before.mse?.toPrecision(6)} → {selection.audit.partitions.test.after.mse?.toPrecision(6)}.</p><p>Held-out labels do not select the exchange. Repeated review is not fresh external validation.</p></div>}
 <label>Verify field receipt <input type='file' accept='.json,application/json' disabled={busy||!summary.complete} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)importField(file)}}/></label>
 <label>Import model bank <input type='file' accept='.json,application/json' disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void work(async()=>{if(file.size>LIMIT)throw Error('Bank too large');await restore(await file.text())})}}/></label>
 <progress value={summary.regions} max={144}/><p>{summary.regions} / 144 models · {summary.addresses.toLocaleString()} addresses · {summary.parameterCount.toLocaleString()} trainable parameters across trained regions</p>
 {Object.entries(summary.partitions).map(([kind,row])=><p key={kind}>{kind}: {row.count} addresses · MSE {row.initialMse===null?'—':row.initialMse.toPrecision(5)} → {row.mse===null?'—':row.mse.toPrecision(5)}</p>)}
 {prediction&&prediction.address===address&&<output>Address {prediction.address} · predicted scar {prediction.prediction.toFixed(6)} · projected source scar {prediction.target.toFixed(6)} · residual {prediction.residual.toFixed(6)}</output>}<p role='status'>{message}</p>
 </section>;
}
