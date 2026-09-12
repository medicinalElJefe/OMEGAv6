import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function openRoute(page,name){const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await trigger.count()&&await trigger.first().isVisible())await trigger.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});const route=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:name})});await route.first().click();await page.waitForFunction(n=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===n,name,{timeout:15000});}

async function prove(viewport,label){
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(`${base}/?r284=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});await openRoute(page,'Matter Traversal');
  const deep=page.getByRole('button',{name:/DEEP MATTER/});await deep.first().waitFor({state:'visible',timeout:20000});await deep.first().click();await page.waitForFunction(()=>document.querySelector('.r43-workspace-stage')?.getAttribute('data-view')==='DEEP',{timeout:20000});
  const workbench=page.locator('.bio284');await workbench.waitFor({state:'visible',timeout:20000});const initial=await workbench.innerText();
  for(const token of ['241-Channel Mode Workbench','MEASUREMENT AUTHORITY 0','ALL 241','SOURCE 179','CANON 62','EVIDENCE → AUTHORITY LADDER'])if(!initial.includes(token))throw new Error(`${label}: R284 workbench missing ${token}`);
  if(!initial.includes('Instrument observation')||!initial.includes('Mode hypothesis')||!initial.includes('Authorized clinical influence'))throw new Error(`${label}: evidence-authority education ladder incomplete`);

  const canon=workbench.getByRole('button',{name:'CANON 62'});await canon.click();await page.waitForFunction(()=>document.querySelectorAll('.bio284-mode-list > button').length===62,{timeout:10000});
  const buttons=workbench.locator('.bio284-mode-list > button');await buttons.nth(0).click();const selectedText=await workbench.locator('.bio284-detail').innerText();for(const token of ['Measurement authority','0','VALIDATION REQUIREMENT','Truth boundary'])if(!selectedText.includes(token))throw new Error(`${label}: selected mode detail missing ${token}`);
  await workbench.getByRole('button',{name:/PIN FOR COMPARE|COMPARE PINNED/}).click();await buttons.nth(1).click();await workbench.locator('.bio284-compare').waitFor({state:'visible',timeout:10000});const compareText=await workbench.locator('.bio284-compare').innerText();if(!compareText.includes('READ-ONLY COMPARISON')||!compareText.includes('Measurement authority Δ'))throw new Error(`${label}: read-only comparison contract missing`);

  const source=workbench.getByRole('button',{name:'SOURCE 179'});await source.click();await page.waitForFunction(()=>document.querySelectorAll('.bio284-mode-list > button').length===179,{timeout:10000});
  const search=workbench.getByLabel('Search Heavy Bio modes');await search.fill('zzzz-no-channel');await workbench.locator('.bio284-no-results').waitFor({state:'visible',timeout:10000});const noResult=await workbench.locator('.bio284-no-results').innerText();if(!noResult.includes('No channels match these filters')||!noResult.includes('No analytical state was changed'))throw new Error(`${label}: empty-filter truth boundary missing`);await search.fill('');

  const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(overflow>10)throw new Error(`${label}: R284 workbench overflows viewport by ${overflow}px`);
  if(errors.length)throw new Error(`${label}: page errors: ${errors.join(' | ')}`);
 }finally{await context.close();await browser.close()}
}
await prove({width:1440,height:1200},'desktop');
await prove({width:390,height:844},'mobile');
console.log('R284 BROWSER PASS · 241-channel menus · 179/62 family filters · mode-specific metadata visual · evidence ladder · read-only comparison · zero measurement authority · desktop/mobile containment');
