import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const woven=read('src/HybridWovenContinuityR238.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const intelligence=read('src/HybridHostIntelligenceR238.tsx');
const effects=read('src/HybridHostEffectsR212.tsx');
const deck=read('src/HybridCommandDeckR237.tsx');
const link=read('src/HybridLinkR32.tsx');

for(const token of [
 "WOVEN_CONTINUITY_OPERATOR_R238='partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition'",
 'useHybridRuntimeSnapshotR238',
 'selectedDeviceJobs',
 'missionEntries',
 'data-r238-woven-device',
 'data-r238-woven-epoch',
 '+1 DISPATCH · 0 OBSERVE · -1 RETURN',
 'INVARIANT CARRY',
 'SCAR / HISTORY CARRY',
 'RECOVERABLE PATH',
 'R134_WOVEN_RELATIVITY',
 'R141_EXACT_RETURN_CLOSURE',
 'R146_HISTORY',
 'R147_DISPATCH',
 'R125_CANON_ADMISSION',
 'Atlas resolution labels are representational/address levels, not literal physical dimensions'
])must(woven.includes(token),`R238 Woven continuity invariant missing ${token}`);

must(!woven.includes("api.post<any>('/api/hybrid/jobs'"),'R238 Woven continuity surface must not gain command authority');
must(!woven.includes("api.get<any>('/api/hybrid/status')"),'R238 Woven continuity surface must consume the shared observation frame rather than creating another poller');
must(!intelligence.includes("api.get<any>('/api/hybrid/status')"),'R238 host intelligence must consume shared snapshot after Woven convergence');
for(const text of [effects,deck,intelligence,woven])must(text.includes('useHybridRuntimeSnapshotR238'), 'Every R238 operational projection must consume the same snapshot context');

for(const token of [
 "const h=await api.get<any>('/api/hybrid/status')",
 "const missions=Array.isArray(hybrid?.missions)?hybrid.missions:[]",
 'one canonical OMEGA_RUNTIME Durable Object state projection',
 'epoch:previous.epoch+1',
 'selectedDeviceJobs',
 'targetForMission(mission,job)===device.id'
])must(snapshot.includes(token),`R238 Woven snapshot carry missing ${token}`);
must(!snapshot.includes("api.get<any>('/api/missions')"),'R238 Woven observation must not split Hybrid and mission truth across a second client GET');

const start=link.indexOf('<HybridRuntimeSnapshotProviderR238>'),end=link.indexOf('</HybridRuntimeSnapshotProviderR238>');
must(start>=0&&end>start,'R238 shared provider boundary missing');
for(const token of ['<HybridWovenContinuityR238/>','<HybridHostIntelligenceR238/>','<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>']){
 const i=link.indexOf(token);must(i>start&&i<end,`R238 shared provider must contain ${token}`);
}
must(link.indexOf('<HybridWovenContinuityR238/>')<link.indexOf('<HybridHostIntelligenceR238/>'),'Woven frame must be declared before the host-intelligence projection');
must(link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridCommandDeckR237/>'),'Host resource truth must precede native command admission');
for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(link.includes(token),`R238 Woven authority boundary regressed ${token}`);
must(link.includes('12→144→1,728→20,736→248,832')&&link.includes('not literal physical dimensions'),'R238 must retain atlas-resolution truth boundary');

console.log('OMEGA R238 WOVEN HYBRID CONTINUITY PASS · two successor projections converge into one selected-host durable-state epoch · one canonical runtime projection carries devices/jobs/missions together · frame-relative whole/part + inner/outer roles · +1/0/-1 orientation channels · invariant authority carry · selected-host scar/history carry · recoverable R134→R238→R141→R146→R147→R125 path · no new physical primitive or authority');
