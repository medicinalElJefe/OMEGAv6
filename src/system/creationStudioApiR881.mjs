import {atlasR881,disclosureR881,gateR881,byteReceiptR881} from './creationCanonR881.mjs';
import {epqsPointR884} from './geoEvidenceR884.mjs';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-studio-revision':'R881','x-omega-proof-authority':'R237'};
const json=(data,status=200,additional={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...additional}});
/** Additive read-only API. Returns null to delegate unrelated paths to R116. */
export async function creationStudioApiR881(request,env={}){
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith('/api/creation-studio/'))return null;
 if(request.method!=='GET')return json({ok:false,code:'READ_ONLY_EDGE_STUDIO',canonicalMutation:false},405,{allow:'GET'});
 if(path==='/api/creation-studio/disclosure')return json({ok:true,...disclosureR881()});
 if(path==='/api/creation-studio/usgs-epqs-point'){
  if(env?.OMEGA_USGS_POINT_ENABLED!=='true')return json({ok:false,state:'USGS_POINT_SOURCE_NOT_ENABLED_HELD',
   reason:'Explicit edge environment permission is required; no silent external dataset call.',canonicalMutation:false},503);
  const lat=Number(url.searchParams.get('latitude')),lon=Number(url.searchParams.get('longitude'));
  if(!url.searchParams.has('latitude')||!url.searchParams.has('longitude'))return json({ok:false,state:'GEODETIC_INPUTS_REQUIRED'},400);
  const result=await epqsPointR884({latitude:lat,longitude:lon,
    horizontalDatum:url.searchParams.get('horizontalDatum'),source:url.searchParams.get('source')});
  return json(result,result.ok?200:result.state==='NAD83_INPUT_SOURCE_REQUIRED'?422:503);
 }

 if(path==='/api/creation-studio/atlas'||path==='/api/creation-studio/receipt'){
  const raw=url.searchParams.get('row');
  if(!/^(0|[1-9][0-9]*)$/.test(raw||'')||Number(raw)>20735)return json({ok:false,code:'ROW_ID_0_20735_REQUIRED'},400);
  const record=atlasR881(Number(raw));
  if(path.endsWith('/receipt'))return json({ok:true,record,receipt:await byteReceiptR881(record,{source:'CF-D0001/2/3',proofTier:'DER'})});
  return json({ok:true,record});
 }
 if(path==='/api/creation-studio/gate'){
  const id=url.searchParams.get('id')||'';
  if(!['REC-011','ORION_GATE','R170','CF-N0001'].includes(id))return json({ok:false,code:'GATE_SOURCE_NOT_BOUND'},404);
  return json({ok:true,result:gateR881({id})});
 }
 return json({ok:false,code:'UNKNOWN_STUDIO_ROUTE'},404);
}
