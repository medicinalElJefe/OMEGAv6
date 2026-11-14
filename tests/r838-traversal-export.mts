import assert from 'node:assert/strict';
import {test} from 'node:test';
import {exportTraversalCsvR838,R838_TRAVERSAL_COLUMNS} from '../src7/workspaces/historicalTraversalExportR838.ts';
import type {Mandala20736Field} from '../src/mandala20736Runtime.ts';
function fixture(){
 const count=20736;
 const make=()=>new Float32Array(count);
 const f={count,C:make(),Phi:make(),q:make(),Lambda:make(),scar:make(),evidence:make(),continuityGate:make(),forecast:make(),motionDrive:make(),routeNext:new Uint32Array(count)} as Mandala20736Field;
 f.C[0]=.8;f.C[1]=.9;f.Phi[0]=.7;f.Phi[1]=.6;f.q[0]=.1;f.Lambda[0]=.2;f.scar[0]=.3;f.scar[1]=.2;f.routeNext[0]=1;f.routeNext[1]=2;
 return f;
}
test('exports source successor values, decision and derivatives with fixed column contract',()=>{
 const csv=exportTraversalCsvR838(fixture(),[0,1]);
 const lines=csv.trim().split('\r\n');
 assert.equal(lines.length,3);
 assert.deepEqual(lines[0].split(','),[...R838_TRAVERSAL_COLUMNS]);
 const row=lines[1].split(',');
 assert.equal(row[2],'node_000001');
 assert.equal(row[9],'1');
 assert.equal(row[13],'STAY');
 assert.ok(Number(row[14])>0);
 assert.ok(Math.abs(Number(row[15])-.1)<1e-5);
 assert.ok(Math.abs(Number(row[17])+.1)<1e-5);
});
test('rejects disconnected route, invalid address, invalid successor, non-finite metric and empty trace',()=>{
 const f=fixture();
 assert.throws(()=>exportTraversalCsvR838(f,[0,3]),/successor chain/);
 assert.throws(()=>exportTraversalCsvR838(f,[20736]),/Invalid route/);
 assert.throws(()=>exportTraversalCsvR838(f,[]),/nonempty/);
 f.routeNext[0]=20736;
 assert.throws(()=>exportTraversalCsvR838(f,[0]),/Invalid route/);
 f.routeNext[0]=1;f.C[0]=NaN;
 assert.throws(()=>exportTraversalCsvR838(f,[0]),/Non-finite/);
});
