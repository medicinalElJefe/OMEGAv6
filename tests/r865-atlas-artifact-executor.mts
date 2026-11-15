import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {executeAtlasArtifactR865} from '../src7/workspaces/omegaAtlasArtifactExecutorR865.ts';
import {getMandala20736Field} from '../src/mandala20736Runtime.ts';
test('R865 executes a real Atlas model route into a validated SVG artifact',async()=>{
 const field=await getMandala20736Field();
 const output=executeAtlasArtifactR865(field,11498,12);
 assert.equal(output.artifact.provenance.authority,'MODEL_DERIVED');
 assert.equal(output.artifact.provenance.stateCount,output.rowCount);
 assert.equal(output.rowCount,12);
 assert.match(output.artifact.payload,/<polyline points=/);
 assert.match(output.csv,/\n/);
});
test('R865 rejects invalid model addresses and wires execution into Projects and Assets',async()=>{
 const field=await getMandala20736Field();
 assert.throws(()=>executeAtlasArtifactR865(field,-1,12),/Invalid pipeline address/);
 const ui=fs.readFileSync('src7/workspaces/SharedArtifactLibraryR864.tsx','utf8');
 assert.match(ui,/executeAtlasArtifactR865/);
 assert.match(ui,/Compute and save Atlas SVG here/);
 assert.match(ui,/appendArtifactR862/);
});
