// R611: durable action state transitions, with conservative crash recovery.
// Database adapter deliberately matches Node SQLite DatabaseSync prepare/run/get.
export type ActionState='CONSUMED'|'DISPATCHED'|'COMPLETED'|'FAILED'|'RECONCILE';
export type Database={exec(sql:string):void;prepare(sql:string):{run(...args:unknown[]):{changes:number};get(...args:unknown[]):unknown}};
export function initActionLedger(db:Database):void{
 db.exec("CREATE TABLE IF NOT EXISTS genesis_action_ledger (nonce TEXT PRIMARY KEY NOT NULL, proposal_id TEXT NOT NULL, worker_id TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('CONSUMED','DISPATCHED','COMPLETED','FAILED','RECONCILE')), receipt_hash TEXT, updated_at TEXT NOT NULL)");
}
export function recordConsumed(db:Database,nonce:string,proposalId:string,workerId:string,at:string):boolean{
 if(!nonce||!proposalId||!workerId||!Number.isFinite(Date.parse(at)))return false;
 return db.prepare("INSERT OR IGNORE INTO genesis_action_ledger (nonce,proposal_id,worker_id,state,updated_at) VALUES (?,?,?,'CONSUMED',?)").run(nonce,proposalId,workerId,at).changes===1;
}
export function transitionAction(db:Database,nonce:string,from:ActionState,to:ActionState,at:string,receiptHash?:string):boolean{
 const allowed:Record<ActionState,ActionState[]>={CONSUMED:['DISPATCHED','RECONCILE'],DISPATCHED:['COMPLETED','FAILED','RECONCILE'],COMPLETED:[],FAILED:['RECONCILE'],RECONCILE:[]};
 if(!allowed[from].includes(to)||!Number.isFinite(Date.parse(at)))return false;
 if(to==='COMPLETED'&&(!receiptHash||!/^[a-f0-9]{64}$/.test(receiptHash)))return false;
 return db.prepare('UPDATE genesis_action_ledger SET state=?, receipt_hash=?, updated_at=? WHERE nonce=? AND state=?').run(to,receiptHash??null,at,nonce,from).changes===1;
}
export function reconcileInterrupted(db:Database,at:string):number{
 if(!Number.isFinite(Date.parse(at)))throw Error('invalid recovery timestamp');
 // Never re-dispatch automatically. Mark interrupted work for independent investigation.
 return db.prepare("UPDATE genesis_action_ledger SET state='RECONCILE',updated_at=? WHERE state IN ('CONSUMED','DISPATCHED')").run(at).changes;
}
