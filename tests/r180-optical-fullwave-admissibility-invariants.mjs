import assert from 'node:assert/strict';
import fs from 'node:fs';
import machine,{R1533_MACHINE_VERSION,R1533_MACHINE_SERVICE,R1533_INHERITED_SCREEN_SERVICE,R1533_MACHINE_AUTHORITY} from '../services/opticalMachineR1533.js';

const get=async path=>{const response=await machine.fetch(new Request('https://r180.test'+path));return{response,json:await response.json()}};
const post=async(path,body)=>{const response=await machine.fetch(new Request('https://r180.test'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));return{response,json:await response.json()}};

assert.equal(R1533_MACHINE_VERSION,'R153.3');
assert.equal(R1533_MACHINE_SERVICE,'omega-optical-machine-r1533');
assert.notEqual(R1533_MACHINE_SERVICE,R1533_INHERITED_SCREEN_SERVICE,'R153.3 service identity must not collapse into inherited R152 screen service');
assert.equal(R1533_MACHINE_AUTHORITY,'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');

const health=await get('/api/health');
assert.equal(health.response.status,200);
assert.equal(health.response.headers.get('x-omega-machine-service'),R1533_MACHINE_SERVICE);
assert.equal(health.response.headers.get('x-omega-machine-version'),'R153.3');
assert.equal(health.response.headers.get('x-omega-inherited-screen-service'),R1533_INHERITED_SCREEN_SERVICE);
assert.equal(health.json.service,R1533_MACHINE_SERVICE);
assert.equal(health.json.machineVersion,'R153.3');
assert.equal(health.json.externalTool?.version,'R153.3');
assert.equal(health.json.externalTool?.fullwaveAdmissibility,true);
assert.equal(health.json.externalTool?.fullwaveExecution,false);
assert.equal(health.json.externalTool?.canonicalMutation,false);

const descriptor=await get('/api/tool/descriptor');
assert.equal(descriptor.json.version,'R153.3');
assert.equal(descriptor.json.authority,'SCREEN_ONLY_WITH_FULLWAVE_ADMISSIBILITY_GATE');
assert.ok(descriptor.json.operations?.fullwave_admissibility);
assert.ok(descriptor.json.operations?.prepare_robust_fullwave);

const scalarWinner={pitch_nm:304,width_nm:137,length_nm:304,height_nm:572,orientation_deg:90,material:'TIO2_DESIGN_NOMINAL_ON_SIO2_FUSED'};
const gate=await post('/api/tool/admissibility',{geometry:scalarWinner,engineering_ratio:0.93});
assert.equal(gate.response.status,200);
assert.equal(gate.json.ok,true);
assert.equal(gate.json.receipt?.service,R1533_MACHINE_SERVICE);
assert.equal(gate.json.receipt?.tool_version,'R153.3');
assert.equal(gate.json.receipt?.canonical_mutation,false);
assert.equal(gate.json.result?.admissibility?.r41?.valid,false);
assert.equal(gate.json.result?.admissibility?.status,'FULLWAVE_GEOMETRY_REFINEMENT_REQUIRED');
assert.ok(gate.json.result?.admissibility?.projections?.length>=2);

const queue=await post('/api/tool/robust-queue',{geometry:scalarWinner,wavelengths_nm:[470,532,650],tolerance_nm:5,phase_margin_deg:6,engineering_ratio:0.93});
assert.equal(queue.response.status,200);
assert.equal(queue.json.ok,true);
assert.equal(queue.json.receipt?.service,R1533_MACHINE_SERVICE);
assert.equal(queue.json.result?.robust_job?.state,'MANIFOLD_REFINEMENT_PREPARED_NOT_SOLVED');
assert.equal(queue.json.result?.robust_job?.authority,'PREPARED_NOT_SOLVED');
assert.equal(queue.json.result?.robust_job?.canonical_mutation,false);
assert.equal(queue.json.result?.robust_job?.bridge,'sovereign/omega_fullwave_manifold_r1533.py');

const config=fs.readFileSync('wrangler.optical-machine-r1533.jsonc','utf8');
assert.match(config,/"name"\s*:\s*"omega-optical-machine-r1533"/);
assert.match(config,/"main"\s*:\s*"services\/opticalMachineR1533\.js"/);
const bridge=fs.readFileSync('sovereign/omega_fullwave_manifold_r1533.py','utf8');
for(const needle of ['OMEGA_FULLWAVE_MANIFOLD_R1533','R41_CELL_RATIO = 0.95','projection_family','stress'])assert.ok(bridge.includes(needle),`R153.3 bridge missing ${needle}`);

const workflow=fs.readFileSync('.github/workflows/r180-optical-fullwave-admissibility.yml','utf8');
assert.match(workflow,/permissions:\s*\n\s+contents:\s*read/);
function topLevelTriggerBlock(text,trigger){
 const lines=text.split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  if(lines[i].trim()!==trigger+':'||lines[i].match(/^\s*/)?.[0].length!==2)continue;
  const out=[lines[i]];
  for(let j=i+1;j<lines.length;j++){
   const line=lines[j];if(!line.trim()){out.push(line);continue}
   const indent=line.match(/^\s*/)?.[0].length||0;if(indent<=2)break;out.push(line);
  }
  return out.join('\n');
 }
 return '';
}
const pushBlock=topLevelTriggerBlock(workflow,'push');
assert.ok(pushBlock,'R180 workflow must expose isolated feature-branch push proof');
const branchMatch=pushBlock.match(/branches:\s*\[([^\]]+)\]/);
assert.ok(branchMatch,'R180 push proof branch list missing');
const pushBranches=branchMatch[1].split(',').map(x=>x.trim().replace(/^['"]|['"]$/g,''));
assert.ok(!pushBranches.includes('main'),'R180 successor must not push-trigger on literal main');
assert.deepEqual(pushBranches,['r180-optical-fullwave-admissibility-current-main']);
assert.ok(!/^\s*schedule\s*:/m.test(workflow));
assert.ok(!/contents:\s*write/i.test(workflow));
assert.ok(!/gh\s+pr\s+merge/i.test(workflow));
assert.ok(!/git\s+push\s+origin\s+HEAD:main/i.test(workflow));

console.log('R180 OPTICAL FULLWAVE ADMISSIBILITY INTEGRATION PASS · R153.3 identity separated from inherited R152 · manifold gate deterministic · full-wave remains PREPARED_NOT_SOLVED until sovereign grcwa proof');
