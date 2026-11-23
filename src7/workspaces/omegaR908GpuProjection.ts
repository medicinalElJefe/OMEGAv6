/** R908 optional GPU/readback parity for R907 verified 20,736-cell projection.
 * Never claims physical-PC Hybrid Link, native app device attestation,
 * empirical truth or full 20,736x20,736 dense tensor execution.
 */
export const R908_SCHEMA='OMEGA_R908_GPU_PROJECTION_PARITY' as const;
export const R908_COUNT=20736 as const;
export const R908_WORKGROUP=64 as const;
export const R908_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const R908_WGSL=`
@group(0) @binding(0) var<storage,read> levels:array<u32>;
@group(0) @binding(1) var<storage,read_write> pixels:array<u32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid:vec3<u32>){
 let i=gid.x;
 if(i>=20736u){return;}
 let level=levels[i];
 let alpha=(level*255u+31u)/63u;
 let r=(22u*(255u-alpha)+94u*alpha+127u)/255u;
 let g=(42u*(255u-alpha)+218u*alpha+127u)/255u;
 let b=(59u*(255u-alpha)+197u*alpha+127u)/255u;
 pixels[i]=r|(g<<8u)|(b<<16u)|(255u<<24u);
}`;

export function decodeR907GridR908(grid:string):Uint32Array{
 if(typeof grid!=='string'||grid.length!==R908_COUNT)throw Error('R908_GRID_LENGTH_HELD');
 const values=new Uint32Array(R908_COUNT);
 for(let i=0;i<R908_COUNT;i++){
  const n=R908_ALPHABET.indexOf(grid[i]);
  if(n<0)throw Error('R908_GRID_ALPHABET_HELD');
  values[i]=n;
 }
 return values;
}
export function cpuProjectionReferenceR908(levels:Uint32Array):Uint32Array{
 if(!(levels instanceof Uint32Array)||levels.length!==R908_COUNT)throw Error('R908_CPU_INPUT_SHAPE_HELD');
 const out=new Uint32Array(R908_COUNT);
 for(let i=0;i<R908_COUNT;i++){
  const level=levels[i];if(level>63)throw Error('R908_INTENSITY_BOUND_HELD');
  const alpha=Math.floor((level*255+31)/63);
  const r=Math.floor((22*(255-alpha)+94*alpha+127)/255);
  const g=Math.floor((42*(255-alpha)+218*alpha+127)/255);
  const b=Math.floor((59*(255-alpha)+197*alpha+127)/255);
  out[i]=(r|(g<<8)|(b<<16)|(255<<24))>>>0;
 }
 return out;
}
export function compareProjectionR908(expected:Uint32Array,actual:Uint32Array){
 let mismatches=0,firstMismatch=-1;
 if(expected.length!==actual.length)return{ok:false,mismatches:Math.abs(expected.length-actual.length),firstMismatch:0,compared:0};
 for(let i=0;i<expected.length;i++)if(expected[i]!==actual[i]){
  mismatches++;if(firstMismatch<0)firstMismatch=i;
 }
 return{ok:mismatches===0,mismatches,firstMismatch,compared:expected.length};
}
function boundedR908<T>(promise:Promise<T>,milliseconds:number):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 return Promise.race([promise,new Promise<T>((_,reject)=>{
  timer=setTimeout(()=>reject(Error('R908_GPU_TIMEOUT_HELD')),milliseconds);
 })]).finally(()=>{if(timer!==undefined)clearTimeout(timer)});
}
export async function executeR908GpuProjection(grid:string){
 const levels=decodeR907GridR908(grid),cpu=cpuProjectionReferenceR908(levels);
 const nav=typeof navigator!=='undefined' ? navigator as any:null;
 const gpu=nav?.gpu,usage=(globalThis as any).GPUBufferUsage,mapMode=(globalThis as any).GPUMapMode;
 const base={schema:R908_SCHEMA,addresses:R908_COUNT,workgroups:324,
  input:'R907_VERIFIED_PROJECTION_GRID_QUANTIZED',physicalPcAccepted:false,
  nativePcAccepted:false,semanticTruthProven:false,canonicalStateMutated:false};
 if(!gpu||!usage||!mapMode)return{...base,state:'GPU_UNAVAILABLE',deviceExecutionProved:false,comparison:null};
 let device:any=null,input:any=null,output:any=null,readback:any=null;
 const started=typeof performance!=='undefined'?performance.now():Date.now();
 try{
  const adapter=await boundedR908(gpu.requestAdapter({powerPreference:'high-performance'}),4000);
  if(!adapter)throw Error('R908_NO_GPU_ADAPTER_HELD');
  device=await boundedR908(adapter.requestDevice(),6000);
  const shader=device.createShaderModule({label:'R908 integer verified projection',code:R908_WGSL});
  const pipeline=device.createComputePipeline({layout:'auto',compute:{module:shader,entryPoint:'main'}});
  const bytes=levels.byteLength;
  input=device.createBuffer({size:bytes,usage:usage.STORAGE|usage.COPY_DST});
  output=device.createBuffer({size:bytes,usage:usage.STORAGE|usage.COPY_SRC});
  readback=device.createBuffer({size:bytes,usage:usage.COPY_DST|usage.MAP_READ});
  device.queue.writeBuffer(input,0,levels.buffer,levels.byteOffset,bytes);
  const bind=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[
   {binding:0,resource:{buffer:input}},{binding:1,resource:{buffer:output}}]});
  const encoder=device.createCommandEncoder(),pass=encoder.beginComputePass();
  pass.setPipeline(pipeline);pass.setBindGroup(0,bind);pass.dispatchWorkgroups(324);pass.end();
  encoder.copyBufferToBuffer(output,0,readback,0,bytes);
  device.queue.submit([encoder.finish()]);
  await boundedR908(readback.mapAsync(mapMode.READ),8000);
  const actual=new Uint32Array(readback.getMappedRange().slice(0));
  readback.unmap();
  const comparison=compareProjectionR908(cpu,actual);
  const elapsed=(typeof performance!=='undefined'?performance.now():Date.now())-started;
  return{...base,state:comparison.ok?'GPU_PROJECTION_READBACK_MATCH':'GPU_PROJECTION_DIVERGED',
   deviceExecutionProved:comparison.ok,comparison,wallMs:Math.max(0,elapsed),
   executionScope:'THIS_BROWSER_WEBGPU_DEVICE_ONLY_NOT_R141_NATIVE_HOST_ACCEPTANCE'};
 }catch(error){
  return{...base,state:'GPU_COMPUTE_HELD',deviceExecutionProved:false,
   comparison:null,error:error instanceof Error?error.message:String(error)};
 }finally{
  for(const buffer of [input,output,readback])try{buffer?.destroy?.()}catch{}
  try{device?.destroy?.()}catch{}
 }
}
