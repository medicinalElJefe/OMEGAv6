import r3 from './sar-r3-worker.mjs';

const STATIC_FRESH_EXT=/\.(?:html?|mjs|js|css|json)$/i;
const SENTINEL_BUCKET='sentinel-s1-l1c';
const SENTINEL_REGION='eu-central-1';
const TERRAIN_HOST='elevation-tiles-prod.s3.us-east-1.amazonaws.com';
const USGS_HOST='earthquake.usgs.gov';
const EONET_HOST='eonet.gsfc.nasa.gov';

function approvedSentinelUrl(raw){
  if(!raw)return null;
  const text=String(raw);let path='',search='';
  if(text.startsWith('s3://')){
    const rest=text.slice(5),slash=rest.indexOf('/');if(slash<1||rest.slice(0,slash)!==SENTINEL_BUCKET)return null;
    path='/'+rest.slice(slash+1).split('/').map(encodeURIComponent).join('/').replace(/%3A/gi,':');
  }else{
    try{const u=new URL(text);if(u.protocol!=='https:')return null;const host=u.hostname.toLowerCase(),prefix=`${SENTINEL_BUCKET}.s3`,approved=host===`${SENTINEL_BUCKET}.s3.amazonaws.com`||((host.startsWith(`${prefix}.`)||host.startsWith(`${prefix}-`))&&host.endsWith('.amazonaws.com'));if(!approved)return null;path=u.pathname;search=u.search;}catch{return null;}
  }
  return new URL(`https://${SENTINEL_BUCKET}.s3.${SENTINEL_REGION}.amazonaws.com${path}${search}`);
}

function copyHeaders(source,names){const out=new Headers();for(const name of names){const value=source.headers.get(name);if(value!=null)out.set(name,value)}return out;}
function jsonError(message,status=400,detail=null){return new Response(JSON.stringify({error:message,detail}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}

async function fetchSentinel(request,url,{requireRange=false,kind='SOURCE'}={}){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError(`Sentinel ${kind.toLowerCase()} proxy requires GET or HEAD`,405);
  const target=approvedSentinelUrl(url.searchParams.get('url')||'');if(!target)return jsonError('URL is not the approved Sentinel-1 public bucket',403,{kind});
  const headers=new Headers();for(const name of ['range','if-none-match','if-modified-since','accept']){const value=request.headers.get(name);if(value)headers.set(name,value)}headers.set('accept-encoding','identity');
  const requestedRange=headers.get('range');let upstream;
  try{upstream=await fetch(target,{method:request.method,headers,redirect:'follow',cf:{cacheTtl:0,cacheEverything:false}});}catch(error){return jsonError('Sentinel S3 transport failed before a response was returned',502,{message:error?.message||String(error),kind,host:target.hostname,range:requestedRange||null,path:target.pathname.slice(0,240)});}
  if(requireRange&&request.method==='GET'&&requestedRange&&upstream.status!==206){try{upstream.body?.cancel?.();}catch{}return jsonError('Sentinel S3 byte-range contract failed',502,{requestedRange,upstreamStatus:upstream.status,kind,finalHost:new URL(upstream.url||target.href).hostname});}
  const responseHeaders=copyHeaders(upstream,['content-type','content-length','content-range','accept-ranges','etag','last-modified','cache-control']);let finalHost='unknown';try{finalHost=new URL(upstream.url||target.href).hostname}catch{}
  responseHeaders.set('x-omega-upstream',`SENTINEL_S3_${kind}_HOME_REGION`);responseHeaders.set('x-omega-bucket-region',SENTINEL_REGION);responseHeaders.set('x-omega-range-contract',requestedRange?(upstream.status===206?'SATISFIED':requireRange?'FAILED':'OPTIONAL'):'NOT_REQUESTED');responseHeaders.set('x-omega-final-host',finalHost);responseHeaders.set('x-content-type-options','nosniff');responseHeaders.set('cache-control','no-store');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
}
async function proxySentinelRaster(request,url){return fetchSentinel(request,url,{requireRange:true,kind:'RASTER'});}
async function proxySentinelSource(request,url){return fetchSentinel(request,url,{requireRange:false,kind:'SOURCE'});}

async function proxyTerrain(request,url){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('Terrain proxy requires GET or HEAD',405);
  const z=Number(url.searchParams.get('z')),x=Number(url.searchParams.get('x')),y=Number(url.searchParams.get('y')),n=2**z;
  if(!Number.isInteger(z)||z<0||z>15||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=n||y>=n)return jsonError('Valid Web Mercator terrain tile z/x/y required',400);
  const target=new URL(`https://${TERRAIN_HOST}/terrarium/${z}/${x}/${y}.png`),upstream=await fetch(target,{method:request.method,headers:{accept:'image/png'},cf:{cacheTtl:86400,cacheEverything:true}}),headers=copyHeaders(upstream,['content-type','content-length','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','AWS_OPEN_TERRAIN_TERRARIUM');headers.set('x-omega-elevation-kind','BARE_EARTH_TERRARIUM');headers.set('x-content-type-options','nosniff');return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxyUsgsEvents(request,url){
  if(request.method!=='GET')return jsonError('USGS event proxy requires GET',405);const period=String(url.searchParams.get('period')||'day').toLowerCase(),file=period==='week'?'all_week.geojson':period==='hour'?'all_hour.geojson':'all_day.geojson';
  const target=new URL(`https://${USGS_HOST}/earthquakes/feed/v1.0/summary/${file}`),upstream=await fetch(target,{headers:{accept:'application/geo+json,application/json'},cf:{cacheTtl:60,cacheEverything:true}}),headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);headers.set('x-omega-upstream','USGS_EARTHQUAKE_GEOJSON');headers.set('x-content-type-options','nosniff');return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxyEonetEvents(request,url){
  if(request.method!=='GET')return jsonError('NASA EONET proxy requires GET',405);const days=Math.max(1,Math.min(90,Number(url.searchParams.get('days'))||30)),limit=Math.max(1,Math.min(500,Number(url.searchParams.get('limit'))||250)),target=new URL(`https://${EONET_HOST}/api/v3/events/geojson`);target.searchParams.set('status','open');target.searchParams.set('days',String(days));target.searchParams.set('limit',String(limit));
  const upstream=await fetch(target,{headers:{accept:'application/geo+json,application/json'},cf:{cacheTtl:300,cacheEverything:true}}),headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);headers.set('x-omega-upstream','NASA_EONET_V3_GEOJSON');headers.set('x-content-type-options','nosniff');return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

export { approvedSentinelUrl };

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/api/raster')return proxySentinelRaster(request,url);
    if(url.pathname==='/api/source')return proxySentinelSource(request,url);
    if(url.pathname==='/api/terrain')return proxyTerrain(request,url);
    if(url.pathname==='/api/events/usgs')return proxyUsgsEvents(request,url);
    if(url.pathname==='/api/events/eonet')return proxyEonetEvents(request,url);
    if(url.pathname.startsWith('/api/'))return r3.fetch(request,env,ctx);
    const response=await env.ASSETS.fetch(request);if(!response)return response;const headers=new Headers(response.headers);
    if(url.pathname==='/'||STATIC_FRESH_EXT.test(url.pathname)){headers.set('cache-control','no-store, max-age=0');headers.set('pragma','no-cache');headers.set('expires','0');headers.set('x-omega-sar-build','R248-REGIONAL-SAR-EARTH-AWARENESS-WATER-GEOMETRY');if(url.pathname==='/'||/\.html?$/i.test(url.pathname))headers.set('clear-site-data','"cache"');}
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
