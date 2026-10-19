// R634: independent runtime observation of an exact deployment.
// Observation must be signed by a separately registered observer, not the deployment controller.
// This verifies the signed observation statement, NOT the truth of its measurements.
import {createPublicKey,verify as verifySignature} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import {resolveTrustedAuthority} from './authorityRegistryR622';
import {auditSignedPromotion} from './promotionLedgerR633';
export type RuntimeObservation={repository:string;deploymentId:string;environment:string;promotedSha:string;observedUrl:string;httpStatus:number;reportedSha:string;observedAt:string;observerKeyId:string;observerPrincipal:string;signatureBase64:string};
export function runtimeObservationMessage(o:RuntimeObservation):string{
 return JSON.stringify(['OMEGA_RUNTIME_OBSERVATION_R634',o.repository,o.deploymentId,o.environment,o.promotedSha,o.observedUrl,o.httpStatus,o.reportedSha,o.observedAt,o.observerKeyId,o.observerPrincipal]);
}
export function verifyRuntimeObservation(db:SqliteLike,o:RuntimeObservation,expectedRepo:string,expectedSha:string,expectedEnvironment:string,now:string):{valid:boolean;reasons:string[]}{
 const reasons:string[]=[];
 const promotion=auditSignedPromotion(db,o.deploymentId,o.environment,expectedRepo,expectedSha,now);
 if(!promotion.valid)reasons.push(...promotion.reasons.map(r=>'promotion: '+r));
 if(o.repository!==expectedRepo||o.promotedSha!==expectedSha||o.reportedSha!==expectedSha||o.environment!==expectedEnvironment)reasons.push('observed deployment identity mismatch');
 if(o.httpStatus!==200)reasons.push('runtime HTTP status not 200');
 try{if(new URL(o.observedUrl).protocol!=='https:')reasons.push('runtime URL not HTTPS');}catch{reasons.push('invalid runtime URL');}
 if(!Number.isFinite(Date.parse(o.observedAt))||Date.parse(o.observedAt)>Date.parse(now))reasons.push('observation timestamp invalid');
 const observer=resolveTrustedAuthority(db,o.observerKeyId,'INDEPENDENT_OBSERVER');
 if(!observer||observer.principal!==o.observerPrincipal||!observer.allowedScopes.includes('genesis:observe:'+expectedEnvironment))reasons.push('untrusted runtime observer');
 const controller=db.prepare('SELECT controller_key_id FROM genesis_promotion_ledger WHERE deployment_id=? AND environment=?').get(o.deploymentId,o.environment) as {controller_key_id:string}|undefined;
 if(!controller||controller.controller_key_id===o.observerKeyId)reasons.push('observer not independent of controller');
 if(observer){try{const sig=Buffer.from(o.signatureBase64,'base64');if(sig.length!==64||!verifySignature(null,Buffer.from(runtimeObservationMessage(o)),createPublicKey(observer.publicKeyPem),sig))reasons.push('invalid observation signature');}catch{reasons.push('invalid observation signature');}}
 return {valid:reasons.length===0,reasons};
}
export const RUNTIME_OBSERVATION_BOUNDARY='SIGNED_INDEPENDENT_REPORT_NOT_BROWSER_INTERACTION_PROOF' as const;
