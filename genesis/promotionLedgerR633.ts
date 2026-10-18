// R633: durable deployment promotion ledger, one signed claim per deployment/environment.
// Signed statement is preserved for audit; not a production browser proof.
import {createHash} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import {verifySignedPromotion,type SignedDeploymentPromotion,promotionMessage} from './signedPromotionR632';
export function initializePromotionLedger(db:SqliteLike):void{
 db.exec('CREATE TABLE IF NOT EXISTS genesis_promotion_ledger (deployment_id TEXT NOT NULL, environment TEXT NOT NULL, promoted_sha TEXT NOT NULL, controller_key_id TEXT NOT NULL, statement_json TEXT NOT NULL, statement_hash TEXT NOT NULL, recorded_at TEXT NOT NULL, PRIMARY KEY(deployment_id,environment))');
}
export function recordSignedPromotion(db:SqliteLike,p:SignedDeploymentPromotion,repository:string,sha:string,environment:string,now:string):{recorded:boolean;reason:string}{
 db.exec('BEGIN IMMEDIATE');
 try{
  const verified=verifySignedPromotion(db,p,repository,sha,environment,now);
  if(!verified.valid){db.exec('ROLLBACK');return {recorded:false,reason:verified.reasons.join('; ')};}
  const digest=createHash('sha256').update(promotionMessage(p)).update(p.signatureBase64).digest('hex');
  const result=db.prepare('INSERT OR IGNORE INTO genesis_promotion_ledger(deployment_id,environment,promoted_sha,controller_key_id,statement_json,statement_hash,recorded_at) VALUES (?,?,?,?,?,?,?)').run(p.deploymentId,p.environment,p.promotedSha,p.controllerKeyId,JSON.stringify(p),digest,now);
  if(result.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'deployment promotion already recorded'};}
  db.exec('COMMIT');return {recorded:true,reason:'signed promotion recorded'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* preserve error */}throw e;}
}
export function auditSignedPromotion(db:SqliteLike,deploymentId:string,environment:string,repository:string,sha:string,now:string):{valid:boolean;reasons:string[]}{
 const row=db.prepare('SELECT promoted_sha,controller_key_id,statement_json,statement_hash FROM genesis_promotion_ledger WHERE deployment_id=? AND environment=?').get(deploymentId,environment) as {promoted_sha:string;controller_key_id:string;statement_json:string;statement_hash:string}|undefined;
 if(!row)return {valid:false,reasons:['promotion record missing']};
 try{
  const p=JSON.parse(row.statement_json) as SignedDeploymentPromotion;
  const result=verifySignedPromotion(db,p,repository,sha,environment,now);
  const digest=createHash('sha256').update(promotionMessage(p)).update(p.signatureBase64).digest('hex');
  const reasons=[...result.reasons];
  if(digest!==row.statement_hash||p.promotedSha!==row.promoted_sha||p.controllerKeyId!==row.controller_key_id||p.deploymentId!==deploymentId||p.environment!==environment)reasons.push('stored promotion integrity mismatch');
  return {valid:reasons.length===0,reasons};
 }catch{return {valid:false,reasons:['invalid promotion record']};}
}
export const PROMOTION_LEDGER_BOUNDARY='SIGNED_STATEMENT_AUDIT_NOT_LIVE_DEPLOYMENT' as const;
