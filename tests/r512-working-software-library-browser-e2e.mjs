import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const useFixtures=process.env.OMEGA_R512_USE_FIXTURES==='1';

async function installFixtures(page){
 const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/core-health',r=>json(r,{ok:true,status:'READY'}));
 await page.route('**/api/health',r=>json(r,{ok:true,status:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_FEDERATION_R512_UI_PROOF',canonicalAuthority:'R125',nodes:[]}));
}

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:960},extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(String(e)));

try{
 if(useFixtures)await installFixtures(page);
 await page.goto(base+'/?omega7=1&r512='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});

 const recovered=page.locator('.o7-recovered[data-r486-visible-convergence="true"]');
 await recovered.waitFor({state:'visible',timeout:30000});
 const browse=recovered.getByRole('button',{name:'Browse recovered capabilities',exact:true});
 await browse.click();

 const library=recovered.locator('[data-r512-software-library="true"]');
 await library.waitFor({state:'visible',timeout:20000});
 const search=library.getByPlaceholder('Search old software names, current apps, operations, or domains…');
 await search.fill('Omega Atlas OS');
 const runtimeCard=library.locator('.r512-software-card').filter({hasText:'Atlas / Sovereign / Universal OS lineage'});
 await runtimeCard.waitFor({state:'visible',timeout:15000});
 if(!(await runtimeCard.getByText('Omega Atlas OS',{exact:true}).isVisible()))throw new Error('R512 historical Omega Atlas OS alias is not visibly preserved');
 const runtimeLaunch=runtimeCard.getByRole('button',{name:/Launch Atlas \/ Sovereign \/ Universal OS lineage through System/});
 await runtimeLaunch.click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='System',{timeout:20000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
 if(await page.locator('[data-omega7-failure]').count())throw new Error('R512 Omega Atlas OS current System executor entered failure state');

 await page.locator('.o7-native-toolbar button').first().click();
 await recovered.waitFor({state:'visible',timeout:15000});

 await page.keyboard.press('Control+K');
 const command=page.locator('.o7-command');
 await command.waitFor({state:'visible',timeout:10000});
 const commandInput=command.locator('input');
 await commandInput.fill('Desktop Link');
 const desktopLink=command.locator('button[data-command-software="HYBRID"]');
 await desktopLink.waitFor({state:'visible',timeout:10000});
 const desktopText=(await desktopLink.innerText()).toLowerCase();
 if(!desktopText.includes('desktop link')||!desktopText.includes('hybrid link'))throw new Error('R512 Desktop Link alias did not resolve visibly to Hybrid Link');
 await desktopLink.click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Hybrid Link',{timeout:20000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:15000});
 if(await page.locator('[data-omega7-failure]').count())throw new Error('R512 Desktop Link current Hybrid executor entered failure state');

 if(errors.length)throw new Error('R512 unhandled page errors: '+errors.join(' | ').slice(0,1600));
 console.log('R512 WORKING SOFTWARE BROWSER PASS · recovered Software Library visible · Omega Atlas OS launches current System executor · Ctrl-K historical Desktop Link alias launches Hybrid Link · no dead listing behavior');
}finally{
 await context.close();
 await browser.close();
}
