import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,extraHTTPHeaders:{'cache-control':'no-cache'}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r554='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const entry=page.locator('[data-r554-ux-entry="true"]');await entry.waitFor({state:'visible',timeout:20000});
   await entry.getByRole('button',{name:'Open capability workbench'}).click();
   await entry.locator('[data-r478-capability-surface="true"]').waitFor({state:'visible',timeout:20000});
   await entry.getByRole('button',{name:/20,736D UX atlas/}).click();
   await entry.locator('#r550-ux-atlas').waitFor({state:'visible'});
   await entry.getByLabel('Capability family').selectOption({label:'Knowledge Atlases'});
   const atlasText=await entry.locator('#r550-ux-atlas').innerText();
   if(!atlasText.includes('Address')||!atlasText.includes('source-model executor'))throw Error(name+': atlas evidence missing');
   const address=entry.getByLabel('Source-model execution address');
   await address.fill('0');
   const run=entry.getByRole('button',{name:/Run read-only source model/}).first();
   await run.click();
   await entry.locator('[data-r552-execution-result="true"]').waitFor({state:'visible'});
   const history=entry.locator('[data-r553-history="true"]');
   if(!(await history.innerText()).includes('address 0'))throw Error(name+': history not updated');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   await page.locator('[data-r554-ux-entry="true"]').getByRole('button',{name:'Open capability workbench'}).click();
   await page.locator('[data-r478-capability-surface="true"]').getByRole('button',{name:/20,736D UX atlas/}).click();
   if(!(await page.locator('[data-r553-history="true"]').innerText()).includes('address 0'))throw Error(name+': history lost on reload');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(name+': horizontal overflow '+overflow);
   if(errors.length)throw Error(name+': page errors '+errors.join(' | ').slice(0,800));
   console.log('R554 '+name+' workbench visible, source model run, persisted history, no overflow PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
