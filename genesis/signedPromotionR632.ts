// R632: deployment-controller attestation with registered authority.
// Registry provisioning is privileged host responsibility, not authenticated here.
import {createPublicKey,verify as verifySignature} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import {resolveTrustedAuthority} from './authorityRegistryR622';
import {verifyPromotionRecord,type DeploymentPromotion} from './deploymentPromotionR631';
export type SignedDeploymentPromotion=DeploymentPromotion&{controllerKeyId:string;controllerPrincipal:string;signatureBase64:string};
export function promotionMessage(p:SignedDeploymentPromotion):string{
 return JSON.stringify(['OMEGA_DEPLOYMENT_PROMOTION_R632',p.repository,p.candidateSha,p.promotedSha,p.environment,p.deploymentId,p.deploymentStatus,p.deploymentUrl,p.observedAt,p.controllerReceiptId,p.controllerKeyId,p.controllerPrincipal]);
}
export function verifySignedPromotion(db:SqliteLike,p:SignedDeploymentPromotion,repository:string,sha:string,environment:string,now:string):{valid:boolean;reasons:string[]}{
 const reasons=[...verifyPromotionRecord(p,repository,sha,environment).reasons];
 const key=resolveTrustedAuthority(db,p.controllerKeyId,'DEPLOYMENT_CONTROLLER');
 if(!key||key.principal!==p.controllerPrincipal||!key.allowedScopes.includes('genesis:deploy:'+environment))reasons.push('untrusted deployment controller');
 if(!Number.isFinite(Date.parse(now))||Date.parse(p.observedAt)>Date.parse(now))reasons.push('deployment statement timestamp invalid');
 if(key){
  try{
   const sig=Buffer.from(p.signatureBase64,'base64');
   if(sig.length!==64||!verifySignature(null,Buffer.from(promotionMessage(p)),createPublicKey(key.publicKeyPem),sig))reasons.push('invalid controller signature');
  }catch{reasons.push('invalid controller signature');}
 }
 return {valid:reasons.length===0,reasons};
}
export const SIGNED_PROMOTION_BOUNDARY='REGISTERED_CONTROLLER_SIGNATURE_NOT_LIVE_BROWSER_PROOF' as const;
