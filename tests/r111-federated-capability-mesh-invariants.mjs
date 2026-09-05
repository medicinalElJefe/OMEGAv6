import fs from 'node:fs';
import {authorityNodesR111,fabricIntentR111,fabricSummaryR111,FABRIC_MESH_LAW_R111} from '../src/federation/fabricMeshR111.js';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R111 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx'),wrangler=read('wrangler.jsonc'),worker=read('src/workerR111.js'),r102=read('src/workerR102.js'),mesh=read('src/federation/fabricMeshR111.js'),routes=read('src/capability/routeLayerOutputRegistryR111.ts'),navigator=read('src/OmegaSideNavigatorR88.tsx'),ribbon=read('src/RouteOutputRibbonR111.tsx'),hybrid=read('src/HybridConnectBarR111.tsx'),sovereign=fs.existsSync('src/SovereignConnectionR112.tsx')?read('src/SovereignConnectionR112.tsx'):hybrid,launcher=fs.existsSync('src/sovereignLauncherR112.ts')?read('src/sovereignLauncherR112.ts'):hybrid,hybridMission=read('src/HybridMissionControl.tsx'),sentinel=read('cloud/fabric-sentinel/src/index.js'),sentinelConfig=read('wrangler.fabric-sentinel.jsonc'),sentinelWorkflow=read('.github/workflows/r111-fabric-sentinel.yml');

// One successor worker; all established API/runtime authority remains inherited.
must(wrangler.includes('"main": "src/workerR111.js"'),'Wrangler must promote the additive R111 successor');
must(worker.includes("import r102,{OmegaRuntime as OmegaRuntimeR102} from './workerR102.js'")&&worker.includes('export class OmegaRuntime extends OmegaRuntimeR102'),'R111 must preserve the complete R102/R101/R34 runtime lineage');
must(worker.includes("path==='/api/fabric/status'")&&worker.includes("path==='/api/fabric/route'")&&worker.includes("path==='/api/fabric/law'"),'fabric API surface incomplete');
must(worker.includes('return r102.fetch')||worker.includes('const response=await r102.fetch'),'legacy paths must delegate to R102 rather than clone runtime behavior');
must(r102.includes("from './workerR101.js'")&&r102.includes("path==='/api/federation/run/status'"),'R102 federation authority must remain inherited');
must(worker.includes("FABRIC_OBSERVER_SESSION_R111='r111_fabric_observer'")&&worker.includes("headers.set('x-omega-session-id',FABRIC_OBSERVER_SESSION_R111)"),'generic fabric observers must receive a bounded read-only namespace so R34 status cannot collapse to BRIDGE_ID_REQUIRED');
must(worker.includes("'CALLER_BRIDGE_OR_SESSION_CONTEXT':'NEUTRAL_READ_ONLY_OBSERVER_NAMESPACE'")&&worker.includes('sourceStatus:{federationHttpStatus'),'fabric status must expose whether readiness came from caller bridge context or the neutral observer namespace');

// Federation stays four authorities while service capacity may scale independently.
const liveStatus={nodes:{genesis:{state:'LIVE',latencyMs:2},optical:{state:'LIVE',latencyMs:4},sovereign:{state:'PC_ONLINE',rcwaState:'RCWA_ONLINE'},omegaV6:{state:'LIVE'}},runtime:{rcwa:{state:'RCWA_ONLINE'}}};
const authority=authorityNodesR111(liveStatus);
must(authority.length===4&&authority.map(x=>x.id).join('|')==='omega-genesis|omega-optical|omega-sovereign|omega-v6','exact four-node authority order required');
must(authority.filter(x=>x.globalAuthority).length===1&&authority.find(x=>x.globalAuthority)?.id==='omega-v6','OMEGAv6 must remain the single global CanonState authority');
const summary=fabricSummaryR111(liveStatus,{state:'VERIFIED_DEVICE_ONLINE',nativeExecutionClaimed:true},{AI:{}});
must(summary.readyAuthorityCount===4&&summary.gate==='READY','fully live mock fabric must be READY');
must(summary.serviceCapabilities.length>=5&&summary.serviceCapabilities.some(x=>x.id==='rcwa')&&summary.serviceCapabilities.some(x=>x.id==='workers-ai'),'service capabilities must be extensible without becoming authorities');
must(FABRIC_MESH_LAW_R111.laws.includes('ADD_SERVICE_CAPACITY_WITHOUT_ADDING_CANONSTATE_AUTHORITY'),'scalable service-capacity law missing');
const gatedStatus={...liveStatus,nodes:{...liveStatus.nodes,optical:{state:'ACCESS_GATED'},sovereign:{state:'PAIRING_REQUIRED',rcwaState:'RCWA_OFFLINE'}}};
const intent=fabricIntentR111('generate better etched optical candidates and validate with RCWA',gatedStatus,{state:'DEVICE_PROOF_REQUIRED'},{AI:{}});
must(intent.minimumAuthorityPath.map(x=>x.id).join('|')==='omega-genesis|omega-optical|omega-sovereign|omega-v6','optical full-wave intent must preserve propose/screen/solve/admit path');
must(intent.plan.gate==='omega-optical','first unavailable required authority must gate the plan');

// Every registered route declares all-layer responsibilities and output truth.
const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
const routeNames=[...routes.matchAll(/\bc\('([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'registered workstation route inventory regressed');
must(routeNames.length===44&&new Set(routeNames).size===44,'R111 route/output contracts must be unique and complete');
must(surfaces.every(x=>routeNames.includes(x))&&routeNames.every(x=>surfaces.includes(x)),'route/output registry must exactly cover the workstation route universe');
for(const layer of ['STATE','INTELLIGENCE','MEMORY','RELATION','COMPUTATION','ACTION','OBSERVATION','PROOF'])must(routes.includes(`'${layer}'`),'eight-layer registry missing '+layer);
for(const field of ['input:string','operation:string','output:string','proof:string','evidenceClass:string'])must(routes.includes(field),'output contract field missing '+field);
must(navigator.includes("import RouteOutputRibbonR111 from './RouteOutputRibbonR111'")&&navigator.includes('<RouteOutputRibbonR111 route={currentPanel}/>'),'global navigator must expose the active route output contract');
must(ribbon.includes('INPUT')&&ribbon.includes('OPERATION')&&ribbon.includes('OUTPUT')&&ribbon.includes('PROOF'),'output ribbon must preserve input→operation→output→proof grammar');

// Hybrid gets one obvious connection path without weakening device proof or removing advanced recovery.
must(hybridMission.includes("import HybridConnectBarR111 from './HybridConnectBarR111'")&&hybridMission.includes('<HybridConnectBarR111/>'),'one-touch Hybrid connection surface must be mounted');
must(hybrid.includes("import SovereignConnectionR112 from './SovereignConnectionR112'")&&hybrid.includes('<SovereignConnectionR112 compact/>'),'R112 must preserve the accepted R111 mount while converging it on the shared successor connection flow');
must(sovereign.includes("await reconnectHybridBridge(false)")&&sovereign.includes("await reconnectHybridBridge(true)"),'primary connection path must verify persisted bridge then repair only on auth failure');
must(sovereign.includes("live?.nativeExecutionClaimed===true")&&sovereign.includes("'PC ONLINE'"),'PC ONLINE must require current native proof');
must(launcher.includes('OMEGA_CONNECT_THIS_PC_R112.cmd')&&launcher.includes('/api/hybrid/agent-download?r112=1')&&launcher.includes('/api/federation/rcwa/agent-download?r112=1'),'one launcher must bind general Hybrid plus optional RCWA transport');
must(launcher.includes('pip install numpy grcwa')&&launcher.includes('General PC connection will still work'),'missing RCWA dependency must degrade gracefully without silently installing software');
must(sovereign.includes('New connection key')&&sovereign.includes('Forget browser key'),'advanced repair controls must remain available');

// New cloud capacity is an observer, never a shadow authority.
must(sentinelConfig.includes('"name":"omega-fabric-sentinel"')&&sentinelConfig.includes('cloud/fabric-sentinel/src/index.js'),'sentinel worker config missing');
must(sentinel.includes("authority:'ADVISORY_CURRENT_PROBE_ONLY'")&&sentinel.includes("canonicalAuthority:'omega-v6'"),'sentinel authority boundary missing');
must(sentinel.includes(`${'${OMEGA}'}/api/fabric/status`)&&sentinel.includes(`${'${GENESIS}'}/api/health`)&&sentinel.includes(`${'${OPTICAL}'}/api/health`),'sentinel must independently probe the established cloud fabric');
must(!sentinel.includes('OMEGA_RUNTIME')&&!sentinel.includes('CanonState='),'sentinel may not own runtime/canonical state');
must(sentinelWorkflow.includes('wrangler.fabric-sentinel.jsonc')&&sentinelWorkflow.includes('R111 SENTINEL LIVE PASS'),'sentinel deployment/live verification gate missing');

// No pseudo-random truth generation in federation or sentinel health.
must(!mesh.includes('Math.random')&&!worker.includes('Math.random')&&!sentinel.includes('Math.random'),'fabric truth must be deterministic/probe-derived');
console.log('R111.1 FEDERATED CAPABILITY MESH PASS · neutral observer identity preserves four authority observations · scalable services · 44 route/output contracts · R112 shared one-touch Hybrid proof flow · independent advisory sentinel');
