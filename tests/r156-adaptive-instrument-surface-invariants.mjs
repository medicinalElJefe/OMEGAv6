import fs from 'node:fs';
import assert from 'node:assert/strict';

const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
const adaptive=fs.readFileSync('src/adaptiveNavigationR156.ts','utf8');
const live=fs.readFileSync('src/liveNavigationR156.ts','utf8');
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
 'rankMissionStacksForIntent',
 'adaptiveNextRoutes',
 'NavigationLiveContext',
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
 "LIVE_NAVIGATION_SCHEMA='OMEGA_LIVE_NAVIGATION_CONTEXT_R156'",
 "api.get<any>('/api/hybrid/status')",
 "api.get<any>('/api/missions')",
 "api.get<any>('/api/federation/run/status')",
 'nativeExecutionClaimed===true',
 'deriveLiveNavigationR156',
 'window.setInterval(()=>void load(),5000)',
 'proofState'
])assert(live.includes(token),`R156 live navigation context missing ${token}`);

for(const token of [
 "from './adaptiveNavigationR156'",
 "from './liveNavigationR156'",
 "import './navigationExperienceR156.css'",
 "omega.r156.recentRoutes",
 "omega.r156.pinnedRoutes",
 "className='r156-operation-ribbon'",
 "className='r156-adaptive-panel'",
 'LIVE OPERATION FABRIC',
 'NEXT BEST ACTIONS',
 'live-context ranked · operator chooses',
 'TASK WORKSPACES',
 'Pinned & recent',
 "rankRoutesForIntent(needle,ALL_OPERATIONAL)",
 'rankMissionStacksForIntent(q)',
 "'r27-route '+(name===panel?'active':'')",
 'Tell OMEGA the goal: repair build, prove it, Earth forecast, connected PC…',
 "Browse all instruments",
 "44 reachable instruments",
 "direct('Earth Now')",
 "live.pcOnline?'PC ✓':'PC'"
])assert(shell.includes(token),`R156 shell missing ${token}`);

assert.match(shell,/adaptiveNextRoutes\(panel,busy,live\)/,'R156 next actions must use live execution context');
assert.match(shell,/memory\.togglePin\(panel\)/,'R156 current instrument must support bounded pinning');
assert.match(shell,/\[panel,\.\.\.prev\.filter\(x=>x!==panel\)\]\.slice\(0,6\)/,'R156 recents must remain bounded');
assert.match(shell,/\[name,\.\.\.prev\]\.slice\(0,8\)/,'R156 pins must remain bounded');
assert.match(shell,/useLiveNavigationR156\(\)/,'R156 shell must bind live execution truth into the navigation surface');

for(const token of [
 '.r156-navigation .r38-route-flyout',
 'width:min(488px,calc(100vw - 104px))',
 '.r156-operation-ribbon',
 '.r156-fabric-states',
 '.r156-adaptive-panel',
 '.r156-next-actions',
 '.r156-mission-path',
 '.r156-memory-tray',
 '.r156-command-palette',
 '.r156-stack-results',
 '.r156-mobile-drawer',
 'grid-template-columns:1fr!important',
 '@media(max-width:520px)',
 '@media(max-width:380px)',
 '@media(prefers-reduced-motion:reduce)'
])assert(css.includes(token),`R156 CSS missing ${token}`);

assert(!css.includes('width:100vw!important'),'R156 desktop navigation must remain non-obstructive');
assert(!adaptive.includes('autoExecute'),'R156 adaptive routing must not silently auto-execute suggestions');
assert(!live.includes('canonicalMutation:true'),'R156 live navigation may observe execution truth but cannot mutate CanonState');
console.log('PASS R156 adaptive operating surface · live execution fabric + semantic task workspaces + context-ranked actions + bounded navigation memory + all 44 routes preserved');
