import{useEffect,useMemo,useState}from'react';
import{CheckCircle2,Cpu,Play,RefreshCw,ShieldCheck,TriangleAlert}from'lucide-react';
import{api}from'./platformAdapter';
import{useHybridRuntimeSnapshotR238}from'./HybridRuntimeSnapshotR238';
import{validateCommandPlan,type SarR344ClosureSpec}from'./hybridCommandRuntime';
import type{SarHostClosureReceiptR344}from'./sarHostClosureR344';
import'./sarHybridR345.css';

type Props={
 masterProductId:string;slaveProductId:string;masterAcquired:string;slaveAcquired:string;polarization:string;
 pairReady:boolean;onReceipt:(receipt:SarHostClosureReceiptR344)=>void;recommendedFields?:string[];recommendedLayer?:string|null;
};
type Form={
 projectPath:string;masterPath:string;slavePath:string;masterOrbitPath:string;slaveOrbitPath:string;demPath:string;subswath:'IW1'|'IW2'|'IW3';
 firstBurst:number;lastBurst:number;outputPath:string;coregProofPath:string;interferogramPath:string;coherencePath:string;correctedInterferogramPath:string;geometricPhaseProofPath:string;receiptPath:string;
 executeGraph:boolean;previewJsonPath:string;unwrapPath:string;unwrapMaskPath:string;unwrapProofPath:string;atmospherePath:string;etadPath:string;losPath:string;correctedLosPath:string;signConvention:string;losSign:1|-1;wavelengthM:number;
};
const cleanId=(v:string)=>v.replace(/[^A-Za-z0-9._-]+/g,'_').slice(0,90);
const initial=(master:string,slave:string):Form=>{const pair=(cleanId(master||'master')+'__'+cleanId(slave||'slave')).slice(0,150),base='.omega_hybrid/sar/r345/'+pair;return{
 projectPath:'.',masterPath:'',slavePath:'',masterOrbitPath:'',slaveOrbitPath:'',demPath:'',subswath:'IW2',firstBurst:1,lastBurst:999,
 outputPath:base+'/snap_ifg.dim',coregProofPath:base+'/coreg-proof.json',interferogramPath:base+'/interferogram.img',coherencePath:base+'/coherence.img',
 correctedInterferogramPath:base+'/corrected-interferogram.img',geometricPhaseProofPath:base+'/geometric-phase-proof.json',receiptPath:base+'/r344-receipt.json',
 executeGraph:true,previewJsonPath:'',unwrapPath:'',unwrapMaskPath:'',unwrapProofPath:'',atmospherePath:'',etadPath:'',losPath:'',correctedLosPath:'',
 signConvention:'positive toward sensor',losSign:1,wavelengthM:.0555
}};
const requiredKeys:(keyof Form)[]=['projectPath','masterPath','slavePath','masterOrbitPath','slaveOrbitPath','demPath','outputPath','coregProofPath','interferogramPath','coherencePath','correctedInterferogramPath','geometricPhaseProofPath','receiptPath'];

export default function SarHybridClosureR345({masterProductId,slaveProductId,masterAcquired,slaveAcquired,polarization,pairReady,onReceipt,recommendedFields=[],recommendedLayer=null}:Props){
 const{device,selectedDeviceJobs,refresh,stale}=useHybridRuntimeSnapshotR238();
 const[form,setForm]=useState<Form>(()=>initial(masterProductId,slaveProductId)),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[jobId,setJobId]=useState(''),[ingested,setIngested]=useState('');
 useEffect(()=>{setForm(v=>({...initial(masterProductId,slaveProductId),projectPath:v.projectPath,masterPath:'',slavePath:'',masterOrbitPath:'',slaveOrbitPath:'',demPath:''}));setConfirmed(false);setJobId('');setIngested('');setMessage('')},[masterProductId,slaveProductId]);
 const capable=Boolean(device?.online&&!device?.revoked&&Array.isArray(device?.capabilities)&&device.capabilities.includes('SAR_R344_CLOSURE')&&!stale);
 const activeJob=useMemo(()=>selectedDeviceJobs.find((x:any)=>x.id===jobId)||null,[selectedDeviceJobs,jobId]);
 const returned=activeJob?.returnPacket?.stepProofs?.find((x:any)=>x?.op==='SAR_R344_CLOSURE')?.result||null;
 useEffect(()=>{const receipt=returned?.receipt as SarHostClosureReceiptR344|undefined,fingerprint=String(returned?.receiptSha256||'');if(activeJob?.status==='COMPLETE'&&receipt?.schema==='OMEGA_SAR_HOST_CLOSURE_R344'&&fingerprint&&fingerprint!==ingested){onReceipt(receipt);setIngested(fingerprint);setMessage('R345 host returned an R344 receipt. It has been handed to the R344 validator; only gates proved by that receipt may promote.')}},[activeJob?.status,returned,ingested,onReceipt]);
 const set=<K extends keyof Form,>(k:K,v:Form[K])=>setForm(x=>({...x,[k]:v}));
 const spec=():SarR344ClosureSpec=>({
  masterPath:form.masterPath,slavePath:form.slavePath,masterAcquired,slaveAcquired,polarization:polarization as any,subswath:form.subswath,firstBurst:form.firstBurst,lastBurst:form.lastBurst,
  masterOrbitPath:form.masterOrbitPath,slaveOrbitPath:form.slaveOrbitPath,demPath:form.demPath,outputPath:form.outputPath,coregProofPath:form.coregProofPath,interferogramPath:form.interferogramPath,
  coherencePath:form.coherencePath,correctedInterferogramPath:form.correctedInterferogramPath,geometricPhaseProofPath:form.geometricPhaseProofPath,receiptPath:form.receiptPath,executeGraph:form.executeGraph,
  previewJsonPath:form.previewJsonPath||undefined,unwrapPath:form.unwrapPath||undefined,unwrapMaskPath:form.unwrapMaskPath||undefined,unwrapProofPath:form.unwrapProofPath||undefined,
  atmospherePath:form.atmospherePath||undefined,etadPath:form.etadPath||undefined,losPath:form.losPath||undefined,correctedLosPath:form.correctedLosPath||undefined,
  wavelengthM:form.wavelengthM,losSign:form.losSign,signConvention:form.signConvention
 });
 const localValidation=useMemo(()=>validateCommandPlan([{op:'SAR_R344_CLOSURE',label:'Execute R344 full-resolution SAR closure and return exact receipt',path:form.projectPath,maxRuntimeSeconds:21600,sarClosure:spec()}],form.projectPath,[]),[form,masterAcquired,slaveAcquired,polarization]);
 const complete=requiredKeys.every(k=>String(form[k]??'').trim().length>0)&&!!masterAcquired&&!!slaveAcquired&&/^(VV|VH|HH|HV)$/i.test(polarization);
 const queue=async()=>{if(busy||!pairReady||!complete||!confirmed||!capable||!device?.id||!localValidation.passed)return;setBusy(true);setMessage('');try{const r=await api.post<any>('/api/hybrid/jobs',{schema:'OMEGA_SAR_HYBRID_CLOSURE_JOB_R345',action:'SAR_R344_CLOSURE',profile:'AUTO_BUILD',projectPath:form.projectPath,instructions:'Execute the promoted R344 Sentinel-1 full-resolution closure driver on the explicitly supplied root-confined evidence. Return the exact R344 receipt; do not promote missing physical stages.',allowedDomains:[],steps:localValidation.steps,targetDeviceId:device.id,confirmed:true});const id=String(r.data?.job?.id||'');if(!id)throw new Error('Hybrid authority returned no durable job identity.');setJobId(id);setConfirmed(false);setMessage('R345 closure job queued on '+String(device.name||device.id)+'. The authenticated agent must claim it and return exact R141/R344 proof before the ledger changes.');await refresh()}catch(e:any){setMessage(e?.message||String(e))}finally{setBusy(false)}};
 const recommended=new Set(recommendedFields);
 const fields:[keyof Form,string,string][]=[
  ['projectPath','OMEGAv6 project path','Root-relative folder containing scripts/sar_r344_host_closure.py'],
  ['masterPath','Master SLC SAFE / ZIP','Root-relative exact master SLC'],
  ['slavePath','Slave SLC SAFE / ZIP','Root-relative exact slave SLC'],
  ['masterOrbitPath','Master orbit artifact','Root-relative precise/restituted orbit evidence'],
  ['slaveOrbitPath','Slave orbit artifact','Root-relative precise/restituted orbit evidence'],
  ['demPath','DEM artifact','Root-relative DEM used by the host chain'],
  ['coregProofPath','Coreg residual proof JSON','Must report full-resolution burst geometry and measured residuals'],
  ['interferogramPath','Interferogram artifact','Full-resolution wrapped phase artifact'],
  ['coherencePath','Coherence artifact','Full-resolution coherence artifact'],
  ['correctedInterferogramPath','Geometry-corrected interferogram','Flat-earth/topographic corrected phase artifact'],
  ['geometricPhaseProofPath','Geometry phase proof JSON','Proof that flat-earth and topographic phase were removed'],
  ['outputPath','SNAP output product','Root-relative BEAM-DIMAP output path'],
  ['receiptPath','R344 receipt output','Root-relative JSON returned to OMEGA']
 ];
 return <details className='r309-sar-assets r345-sar-hybrid' open>
  <summary><span><Cpu/><b>R345 · FULL-RESOLUTION HYBRID CLOSURE</b></span><small>{activeJob?.status||(!device?'NO HOST':capable?'READY':'HOST UPGRADE REQUIRED')}</small></summary>
  <div className='r345-grid'>
   {recommendedLayer&&<article className='r345-status r346-frontier-hint'><span><b>R346 NEXT · {recommendedLayer.replaceAll('_',' ')}</b><small>{recommendedFields.length?'Highlighted fields are the exact governed R345 spec inputs associated with the current frontier action.':'This frontier action has no direct R345 host-path fields.'}</small></span><ShieldCheck/></article>}
   <article className='r345-status'><span><b>{device?.name||'No selected Hybrid host'}</b><small>{device?.online?'authenticated heartbeat current':'DEVICE_PROOF_REQUIRED'} · capability {capable?'SAR_R344_CLOSURE advertised':'not advertised'} · shared R238 epoch</small></span>{capable?<CheckCircle2/>:<TriangleAlert/>}</article>
   <article className='r345-status'><span><b>{masterProductId||'master not selected'} → {slaveProductId||'reference not selected'}</b><small>{polarization||'no polarization'} · {masterAcquired||'master time unavailable'} → {slaveAcquired||'slave time unavailable'}</small></span><ShieldCheck/></article>
   <section className='r345-form'>
    {fields.map(([key,label,hint])=><label key={key} className={recommended.has(String(key))?'r346-recommended':''}><span>{label}<small>{hint}</small></span><input value={String(form[key]??'')} onChange={e=>set(key,e.target.value as any)} placeholder='root-relative path'/></label>)}
    <label><span>Subswath<small>TOPS IW sub-swath</small></span><select value={form.subswath} onChange={e=>set('subswath',e.target.value as any)}><option>IW1</option><option>IW2</option><option>IW3</option></select></label>
    <label><span>First burst<small>Inclusive</small></span><input type='number' min={1} max={999} value={form.firstBurst} onChange={e=>set('firstBurst',Number(e.target.value))}/></label>
    <label><span>Last burst<small>Inclusive</small></span><input type='number' min={1} max={999} value={form.lastBurst} onChange={e=>set('lastBurst',Number(e.target.value))}/></label>
    <label className='r345-check'><input type='checkbox' checked={form.executeGraph} onChange={e=>set('executeGraph',e.target.checked)}/><span>Execute promoted SNAP TOPS graph first<small>Graph success is computation only; residual/proof artifacts remain mandatory.</small></span></label>
   </section>
   <details className='r345-optional'><summary>Optional unwrap / correction / LOS return artifacts</summary><div>{([
    ['previewJsonPath','Hash-linked preview JSON'],['unwrapPath','Unwrapped phase'],['unwrapMaskPath','Unwrap mask'],['unwrapProofPath','Unwrap closure proof'],['atmospherePath','Atmosphere correction'],['etadPath','ETAD correction'],['losPath','Raw LOS'],['correctedLosPath','Corrected LOS']
   ]as [keyof Form,string][]).map(([key,label])=><label key={key}><span>{label}</span><input value={String(form[key]??'')} onChange={e=>set(key,e.target.value as any)} placeholder='optional root-relative path'/></label>)}</div></details>
   <article className='r345-validation'><span><b>{localValidation.passed?'STRUCTURED PLAN PASS':'PLAN HELD'}</b><small>{localValidation.passed?'All supplied paths are root-relative and the SAR closure structure is admissible.':localValidation.errors.join(' · ')}</small></span>{localValidation.passed?<CheckCircle2/>:<TriangleAlert/>}</article>
   <label className='r345-confirm'><input type='checkbox' checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>I explicitly authorize this full-resolution host computation on the selected authenticated device. Missing evidence must remain held.</span></label>
   <div className='r345-actions'><button type='button' onClick={()=>void refresh()}><RefreshCw/>Refresh host proof</button><button type='button' className='primary' onClick={()=>void queue()} disabled={busy||!pairReady||!complete||!confirmed||!capable||!localValidation.passed}><Play/>{busy?'Queueing…':'Run R344 closure on host'}</button></div>
   {jobId&&<article className='r345-job'><span><b>{jobId}</b><small>{activeJob?.status||'awaiting shared snapshot'} · return {returned?.state||'proof pending'}</small></span><code>{returned?.receiptSha256||'R141/R344 receipt hash pending'}</code></article>}
   {message&&<p className='r345-message'>{message}</p>}
  </div>
  <footer><ShieldCheck/><span>R345 is orchestration, not new physical authority. It reuses R237 durable command admission, R240 bridge calculus, the authenticated R207/R243 host wrapper, the R344 driver, R141 exact return closure and R125-only Canon admission. A successful SNAP/process exit alone never establishes TOPS registration, unwrap, LOS or 3-D deformation.</span></footer>
 </details>
}
