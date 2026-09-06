import assert from 'node:assert/strict';
import fs from 'node:fs';
import r116 from '../src/workerR116.js';

const liveBinding=(service,authority)=>({fetch:async()=>new Response(JSON.stringify({ok:true,service,version:'R115',authority}),{status:200,headers:{'content-type':'application/json'}})});
const env={OMEGA_GENESIS_MACHINE:liveBinding('omega-genesis-machine-r115','PROPOSE_ONLY'),OMEGA_OPTICAL_MACHINE:liveBinding('omega-optical-machine-r115','SCREEN_ONLY')};

const current=await r116.fetch(new Request('https://omega.test/api/hybrid/current-link'),env),link=await current.json();
assert.equal(current.status,200);assert.equal(link.schema,'OMEGA_CURRENT_HOST_LINK_R116');assert.equal(link.canonicalOrigin,'https://omegav6.jeffdeweyeljefe.workers.dev');assert.equal(link.freshLauncherRequired,true);assert.ok(link.obsoleteOrigins.includes('https://omega-sovereign-convergence.foundasound.chatgpt.site'));assert.match(link.truthBoundary,/current authenticated heartbeat/i);

const status=await r116.fetch(new Request('https://omega.test/api/federation/machine/status'),env),machine=await status.json();
assert.equal(status.status,200);assert.equal(machine.ok,true);assert.equal(machine.runtimeRevision,'R116');assert.equal(machine.nodes.genesis.state,'LIVE');assert.equal(machine.nodes.optical.state,'LIVE');assert.equal(machine.nodes.genesis.authority,'PROPOSE_ONLY');assert.equal(machine.nodes.optical.authority,'SCREEN_ONLY');assert.match(machine.truthBoundary,/protected human-surface reachability/i);

const worker=fs.readFileSync('src/workerR116.js','utf8');
const ui=fs.readFileSync('src/FederationRunR97.tsx','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const contract=fs.readFileSync('src/acceptedProductionR116.ts','utf8');
assert.match(worker,/import r115/);assert.match(worker,/OMEGA_GENESIS_MACHINE/);assert.match(worker,/OMEGA_OPTICAL_MACHINE/);assert.match(worker,/humanSurfaceState/);assert.match(worker,/current-link/);assert.match(worker,/obsoleteOrigins/);
assert.match(ui,/R116/);assert.match(ui,/R114 CLOSURE PRESERVED/);assert.match(ui,/machine\/status/);assert.match(ui,/protected human surface/i);assert.match(ui,/freshly generated canonical OMEGAv6 launcher/i);
assert.match(wrangler,/"main": "src\/workerR116\.js"/);assert.match(wrangler,/omega-genesis-machine-r115/);assert.match(wrangler,/omega-optical-machine-r115/);
assert.match(contract,/CANONICAL_HOST_ONLY/);assert.match(contract,/CURRENT_HEARTBEAT_REQUIRED/);assert.match(contract,/OMEGAV6_ONLY_ADMITS/);assert.match(contract,/NO_NEW_PHYSICAL_PRIMITIVE/);
const active=[worker,ui,fs.readFileSync('src/HybridMissionControlR8.tsx','utf8')].join('\n');
assert.ok(!active.includes("set \"OMEGA_ORIGIN=https://omega-sovereign-convergence.foundasound.chatgpt.site\""));
console.log('R116 current-host recovery PASS · canonical launcher authority + machine/surface truth separation + R114/R115 preservation');
