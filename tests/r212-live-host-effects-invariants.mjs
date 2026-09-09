import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const effects=read('src/HybridHostEffectsR212.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 'useHybridRuntimeSnapshotR238',
 'CURRENT HOST JOB',
 'NO SOURCE MUTATION IN THIS RETURN',
 'APPLY_PATCH','WRITE_TEXT','stepProofs','outputPaths','FILESYSTEM OUTPUTS','SOURCE MUTATION','resultFingerprint',
 'data-r212-selected-device','data-r212-snapshot-epoch','selectedDeviceJobs','otherHostTerminalCount',
 'same selected authenticated host and the same atomic Hybrid/Mission snapshot epoch',
 'last successful shared snapshot remains displayed'
])must(effects.includes(token),`R212 shared host-effects surface missing ${token}`);

must(effects.includes("const MUTATION_OPS=new Set(['APPLY_PATCH','WRITE_TEXT'])"),'R212 source mutation classification must remain exact and bounded');
must(effects.includes("['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']")&&effects.includes('currentMissionJob:currentJob')&&effects.includes('terminalJobs'),'R212 must keep selected-host current mission/job separate from selected-host historical terminal returns');
must(effects.includes('selectedDeviceJobs.filter')&&effects.includes("job?.targetDeviceId!==selectedDeviceId"),'R212 must isolate terminal history to the selected authenticated device');
must(!effects.includes("api.get<any>('/api/hybrid/status')")&&!effects.includes("api.get<any>('/api/missions')"),'R212 must not retain an independent Hybrid/Mission polling reality after R238');
must(!effects.includes('window.setInterval(()=>void refresh(),3000)'),'R212 must not own a second polling timer after R238');
must(!effects.includes('api.post<any>')&&!effects.includes('fetch('),'R212 host-effects surface must remain read-only and may not create a second execution path');

for(const token of [
 "Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])",
 'inFlight.current',
 'omega:hybrid:selectedDeviceId',
 "document.addEventListener('visibilitychange',onVisibility)",
 'selectedDeviceJobs'
])must(snapshot.includes(token),`R212 requires R238 shared observation provider contract ${token}`);

must(hybrid.includes("import HybridHostEffectsR212 from './HybridHostEffectsR212'"),'Hybrid Link must import R212 host effects');
must(hybrid.includes('<HybridRuntimeSnapshotProviderR238>'),'Hybrid Link must mount the shared R238 provider');
must(hybrid.indexOf('<HybridHostEffectsR212/>')>hybrid.indexOf('<SovereignConnectionR117/>')&&hybrid.indexOf('<HybridHostEffectsR212/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R212 host effects must remain between current connection truth and R141 proof closure');
must(hybrid.includes('Build success is not source mutation'),'Hybrid Link must explain that successful execution does not imply a source edit');
must(effects.includes('does not queue work')&&effects.includes('alter R141/R146/R147/R125 authority'),'R212 authority boundary missing');

console.log('OMEGA R212/R238 LIVE HOST EFFECTS PASS · one shared selected-device/snapshot epoch · no duplicate observer polling · current mission separated from selected-host historical returns · cross-host returns isolated · source mutations only from returned APPLY_PATCH/WRITE_TEXT · read-only observer preserves R141/R146/R147/R125');
