import fs from 'node:fs';
const h=JSON.parse(fs.readFileSync(new URL('../public/omega-node-health.schema.json',import.meta.url)));
if(h.$id!=='OMEGA_NODE_HEALTH_v1')throw new Error('health schema id');
for(const s of ['ready','degraded','offline','maintenance'])if(!h.properties.status.enum.includes(s))throw new Error(`health state ${s}`);
for(const n of ['omega-v6','omega-genesis','omega-optical','omega-sovereign'])if(!h.properties.node.enum.includes(n))throw new Error(`node ${n}`);
console.log('OMEGA node health schema PASS');
