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

  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);
  if(overflow>10)throw new Error(`${label} Heavy Bio surface overflows viewport by ${overflow}px`);
  if(errors.length)throw new Error(`${label} page errors: ${errors.join(' | ')}`);
 }finally{await context.close();await browser.close()}
}

await prove({width:1440,height:1100},'desktop');
await prove({width:390,height:844},'mobile');
console.log('R281 BROWSER PASS · 12 domains × 12 layers × 7 physical scales × 241 zero-authority analytical channels (179 source + 62 canon) + calibrated instrument packet visualized on desktop/mobile');
