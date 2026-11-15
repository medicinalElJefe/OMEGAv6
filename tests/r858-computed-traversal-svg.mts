import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
import {renderTraversalSvgR858} from '../src7/workspaces/omegaTraversalSvgR858.ts';
const make=()=>new Float32Array(20736);
const field={count:20736,x:make(),y:make(),routeNext:new Uint32Array(20736)} as Mandala20736Field;
field.x[0]=-.5;field.y[0]=.5;field.x[1]=.5;field.y[1]=-.5;field.routeNext[0]=1;
test('exports actual computed coordinates to inspectable SVG',()=>{
 const svg=renderTraversalSvgR858(field,[0,1]);
 assert.match(svg,/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 assert.match(svg,/202\.500,92\.500 437\.500,207\.500/);
 assert.match(svg,/MODEL_DERIVED/);
 assert.match(svg,/addresses 1 to 2/);
});
test('rejects fabricated successor chain, invalid projection and unbounded routes',()=>{
 assert.throws(()=>renderTraversalSvgR858(field,[1,2]),/successor chain/);
 assert.throws(()=>renderTraversalSvgR858(field,[0,20736]),/Invalid model route/);
 assert.throws(()=>renderTraversalSvgR858(field,[0]),/2–64/);
 const bad={...field,x:new Float32Array(2)} as Mandala20736Field;
 assert.throws(()=>renderTraversalSvgR858(bad,[0,1]),/Complete model projection/);
});

test('R860 workbench exposes computed SVG preview and download without an external service',()=>{
 const ui=readFileSync(new URL('../src7/workspaces/HistoricalConvergenceWorkbenchR667.tsx',import.meta.url),'utf8');
 assert.match(ui,/onClick=\\{previewSvgR860\\}[^>]*>Preview computed SVG/);
 assert.match(ui,/data-r860-svg-preview='model-derived'/);
 assert.match(ui,/renderTraversalSvgR858\\(field,route\\)/);
 assert.match(ui,/onClick=\\{exportSvgR858\\}[^>]*>Download computed SVG/);
});
