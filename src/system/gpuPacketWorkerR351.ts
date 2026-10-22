import{compileCanonicalTypedFieldR349}from'./wovenHardwareFieldR349';
import{compilePacketMirrorR351,deterministicFrameReceiptR351,rendererRestartProofR351}from'./gpuPacketMirrorR351';

const scope=self as any;
scope.onmessage=()=>{
 try{
  const field=compileCanonicalTypedFieldR349(0);
  const mirror=compilePacketMirrorR351(field);
  const receipt=deterministicFrameReceiptR351(field,0);
  const restart=rendererRestartProofR351(field);
  scope.postMessage({ok:true,mirror,receipt,restart},[
   mirror.packets.buffer,mirror.edges.buffer,mirror.parent1728.buffer,
   mirror.parent144.buffer,mirror.parent12.buffer,mirror.local12.buffer
  ]);
 }catch(error){
  scope.postMessage({ok:false,error:error instanceof Error?error.message:String(error)});
 }
};
