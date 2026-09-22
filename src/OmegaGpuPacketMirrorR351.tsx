import{useEffect,useMemo,useState}from'react';
import{Cpu,Gpu,MonitorUp,ShieldCheck}from'lucide-react';
import{compileCanonicalTypedFieldR349}from'./system/wovenHardwareFieldR349';
import{compilePacketMirrorR351,deterministicFrameReceiptR351,gpuUploadReadbackProofR351,probeGpuR351,rendererRestartProofR351}from'./system/gpuPacketMirrorR351';
import'./omegaGpuPacketMirrorR351.css';

export default function OmegaGpuPacketMirrorR351(){
 const model=useMemo(()=>{const field=compileCanonicalTypedFieldR349(0),mirror=compilePacketMirrorR351(field);return{field,mirror,receipt:deterministicFrameReceiptR351(field,0),restart:rendererRestartProofR351(field)}},[]);
 const [gpu,setGpu]=useState<any>({state:'PROBING'}),[roundtrip,setRoundtrip]=useState<any>({state:'PENDING'});
 useEffect(()=>{let live=true;(async()=>{const p=await probeGpuR351();if(!live)return;setGpu(p);const r=await gpuUploadReadbackProofR351(model.mirror);if(live)setRoundtrip(r)})();return()=>{live=false}},[model]);
 return <section className='r351-gpu' data-r351-gpu='OMEGA_GPU_PACKET_MIRROR_R351'>
  <header><div><span>R351 · GPU PACKET MIRROR</span><h3>20,736 typed packets → 20,735 transition edges → ancestry → frame receipt</h3><p>CPU state remains the deterministic reference. WebGPU is used only when the browser actually returns an adapter/device; upload/readback correspondence is device execution evidence, not scientific or physical validation.</p></div><Gpu/></header>
  <div className='r351-grid'>
   <article><Cpu/><span><small>PACKET MIRROR</small><b>{model.receipt.packet.packetCount.toLocaleString()} packets</b><em>{model.receipt.packet.channelCount} channels · hash {model.receipt.packet.packetHash}</em></span></article>
   <article><MonitorUp/><span><small>TRANSITION FABRIC</small><b>{model.receipt.packet.edgeCount.toLocaleString()} edges</b><em>ancestry {model.receipt.packet.ancestryHash.slice(0,20)}…</em></span></article>
   <article><Gpu/><span><small>GPU EXECUTION</small><b>{roundtrip.state}</b><em>{roundtrip.correspondence===true?'CPU↔GPU BYTE MATCH':gpu.state}</em></span></article>
   <article><ShieldCheck/><span><small>FRAME RECEIPT</small><b>{model.receipt.receiptHash}</b><em>restart replay {model.restart.statePreserved?'PASS':'FAIL'}</em></span></article>
  </div>
  <footer><b>Boundary</b><span>{model.receipt.boundary}</span></footer>
 </section>;
}