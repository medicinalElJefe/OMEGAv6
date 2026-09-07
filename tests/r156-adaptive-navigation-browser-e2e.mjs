import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const hybrid={ok:true,state:'LIVE',nativeExecutionClaimed:true,devices:[{id:'pc-r156',name:'OMEGA-PC',online:true,revoked:false,lastSeen:Date.now()}],jobs:[{id:'job-r156',status:'RUNNING',op:'BUILD'}]};
const missions={ok:true,missions:[{id:'mission-r156',status:'ACTIVE',objective:'Repair the current OMEGA build, run regression, package it and return proof.',currentJobId:'job-r156',currentJob:{id:'job-r156',status:'RUNNING',op:'BUILD'},completedCycles:2,maxCycles:12}]};
const federation={ok:true,nodes:{sovereign:{rcwaState:'LIVE'}},runtime:{rcwa:{state:'LIVE'}}};

async function mockTruth(page){
 await page.route('**/api/hybrid/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(hybrid)}));
 await page.route('**/api/missions',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(missions)}));
 await page.route('**/api/federation/run/status',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(federation)}));
}
async function waitForOperatingShell(page){
 await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
}
async function openNav(page){const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await trigger.count())await trigger.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});await page.waitForSelector('.r156-global-context',{timeout:10000})}
async function clickRoute(page,name){const route=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:name})});if(!await route.count())throw new Error(`route missing ${name}`);await route.first().click();await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,name,{timeout:15000})}

async function desktop(browser){
 const context=await browser.newContext({viewport:{width:1440,height:960}}),page=await context.newPage();await mockTruth(page);await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await waitForOperatingShell(page);await openNav(page);
 const liveText=await page.locator('.r156-global-live-grid').innerText();for(const token of ['PC ONLINE','ACTIVE','RCWA LIVE','WAITING'])if(!liveText.includes(token))throw new Error(`desktop live operation fabric missing ${token}: ${liveText}`);
 const rail=await page.locator('.r94-nav-rail').innerText();if(!rail.includes('PC LIVE')||!rail.includes('RUN'))throw new Error(`desktop rail did not promote live host/mission state: ${rail}`);
 const search=page.locator('.r156-semantic-search input');await search.fill('repair build and prove');await page.waitForSelector('.r156-task-matches');const taskText=await page.locator('.r156-task-matches').innerText();if(!/Build → prove → ship/i.test(taskText))throw new Error(`semantic task workspace missing: ${taskText}`);
 const resultText=await page.locator('.r156-route-scroll').innerText();for(const token of ['Development','Build Out','Quality Compiler','Evidence & Proof'])if(!resultText.includes(token))throw new Error(`semantic route result missing ${token}`);
 await search.fill('');const routeCount=await page.locator('.r89-flat-route').count();if(routeCount!==44)throw new Error(`desktop full registry expected 44 visible routes, got ${routeCount}`);
 const pin=page.locator('.r156-active-instrument button');if(await pin.count())await pin.click();
 await clickRoute(page,'Hybrid Link');await openNav(page);const current=await page.locator('.r156-active-instrument').innerText();if(!current.includes('Hybrid Link'))throw new Error(`active instrument did not follow route: ${current}`);
 const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(overflow>8)throw new Error(`desktop adaptive navigator introduced ${overflow}px horizontal overflow`);
 await context.close();
}

async function mobile(browser){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();await mockTruth(page);await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await waitForOperatingShell(page);await openNav(page);
 const live=page.locator('.r156-global-live-grid');if(!await live.count())throw new Error('mobile live operation fabric missing');const liveText=await live.innerText();if(!liveText.includes('PC ONLINE')||!liveText.includes('RCWA LIVE'))throw new Error(`mobile live fabric missing current truth: ${liveText}`);
 const search=page.locator('.r156-semantic-search input');await search.fill('connected PC');await page.waitForTimeout(100);const results=await page.locator('.r156-route-scroll').innerText();if(!results.includes('Hybrid Link'))throw new Error('mobile semantic command deck did not rank Hybrid Link for connected PC');
 await search.fill('');const routeCount=await page.locator('.r89-flat-route').count();if(routeCount!==44)throw new Error(`mobile full registry expected 44 visible routes, got ${routeCount}`);
 const navRect=await page.locator('.r156-nav-panel').boundingBox();if(!navRect||navRect.width<140)throw new Error(`mobile navigator collapsed: ${JSON.stringify(navRect)}`);
 const viewportOverflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(viewportOverflow>8)throw new Error(`mobile adaptive navigator introduced ${viewportOverflow}px horizontal overflow`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{await desktop(browser);await mobile(browser);console.log('PASS R156 adaptive global navigation browser · home-first shell + live execution truth + semantic task workspaces + all 44 routes + desktop/mobile containment')}finally{await browser.close()}
