import fs from 'node:fs';
const provider=fs.readFileSync('src/HybridRuntimeSnapshotR238.tsx','utf8');
const css=fs.readFileSync('src/hybridLinkR112.css','utf8');
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
for(const token of ["ACTIVE_POLL_MS=1200","IDLE_POLL_MS=5000","const activeRuntime=useMemo","const pollMs=activeRuntime?ACTIVE_POLL_MS:IDLE_POLL_MS","window.addEventListener('focus',onResume)","window.addEventListener('online',onResume)","const jobById=useMemo(()=>new Map"]){must(provider.includes(token),`R255 adaptive snapshot performance missing ${token}`)}
for(const token of ['content-visibility:auto','contain-intrinsic-size:auto 420px','touch-action:manipulation','prefers-reduced-motion:reduce'])must(css.includes(token),`R255 progressive design performance missing ${token}`);
must(provider.includes("Promise.all([api.get<any>('/api/hybrid/status'),api.get<any>('/api/missions')])"),'R255 must preserve one atomic Hybrid/Mission refresh pair');
must(provider.includes('if(inFlight.current)return inFlight.current'),'R255 must preserve in-flight refresh coalescing');
must(provider.includes('Date.now()-snapshot.observedAt>POLL_MS*4'),'R255 must preserve stale fail-closed truth boundary');
console.log('OMEGA R255 PERFORMANCE + DESIGN CONVERGENCE PASS · active/idle adaptive polling · focus/network catch-up · map-indexed mission correlation · below-fold progressive rendering · responsive/reduced-motion design · R238 atomic truth preserved');
