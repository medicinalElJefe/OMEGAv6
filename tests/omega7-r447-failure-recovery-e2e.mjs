import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');

async function openExact(page,route){
 await page.locator('.o7-search-trigger').click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 const result=page.locator(`[data-command-route="${route}"]`);
 await result.waitFor({state:'visible',timeout:10000});
 await result.click();
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:15000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
}

async function dynamicImportFailure(browser){
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 let injected=false;
 await page.route('**/assets/*.js',async r=>{
  if(!injected&&r.request().resourceType()==='script'){injected=true;await r.abort('failed');return}
  await r.continue();
 });
 await openExact(page,'Workspace');
 const failure=page.locator('[data-omega7-failure]');
 await failure.waitFor({state:'visible',timeout:15000});
 const text=await failure.innerText();
 if(!text.includes('Your OMEGA state was not discarded.'))throw new Error('R447 capability boundary did not preserve user-state message');
 if(!await page.locator('.o7-app').isVisible())throw new Error('R447 shell died with capability chunk failure');
 await page.unroute('**/assets/*.js');
 await page.locator('.o7-native-toolbar button').click();
 await openExact(page,'Earth Now');
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading'),{timeout:20000});
 if(await page.locator('[data-omega7-failure]').count())throw new Error('R447 shell did not recover by navigating to another capability');
 if(!injected)throw new Error('R447 failed to inject a real lazy-chunk failure');
 if(errors.length>1)throw new Error('R447 unexpected repeated page errors: '+errors.join(' | ').slice(0,1600));
 await context.close();
}

async function apiFailureContainment(browser){
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.route('**/api/**',r=>r.abort('failed'));
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 await openExact(page,'Hybrid Link');
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading'),{timeout:20000});
 const text=await page.locator('.o7-native-host').innerText();
 if(text.includes('PC ONLINE'))throw new Error('R447 API failure falsely promoted Hybrid to PC ONLINE');
 if(!/DEVICE_PROOF_REQUIRED|BRIDGE ERROR|BROWSER PAIRING REQUIRED|unavailable|proof|offline|held/i.test(text))throw new Error('R447 Hybrid failure did not remain visibly proof-bound');
 if(!await page.locator('.o7-app').isVisible())throw new Error('R447 API failure killed OMEGA7 shell');
 const overflow=await page.evaluate(()=>Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)-window.innerWidth);
 if(overflow>8)throw new Error(`R447 mobile failure surface overflow ${overflow}px`);
 if(errors.length)throw new Error(`R447 API failure produced unhandled page errors: ${errors.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await dynamicImportFailure(browser);
 await apiFailureContainment(browser);
 console.log('OMEGA7 R447 FAILURE PASS · lazy-chunk failure isolated · shell/state retained · alternate route recovers · API loss fails Hybrid closed · mobile containment preserved');
}finally{await browser.close()}
