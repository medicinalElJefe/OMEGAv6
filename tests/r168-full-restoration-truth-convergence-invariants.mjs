import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const authority=read('src/system/systemFamilyExecutionR168.ts');
const panel=read('src/FullRestorationConvergenceR168.tsx');
const suite=read('src/OmegaSpecialistSuite.tsx');
const potential=read('src/buildPotentialRuntimeR133.ts');
const potentialUi=read('src/OmegaBuildPotentialR133.tsx');
const r46=read('src/ExtremeRestorationR46.tsx');
const atlas=read('src/systemAtlasRuntime.ts');
const bio=read('src/BiologicalTraversalR46.tsx');
const micro=read('src/MicroBuildR46.tsx');
const data=read('src/OmegaDataLexiconR46.tsx');
const cinema=read('src/CinematicFieldRendererR46.tsx');
const r166=read('src/world/developmentResidualWorldLensR166.js');
const must=(ok,msg)=>assert.ok(ok,`R168 ${msg}`);

for(const [id,state,executor] of [['S10','SOURCE_ACTIVE','BiologicalTraversalR46'],['S12','LOCAL_ACTIVE','MicroBuildR46'],['S16','LOCAL_ACTIVE','OmegaDataLexiconR46+xlsxLiteR153'],['S18','LOCAL_ACTIVE','OmegaDataLexiconR46'],['S21','LOCAL_ACTIVE','CinematicFieldRendererR46+VisualCompositorR65']]){
 must(authority.includes(`familyId:'${id}'`),`successor authority missing ${id}`);
 must(authority.includes(`effectiveStatus:'${state}'`),`effective state missing ${id} ${state}`);
 must(authority.includes(`executor:'${executor}'`),`executor proof source missing ${id}`);
 must(r46.includes(`id:'${id}'`),`R46 successor overlay missing ${id}`);
}
for(const token of ['ORGANISM','TISSUE','CELL','MOLECULE','ATOM'])must(bio.includes(token),`biology executable missing ${token}`);
for(const token of ['zipSync','stateSha256','OMEGA_MICRO_PORTABLE_BUNDLE_R153'])must(micro.includes(token),`micro executable missing ${token}`);
for(const token of ['readXlsxLite','downloadXlsxLite','OMEGA_SEMANTIC_PACKET_LANGUAGE_R46'])must(data.includes(token),`data/language executable missing ${token}`);
for(const token of ['Export SVG','Browser-local deterministic SVG still rendering is active'])must(cinema.includes(token),`cinematic executable missing ${token}`);

must(authority.includes('historicalStatus:family.status')&&authority.includes('effectiveStatus:successor?.effectiveStatus||family.status'),'historical and current execution truth must remain separate');
must(authority.includes("canon:'R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'"),'R125 admission authority missing');
must(!authority.includes("familyId:'S22',effectiveStatus:'LOCAL_ACTIVE'")&&!authority.includes("familyId:'S22',effectiveStatus:'SOURCE_ACTIVE'"),'S22 native installer must not be falsely promoted');

must(potential.includes("import {effectiveSystemFamilyR168")&&potential.includes('laneForFamilyStatusR133(effectiveStatus)'),'build priority must use effective successor execution state');
must(potential.includes('historicalStatusCounts')&&potential.includes('effectiveStatusCounts'),'build potential summary must preserve both status axes');
must(potentialUi.includes('CURRENT EFFECTIVE EXECUTION · R168')&&potentialUi.includes('HISTORICAL V24 STATUS · PRESERVED LINEAGE'),'operator must see current execution separately from historical lineage');
must(potentialUi.includes('row.effectiveFamily.operatorRoute'),'restored families must open their actual executor route');

must(suite.includes("import FullRestorationConvergenceR168 from './FullRestorationConvergenceR168'"),'Convergence must import R168 operator surface');
must(suite.includes('<FullRestorationConvergenceR168 record={record} address={address} onNavigate={onNavigate}/>'),'Convergence must visibly mount R168');
must(panel.includes("assembleDevelopmentResidualWorldLensR166")&&panel.includes("/omega-r125-accuracy-state.json")&&panel.includes("/api/core-health")&&panel.includes("/api/release-evidence")&&panel.includes("/api/runtime-attestation")&&panel.includes("/api/hybrid/status"),'R166 world lens must be bound to current evidence in the browser');
must(panel.includes('MASTER_MENUS.map')&&panel.includes('12 MASTER SOFTWARE INTENTS'),'12 Drive-aligned master intents must be directly operable');
must(panel.includes('partition → transform/exchange → invariant carry → scar/history carry → re-contextualize'),'Woven Continuity operator must remain explicit');
must(panel.includes('12 → 144 → 1,728 → 20,736'),'atlas resolution hierarchy must remain explicit');
for(const law of ['RESIDUAL_VISUALIZATION_IS_NOT_REPAIR_AUTHORIZATION','R125_REMAINS_SOLE_CANONSTATE_ADMISSION_AUTHORITY'])must(r166.includes(law),`R166 truth boundary missing ${law}`);

const menuCount=[...atlas.matchAll(/\['\d\d','[^']+','[^']+','[^']+'\]/g)].length;
must(menuCount===12,`expected 12 master menus, found ${menuCount}`);
console.log('R168 FULL RESTORATION TRUTH CONVERGENCE PASS · 5 bounded successor executors counted as current · R166 operator-visible · 12 master intents direct · R125/S22 truth boundaries preserved');
