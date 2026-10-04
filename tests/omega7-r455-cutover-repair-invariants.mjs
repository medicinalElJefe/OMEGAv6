import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const lockfile=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const app=fs.readFileSync('src/App.tsx','utf8');
const r118=fs.readFileSync('tests/r118-browser-operational-e2e.mjs','utf8');
const r318=fs.readFileSync('tests/r318-viewport-ownership-browser-e2e.mjs','utf8');
const omega7Lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

assert.equal(pkg.overrides?.undici,'7.29.1','R455 keeps the accepted Undici security floor');
assert.equal(lockfile.packages?.['node_modules/undici']?.version,'7.29.1','npm ci lock must match package override');
assert.equal(lockfile.packages?.['node_modules/undici']?.resolved,'https://registry.npmjs.org/undici/-/undici-7.29.1.tgz');
assert.equal(lockfile.packages?.['node_modules/undici']?.integrity,'sha512-RYONW2MeafgYlkVOKYKkA/Ag7BmXqgIWCa8t1m0JcxrQg9pI9lEqRhAOruOBCbAohOa/gkCF+iPi9hrgvTzu6Q==');

assert.ok(app.includes("params.get('omega6')==='1'")&&app.includes("params.get('omega7')==='1'"),'explicit shell query overrides must remain');
assert.ok(app.includes("window.localStorage.getItem('omega.product.shell')!=='OMEGA6'"),'clean/default session must prefer OMEGA7 unless explicit rollback preference exists');
assert.ok(app.includes("safeStore('omega.product.shell','OMEGA6')"),'OMEGA6 rollback must persist');
assert.ok(app.includes("safeStore('omega.product.shell','OMEGA7')"),'OMEGA7 re-entry must persist');

assert.ok(r118.includes("page.goto(\`\${base}/?omega6=1\`"),'R118 is a legacy OMEGA6 browser contract and must explicitly select OMEGA6 after default cutover');
assert.ok(r318.includes("?omega6=1&r318-viewport="),'R318 legacy viewport proof must explicitly select OMEGA6 after default cutover');

assert.equal(omega7Lock.defaultProduct,'OMEGA7_CANDIDATE');
assert.equal(omega7Lock.defaultCutoverPhase,'R455_REPAIRED_DEFAULT_CUTOVER_CANDIDATE');
assert.equal(omega7Lock.defaultCutoverBaseSha,'3ccd795014ee620926c7a9f75894c7dd8d9e0d2c');
assert.equal(omega7Lock.defaultCutoverRules.legacyDeletion,false);
assert.equal(omega7Lock.defaultCutoverRules.canonicalMutation,false);
assert.equal(omega7Lock.acceptedParityCounts.fullProductParity,44);
assert.equal(omega7Lock.acceptedParityCounts.legacyRetired,0);

console.log('OMEGA7 R455 STATIC PASS · current-main default cutover · npm-ci lock parity · explicit legacy-proof shell selection · 44/44 accepted parity preserved · zero retirement');
