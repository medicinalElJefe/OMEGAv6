import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const staged=readFileSync(new URL('../scripts/staged-cloudflare-release.sh',import.meta.url),'utf8');

const installPkg=staged.indexOf('npm install --no-save playwright@1.63.0');
const installBrowser=staged.indexOf('npx playwright install --with-deps chromium');
const semantic=staged.indexOf('node scripts/verify_staged_release.mjs');
const browser=staged.indexOf('node tests/r200-current-browser-proof-e2e.mjs');

assert.ok(installPkg>=0,'pinned Playwright package install missing');
assert.ok(installBrowser>installPkg,'Chromium install must follow pinned Playwright package install');
assert.ok(semantic>installBrowser,'nested R202→R237 semantic verification must run only after Chromium exists');
assert.ok(browser>semantic,'R200 desktop/mobile browser proof must remain after semantic proof');
assert.equal((staged.match(/npx playwright install --with-deps chromium/g)||[]).length,1,'release membrane should install Chromium once');
assert.match(staged,/R323 proof-runtime order/);

console.log('R323 PROOF RUNTIME ORDER PASS · pinned Playwright + Chromium precede nested R202→R237 semantic proof and are reused by R200 desktop/mobile proof');
