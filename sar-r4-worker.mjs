import r3 from './sar-r3-worker.mjs';

const STATIC_FRESH_EXT=/\.(?:html?|mjs|js|css|json)$/i;
const SENTINEL_BUCKET='sentinel-s1-l1c';

function approvedSentinelRasterUrl(raw){
  if(!raw)return null;
  const text=String(raw);
  if(text.startsWith('s3://')){
    const rest=text.slice(5),slash=rest.indexOf('/');
    if(slash<1||rest.slice(0,slash)!==SENTINEL_BUCKET)return null;
    const key=rest.slice(slash+1).split('/').map(encodeURIComponent).join('/').replace(/%3A/gi,':');
    return new URL(`https://${SENTINEL_BUCKET}.s3.amazonaws.com/${key}`);
  }
  try{
    const u=new URL(text);if(u.protocol!=='https:')return null;
    const host=u.hostname.toLowerCase(),prefix=`${SENTINEL_BUCKET}.s3`;
    const approved=host===`${SENTINEL_BUCKET}.s3.amazonaws.com`||((host.startsWith(`${prefix}.`)||host.startsWith(`${prefix}-`))&&host.endsWith('.amazonaws.com'));
    return approved?u:null;
  }catch{return null;}
}

function copyHeaders(source,names){const out=new Headers();for(const name of names){const value=source.headers.get(name);if(value!=null)out.set(name,value)}return out;}
function jsonError(message,status=400,detail=null){return new Response(JSON.stringify({error:message,detail}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}

async function proxySentinelRaster(request,url){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('Sentinel raster proxy requires GET or HEAD',405);
  const target=approvedSentinelRasterUrl(url.searchParams.get('url')||'');
  if(!target)return jsonError('Raster URL is not the approved Sentinel-1 public bucket',403);
  const headers=new Headers();
  for(const name of ['range','if-none-match','if-modified-since']){const value=request.headers.get(name);if(value)headers.set(name,value)}
  headers.set('accept-encoding','identity');
  const requestedRange=headers.get('range');
  let upstream;
  try{
    upstream=await fetch(target,{method:request.method,headers,redirect:'follow',cf:{cacheTtl:0,cacheEverything:false}});
  }catch(error){
    return jsonError('Sentinel S3 transport failed before a response was returned',502,{message:error?.message||String(error),host:target.hostname,range:requestedRange||null});
  }
  if(request.method==='GET'&&requestedRange&&upstream.status!==206){
    try{upstream.body?.cancel?.();}catch{}
    return jsonError('Sentinel S3 byte-range contract failed',502,{requestedRange,upstreamStatus:upstream.status,finalHost:new URL(upstream.url||target.href).hostname});
  }
  const responseHeaders=copyHeaders(upstream,['content-type','content-length','content-range','accept-ranges','etag','last-modified']);
  let finalHost='unknown';try{finalHost=new URL(upstream.url||target.href).hostname}catch{}
  responseHeaders.set('x-omega-upstream','SENTINEL_S3_RASTER_REDIRECT_SAFE');
  responseHeaders.set('x-omega-range-contract',requestedRange?(upstream.status===206?'SATISFIED':'FAILED'):'NOT_REQUESTED');
  responseHeaders.set('x-omega-final-host',finalHost);
  responseHeaders.set('x-content-type-options','nosniff');
  responseHeaders.set('cache-control','no-store');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
}

export { approvedSentinelRasterUrl };

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
      headers.set('x-omega-sar-build','R247-BLADE-LENS-GCP-MESH-TRANSPORT');
      if(url.pathname==='/'||/\.html?$/i.test(url.pathname))headers.set('clear-site-data','"cache"');
    }
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  }
};
