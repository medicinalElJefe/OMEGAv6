import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));

await page.route('**/api/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'OK'})}));
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,paired:false,devices:[],jobs:[],missions:[]})}));
await page.route('**/omega-federation.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_TEST',nodes:[]})}));

await page.goto(base,{waitUntil:'networkidle'});
for(const text of ['All tools','System map','START HERE','FOCUS','DEEP'])if(!(await page.getByText(text,{exact:true}).count()))throw new Error(`R239 Home missing ${text}`);
for(const workspace of ['Command','Explore','Intelligence','Evidence','Build','System'])if(!(await page.getByRole('button',{name:new RegExp(`^${workspace}`)}).count()))throw new Error(`R239 workspace missing ${workspace}`);

await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const contextRoutes=page.locator('.r96-context-card>div');
if(await contextRoutes.isVisible())throw new Error('R239 FOCUS still exposes duplicate full workspace route list');
const quick=page.locator('.r96-quick-card button');
if(await quick.count()!==4)throw new Error(`R239 expected 4 universal quick actions, saw ${await quick.count()}`);
const quickText=await page.locator('.r96-quick-card').innerText();
for(const token of ['Command','Hybrid','Earth','Proof'])if(!quickText.includes(token))throw new Error(`R239 universal quick set missing ${token}`);
for(const forbidden of ['SAI Lab','Visual Instrument'])if(quickText.includes(forbidden))throw new Error(`R239 quick set still duplicates workspace specialist ${forbidden}`);

const allTools=page.locator('.r96-header-actions button').filter({hasText:'All tools'}).first();
await allTools.click();
const nav=page.locator('#omega-global-navigator');
await nav.waitFor({state:'visible'});
const navText=await nav.innerText();
for(const token of ['All tools','Command','Explore','Intelligence','Evidence','Build','System','PRIMARY','SUPPORT','EXPERT'])if(!navText.includes(token))throw new Error(`R239 navigator missing ${token}`);
for(const label of ['Open Command Center','Open Hybrid Link','Open Earth Now','Open Evidence and Proof','Browse all registered OMEGA tools','Browse full software and capability map'])if(!(await page.getByLabel(label).count()))throw new Error(`R239 permanent rail missing ${label}`);
if(await page.getByLabel('Open Woven Continuity traversal instrument').count())throw new Error('R239 permanent rail still contains specialized Weave shortcut');
if(await page.getByLabel('Open Matter Traversal').count())throw new Error('R239 permanent rail still contains specialized Matter shortcut');

const tech=nav.getByRole('button',{name:'Technical',exact:true});
if(await tech.getAttribute('aria-pressed')!=='false')throw new Error('R239 technical metadata should default off');
await tech.click();
if(await nav.getByRole('button',{name:'Simple view',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('R239 technical detail toggle did not activate');
await page.keyboard.press('Escape');
if(await nav.isVisible())throw new Error('R239 Escape did not close navigator');

await page.getByRole('button',{name:/^Build/}).first().click();
const startHere=page.locator('.r132-primary-strip');
const startText=await startHere.innerText();
for(const token of ['BUILD · START HERE','Projects','Development','Build Out','ALL 6 TOOLS'])if(!startText.includes(token))throw new Error(`R239 Build start-here strip missing ${token}`);

await page.getByRole('button',{name:'DEEP',exact:true}).click();
await page.locator('.r96-context-card').waitFor({state:'visible'});
if(!(await page.locator('.r96-context-card>div').isVisible()))throw new Error('R239 DEEP must restore complete workspace route list');

await page.setViewportSize({width:390,height:844});
await allTools.click();
await nav.waitFor({state:'visible'});
const box=await nav.boundingBox();
if(!box||box.width>365)throw new Error(`R239 mobile navigator too wide: ${box?.width}`);
if(pageErrors.length)throw new Error(`R239 page errors: ${pageErrors.join(' | ')}`);

console.log('R239 BUILT BROWSER PASS · Home hierarchy · focus/deep density · 6 workspaces · universal rail · grouped all-tools registry · technical detail opt-in · Escape close · mobile width');
await browser.close();
