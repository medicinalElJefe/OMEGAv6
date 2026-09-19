import{decompress as zstdDecompressR327}from'./vendor/fzstdR327.js';
import{sarAssetProbeR325}from'./sarAssetProbeR325.js';

export const SAR_NATIVE_RASTER_SCHEMA_R326='OMEGA_SAR_NATIVE_RASTER_R326';
const MAX_IFD_BYTES=1024*1024;
const MAX_BLOCK_BYTES=2*1024*1024;
const MAX_TOTAL_COMPRESSED=8*1024*1024;
const MAX_BLOCKS=64;
const TARGET_MAX=48;

const typeSize=t=>({1:1,2:1,3:2,4:4,5:8,6:1,7:1,8:2,9:4,10:8,11:4,12:8,16:8,17:8,18:8}[t]||0);
async function readLimited(response,maxBytes){
 if(!response.body)return new Uint8Array(await response.arrayBuffer()).slice(0,maxBytes);
 const reader=response.body.getReader(),chunks=[];let total=0;
 try{while(total<maxBytes){const{done,value}=await reader.read();if(done)break;if(value?.byteLength){const take=value.subarray(0,Math.min(value.byteLength,maxBytes-total));chunks.push(take);total+=take.byteLength}}}
 finally{try{await reader.cancel()}catch{}}
 const out=new Uint8Array(total);let o=0;for(const x of chunks){out.set(x,o);o+=x.byteLength}return out
}
async function fetchRange(href,start,length){
 if(!Number.isSafeInteger(start)||start<0||!Number.isSafeInteger(length)||length<1||length>MAX_BLOCK_BYTES)throw new Error('RANGE_BOUNDS_REJECTED');
 const end=start+length-1,response=await fetch(href,{headers:{accept:'*/*',range:`bytes=${start}-${end}`,'user-agent':'OMEGAv6-R326/1.0'},cf:{cacheTtl:0,cacheEverything:false}});
 if(start>0&&response.status!==206){try{await response.body?.cancel()}catch{};throw new Error(`RANGE_REQUIRED_${response.status}`)}
 if(!(response.ok||response.status===206)){try{await response.body?.cancel()}catch{};throw new Error(`RANGE_HTTP_${response.status}`)}
 const bytes=await readLimited(response,length);
 if(bytes.byteLength<length&&response.status===206)throw new Error(`RANGE_SHORT_${bytes.byteLength}_OF_${length}`);
 return bytes
}
const u64=(dv,off,le)=>{const n=dv.getBigUint64(off,le);return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):null};
function parseHeader(bytes){
 if(bytes.byteLength<16)throw new Error('TIFF_HEADER_SHORT');
 const le=bytes[0]===0x49&&bytes[1]===0x49,be=bytes[0]===0x4d&&bytes[1]===0x4d;
 if(!le&&!be)throw new Error('TIFF_BYTE_ORDER_MISSING');
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),magic=dv.getUint16(2,le);
 if(magic===42)return{le,big:false,ifdOffset:dv.getUint32(4,le),countSize:2,entrySize:12,pointerSize:4,valueFieldSize:4};
 if(magic===43){if(dv.getUint16(4,le)!==8||dv.getUint16(6,le)!==0)throw new Error('BIGTIFF_HEADER_UNSUPPORTED');const ifdOffset=u64(dv,8,le);if(ifdOffset==null)throw new Error('BIGTIFF_IFD_OFFSET_UNSAFE');return{le,big:true,ifdOffset,countSize:8,entrySize:20,pointerSize:8,valueFieldSize:8}}
 throw new Error(`TIFF_MAGIC_${magic}`)
}
function scalarFrom(dv,type,off,le){
 if(type===1||type===2||type===6||type===7)return dv.getUint8(off);
 if(type===3)return dv.getUint16(off,le);
 if(type===4)return dv.getUint32(off,le);
 if(type===8)return dv.getInt16(off,le);
 if(type===9)return dv.getInt32(off,le);
 if(type===11)return dv.getFloat32(off,le);
 if(type===12)return dv.getFloat64(off,le);
 if(type===16||type===18)return u64(dv,off,le);
 if(type===17){const n=dv.getBigInt64(off,le);return n>=BigInt(Number.MIN_SAFE_INTEGER)&&n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):null}
 return null
}
function parseValues(bytes,type,count,le){
 const size=typeSize(type);if(!size||count<1)return[];
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),out=[];
 if(type===2){let s='';for(let i=0;i<Math.min(count,bytes.byteLength);i++){const c=bytes[i];if(c===0)break;s+=String.fromCharCode(c)}return[s]}
 for(let i=0;i<count;i++){const off=i*size;if(off+size>bytes.byteLength)break;
  if(type===5||type===10){const signed=type===10,a=signed?dv.getInt32(off,le):dv.getUint32(off,le),b=signed?dv.getInt32(off+4,le):dv.getUint32(off+4,le);out.push(b?a/b:null)}
  else out.push(scalarFrom(dv,type,off,le))
 }
 return out
}
async function readIfd(href,ctx,offset){
 const countBytes=await fetchRange(href,offset,ctx.countSize);
 const cdv=new DataView(countBytes.buffer,countBytes.byteOffset,countBytes.byteLength);
 const count=ctx.big?u64(cdv,0,ctx.le):cdv.getUint16(0,ctx.le);
 if(count==null||count<1||count>4096)throw new Error(`IFD_ENTRY_COUNT_${count}`);
 const length=ctx.countSize+count*ctx.entrySize+ctx.pointerSize;
 if(length>MAX_IFD_BYTES)throw new Error('IFD_TOO_LARGE');
 const bytes=await fetchRange(href,offset,length),dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),entries=new Map();
 const base=ctx.countSize;
 for(let i=0;i<count;i++){
  const off=base+i*ctx.entrySize,tag=dv.getUint16(off,ctx.le),type=dv.getUint16(off+2,ctx.le);
  const n=ctx.big?u64(dv,off+4,ctx.le):dv.getUint32(off+4,ctx.le),valuePos=off+(ctx.big?12:8);
  if(n==null)continue;
  const total=typeSize(type)*n,inline=total>0&&total<=ctx.valueFieldSize;
  let pointer=null;if(!inline)pointer=ctx.big?u64(dv,valuePos,ctx.le):dv.getUint32(valuePos,ctx.le);
  entries.set(tag,{tag,type,count:n,total,inline,pointer,valueField:bytes.slice(valuePos,valuePos+ctx.valueFieldSize)})
 }
 const nextPos=base+count*ctx.entrySize,next=ctx.big?u64(dv,nextPos,ctx.le):dv.getUint32(nextPos,ctx.le);
 return{offset,count,entries,next:next||0}
}
async function entryValues(href,ctx,e,limit=200000){
 if(!e||e.count<1)return[];
 if(e.count>limit)throw new Error(`TIFF_ARRAY_TOO_LARGE_${e.tag}_${e.count}`);
 if(e.inline)return parseValues(e.valueField,e.type,e.count,ctx.le);
 if(e.pointer==null)throw new Error(`TIFF_POINTER_MISSING_${e.tag}`);
 const bytes=e.total;
 if(bytes<1||bytes>MAX_IFD_BYTES)throw new Error(`TIFF_VALUE_BYTES_${e.tag}_${bytes}`);
 return parseValues(await fetchRange(href,e.pointer,bytes),e.type,e.count,ctx.le)
}
const first=async(href,ctx,ifd,tag,fallback=null)=>{const x=await entryValues(href,ctx,ifd.entries.get(tag),16);return x.length&&x[0]!=null?x[0]:fallback};
async function summarizeIfd(href,ctx,ifd){
 const width=Number(await first(href,ctx,ifd,256,0)),height=Number(await first(href,ctx,ifd,257,0));
 return{ifd,width,height,bits:Number(await first(href,ctx,ifd,258,0)),compression:Number(await first(href,ctx,ifd,259,1)),samplesPerPixel:Number(await first(href,ctx,ifd,277,1)),rowsPerStrip:Number(await first(href,ctx,ifd,278,0)),planar:Number(await first(href,ctx,ifd,284,1)),predictor:Number(await first(href,ctx,ifd,317,1)),tileWidth:Number(await first(href,ctx,ifd,322,0)),tileHeight:Number(await first(href,ctx,ifd,323,0)),sampleFormat:Number(await first(href,ctx,ifd,339,1))}
}
async function georefForIfd(href,ctx,ifd){
 const pixelScale=await entryValues(href,ctx,ifd.entries.get(33550),8).catch(()=>[]);
 const tiepoints=await entryValues(href,ctx,ifd.entries.get(33922),64).catch(()=>[]);
 const transform=await entryValues(href,ctx,ifd.entries.get(34264),16).catch(()=>[]);
 const keys=(await entryValues(href,ctx,ifd.entries.get(34735),512).catch(()=>[])).map(Number);
 const keyMap={};
 if(keys.length>=4){
  const n=Number(keys[3]||0);
  for(let i=0;i<n;i++){const o=4+i*4;if(o+3>=keys.length)break;const keyId=keys[o],location=keys[o+1],count=keys[o+2],value=keys[o+3];if(location===0&&count===1)keyMap[keyId]=value}
 }
 const projected=Number(keyMap[3072]||0),geographic=Number(keyMap[2048]||0),epsg=projected>0&&projected<32767?projected:geographic>0&&geographic<32767?geographic:null;
 let affine=null,method='NONE';
 if(transform.length===16&&transform.every(Number.isFinite)){affine=[Number(transform[0]),Number(transform[1]),Number(transform[3]),Number(transform[4]),Number(transform[5]),Number(transform[7])];method='MODEL_TRANSFORMATION'}
 else if(pixelScale.length>=2&&tiepoints.length>=6&&[pixelScale[0],pixelScale[1],tiepoints[0],tiepoints[1],tiepoints[3],tiepoints[4]].every(Number.isFinite)){
  const sx=Number(pixelScale[0]),sy=Number(pixelScale[1]),i=Number(tiepoints[0]),j=Number(tiepoints[1]),x=Number(tiepoints[3]),y=Number(tiepoints[4]);
  affine=[sx,0,x-i*sx,0,-sy,y+j*sy];method='PIXEL_SCALE_TIEPOINT'
 }
 const crs=epsg?`EPSG:${epsg}`:null;
 const gcps=[];for(let o=0;o+5<tiepoints.length&&gcps.length<64;o+=6){const v=tiepoints.slice(o,o+6).map(Number);if(v.every(Number.isFinite))gcps.push({pixel:v[0],line:v[1],zPixel:v[2],x:v[3],y:v[4],z:v[5]})}
 const point=(px,py)=>affine?{x:affine[0]*px+affine[1]*py+affine[2],y:affine[3]*px+affine[4]*py+affine[5]}:null;
 return{bound:!!affine||gcps.length>0,affineBound:!!affine,gcpBound:gcps.length>0,method:affine?method:gcps.length?'MODEL_TIEPOINT_GCPS':'NONE',epsg,crs,modelType:keyMap[1024]||null,rasterType:keyMap[1025]||null,pixelScale:pixelScale.slice(0,3),tiepoint:tiepoints.slice(0,6),gcpCount:Math.floor(tiepoints.length/6),gcps,affine,point}
}
async function collectIfds(href,ctx){
 const queue=[ctx.ifdOffset],seen=new Set(),rows=[];
 while(queue.length&&rows.length<10){
  const offset=queue.shift();if(!offset||seen.has(offset))continue;seen.add(offset);
  const ifd=await readIfd(href,ctx,offset),summary=await summarizeIfd(href,ctx,ifd);rows.push(summary);
  if(ifd.next&&!seen.has(ifd.next))queue.push(ifd.next);
  const subs=await entryValues(href,ctx,ifd.entries.get(330),32).catch(()=>[]);
  for(const q of subs){const n=Number(q);if(Number.isSafeInteger(n)&&n>0&&!seen.has(n))queue.push(n)}
 }
 return rows.filter(x=>x.width>0&&x.height>0)
}
function chooseIfd(rows){
 if(!rows.length)throw new Error('NO_RASTER_IFD');
 const eligible=rows.filter(x=>Math.min(x.width,x.height)>=TARGET_MAX);
 if(eligible.length)return eligible.sort((a,b)=>(a.width*a.height)-(b.width*b.height))[0];
 return[...rows].sort((a,b)=>(b.width*b.height)-(a.width*a.height))[0]
}
async function inflate(bytes){
 if(typeof DecompressionStream!=='function')throw new Error('DEFLATE_RUNTIME_UNAVAILABLE');
 const ds=new DecompressionStream('deflate'),writer=ds.writable.getWriter();await writer.write(bytes);await writer.close();return new Uint8Array(await new Response(ds.readable).arrayBuffer())
}
function packBits(bytes){
 const out=[];for(let i=0;i<bytes.length;){let n=bytes[i++];if(n>127)n-=256;if(n>=0&&n<=127){const count=n+1;for(let j=0;j<count&&i<bytes.length;j++)out.push(bytes[i++])}else if(n>=-127&&n<=-1){const count=1-n,v=bytes[i++];for(let j=0;j<count;j++)out.push(v)}}
 return Uint8Array.from(out)
}
function lzw(bytes){
 let bit=0,size=9,next=258,dict=[];const reset=()=>{dict=Array.from({length:258},(_,i)=>i<256?Uint8Array.of(i):null);size=9;next=258};reset();
 const readCode=()=>{if(bit+size>bytes.length*8)return null;let v=0;for(let i=0;i<size;i++){const p=bit+i,vb=(bytes[p>>3]>>(7-(p&7)))&1;v=(v<<1)|vb}bit+=size;return v};
 const chunks=[];let prev=null;
 while(true){const code=readCode();if(code==null)break;if(code===256){reset();prev=null;continue}if(code===257)break;
  let cur=dict[code];if(!cur&&code===next&&prev){cur=new Uint8Array(prev.length+1);cur.set(prev);cur[cur.length-1]=prev[0]}if(!cur)throw new Error(`LZW_CODE_${code}`);
  chunks.push(cur);
  if(prev&&next<4096){const row=new Uint8Array(prev.length+1);row.set(prev);row[row.length-1]=cur[0];dict[next++]=row;if(next===(1<<size)-1&&size<12)size++}
  prev=cur
 }
 const total=chunks.reduce((n,x)=>n+x.length,0),out=new Uint8Array(total);let o=0;for(const x of chunks){out.set(x,o);o+=x.length}return out
}
async function decompress(bytes,compression){
 if(compression===1)return bytes;
 if(compression===5)return lzw(bytes);
 if(compression===8||compression===32946)return inflate(bytes);
 if(compression===32773)return packBits(bytes);
 if(compression===50000)return zstdDecompressR327(bytes);
 throw new Error(`UNSUPPORTED_TIFF_COMPRESSION_${compression}`)
}
function undoPredictor(bytes,width,height,bits,spp,predictor,le){
 if(predictor===1)return bytes;if(predictor!==2)throw new Error(`UNSUPPORTED_TIFF_PREDICTOR_${predictor}`);
 if(![8,16,32].includes(bits))throw new Error(`PREDICTOR_BITS_${bits}`);
 const bps=bits/8,rowSamples=width*spp,rowBytes=rowSamples*bps,dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 for(let y=0;y<height;y++){const row=y*rowBytes;if(row>=bytes.byteLength)break;for(let s=spp;s<rowSamples;s++){const off=row+s*bps,prev=row+(s-spp)*bps;if(off+bps>bytes.byteLength)break;
  if(bits===8)bytes[off]=(bytes[off]+bytes[prev])&255;
  else if(bits===16)dv.setUint16(off,(dv.getUint16(off,le)+dv.getUint16(prev,le))&65535,le);
  else dv.setUint32(off,(dv.getUint32(off,le)+dv.getUint32(prev,le))>>>0,le)
 }}
 return bytes
}
function sampleAt(bytes,index,bits,format,le){
 const bps=bits/8,off=index*bps;if(off<0||off+bps>bytes.byteLength)return null;
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(format===3&&bits===32)return dv.getFloat32(off,le);
 if(format===2){if(bits===8)return dv.getInt8(off);if(bits===16)return dv.getInt16(off,le);if(bits===32)return dv.getInt32(off,le)}
 if(bits===8)return dv.getUint8(off);if(bits===16)return dv.getUint16(off,le);if(bits===32)return dv.getUint32(off,le);return null
}
function outputShape(width,height,max=TARGET_MAX){
 const scale=Math.min(1,max/Math.max(width,height));return{w:Math.max(4,Math.round(width*scale)),h:Math.max(4,Math.round(height*scale))}
}
function planSamples(meta,w,h){
 const tiled=meta.tileWidth>0&&meta.tileHeight>0,blockW=tiled?meta.tileWidth:meta.width,blockH=tiled?meta.tileHeight:(meta.rowsPerStrip||meta.height);
 const across=tiled?Math.ceil(meta.width/blockW):1,points=[],blocks=new Map();
 for(let oy=0;oy<h;oy++)for(let ox=0;ox<w;ox++){
  const x=w===1?0:Math.round(ox*(meta.width-1)/(w-1)),y=h===1?0:Math.round(oy*(meta.height-1)/(h-1));
  const bx=tiled?Math.floor(x/blockW):0,by=Math.floor(y/blockH),block=by*across+bx,row={ox,oy,x,y,bx,by,block,lx:x-bx*blockW,ly:y-by*blockH};points.push(row);
  if(!blocks.has(block))blocks.set(block,[]);blocks.get(block).push(row)
 }
 return{tiled,blockW,blockH,across,points,blocks}
}
function finiteRange(values,mask){let lo=Infinity,hi=-Infinity,n=0;for(let i=0;i<values.length;i++)if(mask[i]&&Number.isFinite(values[i])){lo=Math.min(lo,values[i]);hi=Math.max(hi,values[i]);n++}return{lo:Number.isFinite(lo)?lo:0,hi:Number.isFinite(hi)?hi:1,count:n}}
export async function sarNativeRasterR326(url){
 const started=Date.now(),probe=await sarAssetProbeR325(url),base={schema:SAR_NATIVE_RASTER_SCHEMA_R326,revision:'R326',verifiedAt:new Date().toISOString(),collection:probe.collection,productId:probe.productId,assetKey:probe.assetKey,probeState:probe.state};
 if(!probe.nativeByteEvidenceBound||!probe.asset?.href)return{ok:false,...base,state:probe.state==='AUTH_REQUIRED'?'AUTH_REQUIRED':'BYTE_EVIDENCE_REQUIRED',probe,truthBoundary:'R326 decodes only an exact asset whose byte/container evidence passed R325. No catalogue pointer or preview can become a native raster.'};
 if(probe.collection!=='sentinel-1-grd')return{ok:false,...base,state:'SLC_COMPLEX_DECODER_REQUIRED',probe,truthBoundary:'R326 native raster ingress is limited to Sentinel-1 GRD intensity containers. SLC complex I/Q requires a separate complex decoder and is not approximated from GRD logic.'};
 try{
  const href=probe.asset.href,header=await fetchRange(href,0,16),ctx=parseHeader(header),ifds=await collectIfds(href,ctx),meta=chooseIfd(ifds),geo=await georefForIfd(href,ctx,meta.ifd);
  if(meta.planar!==1||meta.samplesPerPixel!==1)return{ok:false,...base,state:'RASTER_LAYOUT_HELD',probe,decoder:{planar:meta.planar,samplesPerPixel:meta.samplesPerPixel},truthBoundary:'R326 currently admits only one-sample chunky GRD rasters. Multi-sample/planar layouts stay held rather than being misdecoded.'};
  if(![8,16,32].includes(meta.bits)||![1,2,3].includes(meta.sampleFormat))return{ok:false,...base,state:'SAMPLE_ENCODING_HELD',probe,decoder:{bits:meta.bits,sampleFormat:meta.sampleFormat},truthBoundary:'Unsupported native sample encoding remains held. OMEGA does not reinterpret bytes under a guessed scalar type.'};
  let{w,h}=outputShape(meta.width,meta.height),plan=planSamples(meta,w,h);
  while(plan.blocks.size>MAX_BLOCKS&&(w>4||h>4)){w=Math.max(4,Math.floor(w*.8));h=Math.max(4,Math.floor(h*.8));plan=planSamples(meta,w,h)}
  if(plan.blocks.size>MAX_BLOCKS)return{ok:false,...base,state:'BLOCK_BUDGET_HELD',probe,decoder:{requestedBlocks:plan.blocks.size,maxBlocks:MAX_BLOCKS},truthBoundary:'The scene layout exceeds the bounded cloud decode budget at the minimum display grid. Full-resolution processing should move to the governed host/compute path rather than overrun the public Worker.'};
  const ifd=meta.ifd,offsetTag=plan.tiled?324:273,countTag=plan.tiled?325:279,offsets=(await entryValues(href,ctx,ifd.entries.get(offsetTag),200000)).map(Number),counts=(await entryValues(href,ctx,ifd.entries.get(countTag),200000)).map(Number);
  if(!offsets.length||offsets.length!==counts.length)throw new Error('BLOCK_OFFSETS_COUNTS_MISSING');
  let compressedTotal=0;for(const block of plan.blocks.keys()){const n=counts[block];if(!Number.isSafeInteger(n)||n<1||n>MAX_BLOCK_BYTES)throw new Error(`BLOCK_BYTECOUNT_${block}_${n}`);compressedTotal+=n}if(compressedTotal>MAX_TOTAL_COMPRESSED)throw new Error(`COMPRESSED_BUDGET_${compressedTotal}`);
  const values=new Array(w*h).fill(0),mask=new Array(w*h).fill(0),blockReceipts=[];
  for(const[block,points]of plan.blocks){
   const offset=offsets[block],count=counts[block];if(!Number.isSafeInteger(offset)||offset<0)throw new Error(`BLOCK_OFFSET_${block}`);
   const compressed=await fetchRange(href,offset,count),raw0=await decompress(compressed,meta.compression);
   const blockRows=plan.tiled?plan.blockH:Math.min(plan.blockH,meta.height-(Math.floor(block/plan.across)*plan.blockH)),expected=plan.blockW*blockRows*meta.samplesPerPixel*(meta.bits/8);
   if(raw0.byteLength<expected)throw new Error(`BLOCK_DECODE_SHORT_${block}_${raw0.byteLength}_${expected}`);
   const raw=undoPredictor(raw0,plan.blockW,blockRows,meta.bits,meta.samplesPerPixel,meta.predictor,ctx.le);
   for(const p of points){const idx=p.oy*w+p.ox,local=p.ly*plan.blockW+p.lx,v=sampleAt(raw,local,meta.bits,meta.sampleFormat,ctx.le);if(v!=null&&Number.isFinite(v)){values[idx]=v;mask[idx]=1}}
   blockReceipts.push({block,offset,compressedBytes:count,decodedBytes:raw.byteLength})
  }
  const range=finiteRange(values,mask);if(!range.count)throw new Error('NO_FINITE_NATIVE_SAMPLES');
  const corners=geo.affineBound?[geo.point(0,0),geo.point(meta.width-1,0),geo.point(meta.width-1,meta.height-1),geo.point(0,meta.height-1)]:[];
  const raster={width:w,height:h,sourceId:`${probe.productId}:${probe.assetKey}`,native:true,nativeIntensity:values,validMask:mask,sourceUnits:'NATIVE_DN',ranges:{nativeIntensity:[range.lo,range.hi]},sampling:{sourceWidth:meta.width,sourceHeight:meta.height,selectedIfdOffset:meta.ifd.offset,overview:meta.width!==ifds[0]?.width||meta.height!==ifds[0]?.height,method:'EVEN_GRID_NATIVE_SAMPLE',validSamples:range.count,totalSamples:w*h},georeference:{bound:geo.bound,affineBound:geo.affineBound,gcpBound:geo.gcpBound,method:geo.method,crs:geo.crs,epsg:geo.epsg,affine:geo.affine,corners,gcpCount:geo.gcpCount,gcps:geo.gcps}};
  return{ok:true,...base,state:'NATIVE_SAMPLES_BOUND',latencyMs:Date.now()-started,nativeDataBound:true,sourceEvidenceBound:true,calibrationBound:false,amplitudeBound:false,derivedFieldBound:false,raster,decoder:{container:probe.tiff?.container||null,width:meta.width,height:meta.height,bits:meta.bits,sampleFormat:meta.sampleFormat,compression:meta.compression,predictor:meta.predictor,tiled:plan.tiled,tileWidth:meta.tileWidth||null,tileHeight:meta.tileHeight||null,rowsPerStrip:meta.rowsPerStrip||null,ifdCount:ifds.length,selectedIfdOffset:meta.ifd.offset,blocksRead:plan.blocks.size,compressedBytesRead:compressedTotal,blockReceipts,georeference:{bound:geo.bound,affineBound:geo.affineBound,gcpBound:geo.gcpBound,method:geo.method,crs:geo.crs,epsg:geo.epsg,gcpCount:geo.gcpCount}},probe:{state:probe.state,prefix:probe.prefix,http:probe.http,asset:probe.asset},truthBoundary:'R326 binds a bounded grid of decoded numerical samples from the exact Sentinel-1 GRD native asset. R327 extends that same ingress to CDSE COG_SAFE ZSTD tiles and preserves GeoTIFF affine and tiepoint/GCP evidence only when actually returned; multiple GCPs are never collapsed into a fabricated affine transform and absent CRS/georeference remains unresolved. SOURCE may render returned native DN samples. Radiometric calibration, sigma0/gamma0 backscatter, complex phase, coherence, deformation, elevation and all other derived fields remain unbound until their own evidence and processing receipts exist.'}
 }catch(e){return{ok:false,...base,state:String(e instanceof Error?e.message:e).startsWith('UNSUPPORTED_TIFF_COMPRESSION_')?'COMPRESSION_HELD':'NATIVE_DECODE_HELD',latencyMs:Date.now()-started,error:e instanceof Error?e.message:String(e),probe,truthBoundary:'Native decode failure is explicit. OMEGA retains catalogue/byte evidence and does not fabricate source pixels or derived measurements.'}}
}

export const R326_TESTABLE=Object.freeze({parseHeader,packBits,undoPredictor,outputShape,planSamples});
