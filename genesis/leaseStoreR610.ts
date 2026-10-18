// R610: transactional lease consumption for a single SQLite authority.
// The caller MUST use a trusted DB, one atomic transaction, and independently verify the lease issuer.
import type {ExecutionLease} from './executionBoundaryR609';
export type SqliteLike={exec(sql:string):void;prepare(sql:string):{run(...args:unknown[]):{changes:number};get(...args:unknown[]):unknown}};
export type Consumption={consumed:boolean;reason:string};
export function initializeLeaseStore(db:SqliteLike):void{
 db.exec('CREATE TABLE IF NOT EXISTS genesis_consumed_leases (nonce TEXT PRIMARY KEY NOT NULL, proposal_id TEXT NOT NULL, worker_id TEXT NOT NULL, consumed_at TEXT NOT NULL)');
}
export function consumeLeaseOnce(db:SqliteLike,lease:ExecutionLease,workerId:string,now:string,validated:boolean):Consumption{
 // validated MUST represent independently authenticated issuer, verified proposal, scope and worker.
 if(!validated)return {consumed:false,reason:'external validation required'};
 if(lease.workerId!==workerId)return {consumed:false,reason:'wrong worker'};
 const t=Date.parse(now),start=Date.parse(lease.issuedAt),end=Date.parse(lease.expiresAt);
 if(!Number.isFinite(t)||!Number.isFinite(start)||!Number.isFinite(end)||t<start||t>=end||start>=end)return {consumed:false,reason:'lease time invalid'};
 if(lease.maxUses!==1||!lease.nonce||!lease.proposalId)return {consumed:false,reason:'invalid single-use lease'};
 // A unique primary key and INSERT OR IGNORE make concurrent attempts compete atomically in SQLite.
 const outcome=db.prepare('INSERT OR IGNORE INTO genesis_consumed_leases (nonce,proposal_id,worker_id,consumed_at) VALUES (?,?,?,?)').run(lease.nonce,lease.proposalId,workerId,now);
 return outcome.changes===1?{consumed:true,reason:'consumed'}:{consumed:false,reason:'already consumed'};
}
