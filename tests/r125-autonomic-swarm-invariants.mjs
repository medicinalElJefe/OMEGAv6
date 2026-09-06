import assert from 'node:assert/strict';
import fs from 'node:fs';
import {inferAutonomicProjectionR125,planAutonomicMissionR125} from '../src/swarm/swarmAutonomicR125.js';

assert.equal(inferAutonomicProjectionR125('repair and deploy the repository'),'BUILD');
assert.equal(inferAutonomicProjectionR125('screen an optical RCWA candidate'),'OPTICAL');
assert.equal(inferAutonomicProjectionR125('forecast weather terrain'),'EARTH');

const stay=planAutonomicMissionR125({intent:'stable field review',metrics:{continuity:.95,burden:.2,contradiction:.1},providerBudget:0});
assert.equal(stay.decision,'STAY');
assert.equal(stay.totalCells,24);
assert.equal(stay.scope.type,'BODY');

const escalate=planAutonomicMissionR125({intent:'high contradiction field review',metrics:{continuity:.1,burden:.8,contradiction:.8},providerBudget:12});
assert.equal(escalate.decision,'ESCALATE');
assert.equal(escalate.totalCells,288,'AUTO escalation must not silently spend the entire 1,728-cell body');
assert.equal(escalate.budgets.providerTotal,12);
assert.equal(escalate.budgets.providerCells,11);
assert.equal(escalate.budgets.reconvergence,1);
assert.ok(escalate.cells.filter(x=>x.executor==='WORKERS_AI').length<=11);

const full=planAutonomicMissionR125({intent:'explicit full body proof-bound pass',mode:'FULL',providerBudget:0});
assert.equal(full.totalCells,1728);
assert.equal(new Set(full.cells.map(x=>x.id)).size,1728);
const autoFull=planAutonomicMissionR125({intent:'explicitly permit full auto',allowFullAuto:true,metrics:{continuity:.05,burden:.9,contradiction:.9},providerBudget:0});
assert.equal(autoFull.totalCells,1728);

const organ=planAutonomicMissionR125({intent:'detach software organ',scope:{type:'ORGAN',domain:1},providerBudget:0});
assert.equal(organ.detached,true);
assert.equal(organ.totalCells,144);
assert.ok(organ.cells.every(x=>x.address.domain===1));
const branch=planAutonomicMissionR125({intent:'detach physics execute branch',scope:{type:'BRANCH',domain:4,phase:9},providerBudget:0});
assert.equal(branch.totalCells,12);
assert.ok(branch.cells.every(x=>x.address.domain===4&&x.address.phase===9));
const cell=planAutonomicMissionR125({intent:'isolate one proof cell',scope:{type:'CELL',domain:10,phase:11,regulation:3},providerBudget:0});
assert.equal(cell.totalCells,1);
assert.equal(cell.cells[0].address.domain,10);
assert.equal(cell.cells[0].address.phase,11);
assert.equal(cell.cells[0].address.regulation,3);

const build=planAutonomicMissionR125({intent:'build and deploy a software repair',providerBudget:0});
assert.equal(build.projection,'BUILD');
assert.equal(build.buildCapsule?.status,'PROPOSED_NOT_EXECUTED');
assert.equal(build.buildCapsule?.authority,'SELF_BUILD_CANDIDATE_NOT_ADMITTED');

const worker=fs.readFileSync('src/workerR116.js','utf8');
const api=fs.readFileSync('src/swarm/swarmApiR121.js','utf8');
const auto=fs.readFileSync('src/swarm/swarmAutonomicR125.js','utf8');
const wrangler=fs.readFileSync('wrangler.jsonc','utf8');
const ui=fs.readFileSync('src/OmegaAutonomicR125.tsx','utf8');
const suite=fs.readFileSync('src/OmegaSpecialistSuite.tsx','utf8');
assert.ok(worker.includes('OmegaSwarmAutonomicCoordinator'));
assert.ok(wrangler.includes('OMEGA_SWARM_AUTONOMIC'));
assert.ok(auto.includes("AUTONOMIC_REVISION='R125'"),'autonomic runtime provenance must remain R125 after Cloudflare lifecycle reconciliation');
assert.ok(wrangler.includes('"OmegaSwarmAutonomicCoordinator": {"type": "durable-object", "storage": "sqlite"}'),'the R125 autonomic Durable Object namespace must remain live on its existing SQLite backend under declarative exports');
assert.ok(wrangler.includes('"main": "src/workerR116.js"'));
for(const route of ['/api/swarm/autonomic/manifest','/api/swarm/autonomic/status','/api/swarm/autonomic/plan','/api/swarm/autonomic/missions'])assert.ok(api.includes(route),`missing autonomic route ${route}`);
for(const term of ['rejoin','checkpoint','pause','resume','cancel'])assert.ok(auto.includes(`parts[2]==='${term}'`)||auto.includes(`parts[2]===\'${term}\'`),`missing autonomic ${term}`);
for(const truth of ['EXECUTION_QUORUM_NOT_TRUTH','AUTONOMIC_RECEIPT_NOT_CANON','RETURNED_NOT_ADMITTED','SWARM_RECEIPT_RETURNED_NOT_ADMITTED','canonicalMutation:false'])assert.ok(auto.includes(truth),`missing authority boundary ${truth}`);
assert.ok(auto.includes("this.env.OMEGA_SWARM_ORGANISM"),'rejoin must route through the existing organism root');
assert.ok(auto.includes('allowFullAuto===true'),'full-auto must require explicit opt in');
assert.ok(ui.includes('Route the body. Detach a limb. Rejoin with receipts.'));
assert.ok(ui.includes('PREVIEW ROUTE')&&ui.includes('EXECUTE ROUTE')&&ui.includes('CHECKPOINT')&&ui.includes('REJOIN BODY'));
assert.ok(suite.includes('OmegaAutonomicR125'));
console.log('R125 autonomic swarm invariants PASS · R125 provenance preserved under declarative SQLite lifecycle exports');