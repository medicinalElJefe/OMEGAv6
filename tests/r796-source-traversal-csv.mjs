import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceTraversalCsvR796} from '../src/sourceTraversalCsvR796.mjs';
const steps=[
 {address:1,successor:2,domain:0,continuity:0.25,continuityDelta:0.5,motion:1,symmetry:0.1,scar:0,evidence:0.9,contradiction:0.2,forecastModelScore:0.4},
 {address:2,successor:1,domain:0,continuity:0.75,continuityDelta:-0.5,motion:0.8,symmetry:0.2,scar:0.1,evidence:0.8,contradiction:0.3,forecastModelScore:0.5}
];
const trace={start:1,maxSteps:12,steps,termination:'CYCLE',nextAddress:1,sourceBound:true,canonicalMutation:false,physicalMeasurement:false};
const csv=sourceTraversalCsvR796(trace);
assert.equal(csv.trim().split('\n').length,3);
assert.match(csv,/address,successor,domain,continuity,continuityDelta,motion,symmetry,scar,evidence,contradiction,forecastModelScore/);
assert.match(csv,/1,2,0,0.25,0.5,1,0.1,0,0.9,0.2,0.4/);
for(const altered of [
 {...trace,sourceBound:false},
 {...trace,canonicalMutation:true},
 {...trace,steps:[steps[0],{...steps[1],address:3}]},
 {...trace,steps:[steps[0],{...steps[1],motion:NaN}]},
 {...trace,nextAddress:3},
 {...trace,steps:[steps[0],{...steps[1],address:1}]}
])assert.throws(()=>sourceTraversalCsvR796(altered),/R796/);
const ui=readFileSync(new URL('../src7/workspaces/SourceTessellationR769.tsx',import.meta.url),'utf8');
assert.ok(ui.includes('data-r796-traversal-csv'));
assert.ok(ui.includes('sourceTraversalCsvR796(trace)'));
console.log('R796 PASS · source traversal CSV and refusal');
