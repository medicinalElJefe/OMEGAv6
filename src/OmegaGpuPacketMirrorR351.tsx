import{useEffect,useState}from'react';
import{Cpu,MonitorUp,ShieldCheck}from'lucide-react';
import{gpuUploadReadbackProofR351,probeGpuR351,type PacketMirrorR351}from'./system/gpuPacketMirrorR351';
import'./omegaGpuPacketMirrorR351.css';

type Model={mirror:PacketMirrorR351;receipt:any;restart:any};

export default function OmegaGpuPacketMirrorR351(){
 const[model,setModel]=useState<Model|null>(null),[gpu,setGpu]=useState<any>({state:'PROBE_DEFERRED'}),[roundtrip,setRoundtrip]=useState<any>({state:'PENDING'}),[error,setError]=useState('');
 useEffect(()=>{
  let live=true;
  const worker=new Worker(new URL('./system/gpuPacketWorkerR351.ts',import.meta.url),{type:'module'});
  worker.onmessage=async(event)=>{
   if(!live)return;
   const msg=event.data;
   if(!msg?.ok){setError(String(msg?.error||'R351 packet worker failed'));setRoundtrip({state:'CPU_MIRROR_FAILED'});worker.terminate();return}
   const next={mirror:msg.mirror,receipt:msg.receipt,restart:msg.restart} as Model;
   setModel(next);
   worker.terminate();
   const p=await probeGpuR351();
   if(!live)return;
   setGpu(p);
   if(!p.available){setRoundtrip({state:'GPU_EXECUTION_UNAVAILABLE',correspondence:null});return}
   setRoundtrip({state:'GPU_EXECUTION_PENDING',correspondence:null});
   const r=await gpuUploadReadbackProofR351(next.mirror);
   if(live)setRoundtrip(r);
  };
  worker.onerror=event=>{if(live){setError(event.message||'R351 packet worker error');setRoundtrip({state:'CPU_MIRROR_FAILED'})}worker.terminate()};
  worker.postMessage({type:'COMPILE_PACKET_MIRROR'});
  return()=>{live=false;worker.terminate()};
 },[]);
 const packet=model?.receipt?.packet;
 return <section className='r351-gpu' data-r351-gpu='OMEGA_GPU_PACKET_MIRROR_R351' data-r351-ready={model?'RETURNED':'DEFERRED'}>
  <header><div><span>R351 · GPU PACKET MIRROR</span><h3>20,736 typed packets → 20,735 transition edges → ancestry → frame receipt</h3><p>CPU mirror compilation is isolated from the UI thread. CPU state remains the deterministic reference. WebGPU is used only when the browser actually returns an adapter/device; upload/readback correspondence is device execution evidence, not scientific or physical validation.</p></div><Cpu/></header>
  <div className='r351-grid'>
   <article><Cpu/><span><small>PACKET MIRROR</small><b>{packet?packet.packetCount.toLocaleString():'20,736 queued'}</b><em>{packet?`${packet.channelCount} channels · hash ${packet.packetHash}`:'worker compilation deferred from route readiness'}</em></span></article>
   <article><MonitorUp/><span><small>TRANSITION FABRIC</small><b>{packet?`${packet.edgeCount.toLocaleString()} edges`:'20,735 queued'}</b><em>{packet?`ancestry ${packet.ancestryHash.slice(0,20)}…`:'hierarchy receipt pending'}</em></span></article>
   <article><Cpu/><span><small>GPU EXECUTION</small><b>{roundtrip.state}</b><em>{roundtrip.correspondence===true?'CPU↔GPU BYTE MATCH':gpu.state}</em></span></article>
   <article><ShieldCheck/><span><small>FRAME RECEIPT</small><b>{model?.receipt?.receiptHash||'PENDING'}</b><em>restart replay {model?model.restart.statePreserved?'PASS':'FAIL':'PENDING'}</em></span></article>
  </div>
  {error&&<div className='r351-error'>{error}</div>}
  <footer><b>Boundary</b><span>{model?.receipt?.boundary||'R351 route readiness is independent of asynchronous GPU/device proof. Missing device evidence remains missing.'}</span></footer>
 </section>;
}