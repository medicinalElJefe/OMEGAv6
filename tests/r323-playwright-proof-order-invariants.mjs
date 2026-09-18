import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');
const verifier=readFileSync(new URL('../scripts/verify_staged_release.mjs',import.meta.url),'utf8');
const r202=readFileSync(new URL('../scripts/verify_live_operational_source_authority_r202.mjs',import.meta.url),'utf8');

const installPkg=staged.indexOf('npm install --no-save playwright@1.63.0');
const installBrowser=staged.indexOf('npx playwright install --with-deps chromium');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
const r200=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');

assert.ok(installPkg>=0,'Playwright package install missing from release membrane');
assert.ok(installBrowser>installPkg,'Chromium install must follow Playwright package install');
assert.ok(semantic>installBrowser,'semantic verifier must begin only after browser executable exists');
assert.ok(r200>semantic,'R200 exact browser proof must remain downstream of semantic verifier');
assert.ok(verifier.includes('scripts/verify_live_operational_source_authority_r202.mjs'),'semantic verifier must retain R202 live authority proof');
assert.ok(r202.includes('tests/r284-live-earth-browser-e2e.mjs'),'R202 must retain nested R284 browser proof');
assert.equal((staged.match(/npm install --no-save playwright@1\.63\.0/g)||[]).length,1,'Playwright package install must not be duplicated');
assert.equal((staged.match(/npx playwright install --with-deps chromium/g)||[]).length,1,'Chromium install must not be duplicated');

console.log('R323 PLAYWRIGHT PROOF ORDER PASS · browser runtime exists before R202/R284 semantic proof and is reused by downstream R200 proof');
