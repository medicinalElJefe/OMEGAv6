export const SAR_ASSET_PROBE_SCHEMA_R325='OMEGA_SAR_ASSET_PROBE_R325';
const STAC_ROOT='https://stac.dataspace.copernicus.eu/v1';
const COLLECTIONS=new Set(['sentinel-1-grd','sentinel-1-slc']);
const MAX_PREFIX=65536;
const safeId=v=>{const s=String(v||'').trim();return /^[A-Za-z0-9._:-]{1,240}$/.test(s)?s:''};
const safeKey=v=>{const s=String(v||'').trim();return /^[A-Za-z0-9._:+/-]{1,180}$/.test(s)?s:''};
const arr=v=>Array.isArray(v)?v.map(String):v==null?[]:[String(v)];
async function sha256Bytes(bytes){const d=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function trustedAssetUrl(href){
 try{
  const u=new URL(href);
  if(u.protocol!=='https:')return false;
  const h=u.hostname.toLowerCase();
  if(h==='localhost'||h.endsWith('.localhost')||h==='127.0.0.1'||h==='::1')return false;
  return h==='copernicus.eu'||h.endsWith('.copernicus.eu');
 }catch{return false}
}
async function readPrefix(response,maxBytes=MAX_PREFIX){
 if(!response.body)return new Uint8Array(await response.arrayBuffer()).slice(0,maxBytes);
 const reader=response.body.getReader(),chunks=[];let total=0;
 try{
  while(total<maxBytes){
   const {done,value}=await reader.read();if(done)break;
   if(value?.byteLength){const take=value.subarray(0,Math.min(value.byteLength,maxBytes-total));chunks.push(take);total+=take.byteLength}
  }
 }finally{try{await reader.cancel()}catch{}}
 const out=new Uint8Array(total);let o=0;for(const c of chunks){out.set(c,o);o+=c.byteLength}return out
}
function tiffProbe(bytes){
 if(bytes.byteLength<16)return{recognized:false,reason:'PREFIX_TOO_SHORT'};
 const a=bytes[0],b=bytes[1],little=a===0x49&&b===0x49,big=a===0x4d&&b===0x4d;
 if(!little&&!big)return{recognized:false,reason:'TIFF_BYTE_ORDER_MISSING'};
 const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),le=little,magic=dv.getUint16(2,le);
 const scalar=(type,off)=>{if(type===3&&off+2<=bytes.byteLength)return dv.getUint16(off,le);if(type===4&&off+4<=bytes.byteLength)return dv.getUint32(off,le);if(type===16&&off+8<=bytes.byteLength){const n=dv.getBigUint64(off,le);return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):null}return null};
 let bigTiff=false,ifdOffset=null,entrySize=12,countSize=2,headerSize=8;
 if(magic===42){ifdOffset=dv.getUint32(4,le)}
 else if(magic===43){bigTiff=true;const offsetSize=dv.getUint16(4,le),reserved=dv.getUint16(6,le);if(offsetSize!==8||reserved!==0)return{recognized:false,reason:'UNSUPPORTED_BIGTIFF_HEADER'};const n=dv.getBigUint64(8,le);ifdOffset=n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):null;entrySize=20;countSize=8;headerSize=16}
 else return{recognized:false,reason:`TIFF_MAGIC_${magic}`};
 const out={recognized:true,container:bigTiff?'BIGTIFF':'TIFF',littleEndian:le,magic,ifdOffset,width:null,height:null,bitsPerSample:null,compression:null,samplesPerPixel:null,sampleFormat:null,tiled:null,tileWidth:null,tileHeight:null};
 if(ifdOffset==null||ifdOffset<0||ifdOffset+countSize>bytes.byteLength)return{...out,reason:'IFD_OUTSIDE_PREFIX'};
 let count;
 if(bigTiff){const n=dv.getBigUint64(ifdOffset,le);count=n<=BigInt(4096)?Number(n):0}else count=dv.getUint16(ifdOffset,le);
 if(!count||count>4096)return{...out,reason:'IFD_ENTRY_COUNT_UNAVAILABLE'};
 const base=ifdOffset+countSize;
 const valueOf=(type,count,valuePos,valueFieldSize)=>{
  const size=type===1||type===2||type===6||type===7?1:type===3||type===8?2:type===4||type===9||type===11?4:type===5||type===10||type===12||type===16||type===17||type===18?8:0;
  if(!size||count<1)return null;
  if(size*count<=valueFieldSize)return scalar(type,valuePos);
  const ptr=bigTiff?(()=>{const n=dv.getBigUint64(valuePos,le);return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):null})():dv.getUint32(valuePos,le);
  return ptr==null?null:scalar(type,ptr);
 };
 for(let i=0;i<count;i++){
  const off=base+i*entrySize;if(off+entrySize>bytes.byteLength)break;
  const tag=dv.getUint16(off,le),type=dv.getUint16(off+2,le);
  const n=bigTiff?(()=>{const v=dv.getBigUint64(off+4,le);return v<=BigInt(Number.MAX_SAFE_INTEGER)?Number(v):0})():dv.getUint32(off+4,le);
  const valuePos=off+(bigTiff?12:8),fieldSize=bigTiff?8:4,v=valueOf(type,n,valuePos,fieldSize);
  if(tag===256)out.width=v;
  else if(tag===257)out.height=v;
  else if(tag===258)out.bitsPerSample=v;
  else if(tag===259)out.compression=v;
  else if(tag===277)out.samplesPerPixel=v;
  else if(tag===339)out.sampleFormat=v;
  else if(tag===322){out.tileWidth=v;out.tiled=true}
  else if(tag===323){out.tileHeight=v;out.tiled=true}
 }
 return out
}
function normalizedAssets(item){return Object.entries(item?.assets||{}).map(([key,v])=>{const primary=String(v?.href||''),alternate=String(v?.alternate?.https?.href||Object.values(v?.alternate||{}).map(x=>x?.href).find(x=>/^https:/i.test(String(x||'')))||''),href=/^https:/i.test(primary)?primary:alternate;return{key,href,type:v?.type?String(v.type):null,roles:arr(v?.roles),title:v?.title?String(v.title):null,originalHref:primary||null,hrefAuthority:href===primary?'PRIMARY_HTTPS':href?'STAC_ALTERNATE_HTTPS':'UNRESOLVED'}}).filter(x=>x.href)}
export async function sarAssetProbeR325(url){
 const collection=String(url.searchParams.get('collection')||'').toLowerCase(),productId=safeId(url.searchParams.get('productId')),requestedKey=safeKey(url.searchParams.get('assetKey'));
 const started=Date.now(),base={schema:SAR_ASSET_PROBE_SCHEMA_R325,revision:'R325',verifiedAt:new Date().toISOString(),collection,productId,assetKey:requestedKey||null};
 if(!COLLECTIONS.has(collection)||!productId)return{ok:false,...base,state:'INVALID_REQUEST',truthBoundary:'Only exact Sentinel-1 STAC product identities may be probed. No arbitrary remote URL is accepted.'};
 const itemUrl=`${STAC_ROOT}/collections/${encodeURIComponent(collection)}/items/${encodeURIComponent(productId)}`;
 try{
  const itemResponse=await fetch(itemUrl,{headers:{accept:'application/geo+json,application/json','user-agent':'OMEGAv6-R325/1.0'},cf:{cacheTtl:0,cacheEverything:false}}),raw=await itemResponse.text();
  if(!itemResponse.ok)throw new Error(`STAC ITEM HTTP ${itemResponse.status}`);
  const item=JSON.parse(raw),assets=normalizedAssets(item),candidates=assets.filter(a=>a.roles.some(r=>/data/i.test(r))||/tiff|geotiff|octet-stream/i.test(a.type||'')||/\.tiff?(?:$|\?)/i.test(a.href));
  const asset=requestedKey?assets.find(a=>a.key===requestedKey):candidates[0];
  if(!asset)return{ok:false,...base,state:'NO_DATA_ASSET',latencyMs:Date.now()-started,itemUrl,availableAssetKeys:assets.map(a=>a.key),truthBoundary:'The exact STAC item returned no matching HTTPS data asset. OMEGA does not substitute a preview or unrelated raster.'};
  if(!trustedAssetUrl(asset.href))return{ok:false,...base,assetKey:asset.key,state:'UNTRUSTED_ASSET_ORIGIN',latencyMs:Date.now()-started,itemUrl,asset:{key:asset.key,type:asset.type,roles:asset.roles,href:asset.href,originalHref:asset.originalHref,hrefAuthority:asset.hrefAuthority},truthBoundary:'Asset probing is restricted to HTTPS Copernicus origins resolved from the exact STAC item, including only STAC-declared alternate HTTPS locations when the canonical asset href is S3.'};
  const response=await fetch(asset.href,{headers:{accept:'*/*',range:`bytes=0-${MAX_PREFIX-1}`,'user-agent':'OMEGAv6-R325/1.0'},cf:{cacheTtl:0,cacheEverything:false}});
  const status=response.status,contentType=response.headers.get('content-type')||null,contentLength=response.headers.get('content-length'),contentRange=response.headers.get('content-range'),acceptRanges=response.headers.get('accept-ranges')||null,etag=response.headers.get('etag')||null,lastModified=response.headers.get('last-modified')||null;
  if(status===401||status===403){try{await response.body?.cancel()}catch{};return{ok:false,...base,assetKey:asset.key,state:'AUTH_REQUIRED',latencyMs:Date.now()-started,itemUrl,asset:{key:asset.key,type:asset.type,roles:asset.roles,href:asset.href,originalHref:asset.originalHref,hrefAuthority:asset.hrefAuthority},http:{status,contentType,contentLength,contentRange,acceptRanges,etag,lastModified},truthBoundary:'The exact asset exists but current cloud credentials do not authorize byte access. Catalogue identity is preserved; native pixels remain unbound.'}}
  if(!(response.ok||status===206)){try{await response.body?.cancel()}catch{};return{ok:false,...base,assetKey:asset.key,state:'ASSET_UNAVAILABLE',latencyMs:Date.now()-started,itemUrl,asset:{key:asset.key,type:asset.type,roles:asset.roles,href:asset.href,originalHref:asset.originalHref,hrefAuthority:asset.hrefAuthority},http:{status,contentType,contentLength,contentRange,acceptRanges,etag,lastModified},truthBoundary:'The exact asset pointer was resolved but no readable byte prefix returned.'}}
  const prefix=await readPrefix(response),prefixHash=await sha256Bytes(prefix),tiff=tiffProbe(prefix),rangeVerified=status===206&&!!contentRange;
  return{ok:true,...base,assetKey:asset.key,state:tiff.recognized?'NATIVE_CONTAINER_PREFIX_BOUND':'BYTE_PREFIX_BOUND',latencyMs:Date.now()-started,itemUrl,asset:{key:asset.key,type:asset.type,roles:asset.roles,href:asset.href,originalHref:asset.originalHref,hrefAuthority:asset.hrefAuthority},http:{status,contentType,contentLength,contentRange,acceptRanges,etag,lastModified},prefix:{bytes:prefix.byteLength,sha256:prefixHash,rangeVerified},tiff,nativeByteEvidenceBound:prefix.byteLength>0,nativeDataBound:false,derivedFieldBound:false,truthBoundary:'R325 binds and hashes only the returned prefix bytes of the exact STAC asset and inspects the container signature. This proves byte reachability and container identity, not decoded pixels, calibration, complex phase, coherence, deformation or any derived field.'};
 }catch(e){return{ok:false,...base,state:'PROBE_FAILED',latencyMs:Date.now()-started,error:e instanceof Error?e.message:String(e),truthBoundary:'Probe failure remains explicit; no native or derived field is fabricated.'}}
}
