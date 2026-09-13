export const SAR_LIVE_CATALOG_SCHEMA_R285='OMEGA_SAR_LIVE_CATALOG_R285';
export const CDSE_STAC_SEARCH_R285='https://stac.dataspace.copernicus.eu/v1/search';
const COLLECTIONS=Object.freeze({GRD:'sentinel-1-grd',SLC:'sentinel-1-slc'});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
const arr=v=>Array.isArray(v)?v.map(String):v==null?[]:[String(v)];
const num=v=>Number.isFinite(Number(v))?Number(v):null;
async function sha256(value){const bytes=new TextEncoder().encode(JSON.stringify(value));const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function assetRows(item){return Object.entries(item?.assets||{}).map(([key,v])=>({key,href:String(v?.href||''),type:v?.type?String(v.type):null,roles:arr(v?.roles),title:v?.title?String(v.title):null})).filter(x=>x.href&&/^https:/.test(x.href))}
function boundedPointBbox(lat,lon,requestedSpan){const lonRoom=Math.max(0,180-Math.abs(lon)),latRoom=Math.max(0,90-Math.abs(lat)),room=Math.min(lonRoom,latRoom),effectiveSpan=Math.min(requestedSpan,room);if(effectiveSpan>0)return{bbox:[Number((lon-effectiveSpan).toFixed(5)),Number((lat-effectiveSpan).toFixed(5)),Number((lon+effectiveSpan).toFixed(5)),Number((lat+effectiveSpan).toFixed(5))],requestedSpan,effectiveSpan,boundaryLimited:effectiveSpan+1e-9<requestedSpan,centerPreserved:true};const epsilon=.01;return{bbox:[Number(clamp(lon-epsilon,-180,180).toFixed(5)),Number(clamp(lat-epsilon,-90,90).toFixed(5)),Number(clamp(lon+epsilon,-180,180).toFixed(5)),Number(clamp(lat+epsilon,-90,90).toFixed(5))],requestedSpan,effectiveSpan:epsilon,boundaryLimited:true,centerPreserved:false}}
function normalizeItem(item){
 const p=item?.properties||{},assets=assetRows(item),links=Array.isArray(item?.links)?item.links:[],self=links.find(x=>x?.rel==='self')?.href||null;
 const preview=assets.find(x=>x.roles.some(r=>/thumbnail|overview|visual/i.test(r))||/^image\/(jpeg|jpg|png|webp)$/i.test(x.type||''))||null;
 const dataAssets=assets.filter(x=>x.roles.some(r=>/data/i.test(r))||/tiff|geotiff|octet-stream/i.test(x.type||''));
 return{
  id:String(item?.id||''),collection:String(item?.collection||''),catalogUrl:String(self||''),acquiredAt:p.datetime?String(p.datetime):p.start_datetime?String(p.start_datetime):null,
  platform:p.platform?String(p.platform):null,constellation:p.constellation?String(p.constellation):null,instrumentMode:p['sar:instrument_mode']?String(p['sar:instrument_mode']):null,
  frequencyBand:p['sar:frequency_band']?String(p['sar:frequency_band']):null,centerFrequencyGHz:num(p['sar:center_frequency']),polarizations:arr(p['sar:polarizations']),orbitState:p['sat:orbit_state']?String(p['sat:orbit_state']):null,
  relativeOrbit:num(p['sat:relative_orbit']),incidenceAngle:num(p['view:incidence_angle']),bbox:Array.isArray(item?.bbox)?item.bbox.map(Number):null,geometry:item?.geometry||null,
  previewUrl:preview?.href||null,previewAssetKey:preview?.key||null,assetCount:assets.length,dataAssetCount:dataAssets.length,assets,
  catalogOnly:true,sourceEvidenceBound:false,nativeDataBound:false,complexDataBound:false,truth:'CATALOG_DISCOVERY_ONLY'
 };
}
export async function sarCatalogR285(url){
 const lat=clamp(Number(url.searchParams.get('lat')||0),-90,90),lon=clamp(Number(url.searchParams.get('lon')||0),-180,180),days=Math.round(clamp(Number(url.searchParams.get('days')||60),1,180)),limit=Math.round(clamp(Number(url.searchParams.get('limit')||12),1,30)),product=String(url.searchParams.get('product')||'GRD').toUpperCase()==='SLC'?'SLC':'GRD',span=clamp(Number(url.searchParams.get('span')||0.45),0.05,2),window=boundedPointBbox(lat,lon,span);
 const collection=COLLECTIONS[product],now=new Date(),start=new Date(now.getTime()-days*86400000),body={collections:[collection],bbox:window.bbox,datetime:`${start.toISOString()}/${now.toISOString()}`,limit};
 const started=Date.now();
 try{
  const response=await fetch(CDSE_STAC_SEARCH_R285,{method:'POST',headers:{'accept':'application/geo+json,application/json','content-type':'application/json','user-agent':'OMEGAv6-R309/1.0'},body:JSON.stringify(body),cf:{cacheTtl:0,cacheEverything:false}}),raw=await response.text();
  if(!response.ok)throw new Error(`CDSE STAC HTTP ${response.status}`);
  const parsed=JSON.parse(raw),features=Array.isArray(parsed?.features)?parsed.features:[],products=features.map(normalizeItem).filter(x=>x.id).sort((a,b)=>Date.parse(b.acquiredAt||'')-Date.parse(a.acquiredAt||''));
  const payload={ok:true,schema:SAR_LIVE_CATALOG_SCHEMA_R285,revision:'R309',state:products.length?'CATALOG_RETURNED':'NO_MATCHING_ACQUISITIONS',verifiedAt:new Date().toISOString(),latencyMs:Date.now()-started,target:{lat,lon,crs:'WGS84 / EPSG:4326'},query:{product,collection,days,limit,bbox:body.bbox,datetime:body.datetime,requestedSpan:window.requestedSpan,effectiveSpan:window.effectiveSpan,boundaryLimited:window.boundaryLimited,centerPreserved:window.centerPreserved},source:{provider:'Copernicus Data Space Ecosystem STAC',endpoint:CDSE_STAC_SEARCH_R285},products,latest:products[0]||null,truthBoundary:'Returned STAC records and HTTPS asset pointers are real acquisition catalogue metadata. Asset discovery does not prove product bytes, calibrated backscatter, complex I/Q, phase, coherence, deformation, elevation or any other measurement array. Native/derived fields remain unavailable until exact asset bytes and processing lineage are bound and verified.'};
  payload.evidenceHash=await sha256(payload);return payload;
 }catch(e){
  const payload={ok:false,schema:SAR_LIVE_CATALOG_SCHEMA_R285,revision:'R309',state:'UPSTREAM_UNAVAILABLE',verifiedAt:new Date().toISOString(),latencyMs:Date.now()-started,target:{lat,lon,crs:'WGS84 / EPSG:4326'},query:{product,collection,days,limit,bbox:body.bbox,datetime:body.datetime,requestedSpan:window.requestedSpan,effectiveSpan:window.effectiveSpan,boundaryLimited:window.boundaryLimited,centerPreserved:window.centerPreserved},source:{provider:'Copernicus Data Space Ecosystem STAC',endpoint:CDSE_STAC_SEARCH_R285},products:[],latest:null,error:e instanceof Error?e.message:String(e),truthBoundary:'Upstream catalogue failure is shown as unavailable. OMEGA does not substitute fabricated acquisitions, asset pointers or pixels.'};
  payload.evidenceHash=await sha256(payload);return payload;
 }
}