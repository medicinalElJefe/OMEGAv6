import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R112 '+msg)};
const workstation=read('src/OmegaWorkstationFullV2.tsx');
const hybridRoute=read('src/HybridLinkR32.tsx');
const hybridMount=read('src/HybridConnectBarR111.tsx');
const sovereign=read('src/SovereignConnectionR112.tsx');
const launcher=read('src/sovereignLauncherR112.ts');
const federation=read('src/FederationRunR97.tsx');
const field=read('src/FederationLivingFieldR112.tsx');
const law=read('src/calculusVisualLawR37.ts');

const surfaceBlock=(workstation.match(/OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...surfaceBlock.matchAll(/'([^']+)'/g)].map(x=>x[1]);
must(surfaces.length===44&&new Set(surfaces).size===44,'44-route capability universe must remain intact');

must(hybridRoute.includes('<SovereignConnectionR112/>'),'Hybrid Link must put the shared human-first PC connection on the ordinary surface');
must(hybridRoute.includes('<details className=\'r112-hybrid-deep\'>')&&hybridRoute.includes('<HybridMissionControlR8'),'deep mission/federation diagnostics must remain available by progressive disclosure rather than being deleted');
must(hybridMount.includes('<SovereignConnectionR112 compact/>'),'legacy one-touch mount must converge on the same R112 connection state machine');

must(sovereign.includes("await createHybridPair(false)")&&sovereign.includes('reconnectHybridBridge(false)')&&sovereign.includes('reconnectHybridBridge(true)'),'connection state machine must prepare, verify and repair credentials in bounded order');
must(sovereign.includes("live?.nativeExecutionClaimed===true")&&sovereign.includes("current.length>0"),'PC ONLINE must require both current device heartbeat and native proof claim');
must(sovereign.includes('Download Windows connector')&&sovereign.includes('download={SOVEREIGN_LAUNCHER_FILENAME_R112}'),'launcher download must be an explicit user-clickable file action, not a hidden async download side effect');
must(!sovereign.includes('.click()'),'R112 connection surface must not synthesize a programmatic download click after async pairing');
must(sovereign.includes('TRAIN_LOCAL can run against the approved corpus')&&sovereign.includes('Full-wave RCWA'),'connection surface must expose meaningful post-connection capability, including bounded learning and solver state');

must(launcher.includes("OMEGA_ORIGIN=${ORIGIN}")&&launcher.includes('/api/hybrid/agent-download?r112=1'),'launcher must hard-bind canonical OMEGA and canonical agent endpoint');
must(launcher.includes('if exist J:\\\\')&&launcher.includes('OMEGA_APPROVED_ROOT'),'launcher must honor explicit root override and prefer the established J:\\ root when present');
must(launcher.includes("$s.StartsWith('#!/usr/bin/env python3')")&&launcher.includes("$s.Contains('OMEGA Hybrid Link agent')"),'launcher must validate Python source before execution');
must(launcher.includes('import numpy,grcwa')&&launcher.includes('General PC connection will still work'),'optional RCWA must never block the general Hybrid heartbeat');
must(launcher.includes('pip install numpy grcwa')&&!launcher.includes('winget install')&&!launcher.includes('pip install numpy grcwa\r\n!OMEGA_PY! -m pip'),'launcher may explain missing solver dependency but must not silently install it');
must(launcher.includes('OMEGA_CONNECT_PC_R112.log'),'launcher must leave a local diagnostic log for failed connection runs');

must(federation.includes('Tell OMEGA the outcome. The machinery stays underneath.')&&federation.includes('Run capability plan'),'ordinary federation use must begin from intended outcome rather than cloud selection');
must(federation.includes('<FederationLivingFieldR112')&&federation.includes("<details className='r112-fabric-details'>"),'living status must be primary while technical topology remains inspectable under progressive disclosure');
must(field.includes('requestAnimationFrame')&&field.includes('calculusVisualLaw(corpusState')&&field.includes("localState.read('omega.v6.address'"),'living field motion must be deterministic and driven by the current OMEGA address/calculus');
must(field.includes('nodes?.genesis?.state')&&field.includes('nodes?.optical?.state')&&field.includes('nodes?.sovereign?.state')&&field.includes('nodes?.omegaV6?.state'),'living field must incorporate actual four-node truth states');
must(field.includes('instrument projection, not an external physical measurement'),'motion visual must preserve representation-vs-measurement truth boundary');
must(!field.includes('Math.random')&&!launcher.includes('Math.random'),'R112 living/connection paths may not fabricate state with randomness');
must(law.includes('globalModeInfluenceR107')&&law.includes('sourceModeInfluence'),'R112 must consume the established full calculus/mode fabric rather than inventing a parallel decorative motion system');

console.log('R112 SOVEREIGN + LIVING FABRIC PASS · one understandable PC connection · explicit launcher download · current-heartbeat truth · preserved local learning/RCWA capabilities · task-first federation · calculus-driven living motion · progressive deep diagnostics');
