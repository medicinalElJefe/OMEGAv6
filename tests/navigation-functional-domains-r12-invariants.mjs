import fs from 'node:fs';
import assert from 'node:assert/strict';

const launcher=fs.readFileSync('src/OmegaLauncher.tsx','utf8');
const registry=fs.readFileSync('src/navigationRegistry.ts','utf8');
const domainBlock=launcher.slice(launcher.indexOf('const DOMAIN_SECTIONS=['),launcher.indexOf('] as const;'));
const navNames=[...registry.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(navNames.length,44,'canonical navigation registry must remain 44 real destinations');
for(const id of ['COMMAND','VISUAL','EARTH','INTELLIGENCE','BUILD','PROOF','SYSTEM'])assert(domainBlock.includes(`id:'${id}'`),`missing functional navigation domain ${id}`);
for(const name of navNames){const token=`'${name}'`;const count=domainBlock.split(token).length-1;assert.equal(count,1,`route ${name} must occur exactly once in the functional domain map`)}
assert(launcher.includes('OMEGA_NAVIGATION')&&launcher.includes('LAUNCHER_SURFACES=OMEGA_NAVIGATION'),'launcher must continue to use the canonical registry as route authority');
assert(!launcher.includes('@appdeploy/client'),'functional navigation must remain provider portable');
console.log('PASS navigation-functional-domains-r12-invariants');
