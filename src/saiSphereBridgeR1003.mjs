import {fieldReceiptR1000,verifyFieldReceiptR1000,projectedRegionR998,verifyRegionalModelR998,predictRegionalR998,summarizeBankR998} from './saiRelationalLearningR992.mjs';
import {inspectionSHA} from './execution/saiHostInspectionR209.js';
export const SAI_SPHERE_KEY_R1003='omega.sai.sphere.r1003';
export const SAI_SPHERE_LIMIT_R1003=2097152;
// The receiving workspace independently reconstructs predictions from the
// embedded projected source and replays every regional optimizer.
export async function verifySaiSphereR1003(packet,read,{digest=inspectionSHA,onRegion=()=>{}}={}){
 if(!packet||packet.schema!=='OMEGA_SAI_SPHERE_READONLY_R1003'||packet.canonicalMutation!==false||!packet.field||!summarizeBankR998(packet.models).complete)throw Error('Complete read-only SAI bank required');
 const values=[],bindings=[];
 for(const model of packet.models.slice().sort((a,b)=>a.region-b.region)){
  const ds=projectedRegionR998(read,model.region),sourceSha256=await digest(ds);
  if(sourceSha256!==model.sourceSha256)throw Error('SAI source digest mismatch');
  const verified=verifyRegionalModelR998(ds,model);
  const compact={region:verified.region,weights:verified.weights,bestEpoch:verified.bestEpoch,partitions:verified.partitions,sourceSha256};
  bindings.push({region:model.region,sourceSha256,modelSha256:await digest(compact)});
  for(const row of ds.rows)values.push(predictRegionalR998(ds,verified,row.address).prediction);
  await onRegion(model.region);
 }
 return verifyFieldReceiptR1000(packet.field,values,bindings);
}
export function saiSpherePixelR1003(field,address){
 if(!Number.isSafeInteger(address)||address<0||address>=20736||field?.result?.values?.length!==20736)throw Error('Invalid SAI projection address');
 const value=field.result.values[address];
 if(!Number.isFinite(value))throw Error('Invalid SAI projection value');
 return {address,value,hue:Math.max(0,Math.min(1,value)),canonicalMutation:false};
}

 // R1004 portable transport: byte bounds and envelope integrity precede replay.
 // A digest detects corruption, not origin authentication.
export async function packSaiSphereR1004(packet,digest=inspectionSHA){
 if(!packet||packet.schema!=='OMEGA_SAI_SPHERE_READONLY_R1003'||packet.canonicalMutation!==false||!summarizeBankR998(packet.models).complete||!packet.field)throw Error('Invalid portable SAI transfer');
 const text=JSON.stringify({schema:'OMEGA_SAI_SPHERE_PORTABLE_R1004',body:packet,sha256:await digest(packet)});
 if(new TextEncoder().encode(text).length>SAI_SPHERE_LIMIT_R1003)throw Error('Portable SAI transfer exceeds byte budget');
 return text;
}
export async function unpackSaiSphereR1004(text,{digest=inspectionSHA}={}){
 if(typeof text!=='string'||!text||new TextEncoder().encode(text).length>SAI_SPHERE_LIMIT_R1003)throw Error('Invalid portable SAI transfer size');
 const envelope=JSON.parse(text);
 if(envelope?.schema!=='OMEGA_SAI_SPHERE_PORTABLE_R1004'||typeof envelope.sha256!=='string'||!/^[a-f0-9]{64}$/.test(envelope.sha256)||!envelope.body||await digest(envelope.body)!==envelope.sha256)throw Error('Portable SAI transfer digest mismatch');
 return envelope.body;
}
export async function replayPortableSaiSphereR1004(text,read,options={}){
 const packet=await unpackSaiSphereR1004(text,options);
 return verifySaiSphereR1003(packet,read,options);
}
