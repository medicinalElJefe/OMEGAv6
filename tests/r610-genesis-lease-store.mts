import assert from 'node:assert/strict';
import {consumeLeaseOnce,initializeLeaseStore,type SqliteLike} from '../genesis/leaseStoreR610';
const nonces=new Set<string>();
const db:SqliteLike={exec(sql){assert.match(sql,/PRIMARY KEY/)},prepare(sql){assert.match(sql,/INSERT OR IGNORE/);return {run(nonce){const key=String(nonce);if(nonces.has(key))return {changes:0};nonces.add(key);return {changes:1}},get(){return null}}}};
initializeLeaseStore(db);
const lease={proposalId:'p1',proposalHash:'hash',principal:'trusted-issuer',scope:'proposal:write',workerId:'worker-1',issuedAt:'2026-10-17T11:00:00Z',expiresAt:'2026-10-17T13:00:00Z',nonce:'lease-1',maxUses:1};
const now='2026-10-17T12:00:00Z';
assert.equal(consumeLeaseOnce(db,lease,'worker-1',now,false).consumed,false);
assert.equal(consumeLeaseOnce(db,lease,'worker-2',now,true).consumed,false);
assert.equal(consumeLeaseOnce(db,lease,'worker-1','2026-10-17T14:00:00Z',true).consumed,false);
assert.equal(consumeLeaseOnce(db,lease,'worker-1',now,true).consumed,true);
assert.equal(consumeLeaseOnce(db,lease,'worker-1',now,true).consumed,false);
// Simulated restart: new caller, same persistent-store representation.
const reopened:SqliteLike={...db};
assert.equal(consumeLeaseOnce(reopened,lease,'worker-1',now,true).consumed,false);
console.log('Genesis R610 single-use lease adapter contract: PASS (mock; not real SQLite concurrency proof)');
