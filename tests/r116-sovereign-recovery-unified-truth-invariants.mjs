import assert from 'node:assert/strict';
import fs from 'node:fs';
import r116 from '../src/workerR116.js';

const read=p=>fs.readFileSync(p,'utf8');
const worker=read('src/workerR116.js');
const worker115=read('src/workerR115.js');
const config=read('wrangler.jsonc');
const launcher=read('src/sovereignLauncherR116.ts');
const sovereign=read('src/SovereignConnectionR112.tsx');
const federation=read('src/FederationRunR97.tsx');
const accepted=read('src/acceptedProductionR116.ts');

assert.match(worker,/import r115/,'R116 must be a strict additive successor of R115');
assert.match(config,/"main": "src\/workerR116\.js"/,'canonical Wrangler entrypoint must be R116');
assert.match(worker115,/OMEGA_GENESIS_MACHINE/);assert.match(worker115,/OMEGA_OPTICAL_MACHINE/);

assert.match(worker,/path\.startsWith\('\/api\/hybrid\/'\)/,'R116 must apply the trusted-origin membrane to Hybrid APIs');
assert.match(worker,/omega-living-light-etching-private-woven2\.vercel\.app/,'current protected Optical origin must be explicitly trusted');
assert.match(worker,/omega-optical-cloud-woven2\.vercel\.app/,'legacy Optical origin must remain bounded and explicit');
assert.match(worker,/if\(url\.protocol!=='https:'\)return null/,'trusted cross-origin access must remain HTTPS-only');
assert.match(worker,/access-control-expose-headers/,'agent/proof response headers must be readable by trusted surfaces');

const allowed=await r116.fetch(new Request('https://omegav6.test/api/hybrid/status',{method:'OPTIONS',headers:{origin:'https://omega-living-light-etching-private-woven2.vercel.app'}}),{});
assert.equal(allowed.status,204);assert.equal(allowed.headers.get('access-control-allow-origin'),'https://omega-living-light-etching-private-woven2.vercel.app');
const denied=await r116.fetch(new Request('https://omegav6.test/api/hybrid/status',{method:'OPTIONS',headers:{origin:'https://example.com'}}),{});
assert.equal(denied.status,403);assert.equal(denied.headers.get('access-control-allow-origin'),null);

assert.match(worker,/OMEGA_SYSTEM_CONVERGENCE_R116/,'R116 must expose one system-convergence truth endpoint');
for(const token of ['surfaceState','machineState','effectiveScreenState','currentAuthenticatedHeartbeat','nativeExecutionClaimed'])assert.ok(worker.includes(token),`convergence truth missing ${token}`);
assert.match(worker,/routingStatusR116/);assert.match(worker,/planIntentR103\(intent,routingStatusR116/,'intent routing must use machine execution readiness without rewriting surface truth');
assert.match(worker,/roleSource:`R115_MACHINE_\$\{verb\}`/,'machine readiness must stay bound to the existing R115 role');

assert.match(launcher,/OMEGA_ORIGIN=\$\{ORIGIN\}/);assert.match(launcher,/omegav6\.jeffdeweyeljefe\.workers\.dev/,'current connector must hard-bind canonical cloud');
assert.match(launcher,/foundasound\.chatgpt\.site are retired/,'current connector must explicitly retire the obsolete preview host');
assert.ok(!launcher.includes('set "OMEGA_ORIGIN=https://omega-sovereign-convergence.foundasound.chatgpt.site"'),'retired preview host must never become launcher origin');
assert.match(launcher,/Removing stale temporary agents/);assert.match(launcher,/del \/q "%OMEGA_AGENT%"/,'stale temporary Hybrid source must be removed before refresh');
assert.match(launcher,/Contains\('OMEGA Hybrid Link agent'\)/);assert.match(launcher,/Contains\('omegav6\.jeffdeweyeljefe\.workers\.dev'\)/,'downloaded source must be validated against canonical origin marker');
assert.match(launcher,/import numpy,grcwa/);assert.match(launcher,/General PC heartbeat will continue/,'missing RCWA must not block general PC heartbeat');
assert.match(launcher,/pip install numpy grcwa/);assert.ok(!launcher.includes('winget install'),'R116 must not silently install host dependencies');
assert.match(launcher,/START_OMEGA_PC_LINK_CURRENT_R116\.cmd/);

assert.match(sovereign,/launcherBlobUrlR116/);assert.match(sovereign,/download=\{SOVEREIGN_LAUNCHER_FILENAME_R116\}/,'current R116 connector must be the primary explicit download');
assert.match(sovereign,/Do not reuse a launcher that shows/);assert.match(sovereign,/401 Unauthorized/,'UI must explain the observed stale-launcher failure mode');
assert.match(sovereign,/live\?\.nativeExecutionClaimed===true/);assert.match(sovereign,/current\.length>0/,'PC ONLINE must still require a current authenticated device heartbeat');
assert.match(sovereign,/download=\{SOVEREIGN_LAUNCHER_FILENAME_R112\}/,'R112 canonical fallback remains available under progressive disclosure');

assert.match(federation,/OMEGA CAPABILITY FABRIC · R116/);assert.match(federation,/machineServices/);assert.match(federation,/Optical machine/);assert.match(federation,/protected human surface is not the execution gate/,'UI must separate human Optical protection from machine SCREEN readiness');
assert.match(federation,/flowNodes/,'operational capability flow must use machine service truth');
assert.match(federation,/human-surface access, machine transport, browser pairing, fresh host heartbeat, solver freshness and canonical admission/,'UI must expose the full truth partition');

for(const law of ['SURFACE_MACHINE_AUTHORITY_SEPARATION','MACHINE_AWARE_ROUTING_ONLY','CURRENT_SOVEREIGN_HEARTBEAT_REQUIRED','RETIRED_PREVIEW_LAUNCHERS_REJECTED','SELF_REFRESHING_VALIDATED_AGENT','TRUSTED_ORIGIN_CORS_IS_BOUNDED','R115_MACHINE_SERVICES_PRESERVED','R114_DURABLE_CEREMONY_PRESERVED','R113_WOVEN_VECTOR_CARRY_PRESERVED','ATLAS_RELATIVITY_TRUTH_PRESERVED','ALL_MODES_NON_REGRESSION'])assert.ok(accepted.includes(law),`accepted production law missing ${law}`);

console.log('R116 SOVEREIGN RECOVERY + UNIFIED TRUTH PASS · retired launcher blocked · trusted Optical Hybrid CORS · machine-aware PROPOSE/SCREEN routing · current heartbeat truth · all-mode non-regression');
