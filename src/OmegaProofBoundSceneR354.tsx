import{useEffect,useState}from'react';
import{Clock3,Cpu,GitCommitHorizontal,Network,ShieldCheck}from'lucide-react';
import{compileProofBoundSceneR354,bindGpuCorrespondenceR354,R354_BOUNDARY,type ProofBoundSceneReceiptR354}from'./system/proofBoundSceneR354';
import{executeGpuRenderStateR352}from'./system/gpuComputeRuntimeR352';
import'./omegaProofBoundSceneR354.css';

const short=(x:any,n=16)=>String(x||'—').slice(0,n);
export default function OmegaProofBoundSceneR354(){
 const[scene,setScene]=useState<ProofBoundSceneReceiptR354|null>(null),[error,setError]=useState('');
 useEffect(()=>{let live=true;(async()=>{try{
  const get=async(path:string)=>{const r=await fetch(path,{cache:'no-store',headers:{'cache-control':'no-cache','pragma':'no-cache'}});if(!r.ok)throw new Error(`${path} HTTP ${r.status}`);return r.json()};
  const[releaseEvidence,runtimeAttestation,buildReceipt]=await Promise.all([get('/api/release-evidence'),get('/api/runtime-attestation'),get('/omega-build-receipt.json')]);
  const build=await compileProofBoundSceneR354({evidence:{releaseEvidence,runtimeAttestation,buildReceipt},steps:8,checkpointEvery:2,targetTick:4,nowTick:4});
  if(!live)return;setScene(build.scene);setError('');
  const gpu=await executeGpuRenderStateR352(build.mirror);if(live)setScene(await bindGpuCorrespondenceR354(build.scene,gpu));
 }catch(e){if(!live)return;try{const build=await compileProofBoundSceneR354({steps:8,checkpointEvery:2,targetTick:4,nowTick:4});setScene(build.scene)}catch{}setError(e instanceof Error?e.message:String(e))}})();return()=>{live=false}},[]);
 const proof=scene?.proof;
 return <section className='r354-scene' data-r354-scene='OMEGA_PROOF_BOUND_SCENE_CONVERGENCE_R354' data-r354-state={scene?.state||'PENDING'}>
  <header><div><span>R354 · PROOF-BOUND SCENE CONVERGENCE</span><h3>Release lineage → deterministic replay → packet mirror → derived render → optional GPU return</h3><p>One receipt now traces a displayed model scene back to its exact replayed field and current runtime provenance. GPU verification strengthens device-execution evidence only; it never becomes CanonState or physical truth.</p></div><Network/></header>
  <div className='r354-grid'>
   <article><GitCommitHorizontal/><span><small>RUNTIME BINDING</small><b>{scene?.state||'PENDING'}</b><em>{short(scene?.currentReleaseSha,18)} · {short(scene?.currentWorkerVersion,18)}</em></span></article>
   <article><Clock3/><span><small>MODEL-TIME ADDRESS</small><b>{scene?`tick ${scene.tick} · ${scene.relation}`:'—'}</b><em>field {short(scene?.fieldHash,18)} · replay from {scene?.sourceCheckpointTick??'—'}</em></span></article>
   <article><ShieldCheck/><span><small>PACKET / RENDER BIND</small><b>{proof?.packetExact&&proof?.packetInputBound?'PASS':'—'}</b><em>{scene?.packetCount?.toLocaleString?.()||'—'} packets · render {short(scene?.renderStateOutputHash,14)}</em></span></article>
   <article><Cpu/><span><small>DEVICE CORRESPONDENCE</small><b>{scene?.executionState||'PENDING'}</b><em>{scene?.gpu?.verified?`${scene.gpu.compared.toLocaleString()} floats · Δmax ${scene.gpu.maxAbsError?.toExponential(2)}`:scene?.gpu?.state||'GPU proof pending / unavailable'}</em></span></article>
  </div>
  <div className='r354-chain' aria-label='R354 proof-bound scene chain'>
   <span><small>LINEAGE</small><b>{short(scene?.releaseLineageSha256,14)}</b></span><i>→</i>
   <span><small>FIELD</small><b>{short(scene?.fieldHash,14)}</b></span><i>→</i>
   <span><small>PACKET</small><b>{short(scene?.packetHash,14)}</b></span><i>→</i>
   <span><small>RENDER</small><b>{short(scene?.renderStateOutputHash,14)}</b></span><i>→</i>
   <span><small>SCENE</small><b>{short(scene?.sceneDigest,14)}</b></span>
  </div>
  {error&&<div className='r354-hold'>CURRENT RUNTIME PROOF HOLD · {error} · deterministic model receipt remains visible without live authority.</div>}
  <footer><ShieldCheck/><span>{R354_BOUNDARY}</span></footer>
 </section>;
}
