import{traversalNodeR347,type TraversalFieldNodeR347}from'../traversalFieldR347';

export const R349_SCHEMA='OMEGA_HARDWARE_WOVEN_FIELD_R349' as const;
export const R349_RESOLUTION=20736 as const;
export const R349_SIDE=144 as const;
export const R349_CHANNEL_COUNT=9 as const;
export const R349_OPERATOR=['PARTITION','RELATIONAL_EXCHANGE_TRANSPORT','INVARIANT_CARRY','SCAR_HISTORY_CARRY','ORIENTATION_FRAME_REEXPRESSION','RECONTEXTUALIZE_REPARTITION','PROVE','RENDER']as const;
export const R349_BOUNDARY='R349 is a hardware-aware software execution/render path for the established R315/R348 calculus. Browser hardwareConcurrency/deviceMemory/devicePixelRatio are scheduling/render hints, not physical-compute proof. 20,736 is the canonical computational address resolution and 144×144 is its exact raster projection; neither is a literal physical dimension. R125 admission, R141 returned proof, R146 history and R147 dispatch authority remain unchanged.';

export type HardwareHintR349={logicalCores?:number|null;deviceMemoryGB?:number|null;devicePixelRatio?:number|null;workerAvailable?:boolean|null;requestedWorkers?:number|null};
export type PartitionR349={index:number;start:number;endExclusive:number;count:number};
export type HardwarePlanR349={schema:typeof R349_SCHEMA;resolution:number;side:number;logicalCores:number;deviceMemoryGB:number|null;devicePixelRatio:number;workerAvailable:boolean;workerCount:number;partitions:PartitionR349[];render:{width:number;height:number,pixelCount:number,byteCount:number,cssScale:number,addressIdentity:'PIXEL_INDEX_EQUALS_CANONICAL_ADDRESS'};boundary:string};

export type TypedFieldR349={
 schema:typeof R349_SCHEMA;resolution:number;
 continuity:Float32Array;plasticity:Float32Array;burden:Float32Array;contradiction:Float32Array;scar:Float32Array;evidence:Float32Array;invariant:Float32Array;motion:Float32Array;support:Float32Array;
 orientation:Int8Array;knownMask:Uint16Array;
};

export type LensR349='COMPOSITE'|'CONTINUITY'|'MOTION'|'SCAR'|'EVIDENCE'|'FUTURE';

const cl=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(Number(n))?Number(n):0));
const sig=(n:number):-1|0|1=>n<0?-1:n>0?1:0;
const finiteInt=(n:unknown,fallback:number)=>{const x=Math.floor(Number(n));return Number.isFinite(x)?x:fallback};
const makePartitions=(workers:number):PartitionR349[]=>{
 const out:PartitionR349[]=[];let start=0;
 for(let i=0;i<workers;i++){const remaining=R349_RESOLUTION-start,slots=workers-i,count=Math.ceil(remaining/slots),endExclusive=Math.min(R349_RESOLUTION,start+count);out.push({index:i,start,endExclusive,count:endExclusive-start});start=endExclusive}
 if(start!==R349_RESOLUTION)throw new Error('R349 partition coverage failure');
 return out;
};

export function compileHardwareExecutionPlanR349(hint:HardwareHintR349={}):HardwarePlanR349{
 const cores=Math.max(1,Math.min(256,finiteInt(hint.logicalCores,1))),memRaw=Number(hint.deviceMemoryGB),memory=Number.isFinite(memRaw)&&memRaw>0?Math.min(256,memRaw):null,dpr=Math.max(1,Math.min(8,Number.isFinite(Number(hint.devicePixelRatio))?Number(hint.devicePixelRatio):1));
 const memoryBound=memory==null?12:Math.max(1,Math.min(12,Math.floor(memory*2))),coreBound=Math.max(1,Math.min(12,cores>1?cores-1:1)),requested=Math.max(1,Math.min(12,finiteInt(hint.requestedWorkers,12)));
 const workerCount=Math.max(1,Math.min(coreBound,memoryBound,requested)),workerAvailable=hint.workerAvailable===true,cssScale=Math.max(1,Math.min(4,Math.ceil(dpr)));
 return{schema:R349_SCHEMA,resolution:R349_RESOLUTION,side:R349_SIDE,logicalCores:cores,deviceMemoryGB:memory,devicePixelRatio:dpr,workerAvailable,workerCount,partitions:makePartitions(workerCount),render:{width:R349_SIDE,height:R349_SIDE,pixelCount:R349_RESOLUTION,byteCount:R349_RESOLUTION*4,cssScale,addressIdentity:'PIXEL_INDEX_EQUALS_CANONICAL_ADDRESS'},boundary:R349_BOUNDARY};
}

const nodeSample=(address:number,step:number)=>traversalNodeR347(address,step);
export function compileCanonicalTypedFieldR349(step=0,sampler:(address:number,step:number)=>Partial<TraversalFieldNodeR347>=nodeSample):TypedFieldR349{
 const continuity=new Float32Array(R349_RESOLUTION),plasticity=new Float32Array(R349_RESOLUTION),burden=new Float32Array(R349_RESOLUTION),contradiction=new Float32Array(R349_RESOLUTION),scar=new Float32Array(R349_RESOLUTION),evidence=new Float32Array(R349_RESOLUTION),invariant=new Float32Array(R349_RESOLUTION),motion=new Float32Array(R349_RESOLUTION),support=new Float32Array(R349_RESOLUTION),orientation=new Int8Array(R349_RESOLUTION),knownMask=new Uint16Array(R349_RESOLUTION);
 for(let address=0;address<R349_RESOLUTION;address++){
  const n=sampler(address,step)||{};
  continuity[address]=cl(Number(n.continuity));plasticity[address]=cl(Number(n.plasticity));burden[address]=cl(Number(n.burden));contradiction[address]=cl(Number(n.contradiction));scar[address]=cl(Number(n.scar));evidence[address]=cl(Number(n.evidence));invariant[address]=cl(Number(n.invariantCarry));motion[address]=cl(Number(n.motionRate));support[address]=cl(Number(n.support));orientation[address]=sig(Number(n.orientation));knownMask[address]=0x01ff;
 }
 return{schema:R349_SCHEMA,resolution:R349_RESOLUTION,continuity,plasticity,burden,contradiction,scar,evidence,invariant,motion,support,orientation,knownMask};
}

const total=(a:Float32Array)=>{let x=0;for(let i=0;i<a.length;i++)x+=a[i];return x};
export function evolveHardwareFieldR349(field:TypedFieldR349,{orientation=0,transportRate=.125}:{orientation?:number;transportRate?:number}={}){
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R349 evolution requires canonical typed field');
 const s=sig(Number(orientation)),rate=s===0?0:Math.max(0,Math.min(.5,Number(transportRate)||0)),before=total(field.invariant),next=field.invariant.slice(),scar=field.scar.slice(),motion=field.motion.slice();
 if(rate>0){
  if(s>0){for(let i=0;i<R349_RESOLUTION-1;i++){const amount=field.invariant[i]*rate;next[i]-=amount;next[i+1]+=amount}}
  else{for(let i=R349_RESOLUTION-1;i>0;i--){const amount=field.invariant[i]*rate;next[i]-=amount;next[i-1]+=amount}}
 }
 let scarDelta=0;
 for(let i=0;i<R349_RESOLUTION;i++){const d=Math.abs(next[i]-field.invariant[i]);scar[i]=cl(scar[i]+d);motion[i]=cl(Math.max(motion[i],d));scarDelta+=d}
 const after=total(next),residual=Math.abs(before-after),tolerance=Math.max(1e-5,Math.abs(before)*1e-6);
 const evolved={...field,invariant:next,scar,motion,orientation:new Int8Array(R349_RESOLUTION).fill(s)} as TypedFieldR349;
 return{schema:'OMEGA_HARDWARE_WOVEN_EVOLUTION_R349' as const,operator:R349_OPERATOR,field:evolved,orientation:s,transportRate:rate,invariantBefore:before,invariantAfter:after,invariantResidual:residual,invariantTolerance:tolerance,scarDelta,proof:{invariantStatus:residual<=tolerance?'PASS':'FAIL',softwareResidualOnly:true,fullAddressCoverage:true,transportTopology:'ADDRESS_NEIGHBOR_FALLBACK',recoverableSourceRetained:true},boundary:R349_BOUNDARY};
}

export function repartitionInvariantR349(field:TypedFieldR349,targetResolution:number){
 const target=Math.floor(Number(targetResolution));if(![12,144,1728,20736,248832].includes(target))throw new Error('R349 target resolution must be declared 12^k atlas level');
 const out=new Float32Array(target);
 for(let i=0;i<R349_RESOLUTION;i++){const j=Math.min(target-1,Math.floor(i/R349_RESOLUTION*target));out[j]+=field.invariant[i]}
 const before=total(field.invariant),after=total(out),residual=Math.abs(before-after),tolerance=Math.max(1e-5,Math.abs(before)*1e-6);
 return{sourceResolution:R349_RESOLUTION,targetResolution:target,field:out,invariantBefore:before,invariantAfter:after,invariantResidual:residual,invariantTolerance:tolerance,proof:residual<=tolerance?'PASS':'FAIL',physicalDimensionsClaimed:false};
}

const byte=(n:number)=>Math.max(0,Math.min(255,Math.round(cl(n)*255)));
function pixel(field:TypedFieldR349,i:number,lens:LensR349){
 const C=field.continuity[i],P=field.plasticity[i],L=field.burden[i],q=field.contradiction[i],S=field.scar[i],E=field.evidence[i],M=field.motion[i],I=field.invariant[i];
 switch(lens){
  case'CONTINUITY':return[byte(C),byte(C*E),byte(1-C)];
  case'MOTION':return[byte(M),byte(I),byte(1-M)];
  case'SCAR':return[byte(S),byte(.4*C),byte(1-S*.7)];
  case'EVIDENCE':return[byte(1-E),byte(E),byte(.35+.65*E)];
  case'FUTURE':return[byte(P),byte(C*P),byte(1-q)];
  default:return[byte(.5*q+.5*L),byte(.62*C+.38*E),byte(.5*P+.5*(1-S))];
 }
}
function fnv1a(bytes:Uint8ClampedArray){let h=2166136261;for(let i=0;i<bytes.length;i++){h^=bytes[i];h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}

export function renderExactAddressFieldR349(field:TypedFieldR349,lens:LensR349='COMPOSITE'){
 if(field?.schema!==R349_SCHEMA||field.resolution!==R349_RESOLUTION)throw new Error('R349 render requires canonical typed field');
 const rgba=new Uint8ClampedArray(R349_RESOLUTION*4);
 for(let i=0;i<R349_RESOLUTION;i++){const [r,g,b]=pixel(field,i,lens),o=i*4;rgba[o]=r;rgba[o+1]=g;rgba[o+2]=b;rgba[o+3]=255}
 return{schema:'OMEGA_EXACT_ADDRESS_RENDER_R349' as const,lens,width:R349_SIDE,height:R349_SIDE,pixelCount:R349_RESOLUTION,rgba,checksum:fnv1a(rgba),addressIdentity:'pixelIndex === canonical address' as const,projectionAuthority:'MODEL_STATE_RENDER' as const,physicalImageClaimed:false,boundary:R349_BOUNDARY};
}

export function addressFromPixelR349(x:number,y:number){const px=Math.floor(Number(x)),py=Math.floor(Number(y));if(px<0||px>=R349_SIDE||py<0||py>=R349_SIDE)throw new Error('R349 pixel outside 144×144 canonical raster');return py*R349_SIDE+px}
