import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');

async function openRoute(page,name){
 const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await trigger.count())await trigger.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
 const route=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:name})});
 await route.first().click();
 await page.waitForFunction(n=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===n,name,{timeout:15000});
}

async function prove(viewport,label){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openRoute(page,'Matter Traversal');
  const deep=page.getByRole('button',{name:/DEEP MATTER/});
  await deep.first().waitFor({state:'visible',timeout:20000});
  await deep.first().click();
  await page.waitForFunction(()=>document.querySelector('.r43-workspace-stage')?.getAttribute('data-view')==='DEEP',{timeout:20000});
  await page.waitForSelector('.r46-bio .bio281',{state:'visible',timeout:20000});
  await page.waitForSelector('.r46-bio .bio281-empirical',{state:'visible',timeout:20000});
  await page.waitForSelector('.r46-bio .bio281-allmodes',{state:'visible',timeout:20000});

  const surface=page.locator('.bio281');
  const text=await surface.innerText();
  for(const token of ['Heavy Bio Instrument Surface','INSTRUMENT READY','ALL MODES','HEAVY BIO ADDRESS','BIO DOMAIN','HEAVY BIO LAYER','LOCAL INSTRUMENT PACKET INGEST','MEASUREMENT / MODEL SEPARATION']){
    if(!text.includes(token))throw new Error(`${label} Heavy Bio surface missing ${token}`);
  }

  const domainButtons=surface.locator('.bio281-domain-grid button');
  const layerButtons=surface.locator('.bio281-layer-grid button');
  const scaleButtons=surface.locator('.bio281-scale-rail button');
  const canonRows=surface.locator('.bio281-modes article');
  if(await domainButtons.count()!==12)throw new Error(`${label} expected 12 bio domains, got ${await domainButtons.count()}`);
  if(await layerButtons.count()!==12)throw new Error(`${label} expected 12 Heavy Bio layers, got ${await layerButtons.count()}`);
  if(await scaleButtons.count()!==7)throw new Error(`${label} expected 7 physical scales, got ${await scaleButtons.count()}`);

  await surface.locator('.bio281-modes summary').click();
  if(await canonRows.count()!==62)throw new Error(`${label} expected 62 canon overlays in instrument surface, got ${await canonRows.count()}`);
  const canonText=await surface.locator('.bio281-modes').innerText();
  if(!canonText.includes('measurement authority 0'))throw new Error(`${label} canon measurement-authority boundary missing`);

  const allModes=page.locator('.bio281-allmodes');
  const allModesText=await allModes.innerText();
  for(const token of ['241 analytical channels','179 source catalog + 62 canon/calculus authorities','MEASUREMENT AUTHORITY','AFFINITY ≠ EXECUTION'])if(!allModesText.includes(token))throw new Error(`${label} complete mode fabric missing ${token}`);
  const allRows=allModes.locator('.bio281-allmodes-list article');
  const sourceRows=allModes.locator('.bio281-allmodes-list article[data-family="SOURCE_CATALOG"]');
  const authorityRows=allModes.locator('.bio281-allmodes-list article[data-family="CANON_AUTHORITY"]');
  if(await allRows.count()!==241)throw new Error(`${label} expected 241 total analytical mode channels, got ${await allRows.count()}`);
  if(await sourceRows.count()!==179)throw new Error(`${label} expected 179 source-catalog channels, got ${await sourceRows.count()}`);
  if(await authorityRows.count()!==62)throw new Error(`${label} expected 62 canon channels, got ${await authorityRows.count()}`);
  const zeroAuthority=await allRows.evaluateAll(rows=>rows.every(r=>r.textContent?.includes('measurement authority 0')));
  if(!zeroAuthority)throw new Error(`${label} at least one analytical mode channel escaped measurementAuthority=0`);
  if(await allModes.locator('line.mode-tick.source').count()!==179)throw new Error(`${label} 179-source visual ring incomplete`);
  if(await allModes.locator('line.mode-tick.canon').count()!==62)throw new Error(`${label} 62-canon visual ring incomplete`);

  for(let i=0;i<12;i++){
    await domainButtons.nth(i).click();
    await layerButtons.nth(i).click();
  }
  for(let i=0;i<7;i++)await scaleButtons.nth(i).click();

  const sample={
    id:'BROWSER-1',domain:2,layer:5,variable:'pressure_fixture',rawValue:121,unit:'mmHg',observedAt:'2026-09-10T11:59:00Z',sourceFormat:'DEVICE_PACKET',source:'R281 browser fixture',
    device:{id:'BROWSER-DEVICE',manufacturer:'fixture',model:'R281'},
    calibration:{calibratedAt:'2026-08-10T00:00:00Z',dueAt:'2027-08-10T00:00:00Z',traceability:'TRACE-BROWSER',standard:'REFERENCE-FIXTURE',gain:1.01,offset:-0.5,gainUncertainty:0.001,offsetUncertainty:0.02},
    uncertainty:{instrument:0.4,calibration:0.1,repeatability:0.2,resolution:0.1,coverageFactor:2},verified:true
  };
  const input=surface.locator('input[type=file]');
  await input.setInputFiles({name:'r281-browser.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify([sample]))});
  await page.waitForFunction(()=>document.querySelectorAll('.bio281 tbody tr').length===1,{timeout:10000});
  const row=surface.locator('tbody tr').first();
  const rowText=await row.innerText();
  for(const token of ['pressure_fixture','121.000','mmHg','INSTRUMENT READY','BROWSER-DEVICE'])if(!rowText.includes(token))throw new Error(`${label} instrument row missing ${token}`);
  if((await row.getAttribute('data-quality'))!=='INSTRUMENT_READY')throw new Error(`${label} calibrated packet did not become INSTRUMENT_READY`);

  const plotted=await surface.locator('circle.bio281-measure.instrument_ready').count();
  if(plotted<1)throw new Error(`${label} instrument measurement was not plotted in 12×12 visual field`);
  const activeRings=await surface.locator('circle.bio281-ring.active').count();
  const activeRays=await surface.locator('line.bio281-ray.active').count();
  if(activeRings!==1||activeRays!==1)throw new Error(`${label} active domain/layer geometry invalid rings=${activeRings} rays=${activeRays}`);

  const empirical=page.locator('.bio281-empirical');
  const empiricalText=await empirical.innerText();
  for(const token of ['Heavy Bio Empirical Perfection Loop','EMPIRICAL BENCHMARK / CALIBRATION PACKET','WOVEN CONTINUITY','12 DOMAIN + 12 LAYER PERFORMANCE SLICES'])if(!empiricalText.includes(token))throw new Error(`${label} empirical convergence surface missing ${token}`);
  const empiricalCases=[
    {id:'f1',domain:1,layer:1,variable:'fixture',unit:'u',observed:3,predicted:1,baseline:0,partition:'FIT',verified:true},
    {id:'f2',domain:1,layer:2,variable:'fixture',unit:'u',observed:5,predicted:2,baseline:0,partition:'FIT',verified:true},
    {id:'f3',domain:2,layer:3,variable:'fixture',unit:'u',observed:7,predicted:3,baseline:0,partition:'FIT',verified:true},
    {id:'h1',domain:1,layer:1,variable:'fixture',unit:'u',observed:9,predicted:4,baseline:6,partition:'HOLDOUT',verified:true},
    {id:'h2',domain:2,layer:2,variable:'fixture',unit:'u',observed:11,predicted:5,baseline:7,partition:'HOLDOUT',verified:true},
    {id:'h3',domain:3,layer:3,variable:'fixture',unit:'u',observed:13,predicted:6,baseline:8,partition:'HOLDOUT',verified:true},
    {id:'h4',domain:4,layer:4,variable:'fixture',unit:'u',observed:15,predicted:7,baseline:9,partition:'HOLDOUT',verified:true},
    {id:'h5',domain:5,layer:5,variable:'fixture',unit:'u',observed:17,predicted:8,baseline:10,partition:'HOLDOUT',verified:true},
    {id:'p1',domain:6,layer:6,variable:'fixture',unit:'u',observed:19,predicted:9,baseline:11,partition:'PROSPECTIVE',verified:true}
  ];
  const empiricalInput=empirical.locator('input[type=file]');
  await empiricalInput.setInputFiles({name:'r281-empirical.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(empiricalCases))});
  await page.waitForFunction(()=>document.querySelectorAll('.bio281-empirical-table tbody tr').length===9,{timeout:10000});
  const empiricalAfter=await empirical.innerText();
  for(const token of ['HOLDOUT PASS','0.0000','FIT N','HOLDOUT N'])if(!empiricalAfter.includes(token))throw new Error(`${label} empirical recursive calibration proof missing ${token}`);
  if(await empirical.locator('.bio281-empirical-slice-grid article').count()!==24)throw new Error(`${label} empirical surface must expose all 12 domain + 12 layer slices`);
  if(await empirical.locator('g[data-winner]').count()<9)throw new Error(`${label} empirical residual field did not render every accepted case`);

  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);
  if(overflow>10)throw new Error(`${label} Heavy Bio surface overflows viewport by ${overflow}px`);
  if(errors.length)throw new Error(`${label} page errors: ${errors.join(' | ')}`);
 }finally{await context.close();await browser.close()}
}

await prove({width:1440,height:1100},'desktop');
await prove({width:390,height:844},'mobile');
console.log('R281 BROWSER PASS · deferred Deep Matter mount · 12 domains × 12 layers × 7 physical scales × 241 zero-authority analytical channels + calibrated instrument packet + recursive FIT→HOLDOUT→PROSPECTIVE empirical perfection loop on desktop/mobile');
