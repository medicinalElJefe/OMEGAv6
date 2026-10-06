import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedAddress=12345;
const browser=await chromium.launch({headless:true});

try{
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 await context.addInitScript(address=>localStorage.setItem('omega.v6.address',String(address)),expectedAddress);
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));

 await page.goto(base+'/?r449-default=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 OMEGA7 default entry changed canonical address');
 if(await page.evaluate(()=>localStorage.getItem('omega7.enabled'))!=='true')throw new Error('R449 OMEGA7 default entry did not persist accepted successor state');

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
 if(await page.evaluate(()=>localStorage.getItem('omega7.enabled'))!=='false')throw new Error('R449 rollback failed to persist explicit OMEGA6 selection');

 await page.reload({waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('main.r71-home,.r317-product-root',{timeout:30000});
 if(await page.locator('.o7-app').count())throw new Error('R449 persisted OMEGA6 rollback did not survive reload');

 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 if(Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 re-entry lost canonical address continuity');
 if(await page.evaluate(()=>localStorage.getItem('omega7.enabled'))!=='true')throw new Error('R449 explicit OMEGA7 re-entry did not restore successor preference');
 if(errors.length)throw new Error('R449 rollback/re-entry produced unhandled page errors: '+errors.join(' | ').slice(0,1800));

 console.log('OMEGA7 R449 ROLLBACK PASS · plain URL defaults OMEGA7 · explicit OMEGA6 persists across reload · ?omega7=1 re-entry restores OMEGA7 · canonical address preserved · no unhandled page errors');
 await context.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await mobile.addInitScript(address=>localStorage.setItem('omega.v6.address',String(address)),expectedAddress);
 const phone=await mobile.newPage();
 await phone.goto(base+'/?r449-phone-default=1',{waitUntil:'domcontentloaded',timeout:30000});
 await phone.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 const rollback=phone.locator('.o7-v6');
 await rollback.waitFor({state:'visible',timeout:15000});
 const box=await rollback.boundingBox();
 if(!box||box.width<44||box.height<44)throw new Error(`R449 phone rollback target is not touch-safe: ${JSON.stringify(box)}`);
 if(await phone.locator('.o7-nav').count()!==1)throw new Error('R449 phone shell lost single bottom navigation authority');
 await rollback.click();
 await phone.waitForSelector('main.r71-home,.r317-product-root',{timeout:30000});
 if(await phone.locator('.o7-app').count())throw new Error('R449 phone rollback left OMEGA7 mounted');
 if(Number(await phone.evaluate(()=>localStorage.getItem('omega.v6.address')))!==expectedAddress)throw new Error('R449 phone rollback changed canonical address');
 if(await phone.evaluate(()=>localStorage.getItem('omega7.enabled'))!=='false')throw new Error('R449 phone rollback failed to persist explicit OMEGA6 selection');
 console.log('OMEGA7 R449 PHONE ROLLBACK PASS · default successor + explicit V6 escape remains visible and >=44px · single bottom nav preserved · canonical address continuous');
 await mobile.close();
}finally{await browser.close()}
