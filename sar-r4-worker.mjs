import r3 from './sar-r3-worker.mjs';

const STATIC_FRESH_EXT=/\.(?:html?|mjs|js|css|json)$/i;
const SENTINEL_BUCKET='sentinel-s1-l1c';
const SENTINEL_REGION='eu-central-1';

function sentinelRegionalUrl(raw){
  if(!raw)return null;
  const text=String(raw);
  if(text.startsWith('s3://')){
    const rest=text.slice(5),slash=rest.indexOf('/');
    if(slash<1||rest.slice(0,slash)!==SENTINEL_BUCKET)return null;
    const key=rest.slice(slash+1).split('/').map(encodeURIComponent).join('/').replace(/%3A/gi,':');
    return new URL(`https://${SENTINEL_BUCKET}.s3.${SENTINEL_REGION}.amazonaws.com/${key}`);
  }
  try{
    const u=new URL(text);if(u.protocol!=='https:')return null;
    const host=u.hostname.toLowerCase();
    if(host!==`${SENTINEL_BUCKET}.s3.amazonaws.com`&&host!==`${SENTINEL_BUCKET}.s3.${SENTINEL_REGION}.amazonaws.com`)return null;
    u.hostname=`${SENTINEL_BUCKET}.s3.${SENTINEL_REGION}.amazonaws.com`;
    return u;
  }catch{return null;}
}

function copyHeaders(source,names){const out=new Headers();for(const name of names){const value=source.headers.get(name);if(value!=null)out.set(name,value)}return out;}
function jsonError(message,status=400){return new Response(JSON.stringify({error:message}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}

async function proxySentinelRaster(request,url){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('Sentinel raster proxy requires GET or HEAD',405);
  const target=sentinelRegionalUrl(url.searchParams.get('url')||'');
  if(!target)return jsonError('Raster URL is not the approved Sentinel-1 public bucket',403);
  const headers=new Headers();
  for(const name of ['range','if-none-match','if-modified-since']){const value=request.headers.get(name);if(value)headers.set(name,value)}
  headers.set('accept-encoding','identity');
  const requestedRange=headers.get('range');
  const upstream=await fetch(target,{method:request.method,headers,redirect:'manual',cf:{cacheTtl:0,cacheEverything:false}});
  if(request.method==='GET'&&requestedRange&&upstream.status!==206){
    try{upstream.body?.cancel?.();}catch{}
    return jsonError(`Sentinel S3 range contract failed: requested ${requestedRange}, upstream returned ${upstream.status}`,502);
  }
  const responseHeaders=copyHeaders(upstream,['content-type','content-length','content-range','accept-ranges','etag','last-modified','cache-control']);
  responseHeaders.set('x-omega-upstream','SENTINEL_S3_RASTER_REGIONAL');
  responseHeaders.set('x-omega-s3-region',SENTINEL_REGION);
  responseHeaders.set('x-content-type-options','nosniff');
  responseHeaders.set('cache-control','no-store');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
}

export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url);
    if(url.pathname==='/api/raster')return proxySentinelRaster(request,url);
    if(url.pathname.startsWith('/api/'))return r3.fetch(request,env,ctx);
    const response=await env.ASSETS.fetch(request);
    if(!response)return response;
    const headers=new Headers(response.headers);
    if(url.pathname==='/'||STATIC_FRESH_EXT.test(url.pathname)){
      headers.set('cache-control','no-store, max-age=0');
      headers.set('pragma','no-cache');
      headers.set('expires','0');
      headers.set('x-omega-sar-build','R4-CONTINUOUS-SAR-AUTHORITY-SPINE-1');
      if(url.pathname==='/'||/\.html?$/i.test(url.pathname))headers.set('clear-site-data','"cache"');
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
