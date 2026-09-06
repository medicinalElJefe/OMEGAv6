import {OmegaApiError,runtimeSessionId,saveHybridBridge} from './platformAdapter';

export type SovereignBootstrapR117={
 ok:true;
 bridgeId:string;
 secret:string;
 pairingCode:string;
 connectorFilename:string;
 canonicalOrigin:string;
 createdAt:number;
 connectorRevision?:string;
 hybridProtocol?:string;
 agent?:{version?:string;sha256?:string;bytes?:number;protocol?:string};
};

export async function bootstrapSovereignR117():Promise<SovereignBootstrapR117>{
 const controller=new AbortController();
 const timer=window.setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch('/api/hybrid/bootstrap',{
   method:'POST',
   headers:{'content-type':'application/json','x-omega-session-id':runtimeSessionId()},
   body:JSON.stringify({rotate:true}),
   cache:'no-store',
   credentials:'same-origin',
   signal:controller.signal
  });
  const payload=await response.json().catch(()=>({} as any));
  if(!response.ok||!payload?.bridgeId||!payload?.secret||!payload?.pairingCode){
   throw new OmegaApiError(String(payload?.reply||payload?.code||`OMEGA bootstrap failed (${response.status})`),response.status,typeof payload?.code==='string'?payload.code:undefined,payload);
  }
  saveHybridBridge({bridgeId:payload.bridgeId,secret:payload.secret,pairingCode:payload.pairingCode});
  return payload as SovereignBootstrapR117;
 }catch(error){
  if(error instanceof OmegaApiError)throw error;
  if(error instanceof DOMException&&error.name==='AbortError')throw new OmegaApiError('Fresh Sovereign bootstrap timed out.',408,'TIMEOUT');
  throw new OmegaApiError(error instanceof Error?error.message:String(error),0,'NETWORK_ERROR');
 }finally{window.clearTimeout(timer)}
}
