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
const assertClosingTruth=async reason=>{
 if(await nav.getAttribute('aria-hidden')!=='true')throw new Error(`R239 ${reason} did not set aria-hidden immediately`);
 if(!(await nav.evaluate(el=>el.inert)))throw new Error(`R239 ${reason} did not make navigator inert immediately`);
 await nav.waitFor({state:'hidden'});
};
const openAllTools=async()=>{if(await nav.getAttribute('aria-hidden')==='true')await page.getByLabel('Browse all registered OMEGA tools').click();await nav.waitFor({state:'visible'});const all=nav.getByRole('button',{name:/^ALL\s+44$/});if(await all.count())await all.click()};
await allTools.click();
await nav.waitFor({state:'visible'});
const contextualText=await nav.innerText();
if(!contextualText.includes('Explore tools')||!contextualText.includes('matter · earth · motion · scale'))throw new Error('R239 Home All tools did not preserve the active Explore workspace context');
const exploreFilter=nav.getByRole('button',{name:/^Explore\s+\d+$/});
if(await exploreFilter.count()!==1)throw new Error('R239 contextual Explore workspace filter missing');
const expectedExploreCount=Number((await exploreFilter.innerText()).match(/\d+/)?.[0]||0);
const contextualRouteCount=await nav.locator('.r89-flat-route').count();
if(expectedExploreCount<1||contextualRouteCount!==expectedExploreCount)throw new Error(`R239 contextual Explore browser count mismatch: filter=${expectedExploreCount} rendered=${contextualRouteCount}`);
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
const routeIdentities=await routeRows.evaluateAll(rows=>rows.map(row=>({
 routeId:row instanceof HTMLElement?(row.dataset.routeId||''):'',
 routeName:(row.querySelector(':scope > span > b')?.textContent||'').trim()
})));
const routeNames=routeIdentities.map(x=>x.routeName),routeIds=routeIdentities.map(x=>x.routeId);
if(routeNames.some(x=>!x)||new Set(routeNames).size!==44)throw new Error('R239 All Tools contains duplicate/missing presentation route names');
if(routeIds.some(x=>!x)||new Set(routeIds).size!==44)throw new Error('R239 All Tools contains duplicate/missing R143 machine route identities');

const tech=nav.getByRole('button',{name:'Technical',exact:true});
if(await tech.getAttribute('aria-pressed')!=='false')throw new Error('R239 technical metadata should default off');
await tech.click();
if(await nav.getByRole('button',{name:'Simple view',exact:true}).getAttribute('aria-pressed')!=='true')throw new Error('R239 technical detail toggle did not activate');
await page.keyboard.press('Escape');
await assertClosingTruth('Escape');

// Prove every registered destination actually routes through the built product. Machine-semantic R143
// route identity selects the row; rendered text is checked only as a presentation binding. Navigation-only:
// no command/action button is invoked inside a destination.
for(const {routeName,routeId} of routeIdentities){
 await openAllTools();
 const allRows=nav.locator('.r89-flat-route');
 const routeIndex=await allRows.evaluateAll((rows,id)=>rows.findIndex(row=>row instanceof HTMLElement&&row.dataset.routeId===id),routeId);
 if(routeIndex<0)throw new Error(`R239 R143 route identity disappeared during sweep: ${routeId} (${routeName})`);
 const row=allRows.nth(routeIndex);
 if(await row.getAttribute('data-route-id')!==routeId)throw new Error(`R239 route-row machine identity drifted: ${routeName}`);
 const boundName=((await row.locator(':scope > span > b').textContent())||'').trim();
 if(boundName!==routeName)throw new Error(`R239 route identity/presentation binding drifted: ${routeId} expected ${routeName}, saw ${boundName}`);
 await row.click();
 await page.waitForFunction(name=>document.querySelector('.r94-rail-current')?.getAttribute('title')===name,routeName);
 const current=await page.locator('.r94-rail-current').getAttribute('title');
 if(current!==routeName)throw new Error(`R239 destination did not become active: expected ${routeName}, saw ${current}`);
 const workstation=page.locator('.omega-workstation-v2');
 if(await workstation.count()!==1)throw new Error(`R239 destination lost the single workstation surface: ${routeName}`);
 if(await workstation.getAttribute('data-panel')!==routeName)throw new Error(`R239 workstation semantic panel drifted from active route: ${routeName}`);
 const visibleText=await page.locator('body').innerText();
 if(visibleText.trim().length<80)throw new Error(`R239 destination produced a blank/near-blank product surface: ${routeName}`);
 const canvasIssues=await workstation.locator('canvas').evaluateAll(nodes=>nodes.flatMap((node,index)=>{
   let rendered=true,el=node;
   const ancestry=[];
   while(el instanceof HTMLElement){
     const style=getComputedStyle(el);
     ancestry.push(`${el.tagName.toLowerCase()}${el.id?`#${el.id}`:''}${typeof el.className==='string'&&el.className?`.`+el.className.trim().split(/\s+/).slice(0,3).join('.'):''}`);
     if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)===0||el.hidden||el.getAttribute('aria-hidden')==='true'||el.inert){rendered=false;break}
     const parent=el.parentElement;
     if(parent instanceof HTMLDetailsElement&&!parent.open&&el.tagName!=='SUMMARY'){rendered=false;break}
     el=parent;
   }
   if(!rendered||node.getClientRects().length===0)return[];
   const rect=node.getBoundingClientRect();
   if(rect.width>0&&rect.height>0)return[];
   return[{index,ariaLabel:node.getAttribute('aria-label')||'',className:typeof node.className==='string'?node.className:'',widthAttr:node.width,heightAttr:node.height,rect:{width:rect.width,height:rect.height,x:rect.x,y:rect.y},ancestry:ancestry.slice(0,8)}];
 }));
 if(canvasIssues.length)throw new Error(`R239 destination contains an actually-rendered zero-size canvas: ${routeName} · ${JSON.stringify(canvasIssues)}`);
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
await assertClosingTruth('System map Escape');

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
await assertClosingTruth('outside click');

await page.setViewportSize({width:390,height:844});
await page.getByLabel('Browse all registered OMEGA tools').click();
await nav.waitFor({state:'visible'});
const box=await nav.boundingBox();
if(!box||box.width>365)throw new Error(`R239 mobile navigator too wide: ${box?.width}`);
if(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2))throw new Error('R239 mobile product introduces horizontal viewport overflow');
if(pageErrors.length)throw new Error(`R239 page errors: ${pageErrors.join(' | ')}`);

console.log('R239 BUILT BROWSER PASS · contextual Home→workspace All Tools · explicit global ALL recovery · focus/deep density · all 6 workspace filters · complete registry search · exhaustive 44-route activation sweep · unique R143 machine route identity + presentation binding · active-workstation/ancestor-aware visible-canvas sanity · universal rail · system map · technical detail opt-in · immediate inert close + transition-complete hidden state · Escape/outside close · rail width · mobile containment');
await browser.close();