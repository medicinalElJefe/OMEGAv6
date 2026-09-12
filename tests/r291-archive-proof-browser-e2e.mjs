import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];

async function openArchive(page){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded!=='true')){await expand.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true')}
 const search=page.locator('.r88-search input');
 await search.fill('Archive Census');
 const route=page.locator('.r89-flat-route[data-route-name="Archive Census"]');
 await route.waitFor({state:'visible',timeout:10000});
 await route.click();
 await page.waitForSelector('.archive-genome-r288 .rsc290-lab',{timeout:20000});
 await page.waitForSelector('.r290-recovery',{timeout:20000});
}

async function prove(name,viewport){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport,deviceScaleFactor:1});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(`${base}/?r291archive=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openArchive(page);

  const lab=page.locator('.rsc290-lab');
  const boundary=(await lab.locator('.rsc290-boundary').innerText()).toUpperCase();
  if(!boundary.includes('SYMBOLIC_MODEL_ONLY_NOT_EXTERNAL_SCIENTIFIC_PROOF'))throw new Error(`${name}: RSC model boundary missing`);
  if((await lab.getAttribute('data-proof-state'))!=='NOT_RUN')throw new Error(`${name}: proof lab must start NOT_RUN`);

  await lab.getByRole('button',{name:/Run RSC proof/i}).click();
  await page.waitForFunction(()=>document.querySelector('.rsc290-lab')?.getAttribute('data-proof-state')==='PASS',undefined,{timeout:10000});
  const passText=await lab.locator('.rsc290-receipt').innerText();
  if(!/SHA-256\s+[0-9a-f]{64}/i.test(passText))throw new Error(`${name}: PASS receipt missing deterministic SHA-256`);
  if(!/scientific proof\s+false/i.test(passText)||!/physical law\s+false/i.test(passText)||!/Canon mutation\s+false/i.test(passText))throw new Error(`${name}: PASS receipt crossed model/science/Canon boundary`);

  const counter=lab.getByRole('button',{name:/Counterexamples controlled/i});
  await counter.click();
  await lab.getByRole('button',{name:/Run RSC proof/i}).click();
  await page.waitForFunction(()=>document.querySelector('.rsc290-lab')?.getAttribute('data-proof-state')==='UNPROVED',undefined,{timeout:10000});
  const holdText=await lab.locator('.rsc290-receipt').innerText();
  if(!/COUNTEREXAMPLE_UNCONTROLLED/.test(holdText)||!/Translation τ\s+DENIED/i.test(holdText))throw new Error(`${name}: uncontrolled counterexample did not fail closed`);

  const recovery=page.locator('.r290-recovery');
  const stateSelect=recovery.locator('select').first();
  await stateSelect.selectOption({label:'RECOVERABLE'});
  const recoverable=await recovery.locator('.r290-recovery-card:visible').count();
  if(recoverable<1)throw new Error(`${name}: RECOVERABLE filter produced no recovery bindings`);
  const menuSelect=recovery.locator('select').nth(1);
  const options=await menuSelect.locator('option').allTextContents();
  if(options.length<2)throw new Error(`${name}: master-menu recovery filter has no concrete menus`);
  await stateSelect.selectOption({label:'ALL'});

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>10)throw new Error(`${name}: archive/RSC convergence causes ${overflow}px document overflow`);
  if(errors.length)throw new Error(`${name}: page errors ${errors.join(' | ').slice(0,3000)}`);
  console.log(`R291 ${name.toUpperCase()} ARCHIVE PROOF PASS · symbolic PASS receipt + uncontrolled-counterexample HOLD · recovery filters live · overflow ${overflow}px`);
 }finally{await context.close();await browser.close()}
}

for(const [name,viewport] of viewports)await prove(name,viewport);
console.log('R291 ARCHIVE/RSC BROWSER CONVERGENCE PASS · Archive Census mounts deep recovery + symbolic RSC proof VM · deterministic receipt · counterexamples fail closed · desktop/mobile contained · no page errors');