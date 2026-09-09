import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));

await page.route('**/api/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'OK'})}));
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,paired:false,devices:[],jobs:[],missions:[]})}));
await page.route('**/omega-federation.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_TEST',nodes:[]})}));

await page.goto(base,{waitUntil:'networkidle'});
for(const text of ['All tools','System map','FOCUS','DEEP'])if(!(await page.getByText(text,{exact:true}).count()))throw new Error(`R239 Home missing ${text}`);
const initialStartHere=page.locator('.r132-primary-strip');
await initialStartHere.waitFor({state:'visible'});
if(!(await initialStartHere.innerText()).includes('START HERE'))throw new Error('R239 Home primary strip missing START HERE semantics');
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
const nav=page.locator('#omega-global-navigator');
const openAllTools=async()=>{if(!(await nav.isVisible()))await page.getByLabel('Browse all registered OMEGA tools').click();await nav.waitFor({state:'visible'});const all=nav.getByRole('button',{name:/^ALL\s+44$/});if(await all.count())await all.click()};
await allTools.click();
await nav.waitFor({state:'visible'});
const contextualText=await nav.innerText();
if(!contextualText.includes('Explore tools')||!contextualText.includes('Explore · Inspect matter, traversal, Earth and visual state.'))throw new Error('R239 Home All tools did not preserve the active Explore workspace context');
if(await nav.locator('.r89-flat-route').count()!==9)throw new Error(`R239 contextual Explore browser expected 9 routes, saw ${await nav.locator('.r89-flat-route').count()}`);
for(const label of ['Open Command Center','Open Hybrid Link','Open Earth Now','Open Evidence and Proof','Browse all registered OMEGA tools','Browse full software and capability map'])if(!(await page.getByLabel(label).count()))throw new Error(`R239 permanent rail missing ${label}`);
if(await page.getByLabel('Open Woven Continuity traversal instrument').count())throw new Error('R239 permanent rail still contains specialized Weave shortcut');
if(await page.getByLabel('Open Matter Traversal').count())throw new Error('R239 permanent rail still contains specialized Matter shortcut');

// Every workspace filter must remain directly operable from the contextual browser.
for(const workspace of ['Command','Explore','Intelligence','Evidence','Build','System']){
 const button=nav.getByRole('button',{name:new RegExp(`^${workspace}\\s+\\d+$`)});
 if(await button.count()!==1)throw new Error(`R239 navigator workspace filter missing ${workspace}`);
 await button.click();
 if(await nav.locator('.r89-flat-route').count()<1)throw new Error(`R239 navigator workspace ${workspace} exposes no registered routes`);
}

// ALL is a deliberate second step from a contextual Home launch and must restore the complete registry.
await nav.getByRole('button',{name:/^ALL\s+44$/}).click();
const globalText=await nav.innerText();
for(const token of ['All tools','Command','Explore','Intelligence','Evidence','Build','System','PRIMARY','SUPPORT','EXPERT'])if(!globalText.includes(token))throw new Error(`R239 global navigator missing ${token}`);
const search=nav.getByLabel('Search all registered OMEGA applications');
await search.fill('Hybrid');
if(await nav.locator('.r89-flat-route').count()<1)throw new Error('R239 complete-registry search cannot find Hybrid');
await search.fill('');
const routeRows=nav.locator('.r89-flat-route');
if(await routeRows.count()!==44)throw new Error(`R239 All Tools must expose all 44 registered routes, saw ${await routeRows.count()}`);
const routeNames=await routeRows.locator('b').allTextContents();
if(new Set(routeNames).size!==44)throw new Error('R239 All Tools contains duplicate/missing route identities');

const tech=nav.getByRole('button',{name:'Technical',exact:true});
if(await tech.getAttribute('aria-pressed')!=='false')throw new Error('R239 technical metadata should default off');
await tech.click();
if(await nav.getByRole('button',{name:'Simple view',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('R239 technical detail toggle did not activate');
await page.keyboard.press('Escape');
if(await nav.isVisible())throw new Error('R239 Escape did not close navigator');

// Prove every registered destination actually routes through the built product. This is navigation-only:
// no command/action button is invoked inside a destination.
for(const routeName of routeNames){
 await openAllTools();
 const row=nav.locator('.r89-flat-route').filter({hasText:routeName}).first();
 if(await row.count()!==1||await row.locator('b').innerText()!==routeName)throw new Error(`R239 registered destination disappeared during sweep: ${routeName}`);
 await row.click();
 await page.waitForFunction(name=>document.querySelector('.r94-rail-current')?.getAttribute('title')===name,routeName);
 const current=await page.locator('.r94-rail-current').getAttribute('title');
 if(current!==routeName)throw new Error(`R239 destination did not become active: expected ${routeName}, saw ${current}`);
 const visibleText=await page.locator('body').innerText();
 if(visibleText.trim().length<80)throw new Error(`R239 destination produced a blank/near-blank product surface: ${routeName}`);
 const badCanvas=await page.locator('canvas').evaluateAll(nodes=>nodes.some(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);const visible=s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&node.getClientRects().length>0;return visible&&(r.width<=0||r.height<=0)}));
 if(badCanvas)throw new Error(`R239 destination contains a visible zero-size canvas: ${routeName}`);
 if(pageErrors.length)throw new Error(`R239 page error while routing ${routeName}: ${pageErrors.join(' | ')}`);
}

// Universal rail destinations and the system map remain directly operable after the exhaustive route sweep.
await page.getByLabel('Open Command Center').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Command Center')throw new Error('R239 Command rail action did not route');
await page.getByLabel('Open Hybrid Link').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Hybrid Link')throw new Error('R239 Hybrid rail action did not route');
await page.getByLabel('Open Earth Now').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Earth Now')throw new Error('R239 Earth rail action did not route');
await page.getByLabel('Open Evidence and Proof').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Evidence & Proof')throw new Error('R239 Proof rail action did not route');
await page.getByLabel('Browse full software and capability map').click();
await nav.waitFor({state:'visible'});
if(!(await nav.getByText('System map',{exact:true}).count()))throw new Error('R239 System map rail action did not expose the software/capability layer');
await page.keyboard.press('Escape');

const homeButton=page.getByLabel('Go to OMEGA home');
if(await homeButton.count()!==1)throw new Error('R239 persistent Home action disappeared after route sweep');
await homeButton.click();
await page.locator('.r132-primary-strip').waitFor({state:'visible'});
await page.getByRole('button',{name:/^Build/}).first().click();
const startHere=page.locator('.r132-primary-strip');
const startText=await startHere.innerText();
for(const token of ['BUILD · START HERE','Projects','Development','Build Out','ALL 6 TOOLS'])if(!startText.includes(token))throw new Error(`R239 Build start-here strip missing ${token}`);

await page.getByRole('button',{name:'DEEP',exact:true}).click();
await page.locator('.r96-context-card').waitFor({state:'visible'});
if(!(await page.locator('.r96-context-card>div').isVisible()))throw new Error('R239 DEEP must restore complete workspace route list');

// Rail width option and outside-click dismissal are interaction contracts, not presentation copy.
const widen=page.getByLabel('Widen side toolbar to show full labels');
if(await widen.count()!==1)throw new Error('R239 rail-width control missing');
await widen.click();
if(await page.getByLabel('Narrow side toolbar').getAttribute('aria-pressed')!=='true')throw new Error('R239 rail-width control did not enter wide state');
await page.getByLabel('Narrow side toolbar').click();
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
await page.locator('.r96-now').click();
if(await nav.isVisible())throw new Error('R239 outside-click did not close navigator');

await page.setViewportSize({width:390,height:844});
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
const box=await nav.boundingBox();
if(!box||box.width>365)throw new Error(`R239 mobile navigator too wide: ${box?.width}`);
if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))throw new Error('R239 mobile product introduces horizontal viewport overflow');
if(pageErrors.length)throw new Error(`R239 page errors: ${pageErrors.join(' | ')}`);

console.log('R239 BUILT BROWSER PASS · contextual Home→workspace All Tools · explicit global ALL recovery · focus/deep density · all 6 workspace filters · complete registry search · exhaustive 44-route activation sweep · visible-canvas sanity · universal rail · system map · technical detail opt-in · Escape/outside close · rail width · mobile containment');
await browser.close();
