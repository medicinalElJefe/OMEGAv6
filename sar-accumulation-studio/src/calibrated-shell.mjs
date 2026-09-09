import { sampleCalibratedSentinel1 } from './sentinel1-calibration.mjs';
import { measuredSpatialShell } from './sar-shell.mjs';

function offsetLonLat(lon,lat,eastMeters,northMeters){
  const dLat=northMeters/111320;
  const cos=Math.max(.05,Math.cos(Number(lat)*Math.PI/180));
  const dLon=eastMeters/(111320*cos);
  return {lon:Number(lon)+dLon,lat:Number(lat)+dLat};
}

export async function calibratedSpatialShell(record,lon,lat,{polarization='vv',quantity='sigmaNought',radiusMeters=60,signal,onProgress}={}){
  const r=Math.max(5,Math.min(Number(radiusMeters)||60,1000));
  const points=[{lon:Number(lon),lat:Number(lat),role:'center'}];
  for(let i=0;i<6;i++){
    const angle=i*Math.PI/3;
    points.push({...offsetLonLat(lon,lat,r*Math.cos(angle),r*Math.sin(angle)),role:`sector-${i+1}`});
  }
  const measured=[];
  for(let i=0;i<points.length;i++){
    const point=points[i];
    try{
      const sample=await sampleCalibratedSentinel1(record,point.lon,point.lat,{polarization,quantity,signal});
      if(sample.state==='CALIBRATED_SENTINEL1_GRD_SAMPLE')measured.push({lon:point.lon,lat:point.lat,value:sample.value,db:sample.db,measured:true,id:`${record.id}:${point.role}`,sample});
    }catch(error){/* unresolved sector is surfaced by the shell gate */}
    onProgress?.(i+1,points.length);
  }
  const shell=measuredSpatialShell(measured,lon,lat);
  return {
    ...shell,
    requestedRadiusMeters:r,
    calibratedQuantity:quantity,
    polarization:String(polarization).toUpperCase(),
    sourceRecordId:record.id,
    sourceAcquisitionTime:record.startTime,
    actualCalibratedSamples:measured.length,
    boundary:'1+6 is an observer applied to seven actual radiometrically calibrated GRD samples. It is not a claim of native hexagonal pixel geometry.'
  };
}
