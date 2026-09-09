import {r240DecodeAddress,r240EncodeAddress,R240_CALCULUS_SCHEMA,type R240Address} from './calculusAddressFabricR240';

export const R240_BRIDGE_SCHEMA='OMEGA_HYBRID_BRIDGE_CALCULUS_R240' as const;
export type BridgeOrientationR240=-1|0|1;
export type HybridBridgeCalculusR240={
 schema:typeof R240_BRIDGE_SCHEMA;
 revision:'R240';
 calculusSchema:typeof R240_CALCULUS_SCHEMA;
 address:R240Address;
 orientation:BridgeOrientationR240;
 sourceFrame:'BROWSER_OPERATOR';
 transitFrame:'CLOUD_DURABLE_QUEUE';
 destinationFrame:'SELECTED_HYBRID_HOST';
 returnFrame:'R141_RETURN_PROOF';
 targetDeviceId:string;
 snapshotEpoch:number;
 snapshotObservedAt:number;
 sourceProfileSha256:string|null;
 bridgeTraceId:string;
 invariants:string[];
 canonicalAdmission:false;
};

const fnv=(value:string)=>{let h=2166136261;for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const compact=(value:any)=>String(value??'').trim().slice(0,160);
export function hybridOperationAddressR240(op:string,stepId='S00'):R240Address{
 const key=`HYBRID:${String(op||'UNKNOWN').toUpperCase()}:${stepId}`;
 const h=fnv(key),organ=4,branch=(h>>>12)%12,cell=(h>>>6)%12,lane=h%12,address=r240EncodeAddress(organ,branch,cell,lane),deepPhase=(h>>>18)%12;
 return{...r240DecodeAddress(address),deepPhase,deepAddress:address*12+deepPhase};
}
export function buildHybridBridgeCalculusR240(input:{op:string;stepId:string;targetDeviceId:string;snapshotEpoch:number;snapshotObservedAt:number;sourceProfileSha256?:string|null;sessionId:string}):HybridBridgeCalculusR240{
 const address=hybridOperationAddressR240(input.op,input.stepId),targetDeviceId=compact(input.targetDeviceId),snapshotEpoch=Math.max(0,Math.floor(Number(input.snapshotEpoch)||0)),snapshotObservedAt=Math.max(0,Math.floor(Number(input.snapshotObservedAt)||0)),sourceProfileSha256=/^[0-9a-f]{64}$/i.test(compact(input.sourceProfileSha256))?compact(input.sourceProfileSha256).toLowerCase():null;
 const bridgeTraceId=`r240_${fnv([input.sessionId,targetDeviceId,snapshotEpoch,input.stepId,address.address].join('|')).toString(16).padStart(8,'0')}`;
 return{schema:R240_BRIDGE_SCHEMA,revision:'R240',calculusSchema:R240_CALCULUS_SCHEMA,address,orientation:1,sourceFrame:'BROWSER_OPERATOR',transitFrame:'CLOUD_DURABLE_QUEUE',destinationFrame:'SELECTED_HYBRID_HOST',returnFrame:'R141_RETURN_PROOF',targetDeviceId,snapshotEpoch,snapshotObservedAt,sourceProfileSha256,bridgeTraceId,invariants:['SAME_CALCULUS_ADDRESS_ACROSS_BRIDGE','SAME_TARGET_DEVICE_ID','SAME_SHARED_SNAPSHOT_EPOCH','SAME_SOURCE_PROFILE_SHA_WHEN_PROVED','R32_INPUT_FINGERPRINT_BINDS_COMPLETE_STEP','R141_RETURN_FINGERPRINT_BINDS_ECHOED_CALCULUS','R147_DISPATCH_AUTHORITY_UNCHANGED','R125_CANON_ADMISSION_UNCHANGED'],canonicalAdmission:false};
}
export function bindHybridJobBridgeCalculusR240(body:any,sessionId:string){
 if(!body||typeof body!=='object'||!Array.isArray(body.steps))return body;
 const targetDeviceId=compact(body.targetDeviceId),snapshotEpoch=Math.max(0,Math.floor(Number(body.snapshotEpoch)||0)),snapshotObservedAt=Math.max(0,Math.floor(Number(body.snapshotObservedAt)||0)),sourceProfileSha256=body.resourceEnvelopeR239?.sourceProfileSha256||null;
 return{...body,steps:body.steps.map((step:any,index:number)=>{const stepId=compact(step?.id)||`S${String(index+1).padStart(2,'0')}`;return{...step,calculusBridgeR240:buildHybridBridgeCalculusR240({op:step?.op,stepId,targetDeviceId,snapshotEpoch,snapshotObservedAt,sourceProfileSha256,sessionId})}})};
}
export function bridgeRequestHeadersR240(method:string,url:string){const orientation:BridgeOrientationR240=String(method).toUpperCase()==='GET'?0:1,address=hybridOperationAddressR240(`${method}:${url}`,'HTTP');return{'x-omega-calculus-revision':'R240','x-omega-calculus-address':String(address.address),'x-omega-calculus-orientation':String(orientation),'x-omega-calculus-frame':orientation===0?'BROWSER_OBSERVE>CLOUD':'BROWSER_OPERATOR>CLOUD'};}
