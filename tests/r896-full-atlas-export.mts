import assert from 'node:assert/strict';
import {getMandala20736Field} from '../src/mandala20736Runtime';
import {exportFullAtlasCsvR896,inspectAtlasAddressR897,traceAtlasRouteR899,exportAtlasRouteCsvR900,summarizeAtlasRouteR901,compareAtlasRoutesR902} from '../src7/workspaces/omegaFullAtlasExportR896';

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

for(const address of [0,11498,20735]){
 const inspected=inspectAtlasAddressR897(field,address);
 assert.equal(inspected.length,22);
 assert.equal(inspected.find(item=>item.name==='routeNext')?.value,field.routeNext[address]);
 for(const item of inspected)assert.equal(item.value,(field as unknown as Record<string,ArrayLike<number>>)[item.name][address]);
}
assert.throws(()=>inspectAtlasAddressR897(field,-1),/0–20735/);
assert.throws(()=>inspectAtlasAddressR897(field,20736),/0–20735/);
assert.throws(()=>inspectAtlasAddressR897(field,1.5),/0–20735/);
assert.throws(()=>inspectAtlasAddressR897({...field,C:new Float32Array(1)},0),/Incomplete Atlas/);
assert.throws(()=>inspectAtlasAddressR897({...field,routeNext:corrupted},12),/Invalid route target/);
console.log('R897: compiled Atlas address inspection and route navigation validated');

const trace=traceAtlasRouteR899(field,11498,128);
assert.ok(trace.addresses.length>=1&&trace.addresses.length<=128);
assert.equal(trace.addresses[0],11498);
for(let i=1;i<trace.addresses.length;i++)assert.equal(trace.addresses[i],field.routeNext[trace.addresses[i-1]]);
assert.equal(new Set(trace.addresses).size,trace.addresses.length);
assert.equal(trace.truncated,trace.cycleAt===null);
if(trace.cycleAt!==null)assert.equal(field.routeNext[trace.addresses.at(-1)!],trace.addresses[trace.cycleAt]);
assert.throws(()=>traceAtlasRouteR899(field,0,0),/1–256/);
assert.throws(()=>traceAtlasRouteR899(field,0,257),/1–256/);
assert.throws(()=>traceAtlasRouteR899(field,-1,2),/0–20735/);
const selfRoute=new Uint32Array(field.routeNext);selfRoute[12]=12;
assert.deepEqual(traceAtlasRouteR899({...field,routeNext:selfRoute},12,4),{addresses:[12],cycleAt:0,truncated:false});
assert.throws(()=>traceAtlasRouteR899({...field,routeNext:corrupted},12,4),/Invalid route target/);
console.log('R899: bounded route execution, cycle detection and invalid targets validated');

const routeCsv=exportAtlasRouteCsvR900(field,trace);
const routeRows=routeCsv.trimEnd().split('\n');
assert.equal(routeRows.length,trace.addresses.length+1);
assert.equal(routeRows[0].split(',').length,26);
for(let i=0;i<trace.addresses.length;i++){
 const values=routeRows[i+1].split(',');
 assert.equal(Number(values[0]),i+1);
 assert.equal(Number(values[1]),trace.addresses[i]);
 assert.equal(Number(values[routeRows[0].split(',').indexOf('routeNext')]),field.routeNext[trace.addresses[i]]);
}
const cycle=traceAtlasRouteR899({...field,routeNext:selfRoute},12,4);
assert.equal(exportAtlasRouteCsvR900({...field,routeNext:selfRoute},cycle).split('\n')[1].split(',').at(-2),'1');
assert.throws(()=>exportAtlasRouteCsvR900(field,{...trace,addresses:[12,12]}),/repeats|Discontinuous/);
assert.throws(()=>exportAtlasRouteCsvR900(field,{...trace,cycleAt:256}),/Invalid cycle index/);
console.log('R900: full-field route CSV and cycle metadata validated');

const topology=summarizeAtlasRouteR901(field,trace);
assert.equal(topology.visited,trace.addresses.length);
assert.equal(topology.cycleLength,trace.cycleAt===null?null:trace.addresses.length-trace.cycleAt);
assert.equal(topology.transientLength,trace.cycleAt);
assert.ok(Number.isFinite(topology.meanStepDistance)&&topology.meanStepDistance>=0);
assert.ok(Number.isFinite(topology.maxStepDistance)&&topology.maxStepDistance>=topology.meanStepDistance);
const oneState=summarizeAtlasRouteR901({...field,routeNext:selfRoute},cycle);
assert.deepEqual(oneState,{visited:1,cycleLength:1,transientLength:0,meanStepDistance:0,maxStepDistance:0});
assert.throws(()=>summarizeAtlasRouteR901(field,{...trace,addresses:[12,12]}),/repeats|Discontinuous/);
console.log('R901: validated cycle topology and model-coordinate displacement summary');

const overlap=compareAtlasRoutesR902({...field,routeNext:selfRoute},cycle,cycle);
assert.deepEqual(overlap,{sharedAddresses:1,firstOnly:0,secondOnly:0,firstSharedStep:1,secondSharedStep:1,commonPrefix:1,firstCycleLength:1,secondCycleLength:1});
const otherRoute=new Uint32Array(field.routeNext);otherRoute[13]=13;
const disjoint=compareAtlasRoutesR902({...field,routeNext:otherRoute}, {addresses:[12],cycleAt:null,truncated:true},{addresses:[13],cycleAt:0,truncated:false});
assert.equal(disjoint.sharedAddresses,0);
assert.equal(disjoint.firstSharedStep,null);
assert.equal(disjoint.commonPrefix,0);
assert.throws(()=>compareAtlasRoutesR902(field,{...trace,addresses:[12,12]},trace),/repeats|Discontinuous/);
console.log('R902: independent route overlap, disjoint sets and malformed-route rejection');
