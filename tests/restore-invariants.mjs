import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const worker=read('src/worker.js'),adapter=read('src/platformAdapter.ts'),manifest=read('RESTORE_MANIFEST.md'),responsiveShell=read('src/ResponsiveRuntimeShell.tsx'),responsiveCss=read('src/responsiveShell.css'),commandDeck=read('src/OmegaCommandDeck.tsx'),commandCss=read('src/commandDeck.css'),orchestrator=read('src/PromptOrchestrator.tsx'),hybridRuntime=read('src/hybridCommandRuntime.ts'),workstation=read('src/OmegaWorkstation.tsx'),corpusRuntime=read('src/corpusRuntime.ts'),unified=read('src/unifiedCalculus.ts'),surpass=read('src/OmegaSurpassShell.tsx'),visualCal=read('src/visualCalibration.ts'),mandala=read('src/mandala20736Runtime.ts'),relativity=read('src/RelativityLab.tsx'),atlasCalc=read('src/AtlasCalculatorPanel.tsx'),atlasRuntime=read('src/atlasCalculatorRuntime.ts'),infinity=read('src/OmegaInfinityPanel.tsx'),scalePanel=read('src/RecursiveScalePanel.tsx'),scaleRuntime=read('src/recursiveScaleCompiler.ts'),realityRuntime=read('src/realityRuntime.ts'),realityLab=read('src/AppliedRealityLab.tsx');

assert.match(worker,/\/api\/restoration/);assert.match(worker,/fullRestoreClaimed:\s*false/);assert.match(worker,/DEVICE_PROOF_REQUIRED/);assert.match(worker,/EXTERNAL_DEGRADED_UNTIL_BOUND/);assert.match(worker,/MODEL_PROVIDER_NOT_CONFIGURED/);assert.match(worker,/\/api\/hybrid\/status/);assert.match(worker,/\/api\/orchestrator\/thread/);
assert.doesNotMatch(adapter,/@appdeploy\/client/);assert.match(adapter,/localStorage/);assert.match(adapter,/AbortController/);
assert.match(manifest,/PROMOTED WORKSTATION|FULL WORKSTATION CANDIDATE/);assert.match(manifest,/does \*\*not\*\* claim FULL RESTORE|Do not call the public deployment FULL RESTORE/);assert.match(manifest,/Google Drive remains canonical release authority|canonical release authority remains Google Drive/);
assert.match(responsiveShell,/ALL 24 SOFTWARE FAMILIES/);assert.match(responsiveShell,/MODE188\+ admission/);assert.match(responsiveCss,/@media\(max-width:760px\)/);assert.match(responsiveCss,/prefers-reduced-motion:reduce/);
assert.match(commandDeck,/Talk to OMEGA\. Build with OMEGA\./);assert.match(commandDeck,/LIVE MODEL FIELD/);assert.match(commandDeck,/Source-derived motion · not an Earth observation/);assert.match(commandCss,/@media\(max-width:760px\)/);
assert.doesNotMatch(orchestrator,/@appdeploy\/client/);assert.match(orchestrator,/CONVERSE/);assert.match(orchestrator,/ENACT/);assert.match(hybridRuntime,/HYBRID_OPS|validateCommandPlan/);assert.match(hybridRuntime,/Project path must stay relative/);assert.match(hybridRuntime,/REPLAY_MACRO/);
assert.match(workstation,/20,736/);assert.match(workstation,/Control Matrix/);assert.match(corpusRuntime,/STATE_COUNT=20736/);assert.match(corpusRuntime,/m\.count===179/);assert.match(unified,/S_full=\(CΩ·W·Φ\)/);

// Restore-and-surpass locks: these fail CI if a future edit silently drops the recovered capability slice.
assert.match(surpass,/Relativity\+/);assert.match(surpass,/20,736 Field\+/);assert.match(surpass,/Atlas Calc\+/);assert.match(surpass,/Infinity\+/);assert.match(surpass,/Scale\+/);assert.match(surpass,/Reality\+/);
assert.match(visualCal,/CALIBRATION_CHANNELS/);assert.match(visualCal,/STATE_COUNT/);assert.match(visualCal,/buildVisualCalibrationCooperative/);
assert.match(mandala,/Mandala20736Field/);assert.match(mandala,/motionDrive/);assert.match(mandala,/acceleration/);
assert.match(relativity,/Violet Transfiguration Canon/);assert.match(relativity,/FUTURE COHERENCE|futureCoherenceProjection/);
assert.match(atlasCalc,/20,736 bridge/);assert.match(atlasRuntime,/seen\.size===STATE_COUNT/);
assert.match(infinity,/OmegaInfinity/);assert.match(infinity,/derived live-packet projection/);
assert.match(scalePanel,/Macro → meso → micro → nano → parent/);assert.match(scaleRuntime,/burdenConserved/);assert.match(scaleRuntime,/futureObservationUsed:false/);
assert.match(realityRuntime,/analyzeReality/);assert.match(realityRuntime,/backtest/);assert.match(realityRuntime,/STATE_COUNT/);assert.match(realityLab,/Reality Lab\+/);assert.match(realityLab,/20,736-state atlas/);assert.match(realityLab,/realityLab\.css/);

console.log('restore invariants PASS');
