/**
 * R577: strict chronological observation admission.
 * A catalog lastModified/HTTP cache timestamp is NOT an acquisition timestamp.
 * This module never infers precipitation, velocity, missing pixels or frames.
 */
export const OBSERVATION_TIMELINE_SCHEMA='OMEGA_OBSERVATION_TIMELINE_V1';
const ISO_UTC=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
const validBounds=b=>Array.isArray(b)&&b.length===4&&b.every(finite)&&b[0]>=-180&&b[2]<=180&&b[1]>=-90&&b[3]<=90&&b[0]<b[2]&&b[1]<b[3];
const iso=s=>typeof s==='string'&&ISO_UTC.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString()===new Date(Date.parse(s)).toISOString();
export function admitObservationTimeline(rows,{now=Date.now(),maxAgeMs=86400000,maxGapMs=1800000}={}){
 const rejected=[],admitted=[];
 if(!Array.isArray(rows))return {schema:OBSERVATION_TIMELINE_SCHEMA,state:'HELD',frames:[],rejected:[{index:-1,reason:'FRAMES_NOT_ARRAY'}],gaps:[],reason:'NO_ADMISSIBLE_FRAMES'};
 rows.forEach((r,index)=>{
  const reject=reason=>rejected.push({index,reason});
  if(!r||typeof r!=='object')return reject('INVALID_RECORD');
  if(!['SATELLITE_IMAGERY','RADAR_REFLECTIVITY','RADAR_PRECIPITATION'].includes(r.measurement))return reject('UNKNOWN_MEASUREMENT');
  if(typeof r.provider!=='string'||!r.provider.trim()||typeof r.product!=='string'||!r.product.trim()||typeof r.instrument!=='string'||!r.instrument.trim())return reject('MISSING_SOURCE_IDENTITY');
  if(!iso(r.acquiredAt))return reject('UNVERIFIED_ACQUISITION_TIME');
  const time=Date.parse(r.acquiredAt);
  if(time>now||now-time>maxAgeMs)return reject('OUTSIDE_VERIFIED_TIME_WINDOW');
  if(!validBounds(r.bounds))return reject('INVALID_GEOREFERENCING');
  if(!finite(r.resolutionMeters)||r.resolutionMeters<=0)return reject('INVALID_RESOLUTION');
  if(typeof r.sourceUrl!=='string'||!/^https:\/\//.test(r.sourceUrl))return reject('MISSING_HTTPS_SOURCE');
  if(typeof r.evidenceId!=='string'||!r.evidenceId.trim())return reject('MISSING_EVIDENCE_ID');
  if(r.timestampAuthority!=='ACQUISITION_METADATA')return reject('HTTP_METADATA_NOT_ACQUISITION');
  admitted.push({...r,time,sourceIndex:index});
 });
 admitted.sort((a,b)=>a.time-b.time||a.evidenceId.localeCompare(b.evidenceId));
 const first=admitted[0],frames=[],gaps=[];
 for(const frame of admitted){
  if(first&&(frame.provider!==first.provider||frame.product!==first.product||frame.instrument!==first.instrument||frame.measurement!==first.measurement||frame.resolutionMeters!==first.resolutionMeters||frame.bounds.some((v,i)=>v!==first.bounds[i]))){rejected.push({index:frame.sourceIndex,reason:'INCOMPATIBLE_PRODUCT_OR_GRID'});continue}
  if(frames.some(x=>x.time===frame.time)){rejected.push({index:frame.sourceIndex,reason:'DUPLICATE_ACQUISITION_TIME'});continue}
  if(frames.length&&frame.time-frames[frames.length-1].time>maxGapMs)gaps.push({from:frames[frames.length-1].acquiredAt,to:frame.acquiredAt,deltaMs:frame.time-frames[frames.length-1].time});
  frames.push(frame);
 }
 const safeFrames=frames.map(({time,sourceIndex,...rest})=>rest);
 return {schema:OBSERVATION_TIMELINE_SCHEMA,state:safeFrames.length>=2&&gaps.length===0?'READY':'HELD',frames:safeFrames,rejected,gaps,reason:safeFrames.length<2?'INSUFFICIENT_CHRONOLOGICAL_OBSERVATIONS':gaps.length?'TEMPORAL_GAPS':'CHRONOLOGICAL_SOURCE_PROVEN'};
}
