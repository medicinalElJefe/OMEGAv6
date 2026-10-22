import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';
import {OMEGA7_NATIVE_ROUTES} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const root=fs.readFileSync('src7/Omega7Root.tsx','utf8');
const browser=fs.readFileSync('tests/omega7-r446-browser-parity-e2e.mjs','utf8');
const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

assert.equal(OMEGA_NAVIGATION.length,44);
assert.equal(OMEGA7_NATIVE_ROUTES.length,44);
assert.deepEqual(new Set(OMEGA7_NATIVE_ROUTES),new Set(OMEGA_NAVIGATION.map(x=>x.name)));
assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'R446 browser proof candidate still cannot retire legacy surfaces by static declaration');

assert.ok(root.includes('data-capability-route={cap.legacyRoute}'),'capability cards need stable route identity for parity automation');
assert.ok(root.includes('data-command-route={cap.legacyRoute}'),'command results need stable route identity for parity automation');
for(const token of ["desktop',{width:1440,height:960}","mobile',{width:390,height:844}","for(const route of routes)await openRoute","horizontal overflow","main is not the page scroll owner","unhandled page errors","o7-native-failure"])assert.ok(browser.includes(token),'R446 browser proof missing '+token);
assert.ok(workflow.includes('playwright@1.63.0'),'R446 must pin the accepted browser harness');
assert.ok(workflow.includes('npm run build')&&workflow.includes('vite preview'),'R446 must test the exact built product, not source-only rendering');
assert.ok(workflow.includes('omega7-r446-browser-parity-e2e.mjs'),'R446 workflow must execute the parity test');
assert.ok(workflow.includes('omega7-user-parity:')&&workflow.includes('timeout-minutes: 25'),'R446 browser proof must remain bounded inside OMEGA Cloud Bridge CI');
assert.ok(workflow.startsWith('name: OMEGA Cloud Bridge CI'),'R446 must reuse the existing governed workflow authority rather than add a 25th workflow');
assert.match(lock.sourceMainSha,/^[a-f0-9]{40}$/,'OMEGA7 successor locks must retain an exact source SHA');
const sourceRevision=Number((String(lock.sourceMilestone).match(/^R(\d+)/)||[])[1]||0);
assert.ok(sourceRevision>=445,'R446 successor cannot regress behind the merged R445 baseline');
const parityRevision=Number((String(lock.parityPhase).match(/^R(\d+)/)||[])[1]||0);
assert.ok(parityRevision>=446,'R446 parity proof must remain present in successor phases');
assert.deepEqual(lock.parityRequired,['FUNCTIONAL','DESKTOP','MOBILE_TOUCH','FAILURE_RECOVERY','PERFORMANCE','ROLLBACK']);

console.log('OMEGA7 R446 STATIC PASS · 44/44 browser parity contract · desktop/mobile · exact built preview · stable route identities · no legacy retirement by declaration');
