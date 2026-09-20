import {evaluateQtiR332,qtiManifestR332,verifyObservedOutcomeR332,R332_QTI_REVISION} from './qtiControlR332.js';

const json=(data,status=200)=>new Response(JSON.stringify(data,null,2),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-omega-qti-revision':R332_QTI_REVISION}});
export async function publicQtiR332(request){
 const path=new URL(request.url).pathname;
 if(path==='/api/intelligence/r332/qti/manifest'&&request.method==='GET')return json({ok:true,...qtiManifestR332()});
 if(path==='/api/intelligence/r332/qti/evaluate'&&request.method==='POST'){
  const body=await request.json().catch(()=>({}));
  const result=evaluateQtiR332(body?.proposal||body,body?.state||{});
  return json({ok:result.outcome!=='DENY',result},result.outcome==='DENY'?409:200);
 }
 if(path==='/api/intelligence/r332/qti/postcondition'&&request.method==='POST'){
  const body=await request.json().catch(()=>({})),result=verifyObservedOutcomeR332(body);
  return json({ok:result.outcome==='PASS',result},result.outcome==='PASS'?200:409);
 }
 if(path.startsWith('/api/intelligence/r332/qti/'))return json({ok:false,code:'R332_QTI_ROUTE_NOT_FOUND',canonicalAdmission:false},404);
 return null;
}
