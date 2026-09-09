import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
const escapeRegex=text=>String(text).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

await page.route('**/api/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'OK'})}));
await page.route('**/api/hybrid/status',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,paired:false,devices:[],jobs:[],missions:[]})}));
await page.route('**/omega-federation.json',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schema:'OMEGA_TEST',nodes:[]})}));

await page.goto(base,{waitUntil:'networkidle'});
for(const text of ['All tools','System map','FOCUS','DEEP'])if(!(await page.getByText(text,{exact:true}).count()))throw new Error(`R242 Home missing ${text}`);
const initialStartHere=page.locator('.r132-primary-strip');
await initialStartHere.waitFor({state:'visible'});
if(!(await initialStartHere.innerText()).includes('START HERE'))throw new Error('R242 Home primary strip missing START HERE semantics');
for(const workspace of ['Command','Explore','Intelligence','Evidence','Build','System'])if(!(await page.getByRole('button',{name:new RegExp(`^${workspace}`)}).count()))throw new Error(`R242 workspace missing ${workspace}`);

await page.locator('.r132-inspector-tabs').getByRole('button',{name:'TOOLS',exact:true}).click();
const contextRoutes=page.locator('.r96-context-card>div');
if(await contextRoutes.isVisible())throw new Error('R242 FOCUS still exposes duplicate full workspace route list');
const quick=page.locator('.r96-quick-card button');
if(await quick.count()!==4)throw new Error(`R242 expected 4 universal quick actions, saw ${await quick.count()}`);
const quickText=await page.locator('.r96-quick-card').innerText();
for(const token of ['Command','Hybrid','Earth','Proof'])if(!quickText.includes(token))throw new Error(`R242 universal quick set missing ${token}`);
for(const forbidden of ['SAI Lab','Visual Instrument'])if(quickText.includes(forbidden))throw new Error(`R242 quick set still duplicates workspace specialist ${forbidden}`);

const allTools=page.locator('.r96-header-actions button').filter({hasText:'All tools'}).first();
const nav=page.locator('#omega-global-navigator');
const allFilter=()=>nav.getByRole('button',{name:/^ALL\s+\d+$/});
const assertClosingTruth=async reason=>{
 if(await nav.getAttribute('aria-hidden')!=='true')throw new Error(`R242 ${reason} did not set aria-hidden immediately`);
 if(!(await nav.evaluate(el=>el.inert)))throw new Error(`R242 ${reason} did not make navigator inert immediately`);
 await nav.waitFor({state:'hidden'});
};
const openAllTools=async()=>{if(await nav.getAttribute('aria-hidden')==='true')await page.getByLabel('Browse all registered OMEGA tools').click();await nav.waitFor({state:'visible'});const all=allFilter();if(await all.count())await all.click()};
await allTools.click();
await nav.waitFor({state:'visible'});
if(await nav.getAttribute('data-lemma-pass')!=='true')throw new Error('R242 structural navigation lemma is not PASS');
if(await nav.getAttribute('data-navigation-lemma-revision')!=='R242')throw new Error('R242 navigator did not expose the lemma revision');
const contextualText=await nav.innerText();
if(!contextualText.includes('Explore tools')||!contextualText.includes('matter · earth · motion · scale'))throw new Error('R242 Home All tools did not preserve the active Explore workspace context');
const exploreFilter=nav.getByRole('button',{name:/^Explore\s+\d+$/});
if(await exploreFilter.count()!==1)throw new Error('R242 contextual Explore workspace filter missing');
const expectedExploreCount=Number((await exploreFilter.innerText()).match(/\d+/)?.[0]||0);
const contextualRouteCount=await nav.locator('.r89-flat-route').count();
if(expectedExploreCount<1||contextualRouteCount!==expectedExploreCount)throw new Error(`R242 contextual Explore browser count mismatch: filter=${expectedExploreCount} rendered=${contextualRouteCount}`);
for(const label of ['Open Command Center','Open Hybrid Link','Open Earth Now','Open Evidence and Proof','Browse all registered OMEGA tools','Browse full software and capability map'])if(!(await page.getByLabel(label).count()))throw new Error(`R242 permanent rail missing ${label}`);
if(await page.getByLabel('Open Woven Continuity traversal instrument').count())throw new Error('R242 permanent rail still contains specialized Weave shortcut');
if(await page.getByLabel('Open Matter Traversal').count())throw new Error('R242 permanent rail still contains specialized Matter shortcut');

// Every workspace partition must remain directly operable and non-empty.
for(const workspace of ['Command','Explore','Intelligence','Evidence','Build','System']){
 const button=nav.getByRole('button',{name:new RegExp(`^${workspace}\\s+\\d+$`)});
 if(await button.count()!==1)throw new Error(`R242 navigator workspace filter missing ${workspace}`);
 const declared=Number((await button.innerText()).match(/\d+/)?.[0]||0);
 await button.click();
 const rendered=await nav.locator('.r89-flat-route').count();
 if(rendered!==declared||rendered<1)throw new Error(`R242 workspace partition ${workspace} failed conservation: declared=${declared} rendered=${rendered}`);
}

// ALL is a deliberate second step from contextual Home and must restore the complete dynamic registry.
await allFilter().click();
const allLabel=await allFilter().innerText();
const routeCount=Number(allLabel.match(/\d+/)?.[0]||0);
if(routeCount<1)throw new Error('R242 complete route count is not observable');
const globalText=await nav.innerText();
for(const token of ['All tools','Command','Explore','Intelligence','Evidence','Build','System','PRIMARY','SUPPORT','EXPERT'])if(!globalText.includes(token))throw new Error(`R242 global navigator missing ${token}`);
const search=nav.getByLabel('Search all registered OMEGA applications');

// Lemma calculus: exact identity must outrank substring/token/metadata matches.
await search.fill('Governance');
let searchRows=nav.locator('.r89-flat-route');
if(await searchRows.count()<1||await searchRows.first().getAttribute('data-route-name')!=='Governance')throw new Error('R242 exact Governance route did not outrank related governance metadata');
await search.fill('System');
searchRows=nav.locator('.r89-flat-route');
if(await searchRows.count()<1||await searchRows.first().getAttribute('data-route-name')!=='System')throw new Error('R242 exact System route did not outrank System Atlas/metadata');
await search.fill('Hybrid');
if(await nav.locator('.r89-flat-route').count()<1||await nav.locator('.r89-flat-route').first().getAttribute('data-route-name')!=='Hybrid Link')throw new Error('R242 token search cannot resolve Hybrid Link');
await search.fill('definitely-not-a-real-route');
if(await nav.locator('.r89-flat-route').count()!==0)throw new Error('R242 nonexistent query fabricated a destination');
if(!(await nav.locator('.r88-empty').innerText()).includes('no destination is fabricated'))throw new Error('R242 missing-query residual is not visibly truth-bounded');
if(Number(await nav.getAttribute('data-lemma-residual-count')||0)<1)throw new Error('R242 nonexistent query was not carried as a residual');
await search.fill('');
if(await nav.getAttribute('data-lemma-pass')!=='true')throw new Error('R242 structural lemma pass was lost after query transforms');

const routeRows=nav.locator('.r89-flat-route');
if(await routeRows.count()!==routeCount)throw new Error(`R242 All Tools must expose complete registry: declared=${routeCount} rendered=${await routeRows.count()}`);
const routeNames=await routeRows.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('data-route-name')||''));
if(new Set(routeNames).size!==routeCount||routeNames.some(name=>!name))throw new Error('R242 All Tools contains duplicate/missing exact route identities');

const tech=nav.getByRole('button',{name:'Technical',exact:true});
if(await tech.getAttribute('aria-pressed')!=='false')throw new Error('R242 technical metadata should default off');
await tech.click();
if(await nav.getByRole('button',{name:'Simple view',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('R242 technical detail toggle did not activate');
const technicalFooter=await nav.locator('.r88-navigator-foot').innerText();
if(!technicalFooter.includes('R242 lemma navigation PASS'))throw new Error('R242 technical footer does not expose calculus structural truth');
await page.keyboard.press('Escape');
await assertClosingTruth('Escape');

// Prove every registered destination actually routes through the built product. Navigation-only: no action inside a destination is invoked.
for(const routeName of routeNames){
 await openAllTools();
 const exactLabel=page.locator('b').filter({hasText:new RegExp(`^${escapeRegex(routeName)}$`)});
 const row=nav.locator('.r89-flat-route').filter({has:exactLabel});
 if(await row.count()!==1)throw new Error(`R242 registered destination disappeared or became ambiguous during sweep: ${routeName}`);
 if(await row.getAttribute('data-route-name')!==routeName)throw new Error(`R242 exact route row identity mismatch during sweep: ${routeName}`);
 const rowLabel=await row.locator('b').first().innerText();
 if(rowLabel!==routeName)throw new Error(`R242 visible route label diverged from exact route identity: expected ${routeName}, saw ${rowLabel}`);
 await row.click();
 await page.waitForFunction(name=>document.querySelector('.r94-rail-current')?.getAttribute('title')===name,routeName);
 const current=await page.locator('.r94-rail-current').getAttribute('title');
 if(current!==routeName)throw new Error(`R242 destination did not become active: expected ${routeName}, saw ${current}`);
 const visibleText=await page.locator('body').innerText();
 if(visibleText.trim().length<80)throw new Error(`R242 destination produced a blank/near-blank product surface: ${routeName}`);
 const badCanvas=await page.locator('canvas').evaluateAll(nodes=>nodes.some(node=>{const r=node.getBoundingClientRect(),s=getComputedStyle(node);const visible=s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&node.getClientRects().length>0;return visible&&(r.width<=0||r.height<=0)}));
 if(badCanvas)throw new Error(`R242 destination contains a visible zero-size canvas: ${routeName}`);
 if(pageErrors.length)throw new Error(`R242 page error while routing ${routeName}: ${pageErrors.join(' | ')}`);
}

// Universal rail destinations and system map remain directly operable after the exhaustive route sweep.
await page.getByLabel('Open Command Center').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Command Center')throw new Error('R242 Command rail action did not route');
await page.getByLabel('Open Hybrid Link').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Hybrid Link')throw new Error('R242 Hybrid rail action did not route');
await page.getByLabel('Open Earth Now').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Earth Now')throw new Error('R242 Earth rail action did not route');
await page.getByLabel('Open Evidence and Proof').click();
if(await page.locator('.r94-rail-current').getAttribute('title')!=='Evidence & Proof')throw new Error('R242 Proof rail action did not route');
await page.getByLabel('Browse full software and capability map').click();
await nav.waitFor({state:'visible'});
if(!(await nav.getByText('System map',{exact:true}).count()))throw new Error('R242 System map rail action did not expose the software/capability layer');
await page.keyboard.press('Escape');
await assertClosingTruth('System map Escape');

const homeButton=page.getByLabel('Go to OMEGA home');
if(await homeButton.count()!==1)throw new Error('R242 persistent Home action disappeared after route sweep');
await homeButton.click();
await page.locator('.r132-primary-strip').waitFor({state:'visible'});
await page.getByRole('button',{name:/^Build/}).first().click();
const startHere=page.locator('.r132-primary-strip');
const startText=await startHere.innerText();
for(const token of ['BUILD · START HERE','Projects','Development','Build Out','ALL 6 TOOLS'])if(!startText.includes(token))throw new Error(`R242 Build start-here strip missing ${token}`);

await page.getByRole('button',{name:'DEEP',exact:true}).click();
await page.locator('.r96-context-card').waitFor({state:'visible'});
if(!(await page.locator('.r96-context-card>div').isVisible()))throw new Error('R242 DEEP must restore complete workspace route list');

// Rail width and outside-click dismissal are interaction contracts, not presentation copy.
const widen=page.getByLabel('Widen side toolbar to show full labels');
if(await widen.count()!==1)throw new Error('R242 rail-width control missing');
await widen.click();
if(await page.getByLabel('Narrow side toolbar').getAttribute('aria-pressed')!=='true')throw new Error('R242 rail-width control did not enter wide state');
await page.getByLabel('Narrow side toolbar').click();
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
await page.locator('.r96-now').click();
await assertClosingTruth('outside click');

await page.setViewportSize({width:390,height:844});
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
const box=await nav.boundingBox();
if(!box||box.width>365)throw new Error(`R242 mobile navigator too wide: ${box?.width}`);
if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))throw new Error('R242 mobile product introduces horizontal viewport overflow');
if(pageErrors.length)throw new Error(`R242 page errors: ${pageErrors.join(' | ')}`);

console.log(`R242 BUILT BROWSER PASS · calculus/lemma route partition and residual carry · exact identity precedence · dynamic ${routeCount}-route conservation · exhaustive destination activation · visible-canvas sanity · universal rail · system map · technical truth · inert close · Escape/outside close · rail width · mobile containment`);
await browser.close();
