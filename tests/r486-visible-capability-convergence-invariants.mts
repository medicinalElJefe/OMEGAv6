import assert from 'node:assert/strict';import {R486_VISIBLE_CAPABILITIES,R486_VISIBLE_SUMMARY,visibleCapabilitiesForFamilyR486} from '../src7/visibleCapabilityConvergenceR486';import {YEAR_CORPUS_EXECUTION_R473} from '../src/yearCorpusExecutionR473';
assert.equal(R486_VISIBLE_CAPABILITIES.length,YEAR_CORPUS_EXECUTION_R473.length);
assert.equal(R486_VISIBLE_SUMMARY.routable,R486_VISIBLE_SUMMARY.total);
assert.ok(R486_VISIBLE_SUMMARY.executesNow>0);assert.ok(R486_VISIBLE_SUMMARY.adapters>0);assert.ok(R486_VISIBLE_SUMMARY.truthGated>0);
for(const x of R486_VISIBLE_CAPABILITIES){assert.ok(x.route);assert.ok(x.operation);assert.ok(x.contribution);assert.equal(x.receiptAuthority,'R142');assert.equal(x.admissionAuthority,'R125');assert.equal(x.canonicalMutation,false)}
for(const f of ['UNDERSTAND','EXPLORE','CREATE','BUILD','WORK','RECOVER'] as const)assert.ok(visibleCapabilitiesForFamilyR486(f).length>0,'missing visible family '+f);
console.log('R486 VISIBLE CAPABILITY CONVERGENCE PASS',R486_VISIBLE_SUMMARY);
