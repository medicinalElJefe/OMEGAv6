const EARTHSCOPE_HOST='web-services.unavco.org';
const STATION_RE=/^[A-Z0-9]{4}$/;
const JSON_HEADERS={accept:'application/json,text/plain;q=0.8,*/*;q=0.2'};

function jsonError(message,status=400,detail=null){return new Response(JSON.stringify({error:message,detail}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
function finite(v){return Number.isFinite(Number(v));}
function station(value){const s=String(value||'').trim().toUpperCase();return STATION_RE.test(s)?s:null;}
function copyHeaders(source){const out=new Headers();for(const name of ['content-type','etag','last-modified','cache-control']){const v=source.headers.get(name);if(v!=null)out.set(name,v);}out.set('x-omega-upstream','EARTHSCOPE_UNAVCO_GEODESY_WEB_SERVICE');out.set('x-content-type-options','nosniff');return out;}
function copyQuery(source,target,allowed){for(const key of allowed){const v=source.searchParams.get(key);if(v!=null&&String(v).length<=160)target.searchParams.set(key,v);}}
async function relay(request,target,{ttl=300}={}){const upstream=await fetch(target,{method:'GET',headers:JSON_HEADERS,redirect:'follow',cf:{cacheTtl:ttl,cacheEverything:true}}),headers=copyHeaders(upstream);headers.set('x-omega-earthscope-path',target.pathname);return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});}
function target(path){return new URL(`https://${EARTHSCOPE_HOST}${path}`);}

export async function handleEarthScope(request,url){
  if(request.method!=='GET')return jsonError('EarthScope geodesy proxy requires GET',405);
  if(url.pathname==='/api/geodesy/gnss/sites'){
    const minlat=Number(url.searchParams.get('minlat')),maxlat=Number(url.searchParams.get('maxlat')),minlon=Number(url.searchParams.get('minlon')),maxlon=Number(url.searchParams.get('maxlon'));
    if(![minlat,maxlat,minlon,maxlon].every(finite)||minlat<-90||maxlat>90||minlon<-180||maxlon>180||maxlat<=minlat||maxlon<=minlon)return jsonError('Valid GNSS metadata bounding box required',400);
    const t=target('/gps/metadata/sites/v1');t.searchParams.set('minlatitude',String(minlat));t.searchParams.set('maxlatitude',String(maxlat));t.searchParams.set('minLongitude',String(minlon));t.searchParams.set('maxLongitude',String(maxlon));t.searchParams.set('format','json');return relay(request,t,{ttl:1800});
  }
  if(url.pathname==='/api/geodesy/gnss/position'){
    const s=station(url.searchParams.get('station'));if(!s)return jsonError('Four-character GNSS station id required',400);const t=target(`/gps/data/position/${s}/v3`);copyQuery(url,t,['analysisCenter','referenceFrame','report','refCoordOption','starttime','endtime']);t.searchParams.set('format','json');return relay(request,t,{ttl:300});
  }
  if(url.pathname==='/api/geodesy/gnss/velocity'){
    const s=station(url.searchParams.get('station'));if(!s)return jsonError('Four-character GNSS station id required',400);const t=target(`/gps/data/velocity/${s}/beta`);copyQuery(url,t,['analysisCenter','referenceFrame','report','solutionType']);t.searchParams.set('format','json');return relay(request,t,{ttl:1800});
  }
  const borehole={
    '/api/geodesy/strain':s=>`/strain/data/L2/${s}/beta`,
    '/api/geodesy/tilt':s=>`/tilt/data/${s}/beta`,
    '/api/geodesy/pore/pressure':s=>`/pore/data/pressure/${s}/beta`,
    '/api/geodesy/pore/temperature':s=>`/pore/data/temperature/${s}/beta`
  }[url.pathname];
  if(borehole){const s=station(url.searchParams.get('station'));if(!s)return jsonError('Four-character borehole station id required',400);const t=target(borehole(s));copyQuery(url,t,['starttime','endtime','format']);if(!t.searchParams.has('format'))t.searchParams.set('format','json');return relay(request,t,{ttl:300});}
  return null;
}

export const EARTHSCOPE_PROXY_CONTRACT=Object.freeze({host:EARTHSCOPE_HOST,routes:['GNSS_SITE_METADATA','GNSS_POSITION_V3','GNSS_VELOCITY_BETA','STRAIN_L2_BETA','TILT_BETA','PORE_PRESSURE_BETA','PORE_TEMPERATURE_BETA'],boundary:'Only fixed EarthScope/UNAVCO geodesy endpoint families are proxied. Unknown paths/hosts are rejected; proxying does not change the evidence class of returned data.'});