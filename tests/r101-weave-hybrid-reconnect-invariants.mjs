import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R101 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const worker=read('src/workerR101.js');
const worker34=read('src/workerR34.js');
const worker111=fs.existsSync('src/workerR111.js')?read('src/workerR111.js'):'';
const adapter=read('src/platformAdapter.ts');
const hybrid=read('src/HybridLinkR32.tsx');
const sovereign=fs.existsSync('src/SovereignConnectionR112.tsx')?read('src/SovereignConnectionR112.tsx'):hybrid;
const launcher=fs.existsSync('src/sovereignLauncherR112.ts')?read('src/sovereignLauncherR112.ts'):hybrid;
const agent=read('public/omega-hybrid-agent.py');
const weave=read('src/weaveStateR100.ts');
const stage=read('src/TraversalModeStageR100.tsx');
const studio=read('src/OmegaTraversalStudio.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const accepted=read('src/acceptedProductionContractR95.ts');
const css=read('src/designModesR99.css');
const wrangler=read('wrangler.jsonc');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'canonical 44-route universe must remain intact');
for(const route of ['Extreme Traversal','Matter Traversal','Forecast','Relativity','Evidence & Proof','Visual Instrument','Hybrid Link'])must(surfaces.includes(route),'critical specialist route missing: '+route);

must(wrangler.includes('"main": "src/workerR101.js"')||wrangler.includes('"main": "src/workerR102.js"')||(wrangler.includes('"main": "src/workerR111.js"')&&worker111.includes("from './workerR102.js'")),'Cloudflare entry must retain R101 directly or through a validated R102/R111 successor wrapper');
must(worker.includes("import r34,{OmegaRuntime as OmegaRuntimeR34} from './workerR34.js'"),'R101 must extend rather than replace R34 federation/runtime behavior');
must(worker.includes('export class OmegaRuntime extends OmegaRuntimeR34'),'Durable Object class lineage must remain compatible');
must(worker.includes("path==='/api/hybrid/status'")&&worker.includes('bridgeId(request)'),'Hybrid status must resolve persisted bridge identity before session fallback');
must(worker.includes("path==='/api/hybrid/reconnect'")&&worker.includes("'/continuity'")&&worker.includes("credentialState:'VALID'"),'reconnect must authenticate the stored bridge credential against durable runtime state');
must(worker.includes("body.repair")&&worker.includes("{rotate:true}")&&worker.includes('agentRestartRequired:true'),'repair must explicitly rotate/reissue and require agent restart');
must(worker.includes("path==='/omega-hybrid-agent.py'")&&worker.includes('R101_DIRECT_AND_API_AGENT_DOWNLOAD'),'legacy direct agent download path must be restored without replacing canonical API download');
must(worker.includes("state:online.length?'VERIFIED_DEVICE_ONLINE'")&&worker.includes('nativeExecutionClaimed:online.length>0'),'PC ONLINE/native execution must still require current heartbeat proof');
must(worker34.includes('return r33.fetch(request,env)'),'R101 must sit above the accepted R34 federation fallback rather than deleting it');

must(adapter.includes('reconnectHybridBridge')&&adapter.includes("'/api/hybrid/reconnect'"),'browser adapter must expose reconnect/repair transport');
must(hybrid.includes("import SovereignConnectionR112 from './SovereignConnectionR112'")&&hybrid.includes('<SovereignConnectionR112/>'),'Hybrid route must use the shared R112 connection successor');
must(sovereign.includes('reconnectHybridBridge(false)')&&sovereign.includes('reconnectHybridBridge(true)'),'R112 connection surface must retain explicit verify-then-repair transport');
must(sovereign.includes('authenticated heartbeat')&&sovereign.includes("live?.nativeExecutionClaimed===true"),'Hybrid UI must distinguish browser credential state from current device heartbeat truth');
must(launcher.includes('/api/hybrid/agent-download?r112=1')&&launcher.includes("OMEGA_ORIGIN=${ORIGIN}"),'R112 launcher must use the canonical validated endpoint and hard-bind canonical origin');
must(agent.includes("VERSION='R34.1'")&&agent.includes("DEFAULT_SERVER='https://omegav6.jeffdeweyeljefe.workers.dev'"),'sovereign agent canonical transport/version must remain intact');
must(agent.includes('/api/hybrid/agent/register')&&agent.includes('/api/hybrid/agent/heartbeat')&&agent.includes('/api/hybrid/agent/poll'),'agent register/heartbeat/poll loop must remain present');

must(weave.includes('ATLAS_RESOLUTION_LEVELS_R101=[12,144,1728,20736,248832]'),'R101 effective-resolution registry missing');
must(weave.includes('resolutionDemand')&&weave.includes('resolutionIndexR101')&&weave.includes('effectiveResolution'),'effective resolution must be derived from bounded weave demand');
must(weave.includes('continuityFlux')&&weave.includes('invariantCarry')&&weave.includes('residualCarry')&&weave.includes('threadTension')&&weave.includes('Math.abs(torsion)'),'resolution demand must depend on declared woven-continuity channels');
must(weave.includes('strata:{field:number;weave:number;projection:number}'),'Field / Weave / Projection strata contract missing');
must(weave.includes('not a claim that physical spacetime has 248,832 dimensions'),'248,832 truth boundary missing');
must(!weave.includes('Math.random'),'weave-derived resolution may not use random/fake state');

for(const mode of ['UNIFIED','SHELL','WATER','LIGHT','SCAR','RELATIVITY','FORECAST','PROOF'])must(stage.includes(`'${mode}'`),'R101 must preserve design mode '+mode);
must(stage.includes('ATLAS_RESOLUTION_LEVELS_R101.forEach')&&stage.includes('i===weave.resolutionIndex'),'atlas rings must visibly identify active weave-derived resolution');
must(stage.includes('EFFECTIVE RESOLUTION')&&stage.includes('weaveStatic.effectiveResolution')&&stage.includes('weaveStatic.resolutionDemand'),'derived resolution must be visible outside the canvas');
must(stage.includes('FIELD / WEAVE / PROJECTION')&&stage.includes('weaveStatic.strata.field')&&stage.includes('weaveStatic.strata.weave')&&stage.includes('weaveStatic.strata.projection'),'three visual-computation strata must be visible from one canonical packet');
must(stage.includes('applyWovenContinuityR100(')&&stage.includes('compileSourceTraversal(address,routeDepth)'),'R101 must preserve deterministic weave and canonical admitted-route lineage');
must(studio.includes("import TraversalModeStageR99 from './TraversalModeStageR100'"),'accepted Traversal Studio binding must remain promoted');
must(!stage.includes('Math.random'),'R101 primary stage may not use random/fake geometry');

must(nav.includes('OMEGA_ALL_ROUTES_R82.filter')&&nav.includes('rows.map(route=>'),'44-route navigation/search must remain directly reachable');
must(css.includes(".mt-stage .mt-hud")&&css.includes(".visual-stage .visual-equation")&&css.includes('display:none!important'),'Matter/Visual overlay suppression must remain intact');
must(accepted.includes("id:'WEAVE_DERIVED_RESOLUTION'")&&accepted.includes("id:'HYBRID_BRIDGE_ID_CONTINUITY'"),'R101 non-regression authorities must be persisted');
must(accepted.includes("'R100 woven continuity geometry/time + professional instrument rail authority'")&&accepted.includes("'R101 weave-derived effective resolution + Hybrid bridge-identity continuity authority'"),'R101 must extend R100 rather than flatten it');
must(![worker,adapter,hybrid,sovereign,launcher,weave,stage].join('\n').includes('@appdeploy/client'),'R101 must remain provider portable');

console.log('R101 WEAVE + HYBRID PASS · 44 routes intact · weave-derived effective atlas resolution · Field/Weave/Projection strata · bridge-ID reconnect/repair · authenticated-heartbeat truth preserved through R112');
await import('./r102-federated-instrument-experience-invariants.mjs');
