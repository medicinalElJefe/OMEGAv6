// R624: separately signed observation claim, never interpreted as physical effect proof.
import {createHash,createPublicKey,verify as cryptoVerify} from 'node:crypto';
import type {SqliteLike} from './leaseStoreR610';
import {resolveTrustedAuthority} from './authorityRegistryR622';
export type SignedObservation={nonce:string;proposalId:string;workerId:string;receiptHash:string;observedResultHash:string;observedAt:string;observerKeyId:string;observerPrincipal:string;signatureBase64:string};
export function observationMessage(o:SignedObservation):string{return JSON.stringify(['OMEGA_GENESIS_OBSERVATION_R624',o.nonce,o.proposalId,o.workerId,o.receiptHash,o.observedResultHash,o.observedAt,o.observerKeyId,o.observerPrincipal]);}
export function initializeObservationLedger(db:SqliteLike):void{
 db.exec('CREATE TABLE IF NOT EXISTS genesis_observation_evidence (nonce TEXT PRIMARY KEY NOT NULL, observer_key_id TEXT NOT NULL, observation_json TEXT NOT NULL, observation_hash TEXT NOT NULL, recorded_at TEXT NOT NULL)');
}
export function recordIndependentObservation(db:SqliteLike,o:SignedObservation,now:string):{recorded:boolean;reason:string}{
 db.exec('BEGIN IMMEDIATE');
 try{
  const key=resolveTrustedAuthority(db,o.observerKeyId,'INDEPENDENT_OBSERVER');
  if(!key||key.principal!==o.observerPrincipal||!key.allowedScopes.includes('genesis:observe')){db.exec('ROLLBACK');return {recorded:false,reason:'observer not trusted'};}
  const t=Date.parse(now),at=Date.parse(o.observedAt);
  if(!Number.isFinite(t)||!Number.isFinite(at)||at>t||!o.nonce||!/^[a-f0-9]{64}$/.test(o.receiptHash)||!/^[a-f0-9]{64}$/.test(o.observedResultHash)){db.exec('ROLLBACK');return {recorded:false,reason:'invalid observation fields'};}
  let signatureValid=false;
  try{const sig=Buffer.from(o.signatureBase64,'base64');signatureValid=sig.length===64&&cryptoVerify(null,Buffer.from(observationMessage(o)),createPublicKey(key.publicKeyPem),sig);}catch{/* deny */}
  if(!signatureValid){db.exec('ROLLBACK');return {recorded:false,reason:'invalid observer signature'};}
  const ledger=db.prepare('SELECT proposal_id,worker_id,state,receipt_hash FROM genesis_action_ledger WHERE nonce=?').get(o.nonce) as {proposal_id?:string;worker_id?:string;state?:string;receipt_hash?:string}|undefined;
  const evidence=db.prepare('SELECT attestation_json FROM genesis_completion_evidence WHERE nonce=?').get(o.nonce) as {attestation_json?:string}|undefined;
  if(!ledger||ledger.state!=='COMPLETED'||ledger.proposal_id!==o.proposalId||ledger.worker_id!==o.workerId||ledger.receipt_hash!==o.receiptHash||!evidence?.attestation_json){db.exec('ROLLBACK');return {recorded:false,reason:'completion identity or receipt mismatch'};}
  const completion=JSON.parse(evidence.attestation_json) as {keyId?:string;principal?:string;resultHash?:string};
  if(completion.keyId===key.keyId||completion.principal===key.principal){db.exec('ROLLBACK');return {recorded:false,reason:'observer not independent from attestor'};}
  if(completion.resultHash!==o.observedResultHash){db.exec('ROLLBACK');return {recorded:false,reason:'observed result differs from claimed completion'};}
  const hash=createHash('sha256').update(observationMessage(o)).update(o.signatureBase64).digest('hex');
  const inserted=db.prepare('INSERT OR IGNORE INTO genesis_observation_evidence (nonce,observer_key_id,observation_json,observation_hash,recorded_at) VALUES (?,?,?,?,?)').run(o.nonce,o.observerKeyId,JSON.stringify(o),hash,now);
  if(inserted.changes!==1){db.exec('ROLLBACK');return {recorded:false,reason:'observation already recorded'};}
  db.exec('COMMIT');return {recorded:true,reason:'independent signed observation recorded'};
 }catch(e){try{db.exec('ROLLBACK')}catch{/* preserve error */}throw e;}
}
