const STAC_ENDPOINT='https://earth-search.aws.element84.com/v1/search';
const STAC_ITEM_ROOT='https://earth-search.aws.element84.com/v1/collections/sentinel-1-grd/items/';
const ASF_ENDPOINT='https://api.daac.asf.alaska.edu/services/search/param';
const GIBS_HOST='gibs.earthdata.nasa.gov';
const NOMINATIM_ENDPOINT='https://nominatim.openstreetmap.org';
const NOMINATIM_UA='OMEGA-SAR-R3/1.0 (+https://omega-sar-r3.jeffdeweyeljefe.workers.dev/)';

function jsonError(message,status=400){
  return new Response(JSON.stringify({error:message}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}

function copyHeaders(source,names){
  const out=new Headers();
  for(const name of names){const value=source.headers.get(name);if(value!=null)out.set(name,value)}
  return out;
}

function sourceHttpUrl(raw){
  if(!raw)return null;
  const text=String(raw);
  if(text.startsWith('s3://')){
    const rest=text.slice(5),slash=rest.indexOf('/');
    if(slash<1)return null;
    const bucket=rest.slice(0,slash),key=rest.slice(slash+1).split('/').map(encodeURIComponent).join('/').replace(/%3A/gi,':');
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  try{
    const u=new URL(text);
    return u.protocol==='https:'?u.href:null;
  }catch{return null}
}

function allowedSourceUrl(raw){
  const normalized=sourceHttpUrl(raw);
  if(!normalized)return null;
  let url;
  try{url=new URL(normalized)}catch{return null}
  const h=url.hostname.toLowerCase();
  const allowed=
    h==='sentinel-s1-l1c.s3.amazonaws.com'||
    h==='sentinel-s1-l1c.s3.us-west-2.amazonaws.com'||
    h.endsWith('.s3.amazonaws.com')||
    h.endsWith('.s3.us-west-2.amazonaws.com');
  return allowed?url:null;
}

function allowedGibsUrl(raw){
  try{
    const url=new URL(String(raw||''));
    if(url.protocol!=='https:'||url.hostname.toLowerCase()!==GIBS_HOST)return null;
    if(!url.pathname.startsWith('/wms/'))return null;
    return url;
  }catch{return null}
}

function resolveRelativeAsset(baseHref,relativeHref){
  if(!baseHref||!relativeHref)return null;
  const rel=String(relativeHref).trim().replace(/^\.\//,'');
  if(String(baseHref).startsWith('s3://')){
    const base=String(baseHref).replace(/\/[^/]*$/,'');
    return `${base}/${rel}`;
  }
  try{return new URL(rel,String(baseHref)).href}catch{return null}
}

function productHrefIsAuxiliary(value){
  const low=String(value||'').toLowerCase();
  return low.includes('/annotation/rfi/')||low.includes('/annotation/calibration/')||low.includes('/annotation/noise/')||low.includes('/noise-');
}

function manifestProductAnnotations(manifestXml,polarization){
  const pol=String(polarization||'').toLowerCase();
  if(!pol)return [];
  const hrefs=[...String(manifestXml||'').matchAll(/(?:\b|:)href\s*=\s*["']([^"']+)["']/gi)].map(m=>m[1]);
  const candidates=[];
  for(const href of hrefs){
    const path=String(href).toLowerCase().replace(/^\.\//,'').replace(/^\//,'');
    if(!path.startsWith('annotation/')||!path.endsWith('.xml'))continue;
    if(path.includes('/calibration/')||path.includes('/rfi/')||path.includes('/noise/'))continue;
    const file=path.split('/').at(-1)||'';
    if(!(file.includes(`-${pol}-`)||file.endsWith(`-${pol}.xml`)||file.includes(`_${pol}_`)||file.startsWith(`${pol}-`)))continue;
    let score=0;if(/^s1[a-d]-/.test(file))score+=30;if(file.includes('-grd-'))score+=20;if(file.includes(`-${pol}-`))score+=10;score-=path.split('/').length;
    candidates.push({href,score});
  }
  candidates.sort((a,b)=>b.score-a.score||String(a.href).length-String(b.href).length||String(a.href).localeCompare(String(b.href)));
  return [...new Set(candidates.map(x=>x.href))];
}

async function probeSourceExists(raw){
  const target=allowedSourceUrl(raw);if(!target)return false;
  try{
    let response=await fetch(target,{method:'HEAD',redirect:'follow'});
    if(response.ok)return true;
    // A few S3 frontends are inconsistent about HEAD. A one-byte range GET is the deterministic fallback.
    response=await fetch(target,{method:'GET',headers:{range:'bytes=0-0'},redirect:'follow'});
    return response.ok||response.status===206;
  }catch{return false;}
}

async function resolveSentinelProductAnnotations(item){
  const assets=item?.assets||{};
  const productEntries=Object.entries(assets).filter(([key,a])=>key.startsWith('schema-product-')&&a?.href);
  if(!productEntries.length)return {item,resolved:0,validated:0,failed:0};
  const manifest=assets['safe-manifest'];
  let manifestXml=null;
  async function getManifest(){
    if(manifestXml!=null)return manifestXml;
    if(!manifest?.href)return null;
    const manifestUrl=allowedSourceUrl(manifest.href);if(!manifestUrl)return null;
    try{
      const response=await fetch(manifestUrl,{headers:{accept:'application/xml,text/xml,text/plain,*/*'},redirect:'follow'});
      if(!response.ok)return null;
      manifestXml=await response.text();return manifestXml;
    }catch{return null;}
  }

  let resolved=0,validated=0,failed=0;
  for(const [key,current] of productEntries){
    const pol=key.slice('schema-product-'.length).toLowerCase();
    const directUsable=!productHrefIsAuxiliary(current.href)&&await probeSourceExists(current.href);
    if(directUsable){
      assets[key]={...current,'omega:resolution':current['omega:resolution']||'EARTH_SEARCH_DIRECT_VALIDATED','omega:validated':true};
      validated++;continue;
    }

    const xml=await getManifest();let replacement=null;
    if(xml){
      for(const relative of manifestProductAnnotations(xml,pol)){
        const candidate=resolveRelativeAsset(manifest.href,relative);
        if(!candidate||productHrefIsAuxiliary(candidate))continue;
        if(await probeSourceExists(candidate)){replacement=candidate;break;}
      }
    }
    if(!replacement){
      assets[key]={...current,'omega:validated':false,'omega:resolution':'PRODUCT_ANNOTATION_UNRESOLVED','omega:earth_search_product_href':current.href,'omega:manifest_href':manifest?.href||null};
      failed++;continue;
    }
    assets[key]={
      ...current,
      href:replacement,
      title:`Resolved ${pol.toUpperCase()} Product Annotation`,
      description:'Existing root Sentinel-1 SAFE product annotation validated through manifest.safe because the direct STAC product link was auxiliary, stale, or returned 404.',
      'omega:resolution':'SAFE_MANIFEST_ROOT_ANNOTATION_VALIDATED',
      'omega:validated':true,
      'omega:earth_search_product_href':current.href,
      'omega:manifest_href':manifest.href
    };
    resolved++;validated++;
  }
  item.assets=assets;
  item.properties={
    ...(item.properties||{}),
    'omega:resolved_product_annotations':resolved,
    'omega:validated_product_annotations':validated,
    'omega:unresolved_product_annotations':failed
  };
  return {item,resolved,validated,failed};
}

async function proxyStac(request){
  if(request.method!=='POST')return jsonError('STAC proxy requires POST',405);
  const body=await request.text();
  const upstream=await fetch(STAC_ENDPOINT,{method:'POST',headers:{'content-type':'application/json','accept':'application/geo+json,application/json'},body});
  const headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','EARTH_SEARCH_STAC');
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxyStacItem(request,url){
  if(request.method!=='GET')return jsonError('STAC item proxy requires GET',405);
  const id=url.searchParams.get('id')||'';
  if(!id||id.length>512)return jsonError('A valid Sentinel-1 item id is required',400);
  const upstream=await fetch(`${STAC_ITEM_ROOT}${encodeURIComponent(id)}`,{headers:{accept:'application/geo+json,application/json'}});
  if(!upstream.ok){
    const headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);
    headers.set('x-omega-upstream','EARTH_SEARCH_STAC_ITEM');
    return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
  }
  const item=await upstream.json();
  const resolution=await resolveSentinelProductAnnotations(item);
  const headers=copyHeaders(upstream,['etag','last-modified','cache-control']);
  headers.set('content-type','application/geo+json; charset=utf-8');
  headers.set('x-omega-upstream','EARTH_SEARCH_STAC_ITEM');
  headers.set('x-omega-product-annotations-resolved',String(resolution.resolved));
  headers.set('x-omega-product-annotations-validated',String(resolution.validated));
  headers.set('x-omega-product-annotations-unresolved',String(resolution.failed));
  return new Response(JSON.stringify(resolution.item),{status:200,headers});
}

async function proxyAsf(request,url){
  if(request.method!=='GET')return jsonError('ASF proxy requires GET',405);
  const upstreamUrl=new URL(ASF_ENDPOINT);
  for(const [k,v] of url.searchParams)upstreamUrl.searchParams.append(k,v);
  const upstream=await fetch(upstreamUrl,{headers:{accept:'application/geo+json,application/json'}});
  const headers=copyHeaders(upstream,['content-type','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','ASF_DAAC');
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

async function proxySource(request,url,kind='SOURCE'){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('Source proxy requires GET or HEAD',405);
  const target=allowedSourceUrl(url.searchParams.get('url')||'');
  if(!target)return jsonError('Source URL is not on the approved Sentinel/AWS S3 allowlist',403);
  const headers=new Headers();
  for(const name of ['range','if-none-match','if-modified-since']){const value=request.headers.get(name);if(value)headers.set(name,value)}
  const upstream=await fetch(target,{method:request.method,headers,redirect:'follow'});
  const responseHeaders=copyHeaders(upstream,['content-type','content-length','content-range','accept-ranges','etag','last-modified','cache-control']);
  responseHeaders.set('x-omega-upstream',kind);
  responseHeaders.set('x-content-type-options','nosniff');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:responseHeaders});
}

async function proxyGibs(request,url){
  if(request.method!=='GET'&&request.method!=='HEAD')return jsonError('GIBS proxy requires GET or HEAD',405);
  const target=allowedGibsUrl(url.searchParams.get('url')||'');
  if(!target)return jsonError('GIBS URL is not on the approved NASA Earthdata host/path',403);
  const upstream=await fetch(target,{method:request.method,headers:{accept:'image/png,image/jpeg,image/*,*/*;q=0.8'},redirect:'follow'});
  const headers=copyHeaders(upstream,['content-type','content-length','etag','last-modified','cache-control']);
  headers.set('x-omega-upstream','NASA_EOSDIS_GIBS');
  headers.set('x-content-type-options','nosniff');
  return new Response(request.method==='HEAD'?null:upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}

function safePlacePayload(result){
  if(!result||typeof result!=='object')return null;
  const a=result.address||{};
  const locality=a.city||a.town||a.village||a.hamlet||a.municipality||a.county||null;
  const region=a.state||a.region||a.province||a.county||null;
  return {
    name:result.name||locality||result.display_name?.split(',')[0]||null,
    displayName:result.display_name||null,
    locality,region,country:a.country||null,countryCode:a.country_code?String(a.country_code).toUpperCase():null,
    lat:Number(result.lat),lon:Number(result.lon),type:result.type||null,category:result.category||null,
    attribution:'© OpenStreetMap contributors'
  };
}

async function cachedNominatim(requestUrl,upstreamUrl){
  const cache=globalThis.caches?.default;
  const cacheKey=new Request(requestUrl.toString(),{method:'GET'});
  if(cache){const hit=await cache.match(cacheKey);if(hit)return hit;}
  const upstream=await fetch(upstreamUrl,{headers:{accept:'application/json','accept-language':'en','user-agent':NOMINATIM_UA,'referer':'https://omega-sar-r3.jeffdeweyeljefe.workers.dev/'},redirect:'follow'});
  const text=await upstream.text();
  const response=new Response(text,{status:upstream.status,statusText:upstream.statusText,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=86400','x-omega-upstream':'OPENSTREETMAP_NOMINATIM'}});
  if(cache&&upstream.ok)await cache.put(cacheKey,response.clone());
  return response;
}

async function reversePlace(request,url){
  if(request.method!=='GET')return jsonError('Place reverse lookup requires GET',405);
  const lat=Number(url.searchParams.get('lat')),lon=Number(url.searchParams.get('lon'));
  if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<-90||lat>90||lon<-180||lon>180)return jsonError('Valid lat/lon required',400);
  const zoom=Math.max(3,Math.min(18,Number(url.searchParams.get('zoom'))||10));
  const upstream=new URL(`${NOMINATIM_ENDPOINT}/reverse`);
  upstream.searchParams.set('format','jsonv2');upstream.searchParams.set('lat',String(lat));upstream.searchParams.set('lon',String(lon));upstream.searchParams.set('zoom',String(zoom));upstream.searchParams.set('addressdetails','1');
  const raw=await cachedNominatim(url,upstream);
  if(!raw.ok)return raw;
  const result=await raw.json();
  return new Response(JSON.stringify(safePlacePayload(result)),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=86400','x-omega-upstream':'OPENSTREETMAP_NOMINATIM'}});
}

async function searchPlace(request,url){
  if(request.method!=='GET')return jsonError('Place search requires GET',405);
  const q=String(url.searchParams.get('q')||'').trim();
  if(q.length<2||q.length>180)return jsonError('Place search requires 2–180 characters',400);
  const upstream=new URL(`${NOMINATIM_ENDPOINT}/search`);
  upstream.searchParams.set('format','jsonv2');upstream.searchParams.set('q',q);upstream.searchParams.set('limit','5');upstream.searchParams.set('addressdetails','1');
  const raw=await cachedNominatim(url,upstream);
  if(!raw.ok)return raw;
  const results=await raw.json();
  const out=Array.isArray(results)?results.map(safePlacePayload).filter(Boolean):[];
  return new Response(JSON.stringify(out),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=86400','x-omega-upstream':'OPENSTREETMAP_NOMINATIM'}});
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/stac/search')return proxyStac(request);
    if(url.pathname==='/api/stac/item')return proxyStacItem(request,url);
    if(url.pathname==='/api/asf/search')return proxyAsf(request,url);
    if(url.pathname==='/api/raster')return proxySource(request,url,'SENTINEL_S3_RASTER');
    if(url.pathname==='/api/source')return proxySource(request,url,'SENTINEL_S3_SUPPORT_ASSET');
    if(url.pathname==='/api/gibs')return proxyGibs(request,url);
    if(url.pathname==='/api/place/reverse')return reversePlace(request,url);
    if(url.pathname==='/api/place/search')return searchPlace(request,url);
    return env.ASSETS.fetch(request);
  }
};