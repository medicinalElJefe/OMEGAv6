import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R101 '+msg)};

const workstation=read('src/OmegaWorkstationFullV2.tsx');
const worker=read('src/workerR101.js');
const worker34=read('src/workerR34.js');
const worker111=fs.existsSync('src/workerR111.js')?read('src/workerR111.js'):'';
const worker114=fs.existsSync('src/workerR114.js')?read('src/workerR114.js'):'';
const worker115=fs.existsSync('src/workerR115.js')?read('src/workerR115.js'):'';
const worker116=fs.existsSync('src/workerR116.js')?read('src/workerR116.js'):'';
const adapter=read('src/platformAdapter.ts');
const hybrid=read('src/HybridLinkR32.tsx');
const sovereign112=fs.existsSync('src/SovereignConnectionR112.tsx')?read('src/SovereignConnectionR112.tsx'):hybrid;
const launcher112=fs.existsSync('src/sovereignLauncherR112.ts')?read('src/sovereignLauncherR112.ts'):hybrid;
const sovereign117=fs.existsSync('src/SovereignConnectionR117.tsx')?read('src/SovereignConnectionR117.tsx'):hybrid;
const launcher117=fs.existsSync('src/sovereignLauncherR117.ts')?read('src/sovereignLauncherR117.ts'):hybrid;
const bootstrap117=fs.existsSync('src/hybridBootstrapR117.ts')?read('src/hybridBootstrapR117.ts'):'';
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

const r101Direct=wrangler.includes('"main": "src/workerR101.js"');
const r102Successor=wrangler.includes('"main": "src/workerR102.js"');
const r111Successor=wrangler.includes('"main": "src/workerR111.js"')&&worker111.includes("from './workerR102.js'");
const r114Successor=wrangler.includes('"main": "src/workerR114.js"')&&worker114.includes("from './workerR111.js'")&&worker111.includes("from './workerR102.js'");
const r115Successor=wrangler.includes('"main": "src/workerR115.js"')&&worker115.includes("from './workerR114.js'")&&worker114.includes("from './workerR111.js'")&&worker111.includes("from './workerR102.js'");
const r116Successor=wrangler.includes('"main": "src/workerR116.js"')&&worker116.includes("from './workerR115.js'")&&worker115.includes("from './workerR114.js'")&&worker114.includes("from './workerR111.js'")&&worker111.includes("from './workerR102.js'");
must(r101Direct||r102Successor||r111Successor||r114Successor||r115Successor||r116Successor,'Cloudflare entry must retain R101 directly or through a validated R102/R111/R114/R115/R116 successor wrapper');
must(worker.includes("import r34,{OmegaRuntime as OmegaRuntimeR34} from './workerR34.js'"),'R101 must extend rather than replace R34 federation/runtime behavior');
must(worker.includes('export class OmegaRuntime extends OmegaRuntimeR34'),'Durable Object class lineage must remain compatible');
must(worker.includes("path==='/api/hybrid/status'")&&worker.includes('bridgeId(request)'),'Hybrid status must resolve persisted bridge identity before session fallback');
must(worker.includes("path==='/api/hybrid/reconnect'")&&worker.includes("'/continuity'")&&worker.includes("credentialState:'VALID'"),'reconnect must authenticate the stored bridge credential against durable runtime state');
must(worker.includes("body.repair")&&worker.includes("{rotate:true}")&&worker.includes('agentRestartRequired:true'),'repair must explicitly rotate/reissue and require agent restart');
must(worker.includes("path==='/omega-hybrid-agent.py'")&&worker.includes('R101_DIRECT_AND_API_AGENT_DOWNLOAD'),'legacy direct agent download path must be restored without replacing canonical API download');
must(worker.includes("state:online.length?'VERIFIED_DEVICE_ONLINE'")&&worker.includes('nativeExecutionClaimed:online.length>0'),'PC ONLINE/native execution must still require current heartbeat proof');
must(worker34.includes('return r33.fetch(request,env)'),'R101 must sit above the accepted R34 federation fallback rather than deleting it');

must(adapter.includes('reconnectHybridBridge')&&adapter.includes("'/api/hybrid/reconnect'"),'browser adapter must retain reconnect/repair transport for inherited clients');
must(hybrid.includes("import SovereignConnectionR117 from './SovereignConnectionR117'")&&hybrid.includes('<SovereignConnectionR117/>'),'Hybrid route must use the R117 clean connection successor');
must(bootstrap117.includes("fetch('/api/hybrid/bootstrap'")&&bootstrap117.includes("'x-omega-session-id':runtimeSessionId()")&&bootstrap117.includes('saveHybridBridge'),'R117 must bypass stale bridge headers during fresh bootstrap and persist the exact returned bridge');
must(sovereign117.includes("live?.nativeExecutionClaimed===true")&&sovereign117.includes('current.length>0'),'R117 Hybrid UI must distinguish fresh credential state from current device heartbeat truth');
must(sovereign117.includes('DOWNLOAD CLEAN R117 CONNECTOR')&&sovereign117.includes('download={SOVEREIGN_LAUNCHER_FILENAME_R117}'),'R117 clean connector must remain an explicit user-clickable download after server bootstrap');
must(launcher117.includes('/api/hybrid/agent-download?r117=1')&&launcher117.includes("OMEGA_ORIGIN=${ORIGIN}"),'R117 launcher must use the canonical validated endpoint and hard-bind canonical origin');
// Retain the R112 donor/recovery path as inherited evidence, but it is no longer the active ordinary mount.
must(sovereign112.includes('reconnectHybridBridge(false)')&&sovereign112.includes('reconnectHybridBridge(true)'),'R112 donor connection surface must retain explicit verify-then-repair transport');
must(launcher112.includes('/api/hybrid/agent-download?r112=1')&&launcher112.includes("OMEGA_ORIGIN=${ORIGIN}"),'R112 donor launcher must remain internally coherent for rollback evidence');
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
must(![worker,worker114,worker115,worker116,adapter,hybrid,sovereign117,launcher117,weave,stage].join('\n').includes('@appdeploy/client'),'R101 must remain provider portable');

console.log('R101 WEAVE + HYBRID PASS · 44 routes intact · weave-derived effective atlas resolution · R117 fresh durable bridge bootstrap · authenticated-heartbeat truth preserved through R116→R115→R114→R101');
await import('./r102-federated-instrument-experience-invariants.mjs');
await import('./r112-sovereign-living-fabric-invariants.mjs');
