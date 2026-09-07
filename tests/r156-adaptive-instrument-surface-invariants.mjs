import fs from 'node:fs';
import assert from 'node:assert/strict';

const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
const adaptive=fs.readFileSync('src/adaptiveNavigationR156.ts','utf8');
const css=fs.readFileSync('src/navigationExperienceR156.css','utf8');
const registry=fs.readFileSync('src/navigationRegistry.ts','utf8');

const routes=[...registry.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(routes.length,44,'R156 must preserve all 44 canonical destinations');
for(const name of routes)assert(shell.includes(`'${name}'`),`R156 active shell must retain ${name}`);

for(const token of [
 "ADAPTIVE_NAVIGATION_SCHEMA='OMEGA_ADAPTIVE_NAVIGATION_R156'",
 "id:'BUILD_SHIP'",
 "id:'MODEL_VALIDATE'",
 "id:'CONNECT_EXECUTE'",
 "id:'EARTH_EVIDENCE'",
 "id:'LEARN_EVOLVE'",
 "id:'RESTORE_CONVERGE'",
 "id:'ATLAS_TRAVERSE'",
 'semanticRouteScore',
 'rankRoutesForIntent',
 'adaptiveNextRoutes',
 'adaptiveNavigationAudit',
 "boundary:'R156 ranks and composes existing routable capabilities. It does not claim execution"
])assert(adaptive.includes(token),`R156 adaptive runtime missing ${token}`);

const missionBlocks=[...adaptive.matchAll(/routes:\[([^\]]+)\]/g)].map(x=>x[1]);
assert.ok(missionBlocks.length>=7,'R156 must define at least seven mission stacks');
for(const block of missionBlocks){
 const missionRoutes=[...block.matchAll(/'([^']+)'/g)].map(x=>x[1]);
 for(const name of missionRoutes)assert(routes.includes(name),`R156 mission references non-canonical route ${name}`);
}

for(const token of [
 "from './adaptiveNavigationR156'",
 "import './navigationExperienceR156.css'",
 "omega.r156.recentRoutes",
 "omega.r156.pinnedRoutes",
 "className='r156-adaptive-panel'",
 'NEXT BEST ACTIONS',
 'context-ranked · operator chooses',
 'Pinned & recent',
 "rankRoutesForIntent(needle,ALL_OPERATIONAL)",
 "className='r27-route '+(name===panel?'active':'')",
 "Search by goal: build, proof, motion, PC…",
 "Browse all instruments",
 "44 reachable instruments",
 "direct('Earth Now')"
])assert(shell.includes(token),`R156 shell missing ${token}`);

assert.match(shell,/adaptiveNextRoutes\(panel,busy\)/,'R156 must rank next actions from current panel and operation state');
assert.match(shell,/memory\.togglePin\(panel\)/,'R156 current instrument must support bounded pinning');
assert.match(shell,/\[panel,\.\.\.prev\.filter\(x=>x!==panel\)\]\.slice\(0,6\)/,'R156 recents must remain bounded');
assert.match(shell,/\[name,\.\.\.prev\]\.slice\(0,8\)/,'R156 pins must remain bounded');

for(const token of [
 '.r156-navigation .r38-route-flyout',
 'width:min(468px,calc(100vw - 104px))',
 '.r156-adaptive-panel',
 '.r156-next-actions',
 '.r156-mission-path',
 '.r156-memory-tray',
 '.r156-command-palette',
 '.r156-mobile-drawer',
 'grid-template-columns:1fr!important',
 '@media(max-width:520px)',
 '@media(prefers-reduced-motion:reduce)'
])assert(css.includes(token),`R156 CSS missing ${token}`);

assert(!css.includes('width:100vw!important'),'R156 desktop navigation must remain non-obstructive');
assert(!adaptive.includes('autoExecute'),'R156 adaptive routing must not silently auto-execute suggestions');
console.log('PASS R156 adaptive instrument surface · semantic intent ranking + mission paths + next actions + bounded navigation memory');
