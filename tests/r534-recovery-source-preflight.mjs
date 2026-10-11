import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {verifyRecoverySourcesR534} from '../scripts/r534-recovery-source-preflight.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'omega-r534-'));
try{
 const name='recovered-source.svg',bytes='<svg xmlns="http://www.w3.org/2000/svg"></svg>';
 fs.writeFileSync(path.join(root,name),bytes);
 const sha256=createHash('sha256').update(bytes).digest('hex');
 const good=verifyRecoverySourcesR534({root,sources:[{path:name,sha256}]});
 assert.equal(good.status,'SOURCE_VERIFIED');
 assert.equal(good.executionClaimed,false);
 assert.equal(good.results[0].historicalParityClaimed,false);
 assert.equal(verifyRecoverySourcesR534({root,sources:[]}).status,'HELD');
 assert.equal(verifyRecoverySourcesR534({root,sources:[{path:name,sha256:'0'.repeat(64)}]}).results[0].status,'HELD');
 assert.equal(verifyRecoverySourcesR534({root,sources:[{path:'../escape',sha256}]}).results[0].status,'HELD');
 assert.equal(verifyRecoverySourcesR534({root,sources:[{path:'missing.svg',sha256}]}).results[0].status,'HELD');
 fs.symlinkSync(name,path.join(root,'alias.svg'));
 assert.equal(verifyRecoverySourcesR534({root,sources:[{path:'alias.svg',sha256}]}).results[0].status,'HELD');
 fs.mkdirSync(path.join(root,'real'));
 fs.writeFileSync(path.join(root,'real','source.svg'),bytes);
 fs.symlinkSync('real',path.join(root,'linked'));
 assert.equal(verifyRecoverySourcesR534({root,sources:[{path:'linked/source.svg',sha256}]}).results[0].status,'HELD');
}finally{fs.rmSync(root,{recursive:true,force:true})}
console.log('R534 source hash preflight PASS');
