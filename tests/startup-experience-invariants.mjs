import fs from 'node:fs';

const app=fs.readFileSync('src/App.tsx','utf8');
const home=fs.readFileSync('src/OmegaHome.tsx','utf8');
const homeR71=fs.readFileSync('src/OmegaHomeR71.tsx','utf8');
const daily=fs.readFileSync('src/dailyBrief.ts','utf8');
const phase=fs.readFileSync('src/PhaseWheel.tsx','utf8');
const bridge=fs.readFileSync('src/ResponsiveRuntimeShell.tsx','utf8');
const shell=fs.readFileSync('src/SingleFrameRuntimeShellR27.tsx','utf8');
const frameCss=fs.readFileSync('src/singleFrameR27.css','utf8');
const modeRuntime=fs.readFileSync('src/sourceBackedModeRuntimeR21.ts','utf8');
const experience=fs.readFileSync('src/experienceR4.css','utf8');
const experienceShell=fs.readFileSync('src/OmegaExperienceShellR257.tsx','utf8');
const experienceContext=fs.readFileSync('src/OmegaExperienceContextR257.tsx','utf8');
const experienceCss=fs.readFileSync('src/omegaExperienceShellR257.css','utf8');
const universal=fs.readFileSync('src/OmegaUniversalInterfaceR263.tsx','utf8');
const universalRegistry=fs.readFileSync('src/omegaUniversalInterfaceR263.ts','utf8');
const universalCss=fs.readFileSync('src/omegaUniversalInterfaceR263.css','utf8');
const hybrid=fs.readFileSync('src/HybridLinkR32.tsx','utf8');
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

if(!experienceContext.includes("const[state,setState]=useState<OmegaExperienceStateR257>(read)"))fail('R259 experience state must be one atomic state object');
if(experienceContext.includes('setExperienceState')||experienceContext.includes('setDepthState')||experienceContext.includes('setImmersiveState'))fail('R259 may not regress to independently persisted experience state slices');
for(const token of ['setExperienceProfile','window.localStorage.setItem(KEY,JSON.stringify(state))',"window.addEventListener('storage',sync)","window.removeEventListener('storage',sync)"])if(!experienceContext.includes(token))fail(`R259 durable experience continuity missing ${token}`);
if(!experienceShell.includes('setExperienceProfile(id,next.defaultDepth)'))fail('R259 experience selection must atomically bind mode + default depth');
if(!experienceShell.includes('const resetAll=')||!experienceShell.includes('persistLegacyView(next.workspace,next.lens,next.defaultDepth);reset()'))fail('R259 reset must reconcile R257 and inherited R82/R132 presentation state');
for(const token of ["aria-label={`Experience mode: ${x.label}`}",'aria-pressed={experience===x.id}',"aria-label={`Experience depth: ${x.label}`}",'aria-pressed={depth===x.id}'])if(!experienceShell.includes(token))fail(`R259 accessible experience state missing ${token}`);

for(const token of ["OMEGA_EXPERIENCES_R257","omega-r257-experience-change","setDomain(profile.workspace as DomainId)","setMode(profile.lens as FieldMode)","setDepth(detail.depth==='FOCUS'?'FOCUS':'DEEP')"])if(!homeR71.includes(token))fail(`R260 live Home experience application missing ${token}`);
for(const token of ["aria-pressed={depth==='FOCUS'}","aria-pressed={depth==='DEEP'}","aria-pressed={domain===w.id}","aria-pressed={mode===m.id}","aria-pressed={inspectorTab==='STATE'}","aria-pressed={selectedRole===role}","aria-label='Ask OMEGA'","role='status' aria-live='polite'","className='r96-now' aria-live='polite'"])if(!homeR71.includes(token))fail(`R260 accessible selected/live state missing ${token}`);
if(!homeR71.includes("window.removeEventListener('omega-r257-experience-change',syncExperience as EventListener)"))fail('R260 experience listener must clean up on Home unmount');

for(const token of ["const safeStore=","safeStore('omega.v6.panel'","role='alert' aria-live='assertive'","role='status' aria-live='polite' aria-busy='true'"])if(!app.includes(token))fail(`R261.1 browser recovery semantics missing ${token}`);
for(const token of ["const same=","event.newValue===null?DEFAULT","setState(prev=>same(prev,next)?prev:next)","setState(prev=>prev.experience===experience?prev", "setState(prev=>same(prev,DEFAULT)?prev:DEFAULT)"])if(!experienceContext.includes(token))fail(`R261.1 low-churn durable experience state missing ${token}`);
for(const token of ["type='button'","role='region' aria-label='Immersive experience controls'","aria-label='Open all OMEGA systems'","role='status' aria-live='polite'"])if(!experienceShell.includes(token))fail(`R261.1 shell control semantics missing ${token}`);
for(const token of ['min-height:100dvh','env(safe-area-inset-top,0px)',':focus-visible','@media(hover:hover)','@media(forced-colors:active)','min-height:44px','overscroll-behavior-inline:contain'])if(!experienceCss.includes(token))fail(`R261.1 responsive/accessibility polish missing ${token}`);
if(experienceCss.includes('.r257-stage{min-width:0;isolation:isolate}'))fail('R261.1 stage may not trap the persistent navigator in an isolated stacking context');
if(/\.r257-shell\{[^}]*z-index\s*:/.test(experienceCss))fail('R261.1 shell root may not create a stacking context above the persistent navigator');

// R263: universal use fabric must expand capability without constricting specialist/Hybrid operation.
if(!experienceShell.includes("import OmegaUniversalInterfaceR263")||!experienceShell.includes("!immersive&&<OmegaUniversalInterfaceR263 onNavigate={onNavigate} compact={!home}/>"))fail('R263 universal interface must stay full on Home and compact on specialist surfaces');
for(const token of ["'DISCOVER'","'UNDERSTAND'","'LEARN'","'VISUALIZE'","'COMPARE'","'CREATE'","'OPERATE'","'PROVE'","'PLAY'"])if(!universalRegistry.includes(token))fail(`R263 activity fabric missing ${token}`);
for(const token of ["'OBSERVED'","'DERIVED'","'RECONSTRUCTED'","'SIMULATED'","'FORECAST'","'REFERENCE'","'GENERATED'","'USER_ASSERTED'","'UNKNOWN'"])if(!universalRegistry.includes(token))fail(`R263 information classification missing ${token}`);
for(const token of ["'REALITY'","'KNOWLEDGE'","'MODEL'","'COMPUTATION'","'ACTION'","'EXPERIENCE'","'CREATION'","'CONTINUITY'","'PROOF'"])if(!universalRegistry.includes(token))fail(`R263 interoperability plane missing ${token}`);
for(const token of ['DATA_CLASSIFICATION_TRAVELS_WITH_INFORMATION','OBSERVED_NEVER_IMPLIED_FROM_GENERATED','TOOL_SELECTION_NEVER_CREATES_EXECUTION_AUTHORITY','R147_DISPATCH_UNCHANGED','R141_RETURN_PROOF_UNCHANGED','R240_SOURCE_PROMOTION_UNCHANGED','R125_CANONSTATE_UNCHANGED','CI_YML_PRODUCTION_WRITER_UNCHANGED'])if(!universalRegistry.includes(token))fail(`R263 truth/authority contract missing ${token}`);
for(const token of ["role='search'","aria-label='Current information classification'","aria-label='OMEGA interoperability planes'","setExperienceProfile(next.experience","resolveActivityR263(intent)","type='submit' disabled={!intent.trim()}","compact=false","data-r263-compact"])if(!universal.includes(token))fail(`R263 usable intent/compact interface missing ${token}`);
for(const token of ['grid-template-columns:repeat(9',':focus-visible','min-height:44px','@media(prefers-reduced-motion:reduce)','@media(forced-colors:active)', '.r263-universal.compact', '.r263-universal.compact .r263-brand{display:none}'])if(!universalCss.includes(token))fail(`R263 desktop/mobile non-constrictive styling missing ${token}`);
if(/fetch\(|\/api\//.test(universal+universalRegistry))fail('R263 presentation/router layer may not create a second network or execution owner');
const operational=['<SovereignConnectionR117/>','<HybridHostIntelligenceR238/>','<HybridResourceGovernorR239/>','<HybridActionRuntimeR247/>','<HybridOutcomeClosureR254/>','<HybridCommandDeckR237/>','<HybridHostEffectsR212/>'];
let previous=-1;for(const token of operational){const index=hybrid.indexOf(token);if(index<0)fail(`R263 Hybrid operational surface missing ${token}`);if(index<=previous)fail(`R263 Hybrid operational controls must remain primary and ordered: ${token}`);previous=index}
for(const token of ['<HybridExperienceLedgerR255/>','<HybridParallelDevelopmentR262/>'])if(hybrid.indexOf(token)<previous)fail(`${token} may not push primary Hybrid operational controls below telemetry/development surfaces`);

console.log('startup experience invariants: PASS · 44 routes + R259/R260 continuity + R261.1 browser polish + R263 universal interface + compact specialist viewport + primary Hybrid controls preserved');
