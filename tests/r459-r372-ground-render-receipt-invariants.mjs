import assert from 'node:assert/strict';
import fs from 'node:fs';

const ground=fs.readFileSync('src/EarthGroundTraversalR9.tsx','utf8');
const r372=fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));

for(const token of [
  'requestGeneration=useRef(0)',
  'request!==requestGeneration.current',
  'setRefreshGeneration(v=>v+1)',
  "data-ground-evidence-hash={data?.evidenceHash||''}",
  'data-ground-refresh-generation={refreshGeneration}',
  "data-ground-target={`${lat.toFixed(6)},${lon.toFixed(6)}`}"
]) assert.ok(ground.includes(token),`R459 ground render receipt/stale-response guard missing ${token}`);

for(const token of [
  "beforeGroundGeneration",
  "Ground mounts with an automatic source request",
  "Number(el?.getAttribute('data-ground-refresh-generation')||0)>0",
  "/^[0-9a-f]{64}$/i.test(el?.getAttribute('data-ground-evidence-hash')||'')",
  "data-ground-evidence-hash",
  "data-ground-refresh-generation",
  "data-ground-target",
  "rendered ground hash differs from correlated refresh receipt"
]) assert.ok(r372.includes(token),`R459 R372 correlated render proof missing ${token}`);

assert.ok(!r372.includes("document.querySelector('.earth-ground-r9 footer code')?.textContent===hash"),'R459 must not use uncorrelated footer-text polling as the ground acceptance boundary');
assert.equal(pkg.scripts['test:r459'],'node tests/r459-r372-ground-render-receipt-invariants.mjs');
assert.ok(pkg.scripts.check.includes('npm run test:r459'),'R459 invariant must be part of canonical npm run check');

console.log('R459 R372 GROUND RENDER RECEIPT PASS · latest-request-only state + explicit target/hash/generation receipt + correlated exact-production proof');
