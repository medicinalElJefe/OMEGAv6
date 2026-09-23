import{R351_SCHEMA,type PacketMirrorR351}from'./gpuPacketMirrorR351';

export const R352_SCHEMA='OMEGA_WEBGPU_COMPUTE_RENDER_STATE_R352' as const;
export const R352_REVISION='R352' as const;
export const R352_PACKET_COUNT=20736 as const;
export const R352_CHANNEL_COUNT=9 as const;
export const R352_WORKGROUP_SIZE=64 as const;
export const R352_WORKGROUP_COUNT=Math.ceil(R352_PACKET_COUNT/R352_WORKGROUP_SIZE);
export const R352_TOLERANCE=2e-6;
export const R352_BOUNDARY='R352 executes a deterministic derived render-state transform over the proven R351 packet mirror. GPU dispatch/readback correspondence, adapter limits and returned wall latency are software/device execution evidence only. The transform does not mutate canonical state, does not prove physical simulation accuracy, and does not create observation, Hybrid return proof, durable history, dispatch authority, or CanonState admission. R125/R141/R146/R147 remain authoritative.';

export const R352_WGSL=`
struct RenderState { value: vec4<f32> };
@group(0) @binding(0) var<storage, read> packets: array<f32>;
@group(0) @binding(1) var<storage, read_write> renderState: array<RenderState>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i=gid.x;
  if(i>=20736u){ return; }
  let o=i*9u;
  let C=packets[o+0u];
  let P=packets[o+1u];
  let L=packets[o+2u];
  let q=packets[o+3u];
  let S=packets[o+4u];
  let E=packets[o+5u];
  let r=clamp(0.5*q+0.5*L,0.0,1.0);
  let g=clamp(0.62*C+0.38*E,0.0,1.0);
  let b=clamp(0.5*P+0.5*(1.0-S),0.0,1.0);
  renderState[i].value=vec4<f32>(r,g,b,1.0);
}
`;

const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const hashView=(view:ArrayBufferView)=>{const bytes=new Uint8Array(view.buffer,view.byteOffset,view.byteLength);let h=2166136261>>>0;for(const b of bytes){h=Math.imul(h^b,16777619)>>>0}return h.toString(16).padStart(8,'0')};
const hashText=(text:string)=>{const bytes=new TextEncoder().encode(text);let h=2166136261>>>0;for(const b of bytes){h=Math.imul(h^b,16777619)>>>0}return h.toString(16).padStart(8,'0')};
const bounded=async<T>(promise:Promise<T>,ms:number,label:string):Promise<T>=>{let timer:any;try{return await Promise.race([promise,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} exceeded ${ms}ms bound`)),ms)})])}finally{clearTimeout(timer)}};

export type CpuRenderStateR352={schema:typeof R352_SCHEMA;values:Float32Array;packetCount:number;workgroupSize:number;workgroupCount:number;inputHash:string;outputHash:string;shaderHash:string;canonicalMutation:false;physicalSimulationClaimed:false;boundary:string};

export function cpuRenderStateReferenceR352(mirror:PacketMirrorR351):CpuRenderStateR352{
 if(mirror?.schema!==R351_SCHEMA||mirror.packetCount!==R352_PACKET_COUNT||mirror.channelCount!==R352_CHANNEL_COUNT)throw new Error('R352 requires canonical R351 20,736×9 packet mirror');
 const out=new Float32Array(R352_PACKET_COUNT*4);
 for(let i=0;i<R352_PACKET_COUNT;i++){
  const o=i*R352_CHANNEL_COUNT,d=i*4,C=mirror.packets[o],P=mirror.packets[o+1],L=mirror.packets[o+2],q=mirror.packets[o+3],S=mirror.packets[o+4],E=mirror.packets[o+5];
  out[d]=clamp(.5*q+.5*L);out[d+1]=clamp(.62*C+.38*E);out[d+2]=clamp(.5*P+.5*(1-S));out[d+3]=1;
 }
 return{schema:R352_SCHEMA,values:out,packetCount:R352_PACKET_COUNT,workgroupSize:R352_WORKGROUP_SIZE,workgroupCount:R352_WORKGROUP_COUNT,inputHash:hashView(mirror.packets),outputHash:hashView(out),shaderHash:hashText(R352_WGSL),canonicalMutation:false,physicalSimulationClaimed:false,boundary:R352_BOUNDARY};
}

export function compareRenderStateR352(cpu:Float32Array,gpu:Float32Array,tolerance=R352_TOLERANCE){
 if(cpu.length!==gpu.length)return{ok:false,maxAbsError:Infinity,mismatchCount:Math.max(cpu.length,gpu.length),compared:0,tolerance};
 let maxAbsError=0,mismatchCount=0;
 for(let i=0;i<cpu.length;i++){const e=Math.abs(cpu[i]-gpu[i]);if(e>maxAbsError)maxAbsError=e;if(!Number.isFinite(e)||e>tolerance)mismatchCount++}
 return{ok:mismatchCount===0,maxAbsError,mismatchCount,compared:cpu.length,tolerance};
}

export function gpuComputePlanR352(mirror:PacketMirrorR351){
 const cpu=cpuRenderStateReferenceR352(mirror);
 return{schema:'OMEGA_WEBGPU_COMPUTE_PLAN_R352' as const,packetCount:R352_PACKET_COUNT,inputBytes:mirror.packets.byteLength,outputBytes:cpu.values.byteLength,workgroupSize:R352_WORKGROUP_SIZE,workgroupCount:R352_WORKGROUP_COUNT,shaderHash:cpu.shaderHash,inputHash:cpu.inputHash,truth:'DERIVED_RENDER_STATE_ONLY' as const,canonicalMutation:false,boundary:R352_BOUNDARY};
}

export async function executeGpuRenderStateR352(mirror:PacketMirrorR351){
 const cpu=cpuRenderStateReferenceR352(mirror),plan=gpuComputePlanR352(mirror);
 const nav=typeof navigator!=='undefined'?navigator as any:null,gpu=nav?.gpu,usage=(globalThis as any).GPUBufferUsage,mapMode=(globalThis as any).GPUMapMode;
 if(!gpu||!usage||!mapMode)return{schema:R352_SCHEMA,state:'GPU_COMPUTE_UNAVAILABLE',plan,cpu:{outputHash:cpu.outputHash},gpu:null,correspondence:null,deviceExecutionProved:false,canonicalMutation:false,boundary:R352_BOUNDARY};
 let device:any=null,input:any=null,output:any=null,readback:any=null;
 const started=typeof performance!=='undefined'?performance.now():Date.now();
 try{
  const adapter=await bounded(gpu.requestAdapter({powerPreference:'high-performance'}),4000,'R352 GPU adapter request');
  if(!adapter)throw new Error('R352 no GPU adapter returned');
  device=await bounded(adapter.requestDevice(),6000,'R352 GPU device request');
  const module=device.createShaderModule({label:'R352 derived render-state compute',code:R352_WGSL});
  const pipeline=device.createComputePipeline({label:'R352 render-state pipeline',layout:'auto',compute:{module,entryPoint:'main'}});
  input=device.createBuffer({label:'R352 packet input',size:mirror.packets.byteLength,usage:usage.STORAGE|usage.COPY_DST});
  output=device.createBuffer({label:'R352 render-state output',size:cpu.values.byteLength,usage:usage.STORAGE|usage.COPY_SRC});
  readback=device.createBuffer({label:'R352 readback',size:cpu.values.byteLength,usage:usage.COPY_DST|usage.MAP_READ});
  device.queue.writeBuffer(input,0,mirror.packets.buffer,mirror.packets.byteOffset,mirror.packets.byteLength);
  const group=pipeline.getBindGroupLayout(0),bind=device.createBindGroup({layout:group,entries:[{binding:0,resource:{buffer:input}},{binding:1,resource:{buffer:output}}]});
  const encoder=device.createCommandEncoder({label:'R352 compute encoder'}),pass=encoder.beginComputePass({label:'R352 derived render-state pass'});
  pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(R352_WORKGROUP_COUNT);pass.end();
  encoder.copyBufferToBuffer(output,0,readback,0,cpu.values.byteLength);device.queue.submit([encoder.finish()]);
  await bounded(readback.mapAsync(mapMode.READ),8000,'R352 GPU compute readback');
  const gpuValues=new Float32Array(readback.getMappedRange().slice(0));readback.unmap();
  const correspondence=compareRenderStateR352(cpu.values,gpuValues),finished=typeof performance!=='undefined'?performance.now():Date.now();
  return{schema:R352_SCHEMA,state:correspondence.ok?'GPU_COMPUTE_VERIFIED':'GPU_COMPUTE_DIVERGED',plan,cpu:{outputHash:cpu.outputHash},gpu:{outputHash:hashView(gpuValues),returnedWallMs:Math.max(0,finished-started),adapterInfo:adapter.info?{vendor:String(adapter.info.vendor||''),architecture:String(adapter.info.architecture||''),device:String(adapter.info.device||''),description:String(adapter.info.description||'')}:null,limits:adapter.limits?Object.fromEntries(Object.entries(adapter.limits).filter(([,v])=>typeof v==='number')):null},correspondence,deviceExecutionProved:correspondence.ok,canonicalMutation:false,boundary:R352_BOUNDARY};
 }catch(error){
  const finished=typeof performance!=='undefined'?performance.now():Date.now();
  return{schema:R352_SCHEMA,state:'GPU_COMPUTE_FAILED',plan,cpu:{outputHash:cpu.outputHash},gpu:{returnedWallMs:Math.max(0,finished-started)},correspondence:false,deviceExecutionProved:false,error:error instanceof Error?error.message:String(error),canonicalMutation:false,boundary:R352_BOUNDARY};
 }finally{for(const b of[input,output,readback])try{b?.destroy?.()}catch{}try{device?.destroy?.()}catch{}}
}
