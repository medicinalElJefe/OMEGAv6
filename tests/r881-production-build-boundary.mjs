import assert from 'node:assert/strict';
import fs from 'node:fs';
const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
assert.equal(lock.lockfileVersion,3);
const root=lock.packages[''];
for(const [name,range] of Object.entries(manifest.dependencies||{}))assert.equal(root.dependencies?.[name],range,`Lock root mismatch: ${name}`);
for(const [name,range] of Object.entries(manifest.devDependencies||{}))assert.equal(root.devDependencies?.[name],range,`Dev lock root mismatch: ${name}`);
const affected=Object.entries(lock.packages).filter(([p])=>/(?:^|\/)node_modules\/picomatch$/.test(p));
assert.ok(affected.length>0,'Expected advisory exposure must not silently disappear without review');
for(const [path,pkg] of affected){
 assert.equal(pkg.dev,true,`Refuse production picomatch: ${path}`);
 assert.match(pkg.integrity||'',/^sha512-/,`Refuse missing integrity: ${path}`);
}
const vite=lock.packages['node_modules/vite'];
assert.ok(vite&&vite.dev===true,'Vite must remain build-only');
const report={schema:'R881_PRODUCTION_BUILD_BOUNDARY_V1',advisory:'GHSA-fc5q-39xc-vjpf',runtimeDependencies:Object.keys(manifest.dependencies||{}),buildTool:'vite',buildToolVersion:vite.version,affectedBuildPackages:affected.map(([path,pkg])=>({path,version:pkg.version})),runtimeExposureInNpmLock:false,buildToolExposure:true,releaseAuthorized:false};
console.log(JSON.stringify(report,null,2));
