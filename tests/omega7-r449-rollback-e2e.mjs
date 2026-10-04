import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedAddress=12345;
const browser=await chromium.launch({headless:true});

try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 await context.addInitScript(address=>{
  localStorage.setItem('omega.v6.address',String(address));
  localStorage.setItem('omega7.enabled','true');
 },expectedAddress);
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));

 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 OMEGA7 entry changed canonical address');

 await page.locator('.o7-search-trigger').click();
 await page.locator('.o7-command input').fill('Traversal');
 await page.locator('[data-command-route="Traversal"]').click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Traversal',{timeout:15000});
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-workspace'))&&!document.querySelector('.o7-native-loading'),{timeout:20000});
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 native route entry forked canonical address before rollback');

 await page.locator('.o7-v6').click();
 await page.waitForSelector('main.r71-home,.r317-product-root',{timeout:30000});
 if(await page.locator('.o7-app').count())throw new Error('R449 OMEGA7 shell remained mounted after explicit OMEGA6 rollback');
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 rollback discarded or changed canonical address');
 const enabled=await page.evaluate(()=>localStorage.getItem('omega7.enabled'));
 if(enabled!==null)throw new Error('R449 rollback failed to clear persistent OMEGA7 opt-in');

 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 re-entry lost canonical address continuity');
 if(errors.length)throw new Error('R449 rollback/re-entry produced unhandled page errors: '+errors.join(' | ').slice(0,1800));

 console.log('OMEGA7 R449 ROLLBACK PASS · OMEGA7 → accepted OMEGA6 → OMEGA7 reversible · canonical address preserved · persistent opt-in cleared on exit · no unhandled page errors');
 await context.close();
}finally{await browser.close()}
