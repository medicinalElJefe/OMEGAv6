import{useEffect,useMemo,useState}from'react';
import{ClockArrowUp,GitBranch,ShieldCheck,Waypoints}from'lucide-react';
import{compileProofBoundTemporalTraversalR355,R355_BOUNDARY,selectTemporalSceneR355,type ProofBoundTemporalTraversalR355}from'./system/proofBoundTemporalTraversalR355';
import'./omegaProofBoundTemporalTraversalR355.css';

const short=(x:any,n=14)=>String(x||'—').slice(0,n);
export default function OmegaProofBoundTemporalTraversalR355(){
 const[data,setData]=useState<ProofBoundTemporalTraversalR355|null>(null),[tick,setTick]=useState(4),[error,setError]=useState('');
 useEffect(()=>{let live=true;(async()=>{try{
  const get=async(path:string)=>{const r=await fetch(path,{cache:'no-store',headers:{'cache-control':'no-cache','pragma':'no-cache'}});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()};
  const[releaseEvidence,runtimeAttestation,buildReceipt]=await Promise.all([get('/api/release-evidence'),get('/api/runtime-attestation'),get('/omega-build-receipt.json')]);
  const next=await compileProofBoundTemporalTraversalR355({evidence:{releaseEvidence,runtimeAttestation,buildReceipt},steps:8,checkpointEvery:2,nowTick:4});
  if(live){setData(next);setTick(next.nowTick);setError('')}
 }catch(e){try{const fallback=await compileProofBoundTemporalTraversalR355({steps:8,checkpointEvery:2,nowTick:4});if(live)setData(fallback)}catch{}if(live)setError(e instanceof Error?e.message:String(e))}})();return()=>{live=false}},[]);
 const selected=useMemo(()=>data?selectTemporalSceneR355(data,tick):null,[data,tick]),scene=selected?.scene,node=selected?.node;
 return <section className='r355-traversal' data-r355-traversal={data?.schema||'PENDING'}>
  <header><div><span>R355 · PROOF-BOUND TEMPORAL SCENE TRAVERSAL</span><h3>One verified scene chain across model HISTORY → NOW → FORECAST</h3><p>Every integer tick is an R354 scene receipt, ordered and digest-chained without creating a second timeline, renderer, Canon, or production authority.</p></div><Waypoints/></header>
  <div className='r355-summary'>
   <article><GitBranch/><span><small>TRAVERSAL DIGEST</small><b>{short(data?.traversalDigest,20)}</b><em>{data?.nodes.length||0} proof-bound scene nodes</em></span></article>
   <article><ShieldCheck/><span><small>CHAIN INTEGRITY</small><b>{data?.proof.linkIntegrity&&data?.proof.lineageStable?'PASS':'—'}</b><em>R354 scene digests + stable release lineage</em></span></article>
   <article><ClockArrowUp/><span><small>SELECTED MODEL TIME</small><b>{scene?`tick ${scene.tick} · ${scene.relation}`:'—'}</b><em>scene {short(scene?.sceneDigest,18)}</em></span></article>
  </div>
  <div className='r355-slider'><label>MODEL-TIME ADDRESS <b>{tick}</b></label><input aria-label='R355 model-time address' type='range' min='0' max={data?.steps||8} step='1' value={tick} onChange={e=>setTick(Number(e.target.value))}/></div>
  <div className='r355-track'>{data?.nodes.map(n=><button key={n.tick} className={n.tick===tick?'active':''} onClick={()=>setTick(n.tick)}><small>{n.relation}</small><b>{n.tick}</b><span>{short(n.linkDigest,8)}</span></button>)}</div>
  {node&&<div className='r355-chain'><span><small>PREVIOUS</small><b>{short(node.previousLinkDigest,16)}</b></span><i>→</i><span><small>FIELD</small><b>{short(node.fieldHash,16)}</b></span><i>→</i><span><small>FRAME</small><b>{short(node.frameReceiptHash,16)}</b></span><i>→</i><span><small>SCENE</small><b>{short(node.sceneDigest,16)}</b></span><i>→</i><span><small>LINK</small><b>{short(node.linkDigest,16)}</b></span></div>}
  {error&&<div className='r355-hold'>CURRENT RUNTIME PROOF HOLD · {error} · model traversal remains deterministic but not current-runtime authoritative.</div>}
  <footer><ShieldCheck/><span>{R355_BOUNDARY}</span></footer>
 </section>;
}
