import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const launcher=read('src/OmegaLauncher.tsx');
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const home=read('src/OmegaHome.tsx');
const shell=read('src/ResponsiveRuntimeShell.tsx');
const command=read('src/OmegaCommandDeck.tsx');
const hybrid=read('src/HybridMissionControl.tsx');

assert.doesNotMatch(launcher,/<button className='omega-nexus-card'/,'launcher cards may not be buttons containing nested favorite buttons');
assert.match(launcher,/className='omega-nexus-card'[^>]*role='button'[^>]*tabIndex=\{0\}/,'launcher cards must be keyboard-focusable controls');
assert.match(launcher,/onClick=\{\(\)=>go\(x\.name\)\}/,'launcher cards must navigate');
assert.match(launcher,/onKeyDown=\{e=>activate\(x\.name,e\)\}/,'launcher cards must support Enter/Space activation');
assert.match(launcher,/omega-nexus-fav/,'favorite control must remain independently actionable');
const launcherNames=[...launcher.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
const routeBlock=(workstation.match(/export const OMEGA_SURFACES=\[(.*?)\] as const;/s)||[])[1]||'';
const routeNames=[...routeBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
assert.equal(launcherNames.length,44,'launcher must expose exactly 44 routes');
assert.equal(routeNames.length,44,'active workstation must expose exactly 44 routes');
assert.deepEqual(new Set(launcherNames),new Set(routeNames),'launcher and active workstation routes must match exactly');

assert.match(workstation,/onClick=\{\(\)=>chooseMode\(x\)\}/,'mode result buttons must execute an inspection action');
assert.match(workstation,/visibleModes/,'mode view policy must change the visible mode result set');
assert.match(workstation,/selectedMode/,'selected mode state must be retained');
assert.match(workstation,/ALL MODES REMAIN EXECUTED/,'mode filtering must not falsely disable computation');
assert.match(workstation,/case 'Hybrid Link':return withPhase\(<HybridMissionControl/,'Hybrid route must execute its specialist application');
assert.match(workstation,/case 'Matter Traversal':return withPhase\(<MatterTraversal/,'Matter route must execute its specialist application');
assert.match(workstation,/case 'Relativity':return withPhase\(<RelativityLab/,'Relativity route must execute its specialist application');
assert.match(workstation,/case 'Earth Now':return withPhase\(<EarthNowInstrument/,'Earth route must execute its specialist application');

assert.match(home,/onClick=\{\(\)=>enter\(panel\)\}/,'home journey cards must navigate');
assert.match(home,/onClick=\{\(\)=>void ask\(\)\}/,'home assistant ask button must execute');
assert.ok(home.indexOf("'/api/route-preview'")<home.indexOf("'/api/chat'"),'home assistant must preserve route-before-generation');
assert.match(shell,/onClick=\{\(\)=>onNavigate\(name\)\}/,'runtime menu controls must navigate');
assert.match(command,/onRun=\{onRun\}/,'command orchestrator must receive the executable assistant run callback');
assert.match(command,/onClick=\{\(\)=>onNavigate\('Matter Traversal'\)\}/,'command deck Matter button must navigate');
assert.match(command,/onClick=\{\(\)=>onNavigate\('Hybrid Link'\)\}/,'command deck Hybrid button must navigate');
assert.match(hybrid,/onClick=\{submit\}/,'Hybrid compile control must execute mission compilation');

console.log('interaction contract invariants PASS · 44 routes + actionable launcher/modes/home/command/hybrid controls');
