import {useEffect,useState} from 'react';
import {CheckCircle2,FileCheck2,GitCommitHorizontal,RefreshCw,ShieldCheck} from 'lucide-react';

type Promotion={candidateSha?:string|null;promotedMergeSha?:string|null;rollbackSha?:string|null;authority?:string};
type Receipt={schema?:string;state?:string;generatedAt?:string;source?:{repository?:string;sha?:string;branch?:string;role?:string};promotion?:Promotion;qa?:{required?:string;upstreamGate?:string};package?:{builder?:string;output?:string;portable?:boolean;appDeploy?:boolean};deployment?:{authority?:string;canonicalUrl?:string;publicWorkerMutationAuthority?:boolean};workflow?:{runId?:string;runNumber?:string;name?:string};truthBoundary?:string;receiptSha256?:string};
type ReleaseEvidence={schema?:string;canonicalUrl?:string;source?:Receipt['source'];promotionLineage?:Promotion;packageReceipt?:{schema?:string;receiptSha256?:string;state?:string;workflow?:Receipt['workflow']};runtimeVersion?:{id?:string;tag?:string|null;timestamp?:string|null};runtimeAuthority?:{cloudflareVersionMetadata?:string;publicWorkerMutationAuthority?:boolean};externalGates?:{candidateQa?:string;postDeployVerification?:string;rollback?:string};truthBoundary?:string;evidenceSha256?:string;returnedAt?:string};

const trim=(value?:string|null,n=14)=>!value?'UNAVAILABLE':value.length>n?`${value.slice(0,n)}…`:value;

export default function GovernedBuildReceiptPanel(){
 const[receipt,setReceipt]=useState<Receipt|null>(null),[evidence,setEvidence]=useState<ReleaseEvidence|null>(null),[live,setLive]=useState<any>(null),[error,setError]=useState('');
 const refresh=async()=>{setError('');try{const[r,e,s]=await Promise.all([fetch('/omega-build-receipt.json',{cache:'no-store'}),fetch('/api/release-evidence',{cache:'no-store'}),fetch('/api/status',{cache:'no-store'})]);if(!r.ok)throw new Error(`build receipt HTTP ${r.status}`);if(!e.ok)throw new Error(`release evidence HTTP ${e.status}`);if(!s.ok)throw new Error(`status HTTP ${s.status}`);setReceipt(await r.json());setEvidence(await e.json());setLive(await s.json())}catch(err:any){setError(err?.message||String(err))}};
 useEffect(()=>{void refresh()},[]);
 const sha=receipt?.source?.sha||'UNAVAILABLE',version=evidence?.runtimeVersion?.id||'UNAVAILABLE',lineage=evidence?.promotionLineage||receipt?.promotion;
 const receiptBound=Boolean(receipt?.receiptSha256&&evidence?.packageReceipt?.receiptSha256===receipt.receiptSha256);
 const canonicalBound=Boolean(evidence?.canonicalUrl&&receipt?.deployment?.canonicalUrl===evidence.canonicalUrl);
 const lineageBound=Boolean(lineage?.authority==='GITHUB_MERGE_PARENTS'&&lineage.candidateSha&&lineage.promotedMergeSha&&lineage.rollbackSha);
 const timeline=[
  {label:'1 · Packaged source',value:sha,state:sha==='UNAVAILABLE'?'HOLD':'BOUND'},
  {label:'2 · Candidate head',value:lineage?.candidateSha||'EXTERNAL_RELEASE_LEDGER_REQUIRED',state:lineageBound?'BOUND':'EXTERNAL'},
  {label:'3 · Candidate QA',value:evidence?.externalGates?.candidateQa||receipt?.qa?.upstreamGate||'EXTERNAL_GITHUB_EVIDENCE_REQUIRED',state:'EXTERNAL'},
  {label:'4 · Package receipt',value:receipt?.receiptSha256||'UNAVAILABLE',state:receiptBound?'BOUND':'HOLD'},
  {label:'5 · Promoted merge',value:lineage?.promotedMergeSha||'EXTERNAL_RELEASE_LEDGER_REQUIRED',state:lineageBound?'BOUND':'EXTERNAL'},
  {label:'6 · Runtime version',value:version,state:version==='UNAVAILABLE'?'HOLD':'BOUND'},
  {label:'7 · Canonical verify',value:evidence?.externalGates?.postDeployVerification||'EXTERNAL_FIRST_HAND_PROBE_REQUIRED',state:canonicalBound?'TARGET_BOUND':'HOLD'},
  {label:'8 · Rollback',value:lineage?.rollbackSha||evidence?.externalGates?.rollback||'EXTERNAL_RELEASE_LEDGER_REQUIRED',state:lineageBound?'BOUND':'EXTERNAL'}
 ];
 return <section className='panel governed-build-receipt'><div className='section-head'><div><p className='overline'>GOVERNED EXTERNAL BUILD SPINE · READ ONLY</p><h2>Source → candidate → QA → package → promotion → runtime evidence</h2></div><button onClick={()=>void refresh()} aria-label='Refresh governed build receipt'><RefreshCw size={16}/>Refresh</button></div>{error?<div className='boundary'><ShieldCheck size={15}/>RECEIPT UNAVAILABLE · {error}</div>:receipt&&evidence?<><div className='buildout-score'><div><span>Package state</span><b>{receipt.state||'UNKNOWN'}</b></div><div><span>Packaged source</span><b>{trim(sha,12)}</b></div><div><span>Merge lineage</span><b>{lineageBound?'BOUND':'EXTERNAL'}</b></div><div><span>Receipt link</span><b>{receiptBound?'MATCH':'HOLD'}</b></div><div><span>Worker version</span><b>{trim(version,12)}</b></div><div><span>Runtime</span><b>{live?.ok===false?'DEGRADED':'RETURNED'}</b></div></div><div className='buildout-lanes'><article><GitCommitHorizontal/><b>EXACT PACKAGED SOURCE</b><p>{receipt.source?.repository} · {sha}</p></article><article><CheckCircle2/><b>MERGE ANCESTRY</b><p>{lineageBound?`candidate ${trim(lineage?.candidateSha)} → merge ${trim(lineage?.promotedMergeSha)} · rollback ${trim(lineage?.rollbackSha)}`:'Candidate/promoted/rollback ancestry remains external until a governed merge-parent receipt supplies it.'}</p></article><article><FileCheck2/><b>RELEASE EVIDENCE</b><p>{evidence.evidenceSha256||'UNAVAILABLE'} · version {version}</p></article></div><div className='release-evidence-timeline' aria-label='Release evidence timeline'>{timeline.map(step=><article key={step.label} className='release-evidence-step'><span>{step.label}</span><b>{step.state}</b><p title={step.value}>{trim(step.value,28)}</p></article>)}</div><div className='boundary'><ShieldCheck size={15}/>{evidence.truthBoundary}</div></>:<div className='boundary'><ShieldCheck size={15}/>Loading governed release evidence…</div>}</section>
}
