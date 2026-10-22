import fs from 'node:fs';
const runtime=fs.readFileSync('src/pcExecutionSpineRuntime.ts','utf8');
const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const css=fs.readFileSync('src/semanticDepth.css','utf8');
for(const token of ['camera','feature field','canon state','runtime atlas sample','unified kernel','adaptive learning','renderer / panels','FIELD','OCCUPANCY','PREDICTION','XRAY','omega.pc.spine.ledger'])if(!runtime.includes(token))throw new Error(`PC execution spine invariant missing: ${token}`);
for(const token of ['SPINE_VIEWS','compilePcExecutionSpine','spineViewWeight','execution-spine','spine-view-tabs'])if(!visual.includes(token))throw new Error(`Visual execution-spine binding missing: ${token}`);
for(const token of ['.execution-spine','.spine-view-tabs'])if(!css.includes(token))throw new Error(`Execution spine style missing: ${token}`);
if(runtime.includes('@appdeploy/client')||visual.includes('@appdeploy/client'))throw new Error('builder runtime dependency regression');
console.log('PC execution spine invariants PASS');
