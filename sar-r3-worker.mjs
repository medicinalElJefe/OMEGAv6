const STAC_ENDPOINT='https://earth-search.aws.element84.com/v1/search';
const ASF_ENDPOINT='https://api.daac.asf.alaska.edu/services/search/param';

function jsonError(message,status=400){
  return new Response(JSON.stringify({error:message}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}

function copyHeaders(source,names){
  const out=new Headers();
  for(const name of names){const value=source.headers.get(name);if(value!=null)out.set(name,value)}
  return out;
}

function allowedRasterUrl(raw){
  let url;
  try{url=new URL(raw)}catch{return null}
  if(url.protocol!=='https:')return null;
  const h=url.hostname.toLowerCase();
  const allowed=h==='sentinel-s1-l1c.s3.amazonaws.com'||h.endsWith('.s3.amazonaws.com')||h.endsWith('.s3.us-west-2.amazonaws.com');
  return allowed?url:null;
}

async function proxyStac(request){
  if(request.method!=='POST')return jsonError('STAC proxy requires POST',405);
  const body=await request.text();
  const upstream=await fetch(STAC_ENDPOINT,{method:'POST',headers:{'content-type':'application/json','accept':'application/geo+json,application/json'},body});
  const headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','EARTH_SEARCH_STAC');
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxyAsf(request,url){
  if(request.method!=='GET')return jsonError('ASF proxy requires GET',405);
  const upstreamUrl=new URL(ASF_ENDPOINT);
  for(const [k,v] of url.searchParams)upstreamUrl.searchParams.append(k,v);
  const upstream=await fetch(upstreamUrl,{headers:{'accept':'application/geo+json,application/json'}});
  const headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','ASF_DAAC');
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxyRaster(request,url){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('Raster proxy requires GET or HEAD',405);
  const target=allowedRasterUrl(url.searchParams.get('url')||'');
  if(!target)return jsonError('Raster URL is not on the approved Sentinel/AWS S3 allowlist',403);
  const headers=new Headers();
  for(const name of ['range','if-none-match','if-modified-since']){const value=request.headers.get(name);if(value)headers.set(name,value)}
  const upstream=await fetch(target,{method:request.method,headers,redirect:'follow'});
  const responseHeaders=copyHeaders(upstream,['content-type','content-length','content-range','accept-ranges','etag','last-modified','cache-control']);
  responseHeaders.set('x-omega-upstream','SENTINEL_S3_RASTER');
  responseHeaders.set('x-content-type-options','nosniff');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/stac/search')return proxyStac(request);
    if(url.pathname==='/api/asf/search')return proxyAsf(request,url);
    if(url.pathname==='/api/raster')return proxyRaster(request,url);
    return env.ASSETS.fetch(request);
  }
};
