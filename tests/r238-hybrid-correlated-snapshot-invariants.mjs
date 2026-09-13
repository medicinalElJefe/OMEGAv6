import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const provider=read('src/HybridRuntimeSnapshotR238.tsx');
const hostEffects=read('src/HybridHostEffectsR212.tsx');
const deck=read('src/HybridCommandDeckR237.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const app=read('src/App.tsx');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 "Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])",
 "const inFlight=useRef<Promise<void>|null>(null)",
 "if(inFlight.current)return inFlight.current",
 "observedAt=Date.now()",
 "epoch:previous.epoch+1",
 "document.visibilityState==='visible'",
 "document.addEventListener('visibilitychange',onVisibility)",
 "window.addEventListener('focus',onResume)",
 "window.addEventListener('online',onResume)",
 "window.removeEventListener('focus',onResume)",
 "window.removeEventListener('online',onResume)",
 "omega:hybrid:selectedDeviceId",
 "selectedDeviceJobs",
 "const jobById=useMemo(()=>new Map(jobs.map((job:any)=>[job?.id,job])),[jobs])",
 "job:jobById.get(mission.currentJobId)||mission.currentJob||null",
 "targetForMission(mission,job)===device.id",
 "Date.now()-snapshot.observedAt>POLL_MS*4"
])must(provider.includes(token),`R238 shared snapshot invariant missing ${token}`);

must(provider.includes('const POLL_MS=2500'),'R267/R270/R309 must not alter the established R238 polling cadence');
must(!provider.includes('ACTIVE_POLL_MS')&&!provider.includes('IDLE_POLL_MS'),'R270/R309 must not introduce adaptive polling semantics');
must(!provider.includes('jobs.find((job:any)=>job.id===mission.currentJobId)'),'R267 mission correlation must use the indexed job map rather than repeated linear lookup');

// R309 adds a read-only known-device plane without weakening current online execution selection.
for(const token of ['knownDevices:any[]','const knownDevices=useMemo','const onlineDevices=useMemo(()=>knownDevices.filter','onlineDevices.find((row:any)=>row?.id===selectedDeviceId)||onlineDevices[0]','onlineDevices.length===0?knownDevices.find','if(id&&!knownDevices.some'])must(provider.includes(token),`R309 known-device history invariant missing ${token}`);

const providerHybridGets=(provider.match(/api\.get<any>\('\/api\/hybrid\/status'\)/g)||[]).length;
const providerMissionGets=(provider.match(/api\.get<any>\('\/api\/missions'\)/g)||[]).length;
must(providerHybridGets===1&&providerMissionGets===1,'R238 provider must own exactly one Hybrid and one Mission GET call site');
for(const [name,text] of [['R212',hostEffects],['R237',deck]]){
 must(!text.includes("api.get<any>('/api/hybrid/status')"),`${name} must not independently poll Hybrid status`);
 must(!text.includes("api.get<any>('/api/missions')"),`${name} must not independently poll missions`);
 must(!text.includes('setInterval(()=>void refresh(),2500)'),`${name} must not retain duplicate 2.5s polling`);
 must(text.includes('useHybridRuntimeSnapshotR238'),`${name} must consume R238 shared snapshot context`);
}

for(const token of [
 'data-r212-selected-device','data-r212-snapshot-epoch','selectedDeviceJobs.filter','otherHostTerminalCount',
 'atomic Hybrid/Mission snapshot epoch','last successful shared snapshot remains displayed','OFFLINE HISTORY INSPECTION'
])must(hostEffects.includes(token),`R309 R212 correlation invariant missing ${token}`);
for(const token of [
 'data-r237-selected-device','data-r237-snapshot-epoch','snapshotCurrent=epoch>0&&!stale','requireCurrentSnapshot','nativeReady=Boolean(snapshotCurrent',
 'const correlationLocked=Boolean(snapshotCurrent&&device)','selectedDeviceJobs.filter','snapshotEpoch:epoch','snapshotObservedAt:observedAt',
 'This selection is shared by R212, R237, R238 and R239'
])must(deck.includes(token),`R238 R237 correlation invariant missing ${token}`);

must(app.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'"),'R270 workstation root must import R238 snapshot provider');
must(app.includes('<HybridRuntimeSnapshotProviderR238><OmegaWorkstation/></HybridRuntimeSnapshotProviderR238>'),'R270 single R238 provider must wrap the full specialist workstation');
must(!hybrid.includes("import {HybridRuntimeSnapshotProviderR238} from './HybridRuntimeSnapshotR238'")&&!hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'R270 Hybrid Link must consume the workstation owner rather than mount a second provider');
const mountCount=((app+hybrid).match(/<HybridRuntimeSnapshotProviderR238>/g)||[]).length;
must(mountCount===1,`R270 requires exactly one R238 provider mount, found ${mountCount}`);
for(const token of ['<HybridHostEffectsR212/>','<HybridCommandDeckR237/>','<HybridProofClosureR141/>','<MissionLineageReviewR209/>'])must(hybrid.includes(token),`R270 Hybrid operational projection missing ${token}`);
must(hybrid.indexOf('<HybridHostEffectsR212/>')<hybrid.indexOf('<HybridCommandDeckR237/>')&&hybrid.indexOf('<HybridCommandDeckR237/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R270 must preserve Hybrid observation→command→proof ordering inside the shared workstation provider');

for(const token of ['R125 admission authority','R141 exact return closure','R146 history','R147 executor/dispatch authority'])must(hybrid.includes(token),`R238 authority boundary regressed ${token}`);
for(const text of [provider,hostEffects])for(const forbidden of ["api.post<any>('/api/hybrid/jobs'","op:'APPLY_PATCH'","op:'WRITE_TEXT'"])must(!text.includes(forbidden),`R238 read-only sampling/observation plane introduced mutation primitive ${forbidden}`);

console.log('OMEGA R309/R238/R267/R270 HYBRID CORRELATED SNAPSHOT PASS · one polling owner · online execution selection retained · offline known-host read-only history admitted only without online authority · unchanged 2.5s cadence/stale gate · R141/R146/R147/R125 preserved');