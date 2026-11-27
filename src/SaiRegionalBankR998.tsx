
import {useEffect,useMemo,useRef,useState} from 'react';
import {corpusState} from './corpusRuntime';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';
import {projectedRegionR998,trainProjectedRegionR998,summarizeBankR998,predictRegionalR998,verifyRegionalModelR998,R998_BANK,R998_FEATURES} from './saiRelationalLearningR992.mjs';
type Model=ReturnType<typeof trainProjectedRegionR998>;
type Row={region:number;weights:readonly number[];bestEpoch:number;partitions:Model['partitions'];sourceSha256:string};
const KEY='omega.sai.r998.regional-bank',LIMIT=2097152;
const compact=(model:Model,sourceSha256:string):Row=>({region:model.region,weights:model.weights,bestEpoch:model.bestEpoch,partitions:model.partitions,sourceSha256});
export default function SaiRegionalBankR998({address}:{address:number}){
 const [models,setModels]=useState<Row[]>([]),[authorized,setAuthorized]=useState(false),[busy,setBusy]=useState(false),[training,setTraining]=useState(false),[message,setMessage]=useState(''),[prediction,setPrediction]=useState<ReturnType<typeof predictRegionalR998>|null>(null);
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
 const exportBank=()=>void work(async()=>{const text=await pack(),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));try{const a=document.createElement('a');a.href=url;a.download='omega-sai-r998-regional-bank.json';a.click()}finally{window.setTimeout(()=>URL.revokeObjectURL(url),1000)}});
 return <section data-r998-regional-bank='LOCAL_PROJECTED_CORPUS_TRAINING' aria-label='Full projected atlas model bank' style={{border:'1px solid #60758c',borderRadius:10,padding:12,marginBottom:12,maxWidth:'100%',minWidth:0,overflowWrap:'anywhere'}}>
 <h3>SAI · Whole projected atlas learning</h3><p>Train 144 regional regressors on the embedded 20,736-address projected corpus. Each model learns the projected scar channel from eight projected features, with separate training, validation and held-out addresses. These are not raw donor data, empirical observations, or foundation-model weights.</p>
 <label style={{display:'flex',alignItems:'center',gap:8}}><input type='checkbox' checked={authorized} disabled={busy} onChange={e=>setAuthorized(e.target.checked)}/>Authorize local projected-source training</label>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button disabled={busy||!authorized||summary.complete} onClick={train}>{models.length?'Resume whole-field training':'Train all 144 regions'}</button><button disabled={!training} onClick={()=>{pause.current=true}}>Pause at region boundary</button><button disabled={busy||!models.length} onClick={()=>void work(async()=>{localStorage.setItem(KEY,await pack());setMessage('Saved local bank with regional source digests.')})}>Save model bank</button><button disabled={busy} onClick={()=>void work(async()=>restore(localStorage.getItem(KEY)||''))}>Restore and replay bank</button><button disabled={busy||!models.length} onClick={exportBank}>Export model bank</button><button disabled={busy||!models.some(x=>x.region===Math.floor(address/144))} onClick={infer}>Infer selected address</button><button disabled={busy} onClick={()=>{setModels([]);setAuthorized(false);setMessage('Active model bank cleared; saved bank remains.')}}>Clear active bank</button></div>
 <label>Import model bank <input type='file' accept='.json,application/json' disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(file)void work(async()=>{if(file.size>LIMIT)throw Error('Bank too large');await restore(await file.text())})}}/></label>
 <progress value={summary.regions} max={144}/><p>{summary.regions} / 144 models · {summary.addresses.toLocaleString()} addresses · {summary.parameterCount.toLocaleString()} trainable parameters across trained regions</p>
 {Object.entries(summary.partitions).map(([kind,row])=><p key={kind}>{kind}: {row.count} addresses · MSE {row.initialMse===null?'—':row.initialMse.toPrecision(5)} → {row.mse===null?'—':row.mse.toPrecision(5)}</p>)}
 {prediction&&prediction.address===address&&<output>Address {prediction.address} · predicted scar {prediction.prediction.toFixed(6)} · projected source scar {prediction.target.toFixed(6)} · residual {prediction.residual.toFixed(6)}</output>}<p role='status'>{message}</p>
 </section>;
}
