import {atlasR881,disclosureR881,gateR881,byteReceiptR881} from './creationCanonR881.mjs';
const JSON_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-studio-revision':'R881','x-omega-proof-authority':'R237'};
const json=(data,status=200,additional={})=>new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...additional}});
/** Additive read-only API. Returns null to delegate unrelated paths to R116. */
export async function creationStudioApiR881(request){
 const url=new URL(request.url),path=url.pathname;
 if(!path.startsWith('/api/creation-studio/'))return null;
 if(request.method!=='GET')return json({ok:false,code:'READ_ONLY_EDGE_STUDIO',canonicalMutation:false},405,{allow:'GET'});
 if(path==='/api/creation-studio/disclosure')return json({ok:true,...disclosureR881()});
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
