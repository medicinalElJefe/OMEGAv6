import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const must=(ok,msg)=>{if(!ok)throw new Error('R278/R279 '+msg)};
const motion=read('src/earthMotionStateR278.ts'),earth=read('src/EarthNowInstrument.tsx'),observatory=read('src/EarthObservatoryR8.tsx'),main=read('src/main.tsx'),wrangler=read('wrangler.jsonc');
for(const token of ["OMEGA_EARTH_MOTION_STATE_R278","Open-Meteo current multi-coordinate WGS84 field","temperature_2m","cloud_cover","surface_pressure","wind_speed_10m","wind_direction_10m","compileWovenDimensionalRelativityR265","compileAdaptiveCoherenceR266","OBSERVED_TRANSITION","OPEN_METEO_CURRENT_WGS84","missing satellite pixels","admit CanonState"])must(motion.includes(token),'motion/calculus truth contract missing '+token);
must(motion.includes('const LATS=[')&&motion.includes('const LONS=[')&&motion.includes('GRID=LATS.flatMap'),'bounded global WGS84 grid missing');
for(const token of ['MOTION_PROVIDER_TIMEOUT_MS=15000','AbortSignal.timeout(MOTION_PROVIDER_TIMEOUT_MS)','AbortSignal.any([signal,providerDeadline])'])must(motion.includes(token),'bounded Open-Meteo provider deadline missing '+token);
must(motion.includes("sourceSkin:'EVIDENCE'")&&motion.includes("targetSkin:'RENDER'")&&motion.includes('sourceResolution:20736,targetResolution:20736'),'R265 EVIDENCE→RENDER frame contract missing');
for(const token of ['fetchEarthMotionStateR278',"EarthInstrumentMode='PLANET'|'MOTION'|'EVIDENCE'|'SPACE'",'drawClouds','drawParticles','Missing source pixels remain missing'])must(earth.includes(token),'Earth Now successor contract missing '+token);
for(const token of ["data-motion-state={motionBusy?'LOADING':motionError?'ERROR':motion?'RETURNED':'IDLE'}","data-motion-observed-at={motion?.observedAt||''}","data-motion-provider={motion?.provider||''}","data-motion-refresh-generation={motionRefreshGeneration}","setMotionRefreshGeneration(v=>v+1)"])must(earth.includes(token),'R431 returned motion refresh receipt missing '+token);
must(earth.toLowerCase().includes('returned observations remain distinct'),'Earth Now successor contract must preserve observed-versus-derived separation');
// R862: provider outages must never silently present retained observations as current.
const staleNotice='Global motion refresh unavailable; any displayed observations are last-known, not current.';
must(earth.split(staleNotice).length===3,'both automatic and manual refresh failures must label retained evidence stale');
const enhancer=read('src/earthVisualEnhancerR278.ts');
for(const token of ["current=null","__OMEGA_R278_EARTH_MOTION=null","omega:r278-earth-motion-unavailable"])must(enhancer.includes(token),'failed overlay refresh must invalidate its previously rendered current field '+token);

must(!fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8').includes("observed!==before"),'R431 live R372 proof must not equate source timestamp inequality with successful refresh execution');
for(const token of ["data-motion-refresh-generation","beforeRefreshGeneration","refreshedGeneration<=beforeRefreshGeneration","['RETURNED','ERROR'].includes","provider-unavailable motion fabricated returned-provider evidence","failed motion refresh incorrectly advanced successful-refresh receipt","failed refresh did not preserve last-known returned motion evidence"])must(fs.readFileSync('tests/r372-live-earth-total-interaction-browser-e2e.mjs','utf8').includes(token),'R431/R475 live R372 provider/refresh truth proof missing '+token);
for(const token of ["type EarthView='SATELLITE'|'PLANET'|'MOTION'|'EVIDENCE'|'WEATHER'|'SPACE'|'GROUND'|'CALCULUS'",'OBSERVED SATELLITE SURFACE','FULL-DISK OBSERVATION PAIR','EarthGroundTraversalR9','EarthLivingFieldR36','aria-pressed={view===x.id}'])must(observatory.includes(token),'Earth menu/source-surface contract missing '+token);
must(!main.includes("import('./earthVisualEnhancerR278')"),'R279 must not globally inject the retired R278 wire overlay into unrelated panels');
must(wrangler.includes('"main": "src/workerR116.js"'),'Earth visual successor must not replace the proven production Worker spine');
for(const forbidden of ['CanonState=','nativeExecutionClaimed=true','OMEGA_RUNTIME.put','R147 dispatch override'])must(!motion.includes(forbidden)&&!earth.includes(forbidden),'Earth visual path may not acquire execution or Canon authority: '+forbidden);
console.log('R278/R279 EARTH MOTION PASS · returned WGS84 current field retained · canonical R265/R266 calculus retained · visualization moved into Earth Now · no global wire injection · no fabricated satellite pixels · existing worker/execution/Canon authority preserved');
await import('./r279-earth-truth-navigation-invariants.mjs');

must(motion.includes("typeof v==='number'&&Number.isFinite(v)?v:null"),'R1030 null or missing values must never become measured zero');
must(motion.includes('raw.length!==GRID.length')&&motion.includes('no complete observation samples'),'R1030 malformed or empty global observations must not be reported returned');
console.log('R1030 SOURCE PASS: refuse incomplete grids and absent observations; preserve actual numeric zero.');
