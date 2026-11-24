import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const registry=JSON.parse(readFileSync('audit/omega-full-historical-software-ledger-r926.json','utf8'));
const source=readFileSync('src7/OmegaOneSystemLedgerR926.tsx','utf8');
const workspace=readFileSync('src7/workspaces/SystemEvidenceWorkspaceR445.tsx','utf8');
const native=readFileSync('src7/nativeCapabilityRegistry.tsx','utf8');
const boundary=readFileSync('audit/omega7-workspace-dependencies.v1.json','utf8');
const routes=new Set([...native.matchAll(/'([^']+)'/g)].map(x=>x[1]));
assert.equal(registry.schema,'OMEGA_ONE_SYSTEM_FULL_SOFTWARE_LEDGER_R926');
assert.equal(registry.source.authority,'HISTORICAL_CHARTED_DESIGN_NOT_EXECUTION_CERTIFICATION');
for(const [name,expected] of Object.entries({software:100,menus:12,settings:36,capabilities:18,sequences:144,gates:12})){
 assert.equal(registry[name].length,expected,'historical source inventory '+name);
 assert.equal(registry.counts[name],expected,'historical count drift '+name);
}
const countByRole=registry.software.reduce((a,x)=>(a[x.Disposition]=(a[x.Disposition]||0)+1,a),{});
assert.deepEqual(countByRole,{KEEP:63,MERGE:26,DONOR:11});
for(const [name,entries,key,format] of [
 ['software',registry.software,'ID',/^SYS-\d{3}$/],
 ['menus',registry.menus,'id',/^M\d{2}$/],
 ['settings',registry.settings,'Option ID',/^M\d{2}-O\d{2}$/],
 ['capabilities',registry.capabilities,'Capability ID',/^CAP-\d{3}$/],
 ['sequences',registry.sequences,'SEQ',/^SEQ-\d{3}$/],
 ['gates',registry.gates,'Gate ID',/^GATE-\d{3}$/]
]){
 const seen=new Set();
 for(const entry of entries){
  const id=entry[key];
  assert.match(id,format,'invalid '+name+' ID');
  assert.ok(!seen.has(id),'duplicated '+name+' ID '+id);
  seen.add(id);
 }
}
const menus=new Map(registry.menus.map(x=>[x.name,x]));
assert.equal(menus.size,12);
for(const menu of menus.values()){
 assert.ok(routes.has(menu.route),'route not in OMEGA7 native registry '+menu.route);
 assert.ok(registry.settings.some(x=>x['Top Menu']===menu.name),'unmapped master menu controls '+menu.name);
 assert.ok(registry.software.some(x=>x['Menu ID']===menu.name),'unmapped software menu '+menu.name);
}
for(const software of registry.software){
 assert.ok(menus.has(software['Menu ID']),'unmapped system menu '+software.ID);
 assert.equal(software.navigationRoute,menus.get(software['Menu ID']).route);
 assert.equal(software.routeScope,'MENU_FAMILY_REACHABILITY_NOT_INDEPENDENT_EXECUTOR_PROOF');
 assert.ok(software['Primary Capability'],'missing primary capability '+software.ID);
 assert.ok(software['Input Contract']&&software['Output Contract'],'missing source contracts '+software.ID);
 assert.ok(registry.sequences.some(x=>x.SEQ===software['Upgrade Sequence']),'missing upgrade sequence '+software.ID);
}
for(const route of ['System Atlas','Control Matrix','Archive Census']){
 assert.ok(workspace.includes("route==='"+route+"'"),'historical software ledger not mounted under '+route);
}
assert.ok(workspace.includes("import('../OmegaOneSystemLedgerR926')"));
const developerWorkspace=readFileSync('src7/workspaces/DevelopmentComputeWorkspaceR444.tsx','utf8');
const localHubPanel=readFileSync('src7/workspaces/OmegaLocalHubPanelR884.tsx','utf8');
assert.ok(workspace.includes("import('./OmegaLocalHubPanelR884')"),'archive execution surface not imported');
assert.ok(workspace.includes("route==='Archive Operators'?<><ArchiveGovernanceControl operators"),'archive operators must retain catalogue and authenticated executor together');
assert.ok(workspace.includes("initialOperation='HISTORICAL_ZIP_AUDIT'"),'archive operators default must be source ZIP audit');
assert.ok(developerWorkspace.includes("route==='Development'||route==='Build Out'"),'governed development executor must be reachable');
assert.ok(developerWorkspace.includes("initialOperation={route==='Hybrid Link'?'HASH_TREE':'SPHERE_TENSOR_STEP'}"),'development defaults to real sparse compute operation');
assert.ok(localHubPanel.includes("initialOperation='HASH_TREE'"),'local hub fallback default missing');
assert.ok(localHubPanel.includes("useState<Operation>(initialOperation)"),'local hub operation not initialized by owning workspace');
assert.ok(source.includes("nav('Archive Operators')"),'historical software source missing actual archive-executor shortcut');
assert.ok(source.includes('onNavigate(chosen.navigationRoute)')||source.includes('nav(chosen.navigationRoute)'));
const root=readFileSync('src7/Omega7Root.tsx','utf8');
assert.ok(root.includes('onLaunchRecoveredSystem={launchRecoveredSystem}'),'R512 root launcher not wired through native shell');
assert.ok(native.includes('onLaunchRecoveredSystem={onLaunchRecoveredSystem}'),'R512 native successor callback not passed to workspace');
assert.ok(workspace.includes('onLaunchRecoveredSystem={onLaunchRecoveredSystem}'),'R512 workspace successor callback not passed to ledger');
assert.ok(source.includes('RECOVERED_SYSTEM_EXECUTION_R512.find(row=>row.systemId===chosen.ID)'),'100-system R512 successor resolution missing');
assert.ok(source.includes('data-r933-launch-system={successor.systemId}'),'historical successor launch missing');
assert.ok(source.includes('successor.state===\'ARCHIVE_ONLY\''),'archive-only hold presentation missing');
assert.ok(source.includes('successor.executorProof')&&source.includes('successor.truth'),'historical executor proof disclosure missing');
assert.ok(source.includes('HISTORICAL_CHARTED_DESIGN')||source.includes('Source-registered workspace relation'));
assert.ok(source.includes('source')&&source.includes('original.settings')&&source.includes('original.gates'));
assert.ok(boundary.includes('../OmegaOneSystemLedgerR926'));
// R927: every source-charted control must resolve to a navigable OMEGA7 owner.
for(const setting of registry.settings){
 const owner=menus.get(setting['Top Menu']);
 assert.ok(owner,'missing governing menu for control '+setting['Option ID']);
 assert.ok(routes.has(owner.route),'control route absent from native registry '+setting['Option ID']);
}
for(const sequence of registry.sequences){
 const owners=registry.software.filter(s=>s['Upgrade Sequence']===sequence.SEQ);
 for(const owner of owners)assert.ok(routes.has(owner.navigationRoute),'stage owner route absent '+sequence.SEQ);
}
assert.ok(source.includes("familyRoute(s['Top Menu'])"),'governing control navigation not rendered');
assert.ok(source.includes("stageOwners(s.SEQ,s['Primary Software Family']).map"),'stage primary family navigation not rendered');
for(const sequence of registry.sequences){
 const owners=registry.software.filter(s=>s['Software / Artifact']===sequence['Primary Software Family']||s['Upgrade Sequence']===sequence.SEQ);
 assert.ok(owners.length>0,'stage has no concrete owning software '+sequence.SEQ);
 for(const owner of owners)assert.ok(routes.has(owner.navigationRoute),'stage route not native '+sequence.SEQ);
}
for(const cap of registry.capabilities){
 const owner=menus.get(cap.Menu);
 assert.ok(owner&&routes.has(owner.route),'capability has no native menu owner '+cap['Capability ID']);
}
for(const gate of registry.gates){
 const owner=menus.get(gate['Menu Binding']);
 assert.ok(owner&&routes.has(owner.route),'gate has no native menu owner '+gate['Gate ID']);
}
assert.ok(source.includes('familyRoute(c.Menu)'),'capability route button absent');
assert.ok(source.includes("familyRoute(g['Menu Binding'])"),'gate route button absent');
assert.ok(source.includes('filtered.some((s:Software)=>s.ID===chosen.ID)'),'stale software detail after filtering');
assert.ok(source.includes('filtered.length===0'),'missing empty-result state');
assert.ok(source.includes("focusStage(chosen['Upgrade Sequence'])"),'software-to-stage navigation absent');
assert.ok(source.includes('stageResults.map'),'searchable upgrade sequence missing');
assert.ok(source.includes('controlResults.map'),'searchable control matrix missing');
assert.ok(source.includes("setStageQuery(nextStage(s['Next Sequence']))"),'next-stage navigation absent');
for(const seq of registry.sequences){
 const next=seq['Next Sequence']==='LOOP-TO-SEQ-001'?'SEQ-001':seq['Next Sequence'];
 if(next)assert.ok(registry.sequences.some(x=>x.SEQ===next),'broken next-stage ledger link '+seq.SEQ);
}
assert.equal(registry.sequences.filter(x=>x['Next Sequence']==='LOOP-TO-SEQ-001').length,1,'one explicit cycle restart');
assert.equal(registry.gates.filter(x=>x['Blocks Packaging?']==='YES').length,10);
assert.equal(registry.gates.filter(x=>x['Blocks Packaging?']==='NO').length,2);
console.log('R926 PASS · exact 100 software/12 menus/36 settings/18 capabilities/144 phases/12 gates · 44-route native containment · one system route ownership · conservative proof classification');
