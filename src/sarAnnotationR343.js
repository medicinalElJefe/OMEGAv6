export const SAR_ANNOTATION_SCHEMA_R343='OMEGA_SAR_ANNOTATION_R343';
const STAC_ROOT='https://stac.dataspace.copernicus.eu/v1';
const COLLECTIONS=new Set(['sentinel-1-grd','sentinel-1-slc']);
const MAX_XML_BYTES=8*1024*1024;
const safeId=v=>{const s=String(v||'').trim();return /^[A-Za-z0-9._:-]{1,240}$/.test(s)?s:''};
const safePol=v=>{const s=String(v||'').trim().toLowerCase();return /^(vv|vh|hh|hv)$/.test(s)?s:''};
const arr=v=>Array.isArray(v)?v.map(String):v==null?[]:[String(v)];
const nums=s=>String(s||'').trim().split(/\s+/).map(Number).filter(Number.isFinite);
const textTag=(xml,name)=>{const m=String(xml).match(new RegExp('<(?:\\w+:)?'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?'+name+'>','i'));return m?m[1].trim():''};
const blocks=(xml,name)=>[...String(xml).matchAll(new RegExp('<(?:\\w+:)?'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?'+name+'>','gi'))].map(m=>m[1]);
async function sha256Text(s){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function trusted(href){try{const u=new URL(href);const h=u.hostname.toLowerCase();return u.protocol==='https:'&&(h==='copernicus.eu'||h.endsWith('.copernicus.eu'))}catch{return false}}
function normalizedAssets(item){return Object.entries(item?.assets||{}).map(([key,v])=>{const primary=String(v?.href||''),alternate=String(v?.alternate?.https?.href||Object.values(v?.alternate||{}).map(x=>x?.href).find(x=>/^https:/i.test(String(x||'')))||''),href=/^https:/i.test(primary)?primary:alternate;return{key,href,type:v?.type?String(v.type):null,roles:arr(v?.roles),title:v?.title?String(v.title):null}}).filter(x=>x.href&&trusted(x.href))}
function classify(a){const s=(a.key+' '+(a.title||'')+' '+a.href).toLowerCase();if(/calibration[-_/]|\/calibration\//.test(s))return'CALIBRATION';if(/noise[-_/]|\/noise\//.test(s))return'NOISE';if(/annotation/.test(s)&&/\.xml(?:$|\?)/.test(s))return'PRODUCT_ANNOTATION';if(/manifest\.safe/.test(s))return'MANIFEST';return'OTHER'}
function polMatch(a,pol){if(!pol)return true;const s=(a.key+' '+(a.title||'')+' '+a.href).toLowerCase();return new RegExp('(?:^|[-_/])'+pol+'(?:[-_.?/]|$)').test(s)}
async function fetchTextAsset(a){const r=await fetch(a.href,{headers:{accept:'application/xml,text/xml,text/plain,*/*','user-agent':'OMEGAv6-R343/1.0'},cf:{cacheTtl:0,cacheEverything:false}}),len=Number(r.headers.get('content-length')||0);if(!r.ok)throw new Error('ANNOTATION_HTTP_'+r.status);if(len>MAX_XML_BYTES)throw new Error('ANNOTATION_TOO_LARGE_'+len);const raw=await r.text();if(raw.length>MAX_XML_BYTES)throw new Error('ANNOTATION_TOO_LARGE_'+raw.length);return{raw,sha256:await sha256Text(raw),contentType:r.headers.get('content-type')||null,bytes:new TextEncoder().encode(raw).byteLength}}
function parseCalibration(xml){
 const rows=blocks(xml,'calibrationVector').map(b=>({line:Number(textTag(b,'line')),pixels:nums(textTag(b,'pixel')),beta0:nums(textTag(b,'betaNought')),sigma0:nums(textTag(b,'sigmaNought')),gamma0:nums(textTag(b,'gamma')),dn:nums(textTag(b,'dn'))})).filter(r=>Number.isFinite(r.line)&&r.pixels.length);
 const valid=rows.filter(r=>[r.beta0,r.sigma0,r.gamma0,r.dn].some(a=>a.length===r.pixels.length));
 return{absoluteCalibrationConstant:Number(textTag(xml,'absoluteCalibrationConstant')),vectors:valid,count:valid.length};
}
function parseNoise(xml){
 const range=blocks(xml,'noiseRangeVector').map(b=>({line:Number(textTag(b,'line')),pixels:nums(textTag(b,'pixel')),values:nums(textTag(b,'noiseRangeLut')||textTag(b,'noiseLut'))})).filter(r=>Number.isFinite(r.line)&&r.pixels.length&&r.values.length===r.pixels.length);
 const azimuth=blocks(xml,'noiseAzimuthVector').map(b=>({swath:textTag(b,'swath')||null,firstAzimuthLine:Number(textTag(b,'firstAzimuthLine')),lastAzimuthLine:Number(textTag(b,'lastAzimuthLine')),firstRangeSample:Number(textTag(b,'firstRangeSample')),lastRangeSample:Number(textTag(b,'lastRangeSample')),lines:nums(textTag(b,'line')),values:nums(textTag(b,'noiseAzimuthLut'))})).filter(r=>r.lines.length&&r.values.length===r.lines.length);
 return{rangeVectors:range,azimuthVectors:azimuth,rangeCount:range.length,azimuthCount:azimuth.length};
}
function parseProductAnnotation(xml){
 const bursts=blocks(xml,'burst').map(b=>({azimuthTime:textTag(b,'azimuthTime')||null,sensingTime:textTag(b,'sensingTime')||null,firstValidSample:nums(textTag(b,'firstValidSample')),lastValidSample:nums(textTag(b,'lastValidSample'))}));
 const orbits=blocks(xml,'orbit').map(b=>({time:textTag(b,'time')||null,position:{x:Number(textTag(textTag(b,'position'),'x')),y:Number(textTag(textTag(b,'position'),'y')),z:Number(textTag(textTag(b,'position'),'z'))},velocity:{x:Number(textTag(textTag(b,'velocity'),'x')),y:Number(textTag(textTag(b,'velocity'),'y')),z:Number(textTag(textTag(b,'velocity'),'z'))}})).filter(o=>[o.position.x,o.position.y,o.position.z,o.velocity.x,o.velocity.y,o.velocity.z].every(Number.isFinite));
 return{swath:textTag(xml,'swath')||null,polarisation:textTag(xml,'polarisation')||textTag(xml,'polarization')||null,radarFrequency:Number(textTag(xml,'radarFrequency')),azimuthTimeInterval:Number(textTag(xml,'azimuthTimeInterval')),rangePixelSpacing:Number(textTag(xml,'rangePixelSpacing')),azimuthPixelSpacing:Number(textTag(xml,'azimuthPixelSpacing')),slantRangeTime:Number(textTag(xml,'slantRangeTime')),linesPerBurst:Number(textTag(xml,'linesPerBurst')),samplesPerBurst:Number(textTag(xml,'samplesPerBurst')),bursts,orbits,burstCount:bursts.length,orbitCount:orbits.length};
}
export async function sarAnnotationR343(url){
 const collection=String(url.searchParams.get('collection')||'').toLowerCase(),productId=safeId(url.searchParams.get('productId')),polarization=safePol(url.searchParams.get('polarization'));
 const base={schema:SAR_ANNOTATION_SCHEMA_R343,revision:'R343',collection,productId,polarization:polarization||null,verifiedAt:new Date().toISOString()};
 if(!COLLECTIONS.has(collection)||!productId)return{ok:false,...base,state:'INVALID_REQUEST',truthBoundary:'R343 annotation ingress accepts only exact Sentinel-1 STAC product identities and optional VV/VH/HH/HV selection.'};
 const itemUrl=`${STAC_ROOT}/collections/${encodeURIComponent(collection)}/items/${encodeURIComponent(productId)}`;
 try{
  const ir=await fetch(itemUrl,{headers:{accept:'application/geo+json,application/json','user-agent':'OMEGAv6-R343/1.0'},cf:{cacheTtl:0,cacheEverything:false}}),raw=await ir.text();if(!ir.ok)throw new Error('STAC_ITEM_HTTP_'+ir.status);const item=JSON.parse(raw),assets=normalizedAssets(item),candidates=assets.map(a=>({...a,kind:classify(a)})).filter(a=>a.kind!=='OTHER'&&polMatch(a,polarization));
  if(!candidates.length)return{ok:false,...base,state:'ANNOTATION_ASSET_NOT_EXPOSED',itemUrl,availableAssetKeys:assets.map(a=>a.key),truthBoundary:'The exact STAC item does not expose calibration/noise/product-annotation XML as directly fetchable assets. OMEGA preserves the hold instead of deriving annotation URLs from filename guesses.'};
  const receipts=[];let calibration=null,noise=null,annotation=null;
  for(const a of candidates){if(!/xml|text/i.test(a.type||'')&&!/\.xml(?:$|\?)/i.test(a.href)&&a.kind!=='MANIFEST')continue;const f=await fetchTextAsset(a);const receipt={kind:a.kind,key:a.key,href:a.href,sha256:f.sha256,bytes:f.bytes,contentType:f.contentType};receipts.push(receipt);if(a.kind==='CALIBRATION'&&!calibration)calibration={...parseCalibration(f.raw),receipt};else if(a.kind==='NOISE'&&!noise)noise={...parseNoise(f.raw),receipt};else if(a.kind==='PRODUCT_ANNOTATION'&&!annotation)annotation={...parseProductAnnotation(f.raw),receipt}}
  const state=calibration||noise||annotation?'ANNOTATION_EVIDENCE_BOUND':'ANNOTATION_XML_UNAVAILABLE';
  return{ok:state==='ANNOTATION_EVIDENCE_BOUND',...base,state,itemUrl,receipts,calibration,noise,annotation,availableKinds:[...new Set(receipts.map(r=>r.kind))],truthBoundary:'R343 binds only XML assets explicitly returned by the exact STAC product. Parsed calibration/noise/burst/orbit values retain the source asset hash. Presence of annotations enables computation but does not itself prove radiometry, TOPS co-registration, unwrapping, terrain correction, atmosphere correction or deformation.'};
 }catch(e){return{ok:false,...base,state:'ANNOTATION_FETCH_FAILED',error:e instanceof Error?e.message:String(e),truthBoundary:'Annotation retrieval/parsing failure remains explicit. No calibration, burst, orbit or correction evidence is synthesized.'}}
}
export const R343_ANNOTATION_TESTABLE=Object.freeze({parseCalibration,parseNoise,parseProductAnnotation,classify,polMatch});
