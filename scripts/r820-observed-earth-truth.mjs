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
  const admissible=Array.isArray(attempts)&&attempts.length>0&&attempts.length<=14&&attempts.every(a=>
   ['NOAA21','NOAA20','SNPP'].includes(a?.sensor)&&typeof a?.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)&&
   ['NO_VALID_OBSERVED_RASTER','UPSTREAM_NOT_IMAGE','UPSTREAM_FETCH_FAILED'].includes(a.code));
  if(response.status===502&&diagnostic?.ok===false&&diagnostic?.code==='GIBS_GLOBAL_NO_VALID_OBSERVATION'&&diagnostic?.truth==='NO_SYNTHETIC_SUBSTITUTE'&&dated&&admissible){
   return{state:'DEGRADED',code:diagnostic.code,date:diagnostic.requestedDate,attemptCount:attempts.length,bytes:0,sha:null,truth:'NO_SYNTHETIC_SUBSTITUTE'};
  }
  throw new Error(`R282.1 global observed Earth ${path} HTTP ${response.status}: ${raw.slice(0,240)}`);
 }
 const source=response.headers.get('x-omega-source')||'',date=response.headers.get('x-omega-date')||'',
 sensor=response.headers.get('x-omega-sensor')||'',layer=response.headers.get('x-omega-layer')||'',
 lookback=response.headers.get('x-omega-lookback-days')||'',
 crs=response.headers.get('x-omega-crs')||'',truth=response.headers.get('x-omega-truth')||'',bbox=response.headers.get('x-omega-bbox')||'';
 if(!ct.startsWith('image/'))throw new Error(`R282.1 global observed Earth returned non-image ${ct||'NONE'}`);
 if(bytes.byteLength<12000)throw new Error(`R282.1 global observed Earth image too small: ${bytes.byteLength} bytes`);
 if(!['NASA-GIBS-VIIRS-NOAA21-TRUECOLOR-GLOBAL','NASA-GIBS-VIIRS-NOAA20-TRUECOLOR-GLOBAL'].includes(source))throw new Error(`R282.1 global source identity mismatch: ${source||'NONE'}`);
 const expected=sensor==='NOAA21'?{source:'NASA-GIBS-VIIRS-NOAA21-TRUECOLOR-GLOBAL',layer:'VIIRS_NOAA21_CorrectedReflectance_TrueColor'}:
  sensor==='NOAA20'?{source:'NASA-GIBS-VIIRS-NOAA20-TRUECOLOR-GLOBAL',layer:'VIIRS_NOAA20_CorrectedReflectance_TrueColor'}:null;
 if(!expected||expected.source!==source||expected.layer!==layer)throw new Error('R282.1 global sensor/layer provenance mismatch');
 if(!/^[0-6]$/.test(lookback))throw new Error('R282.1 global lookback provenance missing or invalid');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw new Error(`R282.1 global observation date missing or invalid: ${date||'NONE'}`);
 if(crs!=='EPSG:4326'||truth!=='RETURNED_GLOBAL_OBSERVATION'||bbox!=='-180,-90,180,90')throw new Error(`R282.1 global projection/truth headers invalid: crs=${crs} truth=${truth} bbox=${bbox}`);
 return{state:'OBSERVED',date,bytes:bytes.byteLength,sha:createHash('sha256').update(bytes).digest('hex'),source,crs,truth,bbox};
}
