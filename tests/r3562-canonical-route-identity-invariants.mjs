import assert from 'node:assert/strict';
import fs from 'node:fs';

const nav=fs.readFileSync('src/navigationRegistry.ts','utf8');
const experience=fs.readFileSync('src/omegaExperienceRegistryR82.ts','utf8');
const workstation=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const capability=fs.readFileSync('src/capabilityAuthority.ts','utf8');

const navBlock=nav.slice(nav.indexOf('export const OMEGA_NAVIGATION=['),nav.indexOf('export const OMEGA_NAV_GROUPS'));
const routeNames=[...navBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.equal(routeNames.length,44,'canonical route authority must retain all 44 current routes');
assert.equal(new Set(routeNames).size,routeNames.length,'canonical route identity authority contains duplicates');
assert.ok(nav.includes("as const satisfies readonly OmegaNavItem[]"),'navigation authority must preserve literal route identity');
assert.ok(nav.includes("export type OmegaRouteName=(typeof OMEGA_NAVIGATION)[number]['name'];"),'canonical route type must derive from navigation authority');

assert.ok(experience.includes("import {OMEGA_NAV_NAMES,type OmegaRouteName} from './navigationRegistry';"),'experience registry must consume canonical route identity');
assert.ok(experience.includes('export const OMEGA_ALL_ROUTES_R82=OMEGA_NAV_NAMES;'),'R82 inventory must be a view over canonical route authority, not a second route universe');
assert.ok(experience.includes('workspaceMissing')&&experience.includes('workspaceExtra'),'workspace partition must expose parity residuals');

assert.ok(workstation.includes("import {OMEGA_NAV_NAMES,type OmegaRouteName} from './navigationRegistry';"),'workstation must consume canonical route authority');
assert.ok(workstation.includes('export const OMEGA_SURFACES=OMEGA_NAV_NAMES;'),'workstation surface inventory must alias canonical route authority');
assert.ok(!/export const OMEGA_SURFACES=\[/.test(workstation),'workstation must not redeclare the route universe');

const capabilityBlock=capability.slice(capability.indexOf('export const OMEGA_CAPABILITY_AUTHORITY'),capability.indexOf('export const CAPABILITY_BY_NAME'));
const capabilityNames=[...capabilityBlock.matchAll(/name:'([^']+)'/g)].map(x=>x[1]);
assert.deepEqual(new Set(capabilityNames),new Set(routeNames),'capability authority and canonical route identity must have exact set parity');
assert.equal(capabilityNames.length,routeNames.length,'capability authority cannot silently duplicate or omit canonical routes');

console.log('R356.2 CANONICAL ROUTE IDENTITY PASS · one route identity authority · workstation/R82 are views · capability parity exact · duplicate route universes removed');
