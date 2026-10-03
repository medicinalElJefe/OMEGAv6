import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const workspace=fs.readFileSync('src7/workspaces/DevelopmentComputeWorkspaceR444.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

const added=['Hybrid Link','Quality Compiler','Build Out','Development','Kernel Intelligence','SAI Lab'];
for(const route of added)assert.equal(isOmega7NativeRoute(route),true,route+' must be native in R444');
assert.equal(OMEGA7_NATIVE_ROUTES.length,29);
assert.ok(native.includes("lazy(()=>import('./workspaces/DevelopmentComputeWorkspaceR444'))"));

for(const token of ['HybridMissionControlR8','UniversalQualityControl','WovenBuildOutPanel','SAISovereignControl','IntelligenceFabricPanel','OmegaIntentWorkbenchR85','sourceBackedModeSummary','omega.v6.address'])assert.ok(workspace.includes(token),'R444 missing '+token);
assert.ok(workspace.includes("depth!=='STANDARD'")&&workspace.includes('Open full {route} workspace'),'Standard development view must explain execution boundary first');
assert.ok(workspace.includes("status?.hybridLink?.state||'DEVICE_PROOF_REQUIRED'"),'Hybrid must fail closed without returned device proof');
assert.ok(workspace.includes('pairing alone is not PC execution'),'Hybrid human presentation must distinguish browser pairing from PC execution');
assert.ok(workspace.includes('catalog presence is not execution'),'Quality/intelligence presentation must distinguish catalog membership from execution');
assert.ok(workspace.includes('browser tools cannot silently promote source, deploy production, or admit CanonState'),'development presentation must preserve source/deployment/canon authority separation');
assert.ok(workspace.includes("<UniversalQualityControl")&&workspace.includes('modeCount={modeSummary.appliedCount}')&&workspace.includes('catalogCount={modeSummary.catalogCount}'),'Quality must receive source-backed applied vs catalog counts separately');
assert.ok(workspace.includes("<WovenBuildOutPanel")&&workspace.includes("<OmegaIntentWorkbenchR85"),'Development must preserve governed build plus outcome workflow');
assert.ok(workspace.includes("<IntelligenceFabricPanel")&&workspace.includes("<SAISovereignControl"),'SAI Lab must preserve intelligence fabric plus sovereign SAI controls');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of OMEGA7_NATIVE_ROUTES)assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' must remain adapted rather than retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false);

assert.equal(lock.sourceMainSha,'3d6744513bd9d3fa3ac0abc985c47532a3fd4d5a');
assert.equal(lock.sourceMilestone,'R443_CANDIDATE');
assert.ok(lock.nativeFamilies.includes('DEVELOPMENT_COMPUTE'));
assert.match(lock.hybridTruthRule,/PAIRING_IS_NOT_PC_EXECUTION/);
assert.match(lock.intelligenceTruthRule,/BROWSER_CANNOT_SILENTLY_MUTATE/);
assert.match(lock.qualityTruthRule,/NOT_EXECUTION_PROOF/);
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R444 PASS · native development/compute family · 29 native routes · Hybrid/quality/SAI authority boundaries preserved · zero retirement');
