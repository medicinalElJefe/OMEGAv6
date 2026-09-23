import{useEffect,useState}from'react';
import{Cpu,MonitorUp,ShieldCheck,TimerReset}from'lucide-react';
import{executeGpuRenderStateR352,gpuComputePlanR352}from'./system/gpuComputeRuntimeR352';
import type{PacketMirrorR351}from'./system/gpuPacketMirrorR351';
import'./omegaGpuComputeR352.css';

type WorkerModel={mirror:PacketMirrorR351;receipt:any};
export default function OmegaGpuComputeR352(){
 const[model,setModel]=useState<WorkerModel|null>(null),[proof,setProof]=useState<any>({state:'PENDING'}),[error,setError]=useState('');
 useEffect(()=>{
  let live=true;
  const worker=new Worker(new URL('./system/gpuPacketWorkerR351.ts',import.meta.url),{type:'module'});
  worker.onmessage=async event=>{
   if(!live)return;
   const msg=event.data;
   if(!msg?.ok){setError(String(msg?.error||'R352 source mirror failed'));setProof({state:'SOURCE_MIRROR_FAILED'});worker.terminate();return}
   const next={mirror:msg.mirror,receipt:msg.receipt};setModel(next);worker.terminate();
   setProof({state:'GPU_COMPUTE_PENDING',plan:gpuComputePlanR352(next.mirror)});
   const result=await executeGpuRenderStateR352(next.mirror);if(live)setProof(result);
  };
  worker.onerror=e=>{if(live){setError(e.message||'R352 packet worker error');setProof({state:'SOURCE_MIRROR_FAILED'})}worker.terminate()};
  worker.postMessage({type:'COMPILE_PACKET_MIRROR'});
  return()=>{live=false;worker.terminate()};
 },[]);
 const plan=proof?.plan||(model?gpuComputePlanR352(model.mirror):null),match=proof?.correspondence;
 return <section className='r352-compute' data-r352-compute='OMEGA_WEBGPU_COMPUTE_RENDER_STATE_R352' data-r352-state={proof.state||'PENDING'}>
  <header><div><span>R352 · WEBGPU COMPUTE / STATE UPLOADER</span><h3>Canonical packet mirror → WGSL compute → readback → CPU correspondence proof</h3><p>The GPU computes only derived render state. Canonical R349/R350 state is immutable. A returned GPU result is accepted only when every Float32 matches the independent CPU reference within the declared tolerance.</p></div><Cpu/></header>
  <div className='r352-grid'>
   <article><Cpu/><span><small>DISPATCH</small><b>{plan?plan.workgroupCount:'—'} workgroups</b><em>{plan?`${plan.packetCount.toLocaleString()} packets · ${plan.workgroupSize} threads/group`:'source mirror pending'}</em></span></article>
   <article><MonitorUp/><span><small>GPU RETURN</small><b>{proof.state||'PENDING'}</b><em>{match?.ok===true?'CPU↔GPU FLOAT MATCH':match===null?'device evidence unavailable':'verification pending / failed'}</em></span></article>
   <article><ShieldCheck/><span><small>CORRESPONDENCE</small><b>{match?.ok===true?'PASS':match?.ok===false?'FAIL':'—'}</b><em>{match?.compared?.toLocaleString?.()||'0'} floats · max |Δ| {Number.isFinite(match?.maxAbsError)?Number(match.maxAbsError).toExponential(2):'—'} · tolerance {match?.tolerance??'2e-6'}</em></span></article>
   <article><TimerReset/><span><small>RETURN WALL LATENCY</small><b>{Number.isFinite(proof?.gpu?.returnedWallMs)?`${proof.gpu.returnedWallMs.toFixed(1)} ms`:'—'}</b><em>host wall return only · not GPU kernel timing</em></span></article>
  </div>
  <div className='r352-receipt'><span>shader {plan?.shaderHash||'pending'}</span><span>input {plan?.inputHash||'pending'}</span><span>CPU {proof?.cpu?.outputHash||'pending'}</span><span>GPU {proof?.gpu?.outputHash||'unreturned'}</span></div>
  {error&&<div className='r352-error'>{error}</div>}
  <footer><b>Truth boundary</b><span>{proof?.boundary||'R352 proves only bounded software/device execution correspondence for derived render state. It does not mutate CanonState or prove physical simulation.'}</span></footer>
 </section>;
}
