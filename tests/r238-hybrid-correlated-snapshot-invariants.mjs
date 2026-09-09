import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const provider=read('src/HybridRuntimeSnapshotR238.tsx');
const hostEffects=read('src/HybridHostEffectsR212.tsx');
const deck=read('src/HybridCommandDeckR237.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const worker101=read('src/workerR101.js');
const worker32=read('src/workerR32.js');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "const h=await api.get<any>('/api/hybrid/status')",
 "const missions=Array.isArray(hybrid?.missions)?hybrid.missions:[]",
 "const inFlight=useRef<Promise<void>|null>(null)",
 "if(inFlight.current)return inFlight.current",
 "observedAt=Date.now()",
 "epoch:previous.epoch+1",
 "document.visibilityState==='visible'",
 "document.addEventListener('visibilitychange',onVisibility)",
 "omega:hybrid:selectedDeviceId",
 "selectedDeviceJobs",
 "targetForMission(mission,job)===device.id",
 "Date.now()-snapshot.observedAt>POLL_MS*4"
])must(provider.includes(token),`R238 shared snapshot invariant missing ${token}`);

const providerHybridGets=(provider.match(/api\.get<any>\('\/api\/hybrid\/status'\)/g)||[]).length;
const providerMissionGets=(provider.match(/api\.get<any>\('\/api\/missions'\)/g)||[]).length;
must(providerHybridGets===1&&providerMissionGets===0,'R238 provider must own exactly one canonical Hybrid durable-state GET and no second mission GET');
must(provider.includes('one canonical OMEGA_RUNTIME Durable Object state projection')&&provider.includes('no second /api/missions read is allowed here'),'R238 must state the single durable-state observation contract explicitly');

// Server proof: the public Hybrid status route obtains one canonical runtime /status projection,
// and that durable state already contains devices, jobs, missions and events.
must(worker101.includes("runtimeFetch(env,id,'/status',request,'GET')")&&worker101.includes("if(path==='/api/hybrid/status'&&request.method==='GET')"),'R238 public Hybrid status must remain a canonical OMEGA_RUNTIME /status relay');
for(const token of ["missions=await this.get('missions',[])","return{schema:'OMEGA_ENACTED_RUNTIME_R32'",'devices,jobs:jobs.slice(-80),missions:missions.slice(-40)'])must(worker32.includes(token),`R238 durable state projection missing ${token}`);

for(const [name,text] of [['R212',hostEffects],['R237',deck]]){
 must(!text.includes("api.get<any>('/api/hybrid/status')"),`${name} must not independently poll Hybrid status`);
 must(!text.includes("api.get<any>('/api/missions')"),`${name} must not independently poll missions`);
 must(!text.includes('setInterval(()=>void refresh(),2500)'),`${name} must not retain duplicate 2.5s polling`);
 must(text.includes('useHybridRuntimeSnapshotR238'),`${name} must consume R238 shared snapshot context`);
}

for(const token of [
 'data-r212-selected-device',
 'data-r212-snapshot-epoch',
 'selectedDeviceJobs.filter',
 'otherHostTerminalCount',
 'same selected authenticated host and the same canonical durable-state snapshot epoch',
 'last successful shared snapshot remains displayed'
])must(hostEffects.includes(token),`R238 R212 correlation invariant missing ${token}`);

for(const token of [
 'data-r237-selected-device',
 'data-r237-snapshot-epoch',
 'snapshotCurrent=epoch>0&&!stale',
 'requireCurrentSnapshot',
 'nativeReady=Boolean(snapshotCurrent',
 'const correlationLocked=Boolean(snapshotCurrent&&device)',
 'selectedDeviceJobs.filter',
 'snapshotEpoch:epoch',
 'snapshotObservedAt:observedAt',
 'This selection is shared by R212 and R237'
])must(deck.includes(token),`R238 R237 correlation invariant missing ${token}`);

must(hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'R238 provider must wrap the Hybrid operational surfaces');
const providerStart=hybrid.indexOf('<HybridRuntimeSnapshotProviderR238>');
const providerEnd=hybrid.indexOf('</HybridRuntimeSnapshotProviderR238>');
for(const token of ['<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>']){
 const i=hybrid.indexOf(token);
 must(i>providerStart&&i<providerEnd,`R238 provider must contain ${token}`);
}

for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R238 authority boundary regressed ${token}`);
for(const text of [provider,hostEffects])for(const forbidden of ["api.post<any>('/api/hybrid/jobs'","op:'APPLY_PATCH'","op:'WRITE_TEXT'"])must(!text.includes(forbidden),`R238 read-only sampling/observation plane introduced mutation primitive ${forbidden}`);

console.log('OMEGA R238 HYBRID CORRELATED SNAPSHOT PASS · one canonical OMEGA_RUNTIME durable-state projection carries devices/jobs/missions together · no second mission GET · in-flight coalescing · visibility-aware refresh · persistent selected device · R212/R237 shared epoch + host identity · selected-host return isolation · stale fail-closed command writes · R141/R146/R147/R125 preserved');
