import fs from 'node:fs';
const load=(n)=>JSON.parse(fs.readFileSync(new URL(`../public/${n}`,import.meta.url)));
const packet=load('omega-packet.schema.json');
const queue=load('omega-fullwave-queue.schema.json');
const result=load('omega-result.schema.json');
if(packet.$id!=='OMEGA_PACKET_v1')throw new Error('packet schema id');
if(queue.$id!=='OMEGA_FULLWAVE_QUEUE_v1')throw new Error('queue schema id');
if(result.$id!=='OMEGA_RESULT_v1')throw new Error('result schema id');
for(const k of ['domain','phase','regulation','seed']){
 const p=packet.properties.atlas_address.properties[k];
 if(p.minimum!==0||p.maximum!==11)throw new Error(`atlas range ${k}`);
}
if(!queue.properties.solver.enum.includes('rcwa')||!queue.properties.solver.enum.includes('fdtd'))throw new Error('tier2 routes');
if(!result.required.includes('convergence_metrics')||!result.required.includes('solver_version'))throw new Error('full-wave proof metadata');
console.log('OMEGA federation schemas PASS');
