import assert from 'node:assert/strict';
import fs from 'node:fs';

const stripJsonComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const cfg=JSON.parse(stripJsonComments(fs.readFileSync('wrangler.jsonc','utf8')));
const worker=fs.readFileSync('src/workerR116.js','utf8');
const expected=[
 ['OMEGA_RUNTIME','OmegaRuntime'],
 ['OMEGA_SWARM_CELL','OmegaSwarmCell'],
 ['OMEGA_SWARM_COORDINATOR','OmegaSwarmCoordinator'],
 ['OMEGA_SWARM_BRANCH','OmegaSwarmBranch'],
 ['OMEGA_SWARM_ORGAN','OmegaSwarmOrgan'],
 ['OMEGA_SWARM_ORGANISM','OmegaSwarmOrganismCoordinator'],
 ['OMEGA_SWARM_AUTONOMIC','OmegaSwarmAutonomicCoordinator']
];

assert.equal(cfg.name,'omegav6');
assert.equal(cfg.main,'src/workerR116.js');
assert.equal('migrations' in cfg,false,'R134.1 must not mix legacy migrations with declarative exports');
assert.equal(typeof cfg.exports,'object','declarative Durable Object exports map missing');
assert.equal(Object.keys(cfg.exports).length,expected.length,'exports map must exactly cover the seven currently provisioned OMEGA Durable Object classes');

for(const [binding,className] of expected){
 const bound=cfg.durable_objects?.bindings?.find(x=>x.name===binding);
 assert.ok(bound,`missing Durable Object binding ${binding}`);
 assert.equal(bound.class_name,className,`${binding} points at unexpected class`);
 assert.deepEqual(cfg.exports[className],{type:'durable-object',storage:'sqlite'},`${className} must remain a live SQLite declarative export`);
 assert.ok(worker.includes(className),`worker entrypoint does not expose ${className}`);
}
assert.ok(worker.includes('export class OmegaRuntime extends OmegaRuntimeR115'),'OmegaRuntime successor export missing from production entrypoint');
for(const className of expected.slice(1).map(x=>x[1]))assert.ok(worker.includes(`export {OmegaSwarmCell,OmegaSwarmCoordinator,OmegaSwarmBranch,OmegaSwarmOrgan,OmegaSwarmOrganismCoordinator,OmegaSwarmAutonomicCoordinator}`),`swarm Durable Object exports missing while checking ${className}`);

console.log('OMEGA R134.1 CLOUDFLARE DO EXPORTS PASS · seven provisioned SQLite namespaces declaratively mirrored · no migrations/exports split-brain · bindings and worker exports aligned');
