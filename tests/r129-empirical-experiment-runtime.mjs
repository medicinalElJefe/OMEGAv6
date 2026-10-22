import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {semanticReplayHashR128} from '../src/validation/empiricalCalibrationReplayR128.ts';

const dir=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r129-'));
const input=path.join(dir,'experiment.json');
const out=path.join(dir,'out');
const mk=(id,split,score,label,extra={})=>({id,datasetId:'external-r129',datasetClass:'EXTERNAL',source:'external-test-source',sourceFamily:'lab-a',split,score,label,provenanceHash:'a'.repeat(64),...extra});
const examples=[
 mk('c1','CALIBRATION',.9,1),mk('c2','CALIBRATION',.8,1),mk('c3','CALIBRATION',.2,0),mk('c4','CALIBRATION',.1,0),
 ...Array.from({length:20},(_,i)=>i<10?mk(`h${i}`,'HOLDOUT',.8,1,{sourceFamily:'lab-b'}):mk(`h${i}`,'HOLDOUT',.2,0,{sourceFamily:'lab-b'}))
];
const base={experimentId:'r129-e2e',modelId:'candidate-1',claim:'external binary fixture',examples,policy:{minExternalHoldout:20,minF1:.9,maxBrier:.1,maxCalibrationError:.25,requireReproduction:true}};
const semanticHash=semanticReplayHashR128(base);
base.reproductionReceipts=[
 {id:'v1',targetSemanticHash:semanticHash,sourceFamily:'validator-a',verdict:'PASS',reproducible:true,independent:true,observedAt:'2026-09-06T19:00:00Z'},
 {id:'v2',targetSemanticHash:semanticHash,sourceFamily:'validator-b',verdict:'PASS',reproducible:true,independent:true,observedAt:'2026-09-06T19:01:00Z'}
];
fs.writeFileSync(input,JSON.stringify(base,null,2));
const run=spawnSync(process.execPath,['--experimental-strip-types','scripts/r129-empirical-experiment.mjs','--input',input,'--out',out,'--verify-replay'],{encoding:'utf8'});
assert.equal(run.status,0,run.stderr||run.stdout);
const result=JSON.parse(run.stdout);
assert.equal(result.ok,true);
assert.equal(result.status,'VALIDATED');
assert.equal(result.canonicalMutation,false);
for(const name of ['experiment.normalized.json','validation.receipt.json','replay.capsule.json','ledger.json','manifest.json'])assert.equal(fs.existsSync(path.join(out,name)),true,`${name} missing`);
const ledger=JSON.parse(fs.readFileSync(path.join(out,'ledger.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
assert.equal(ledger.semanticHash,semanticHash);
assert.equal(ledger.validationStatus,'VALIDATED');
assert.equal(ledger.boundaries.syntheticExternalValidationCredit,0);
assert.equal(ledger.canonicalMutation,false);
assert.equal(manifest.semanticHash,semanticHash);
assert.equal(manifest.files.length,4);
for(const f of manifest.files){
 const data=fs.readFileSync(path.join(out,f.name),'utf8');
 const hash=crypto.createHash('sha256').update(data).digest('hex');
 assert.equal(hash,f.sha256);
 assert.equal(Buffer.byteLength(data),f.bytes);
}
const replayInput=JSON.parse(fs.readFileSync(path.join(out,'experiment.normalized.json'),'utf8'));
assert.equal(semanticReplayHashR128(replayInput),semanticHash);

const noInput=spawnSync(process.execPath,['--experimental-strip-types','scripts/r129-empirical-experiment.mjs'],{encoding:'utf8'});
assert.equal(noInput.status,2);
assert.match(noInput.stderr,/Usage:/);
console.log('R129 empirical experiment runtime: PASS');
