const R_KM=6371.0088,DEG=Math.PI/180;
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));

export function eventTimestamp(event){const t=new Date(event?.time||event?.eventTime||'').getTime();return Number.isFinite(t)?t:null;}

export function haversineKm(a,b){
  if(!a||!b||![a.lon,a.lat,b.lon,b.lat].every(finite))return null;
  const p1=Number(a.lat)*DEG,p2=Number(b.lat)*DEG,dp=(Number(b.lat)-Number(a.lat))*DEG,dl=(Number(b.lon)-Number(a.lon))*DEG,q=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R_KM*Math.asin(Math.min(1,Math.sqrt(q)));
}

export function temporalPhase(deltaHours,nearHours=24){
  if(!finite(deltaHours))return 'TIME_UNRESOLVED';
  if(Math.abs(Number(deltaHours))<=Math.max(0,Number(nearHours)||0))return `NEAR_FRAME_${Math.round(Math.max(0,Number(nearHours)||0))}H`;
  return Number(deltaHours)<0?'BEFORE_FRAME':'AFTER_FRAME';
}

export function synchronizeEarthEvents(events,frameTime,target,{nearHours=24,nearKm=250}={}){
  const frameMs=new Date(frameTime||'').getTime();if(!Number.isFinite(frameMs)||!target||![target.lon,target.lat].every(finite))return {state:'WAITING_FOR_FRAME_TARGET',frameTime:null,target:null,eventCount:Array.isArray(events)?events.length:0,timedCount:0,nearestTemporal:null,nearestSpatial:null,coincident:[]};
  const rows=(Array.isArray(events)?events:[]).map(event=>{
    const t=eventTimestamp(event),deltaHours=t==null?null:(t-frameMs)/3600000,distanceKm=haversineKm(target,event);
    return {...event,eventTime:t==null?null:new Date(t).toISOString(),deltaHours,distanceKm,temporalPhase:temporalPhase(deltaHours,nearHours),relationOnly:true};
  });
  const timed=rows.filter(r=>finite(r.deltaHours)).sort((a,b)=>Math.abs(a.deltaHours)-Math.abs(b.deltaHours)),spatial=rows.filter(r=>finite(r.distanceKm)).sort((a,b)=>a.distanceKm-b.distanceKm),coincident=rows.filter(r=>finite(r.deltaHours)&&Math.abs(r.deltaHours)<=nearHours&&finite(r.distanceKm)&&r.distanceKm<=nearKm).sort((a,b)=>(a.distanceKm/Math.max(1,nearKm)+Math.abs(a.deltaHours)/Math.max(1,nearHours))-(b.distanceKm/Math.max(1,nearKm)+Math.abs(b.deltaHours)/Math.max(1,nearHours)));
  return {state:'SYNCHRONIZED',frameTime:new Date(frameMs).toISOString(),target:{lon:Number(target.lon),lat:Number(target.lat)},eventCount:rows.length,timedCount:timed.length,nearestTemporal:timed[0]||null,nearestSpatial:spatial[0]||null,coincident,boundary:'Spatiotemporal proximity is a relational comparison only. It does not establish causation, physical impact, deformation, hydrologic response, or SAR-observed change.'};
}
