import assert from 'node:assert/strict';
import fs from 'node:fs';

const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
assert.ok(ci.includes('fetch-depth: 0'),'deploy checkout must retain full ancestry');
assert.ok(ci.includes('git fetch origin main\n'),'current-main ownership refresh must not shallow the repository');
assert.ok(!ci.includes('git fetch origin main --depth=1'),'production ownership refresh must never re-shallow merge ancestry');
assert.ok(ci.includes('git rev-parse --is-shallow-repository'),'lineage binding must fail closed if ancestry becomes shallow');
assert.ok(ci.includes('git cat-file -p "$GITHUB_SHA"'),'merge parents must be read from the commit object, not a shallow-history view');
assert.ok(ci.includes("awk '/^parent /{print $2}'"),'lineage binding must extract exact parent objects');
console.log('R371 RELEASE LINEAGE PASS · full ancestry preserved · shallow rewrite blocked · exact merge parent objects bound');
