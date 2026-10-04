import assert from 'node:assert/strict';
import fs from 'node:fs';
import {OMEGA7_NATIVE_ROUTES,isOmega7NativeRoute} from '../src7/nativeCapabilityRegistry.tsx';
import {OMEGA7_INHERITANCE_LEDGER,canRetireOmega6Surface} from '../src7/inheritanceLedgerR438.ts';

const native=fs.readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const workspace=fs.readFileSync('src7/workspaces/WorkCreateWorkspaceR443.tsx','utf8');
const lock=JSON.parse(fs.readFileSync('src7/omega7.lock.json','utf8'));

const added=['Workspace','Projects','Memory','Create','Render Queue','Assets'];
for(const route of added)assert.equal(isOmega7NativeRoute(route),true,route+' must be native in R443');
assert.ok(OMEGA7_NATIVE_ROUTES.length>=23,'R443 native set may grow in successors but cannot shrink below 23');
assert.ok(native.includes("lazy(()=>import('./workspaces/WorkCreateWorkspaceR443'))"));

for(const token of ['OmegaWorkspaceCockpitR18','OmegaSpecialistSuite','OmegaIntentWorkbenchR85','initCorpusPack','corpusState','evaluateCorpusModes','omega.v6.address'])assert.ok(workspace.includes(token),'R443 missing '+token);
assert.ok(workspace.includes("depth!=='STANDARD'")&&workspace.includes('Open full {route} workspace'),'Standard work/create view must explain before opening full instrument');
assert.ok(workspace.includes('local work does not silently become CanonState or external execution'));
assert.ok(workspace.includes("window.dispatchEvent(new CustomEvent('omega7-address-changed'"),'work/create family must share the accepted address lineage');
assert.ok(workspace.includes("api.get<any>('/api/status')")&&workspace.includes("api.get<any>('/api/restoration')"),'workspace must use returned runtime state rather than invent health');
assert.ok(workspace.includes("route==='Create'?<OmegaIntentWorkbenchR85"),'Create must use the accepted outcome/workflow engine');
assert.ok(workspace.includes("<OmegaSpecialistSuite panel={route}"),'Projects/Memory/Assets/Render Queue must reuse the accepted specialist suite');

assert.equal(OMEGA7_INHERITANCE_LEDGER.length,44);
for(const route of OMEGA7_NATIVE_ROUTES)assert.equal(OMEGA7_INHERITANCE_LEDGER.find(x=>x.legacyRoute===route)?.migration,'ADAPTED',route+' must remain adapted rather than retired');
assert.equal(OMEGA7_INHERITANCE_LEDGER.some(canRetireOmega6Surface),false);

assert.match(lock.sourceMainSha,/^[a-f0-9]{40}$/,'successor lock must retain an exact source SHA');
assert.ok(typeof lock.sourceMilestone==='string'&&lock.sourceMilestone.length>0,'successor lock must retain a declared source milestone');
assert.ok(lock.nativeFamilies.includes('WORK_CREATE_CONTINUITY'));
assert.equal(lock.workTruthRule,'LOCAL_PROJECT_MEMORY_AND_WORKSPACE_CONTINUITY_DO_NOT_IMPLY_CANONSTATE_OR_EXTERNAL_PERSISTENCE');
assert.equal(lock.createTruthRule,'ORCHESTRATION_AND_RENDER_OUTPUT_DO_NOT_PROVE_EXTERNAL_OR_NATIVE_EXECUTION');
assert.equal(lock.registeredRouteCount,44);
assert.equal(lock.physicalDimensionClaim,false);

console.log('OMEGA7 R443 CONTRACT PASS · work/create continuity remains native in successors · one address lineage · explicit local/external authority separation · zero retirement');
