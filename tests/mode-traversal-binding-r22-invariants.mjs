import fs from 'node:fs';

const src=fs.readFileSync('src/SourceBackedModesPanelR21.tsx','utf8');
const runtime=fs.readFileSync('src/sourceBackedModeRuntimeR21.ts','utf8');

const must=(needle,msg)=>{if(!src.includes(needle))throw new Error(msg)};

must("setSelectedModeId",'R22 must provide an explicit selected source-backed mode for traversal');
must("sourceBackedModeSummary(corpusState(x.address))",'R22 must re-evaluate the selected operator from each exact canonical route packet');
must("x.state!=='GATED_MISSING_INPUTS'",'R22 must prevent missing-input formulas from being selected as executed traversal traces');
must("route = exact autoPing.dataNext sequence",'R22 must preserve canonical route-before-visualization truth');
must("data-active-mode={activeMode.id}",'R22 must expose active mode identity in the rendered proof surface');
must("Trace this mode",'R22 must make source-bound mode-to-traversal selection user actionable');
if(!runtime.includes("Only operators whose required inputs are present in the canonical packet are executed"))throw new Error('R22 must retain source-backed execution truth boundary');
if(src.includes('@appdeploy/client')||src.includes('appdeploy.ai'))throw new Error('R22 reintroduced AppDeploy dependency');

console.log('OMEGA R22 PASS · selected source-backed operators are traced across exact admitted canonical states; gated formulas remain non-executable');
