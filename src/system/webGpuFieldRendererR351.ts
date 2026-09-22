import{renderExactAddressFieldR349,R349_RESOLUTION,R349_SIDE,R349_SCHEMA,type TypedFieldR349}from'./wovenHardwareFieldR349';

export const R351_SCHEMA='OMEGA_WEBGPU_FIELD_RENDERER_R351' as const;
export const R351_REVISION='R351' as const;
export const R351_STATE_STRIDE=8 as const;
export const R351_EDGE_COUNT=20735 as const;
export const R351_BOUNDARY='R351 is a browser WebGPU execution/render path for R349 typed model state. Successful adapter/device return proves only this browser device-gated GPU path executed. It does not prove native Hybrid execution, physical simulation validity, observed-world truth, GPU vendor performance beyond measured browser timings, or CanonState admission. CPU fallback remains deterministic when WebGPU is unavailable.';
export const R351_LAWS=[
 'GPU_AVAILABILITY_IS_DEVICE_CAPABILITY_NOT_TRUTH_AUTHORITY',
 'CPU_GPU_MIRROR_PROOF_REQUIRES_EXACT_BYTE_ROUND_TRIP_OF_THE_UPLOADED_STATE_BUFFER',
 '20736_PACKET_AND_20735_EDGE_COUNTS_ARE_COMPUTATIONAL_TOPOLOGY_COUNTS_NOT_PHYSICAL_DIMENSIONS',
 'ANCESTRY_LEVELS_12_144_1728_20736_ARE_ADDRESS_HIERARCHY',
 'RENDER_OUTPUT_IS_MODEL_STATE_PROJECTION_NOT_OBSERVED_IMAGERY',
 'GPU_FAILURE_MUST_FALL_BACK_WITHOUT_MUTATING_SOURCE_STATE',
 'FRAME_RECEIPT_BINDS_INPUT_STATE_RENDER_MODE_AND_OUTPUT_HASH',
 'R125_REMAINS_THE_ONLY_CANONSTATE_ADMISSION_AUTHORITY',
]as const;

export type GpuPacketR351={
 schema:typeof R351_SCHEMA;revision:typeof R351_REVISION;
 state:Float32Array;edges:Uint32Array;ancestry:Uint32Array;
 stateHash:string;edgeHash:string;ancestryHash:string;
 packetCount:number;edgeCount:number;stateStride:number;
 projectionLevels:readonly[12,144,1728,20736];
};
export type GpuCapabilityR351={
 available:boolean;adapterReturned:boolean;deviceReturned:boolean;
 description:string;vendor:string;architecture:string;
 maxBufferSize:number|null;maxStorageBufferBindingSize:number|null;
 featureCount:number;deviceExecutionObserved:boolean;
};
export type GpuFrameReceiptR351={
 schema:'OMEGA_WEBGPU_FRAME_RECEIPT_R351';revision:typeof R351_REVISION;
 mode:'WEBGPU_COMPUTE'|'CPU_FALLBACK';
 cpuStateHash:string;gpuStateHash:string|null;stateMirrorMatch:boolean|null;
 edgeHash:string;ancestryHash:string;frameHash:string;
 packetCount:number;edgeCount:number;pixelCount:number;
 capability:GpuCapabilityR351;
 timingsMs:{adapter:number|null;uploadDispatchReadback:number|null;total:number};
 gpuError:string|null;
 canonicalMutation:false;nativeHybridExecutionClaimed:false;physicalSimulationClaimed:false;observedImageryClaimed:false;
 boundary:string;
};
export type GpuRenderResultR351={rgba:Uint8ClampedArray;receipt:GpuFrameReceiptR351;packet:GpuPacketR351};

const channels=['continuity','plasticity','burden','contradiction','scar','evidence','invariant','motion']as const;
function hashBytes(bytes:Uint8Array){
 let h1=2166136261>>>0,h2=2246822519>>>0;
 for(let i=0;i<bytes.length;i++){const b=bytes[i];h1=Math.imul(h1^b,16777619)>>>0;h2=Math.imul((h2+b+((i&255)<<1))>>>0,3266489917)>>>0;h2=(h2^(h2>>>13))>>>0}
 return h1.toString(16).padStart(8,'0')+h2.toString(16).padStart(8,'0');
}
function bytesOf(view:ArrayBufferView){return new Uint8Array(view.buffer,view.byteOffset,view.byteLength)}
function now(){return typeof performance!=='undefined'&&performance.now?performance.now():Date.now()}
function adapterText(adapter:any,key:string){const info=adapter?.info||{};return String(info?.[key]||'').trim()}
function capability(adapter:any,device:any):GpuCapabilityR351{
 const limits=device?.limits||adapter?.limits||{},features=device?.features||adapter?.features;
 return{available:Boolean(adapter&&device),adapterReturned:Boolean(adapter),deviceReturned:Boolean(device),description:adapterText(adapter,'description'),vendor:adapterText(adapter,'vendor'),architecture:adapterText(adapter,'architecture'),maxBufferSize:Number.isFinite(Number(limits.maxBufferSize))?Number(limits.maxBufferSize):null,maxStorageBufferBindingSize:Number.isFinite(Number(limits.maxStorageBufferBindingSize))?Number(limits.maxStorageBufferBindingSize):null,featureCount:features&&typeof features.size==='number'?features.size:0,deviceExecutionObserved:Boolean(adapter&&device)};
}
export function compileGpuPacketR351(field:TypedFieldR349):GpuPacketR351{
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R351 requires canonical R349 typed field');
 const state=new Float32Array(R349_RESOLUTION*R351_STATE_STRIDE);
 for(let i=0;i<R349_RESOLUTION;i++){const o=i*R351_STATE_STRIDE;for(let c=0;c<channels.length;c++)state[o+c]=field[channels[c]][i]}
 const edges=new Uint32Array(R351_EDGE_COUNT*2);for(let i=0;i<R351_EDGE_COUNT;i++){edges[i*2]=i;edges[i*2+1]=i+1}
 const ancestry=new Uint32Array(R349_RESOLUTION*4);
 for(let i=0;i<R349_RESOLUTION;i++){const o=i*4;ancestry[o]=Math.floor(i/1728);ancestry[o+1]=Math.floor(i/144);ancestry[o+2]=Math.floor(i/12);ancestry[o+3]=i}
 return{schema:R351_SCHEMA,revision:R351_REVISION,state,edges,ancestry,stateHash:hashBytes(bytesOf(state)),edgeHash:hashBytes(bytesOf(edges)),ancestryHash:hashBytes(bytesOf(ancestry)),packetCount:R349_RESOLUTION,edgeCount:R351_EDGE_COUNT,stateStride:R351_STATE_STRIDE,projectionLevels:[12,144,1728,20736]};
}
export function validateGpuPacketR351(packet:GpuPacketR351){
 const counts=packet.packetCount===20736&&packet.edgeCount===20735&&packet.state.length===20736*8&&packet.edges.length===20735*2&&packet.ancestry.length===20736*4;
 const hashes=hashBytes(bytesOf(packet.state))===packet.stateHash&&hashBytes(bytesOf(packet.edges))===packet.edgeHash&&hashBytes(bytesOf(packet.ancestry))===packet.ancestryHash;
 let edges=true;for(let i=0;i<packet.edgeCount;i++){if(packet.edges[i*2]!==i||packet.edges[i*2+1]!==i+1){edges=false;break}}
 return{ok:counts&&hashes&&edges,counts,hashes,edges};
}
const shader=`
@group(0) @binding(0) var<storage,read> state: array<f32>;
@group(0) @binding(1) var<storage,read_write> pixels: array<u32>;
fn toByte(v:f32)->u32{return u32(round(clamp(v,0.0,1.0)*255.0));}
@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid:vec3<u32>){
 let i=gid.x;if(i>=20736u){return;}let b=i*8u;
 let c=state[b];let p=state[b+1u];let l=state[b+2u];let q=state[b+3u];let s=state[b+4u];let e=state[b+5u];
 let r=toByte(0.5*q+0.5*l);let g=toByte(0.62*c+0.38*e);let bl=toByte(0.5*p+0.5*(1.0-s));
 pixels[i]=r|(g<<8u)|(bl<<16u)|(255u<<24u);
}`;
function rgbaFromPacked(packed:Uint32Array){
 const rgba=new Uint8ClampedArray(packed.length*4);for(let i=0;i<packed.length;i++){const v=packed[i],o=i*4;rgba[o]=v&255;rgba[o+1]=(v>>>8)&255;rgba[o+2]=(v>>>16)&255;rgba[o+3]=(v>>>24)&255}return rgba;
}
function fallback(field:TypedFieldR349,packet:GpuPacketR351,error:string|null,totalStart:number):GpuRenderResultR351{
 const cpu=renderExactAddressFieldR349(field,'COMPOSITE'),rgba=new Uint8ClampedArray(cpu.rgba);
 const cap:GpuCapabilityR351={available:false,adapterReturned:false,deviceReturned:false,description:'',vendor:'',architecture:'',maxBufferSize:null,maxStorageBufferBindingSize:null,featureCount:0,deviceExecutionObserved:false};
 return{rgba,packet,receipt:{schema:'OMEGA_WEBGPU_FRAME_RECEIPT_R351',revision:R351_REVISION,mode:'CPU_FALLBACK',cpuStateHash:packet.stateHash,gpuStateHash:null,stateMirrorMatch:null,edgeHash:packet.edgeHash,ancestryHash:packet.ancestryHash,frameHash:hashBytes(rgba),packetCount:packet.packetCount,edgeCount:packet.edgeCount,pixelCount:R349_RESOLUTION,capability:cap,timingsMs:{adapter:null,uploadDispatchReadback:null,total:Math.max(0,now()-totalStart)},gpuError:error,canonicalMutation:false,nativeHybridExecutionClaimed:false,physicalSimulationClaimed:false,observedImageryClaimed:false,boundary:R351_BOUNDARY}};
}
export async function renderGpuFieldR351(field:TypedFieldR349):Promise<GpuRenderResultR351>{
 const totalStart=now(),packet=compileGpuPacketR351(field),nav:any=typeof navigator!=='undefined'?navigator:null,gpu=nav?.gpu;
 if(!gpu?.requestAdapter)return fallback(field,packet,'WEBGPU_UNAVAILABLE',totalStart);
 let adapter:any=null,device:any=null;
 try{
  const adapterStart=now();adapter=await gpu.requestAdapter({powerPreference:'high-performance'});const adapterMs=now()-adapterStart;if(!adapter)return fallback(field,packet,'WEBGPU_ADAPTER_UNAVAILABLE',totalStart);
  device=await adapter.requestDevice();const usage:any=(globalThis as any).GPUBufferUsage,mapMode:any=(globalThis as any).GPUMapMode;
  if(!usage||!mapMode)throw new Error('WEBGPU_CONSTANTS_UNAVAILABLE');
  const gpuStart=now(),stateBuffer=device.createBuffer({size:packet.state.byteLength,usage:usage.STORAGE|usage.COPY_DST|usage.COPY_SRC}),edgeBuffer=device.createBuffer({size:packet.edges.byteLength,usage:usage.STORAGE|usage.COPY_DST}),ancestryBuffer=device.createBuffer({size:packet.ancestry.byteLength,usage:usage.STORAGE|usage.COPY_DST}),pixelBuffer=device.createBuffer({size:R349_RESOLUTION*4,usage:usage.STORAGE|usage.COPY_SRC}),stateRead=device.createBuffer({size:packet.state.byteLength,usage:usage.COPY_DST|usage.MAP_READ}),pixelRead=device.createBuffer({size:R349_RESOLUTION*4,usage:usage.COPY_DST|usage.MAP_READ});
  device.queue.writeBuffer(stateBuffer,0,packet.state);device.queue.writeBuffer(edgeBuffer,0,packet.edges);device.queue.writeBuffer(ancestryBuffer,0,packet.ancestry);
  const module=device.createShaderModule({code:shader}),pipeline=device.createComputePipeline({layout:'auto',compute:{module,entryPoint:'main'}}),bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:stateBuffer}},{binding:1,resource:{buffer:pixelBuffer}}]});
  const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(Math.ceil(R349_RESOLUTION/256));pass.end();encoder.copyBufferToBuffer(stateBuffer,0,stateRead,0,packet.state.byteLength);encoder.copyBufferToBuffer(pixelBuffer,0,pixelRead,0,R349_RESOLUTION*4);device.queue.submit([encoder.finish()]);if(device.queue.onSubmittedWorkDone)await device.queue.onSubmittedWorkDone();
  await Promise.all([stateRead.mapAsync(mapMode.READ),pixelRead.mapAsync(mapMode.READ)]);
  const stateBytes=new Uint8Array(stateRead.getMappedRange()).slice(),packed=new Uint32Array(pixelRead.getMappedRange()).slice(),gpuStateHash=hashBytes(stateBytes),rgba=rgbaFromPacked(packed),frameHash=hashBytes(rgba),cap=capability(adapter,device),gpuMs=now()-gpuStart;
  stateRead.unmap();pixelRead.unmap();for(const b of[stateBuffer,edgeBuffer,ancestryBuffer,pixelBuffer,stateRead,pixelRead])try{b.destroy()}catch{}
  return{rgba,packet,receipt:{schema:'OMEGA_WEBGPU_FRAME_RECEIPT_R351',revision:R351_REVISION,mode:'WEBGPU_COMPUTE',cpuStateHash:packet.stateHash,gpuStateHash,stateMirrorMatch:gpuStateHash===packet.stateHash,edgeHash:packet.edgeHash,ancestryHash:packet.ancestryHash,frameHash,packetCount:packet.packetCount,edgeCount:packet.edgeCount,pixelCount:R349_RESOLUTION,capability:cap,timingsMs:{adapter:adapterMs,uploadDispatchReadback:gpuMs,total:Math.max(0,now()-totalStart)},gpuError:null,canonicalMutation:false,nativeHybridExecutionClaimed:false,physicalSimulationClaimed:false,observedImageryClaimed:false,boundary:R351_BOUNDARY}};
 }catch(error){try{device?.destroy?.()}catch{}return fallback(field,packet,error instanceof Error?error.message:String(error),totalStart)}
}
export function deterministicFrameReceiptR351(field:TypedFieldR349){
 const packet=compileGpuPacketR351(field),cpu=renderExactAddressFieldR349(field,'COMPOSITE');
 return{schema:'OMEGA_DETERMINISTIC_FRAME_PARAMETER_RECEIPT_R351' as const,stateHash:packet.stateHash,edgeHash:packet.edgeHash,ancestryHash:packet.ancestryHash,cpuFrameHash:hashBytes(cpu.rgba),width:R349_SIDE,height:R349_SIDE,packetCount:20736,edgeCount:20735,projectionLevels:packet.projectionLevels,canonicalMutation:false,observedImageryClaimed:false,boundary:R351_BOUNDARY};
}
