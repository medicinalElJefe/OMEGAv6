import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const verifier=readFileSync(new URL('../scripts/verify_staged_release.mjs',import.meta.url),'utf8');
const r202=readFileSync(new URL('../scripts/verify_live_operational_source_authority_r202.mjs',import.meta.url),'utf8');

const installPkg=staged.indexOf('npm install --no-save playwright@1.63.0');
const installBrowser=staged.indexOf('npx playwright install --with-deps chromium');
const r200=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');
const r496=staged.indexOf('node tests/r496-local-omega7-candidate-browser-e2e.mjs');
const upload=staged.indexOf('npx wrangler versions upload');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');

assert.ok(installPkg>=0,'Playwright package install missing from release membrane');
assert.ok(installBrowser>installPkg,'Chromium install must follow Playwright package install');
assert.ok(r200>installBrowser,'R200 exact packaged browser proof must begin only after Chromium exists');
assert.ok(r496>r200,'R496 OMEGA7 packaged browser proof must reuse the same browser runtime after R200');
assert.ok(upload>r496,'candidate upload must wait for both exact packaged browser proofs');
assert.ok(semantic>upload,'0%-traffic Worker semantic verifier must run only after upload/admission, while canonical asset browser proof remains deferred until promotion');
assert.ok(verifier.includes('scripts/verify_live_operational_source_authority_r202.mjs'),'semantic verifier must retain R202 live authority proof');
assert.ok(r202.includes('tests/r284-live-earth-browser-e2e.mjs'),'R202 must retain nested R284 browser proof');
assert.equal((staged.match(/npm install --no-save playwright@1\.63\.0/g)||[]).length,1,'Playwright package install must not be duplicated');
assert.equal((staged.match(/npx playwright install --with-deps chromium/g)||[]).length,1,'Chromium install must not be duplicated');

console.log('R323/R496 PLAYWRIGHT PROOF ORDER PASS · browser runtime exists before exact local R200 + OMEGA7 packaged proof · upload waits for browser proof · staged Worker semantics follow upload · promoted live browser proof remains separate');
