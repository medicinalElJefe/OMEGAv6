let geotiffModulePromise=null;
async function geotiffModule(){if(!geotiffModulePromise)geotiffModulePromise=import('../vendor/geotiff.bundle.mjs');return geotiffModulePromise;}
const finite=v=>Number.isFinite(Number(v));

export function epsgFromGeoKeys(keys={}){
  const values=[keys.ProjectedCSTypeGeoKey,keys.GeographicTypeGeoKey,keys.ProjectedCRSGeoKey,keys.GeodeticCRSGeoKey];
  for(const v of values)if(Number.isInteger(Number(v))&&Number(v)>0)return Number(v);
  return null;
}

export function utmToWgs84(easting,northing,zone,northern=true){
  // WGS84 inverse UTM, Snyder series. This is used only for geolocation of already
  // calibrated NISAR GeoTIFF pixels; it never changes the measurement value.
  const a=6378137.0,eccSquared=0.00669438,k0=0.9996;
  const eccPrimeSquared=eccSquared/(1-eccSquared),e1=(1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));
  let x=Number(easting)-500000.0,y=Number(northing);if(!northern)y-=10000000.0;
  const longOrigin=(Number(zone)-1)*6-180+3,M=y/k0;
  const mu=M/(a*(1-eccSquared/4-3*eccSquared**2/64-5*eccSquared**3/256));
  const phi1Rad=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1**2/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu)+(1097*e1**4/512)*Math.sin(8*mu);
  const sin=Math.sin(phi1Rad),cos=Math.cos(phi1Rad),tan=Math.tan(phi1Rad),N1=a/Math.sqrt(1-eccSquared*sin*sin),T1=tan*tan,C1=eccPrimeSquared*cos*cos,R1=a*(1-eccSquared)/Math.pow(1-eccSquared*sin*sin,1.5),D=x/(N1*k0);
  let lat=phi1Rad-(N1*tan/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*eccPrimeSquared)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*eccPrimeSquared-3*C1*C1)*D**6/720);
  let lon=(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*eccPrimeSquared+24*T1*T1)*D**5/120)/cos;
  lat=lat*180/Math.PI;lon=longOrigin+lon*180/Math.PI;return {lon,lat};
}

export function projectedToWgs84(x,y,epsg){
  epsg=Number(epsg);
  if(epsg===4326)return {lon:Number(x),lat:Number(y)};
  if(epsg>=32601&&epsg<=32660)return utmToWgs84(x,y,epsg-32600,true);
  if(epsg>=32701&&epsg<=32760)return utmToWgs84(x,y,epsg-32700,false);
  return null;
}

function polarizationFromTerm(term){return ({HHHH:'HH',HVHV:'HV',VVVV:'VV',VHVH:'VH',RHRH:'RH',RVRV:'RV'}[String(term||'').toUpperCase()]||String(term||'').toUpperCase()||'UNKNOWN');}
function quantityFromKey(key){if(key==='gamma0_db')return 'gamma0_db';if(key==='sigma0_db')return 'sigma0_db';return null;}

export async function extractNisarGcovAnchors(file,manifest,productKey,{cols=9,rows=9}={}){
  if(!file||manifest?.schema!=='omega.sar.nisar.gcov.measurement.v1')return {state:'NISAR_ANCHORS_NOT_GCOV',anchors:[]};
  const quantity=quantityFromKey(productKey);if(!quantity)return {state:'NISAR_ANCHORS_UNSUPPORTED_LAYER',anchors:[]};
  const mod=await geotiffModule(),buffer=await file.arrayBuffer(),tiff=await mod.fromArrayBuffer(buffer),image=await tiff.getImage(0);
  const width=image.getWidth(),height=image.getHeight();if(width<1||height<1)throw new Error('NISAR GeoTIFF has invalid dimensions');
  let bbox=null;try{bbox=image.getBoundingBox();}catch{}
  if(!Array.isArray(bbox)||bbox.length!==4||!bbox.every(Number.isFinite))return {state:'NISAR_ANCHORS_AFFINE_UNRESOLVED',anchors:[]};
  const epsg=epsgFromGeoKeys(image.getGeoKeys?.()||{})||Number(manifest.epsg)||null;
  if(!epsg)return {state:'NISAR_ANCHORS_EPSG_UNRESOLVED',anchors:[]};
  if(!projectedToWgs84((bbox[0]+bbox[2])/2,(bbox[1]+bbox[3])/2,epsg))return {state:`NISAR_ANCHORS_EPSG_${epsg}_UNSUPPORTED`,anchors:[]};
  const nx=Math.max(3,Math.min(17,Math.round(cols))),ny=Math.max(3,Math.min(17,Math.round(rows)));
  const raster=await image.readRasters({window:[0,0,width,height],width:nx,height:ny,samples:[0],interleave:true,resampleMethod:'nearest'});
  const nodataRaw=image.getGDALNoData?.(),nodata=nodataRaw==null?null:Number(nodataRaw),anchors=[];
  const [minX,minY,maxX,maxY]=bbox,pol=polarizationFromTerm(manifest.term),time=manifest.granule?.start_time||manifest.granule?.secondary_start_time||null;
  for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){
    const k=iy*nx+ix,value=Number(raster[k]);if(!Number.isFinite(value)||(Number.isFinite(nodata)&&value===nodata))continue;
    const x=minX+(ix+.5)/nx*(maxX-minX),y=maxY-(iy+.5)/ny*(maxY-minY),geo=projectedToWgs84(x,y,epsg);if(!geo||!finite(geo.lon)||!finite(geo.lat))continue;
    anchors.push({id:`NISAR:${manifest.source_sha256||manifest.granule?.granule||file.name}:${productKey}:${ix}:${iy}`,lon:geo.lon,lat:geo.lat,time,value,measured:true,inferred:false,grade:'A-',source:'NISAR_GCOV_GEOTIFF',platform:'NISAR',quantity,polarization:pol,channel:`${quantity}:${pol}`,evidenceClass:'SOURCE_PRODUCT_CALIBRATED_RTC_BACKSCATTER',provenance:{sourceSha256:manifest.source_sha256||null,outputSha256:manifest.output_sha256?.[productKey]||null,epsg,sourceFile:file.name,productKey}});
  }
  return {state:anchors.length?'NISAR_GCOV_ANCHORS_READY':'NISAR_GCOV_ANCHORS_EMPTY',anchors,epsg,quantity,polarization:pol,sourceCount:anchors.length,sampling:'NEAREST_SOURCE_SAMPLE_DECIMATION'};
}
