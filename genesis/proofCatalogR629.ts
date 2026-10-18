// R629: persistent, immutable-by-interface proof receipt catalog.
// Insertion is NOT authority: receipt rows are claims until verified by external source.
import type {SqliteLike} from './leaseStoreR610';
import type {ProofReceipt,TrustedProofResolver} from './resolvedProofImportR628';
const sha=/^[a-f0-9]{40,64}$/;
export type ReceiptOrigin='UNVERIFIED_IMPORT'|'GITHUB_CI_CLAIM'|'DEPLOYMENT_CLAIM'|'EXTERNALLY_ATTESTED';
export function initializeProofCatalog(db:SqliteLike):void{
 db.exec('CREATE TABLE IF NOT EXISTS genesis_proof_catalog (capability_id TEXT NOT NULL, source_digest TEXT NOT NULL, proof_digest TEXT NOT NULL, receipt_json TEXT NOT NULL, origin TEXT NOT NULL, recorded_at TEXT NOT NULL, PRIMARY KEY(capability_id,source_digest,proof_digest))');
}
export function recordProofClaim(db:SqliteLike,receipt:ProofReceipt,origin:ReceiptOrigin,now:string):boolean{
 if(!receipt.capabilityId||!sha.test(receipt.sourceDigest)||!sha.test(receipt.proofDigest)||!Number.isFinite(Date.parse(now)))return false;
 const result=db.prepare('INSERT OR IGNORE INTO genesis_proof_catalog(capability_id,source_digest,proof_digest,receipt_json,origin,recorded_at) VALUES (?,?,?,?,?,?)').run(receipt.capabilityId,receipt.sourceDigest,receipt.proofDigest,JSON.stringify(receipt),origin,now);
 return result.changes===1;
}
export function listProofClaims(db:SqliteLike,capabilityId:string,sourceDigest:string):{receipt:ProofReceipt;origin:ReceiptOrigin}[]{
 const rows=db.prepare('SELECT receipt_json,origin FROM genesis_proof_catalog WHERE capability_id=? AND source_digest=?').all(capabilityId,sourceDigest) as {receipt_json:string;origin:ReceiptOrigin}[];
 return rows.map(r=>({receipt:JSON.parse(r.receipt_json) as ProofReceipt,origin:r.origin}));
}
// This resolver is deliberately non-promoting: database rows alone cannot verify a deployment.
export function untrustedCatalogResolver(_db:SqliteLike):TrustedProofResolver{
 return {authority:'TRUSTED_HOST_ONLY',resolve:()=>null};
}
export const CATALOG_PROOF_BOUNDARY='STORED_CLAIMS_NOT_AUTHENTICATED_DEPLOYMENT' as const;
