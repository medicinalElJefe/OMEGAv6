import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const useFixtures=process.env.OMEGA_R512_USE_FIXTURES==='1';

async function mocks(page){
 const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/restoration',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_FEDERATION_R512_MENU_PROOF',canonicalAuthority:'R125',nodes:[]}));
}

async function launchSoftware(page,query,binding,route,operation,launchState){
 await page.locator('.o7-search-trigger').click();
 const dialog=page.locator('.o7-command');
 await dialog.waitFor({state:'visible',timeout:10000});
 const input=dialog.locator('input');
 await input.fill(query);
 const result=dialog.locator(`button[data-command-software="${binding}"]`);
 await result.waitFor({state:'visible',timeout:10000});
 await result.click();

 const host=page.locator(`.o7-executor-host[data-r512-executor-route="${route}"][data-r512-binding="${binding}"]`);
 await host.waitFor({state:'visible',timeout:20000});
 const context=host.locator('.o7-software-executor-context');
 await context.waitFor({state:'visible',timeout:15000});
 if(await context.getAttribute('data-launch-state')!==launchState.toLowerCase())throw new Error(`${binding}: launch state mismatch`);
 const text=await context.innerText();
 if(!text.includes(operation))throw new Error(`${binding}: operation context was lost: ${text.slice(0,500)}`);
 if(!text.includes(route))throw new Error(`${binding}: current executor route missing from context`);

 await host.locator('.o7-native-surface').waitFor({state:'visible',timeout:30000});
 const intro=host.locator('.o7-open-instrument');
 if(await intro.count()&&await intro.isVisible())throw new Error(`${binding}: previous software stopped at intro instead of opening the full executor`);
}

const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:960},extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 if(useFixtures)await mocks(page);
 await page.goto(base+`/?omega7=1&r512=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});

 // Menu organization: domain pages are no longer one flat 44-card board.
 await page.locator('.o7-nav button').filter({hasText:'Explore'}).click();
 for(const id of ['start','tools','advanced'])await page.locator(`.o7-menu-group[data-r512-menu-section="${id}"]`).waitFor({state:'visible',timeout:10000});
 const visibleExploreCards=await page.locator('.o7-menu-group .o7-capability-grid article').count();
 if(visibleExploreCards<8)throw new Error(`Explore menu unexpectedly thin: ${visibleExploreCards}`);

 // Historical name -> live current executor with preserved operation.
 await launchSoftware(page,'Omega Atlas OS','RUNTIME','System','RUN_CANONICAL_RUNTIME','LIVE');

 // Historical mode name -> current Modes executor.
 await launchSoftware(page,'Mode 188','MODE188','Modes','RUN_MODE_188_STACK','LIVE');

 // Domain-specific historical application -> adapted working successor.
 await launchSoftware(page,'JST','COLLECTIONS','Workspace','RUN_COLLECTIONS_WORKFLOW','ADAPTER');

 // Device-gated historical software opens the real current executor/gate, never fake ACTIVE state.
 await launchSoftware(page,'native GPU v12.1','GPU_NATIVE_V12','Visual Instrument','RUN_NATIVE_GPU_IF_PROVEN','GATED');

 if(errors.length)throw new Error('R512 unhandled page errors: '+errors.join(' | ').slice(0,1800));
 await context.close();
 console.log('R512 EXECUTABLE MENU BROWSER PASS · grouped intent menus render · Omega Atlas OS + Mode188 launch full live successors · JST launches adapter successor · native GPU opens truthful device gate · operation context survives navigation');
}finally{
 await browser.close();
}
