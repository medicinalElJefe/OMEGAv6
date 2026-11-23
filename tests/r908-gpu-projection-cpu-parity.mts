import assert from 'node:assert/strict';
import {
 R908_SCHEMA,R908_COUNT,R908_WORKGROUP,R908_ALPHABET,R908_WGSL,
 decodeR907GridR908,cpuProjectionReferenceR908,compareProjectionR908,
 executeR908GpuProjection
} from '../src7/workspaces/omegaR908GpuProjection.ts';

assert.equal(R908_SCHEMA,'OMEGA_R908_GPU_PROJECTION_PARITY');
assert.equal(R908_COUNT,20736);
assert.equal(R908_WORKGROUP,64);
assert.equal(R908_COUNT/R908_WORKGROUP,324);
assert.match(R908_WGSL, /dispatchWorkgroups|workgroup_size\(64\)/);
assert.match(R908_WGSL,/i>=20736u/);
let grid=Array.from({length:R908_COUNT},(_,i)=>R908_ALPHABET[i%64]).join('');
const levels=decodeR907GridR908(grid);
assert.equal(levels.length,R908_COUNT);
for(let i=0;i<64;i++)assert.equal(levels[i],i);
const cpu=cpuProjectionReferenceR908(levels);
assert.equal(cpu.length,R908_COUNT);
assert.equal(cpu[0],(22|(42<<8)|(59<<16)|(255<<24))>>>0);
assert.equal(cpu[63],(94|(218<<8)|(197<<16)|(255<<24))>>>0);
assert.deepEqual(compareProjectionR908(cpu,new Uint32Array(cpu)),{
 ok:true,mismatches:0,firstMismatch:-1,compared:20736
});
const changed=new Uint32Array(cpu);changed[103]=0;
assert.equal(compareProjectionR908(cpu,changed).mismatches,1);
assert.equal(compareProjectionR908(cpu,changed).firstMismatch,103);
for(const bad of ['',grid+'A','?'.repeat(R908_COUNT)]){
 assert.throws(()=>decodeR907GridR908(bad),/R908_GRID/);
}
const invalid=new Uint32Array(levels);invalid[8]=64;
assert.throws(()=>cpuProjectionReferenceR908(invalid),/R908_INTENSITY_BOUND_HELD/);
const fallback=await executeR908GpuProjection(grid);
assert.equal(fallback.schema,R908_SCHEMA);
assert.equal(fallback.physicalPcAccepted,false);
assert.equal(fallback.nativePcAccepted,false);
assert.equal(fallback.canonicalStateMutated,false);
assert.equal(fallback.deviceExecutionProved,false);
assert.equal(fallback.state,'GPU_UNAVAILABLE');
console.log('R908 GPU PROJECTION CPU PARITY PASS: exact 20,736-address integer color reference and fail-closed hardware-unavailable scope.');
