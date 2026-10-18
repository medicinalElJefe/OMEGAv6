// R622: persistent trust registry. Provisioning MUST be restricted to a separate
// trusted administrator; this module does not grant an API caller registration rights.
import type {SqliteLike} from './leaseStoreR610';
import type {KeyAuthority} from './independentProofR608';
export type AuthorityRole='HUMAN_APPROVER'|'LEASE_ISSUER'|'COMPLETION_ATTESTOR'|'INDEPENDENT_OBSERVER';
export function initializeAuthorityRegistry(db:SqliteLike):void{
 db.exec("CREATE TABLE IF NOT EXISTS genesis_trusted_keys (key_id TEXT PRIMARY KEY NOT NULL, role TEXT NOT NULL CHECK(role IN ('HUMAN_APPROVER','LEASE_ISSUER','COMPLETION_ATTESTOR','INDEPENDENT_OBSERVER')), principal TEXT NOT NULL, public_key_pem TEXT NOT NULL, allowed_scopes_json TEXT NOT NULL, revoked INTEGER NOT NULL DEFAULT 0 CHECK(revoked IN (0,1)))");
}
export function provisionAuthorityKey(db:SqliteLike,key:KeyAuthority,role:AuthorityRole):boolean{
 if(!key.keyId||!key.principal||!key.publicKeyPem||!key.allowedScopes.length||key.revoked)return false;
 return db.prepare('INSERT OR IGNORE INTO genesis_trusted_keys (key_id,role,principal,public_key_pem,allowed_scopes_json,revoked) VALUES (?,?,?,?,?,0)').run(key.keyId,role,key.principal,key.publicKeyPem,JSON.stringify(key.allowedScopes)).changes===1;
}
export function revokeAuthorityKey(db:SqliteLike,keyId:string):boolean{
 return db.prepare('UPDATE genesis_trusted_keys SET revoked=1 WHERE key_id=? AND revoked=0').run(keyId).changes===1;
}
export function resolveTrustedAuthority(db:SqliteLike,keyId:string,role:AuthorityRole):KeyAuthority|null{
 const row=db.prepare('SELECT key_id,role,principal,public_key_pem,allowed_scopes_json,revoked FROM genesis_trusted_keys WHERE key_id=?').get(keyId) as {key_id:string;role:string;principal:string;public_key_pem:string;allowed_scopes_json:string;revoked:number}|undefined;
 if(!row||row.role!==role||row.revoked!==0)return null;
 try{
  const scopes=JSON.parse(row.allowed_scopes_json);
  if(!Array.isArray(scopes)||!scopes.every((s:unknown)=>typeof s==='string'))return null;
  return {keyId:row.key_id,principal:row.principal,publicKeyPem:row.public_key_pem,allowedScopes:scopes,revoked:false};
 }catch{return null;}
}
export const AUTHORITY_PROVISIONING='TRUSTED_ADMIN_ONLY_NOT_EXPOSED_TO_WORKERS' as const;
