// R884: WGS84 local ENU geometry and source-bound USGS point evidence.
// The returned USGS orthometric/unspecified elevation is NEVER passed into WGS84 ECEF.
import {byteReceiptR881} from './creationCanonR881.mjs';
export const WGS84_R884=Object.freeze({aMeters:6378137,inverseFlattening:298.257223563,
 horizontalDatum:'WGS84',verticalDatum:'WGS84_ELLIPSOID',source:'NGA WGS84 DEFINING ELLIPSOID',proofTier:'DER'});
const finite=(n)=>typeof n==='number'&&Number.isFinite(n);
function checkGeoR884(p){
 if(!p||p.horizontalDatum!=='WGS84'||p.verticalDatum!=='WGS84_ELLIPSOID')throw new RangeError('WGS84_HORIZONTAL_ELLIPSOID_DATUM_REQUIRED');
 if(!finite(p.lat)||p.lat< -90||p.lat>90||!finite(p.lon)||p.lon< -180||p.lon>180||!finite(p.ellipsoidalHeightMeters))throw new RangeError('WGS84_COORDINATE_UNITS_OR_HEIGHT_INVALID');
 if(typeof p.source!=='string'||!p.source.trim())throw new RangeError('COORDINATE_SOURCE_REQUIRED');
 return p;
}
export function ecefR884(packet){
 const p=checkGeoR884(packet),lat=p.lat*Math.PI/180,lon=p.lon*Math.PI/180;
 const f=1/WGS84_R884.inverseFlattening,e2=f*(2-f),sin=Math.sin(lat);
 const N=WGS84_R884.aMeters/Math.sqrt(1-e2*sin*sin),h=p.ellipsoidalHeightMeters;
 const xyz={x:(N+h)*Math.cos(lat)*Math.cos(lon),y:(N+h)*Math.cos(lat)*Math.sin(lon),z:(N*(1-e2)+h)*sin};
 return Object.freeze({...xyz,frame:'WGS84_ECEF',units:'meters',source:p.source,proofTier:'DER',noMeasuredElevationClaim:true});
}
export function enuR884(origin,target){
 checkGeoR884(origin);checkGeoR884(target);
 const o=ecefR884(origin),t=ecefR884(target),dx=t.x-o.x,dy=t.y-o.y,dz=t.z-o.z;
 const lat=origin.lat*Math.PI/180,lon=origin.lon*Math.PI/180;
 const sl=Math.sin(lon),cl=Math.cos(lon),sp=Math.sin(lat),cp=Math.cos(lat);
 return Object.freeze({east:-sl*dx+cl*dy,north:-sp*cl*dx-sp*sl*dy+cp*dz,up:cp*cl*dx+cp*sl*dy+sp*dz,frame:'WGS84_LOCAL_ENU',units:'meters',originSource:origin.source,targetSource:target.source,
  horizontalDatum:'WGS84',verticalDatum:'WGS84_ELLIPSOID',proofTier:'DER',measuredAccuracy:'NOT_ESTABLISHED_BY_TRANSFORM'});
}
export function epqsRequestR884({latitude,longitude,horizontalDatum,source}={}){
 if(horizontalDatum!=='NAD83')return Object.freeze({ok:false,state:'NAD83_INPUT_SOURCE_REQUIRED',reason:'USGS EPQS declares NAD 1983 coordinates. WGS84-to-NAD83 transformation is not supplied.'});
 if(!finite(latitude)||Math.abs(latitude)>90||!finite(longitude)||Math.abs(longitude)>180)
  return Object.freeze({ok:false,state:'GEO_COORDINATE_INVALID'});
 if(typeof source!=='string'||source.length<3)return Object.freeze({ok:false,state:'GEODETIC_SOURCE_REQUIRED'});
 const query=new URL('https://epqs.nationalmap.gov/v1/json');
 query.searchParams.set('x',String(longitude));query.searchParams.set('y',String(latitude));
 query.searchParams.set('wkid','4269');query.searchParams.set('units','Meters');query.searchParams.set('includeDate','false');
 return Object.freeze({ok:true,method:'GET',url:query.toString(),source,sourceHorizontalDatum:'NAD83',requiredServer:'epqs.nationalmap.gov',
  USGS:'USGS_ELEVATION_POINT_QUERY_SERVICE',outputVerticalDatum:'UNVERIFIED_SERVICE_METADATA',sourceEvidenceRequired:true,
  destinationFrame:'NOT_WGS84_ENU',meshValidity:false,physicalDatumEquality:false});
}
export async function epqsPointR884(spec,fetcher=fetch){
 const req=epqsRequestR884(spec);
 if(!req.ok)return req;
 let raw='';
 try{
  const signal=AbortSignal.timeout(7000);
  const response=await fetcher(req.url,{method:'GET',headers:{accept:'application/json'},signal,redirect:'error'});
  if(!response.ok)return{ok:false,state:'USGS_UPSTREAM_HTTP_HELD',status:response.status,source:req.url};
  raw=await response.text();
  if(raw.length>65536)return{ok:false,state:'UPSTREAM_RESPONSE_TOO_LARGE_HELD'};
  const payload=JSON.parse(raw),value=payload?.value;
  if((typeof value!=='number'&&typeof value!=='string')||!Number.isFinite(Number(value)))
   return{ok:false,state:'USGS_ELEVATION_VALUE_UNVERIFIED',source:req.url};
  const proof=await byteReceiptR881(raw,{source:req.url,proofTier:'OBS'});
  return Object.freeze({ok:true,state:'USGS_POINT_RETURN_OBSERVED_UNCONVERTED',sourceUrl:req.url,
    source:req.source,queriedNAD83Latitude:spec.latitude,queriedNAD83Longitude:spec.longitude,
    elevation:Number(value),units:'meters',horizontalDatum:'NAD83',verticalDatum:'UNVERIFIED_SERVICE_METADATA',
    sourceReceipt:proof,proofTier:'OBS',sourcePayload:payload,
    accuracy:'NOT_SOURCE_VERIFIED',meshValidity:'NOT_ESTABLISHED',isWgs84EllipsoidalHeight:false,
    cannotPopulateENUHeight:true,physicalProof:false,syntheticElevation:false,canonicalMutation:false});
 }catch(error){return{ok:false,state:'USGS_NETWORK_OR_FORMAT_HELD',reason:error instanceof Error?error.message:String(error),sourceUrl:req.url}}
}
