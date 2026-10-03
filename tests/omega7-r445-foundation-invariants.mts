import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA_NAVIGATION} from '../src/navigationRegistry.ts';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const workspace=fs.readFileSync('src7/workspaces/SystemEvidenceWorkspaceR445.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

const allRoutes=OMEGA_NAVIGATION.map(x=>x.name);
assert.equal(allRoutes.length,44);
assert.equal(OMEGA7_NATIVE_ROUTES.length,44,'R445 must adapt all 44 registered capabilities into the OMEGA7 shell');
assert.deepEqual(new Set(OMEGA7_NATIVE_ROUTES),new Set(allRoutes),'R445 native coverage must exactly equal the canonical 44-route inventory');
for(const route of allRoutes)assert.equal(isOmega7NativeRoute(route),true,'missing native OMEGA7 route '+route);
assert.ok(native.includes("lazy(()=>import('./workspaces/SystemEvidenceWorkspaceR445'))"));

const added=['Cockpit','Modes','Evidence & Proof','Archive Census','Archive Operators','Canon Evolution','Governance','Consolidation','Instructions','Plugins','Settings','System','Validation','System Atlas','Control Matrix'];
for(const route of added)assert.equal(isOmega7NativeRoute(route),true,route+' must be native in R445');

for(const token of ['OmegaWorkspaceCockpitR18','SourceBackedModesPanelR21','OmegaSpecialistSuite','ArchiveGovernanceControl','PluginRegistryR45','UniversalQualityControl','SystemAtlasControl','sourceBackedModeSummary','omega.v6.address'])assert.ok(workspace.includes(token),'R445 missing '+token);
assert.ok(workspace.includes("depth!=='STANDARD'")&&workspace.includes('Open full {route} workspace'),'Standard system/evidence view must explain authority before full instrument');
assert.ok(workspace.includes('catalog membership is not execution'),'Modes must distinguish registry from execution');
assert.ok(workspace.includes('presentation, registration, proposal, and local persistence are not Canon admission'),'System presentation must distinguish interface state from Canon authority');
assert.ok(workspace.includes("<ArchiveGovernanceControl")&&workspace.includes('operators'),'Archive Census/Operators must reuse accepted forensic archive engine');
assert.ok(workspace.includes("<PluginRegistryR45"),'Plugins must reuse accepted typed adapter registry');
assert.ok(workspace.includes("<SystemAtlasControl")&&workspace.includes('control/>'),'System Atlas and Control Matrix must reuse accepted one-authority system atlas');
assert.ok(workspace.includes("<UniversalQualityControl")&&workspace.includes('catalogCount={modeSummary.catalogCount}'),'Validation must preserve applied-vs-catalog truth');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const row of OMEGA7_INHERITANCE_LEDGER)assert.equal(row.migration,'ADAPTED',row.legacyRoute+' must be adapted after full R445 coverage');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false,'44/44 adapted does not authorize legacy retirement');

assert.equal(lock.sourceMainSha,'ad861336699039bbc0e5ec66f1be5942de083915');
assert.equal(lock.sourceMilestone,'R444_CANDIDATE');
assert.equal(lock.nativeCoverage,'44_OF_44_ADAPTED');
assert.equal(lock.retirementState,'ZERO_LEGACY_SURFACES_RETIRED');
assert.ok(lock.nativeFamilies.includes('SYSTEM_EVIDENCE_GOVERNANCE'));
assert.match(lock.evidenceTruthRule,/MISSING_EXTERNAL_OR_DEVICE_AUTHORITY_REMAINS_HOLD/);
assert.match(lock.pluginTruthRule,/IS_NOT_EXECUTED_OR_VERIFIED/);
assert.match(lock.archiveTruthRule,/NOT_LIVE_ENUMERATION/);
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R445 PASS · 44/44 canonical routes native-adapted inside one shell · evidence/system/governance authority preserved · zero legacy retirement');
