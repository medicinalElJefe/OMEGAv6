import{useEffect,useMemo,useState}from'react';
import{GitCommitHorizontal,History,ShieldCheck,Waypoints}from'lucide-react';
import{compileReleaseLineageR353,releaseLineageSha256R353,R353_BOUNDARY,type ReleaseLineageR353}from'./system/releaseLineageR353';
import'./omegaReleaseLineageR353.css';

const short=(x:any,n=12)=>String(x||'—').slice(0,n);
const when=(x:string)=>{try{return new Date(x).toISOString().replace('T',' ').replace('.000Z','Z')}catch{return x}};

export default function OmegaReleaseLineageR353(){
 const[lineage,setLineage]=useState<ReleaseLineageR353>(()=>compileReleaseLineageR353()),[digest,setDigest]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let live=true;(async()=>{try{
  const get=async(path:string)=>{const r=await fetch(path,{cache:'no-store',headers:{'cache-control':'no-cache','pragma':'no-cache'}});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()};
  const[releaseEvidence,runtimeAttestation,buildReceipt]=await Promise.all([get('/api/release-evidence'),get('/api/runtime-attestation'),get('/omega-build-receipt.json')]);
  const next=compileReleaseLineageR353({releaseEvidence,runtimeAttestation,buildReceipt});const hash=await releaseLineageSha256R353(next);
  if(live){setLineage(next);setDigest(hash);setError('')}
 }catch(e){if(live){const next=compileReleaseLineageR353();setLineage(next);setDigest('');setError(e instanceof Error?e.message:String(e))}}})();return()=>{live=false}},[]);
 const current=useMemo(()=>lineage.nodes.find(x=>x.currentLive)||null,[lineage]);
 return <section className='r353-lineage' data-r353-lineage='OMEGA_RELEASE_LINEAGE_PROVENANCE_R353' data-r353-state={lineage.state}>
  <header><div><span>R353 · RELEASE LINEAGE / PROVENANCE SCARS</span><h3>Built → proved → promoted → superseded, without stale authority carry</h3><p>Historical receipts remain queryable evidence of their own bounded release. Only matching current package, release-evidence and R144 runtime attestation can occupy the live slot.</p></div><ShieldCheck/></header>
  <div className='r353-status'>
   <article><GitCommitHorizontal/><span><small>CURRENT SOURCE</small><b>{current?short(current.sha,16):'HOLD'}</b><em>{current?.revision||'no first-hand current binding'}</em></span></article>
   <article><Waypoints/><span><small>WORKER BINDING</small><b>{lineage.currentWorkerVersion?short(lineage.currentWorkerVersion,18):'HOLD'}</b><em>{lineage.receiptBinding.workerMatch?'release ↔ attestation match':'not current-bound'}</em></span></article>
   <article><ShieldCheck/><span><small>PACKAGE RECEIPT</small><b>{lineage.receiptBinding.receiptMatch?'BOUND':'HOLD'}</b><em>{short(lineage.receiptBinding.receiptSha256,18)}</em></span></article>
   <article><History/><span><small>LINEAGE SHA-256</small><b>{digest?short(digest,18):'PENDING'}</b><em>{lineage.nodes.length} canonical/current nodes · {lineage.scars.length} scars</em></span></article>
  </div>
  {error&&<div className='r353-hold'>CURRENT PROOF HOLD · {error} · historical lineage remains visible but receives no live authority.</div>}
  <div className='r353-timeline' aria-label='R353 canonical release lineage'>{lineage.nodes.map(node=><article key={node.sha} className={node.currentLive?'current':'historical'}>
    <div className='r353-node-head'><span>{node.revision}</span><strong>{node.authority}</strong></div><b>{node.title}</b><code>{node.sha}</code><small>{when(node.date)} · production run {node.productionRunId??'dynamic'}</small><p>{node.scar}</p>{node.supersededBy&&<em>superseded by {short(node.supersededBy,14)}</em>}
   </article>)}</div>
  <div className='r353-donors'><h4>Historical provenance donors</h4>{lineage.donors.map(d=><article key={d.source}><b>{d.source}</b><span>{d.role}</span><strong>{d.authority}</strong></article>)}</div>
  <footer><ShieldCheck/><span>{R353_BOUNDARY}</span></footer>
 </section>;
}
