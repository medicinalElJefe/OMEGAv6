import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R120 '+msg)};
const launcher=read('src/sovereignLauncherR117.ts');
const surface=read('src/SovereignConnectionR117.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR120.css');
const canon=read('src/capability/canonContinuityRuntimeR120.ts');
const ribbon=read('src/RouteOutputRibbonR111.tsx');
const agent=read('public/omega-hybrid-agent.py');
const federationSurface=read('src/FederationSurfaceFabricR119.tsx');
const surfaceRegistry=JSON.parse(read('public/omega-surface-fabric-r120.json'));

must(launcher.includes("OMEGA_VERSION=R120"),'root-safe successor version missing');
must(launcher.includes('else if exist J:')&&launcher.includes('goto :root_fail'),'launcher must prefer J and refuse silent system-drive fallback');
must(launcher.includes('if /I "!OMEGA_ROOT:~0,2!"=="C:" goto :root_fail'),'launcher must explicitly reject C as OMEGA runtime root');
must(launcher.includes('OMEGA_RUNTIME=!OMEGA_ROOT!OMEGA_SOVEREIGN')&&launcher.includes('OMEGA_AGENT_DIR=!OMEGA_RUNTIME!')&&launcher.includes('OMEGA_RUN_DIR=!OMEGA_RUNTIME!')&&launcher.includes('OMEGA_TMP=!OMEGA_RUNTIME!'),'agents/logs/temp must be rooted inside the approved OMEGA runtime');
must(launcher.includes('set "TEMP=!OMEGA_TMP!"')&&launcher.includes('set "TMP=!OMEGA_TMP!"')&&launcher.includes('PYTHONPYCACHEPREFIX=!OMEGA_TMP!'),'child runtime temp and bytecode must stay under approved root');
must(!launcher.includes('set "OMEGA_LOG=%TEMP%')&&!launcher.includes('set "OMEGA_AGENT=%TEMP%')&&!launcher.includes('else (set "OMEGA_ROOT=%~dp0")'),'old C-prone temp/download-directory fallbacks must be gone');
must(!launcher.includes('Invoke-WebRequest')&&!launcher.includes('powershell -NoProfile'),'fragile inline PowerShell validator/fallback must be removed');
must(launcher.includes("'OMEGA R34 local Hybrid Link agent' in s")&&launcher.includes("'Pairing is explicit.' in s")&&launcher.includes("Path(sys.argv[1]).read_text"),'canonical agent must be validated by Python without shell-quote ambiguity');
must(launcher.includes('/api/hybrid/agent-download?r117=1&r120=1')&&launcher.includes('/api/federation/rcwa/agent-download?r117=1&r120=1'),'successor launcher must preserve inherited R117 route compatibility while marking R120');
must(agent.includes('root-confined')&&agent.includes('secure_path(root')&&agent.includes('Path escapes approved root.'),'served agent must retain root confinement');
must(surface.includes('DOWNLOAD ROOT-SAFE R120 CONNECTOR')&&surface.includes('never falls back to C:'),'ordinary Hybrid UI must explain and expose the root-safe connector');

must(nav.includes('railWide')&&nav.includes("omega.r120.navWide")&&nav.includes('omegaNavWide'),'navigation must persist independent compact/wide state');
must(nav.includes('WIDE MENU')&&nav.includes('Ctrl⇧M'),'wide-label rail must be directly discoverable');
must(navCss.includes("data-omega-nav-wide='true'")&&navCss.includes('--r120-nav-wide:166px'),'desktop wide rail must reserve deterministic width');
must(navCss.includes("data-omega-nav-expanded='true'")&&navCss.includes('margin-left:calc(var(--r120-nav-wide) + var(--r94-nav-panel))'),'full navigator must reserve rail + panel width rather than cover the active app');
must(navCss.includes('@media(max-width:900px)')&&navCss.includes('.r120-rail-width-toggle{display:none}'),'mobile must retain compact navigation behavior regardless of media-block formatting');

for(const phase of ['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_RESIDUAL_CARRY','RECONTEXTUALIZE_REPARTITION'])must(canon.includes(`'${phase}'`),'missing Woven Continuity phase '+phase);
for(const primitive of ['PARENT','INTERACTION','SCAR','CONTINUITY','COMPRESSION','SKIN','INTERPRETATION','BEHAVIOR'])must(canon.includes(`'${primitive}'`),'missing RSC loop primitive '+primitive);
for(const level of ['12','144','1728','20736','248832','61917364224'])must(canon.includes(level),'missing atlas resolution level '+level);
must(canon.includes("ORIENTATION_STATES_R120=[-1,0,1]")&&canon.includes("orientation:'SIGNED_FRAME'|'DECLARED_FRAME'"),'signed orientation must be factored from structure');
must(canon.includes('37/73 remain reference-kernel parameters unless independently validated'),'37/73 truth boundary missing');
must(canon.includes('not literal physical dimensions'),'atlas physical-dimension truth boundary missing');
must(ribbon.includes('routeCanonTraceR120')&&ribbon.includes('FULL OVERALL CANON')&&ribbon.includes('RSC ·'),'shared canon computation must be surfaced across route output contracts');

for(const url of ['https://omegav6.jeffdeweyeljefe.workers.dev/','https://omega-genesis-v1.jeffdeweyeljefe.workers.dev/','https://omega-sovereign-convergence.foundasound.chatgpt.site/','https://omega-living-light-etching-private-woven2.vercel.app/'])must(federationSurface.includes(url),'surface fabric missing requested URL '+url);
must(federationSurface.includes('R120 · FULL OVERALL CANON SURFACE FABRIC'),'surface fabric must expose the current correlated successor');
must(federationSurface.includes('HISTORICAL_SOVEREIGN_SURFACE')&&federationSurface.includes('not a current pairing endpoint'),'Foundasound must remain historical and never regain launcher/heartbeat authority');
must(federationSurface.includes('R115 Genesis machine adapter')&&federationSurface.includes('R115 Optical machine adapter'),'human surfaces and bounded machine services must remain explicitly separated');

must(surfaceRegistry.schema==='OMEGA_SURFACE_FABRIC_R120'&&surfaceRegistry.revision==='R120','surface registry revision mismatch');
must(surfaceRegistry.canonicalAuthority==='OMEGAv6','OMEGAv6 must remain sole global admission authority');
must(Array.isArray(surfaceRegistry.surfaces)&&surfaceRegistry.surfaces.length===4,'surface registry must preserve exactly four authority roles');
const v6=surfaceRegistry.surfaces.find(x=>x.id==='omega-v6'),genesis=surfaceRegistry.surfaces.find(x=>x.id==='omega-genesis'),optical=surfaceRegistry.surfaces.find(x=>x.id==='omega-optical'),sovereign=surfaceRegistry.surfaces.find(x=>x.id==='omega-sovereign');
must(v6?.mayMutateGlobalCanonState===true&&[genesis,optical,sovereign].every(x=>x?.mayMutateGlobalCanonState===false),'surface authority mutation boundary regressed');
must(genesis?.url==='https://omega-genesis-v1.jeffdeweyeljefe.workers.dev/','Genesis human surface mismatch');
must(optical?.url==='https://omega-living-light-etching-private-woven2.vercel.app/'&&optical.aliases.includes('https://omega-living-light-etching-private-woven2.vercel.app/?utm_source=chatgpt.com'),'Optical clean URL/alias normalization missing');
must(sovereign?.historicalHumanSurface==='https://omega-sovereign-convergence.foundasound.chatgpt.site/'&&String(sovereign.historicalSurfacePolicy).includes('Never pairing'),'retired Sovereign boundary missing');
must(surfaceRegistry.hybrid.connectorFilename==='START_OMEGA_PC_LINK_R120_ROOT_SAFE.cmd'&&String(surfaceRegistry.hybrid.systemDrivePolicy).includes('MUST NOT fall back to C:'),'root-safe connector registry mismatch');
must(String(surfaceRegistry.referenceKernel.truthBoundary).includes('37/73 remain reference-kernel')&&String(surfaceRegistry.atlasTruthBoundary).includes('not literal physical dimensions'),'canon truth boundaries missing from shared surface registry');

console.log('R120 PASS · C-write-safe OMEGA runtime · Hybrid validator repaired · compact/wide/full navigation · Full Overall Canon continuity runtime promoted · all requested surfaces correlated under one authority registry');
