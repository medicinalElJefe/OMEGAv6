import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function openRoute(page,name){
 const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');if(await trigger.count())await trigger.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
 const route=page.locator('.r89-flat-route').filter({has:page.locator('b',{hasText:name})});await route.first().click();
 await page.waitForFunction(n=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===n,name,{timeout:15000});
}
async function desktop(browser){
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
 await openRoute(page,'Convergence');await page.waitForSelector('.r168-restoration',{timeout:20000});
 const text=await page.locator('.r168-restoration').innerText();
 for(const token of ['R168 · FULL RESTORATION TRUTH CONVERGENCE','SUCCESSOR RESTORES','S10 · S12 · S16 · S18 · S21','12 MASTER SOFTWARE INTENTS','R166 DEVELOPMENT RESIDUAL → LIVING WORLD'])if(!text.includes(token))throw new Error(`R168 desktop missing ${token}`);
 const menuButtons=page.locator('.r168-menus button');if(await menuButtons.count()!==12)throw new Error(`R168 expected 12 master intent buttons, got ${await menuButtons.count()}`);
 await page.getByRole('button',{name:/OPEN MATTER TRAVERSAL/}).click();await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Matter Traversal',{timeout:15000});
 const deep=page.getByRole('button',{name:/DEEP MATTER/});await deep.click();await page.waitForSelector('.r46-bio',{timeout:15000});
 const bio=await page.locator('.r46-bio').innerText();for(const token of ['Biological Traversal','ORGANISM','ATOM'])if(!bio.includes(token))throw new Error(`R168 biology route missing ${token}`);
 const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(overflow>8)throw new Error(`R168 desktop overflow ${overflow}`);
 await context.close();
}
async function mobile(browser){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
 await openRoute(page,'Convergence');await page.waitForSelector('.r168-restoration',{timeout:20000});
 const rect=await page.locator('.r168-restoration').boundingBox();if(!rect||rect.width<280||rect.width>390)throw new Error(`R168 mobile containment bad ${JSON.stringify(rect)}`);
 if(await page.locator('.r168-menus button').count()!==12)throw new Error('R168 mobile master intent count changed');
 const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);if(overflow>8)throw new Error(`R168 mobile overflow ${overflow}`);
 await context.close();
}
const browser=await chromium.launch({headless:true});try{await desktop(browser);await mobile(browser);console.log('R168 BROWSER PASS · Convergence exposes effective successor truth + R166 residual world + 12 master intents · Matter opens real biology executor · desktop/mobile contained')}finally{await browser.close()}
