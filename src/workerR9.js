import r8 from './workerR8.js';

const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const GROUND_PROVIDER_TIMEOUT_MS=12000;
const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:JSON_HEADERS});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(Number(n))?Number(n):a));
const txt=v=>String(v??'').trim();
async function hash(value){const d=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return [...new Uint8Array(d)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function getJson(url,headers={}){const started=Date.now();try{const r=await fetch(url,{headers:{accept:'application/json','user-agent':'OMEGAv6/1.0 (+bounded Earth evidence)',...headers},cf:{cacheTtl:0,cacheEverything:false},signal:AbortSignal.timeout(GROUND_PROVIDER_TIMEOUT_MS)}),raw=await r.text();if(!r.ok)throw Error(`HTTP ${r.status}`);return{ok:true,data:JSON.parse(raw),source:url,verifiedAt:new Date().toISOString(),latencyMs:Date.now()-started}}catch(e){const timedOut=e?.name==='TimeoutError'||e?.name==='AbortError';return{ok:false,error:timedOut?`PROVIDER_TIMEOUT_${GROUND_PROVIDER_TIMEOUT_MS}MS`:e instanceof Error?e.message:String(e),source:url,verifiedAt:new Date().toISOString(),latencyMs:Date.now()-started}}}
function nearestKarta(raw,lat,lon){const lists=[raw?.result?.data,raw?.result,raw?.data,raw?.photos,raw?.result?.photos].filter(Array.isArray);const rows=(lists[0]||[]).map(x=>{const d=x?.data||x,la=Number(d?.lat??d?.latitude??d?.matchLat),lo=Number(d?.lng??d?.lon??d?.longitude??d?.matchLng);return{raw:d,lat:la,lon:lo}}).filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lon));const dist=(a,b,c,d)=>{const R=6371008.8,p=Math.PI/180,q1=a*p,q2=c*p,dq=(c-a)*p,dl=(d-b)*p,s=Math.sin(dq/2)**2+Math.cos(q1)*Math.cos(q2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(s)))};rows.sort((a,b)=>dist(lat,lon,a.lat,a.lon)-dist(lat,lon,b.lat,b.lon));const x=rows[0];if(!x)return null;const d=x.raw,id=d?.id??d?.photoId??d?.sequenceIndex??null,file=d?.fileurlProc??d?.fileurlLTh??d?.fileurlTh??d?.fileUrl??d?.imageUrl??null;return{id,lat:x.lat,lon:x.lon,distanceM:Number(dist(lat,lon,x.lat,x.lon).toFixed(1)),shotDate:d?.shotDate??d?.date??null,heading:Number.isFinite(Number(d?.heading))?Number(d.heading):null,sequenceId:d?.sequenceId??d?.sequence?.id??null,projection:d?.projection??null,imageUrl:typeof file==='string'&&/^https:/.test(file)?file:null,truth:'RETURNED_KARTAVIEW_METADATA'}}
function epqsElevation(raw){const candidates=[raw?.value,raw?.elevation,raw?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation,raw?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation_Data_Source].filter(v=>v!==undefined);const n=Number(candidates.find(v=>Number.isFinite(Number(v))));return Number.isFinite(n)?n:null}
function osmSummary(raw){const rows=Array.isArray(raw?.elements)?raw.elements:[],roads=rows.filter(x=>x.tags?.highway),buildings=rows.filter(x=>x.tags?.building),places=rows.filter(x=>x.tags?.place);return{elements:rows.length,roadElements:roads.length,buildingElements:buildings.length,placeElements:places.length,roadNames:[...new Set(roads.map(x=>x.tags?.name).filter(Boolean))].slice(0,20),placeNames:[...new Set(places.map(x=>x.tags?.name).filter(Boolean))].slice(0,12)}}
function sourceEnvelope(provider,{returned=false,state='NO_EVIDENCE_RETURNED',detail=null}={}){return{ok:provider.ok,transportOk:provider.ok,reachable:provider.ok,evidenceReturned:Boolean(provider.ok&&returned),state:provider.ok?state:'PROVIDER_UNAVAILABLE',detail:detail||null,source:provider.source,verifiedAt:provider.verifiedAt,latencyMs:provider.latencyMs,error:provider.error||null}}
function boundedGibsWindow(lat,lon,requestedSpan){const lonRoom=Math.max(0,180-Math.abs(lon)),latRoom=Math.max(0,(90-Math.abs(lat))/.65),room=Math.min(lonRoom,latRoom),effectiveSpan=Math.min(requestedSpan,room);if(effectiveSpan>0)return{requestedSpan,effectiveSpan,minLon:lon-effectiveSpan,maxLon:lon+effectiveSpan,minLat:lat-effectiveSpan*.65,maxLat:lat+effectiveSpan*.65,boundaryLimited:effectiveSpan+1e-9<requestedSpan,centerPreserved:true};const epsilon=.01,minLon=clamp(lon-epsilon,-180,180),maxLon=clamp(lon+epsilon,-180,180),minLat=clamp(lat-epsilon*.65,-90,90),maxLat=clamp(lat+epsilon*.65,-90,90);return{requestedSpan,effectiveSpan:epsilon,minLon,maxLon,minLat,maxLat,boundaryLimited:true,centerPreserved:false}}
async function groundEvidence(url){const lat=clamp(Number(url.searchParams.get('lat')||0),-90,90),lon=clamp(Number(url.searchParams.get('lon')||0),-180,180),radius=clamp(Number(url.searchParams.get('radius')||750),100,2000);
 const kartaUrl=`https://api.openstreetcam.org/2.0/photo/?lat=${lat}&lng=${lon}&radius=${radius}&join=sequence&orderBy=id&orderDirection=desc`;
 const epqsUrl=`https://epqs.nationalmap.gov/v1/json?x=${lon}&y=${lat}&wkid=4326&units=Meters&includeDate=false`;
 const reverseUrl=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
 const q=`[out:json][timeout:12];(way(around:${Math.round(radius)},${lat},${lon})[highway];way(around:${Math.round(radius)},${lat},${lon})[building];node(around:${Math.round(radius)},${lat},${lon})[place];);out tags center 300;`;
 const overpassUrl=`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;
 const [karta,epqs,reverse,osm]=await Promise.all([getJson(kartaUrl),getJson(epqsUrl),getJson(reverseUrl),getJson(overpassUrl)]);
 const address=reverse.ok?{displayName:reverse.data?.display_name||null,road:reverse.data?.address?.road||reverse.data?.address?.pedestrian||null,neighbourhood:reverse.data?.address?.neighbourhood||reverse.data?.address?.suburb||null,city:reverse.data?.address?.city||reverse.data?.address?.town||reverse.data?.address?.village||null,state:reverse.data?.address?.state||null,country:reverse.data?.address?.country||null,countryCode:reverse.data?.address?.country_code||null}:null;
 const elevation=epqs.ok?epqsElevation(epqs.data):null,kartaMetadata=karta.ok?nearestKarta(karta.data,lat,lon):null,kartaPhoto=kartaMetadata?.imageUrl?kartaMetadata:null,osmContext=osm.ok?osmSummary(osm.data):null,reverseReturned=Boolean(address&&(address.displayName||address.road||address.city||address.state||address.country)),overpassReturned=Boolean(osm.ok&&Array.isArray(osm.data?.elements));
 const payload={schema:'OMEGA_EARTH_GROUND_EVIDENCE_V1',revision:'R309',target:{lat,lon,radiusM:radius,crs:'WGS84 / EPSG:4326'},verifiedAt:new Date().toISOString(),levels:{EARTH:{state:'WGS84_TARGET'},REGION:{state:reverseReturned?'RETURNED_OSM_REVERSE':'UNAVAILABLE',address:reverseReturned?address:null},CITY:{state:address?.city?'RETURNED_OSM_REVERSE':'UNAVAILABLE',name:address?.city||null},STREET:{state:kartaPhoto?'RETURNED_KARTAVIEW_PHOTO':address?.road?'RETURNED_OSM_ROAD_ONLY':'UNAVAILABLE',photo:kartaPhoto,returnedMetadata:kartaMetadata,road:address?.road||null},GROUND:{state:elevation!==null?'RETURNED_USGS_ELEVATION':overpassReturned?'RETURNED_OSM_CONTEXT_ONLY':'UNAVAILABLE',elevationM:elevation,osm:osmContext}},sources:{kartaView:sourceEnvelope(karta,{returned:Boolean(kartaPhoto),state:kartaPhoto?'EVIDENCE_RETURNED':'REACHABLE_NO_IMAGE',detail:kartaMetadata&&!kartaPhoto?'Geotagged metadata returned without an admissible HTTPS image asset.':!kartaMetadata&&karta.ok?'Provider responded but no nearby geotagged frame matched the bounded query.':null}),usgsEpqs:sourceEnvelope(epqs,{returned:elevation!==null,state:elevation!==null?'EVIDENCE_RETURNED':'REACHABLE_NO_NUMERIC_ELEVATION',detail:epqs.ok&&elevation===null?'Provider responded but no numeric elevation was admitted.':null}),osmReverse:sourceEnvelope(reverse,{returned:reverseReturned,state:reverseReturned?'EVIDENCE_RETURNED':'REACHABLE_NO_ADDRESS',detail:reverse.ok&&!reverseReturned?'Provider responded without a usable reverse-geocoded address.':null}),osmOverpass:sourceEnvelope(osm,{returned:overpassReturned,state:overpassReturned?(osmContext?.elements?'EVIDENCE_RETURNED':'RETURNED_EMPTY'):'REACHABLE_INVALID_ENVELOPE',detail:overpassReturned&&osmContext?.elements===0?'Valid bounded OSM query returned zero matching map elements.':null})},truthBoundary:'Earth→Region→City→Street→Ground is a navigation/evidence hierarchy. Provider reachability is not evidence return. Street imagery is shown only when KartaView returned an actual HTTPS geotagged image asset. Elevation is shown only when USGS EPQS returned a numeric value. Valid empty OSM queries remain returned-empty evidence. Missing ground evidence is never generated or inferred.'};payload.evidenceHash=await hash(payload);return payload}
function gibsDate(value){
 const input=txt(value);
 // A specified day is authority, never an invitation to substitute yesterday.
 if(input){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input))return null;
  const epoch=Date.parse(input+'T00:00:00Z');
  return Number.isFinite(epoch)&&new Date(epoch).toISOString().slice(0,10)===input?input:null;
 }
 return new Date(Date.now()-86400000).toISOString().slice(0,10);
}
function admittedGibsDateR782(url){
 const explicit=url.searchParams.has('date');
 const date=explicit?gibsDate(url.searchParams.get('date')):gibsDate(null);
 return {explicit,date:explicit&&!txt(url.searchParams.get('date'))?null:date};
}
async function gibsImage(url){const admitted=admittedGibsDateR782(url);if(!admitted.date)return json({ok:false,code:'GIBS_INVALID_EXPLICIT_DATE',truth:'NO_DATE_SUBSTITUTION'},400);const lat=clamp(Number(url.searchParams.get('lat')||0),-90,90),lon=clamp(Number(url.searchParams.get('lon')||0),-180,180),date=admitted.date,span=clamp(Number(url.searchParams.get('span')||4),.25,20),width=Math.round(clamp(Number(url.searchParams.get('width')||900),256,1400)),height=Math.round(clamp(Number(url.searchParams.get('height')||600),256,1000)),window=boundedGibsWindow(lat,lon,span);
 const params=new URLSearchParams({SERVICE:'WMS',REQUEST:'GetMap',VERSION:'1.1.1',LAYERS:'VIIRS_SNPP_CorrectedReflectance_TrueColor',STYLES:'',FORMAT:'image/jpeg',TRANSPARENT:'FALSE',SRS:'EPSG:4326',BBOX:`${window.minLon},${window.minLat},${window.maxLon},${window.maxLat}`,WIDTH:String(width),HEIGHT:String(height),TIME:date});
 const requestedLayer=url.searchParams.get('layer')||'VIIRS_SNPP_CorrectedReflectance_TrueColor';if(!['VIIRS_SNPP_CorrectedReflectance_TrueColor','MODIS_Terra_CorrectedReflectance_TrueColor','MODIS_Aqua_CorrectedReflectance_TrueColor'].includes(requestedLayer))return json({ok:false,code:'GIBS_UNSUPPORTED_LAYER',truth:'NO_SOURCE_SUBSTITUTION'},400);params.set('LAYERS',requestedLayer);const source=`https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params}`;try{const r=await fetch(source,{cf:{cacheTtl:300,cacheEverything:false}}),ct=r.headers.get('content-type')||'';if(!r.ok||!ct.startsWith('image/'))return json({ok:false,code:'GIBS_IMAGE_UNAVAILABLE',date,status:r.status,contentType:ct,window,truth:'NO_SYNTHETIC_SUBSTITUTE'},502);return new Response(r.body,{status:200,headers:{'content-type':ct,'cache-control':'public,max-age=300','x-omega-source':'NASA-GIBS-'+requestedLayer,'x-omega-layer':requestedLayer,'x-omega-date':date,'x-omega-crs':'EPSG:4326','x-omega-bbox':`${window.minLon},${window.minLat},${window.maxLon},${window.maxLat}`,'x-omega-requested-span':String(window.requestedSpan),'x-omega-effective-span':String(window.effectiveSpan),'x-omega-boundary-limited':String(window.boundaryLimited),'x-omega-center-preserved':String(window.centerPreserved)}})}catch(e){return json({ok:false,code:'GIBS_FETCH_FAILED',date,error:e instanceof Error?e.message:String(e),window,truth:'NO_SYNTHETIC_SUBSTITUTE'},502)}}

const GIBS_GLOBAL_MIN_BYTES_R780=12000,GIBS_GLOBAL_MAX_BYTES_R780=8*1024*1024;
function validGibsJpegStructureR781(bytes){
 const n=bytes.length;
 if(n<16||bytes[0]!==255||bytes[1]!==216||bytes[n-2]!==255||bytes[n-1]!==217)return false;
 let i=2,seenFrame=false,seenScan=false;
 while(i<n-2){
  if(bytes[i++]!==255)return false;
  while(i<n-2&&bytes[i]===255)i++;
  const marker=bytes[i++];
  if(marker===0||marker===216||marker===217||marker===1||marker>=208&&marker<=215)return false;
  if(i+2>n-2)return false;
  const size=bytes[i]*256+bytes[i+1];
  if(size<2||i+size>n-2)return false;
  if([192,193,194,195,198,199,201,202,203,205,206,207].includes(marker)){
   if(size<8||bytes[i+3]*256+bytes[i+4]===0||bytes[i+5]*256+bytes[i+6]===0)return false;
   seenFrame=true;
  }
  if(marker===218){
   seenScan=true;
   // Scan payload is entropy coded; a container boundary check does not
   // replace a full decoder or prove the imagery depicts an observation.
   return seenFrame&&i+size<n-2;
  }
  i+=size;
 }
 return seenFrame&&seenScan;
}
function validGibsPngStructureR781(bytes){
 const n=bytes.length,sig=[137,80,78,71,13,10,26,10];
 if(n<57||!sig.every((b,i)=>bytes[i]===b))return false;
 const u32=i=>(bytes[i]*16777216+bytes[i+1]*65536+bytes[i+2]*256+bytes[i+3])>>>0;
 let i=8,seenHeader=false,seenData=false,seenEnd=false,chunkCount=0;
 while(i+12<=n&&chunkCount++<2048){
  const length=u32(i),type=i+4,data=i+8,crcAt=data+length;
  if(length>n-data-4)return false;
  // Standard PNG CRC32 over four-byte chunk type and chunk data.
  let crc=0xffffffff;
  for(let j=type;j<crcAt;j++){
   crc^=bytes[j];
   for(let k=0;k<8;k++)crc=(crc>>>1)^(crc&1?0xedb88320:0);
  }
  if(((crc^0xffffffff)>>>0)!==u32(crcAt))return false;
  const tag=String.fromCharCode(...bytes.subarray(type,type+4));
  if(!seenHeader){
   if(tag!=='IHDR'||length!==13||u32(data)===0||u32(data+4)===0)return false;
   seenHeader=true;
  }else if(tag==='IDAT'){
   if(seenEnd||length===0)return false;
   seenData=true;
  }else if(tag==='IEND'){
   if(!seenData||length!==0||crcAt+4!==n)return false;
   seenEnd=true;
   break;
  }else if(seenEnd)return false;
  i=crcAt+4;
 }
 return seenHeader&&seenData&&seenEnd;
}
function validGibsGlobalRasterR780(bytes,contentType){
 if(bytes.byteLength<GIBS_GLOBAL_MIN_BYTES_R780||bytes.byteLength>GIBS_GLOBAL_MAX_BYTES_R780)return false;
 const ct=String(contentType||'').toLowerCase().split(';')[0].trim();
 return (ct==='image/jpeg'||ct==='image/jpg')?validGibsJpegStructureR781(bytes)
  :ct==='image/png'&&validGibsPngStructureR781(bytes);
}
const GLOBAL_GIBS_SENSORS_R821=Object.freeze({
 NOAA21:{layer:'VIIRS_NOAA21_CorrectedReflectance_TrueColor',source:'NASA-GIBS-VIIRS-NOAA21-TRUECOLOR-GLOBAL'},
 NOAA20:{layer:'VIIRS_NOAA20_CorrectedReflectance_TrueColor',source:'NASA-GIBS-VIIRS-NOAA20-TRUECOLOR-GLOBAL'},
 SNPP:{layer:'VIIRS_SNPP_CorrectedReflectance_TrueColor',source:'NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL'}
});
async function gibsGlobalImage(url){
 const admitted=admittedGibsDateR782(url);
 if(!admitted.date)return json({ok:false,code:'GIBS_INVALID_EXPLICIT_DATE',truth:'NO_DATE_SUBSTITUTION'},400);
 const requestedDate=admitted.explicit;
 const initialDate=admitted.date;
 const epoch=Date.parse(initialDate+'T00:00:00Z');
 const width=Math.round(clamp(Number(url.searchParams.get('width')||1440),720,2048));
 const height=Math.round(clamp(Number(url.searchParams.get('height')||720),360,1024));
 const sensor=txt(url.searchParams.get('sensor')).toUpperCase();
 if(sensor&&!Object.hasOwn(GLOBAL_GIBS_SENSORS_R821,sensor))return json({ok:false,code:'GIBS_UNSUPPORTED_GLOBAL_SENSOR',truth:'NO_SENSOR_SUBSTITUTION'},400);
 // SNPP is historical and never the default latest source; a caller must
 // explicitly choose it and pin a date. NOAA-21 primary, NOAA-20 secondary.
 if(sensor==='SNPP'&&!requestedDate)return json({ok:false,code:'GIBS_SNPP_HISTORICAL_DATE_REQUIRED',truth:'NO_SENSOR_SUBSTITUTION'},400);
 const candidates=sensor?[sensor]:['NOAA21','NOAA20'];
 const attempts=[];
 // Explicit dates are never silently substituted; implicit dates may search
 // at most six preceding calendar days for each independently named sensor.
 for(let lookback=0;lookback<(requestedDate?1:7);lookback++){
  const date=Number.isFinite(epoch)?new Date(epoch-lookback*86400000).toISOString().slice(0,10):initialDate;
  for(const name of candidates){
   const sensorConfig=GLOBAL_GIBS_SENSORS_R821[name];
   const params=new URLSearchParams({SERVICE:'WMS',REQUEST:'GetMap',VERSION:'1.1.1',LAYERS:sensorConfig.layer,STYLES:'',FORMAT:'image/jpeg',TRANSPARENT:'FALSE',SRS:'EPSG:4326',BBOX:'-180,-90,180,90',WIDTH:String(width),HEIGHT:String(height),TIME:date});
   const source='https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?'+params;
   try{
    const response=await fetch(source,{cf:{cacheTtl:900,cacheEverything:false},signal:AbortSignal.timeout(10000)});
    const ct=response.headers.get('content-type')||'';
    if(!response.ok||!ct.startsWith('image/')){attempts.push({date,sensor:name,code:'UPSTREAM_NOT_IMAGE',status:response.status,contentType:ct});continue;}
    const bytes=new Uint8Array(await response.arrayBuffer());
    if(!validGibsGlobalRasterR780(bytes,ct)){attempts.push({date,sensor:name,code:'NO_VALID_OBSERVED_RASTER',bytes:bytes.byteLength,contentType:ct});continue;}
    return new Response(bytes,{status:200,headers:{'content-type':ct,'cache-control':'public,max-age=900','x-omega-source':sensorConfig.source,'x-omega-sensor':name,'x-omega-layer':sensorConfig.layer,'x-omega-date':date,'x-omega-crs':'EPSG:4326','x-omega-bbox':'-180,-90,180,90','x-omega-truth':'RETURNED_GLOBAL_OBSERVATION','x-omega-lookback-days':String(lookback)}});
   }catch(error){attempts.push({date,sensor:name,code:'UPSTREAM_FETCH_FAILED',error:error instanceof Error?error.name:'UNKNOWN'});}
  }
 }
 return json({ok:false,code:'GIBS_GLOBAL_NO_VALID_OBSERVATION',requestedDate:initialDate,attempts,truth:'NO_SYNTHETIC_SUBSTITUTE'},502);
}
async function fetchR9(request,env){const url=new URL(request.url);if(url.pathname==='/api/earth/ground/evidence'&&request.method==='GET')return json(await groundEvidence(url));if(url.pathname==='/api/earth/gibs/image'&&request.method==='GET')return gibsImage(url);if(url.pathname==='/api/earth/gibs/global'&&request.method==='GET')return gibsGlobalImage(url);return r8.fetch(request,env)}
export default{fetch:fetchR9};
