import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const lineage=fs.readFileSync('scripts/r619-release-lineage.mjs','utf8');
assert.ok(ci.includes('fetch-depth: 0'),'deploy checkout must retain full ancestry');
assert.ok(ci.includes('git fetch origin main\n'),'current-main ownership refresh must not shallow the repository');
assert.ok(!ci.includes('git fetch origin main --depth=1'),'production ownership refresh must never re-shallow merge ancestry');
assert.ok(ci.includes('node scripts/r619-release-lineage.mjs'),'production must execute exact release lineage binder');
assert.ok(lineage.includes("command('git', ['rev-parse', '--is-shallow-repository']) !== 'false'"),'lineage binding must fail closed if ancestry becomes shallow');
assert.ok(lineage.includes("command('git', ['show', '-s', '--format=%P', sha])"),'lineage binding must extract actual Git commit parent objects');
assert.ok(lineage.includes("lineageMode: 'EXACT_TWO_PARENT_MERGE'")&&lineage.includes("lineageMode: 'EXACT_SQUASH_PR_AND_TREE'"),'two-parent and exact merged PR/tree squash topology must be independently typed');
console.log('R371 RELEASE LINEAGE PASS · full ancestry preserved · shallow rewrite blocked · exact merge or source-tree-bound squash ancestry');
