import fs from 'node:fs';
import assert from 'node:assert/strict';

const authority=fs.readFileSync('src/allModesAuthority.ts','utf8');
const dock=fs.readFileSync('src/OmegaModeAuthorityDock.tsx','utf8');
const css=fs.readFileSync('src/omegaModeAuthorityR12.css','utf8');
const app=fs.readFileSync('src/App.tsx','utf8');
const corpus=fs.readFileSync('src/corpusRuntime.ts','utf8');

const donorArray=authority.slice(authority.indexOf('const NAMES=['),authority.indexOf('] as const;'));
const names=[...(donorArray.matchAll(/'([^']+)'/g))].map(x=>x[1]);
assert.equal(names.length,62,'R12 must retain all 62 repaired canon/calculus authority names');
for(const required of ['OVERALL CANON MODE','Unified Coherence Mode','Mode 188','Deep Mother Mode','High Father Mode','Prune / Heavy Prune Mode','Guidance Field Mode','FULL SPHERE Mode','Dewey Calculus Mode','No-Nothing Truth Mode','Alpha Mode','Seven-Star Governance Layer','Future Plasticity Law','Ledger / Scar Persistence Law','Horizon Limits vs Execution Limits','Basin / Drain / Loop / Fracture Action Families'])assert(names.includes(required),`missing canon authority: ${required}`);
assert(authority.includes('sourceModeEvaluations:179'),'R12 must preserve the 179 source-mode registry as a separate count');
assert(authority.includes('canonAuthorities:62'),'R12 must preserve the 62 authority stack as a separate count');
assert(authority.includes('not additional corpus rows')||authority.includes('NOT additional corpus rows'),'R12 must prohibit false executor double-counting');
assert(corpus.includes('m.count===179'),'canonical corpus validation must still require exactly 179 source modes');
assert(dock.includes('179 SOURCE')&&dock.includes('62 CANON'),'ALL MODES dock must make both registries visible');
assert(dock.includes("onNavigate('Modes')")&&dock.includes("onNavigate('System Atlas')"),'dock must route into real source-mode and system-atlas surfaces');
assert(app.includes('<OmegaModeAuthorityDock onNavigate={navigate}/>'),'ALL MODES authority dock must be mounted in the workstation');
assert(css.includes('.rr-packet>div:nth-child(4)')&&css.includes('.mrc-dl>span:nth-of-type(4)'),'R12 must suppress legacy doubled-count cells');
assert(!authority.includes('@appdeploy/client')&&!dock.includes('@appdeploy/client'),'R12 must remain sovereign-provider portable');
console.log('PASS all-modes-authority-r12-invariants');
