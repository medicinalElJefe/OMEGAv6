import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const activeDir='.github/workflows';
const core=new Set([
  'ci.yml',
  'r168-1-rcwa-byte-diagnostic.yml',
  'r168-genesis-r192-attestation.yml',
  'r169-federation-attestation-world-lens.yml',
  'r170-current-convergence.yml',
  'r170-governed-selfbuild.yml'
]);
const maintenanceOnly=new Set(['r2461-legacy-ref-cleanup.yml']);
const active=fs.readdirSync(activeDir).filter(x=>/\.ya?ml$/i.test(x)).sort();
const successors=[];
for(const name of active){
  if(core.has(name)||maintenanceOnly.has(name))continue;
  const match=name.match(/^r(\d+)(?:[-.].*)?\.ya?ml$/i);
  assert.ok(match,`successor workflow name does not expose revision: ${name}`);
  const revision=Number(match[1]);
  assert.ok(revision>170,`non-successor workflow leaked into dynamic proof set: ${name}`);
  const text=fs.readFileSync(path.join(activeDir,name),'utf8');
  const refs=[...text.matchAll(/\bnode\s+(tests\/[A-Za-z0-9._/-]+\.mjs)\b/g)].map(m=>m[1]);
  const unique=[...new Set(refs)];
  const own=unique.find(p=>new RegExp(`(^|/)r${revision}(?:[-.]|$)`,'i').test(p));
  assert.ok(own,`${name} must declare a focused R${revision} invariant test`);
  assert.equal(fs.existsSync(own),true,`${name} focused invariant test missing: ${own}`);
  successors.push({name,revision,test:own});
}

for(const name of maintenanceOnly){
  if(!active.includes(name))continue;
  const text=fs.readFileSync(path.join(activeDir,name),'utf8');
  assert.match(text,/R246\.1 Legacy Autonomous Ref Cleanup/,'maintenance workflow identity drift');
  assert.match(text,/OMEGA_R2461_LEGACY_AUTONOMOUS_REF_CLEANUP_V1/,'maintenance workflow must self-prove exact R246.1 policy');
  assert.ok(!/^\s*schedule\s*:/m.test(text),`${name} may not enter recurring successor execution`);
}

successors.sort((a,b)=>a.revision-b.revision||a.name.localeCompare(b.name));
for(const successor of successors){
  console.log(`PROVE SUCCESSOR R${successor.revision}: ${successor.test}`);
  const result=spawnSync(process.execPath,[successor.test],{stdio:'inherit',env:process.env});
  if(result.error)throw result.error;
  assert.equal(result.status,0,`${successor.name} focused invariant failed with status ${result.status}`);
}
console.log(JSON.stringify({schema:'OMEGA_SUCCESSOR_WORKFLOW_PROOF_R175',successorCount:successors.length,maintenanceOnly:[...maintenanceOnly].filter(x=>active.includes(x)),successors,result:'PASS'},null,2));
