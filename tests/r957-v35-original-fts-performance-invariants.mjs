import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const src=readFileSync('tools/omega_v35_atlas_r954.py','utf8');
const tests=readFileSync('tests/test_omega_local_hub_r881.py','utf8');
const benchmark=JSON.parse(readFileSync('audit/omega-v35-fts-performance-r957.json','utf8'));
const ledger=JSON.parse(readFileSync('audit/omega-active-full-build-ledger-r937.json','utf8'));
assert.ok(src.includes('FROM rows_fts JOIN rows r ON r.row_id=rows_fts.rowid'),'indexed candidate-first search missing');
assert.ok(src.includes('clauses=["rows_fts MATCH ?", "rows_fts.rowid > ?"]'),'FTS rowid range must be index-pushable');
assert.ok(src.includes('ordering="rows_fts.rowid"'),'temporary B-tree source-order sort not eliminated');
assert.ok(src.includes('ordering="r.row_id"'),'non-FTS source-row query must remain indexed');
assert.ok(src.includes('clauses.append("r.gate = ?")'),'original gate filter lost');
assert.ok(src.includes('clauses.append("r.domain = ?")'),'original domain filter lost');
assert.ok(tests.includes('test_r954_original_v35_indexed_query_and_refusal'));
assert.ok(tests.includes('self.assertFalse(any("TEMP B-TREE" in step for step in plan)'),'query planner regression lacks acceptance test');
assert.equal(benchmark.schema,'OMEGA_V35_FTS5_ROWID_PERFORMANCE_WITNESS_R957');
assert.equal(benchmark.originalRows,149679);
assert.equal(benchmark.samples,100);
assert.equal(benchmark.cases.length,2);
for(const c of benchmark.cases){
 assert.equal(c.resultIdsMatched,true);
 assert.ok(c.optimizedMedianMs<c.baselineMedianMs);
}
assert.equal(benchmark.sourceImmutable,true);
assert.equal(benchmark.canonicalWrites,0);
assert.equal(benchmark.productionCertified,false);
assert.ok(ledger.buildHistory.some(x=>x.revision==='R957'));
assert.ok(ledger.blockers.some(x=>x.id==='UI_PARITY'&&x.state==='OPEN'));
console.log('R957 source-indexed FTS5 query plan and original-gate/domain parity verified; performance witness bounded to local database.');
