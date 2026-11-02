import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderAtlasFieldRasterR734} from '../src/atlasFieldRasterR734.mjs';
import {buildSourceTessellationR769,computeSourceTessellationR769,navigateSourceTessellationR769,serializeSourceTessellationSvgR769,SOURCE_TESSELLATION_SCHEMA_R769} from '../src/sourceTessellationR769.mjs';
const n=20736,field={count:n,routeNext:new Uint32Array(n),C:new Float32Array(n)};
for(let i=0;i<n;i++){field.routeNext[i]=i===n-1?i:i+1;field.C[i]=(i%144)/143;}
const before=field.C.slice(),routes=field.routeNext.slice(),raster=renderAtlasFieldRasterR734(field,'C');
const tile=buildSourceTessellationR769(field,raster,0);
assert.equal(tile.schema,SOURCE_TESSELLATION_SCHEMA_R769);
assert.equal(tile.tileSize,12);assert.equal(tile.cells.length,144);assert.equal(tile.edges.length,132);
assert.equal(tile.cells[0].address,0);assert.equal(tile.cells[143].address,1595);
assert.equal(tile.cells[0].triangles.length,2);assert.equal(tile.cells[0].successor,1);
assert.equal(tile.cells[0].delta,raster.values[1]-raster.values[0]);
assert.equal(tile.sourceBound,true);assert.equal(tile.historicalRendererParity,false);
assert.equal(tile.canonicalMutation,false);assert.equal(tile.physicalMeasurement,false);
assert.deepEqual(field.C,before);assert.deepEqual(field.routeNext,routes);
assert.deepEqual(computeSourceTessellationR769(field,'C',0),tile);
const seen=new Set();
for(let row=0;row<144;row+=12)for(let col=0;col<144;col+=12){
 const local=buildSourceTessellationR769(field,raster,row*144+col);
 for(const c of local.cells){assert.ok(!seen.has(c.address));seen.add(c.address);}
}
assert.equal(seen.size,20736,'each address covered exactly once');
for(const size of [6,12,24]){
 const last=buildSourceTessellationR769(field,raster,20735,size);
 assert.equal(last.cells.length,size*size);assert.equal(last.cells.at(-1).address,20735);
 assert.equal(last.originRow,144-size);assert.equal(last.originCol,144-size);
}
assert.equal(navigateSourceTessellationR769(0,-1,0),0);
assert.equal(navigateSourceTessellationR769(143,0,1),143);
assert.equal(navigateSourceTessellationR769(0,1,0),144);
assert.equal(navigateSourceTessellationR769(144,0,1),145);
assert.equal(navigateSourceTessellationR769(20735,1,0),20735);
assert.throws(()=>navigateSourceTessellationR769(20736,0,1),/refused/);
assert.throws(()=>navigateSourceTessellationR769(1,2,0),/refused/);
assert.throws(()=>buildSourceTessellationR769(field,raster,-1),/refused/);
assert.throws(()=>buildSourceTessellationR769(field,raster,0,13),/refused/);
assert.throws(()=>buildSourceTessellationR769(field,{...raster,addressCount:3},0),/required/);
const bad={...field,routeNext:field.routeNext.slice()};bad.routeNext[0]=20736;
assert.throws(()=>buildSourceTessellationR769(bad,raster,0),/invalid source successor/);
const svg=serializeSourceTessellationSvgR769(tile);
assert.equal((svg.match(/<polygon /g)||[]).length,288);
assert.equal((svg.match(/<line /g)||[]).length,132);
assert.ok(svg.includes('data-address="0"'));assert.ok(svg.includes('viewBox="0 0 12 12"'));
assert.equal(serializeSourceTessellationSvgR769(tile),svg);
assert.equal((serializeSourceTessellationSvgR769(tile,{showEdges:false}).match(/<line /g)||[]).length,0);
assert.throws(()=>serializeSourceTessellationSvgR769({...tile,cells:[]}),/required/);
const ui=readFileSync(new URL('../src7/workspaces/SourceTessellationR769.tsx',import.meta.url),'utf8');
const host=readFileSync(new URL('../src7/workspaces/RouteBasinInstrumentR732.tsx',import.meta.url),'utf8');
for(const marker of ['data-r769-svg','data-r769-cell','data-r769-zoom','data-r769-export','data-r769-selected','data-r769-boundary'])assert.ok(ui.includes(marker),'missing real UI '+marker);
assert.ok(host.includes('SourceTessellationR769'),'source renderer not integrated into existing OMEGA7 workspace');
console.log('R769 source tessellation PASS: 20,736 unique addresses, 6/12/24 zoom, exact successor edges, deterministic portable SVG, navigation, no source mutation');
