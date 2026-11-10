import {createHash} from 'node:crypto';

// R820: a truthfully unavailable third-party observation is not an application
// build failure. It is neither a valid observation nor permission to synthesize one.
export async function classifyObservedEarthR820(response, path='/api/earth/gibs/global?width=720&height=360'){
 const bytes=new Uint8Array(await response.arrayBuffer());
 const ct=response.headers.get('content-type')||'';
 if(!response.ok){
  const raw=new TextDecoder().decode(bytes);
  let diagnostic=null;try{diagnostic=JSON.parse(raw)}catch{}
  const attempts=diagnostic?.attempts;
  const dated=typeof diagnostic?.requestedDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(diagnostic.requestedDate);
  const admissible=Array.isArray(attempts)&&attempts.length>0&&attempts.length<=7&&attempts.every(a=>
   typeof a?.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&
   ['NO_VALID_OBSERVED_RASTER','UPSTREAM_NOT_IMAGE','UPSTREAM_FETCH_FAILED'].includes(a.code));
  if(response.status===502&&diagnostic?.ok===false&&diagnostic?.code==='GIBS_GLOBAL_NO_VALID_OBSERVATION'&&diagnostic?.truth==='NO_SYNTHETIC_SUBSTITUTE'&&dated&&admissible){
   return{state:'DEGRADED',code:diagnostic.code,date:diagnostic.requestedDate,attemptCount:attempts.length,bytes:0,sha:null,truth:'NO_SYNTHETIC_SUBSTITUTE'};
  }
  throw new Error(`R282.1 global observed Earth ${path} HTTP ${response.status}: ${raw.slice(0,240)}`);
 }
 const source=response.headers.get('x-omega-source')||'',date=response.headers.get('x-omega-date')||'',
 crs=response.headers.get('x-omega-crs')||'',truth=response.headers.get('x-omega-truth')||'',bbox=response.headers.get('x-omega-bbox')||'';
 if(!ct.startsWith('image/'))throw new Error(`R282.1 global observed Earth returned non-image ${ct||'NONE'}`);
 if(bytes.byteLength<12000)throw new Error(`R282.1 global observed Earth image too small: ${bytes.byteLength} bytes`);
 if(source!=='NASA-GIBS-VIIRS-SNPP-TRUECOLOR-GLOBAL')throw new Error(`R282.1 global source identity mismatch: ${source||'NONE'}`);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error(`R282.1 global observation date missing: ${date||'NONE'}`);
 if(crs!=='EPSG:4326'||truth!=='RETURNED_GLOBAL_OBSERVATION'||bbox!=='-180,-90,180,90')throw new Error(`R282.1 global projection/truth headers invalid: crs=${crs} truth=${truth} bbox=${bbox}`);
 return{state:'OBSERVED',date,bytes:bytes.byteLength,sha:createHash('sha256').update(bytes).digest('hex'),source,crs,truth,bbox};
}
