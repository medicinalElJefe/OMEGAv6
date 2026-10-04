import {chromium} from 'playwright';

const base=process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173';
const address=12345;

async function requireVisible(page,selector,label){
 const loc=page.locator(selector);
 await loc.waitFor({state:'visible',timeout:15000});
 if(!(await loc.isVisible()))throw new Error(label+' not visible');
}

async function prove(viewport,label){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport});
 const page=await context.newPage();

 await page.goto(base+'/',{waitUntil:'domcontentloaded'});
 await requireVisible(page,'[data-omega7="true"]',label+' clean-session OMEGA7 default');
 await page.evaluate(a=>localStorage.setItem('omega.v6.address',String(a)),address);

 await page.locator('.o7-v6').click();
 await requireVisible(page,'.omega7-return-control',label+' explicit OMEGA6 rollback');
 await requireVisible(page,'.r317-product-root',label+' accepted OMEGA6 product');
 const afterRollback=Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')));
 if(afterRollback!==address)throw new Error(label+' rollback changed canonical address '+afterRollback);

 await page.locator('.omega7-return-control').click();
 await requireVisible(page,'[data-omega7="true"]',label+' OMEGA7 re-entry');
 const afterReentry=Number(await page.evaluate(()=>localStorage.getItem('omega.v6.address')));
 if(afterReentry!==address)throw new Error(label+' re-entry changed canonical address '+afterReentry);

 await page.locator('.o7-v6').click();
 await requireVisible(page,'.omega7-return-control',label+' persistent rollback control');
 await page.reload({waitUntil:'domcontentloaded'});
 await requireVisible(page,'.omega7-return-control',label+' persistent OMEGA6 preference');
 if(await page.locator('[data-omega7="true"]').count())throw new Error(label+' persisted OMEGA6 preference ignored');

 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded'});
 await requireVisible(page,'[data-omega7="true"]',label+' explicit OMEGA7 query override');

 await page.goto(base+'/?omega6=1',{waitUntil:'domcontentloaded'});
 await requireVisible(page,'.omega7-return-control',label+' explicit OMEGA6 query override');

 await browser.close();
}

await prove({width:1440,height:960},'desktop');
await prove({width:390,height:844},'mobile');

console.log('R454 DEFAULT CUTOVER E2E PASS · clean-session OMEGA7 default · explicit OMEGA6 rollback · desktop/mobile re-entry · canonical address preserved');
