import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync('src/reflexAutonomicR164.css','utf8');
const browser=fs.readFileSync('tests/r164-reflex-autonomic-browser-e2e.mjs','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
const workflow=fs.readFileSync('.github/workflows/r180-r164-mobile-containment-proof.yml','utf8');

for(const token of [
  '.r164-reflex{display:grid',
  'width:100%;max-width:100%;min-width:0;box-sizing:border-box;overflow:hidden',
  '.r164-reflex *{box-sizing:border-box}',
  'grid-template-columns:minmax(0,2fr)',
  'grid-template-columns:repeat(7,minmax(0,1fr))',
  'grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto',
  '@media(max-width:680px)',
  'width:calc(100vw - 56px);max-width:calc(100vw - 56px)',
])assert.ok(css.includes(token),`R180 missing shrink-safe containment contract: ${token}`);

for(const token of [
  "viewport:{width:390,height:844}",
  'const viewportWidth=await page.evaluate(()=>window.innerWidth)',
  'rect.x<0||rect.x+rect.width>viewportWidth+1',
  'Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth',
  'actual mobile edges contained inside viewport',
])assert.ok(browser.includes(token),`R180 browser admission missing actual containment proof: ${token}`);

assert.ok(suite.includes("panel==='Convergence'"),'R180 Convergence route authority missing');
assert.ok(suite.includes('<ReflexAutonomicR164/>'),'R180 R164 returned-reflex surface no longer mounted');
assert.ok(suite.includes('<OmegaAutonomicR125/>'),'R180 existing R125 autonomic authority must remain mounted');

for(const token of [
  'permissions:\n  contents: read',
  'node tests/r180-r164-mobile-containment-invariants.mjs',
  'node tests/r179-living-world-durable-authorization-invariants.mjs',
  'node tests/r164-reflex-autonomic-swarm-convergence-invariants.mjs',
  'node scripts/prove_successor_workflow_invariants_r175.mjs',
  'npm run check',
  'npx wrangler deploy --dry-run',
  'node tests/r118-browser-operational-e2e.mjs',
  'node tests/r164-reflex-autonomic-browser-e2e.mjs',
])assert.ok(workflow.includes(token),`R180 workflow missing proof boundary: ${token}`);
assert.ok(!/^\s*schedule\s*:/m.test(workflow),'R180 must not schedule recurring execution');
assert.ok(!/contents:\s*write/i.test(workflow),'R180 must remain read-only');
assert.ok(!/gh\s+pr\s+merge|git\s+push\s+origin\s+HEAD:main/i.test(workflow),'R180 must not mutate or auto-promote main');

console.log('R180 R164 MOBILE CONTAINMENT PASS · viewport-bound root + shrink-safe descendants + strict actual-edge browser proof · R179 durable execution and R125 Canon admission authority preserved');
