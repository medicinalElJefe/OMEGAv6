import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
const woven=read('src/HybridWovenContinuityR238.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const intelligence=read('src/HybridHostIntelligenceR238.tsx');
const effects=read('src/HybridHostEffectsR212.tsx');
const deck=read('src/HybridCommandDeckR237.tsx');
const link=read('src/HybridLinkR32.tsx');
const app=read('src/App.tsx');

for(const token of [
 "WOVEN_CONTINUITY_OPERATOR_R238='partition → exchange/transform → invariant carry → scar/history carry → re-contextualize/repartition'",
 'useHybridRuntimeSnapshotR238','selectedDeviceJobs','missionEntries','data-r238-woven-device','data-r238-woven-epoch','+1 DISPATCH · 0 OBSERVE · -1 RETURN','INVARIANT CARRY','SCAR / HISTORY CARRY','RECOVERABLE PATH','R134_WOVEN_RELATIVITY','R141_EXACT_RETURN_CLOSURE','R146_HISTORY','R147_DISPATCH','R125_CANON_ADMISSION','Atlas resolution labels are representational/address levels, not literal physical dimensions'
])must(woven.includes(token),`R238 Woven continuity invariant missing ${token}`);

must(!woven.includes("api.post<any>('/api/hybrid/jobs'"),'R238 Woven continuity surface must not gain command authority');
for(const [name,text] of [['Woven',woven],['Host intelligence',intelligence],['Effects',effects],['Command',deck]]){
 must(!text.includes("api.get<any>('/api/hybrid/status')"),`${name} must consume the shared observation frame rather than creating another Hybrid poller`);
 must(!text.includes("api.get<any>('/api/missions')"),`${name} must not split mission truth into a second browser observation`);
 must(text.includes('useHybridRuntimeSnapshotR238'),`${name} must consume the same snapshot context`);
}

for(const token of ["const h=await api.get<any>('/api/hybrid/status')","const missions=Array.isArray(hybrid?.missions)?hybrid.missions:[]",'epoch:previous.epoch+1','selectedDeviceJobs','targetForMission(mission,job)===device.id'])must(snapshot.includes(token),`R245/R238 Woven snapshot carry missing ${token}`);
must(!snapshot.includes("api.get<any>('/api/missions')"),'R245 must derive missions from the same Durable Object response');
must(app.includes('<HybridRuntimeSnapshotProviderR238><AppBoundary>')&&app.includes('</AppBoundary></HybridRuntimeSnapshotProviderR238>'),'R245 shared provider must wrap the full app');
must(!link.includes('HybridRuntimeSnapshotProviderR238'),'Hybrid Link must not re-partition the shared epoch with a nested provider');
for(const token of ['<HybridWovenContinuityR238/>','<HybridHostIntelligenceR238/>','<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>','<HybridTransitionCompilerR245/>'])must(link.includes(token),`Hybrid shared frame missing ${token}`);
must(link.indexOf('<HybridWovenContinuityR238/>')<link.indexOf('<HybridHostIntelligenceR238/>'),'Woven frame must be declared before host-intelligence projection');
must(link.indexOf('<HybridHostIntelligenceR238/>')<link.indexOf('<HybridTransitionCompilerR245/>'),'Returned host/resource truth must precede transition compilation');
must(link.indexOf('<HybridTransitionCompilerR245/>')<link.indexOf('<HybridCommandDeckR237/>'),'R245 proposal ranking must remain upstream of explicit command authority');
for(const token of ['R125 sole CanonState admission','R141 exact return closure','R146 history','R147 dispatch'])must(link.includes(token),`R245/R238 Woven authority boundary regressed ${token}`);
must(link.includes('12→144→1,728→20,736→248,832')&&link.includes('not literal physical dimensions'),'R245 must retain atlas-resolution truth boundary');

console.log('OMEGA R245/R238 WOVEN HYBRID CONTINUITY PASS · one Durable Object epoch now spans app/Hybrid/calculus · frame-relative whole/part roles · +1/0/-1 orientation · invariant/scar carry · R245 proposal compiler sits between resource truth and command authority · R141/R146/R147/R125 preserved');
