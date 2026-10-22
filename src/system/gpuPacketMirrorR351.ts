import{renderExactAddressFieldR349,R349_RESOLUTION,R349_SCHEMA,type TypedFieldR349}from'./wovenHardwareFieldR349';

export const R351_SCHEMA='OMEGA_GPU_PACKET_MIRROR_R351' as const;
export const R351_REVISION='R351' as const;
export const R351_EDGE_COUNT=R349_RESOLUTION-1;
export const R351_BOUNDARY='R351 is a renderer/executor recovery layer. CPU↔GPU byte correspondence, frame receipts, adapter limits and timing are software/device execution evidence only. They do not prove physical simulation accuracy, scientific validity, native-host availability, or CanonState admission. R125/R141/R146/R147 remain authoritative in their existing domains.';

export const R351_SCALE_LAWS=[
 {resolution:12,role:'ROOT_ADDRESS_BINS'},
 {resolution:144,role:'SECONDARY_ADDRESS_BINS'},
 {resolution:1728,role:'INTERMEDIATE_ADDRESS_BINS'},
 {resolution:20736,role:'CANONICAL_PACKET_FIELD'},
 {resolution:248832,role:'DECLARED_SUPERSET_PROJECTION_ONLY'}
]as const;

export type PacketMirrorR351={
 schema:typeof R351_SCHEMA;packetCount:number;channelCount:number;
 packets:Float32Array;edges:Uint32Array;
 parent1728:Uint32Array;parent144:Uint16Array;parent12:Uint8Array;local12:Uint8Array;
};

const fnv=(view:ArrayBufferView)=>{const bytes=new Uint8Array(view.buffer,view.byteOffset,view.byteLength);let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')};
const finite=(n:number)=>Number.isFinite(n)?n:0;
const bounded=async<T>(promise:Promise<T>,ms:number,label:string):Promise<T>=>{let timer:any;try{return await Promise.race([promise,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} exceeded ${ms}ms bound`)),ms)})])}finally{clearTimeout(timer)}};

export function compilePacketMirrorR351(field:TypedFieldR349):PacketMirrorR351{
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R351 requires canonical R349 typed field');
 const channelCount=9,packets=new Float32Array(R349_RESOLUTION*channelCount),edges=new Uint32Array(R351_EDGE_COUNT*2);
 const parent1728=new Uint32Array(R349_RESOLUTION),parent144=new Uint16Array(R349_RESOLUTION),parent12=new Uint8Array(R349_RESOLUTION),local12=new Uint8Array(R349_RESOLUTION);
 for(let i=0;i<R349_RESOLUTION;i++){
  const o=i*channelCount;
  packets[o]=finite(field.continuity[i]);packets[o+1]=finite(field.plasticity[i]);packets[o+2]=finite(field.burden[i]);packets[o+3]=finite(field.contradiction[i]);packets[o+4]=finite(field.scar[i]);packets[o+5]=finite(field.evidence[i]);packets[o+6]=finite(field.invariant[i]);packets[o+7]=finite(field.motion[i]);packets[o+8]=finite(field.support[i]);
  parent1728[i]=Math.floor(i/12);parent144[i]=Math.floor(i/144);parent12[i]=Math.floor(i/1728);local12[i]=i%12;
  if(i<R351_EDGE_COUNT){edges[i*2]=i;edges[i*2+1]=i+1}
 }
 return{schema:R351_SCHEMA,packetCount:R349_RESOLUTION,channelCount,packets,edges,parent1728,parent144,parent12,local12};
}

export function packetMirrorReceiptR351(mirror:PacketMirrorR351){
 if(mirror?.schema!==R351_SCHEMA)throw new Error('R351 mirror receipt requires R351 mirror');
 return{
  schema:'OMEGA_GPU_PACKET_MIRROR_RECEIPT_R351' as const,
  packetCount:mirror.packetCount,edgeCount:mirror.edges.length/2,channelCount:mirror.channelCount,
  packetHash:fnv(mirror.packets),edgeHash:fnv(mirror.edges),
  ancestryHash:[fnv(mirror.parent1728),fnv(mirror.parent144),fnv(mirror.parent12),fnv(mirror.local12)].join(':'),
  exactCounts:mirror.packetCount===20736&&mirror.edges.length/2===20735,
  projectionLaws:R351_SCALE_LAWS,
  canonicalMutation:false,boundary:R351_BOUNDARY
 };
}

export function compileHdrOffscreenR351(field:TypedFieldR349){
 const render=renderExactAddressFieldR349(field,'COMPOSITE');
 const hdr=new Float32Array(render.pixelCount*4);
 for(let i=0;i<render.rgba.length;i+=4){hdr[i]=render.rgba[i]/255;hdr[i+1]=render.rgba[i+1]/255;hdr[i+2]=render.rgba[i+2]/255;hdr[i+3]=1}
 return{schema:'OMEGA_HDR_OFFSCREEN_FRAME_R351' as const,width:render.width,height:render.height,pixelCount:render.pixelCount,hdr,ldrChecksum:render.checksum,hdrHash:fnv(hdr),physicalImageClaimed:false};
}

export function deterministicFrameReceiptR351(field:TypedFieldR349,frameIndex=0){
 const mirror=compilePacketMirrorR351(field),packet=packetMirrorReceiptR351(mirror),frame=compileHdrOffscreenR351(field);
 const basis=`${frameIndex}|${packet.packetHash}|${packet.edgeHash}|${packet.ancestryHash}|${frame.hdrHash}|${frame.ldrChecksum}`;
 const bytes=new TextEncoder().encode(basis);let h=2166136261;for(const b of bytes){h^=b;h=Math.imul(h,16777619)}
 return{schema:'OMEGA_RENDER_FRAME_RECEIPT_R351' as const,frameIndex,packet,frame:{width:frame.width,height:frame.height,pixelCount:frame.pixelCount,hdrHash:frame.hdrHash,ldrChecksum:frame.ldrChecksum},receiptHash:(h>>>0).toString(16).padStart(8,'0'),deterministic:true,canonicalMutation:false,boundary:R351_BOUNDARY};
}

export async function probeGpuR351(){
 const nav=typeof navigator!=='undefined'?navigator as any:null;
 const gpu=nav?.gpu;
 if(!gpu)return{available:false,state:'GPU_API_UNAVAILABLE',adapterInfo:null,limits:null,features:[],boundary:R351_BOUNDARY};
 try{
  const adapter=await bounded(gpu.requestAdapter({powerPreference:'high-performance'}),4000,'GPU adapter probe');
  if(!adapter)return{available:false,state:'NO_GPU_ADAPTER_RETURNED',adapterInfo:null,limits:null,features:[],boundary:R351_BOUNDARY};
  const info=adapter.info?{vendor:String(adapter.info.vendor||''),architecture:String(adapter.info.architecture||''),device:String(adapter.info.device||''),description:String(adapter.info.description||'')}:null;
  const limits=adapter.limits?Object.fromEntries(Object.entries(adapter.limits).filter(([,v])=>typeof v==='number')):null;
  const features=adapter.features?[...adapter.features].map(String).sort():[];
  return{available:true,state:'GPU_ADAPTER_RETURNED',adapterInfo:info,limits,features,boundary:R351_BOUNDARY};
 }catch(error){return{available:false,state:'GPU_PROBE_FAILED',error:error instanceof Error?error.message:String(error),adapterInfo:null,limits:null,features:[],boundary:R351_BOUNDARY}}
}

export async function gpuUploadReadbackProofR351(mirror:PacketMirrorR351){
 const nav=typeof navigator!=='undefined'?navigator as any:null,gpu=nav?.gpu,usage=(globalThis as any).GPUBufferUsage,mapMode=(globalThis as any).GPUMapMode;
 const cpuHash=fnv(mirror.packets);
 if(!gpu||!usage||!mapMode)return{state:'GPU_EXECUTION_UNAVAILABLE',cpuHash,gpuHash:null,correspondence:null,deviceExecutionProved:false,boundary:R351_BOUNDARY};
 let device:any=null;
 try{
  const adapter=await bounded(gpu.requestAdapter({powerPreference:'high-performance'}),4000,'GPU adapter request');if(!adapter)throw new Error('no adapter');device=await bounded(adapter.requestDevice(),6000,'GPU device request');
  const bytes=new Uint8Array(mirror.packets.buffer,mirror.packets.byteOffset,mirror.packets.byteLength);
  const src=device.createBuffer({size:bytes.byteLength,usage:usage.COPY_SRC|usage.COPY_DST,mappedAtCreation:true});
  new Uint8Array(src.getMappedRange()).set(bytes);src.unmap();
  const dst=device.createBuffer({size:bytes.byteLength,usage:usage.COPY_DST|usage.MAP_READ});
  const encoder=device.createCommandEncoder();encoder.copyBufferToBuffer(src,0,dst,0,bytes.byteLength);device.queue.submit([encoder.finish()]);
  await bounded(dst.mapAsync(mapMode.READ),6000,'GPU readback map');const copy=new Uint8Array(dst.getMappedRange()).slice();dst.unmap();src.destroy?.();dst.destroy?.();
  const gpuHash=fnv(copy);return{state:'GPU_UPLOAD_READBACK_RETURNED',cpuHash,gpuHash,correspondence:cpuHash===gpuHash,deviceExecutionProved:true,byteCount:bytes.byteLength,boundary:R351_BOUNDARY};
 }catch(error){return{state:'GPU_EXECUTION_FAILED',cpuHash,gpuHash:null,correspondence:false,deviceExecutionProved:false,error:error instanceof Error?error.message:String(error),boundary:R351_BOUNDARY}}
 finally{device?.destroy?.()}
}

export function rendererRestartProofR351(field:TypedFieldR349){
 const a=deterministicFrameReceiptR351(field,0),b=deterministicFrameReceiptR351(field,0);
 return{state:'CPU_RENDERER_RESTART_REPLAY',before:a.receiptHash,after:b.receiptHash,statePreserved:a.receiptHash===b.receiptHash,deviceRestartClaimed:false,boundary:R351_BOUNDARY};
}
