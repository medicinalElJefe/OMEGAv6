import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R120 '+msg)};

const launcher=read('src/sovereignLauncherR117.ts');
const connection=read('src/SovereignConnectionR117.tsx');
const nav=read('src/OmegaSideNavigatorR88.tsx');
const navCss=read('src/omegaSideNavigatorR120.css');
const surface=read('src/SurfaceIntegrityR81.tsx');
const surfaceCss=read('src/fullCanonSurfaceR120.css');
const canon=read('src/fullCanonRuntimeR120.ts');
const saiRuntime=read('src/saiFullCanonR120.ts');
const sai=read('src/SAISovereignControl.tsx');
const visual=read('src/calculusVisualLawR37.ts');
const fabric=read('src/modeExecutionFabricR107.ts');
const accepted=read('src/acceptedProductionR120.ts');

// Sovereign write boundary and real Windows failure repair.
const rejectC=launcher.indexOf('if /I "%OMEGA_ROOT:~0,2%"=="C:" goto :root_fail');
const firstMkdir=launcher.indexOf('mkdir "%OMEGA_BIN%"');
must(rejectC>=0&&firstMkdir>rejectC,'C: must be rejected before any OMEGA runtime directory creation');
must(launcher.includes('set "OMEGA_HOME=%OMEGA_ROOT%\\\\OMEGA\\\\SOVEREIGN\\\\R117"'),'Sovereign writable home must be rooted under the approved root');
must(launcher.includes('set "OMEGA_LOG=%OMEGA_LOGDIR%')&&launcher.includes('set "OMEGA_AGENT=%OMEGA_BIN%')&&launcher.includes('set "OMEGA_RCWA_AGENT=%OMEGA_BIN%'),'agent/log/solver files must stay under approved-root runtime directories');
must(launcher.includes('set "TEMP=%OMEGA_TMP%"')&&launcher.includes('set "TMP=%OMEGA_TMP%"')&&launcher.includes('PIP_CACHE_DIR=%OMEGA_CACHE%')&&launcher.includes('PYTHONPYCACHEPREFIX=%OMEGA_CACHE%'),'connector temp/Python cache writes must be redirected to the approved root');
must(!launcher.includes('set "OMEGA_LOG=%TEMP%')&&!launcher.includes('set "OMEGA_AGENT=%TEMP%'),'old Windows TEMP-based OMEGA storage must be absent');
must(launcher.includes('set /p "OMEGA_FIRST_LINE="')&&launcher.includes('findstr /L /C:"OMEGA R34 local Hybrid Link agent"')&&launcher.includes('findstr /L /C:"DEFAULT_SERVER=\'https://omegav6.jeffdeweyeljefe.workers.dev\'"'),'Hybrid agent validation must use CMD-safe literal identity checks');
must(!launcher.includes("$s.Contains('OMEGA R34 local Hybrid Link agent')")&&!launcher.includes("$s.StartsWith('#!/usr/bin/env python3')"),'known inline PowerShell parser-failure validator must remain removed');
must(!launcher.includes('pip install numpy grcwa')&&!launcher.includes('winget install'),'connection bootstrap may not silently mutate the Windows/Python installation');
must(connection.includes('J-ROOT SAFE')&&connection.includes('does not silently fall back to C:')&&connection.includes('Python itself may already be installed on C:'),'ordinary Hybrid UI must explain read/execute-vs-write storage truth clearly');
must(connection.includes("live?.nativeExecutionClaimed===true")&&connection.includes('current.length>0'),'PC ONLINE must still require current authenticated host proof');

// Widenable navigation: readable desktop rail, reserved layout, compact mobile fallback.
must(nav.includes('railWide')&&nav.includes("omega.r120.navRailWide")&&nav.includes('omegaNavRailWide'),'navigator must persist and publish the wide/slim rail state');
must(nav.includes("rail-wide")&&nav.includes("rail-slim")&&nav.includes("'WIDEN'")&&nav.includes("'SLIM'"),'navigator must expose an explicit widen/slim control');
must(navCss.includes('--r120-nav-rail-wide:188px')&&navCss.includes("[data-omega-nav-rail-wide='true']"),'desktop wide rail geometry must be explicit');
must(navCss.includes('margin-left:var(--r120-nav-rail-wide)!important')&&navCss.includes('margin-left:calc(var(--r120-nav-rail-wide) + var(--r94-nav-panel))!important'),'wide and wide+expanded states must reserve real application layout width');
must(navCss.includes('@media(max-width:900px)')&&navCss.includes('.r120-width-aware-nav .r120-rail-width-toggle{display:none!important}'),'mobile must retain the compact rail instead of adding a second cluttered control');
must(!nav.includes('r88-navigator-backdrop'),'R120 navigation must remain a non-modal edge instrument rather than cover the product');

// Full Overall Canon must coordinate existing real calculus/mode fabric, not replace it with labels.
for(const token of ['PARTITION','EXCHANGE_TRANSFORM','INVARIANT_CARRY','SCAR_RESIDUAL_CARRY','RECONTEXTUALIZE_REPARTITION'])must(canon.includes(token),`master operator missing ${token}`);
for(const level of ['12','144','1728','20736','248832','61917364224'])must(canon.includes(level),`address level missing ${level}`);
must(canon.includes('REFERENCE_KERNEL_ONLY__NOT_UNIVERSAL_PHYSICAL_CONSTANTS'),'37/73 must remain explicitly non-universal reference bias');
must(canon.includes('globalModeInfluenceR107')&&canon.includes('surfaceModeFabricR107')&&canon.includes('calculusVisualLaw')&&canon.includes('unifiedFromRecord'),'Full Canon must combine the established execution/math/visual authorities');
must(canon.includes('invariantCarry')&&canon.includes('residualCarry')&&canon.includes('transformCapacity')&&canon.includes('computeReadiness')&&canon.includes('proofReadiness'),'Full Canon must expose computational carry/readiness, not only descriptive metadata');
must(fabric.includes("Catalog affinity alone never becomes execution")&&fabric.includes("Gated formulas contribute zero"),'existing executable-mode truth boundary must remain intact');
must(visual.includes('globalModeInfluenceR107')&&visual.includes('phaseSpeed')&&visual.includes('depthGain')&&visual.includes('branchSpread')&&visual.includes('trailPersistence'),'actual visual law must remain driven by executable calculus/mode influence');
must(surface.includes('compileFullCanonContextR120')&&surface.includes('canonSurfaceStyleR120')&&surface.includes("data-calculus-fabric='R107'")&&surface.includes("data-layer-contract='R104/R107'")&&surface.includes("data-canon-contract='R120'"),'record-backed surfaces must preserve R107 contract while receiving one shared R120 Full Canon successor context');
must(surfaceCss.includes('pointer-events:none')&&!surfaceCss.includes('backdrop-filter'),'Canon visual telemetry may add depth but must not cover or seize the active instrument');

// SAI: Full Canon coordination + bounded local learning, still truth-governed.
must(sai.includes("'CANON'")&&sai.includes('compileSaiFullCanonRetrievalR120')&&sai.includes('compileSaiFullCanonImprovementR120')&&sai.includes('compileSaiLocalLearningPlanR120'),'SAI must expose and consume the R120 Canon context');
must(saiRuntime.includes('requiresAuthenticatedHeartbeat:true')&&saiRuntime.includes('approvedRootOnly:true')&&saiRuntime.includes('cDriveRuntimeWritesAllowed:false'),'local-learning handoff must require current PC proof and approved non-C storage');
for(const stage of ['INDEX_APPROVED_CORPUS','CORRELATE_PROVENANCE','COMPILE_CANON_FEATURES','TRAIN_LOCAL_BOUNDED_MODEL_OR_INDEX','VALIDATE_AGAINST_HELD_EVIDENCE','RETURN_PROOF_RECEIPT'])must(saiRuntime.includes(stage),`local-learning plan missing ${stage}`);
must(saiRuntime.includes('HELD_UNTIL_CURRENT_SOVEREIGN_PC_HEARTBEAT_AND_EXPLICIT_LOCAL_JOB'),'SAI training/index execution must remain held until genuine host proof');
must(saiRuntime.includes('does not claim foundation-model pretraining')&&saiRuntime.includes('hidden weights'),'SAI must not overclaim model training/intelligence state');

for(const law of ['APPROVED_NON_C_STORAGE_BOUNDARY','CMD_SAFE_CANONICAL_AGENT_VALIDATION','CURRENT_HEARTBEAT_REMAINS_NATIVE_TRUTH','WIDENABLE_NAVIGATION_RESERVES_LAYOUT','FULL_CANON_IS_SHARED_EXECUTION_CONTEXT','ATLAS_LEVELS_REMAIN_REPRESENTATIONAL','REFERENCE_37_73_REMAINS_CONTEXTUAL','SAI_LOCAL_LEARNING_REQUIRES_HOST_PROOF','R117_AND_ALL_PRIOR_ACCEPTED_PRODUCTION_PRESERVED'])must(accepted.includes(law),`accepted production missing ${law}`);

console.log('R120 SOVEREIGN + FULL CANON POLISH PASS · non-C writable boundary · CMD-safe Hybrid validation · widenable reserved navigation · calculus-driven shared Canon context · governed SAI/local-learning handoff');
