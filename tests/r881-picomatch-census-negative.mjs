import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';

const original=fs.readFileSync('package-lock.json','utf8');
const base=JSON.parse(original);
const entries=Object.entries(base.packages);
const copies=entries.filter(([path])=>/(?:^|\/)node_modules\/picomatch$/.test(path));
assert.ok(copies.length>=1,'Must have a known vulnerable path to test negative tampering');
const originalCensus=fs.readFileSync('tests/r881-picomatch-exposure-census.mjs','utf8');
const path=copies[0][0];
const variants=[
 ['production promotion',lock=>{lock.packages[path].dev=false}],
 ['integrity stripped',lock=>{delete lock.packages[path].integrity}],
 ['missing copy',lock=>{for(const [p] of copies)delete lock.packages[p]}],
 ['missing vite',lock=>{delete lock.packages['node_modules/vite']}]
];
for(const [name,mutate] of variants){
 const lock=structuredClone(base);mutate(lock);
 const context={console:{log(){}},JSON,assert,fs:{readFileSync:(file)=>file==='package-lock.json'?JSON.stringify(lock):originalCensus},process:{exitCode:0}};
 let rejected=false;
 try{vm.runInNewContext(originalCensus.replace(/^import .*;$/gm,''),context,{filename:'r881-census-negative.mjs'})}catch(e){rejected=true}
 assert.equal(rejected,true,`R881 must reject ${name}`);
}
const normal=spawnSync(process.execPath,['tests/r881-picomatch-exposure-census.mjs'],{encoding:'utf8'});
assert.equal(normal.status,0,normal.stderr);
const report=JSON.parse(normal.stdout);
assert.equal(report.status,'OPEN_NO_UPSTREAM_PATCH');
assert.equal(report.productionReachableInLock,false);
assert.equal(report.devToolchainAffected,true);
console.log('R881 negative tests PASS: production promotion, integrity removal, missing copies and missing Vite are refused');
