import{useEffect,useMemo,useState}from'react';
import{Cpu,Play,RefreshCw,ShieldCheck,TriangleAlert}from'lucide-react';
import{api}from'./platformAdapter';
import{useHybridRuntimeSnapshotR238}from'./HybridRuntimeSnapshotR238';
import type{SarHostClosureReceiptR344}from'./sarHostClosureR344';

export const SAR_OPERATIONAL_SCHEMA_R345='OMEGA_SAR_OPERATIONAL_ORCHESTRATION_R345';
const ACTIVE=new Set(['QUEUED','RUNNING']);
const safeRelative=(value:unknown)=>{const s=String(value??'').trim().replace(/\\/g,'/');return!!s&&!s.startsWith('/')&&!/^[A-Za-z]:/.test(s)&&!s.split('/').includes('..')&&!s.includes('\0')};
const slug=(value:string)=>value.replace(/[^A-Za-z0-9._-]/g,'_').slice(0,48)||'pair';

type Props={masterId:string;slaveId:string;masterAcquired:string;slaveAcquired:string;polarization:string;onReceipt:(receipt:SarHostClosureReceiptR344)=>void};

export default function SarOperationalOrchestratorR345({masterId,slaveId,masterAcquired,slaveAcquired,polarization,onReceipt}:Props){
 const{hybrid,device,selectedDeviceJobs,observedAt,epoch,stale,refresh}=useHybridRuntimeSnapshotR238();
 const pairKey=useMemo(()=>slug(masterId)+'__'+slug(slaveId),[masterId,slaveId]);
 const template=useMemo(()=>({
  master:'',slave:'',masterOrbit:'',slaveOrbit:'',
  output:'.omega_hybrid/sar-r345/'+pairKey+'/tops.dim',
  coregProof:'.omega_hybrid/sar-r345/'+pairKey+'/coreg-proof.json',
  interferogram:'.omega_hybrid/sar-r345/'+pairKey+'/interferogram.tif',
  coherence:'.omega_hybrid/sar-r345/'+pairKey+'/coherence.tif',
  correctedInterferogram:'.omega_hybrid/sar-r345/'+pairKey+'/corrected-interferogram.tif',
  geometricPhaseProof:'.omega_hybrid/sar-r345/'+pairKey+'/geometric-phase-proof.json',
  receipt:'.omega_hybrid/sar-r345/'+pairKey+'/r344-receipt.json',
  demArtifact:'',unwrap:'',unwrapMask:'',unwrapProof:'',atmosphere:'',etad:'',otherCorrection:'',
  los:'',correctedLos:'',beta0:'',sigma0:'',gamma0:'',terrainGamma0:'',independentLosJson:'',
  deformationEast:'',deformationNorth:'',deformationUp:'',deformationProof:'',previewJson:'',
  demName:'Copernicus 30m Global DEM',subswath:'IW2',firstBurst:1,lastBurst:999,execute:false
 }),[pairKey]);
 const[text,setText]=useState(()=>JSON.stringify(template,null,2)),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>setText(JSON.stringify(template,null,2)),[template]);
 const advertised=useMemo(()=>new Set(Array.isArray(device?.capabilities)?device.capabilities:[]),[device]);
 const activeJob=selectedDeviceJobs.find((x:any)=>ACTIVE.has(String(x?.status||'').toUpperCase()))||null;
 const returned=useMemo(()=>[...selectedDeviceJobs].reverse().find((x:any)=>String(x?.action||'')==='SAR_R344_CLOSURE'&&['RETURNED','VERIFIED','COMPLETED','SUCCEEDED'].includes(String(x?.status||'').toUpperCase()))||null,[selectedDeviceJobs]);
 useEffect(()=>{if(!returned)return;const proofs=returned?.result?.stepProofs||returned?.stepProofs||returned?.returnPacket?.stepProofs||[];const hit=[...proofs].reverse().find((x:any)=>x?.op==='SAR_R344_CLOSURE'&&x?.ok===true&&x?.result?.receiptJson);if(!hit?.result?.receiptJson)return;try{const receipt=JSON.parse(hit.result.receiptJson);if(receipt?.schema==='OMEGA_SAR_HOST_CLOSURE_R344'){onReceipt(receipt);setMessage('R345 imported returned R344 receipt from '+returned.id+' · SHA-256 '+(hit.result.receiptSha256||'returned')+'.')}}catch{}},[returned?.id,onReceipt]);
 const parsed=useMemo(()=>{try{return{ok:true,value:JSON.parse(text),error:''}}catch(e:any){return{ok:false,value:null,error:e?.message||String(e)}}},[text]);
 const manifestErrors=useMemo(()=>{if(!parsed.ok)return[parsed.error];const q=parsed.value||{},errs:string[]=[];for(const k of['master','slave','masterOrbit','slaveOrbit','output','coregProof','interferogram','coherence','correctedInterferogram','geometricPhaseProof','receipt'])if(!safeRelative(q[k]))errs.push(k+' must be a relative path inside the paired root');if(q.master===q.slave&&q.master)errs.push('master and slave paths must differ');if(!['IW1','IW2','IW3'].includes(String(q.subswath||'').toUpperCase()))errs.push('subswath must be IW1/IW2/IW3');return errs},[parsed]);
 const ready=Boolean(masterId&&slaveId&&masterAcquired&&slaveAcquired&&device?.online&&!device?.revoked&&!stale&&epoch>0&&hybrid?.nativeExecutionClaimed===true&&advertised.has('SAR_R344_CLOSURE')&&!activeJob&&manifestErrors.length===0);
 const queue=async()=>{if(!ready||!parsed.value)return;setBusy(true);setError('');setMessage('');try{const q=parsed.value,r=await api.post<any>('/api/hybrid/jobs',{schema:SAR_OPERATIONAL_SCHEMA_R345,action:'SAR_R344_CLOSURE',profile:'AUTO_BUILD',projectPath:'.',instructions:'Execute only the checked-in R344 Sentinel-1 closure driver with the typed root-confined SAR request and return the R141-bound receipt proof.',allowedDomains:[],steps:[{id:'S01',op:'SAR_R344_CLOSURE',label:'Execute governed Sentinel-1 R344 closure',path:'.',sarRequest:{...q,masterAcquired,slaveAcquired,polarization:String(polarization||'').toUpperCase()}}],targetDeviceId:device.id,confirmed:true,snapshotEpoch:epoch,snapshotObservedAt:observedAt});if(!r.data?.job?.id)throw new Error('Worker returned no durable R345 job identity.');if(r.data.job.targetDeviceId&&r.data.job.targetDeviceId!==device.id)throw new Error('R345 job returned a different host identity.');setMessage('R345 queued '+r.data.job.id+' on '+(device.name||device.id)+'. Nothing is established until the host returns R141 proof and R344 validates the receipt.');await refresh()}catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}};
 return <details className='r309-sar-assets' open data-r345-operational='SAR_R344_CLOSURE'>
  <summary><span><Cpu/><b>R345 governed full-resolution SAR execution</b></span><small>{activeJob?(String(activeJob.status)+' · '+String(activeJob.id)):returned?(String(returned.status)+' · receipt candidate returned'):ready?'READY':'HELD'}</small></summary>
  <div>
   <article><span><b>SELECTED PAIR</b><small>{masterId||'master unbound'} → {slaveId||'slave unbound'} · {polarization||'pol unbound'}</small></span><code>{device?.online?'host '+(device.name||device.id):'authenticated Hybrid host required'}</code></article>
   <article><span><b>EXECUTION AUTHORITY</b><small>R237 queue · R141 exact return fingerprint · R344 physical validation</small></span><code>{advertised.has('SAR_R344_CLOSURE')?'SAR_R344_CLOSURE advertised':'host agent update required'}</code></article>
   <label style={{display:'grid',gap:6,width:'100%'}}><span>Root-confined R345 path manifest</span><textarea aria-label='R345 SAR host path manifest' rows={18} value={text} onChange={e=>setText(e.target.value)} spellCheck={false}/></label>
   {manifestErrors.length>0&&<p><TriangleAlert/> {manifestErrors.join(' · ')}</p>}
   {(message||error)&&<p>{error?<TriangleAlert/>:<ShieldCheck/>} {error||message}</p>}
  </div>
  <footer><ShieldCheck/><span>R345 does not expose arbitrary shell execution. The host may invoke only <code>scripts/sar_r344_host_closure.py</code> with validated relative paths. A successful process exit is still not physical proof; the returned receipt must pass R344.</span><button type='button' onClick={()=>void queue()} disabled={!ready||busy}><Play/>{busy?'Queueing…':activeJob?'Host busy':ready?'Run R344 closure on paired PC':'Execution held'}</button><button type='button' onClick={()=>void refresh()} disabled={busy}><RefreshCw/>Refresh host</button></footer>
 </details>
}
