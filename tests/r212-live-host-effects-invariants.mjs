import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const effects=read('src/HybridHostEffectsR212.tsx');
const snapshot=read('src/HybridRuntimeSnapshotR238.tsx');
const hybrid=read('src/HybridLinkR32.tsx');
const app=read('src/App.tsx');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};

for(const token of [
 'useHybridRuntimeSnapshotR238','CURRENT HOST JOB','NO SOURCE MUTATION IN THIS RETURN','APPLY_PATCH','WRITE_TEXT','stepProofs','outputPaths','FILESYSTEM OUTPUTS','SOURCE MUTATION','resultFingerprint','data-r212-selected-device','data-r212-snapshot-epoch','selectedDeviceJobs','otherHostTerminalCount','last successful shared snapshot remains displayed'
])must(effects.includes(token),`R212 shared host-effects surface missing ${token}`);

must(effects.includes("const MUTATION_OPS=new Set(['APPLY_PATCH','WRITE_TEXT'])"),'R212 source mutation classification must remain exact and bounded');
must(effects.includes("['ACTIVE','PAUSED','QUEUED','PENDING','RUNNING']")&&effects.includes('currentMissionJob:currentJob')&&effects.includes('terminalJobs'),'R212 must keep selected-host current mission/job separate from selected-host historical terminal returns');
must(effects.includes('selectedDeviceJobs.filter')&&effects.includes("job?.targetDeviceId!==selectedDeviceId"),'R212 must isolate terminal history to the selected authenticated device');
must(!effects.includes("api.get<any>('/api/hybrid/status')")&&!effects.includes("api.get<any>('/api/missions')"),'R212 must not retain an independent Hybrid/Mission polling reality');
must(!effects.includes('window.setInterval(()=>void refresh(),3000)'),'R212 must not own a second polling timer');
must(!effects.includes('api.post<any>')&&!effects.includes('fetch('),'R212 host-effects surface must remain read-only and may not create a second execution path');

for(const token of ["const h=await api.get<any>('/api/hybrid/status')","const missions=Array.isArray(hybrid?.missions)?hybrid.missions:[]",'inFlight.current','omega:hybrid:selectedDeviceId',"document.addEventListener('visibilitychange',onVisibility)",'selectedDeviceJobs'])must(snapshot.includes(token),`R212 requires R245/R238 one-state observation provider contract ${token}`);
must(!snapshot.includes("api.get<any>('/api/missions')"),'R212/R245 must not split mission truth into another browser request');
must(app.includes('<HybridRuntimeSnapshotProviderR238><AppBoundary>'),'R212 shared provider must be app-level after R245 convergence');
must(!hybrid.includes('HybridRuntimeSnapshotProviderR238'),'Hybrid Link must not create a nested polling provider');
must(hybrid.indexOf('<HybridHostEffectsR212/>')>hybrid.indexOf('<SovereignConnectionR117/>')&&hybrid.indexOf('<HybridHostEffectsR212/>')<hybrid.indexOf('<HybridProofClosureR141/>'),'R212 host effects must remain between current connection truth and R141 proof closure');
must(hybrid.includes('Build success is not source mutation'),'Hybrid Link must explain that successful execution does not imply a source edit');
must(effects.includes('does not queue work')&&effects.includes('alter R141/R146/R147/R125 authority'),'R212 authority boundary missing');

console.log('OMEGA R212/R245 LIVE HOST EFFECTS PASS · one app-level selected-device durable epoch · zero duplicate polling · current mission separate from selected-host historical returns · cross-host returns isolated · source mutations only from returned APPLY_PATCH/WRITE_TEXT · R141/R146/R147/R125 preserved');
