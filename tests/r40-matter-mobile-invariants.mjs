import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const law=read('src/calculusVisualLawR37.ts');
const field=read('src/CalculusFieldR37.tsx');
const css=read('src/calculusFieldR37.css');
for(const role of ['ALPHA','BASE','CONSTRUCT','PRUNE','OMEGA']){assert.match(law,new RegExp(role));assert.match(field,new RegExp(role));}
assert.match(law,/operatorWeights/);assert.match(field,/cfr37-operator-key/);assert.match(field,/cfr37-summary/);assert.match(field,/cfr37-weights/);assert.match(field,/HERE →/);assert.match(field,/data-color-authority='ALPHA BASE CONSTRUCT PRUNE OMEGA'/);assert.doesNotMatch(field,/bg\.addColorStop\(0,lawColor\(law,'primary'/);assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/min-height:385px/);assert.match(css,/grid-template-columns:1fr/);assert.match(css,/cfr37-operator-key/);assert.match(css,/cfr37-weights/);
console.log('R40 matter/mobile visual invariants PASS');
