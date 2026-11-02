import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderAtlasFieldRasterR734} from '../src/atlasFieldRasterR734.mjs';
import {buildSourceTessellationR769,serializeSourceTessellationSvgR769} from '../src/sourceTessellationR769.mjs';
import {computeSourceFieldLensR770,DEFAULT_SOURCE_LENS_R770,SOURCE_LENS_SCHEMA_R770,serializeSourceLensSettingsR770,parseSourceLensSettingsR770} from '../src/sourceFieldLensR770.mjs';
const n=20736,field={count:n,routeNext:new Uint32Array(n),C:new Float32Array(n),q:new Float32Array(n),scar:new Float32Array(n),velocity:new Float32Array(n)};
for(let i=0;i<n;i++){field.routeNext[i]=(i+1)%n;field.C[i]=(i%144)/143;field.q[i]=1-field.C[i];field.scar[i]=.5;field.velocity[i]=i%2?-.75:.25;}
const before=field.C.slice(),beforeQ=field.q.slice(),beforeNext=field.routeNext.slice();
const a=computeSourceFieldLensR770(field,'C','q',0),b=computeSourceFieldLensR770(field,'C','q',100),mid=computeSourceFieldLensR770(field,'C','q',50);
assert.equal(mid.values.length,n);assert.equal(mid.rgba.length,n*4);assert.equal(mid.lens.schema,SOURCE_LENS_SCHEMA_R770);
assert.equal(mid.sourceBound,true);assert.equal(mid.canonicalMutation,false);assert.equal(mid.physicalMeasurement,false);
assert.equal(mid.historicalRendererParity,false);
for(let i=0;i<n;i++){
 assert.ok(Math.abs(a.values[i]-field.C[i])<1e-6);
 assert.ok(Math.abs(b.values[i]-field.q[i])<1e-6);
 assert.ok(Math.abs(mid.values[i]-.5)<1e-6);
 assert.ok(Number.isFinite(mid.values[i])&&mid.values[i]>=0&&mid.values[i]<=1);
 assert.equal(mid.rgba[i*4+3],255);
}
assert.deepEqual(field.C,before);assert.deepEqual(field.q,beforeQ);assert.deepEqual(field.routeNext,beforeNext);
assert.deepEqual(computeSourceFieldLensR770(field,'C','q',50),mid);
const signed=computeSourceFieldLensR770(field,'velocity','scar',0);
assert.ok(signed.values[0]>.5&&signed.values[1]<.5);
const constant=computeSourceFieldLensR770(field,'scar','scar',50);
assert.equal(constant.values[0],.5);
for(const args of [['bogus','q',50],['C','q',-1],['C','q',101],['C','q',1.5]])assert.throws(()=>computeSourceFieldLensR770(field,...args),/refused/);
assert.throws(()=>computeSourceFieldLensR770({...field,q:undefined},'C','q',50),/missing or incomplete/);
assert.throws(()=>computeSourceFieldLensR770({...field,C:new Float32Array(n).fill(NaN)},'C','q',50),/nonfinite/);
const settings=serializeSourceLensSettingsR770({...DEFAULT_SOURCE_LENS_R770,mode:'woven',weightPercent:65});
assert.deepEqual(parseSourceLensSettingsR770(settings),{mode:'woven',first:'C',second:'q',weightPercent:65});
for(const raw of ['bad','{"schema":"OTHER"}','{"schema":"'+SOURCE_LENS_SCHEMA_R770+'","mode":"woven","first":"evil","second":"q","weightPercent":20}','x'.repeat(513)])assert.throws(()=>parseSourceLensSettingsR770(raw),/refused/);
const tile=buildSourceTessellationR769(field,mid,0,6);
assert.equal(tile.cells.length,36);assert.equal((serializeSourceTessellationSvgR769(tile).match(/<polygon /g)||[]).length,72);
assert.equal(renderAtlasFieldRasterR734(field,'C').addressCount,n);
const ui=readFileSync(new URL('../src7/workspaces/SourceTessellationR769.tsx',import.meta.url),'utf8');
for(const marker of ['data-r770-mode','data-r770-first','data-r770-second','data-r770-weight','data-r770-summary','data-r770-boundary'])assert.ok(ui.includes(marker),'R770 interactive UI missing '+marker);
console.log('R770 source lens PASS: 20,736 source-derived convex projections, signed/constant cases, SVG mesh, deterministic replay, settings recovery and tamper refusal');
