import {useEffect,useState} from 'react';
import {CheckCircle2,FileCheck2,GitCommitHorizontal,RefreshCw,ShieldCheck} from 'lucide-react';

type Receipt={schema?:string;state?:string;generatedAt?:string;source?:{repository?:string;sha?:string;branch?:string};qa?:{required?:string;upstreamGate?:string};package?:{builder?:string;output?:string;portable?:boolean;appDeploy?:boolean};deployment?:{authority?:string;canonicalUrl?:string;publicWorkerMutationAuthority?:boolean};workflow?:{runId?:string;runNumber?:string;name?:string};truthBoundary?:string;receiptSha256?:string};
type ReleaseEvidence={schema?:string;canonicalUrl?:string;source?:Receipt['source'];packageReceipt?:{schema?:string;receiptSha256?:string;state?:string;workflow?:Receipt['workflow']};runtimeVersion?:{id?:string;tag?:string|null;timestamp?:string|null};runtimeAuthority?:{cloudflareVersionMetadata?:string;publicWorkerMutationAuthority?:boolean};externalGates?:{candidateQa?:string;postDeployVerification?:string;rollback?:string};truthBoundary?:string;evidenceSha256?:string;returnedAt?:string};

const trim=(value?:string,n=14)=>!value?'UNAVAILABLE':value.length>n?`${value.slice(0,n)}…`:value;

export default function GovernedBuildReceiptPanel(){
 const[receipt,setReceipt]=useState<Receipt|null>(null),[evidence,setEvidence]=useState<ReleaseEvidence|null>(null),[live,setLive]=useState<any>(null),[error,setError]=useState('');
 const refresh=async()=>{setError('');try{const[r,e,s]=await Promise.all([fetch('/omega-build-receipt.json',{cache:'no-store'}),fetch('/api/release-evidence',{cache:'no-store'}),fetch('/api/status',{cache:'no-store'})]);if(!r.ok)throw new Error(`build receipt HTTP ${r.status}`);if(!e.ok)throw new Error(`release evidence HTTP ${e.status}`);if(!s.ok)throw new Error(`status HTTP ${s.status}`);setReceipt(await r.json());setEvidence(await e.json());setLive(await s.json())}catch(err:any){setError(err?.message||String(err))}};
 useEffect(()=>{void refresh()},[]);
 const sha=receipt?.source?.sha||'UNAVAILABLE',version=evidence?.runtimeVersion?.id||'UNAVAILABLE';
 const receiptBound=Boolean(receipt?.receiptSha256&&evidence?.packageReceipt?.receiptSha256===receipt.receiptSha256);
 const canonicalBound=Boolean(evidence?.canonicalUrl&&receipt?.deployment?.canonicalUrl===evidence.canonicalUrl);
 const timeline=[
  {label:'1 · Source',value:sha,state:sha==='UNAVAILABLE'?'HOLD':'BOUND'},
  {label:'2 · Candidate QA',value:evidence?.externalGates?.candidateQa||receipt?.qa?.upstreamGate||'EXTERNAL_GITHUB_EVIDENCE_REQUIRED',state:'EXTERNAL'},
  {label:'3 · Package receipt',value:receipt?.receiptSha256||'UNAVAILABLE',state:receiptBound?'BOUND':'HOLD'},
  {label:'4 · Runtime version',value:version,state:version==='UNAVAILABLE'?'HOLD':'BOUND'},
  {label:'5 · Canonical verify',value:evidence?.externalGates?.postDeployVerification||'EXTERNAL_FIRST_HAND_PROBE_REQUIRED',state:canonicalBound?'TARGET_BOUND':'HOLD'},
  {label:'6 · Rollback',value:evidence?.externalGates?.rollback||'EXTERNAL_RELEASE_LEDGER_REQUIRED',state:'EXTERNAL'}
 ];
 return <section className='panel governed-build-receipt'><div className='section-head'><div><p className='overline'>GOVERNED EXTERNAL BUILD SPINE · READ ONLY</p><h2>Source → QA → package → runtime evidence</h2></div><button onClick={()=>void refresh()} aria-label='Refresh governed build receipt'><RefreshCw size={16}/>Refresh</button></div>{error?<div className='boundary'><ShieldCheck size={15}/>RECEIPT UNAVAILABLE · {error}</div>:receipt&&evidence?<><div className='buildout-score'><div><span>Package state</span><b>{receipt.state||'UNKNOWN'}</b></div><div><span>Source</span><b>{trim(sha,12)}</b></div><div><span>QA gate</span><b>{receipt.qa?.upstreamGate||'UNKNOWN'}</b></div><div><span>Receipt link</span><b>{receiptBound?'MATCH':'HOLD'}</b></div><div><span>Worker version</span><b>{trim(version,12)}</b></div><div><span>Runtime</span><b>{live?.ok===false?'DEGRADED':'RETURNED'}</b></div></div><div className='buildout-lanes'><article><GitCommitHorizontal/><b>EXACT SOURCE</b><p>{receipt.source?.repository} · {sha}</p></article><article><CheckCircle2/><b>PACKAGE → RUNTIME</b><p>{receiptBound?'Receipt SHA-256 is bound to the executing Cloudflare version metadata.':'Receipt/version binding unavailable or mismatched.'}</p></article><article><FileCheck2/><b>RELEASE EVIDENCE</b><p>{evidence.evidenceSha256||'UNAVAILABLE'} · version {version}</p></article></div><div className='release-evidence-timeline' aria-label='Release evidence timeline'>{timeline.map(step=><article key={step.label} className='release-evidence-step'><span>{step.label}</span><b>{step.state}</b><p title={step.value}>{trim(step.value,28)}</p></article>)}</div><div className='boundary'><ShieldCheck size={15}/>{evidence.truthBoundary}</div></>:<div className='boundary'><ShieldCheck size={15}/>Loading governed release evidence…</div>}</section>
}
