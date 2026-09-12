const EARTHSCOPE_HOST='web-services.unavco.org';
const STATION_RE=/^[A-Z0-9]{4}$/;
const TRANSIENT=new Set([429,500,502,503,504]);
const RETRY_DELAYS=[0,220,700];

const ROUTES=Object.freeze({
  sites:{path:'/gps/metadata/sites/v1',family:'GNSS',ttl:1800},
  position:{path:station=>`/gps/data/position/${station}/v3`,family:'GNSS',ttl:300},
  velocity:{path:station=>`/gps/data/velocity/${station}/beta`,family:'GNSS',ttl:1800},
  strain:{path:station=>`/strain/data/L2/${station}/beta`,family:'STRAIN',ttl:300},
  tilt:{path:station=>`/tilt/data/${station}/beta`,family:'TILT',ttl:300},
  porePressure:{path:station=>`/pore/data/pressure/${station}/beta`,family:'PORE_PRESSURE',ttl:300},
  poreTemperature:{path:station=>`/pore/data/temperature/${station}/beta`,family:'ENVIRONMENT',ttl:300},
  met:{path:station=>`/met/data/${station}/beta`,family:'ENVIRONMENT',ttl:300}
});

function jsonError(message,status=400,detail=null){return new Response(JSON.stringify({error:message,detail}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});}
const wait=ms=>ms?new Promise(r=>setTimeout(r,ms)):Promise.resolve();
function cleanStation(value){const s=String(value||'').trim().toUpperCase();return STATION_RE.test(s)?s:null;}
function copyHeaders(source){const out=new Headers();for(const name of ['content-type','content-length','etag','last-modified','cache-control']){const v=source.headers.get(name);if(v!=null)out.set(name,v);}out.set('x-content-type-options','nosniff');return out;}
function boundedParam(url,target,key,{max=160,pattern=null}={}){const v=url.searchParams.get(key);if(v==null)return;if(v.length>max)throw new Error(`${key} too long`);if(pattern&&!pattern.test(v))throw new Error(`${key} invalid`);target.searchParams.set(key,v);}
async function upstreamFetch(target,request,ttl){
  let response=null,lastError=null,attempts=0;
  for(let i=0;i<RETRY_DELAYS.length;i++){
    attempts=i+1;await wait(RETRY_DELAYS[i]);
    try{response=await fetch(target,{method:'GET',headers:{accept:'application/json,text/csv;q=0.9,text/plain;q=0.7,*/*;q=0.2','accept-encoding':'identity'},redirect:'follow',cf:{cacheTtl:ttl,cacheEverything:true}});if(!TRANSIENT.has(response.status)||i===RETRY_DELAYS.length-1)break;try{await response.body?.cancel?.();}catch{}}
    catch(error){lastError=error;if(i===RETRY_DELAYS.length-1)break;}
  }
  return {response,lastError,attempts};
}
async function relay(request,target,{family,ttl=300,kind,referenceFrame=null}={}){
  const result=await upstreamFetch(target,request,ttl),upstream=result.response;if(!upstream)return jsonError('EarthScope/NGF upstream failed before a usable response was returned',502,{kind,attempts:result.attempts,message:result.lastError?.message||String(result.lastError||'unavailable')});
  const headers=copyHeaders(upstream);headers.set('x-omega-upstream','EARTHSCOPE_NGF_GEODESY');headers.set('x-omega-source-proven','EARTHSCOPE_NGF_PUBLIC_WEB_SERVICE');headers.set('x-omega-evidence-family',family);headers.set('x-omega-geodesy-kind',kind);headers.set('x-omega-upstream-attempts',String(result.attempts));headers.set('x-omega-source-host',EARTHSCOPE_HOST);headers.set('x-omega-source-path',target.pathname);if(referenceFrame)headers.set('x-omega-reference-frame',referenceFrame);headers.set('cache-control',`public, max-age=${Math.max(0,Math.min(3600,ttl))}`);
  return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
}
function target(path){return new URL(`https://${EARTHSCOPE_HOST}${path}`);}

export async function handleEarthScope(request,url){
  if(request.method!=='GET')return jsonError('EarthScope geodesy proxy requires GET',405);
  try{
    if(url.pathname==='/api/geodesy/gnss/sites'){
      const minlat=Number(url.searchParams.get('minlat')),maxlat=Number(url.searchParams.get('maxlat')),minlon=Number(url.searchParams.get('minlon')),maxlon=Number(url.searchParams.get('maxlon'));
      if(![minlat,maxlat,minlon,maxlon].every(Number.isFinite)||minlat<-90||maxlat>90||minlon<-180||maxlon>180||maxlat<=minlat||maxlon<=minlon||maxlat-minlat>45||maxlon-minlon>70)return jsonError('Valid bounded GNSS metadata bbox required',400);
      const t=target(ROUTES.sites.path);t.searchParams.set('minlatitude',String(minlat));t.searchParams.set('maxlatitude',String(maxlat));t.searchParams.set('minLongitude',String(minlon));t.searchParams.set('maxLongitude',String(maxlon));t.searchParams.set('format','json');return relay(request,t,{family:'GNSS',ttl:ROUTES.sites.ttl,kind:'GNSS_SITE_METADATA'});
    }
    if(url.pathname==='/api/geodesy/gnss/position'){
      const station=cleanStation(url.searchParams.get('station'));if(!station)return jsonError('Four-character GNSS station id required',400);const referenceFrame=String(url.searchParams.get('referenceFrame')||'igs14').toLowerCase();if(!/^(igs14|nam14|igs08|nam08)$/.test(referenceFrame))return jsonError('Unsupported GNSS reference frame',400);
      const t=target(ROUTES.position.path(station));t.searchParams.set('analysisCenter',String(url.searchParams.get('analysisCenter')||'cwu').toLowerCase());t.searchParams.set('referenceFrame',referenceFrame);t.searchParams.set('report',url.searchParams.get('report')==='long'?'long':'short');t.searchParams.set('refCoordOption','from_analysis_center');boundedParam(url,t,'starttime',{pattern:/^\d{4}-\d{2}-\d{2}$/});boundedParam(url,t,'endtime',{pattern:/^\d{4}-\d{2}-\d{2}$/});return relay(request,t,{family:'GNSS',ttl:ROUTES.position.ttl,kind:'GNSS_POSITION_V3',referenceFrame:referenceFrame.toUpperCase()});
    }
    if(url.pathname==='/api/geodesy/gnss/velocity'){
      const station=cleanStation(url.searchParams.get('station'));if(!station)return jsonError('Four-character GNSS station id required',400);const referenceFrame=String(url.searchParams.get('referenceFrame')||'igs14').toLowerCase();if(!/^(igs14|nam14|igs08|nam08)$/.test(referenceFrame))return jsonError('Unsupported GNSS reference frame',400);
      const t=target(ROUTES.velocity.path(station));t.searchParams.set('analysisCenter',String(url.searchParams.get('analysisCenter')||'cwu').toLowerCase());t.searchParams.set('referenceFrame',referenceFrame);t.searchParams.set('report',url.searchParams.get('report')==='long'?'long':'short');t.searchParams.set('solutionType',String(url.searchParams.get('solutionType')||'snaps').toLowerCase());return relay(request,t,{family:'GNSS',ttl:ROUTES.velocity.ttl,kind:'GNSS_VELOCITY_BETA',referenceFrame:referenceFrame.toUpperCase()});
    }
    const table={
      '/api/geodesy/strain':['strain','STRAIN','STRAIN_L2_BETA'],
      '/api/geodesy/tilt':['tilt','TILT','TILT_BETA'],
      '/api/geodesy/pore/pressure':['porePressure','PORE_PRESSURE','PORE_PRESSURE_BETA'],
      '/api/geodesy/pore/temperature':['poreTemperature','ENVIRONMENT','PORE_TEMPERATURE_BETA'],
      '/api/geodesy/met':['met','ENVIRONMENT','SURFACE_MET_BETA']
    }[url.pathname];
    if(table){const [routeKey,family,kind]=table,station=cleanStation(url.searchParams.get('station'));if(!station)return jsonError('Four-character station id required',400);const route=ROUTES[routeKey],t=target(route.path(station));boundedParam(url,t,'starttime',{pattern:/^\d{4}-\d{2}-\d{2}/});boundedParam(url,t,'endtime',{pattern:/^\d{4}-\d{2}-\d{2}/});return relay(request,t,{family,ttl:route.ttl,kind});}
  }catch(error){return jsonError('Invalid EarthScope geodesy request',400,{message:error.message});}
  return null;
}

export const EARTHSCOPE_PROXY_CONTRACT=Object.freeze({host:EARTHSCOPE_HOST,sourceProof:'EARTHSCOPE_NGF_PUBLIC_WEB_SERVICE',families:['GNSS','STRAIN','TILT','PORE_PRESSURE','ENVIRONMENT'],routes:Object.keys(ROUTES),boundary:'Only fixed NGF endpoint families on web-services.unavco.org are reachable. The proxy preserves upstream payloads and adds source-lineage headers; it cannot change context/derived data into measurement.'});