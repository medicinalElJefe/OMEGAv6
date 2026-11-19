import assert from 'node:assert/strict';
import {getMandala20736Field} from '../src/mandala20736Runtime';
import {exportFullAtlasCsvR896} from '../src7/workspaces/omegaFullAtlasExportR896';

const field=await getMandala20736Field();
const csv=exportFullAtlasCsvR896(field);
const rows=csv.trimEnd().split('\n');
assert.equal(rows.length,20737);
const columns=rows[0].split(',');
assert.equal(columns[0],'address');
assert.equal(columns.length,23);
for(let i=0;i<20736;i++){
 const values=rows[i+1].split(',');
 assert.equal(values.length,columns.length,'row '+i);
 assert.equal(Number(values[0]),i);
 assert.equal(Number(values[columns.indexOf('routeNext')]),field.routeNext[i]);
}
assert.throws(()=>exportFullAtlasCsvR896({...field,count:144}),/20736/);
assert.throws(()=>exportFullAtlasCsvR896({...field,C:new Float32Array(144)}),/Incomplete Atlas/);
const corrupted=new Uint32Array(field.routeNext);corrupted[12]=20736;
assert.throws(()=>exportFullAtlasCsvR896({...field,routeNext:corrupted}),/Invalid route target/);
console.log('R896: all 20736 rows and source field integrity validated');
