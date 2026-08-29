import fs from 'node:fs';

const vite=fs.readFileSync('vite.config.ts','utf8');
const panel=fs.readFileSync('src/GovernedBuildReceiptPanel.tsx','utf8');
const buildout=fs.readFileSync('src/WovenBuildOutPanel.tsx','utf8');
const writer=fs.readFileSync('scripts/write-build-receipt.mjs','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
function ok(v,msg){if(!v)throw new Error(msg)}
function semverAtLeast(v,min){const a=v.split('.').map(Number),b=min.split('.').map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return true;if((a[i]||0)<(b[i]||0))return false}return true}
ok(vite.includes('OMEGA_GOVERNED_BUILD_RECEIPT_V1'),'Vite package must emit governed receipt schema');
ok(vite.includes("publicWorkerMutationAuthority:false"),'receipt must deny Worker mutation authority');
ok(vite.includes("appDeploy:false"),'receipt must remain AppDeploy-free');
ok(vite.includes("GITHUB_SHA"),'receipt must bind exact GitHub source SHA');
ok(panel.includes("/omega-build-receipt.json"),'Development must read the packaged receipt');
ok(panel.includes("/api/status"),'Development must pair package receipt with current runtime status');
ok(panel.includes('READ ONLY'),'Development receipt surface must be explicitly read-only');
ok(buildout.includes('GovernedBuildReceiptPanel'),'Build/Development map must expose governed receipt');
ok(buildout.includes('GitHub Actions owns source/test/package/deploy execution'),'Worker/external authority boundary must remain explicit');
ok(writer.includes('OMEGA_GOVERNED_BUILD_RECEIPT_V1'),'standalone receipt generator must preserve schema');
ok(!vite.includes('@appdeploy/client')&&!panel.includes('@appdeploy/client')&&!buildout.includes('@appdeploy/client'),'later releases must not reintroduce AppDeploy client');
ok(semverAtLeast(pkg.version,'26.1.0'),'package version must retain or advance beyond 26.1.0');
console.log(`R26.1+ governed build receipt invariants PASS · package ${pkg.version}`);
