// R625: read-only audit of completion and observation after restart.
// Historical signature validity is not current key trust or physical-effect proof.
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import {auditCompletionEvidence} from './completionEvidenceR621';
import {observationMessage,type SignedObservation} from './independentObservationR624';
export function auditObservedCompletion(db:SqliteLike,nonce:string,now:string):{valid:boolean;reasons:string[]}{
 const reasons:string[]=[];
 const completion=auditCompletionEvidence(db,nonce,now);
 if(!completion.valid)reasons.push(...completion.reasons.map(x=>'completion: '+x));
 const observation=db.prepare('SELECT observer_key_id,observation_json,observation_hash FROM genesis_observation_evidence WHERE nonce=?').get(nonce) as {observer_key_id:string;observation_json:string;observation_hash:string}|undefined;
 const evidence=db.prepare('SELECT attestation_json FROM genesis_completion_evidence WHERE nonce=?').get(nonce) as {attestation_json:string}|undefined;
 const ledger=db.prepare('SELECT proposal_id,worker_id,receipt_hash,state FROM genesis_action_ledger WHERE nonce=?').get(nonce) as {proposal_id:string;worker_id:string;receipt_hash:string;state:string}|undefined;
 if(!observation||!evidence||!ledger)return {valid:false,reasons:[...reasons,'missing observation, completion or ledger']};
 try{
  const o=JSON.parse(observation.observation_json) as SignedObservation;
  const a=JSON.parse(evidence.attestation_json) as {keyId:string;principal:string;resultHash:string};
  const key=db.prepare('SELECT principal,public_key_pem,role,revoked,allowed_scopes_json FROM genesis_trusted_keys WHERE key_id=?').get(o.observerKeyId) as {principal:string;public_key_pem:string;role:string;revoked:number;allowed_scopes_json:string}|undefined;
  if(!key||key.role!=='INDEPENDENT_OBSERVER'||key.revoked!==0||key.principal!==o.observerPrincipal||!JSON.parse(key.allowed_scopes_json).includes('genesis:observe'))reasons.push('observer trust invalid at audit time');
  const digest=createHash('sha256').update(observationMessage(o)).update(o.signatureBase64).digest('hex');
  if(digest!==observation.observation_hash)reasons.push('observation digest mismatch');
  if(o.nonce!==nonce||o.proposalId!==ledger.proposal_id||o.workerId!==ledger.worker_id||o.receiptHash!==ledger.receipt_hash||o.observedResultHash!==a.resultHash||ledger.state!=='COMPLETED')reasons.push('cross-record identity or result mismatch');
  if(o.observerKeyId===a.keyId||o.observerPrincipal===a.principal)reasons.push('observer not independent');
  if(!Number.isFinite(Date.parse(o.observedAt))||Date.parse(o.observedAt)>Date.parse(now))reasons.push('observation timestamp invalid');
  if(key){
   const sig=Buffer.from(o.signatureBase64,'base64');
   if(sig.length!==64||!cryptoVerify(null,Buffer.from(observationMessage(o)),createPublicKey(key.public_key_pem),sig))reasons.push('observer signature invalid');
  }
 }catch{reasons.push('observation parse or signature invalid');}
 return {valid:reasons.length===0,reasons};
}
