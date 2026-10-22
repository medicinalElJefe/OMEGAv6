import fs from 'node:fs';
const runtime=fs.readFileSync('src/compilerLineageRuntime.ts','utf8');
const visual=fs.readFileSync('src/OmegaVisualInstrument.tsx','utf8');
const css=fs.readFileSync('src/semanticDepth.css','utf8');
for(const token of ['PC_1728_CAMERA','MODE188_UNIFIED','MODE188_SYNCED_20736','DEWEY_RSC_CONTINUITY','CONDENSED_MATTER_144_20736','Mode188_Unified_Runtime_20736D_SYNCED.xlsx','Condensed_Matter_144D_20736D_Framework_FULL20736.xlsx','no new physical primitive'])if(!runtime.includes(token))throw new Error(`compiler lineage invariant missing: ${token}`);
for(const token of ['COMPILER_LINEAGES','lineagePoint','lineageWeight','omega.compiler.lineage','compiler-lineage-tabs'])if(!visual.includes(token))throw new Error(`visual lineage binding missing: ${token}`);
if(!css.includes('.compiler-lineage-tabs'))throw new Error('compiler lineage control styling missing');
if(runtime.includes('@appdeploy/client')||visual.includes('@appdeploy/client'))throw new Error('builder runtime dependency regression');
console.log('compiler lineage invariants PASS');
