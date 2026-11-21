import assert from 'node:assert/strict';
import fs from 'node:fs';

const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const root=lock.packages?.[''];
assert.ok(root&&lock.lockfileVersion===3,'Require auditable npm v3 lockfile');
const entries=Object.entries(lock.packages);
const affected=entries.filter(([path])=>/(?:^|\/)node_modules\/picomatch$/.test(path));
assert.ok(affected.length,'Picomatch census must find installed copies, not silently pass on missing lock metadata');
const exposures=affected.map(([path,pkg])=>({path,version:pkg.version,dev:pkg.dev===true,integrity:typeof pkg.integrity==='string'&&pkg.integrity.startsWith('sha512-')}));
for(const e of exposures){
 assert.ok(e.version&&e.integrity,`Missing integrity/version for ${e.path}`);
 assert.equal(e.dev,true,`Production dependency now contains vulnerable picomatch: ${e.path}`);
}
for(const name of ['vite','tinyglobby','fdir']){
 const packages=entries.filter(([path])=>path.endsWith('/node_modules/'+name)||path==='node_modules/'+name);
 assert.ok(packages.length,`Expected dependency chain ${name} missing; review exposure model`);
 for(const [path,pkg] of packages)assert.equal(pkg.dev,true,`Production dependency exposure: ${path}`);
}
const result={schema:'OMEGA_R881_DEPENDENCY_EXPOSURE_CENSUS',advisory:'GHSA-fc5q-39xc-vjpf',status:'OPEN_NO_UPSTREAM_PATCH',productionReachableInLock:false,devToolchainAffected:true,affectedCopies:exposures,warning:'Not a vulnerability waiver or deployment authorization; npm audit must still pass or receive explicit governed exception'};
console.log(JSON.stringify(result,null,2));
