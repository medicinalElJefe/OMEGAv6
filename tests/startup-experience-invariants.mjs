import fs from 'node:fs';

const home=fs.readFileSync('src/OmegaHome.tsx','utf8');
const daily=fs.readFileSync('src/dailyBrief.ts','utf8');
const phase=fs.readFileSync('src/PhaseWheel.tsx','utf8');
const bridge=fs.readFileSync('src/ResponsiveRuntimeShell.tsx','utf8');
const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
const frameCss=fs.readFileSync('src/singleFrameR27.css','utf8');
const modeRuntime=fs.readFileSync('src/sourceBackedModeRuntimeR21.ts','utf8');
const experience=fs.readFileSync('src/experienceR4.css','utf8');
const experienceShell=fs.readFileSync('src/OmegaExperienceShellR257.tsx','utf8');
const experienceContext=fs.readFileSync('src/OmegaExperienceContextR257.tsx','utf8');
const fail=(m)=>{throw new Error(m)};

for(const token of ['dailyBrief()','OMEGA curated operating lesson','TODAY\'S FIELD LESSON','OPEN FULL WORKSTATION','/api/route-preview','/api/chat','SOURCE-BACKED MODES'])if(!(home+daily).includes(token))fail(`startup experience missing ${token}`);
if(home.includes('ALL MODES ACTIVE'))fail('startup may not claim the 179-row catalog is fully executed');
if(!home.includes('sourceBackedModeSummary')||!home.includes('appliedModeCount')||!home.includes('gatedModeCount')||!modeRuntime.includes('GATED_MISSING_INPUTS'))fail('startup source-backed mode authority incomplete');
for(const token of ['PHASE AWARENESS · SOURCE-BOUND','Selecting a phase changes the real OMEGA address'])if(!phase.includes(token))fail(`phase experience missing ${token}`);
for(const destination of ['Field','Evidence & Proof','Relativity','Matter Traversal','Memory','Scale Compiler','Forecast'])if(!shell.includes(`'${destination}'`)&&!home.includes(`'${destination}'`))fail(`daily destination not routed: ${destination}`);
const registered=(shell.match(/R27_REGISTERED_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const names=[...registered.matchAll(/'([^']+)'/g)].map(x=>x[1]);
if(names.length!==44)fail(`expected 44 registered workstation surfaces, found ${names.length}`);
if(new Set(names).size!==44)fail('workstation registry contains duplicate surface names');
for(const token of ['r27-desktop-frame','r27-route-pane','r27-mobile-head','r27-mobile-bottom','r27-mobile-drawer'])if(!(shell+frameCss).includes(token))fail(`single-frame professional navigation missing ${token}`);
if(!bridge.includes('SingleFrameRuntimeShellR27')||bridge.includes('nav20-desktop'))fail('legacy layered shell must not remain active');
for(const token of ['.r4-welcome','.r4-journeys','.r4-conversation','.r4-daily'])if(!experience.includes(token))fail(`R4 startup visual hierarchy missing ${token}`);
if(home.includes('@appdeploy/client')||daily.includes('@appdeploy/client')||shell.includes('@appdeploy/client'))fail('AppDeploy runtime dependency is forbidden');

// R259: one atomic presentation state must own experience/depth/immersive continuity.
if(!experienceContext.includes("const[state,setState]=useState<OmegaExperienceStateR257>(read)"))fail('R259 experience state must be one atomic state object');
if(experienceContext.includes('setExperienceState')||experienceContext.includes('setDepthState')||experienceContext.includes('setImmersiveState'))fail('R259 may not regress to independently persisted experience state slices');
for(const token of ['setExperienceProfile','window.localStorage.setItem(KEY,JSON.stringify(state))',"window.addEventListener('storage',sync)","window.removeEventListener('storage',sync)"])if(!experienceContext.includes(token))fail(`R259 durable experience continuity missing ${token}`);
if(!experienceShell.includes('setExperienceProfile(id,next.defaultDepth)'))fail('R259 experience selection must atomically bind mode + default depth');
if(!experienceShell.includes('const resetAll=')||!experienceShell.includes('persistLegacyView(next.workspace,next.lens,next.defaultDepth);reset()'))fail('R259 reset must reconcile R257 and inherited R82/R132 presentation state');
for(const token of ["aria-label={`Experience mode: ${x.label}`}",'aria-pressed={experience===x.id}',"aria-label={`Experience depth: ${x.label}`}",'aria-pressed={depth===x.id}'])if(!experienceShell.includes(token))fail(`R259 accessible experience state missing ${token}`);

console.log('startup experience invariants: PASS · 44 registered routes + source-backed modes + R27 single frame + R259 atomic durable experience continuity');