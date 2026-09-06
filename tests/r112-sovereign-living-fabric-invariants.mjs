import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R112/R117 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const hybridRoute=read('src/HybridLinkR32.tsx');
const hybridMount=read('src/HybridConnectBarR111.tsx');
const sovereign112=read('src/SovereignConnectionR112.tsx');
const launcher112=read('src/sovereignLauncherR112.ts');
const sovereign117=read('src/SovereignConnectionR117.tsx');
const launcher117=read('src/sovereignLauncherR117.ts');
const bootstrap117=read('src/hybridBootstrapR117.ts');
const federation=read('src/FederationRunR97.tsx');
const field=read('src/FederationLivingFieldR112.tsx');
const law=read('src/calculusVisualLawR37.ts');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'44-route capability universe must remain intact');

must(hybridRoute.includes('<SovereignConnectionR117/>'),'Hybrid Link must put the R117 clean PC connection successor on the ordinary surface');
must(hybridRoute.includes("<details className='r112-hybrid-deep'>")&&hybridRoute.includes('<HybridMissionControlR8'),'deep mission/federation diagnostics must remain available by progressive disclosure rather than being deleted');
must(hybridMount.includes('<SovereignConnectionR117 compact/>'),'legacy one-touch mount must converge on the same R117 clean connection state machine');

must(bootstrap117.includes("fetch('/api/hybrid/bootstrap'")&&bootstrap117.includes('saveHybridBridge'),'R117 connection state machine must mint and persist one exact fresh durable bridge');
must(sovereign117.includes("live?.nativeExecutionClaimed===true")&&sovereign117.includes('current.length>0'),'PC ONLINE must require both current device heartbeat and native proof claim');
must(sovereign117.includes('DOWNLOAD CLEAN R117 CONNECTOR')&&sovereign117.includes('download={SOVEREIGN_LAUNCHER_FILENAME_R117}'),'clean launcher download must be an explicit user-clickable file action after fresh pairing');
must(!sovereign117.includes("document.createElement('a')")&&!sovereign117.includes('.click()'),'R117 must not depend on a browser-blockable synthetic async download click');
must(sovereign117.includes('Local learning')&&sovereign117.includes('Full-wave RCWA'),'connection surface must expose meaningful post-connection capability, including bounded learning and solver state');

must(launcher117.includes("OMEGA_ORIGIN=${ORIGIN}")&&launcher117.includes('/api/hybrid/agent-download?r117=1'),'R117 launcher must hard-bind canonical OMEGA and canonical agent endpoint');
must(launcher117.includes('if exist J:\\\\')&&launcher117.includes('OMEGA_APPROVED_ROOT'),'R117 launcher must honor explicit root override and prefer the established J:\\ root when present');
must(launcher117.includes("$s.StartsWith('#!/usr/bin/env python3')")&&launcher117.includes("$s.Contains('OMEGA Hybrid Link agent')"),'R117 launcher must validate Python source before execution');
must(launcher117.includes('import numpy,grcwa')&&launcher117.includes('General Hybrid connection will still run'),'optional RCWA must never block the general Hybrid heartbeat');
must(launcher117.includes('pip install numpy grcwa')&&!launcher117.includes('winget install'),'launcher may explain missing solver dependency but must not silently install it');
must(launcher117.includes('OMEGA_CONNECT_PC_R117.log'),'R117 launcher must leave a local diagnostic log for failed connection runs');
must(launcher117.includes('omega-sovereign-convergence.foundasound.chatgpt.site')&&!launcher117.includes('https://omega-sovereign-convergence.foundasound.chatgpt.site/'),'retired origin may be identified for diagnostics but must not appear as an executable fallback URL');

// R112 remains retained donor/rollback evidence rather than the active user path.
must(sovereign112.includes("await createHybridPair(false)")&&sovereign112.includes('reconnectHybridBridge(false)')&&sovereign112.includes('reconnectHybridBridge(true)'),'R112 donor connection state machine must remain intact');
must(launcher112.includes("OMEGA_ORIGIN=${ORIGIN}")&&launcher112.includes('/api/hybrid/agent-download?r112=1'),'R112 donor launcher must remain internally coherent for rollback evidence');

must(federation.includes('Tell OMEGA the outcome. The machinery stays underneath.')&&federation.includes('Run capability plan'),'ordinary federation use must begin from intended outcome rather than cloud selection');
must(federation.includes('<FederationLivingFieldR112')&&federation.includes("<details className='r112-fabric-details'>"),'living status must be primary while technical topology remains inspectable under progressive disclosure');
must(field.includes('requestAnimationFrame')&&field.includes('calculusVisualLaw(corpusState')&&field.includes("localState.read('omega.v6.address'"),'living field motion must be deterministic and driven by the current OMEGA address/calculus');
must(field.includes('nodes?.genesis?.state')&&field.includes('nodes?.optical?.state')&&field.includes('nodes?.sovereign?.state')&&field.includes('nodes?.omegaV6?.state'),'living field must incorporate actual four-node truth states');
must(field.includes('instrument projection, not an external physical measurement'),'motion visual must preserve representation-vs-measurement truth boundary');
must(!field.includes('Math.random')&&!launcher117.includes('Math.random'),'living/connection paths may not fabricate state with randomness');
must(law.includes('globalModeInfluenceR107')&&law.includes('sourceModeInfluence'),'R117 must consume the established full calculus/mode fabric rather than inventing a parallel decorative motion system');

console.log('R112/R117 SOVEREIGN + LIVING FABRIC PASS · fresh durable bootstrap · explicit browser-safe clean connector · current-heartbeat truth · retained local learning/RCWA · task-first federation · calculus-driven living motion · R112 donor preserved');
