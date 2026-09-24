import{useEffect,useMemo,useState}from'react';
import{ClockArrowUp,GitBranch,ShieldCheck,Waypoints}from'lucide-react';
import{R355_BOUNDARY,selectTemporalSceneR355,type ProofBoundTemporalTraversalR355}from'./system/proofBoundTemporalTraversalR355';
import'./omegaProofBoundTemporalTraversalR355.css';

const short=(x:any,n=14)=>String(x||'—').slice(0,n);

export default function OmegaProofBoundTemporalTraversalR355(){
 const[data,setData]=useState<ProofBoundTemporalTraversalR355|null>(null),[tick,setTick]=useState(4),[error,setError]=useState('');
 useEffect(()=>{
  let live=true;
  const worker=new Worker(new URL('./system/proofBoundTemporalTraversalWorkerR355.ts',import.meta.url),{type:'module'});
  const get=async(path:string)=>{const r=await fetch(path,{cache:'no-store',headers:{'cache-control':'no-cache','pragma':'no-cache'}});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()};
  worker.onmessage=event=>{
   if(!live)return;
   const msg=event.data;
   if(!msg?.ok){setError(String(msg?.error||'R355 traversal worker failed'));worker.terminate();return}
   const next=msg.traversal as ProofBoundTemporalTraversalR355;
   setData(next);setTick(next.nowTick);worker.terminate();
  };
  worker.onerror=event=>{if(live)setError(event.message||'R355 traversal worker error');worker.terminate()};
  (async()=>{
   let evidence:any={};
   try{
    const[releaseEvidence,runtimeAttestation,buildReceipt]=await Promise.all([get('/api/release-evidence'),get('/api/runtime-attestation'),get('/omega-build-receipt.json')]);
    evidence={releaseEvidence,runtimeAttestation,buildReceipt};
    if(live)setError('');
   }catch(e){
    if(live)setError(`${e instanceof Error?e.message:String(e)} · worker will return deterministic MODEL_ONLY_HOLD rather than block the interface`);
   }
   if(live)worker.postMessage({type:'COMPILE_R355_TRAVERSAL',evidence,steps:8,checkpointEvery:2,nowTick:4,orientations:[1,-1,1,0],transportRate:.125});
  })();
  return()=>{live=false;worker.terminate()};
 },[]);
 const selected=useMemo(()=>data?selectTemporalSceneR355(data,tick):null,[data,tick]),scene=selected?.scene,node=selected?.node;
 return <section className='r355-traversal' data-r355-traversal={data?.schema||'PENDING'} data-r355-ready={data?'RETURNED':error?'HOLD':'DEFERRED'} data-r355-execution='WORKER_ISOLATED'>
  <header><div><span>R355 · PROOF-BOUND TEMPORAL SCENE TRAVERSAL</span><h3>One verified scene chain across model HISTORY → NOW → FORECAST</h3><p>One parent field evolves once into one R350 timeline. Per-tick R354 receipts are derived from that shared continuity state in a worker so traversal computation cannot seize UI interaction.</p></div><Waypoints/></header>
  <div className='r355-summary'>
   <article><GitBranch/><span><small>TRAVERSAL DIGEST</small><b>{short(data?.traversalDigest,20)}</b><em>{data?.nodes.length||0} proof-bound scene nodes</em></span></article>
   <article><ShieldCheck/><span><small>CHAIN INTEGRITY</small><b>{data?.proof.linkIntegrity&&data?.proof.lineageStable&&data?.proof.singleTimelineReused?'PASS':'—'}</b><em>single timeline + R354 scene digests + stable release lineage</em></span></article>
   <article><ClockArrowUp/><span><small>SELECTED MODEL TIME</small><b>{scene?`tick ${scene.tick} · ${scene.relation}`:'—'}</b><em>scene {short(scene?.sceneDigest,18)}</em></span></article>
  </div>
  <div className='r355-slider'><label>MODEL-TIME ADDRESS <b>{tick}</b></label><input aria-label='R355 model-time address' type='range' min='0' max={data?.steps||8} step='1' value={tick} onChange={e=>setTick(Number(e.target.value))}/></div>
  <div className='r355-track'>{data?.nodes.map(n=><button type='button' key={n.tick} className={n.tick===tick?'active':''} onClick={()=>setTick(n.tick)}><small>{n.relation}</small><b>{n.tick}</b><span>{short(n.linkDigest,8)}</span></button>)}</div>
  {node&&<div className='r355-chain'><span><small>PREVIOUS</small><b>{short(node.previousLinkDigest,16)}</b></span><i>→</i><span><small>FIELD</small><b>{short(node.fieldHash,16)}</b></span><i>→</i><span><small>FRAME</small><b>{short(node.frameReceiptHash,16)}</b></span><i>→</i><span><small>SCENE</small><b>{short(node.sceneDigest,16)}</b></span><i>→</i><span><small>LINK</small><b>{short(node.linkDigest,16)}</b></span></div>}
  {error&&<div className='r355-hold'>CURRENT RUNTIME PROOF HOLD · {error}</div>}
  <footer><ShieldCheck/><span>{R355_BOUNDARY}</span></footer>
 </section>;
}
