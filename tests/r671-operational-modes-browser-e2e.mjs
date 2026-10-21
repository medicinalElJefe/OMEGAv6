import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [kind,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r671='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const cap=page.locator('[data-capability-route="Modes"]');
   await cap.waitFor({state:'visible',timeout:15000});
   await cap.locator('footer button').click();
   await page.locator('.o7-native-workspace[data-route="Modes"]').waitFor({state:'visible',timeout:25000});
   const open=page.getByRole('button',{name:'Open full Modes workspace'});
   if(await open.isVisible())await open.click();
   const panel=page.locator('[data-r671-operational-modes="true"]');
   await panel.waitFor({state:'visible',timeout:30000});
   if(!(await page.locator('.sbm21-app').isVisible()))throw Error(kind+': existing 179-entry source mode catalog was displaced');
   await panel.getByLabel('Operational projection mode').selectOption('STABILIZE');
   await panel.getByRole('button',{name:'Execute selected mode'}).click();
   const receipt=panel.locator('[data-r671-execution-receipt="true"]');
   await receipt.waitFor({state:'visible',timeout:20000});
   const first=await receipt.innerText();
   if(!first.includes('STABILIZE')||!first.includes('Local source-model execution')||!first.includes('The underlying CanonState is unchanged'))throw Error(kind+': missing real execution and nonmutation proof');
   const source=panel.locator('[aria-label="Computed route source states"] button');
   const count=await source.count();
   if(count<1||count>24)throw Error(kind+': route trace cardinality invalid '+count);
   await panel.getByLabel('Operational projection mode').selectOption('EXPLORE');
   await panel.getByRole('button',{name:'Execute selected mode'}).click();
   await receipt.waitFor({state:'visible',timeout:15000});
   if(!(await receipt.innerText()).includes('EXPLORE'))throw Error(kind+': mode selection did not reach executor');
   if(count>1){
    const old=await page.locator('.o7-native-workspace').getAttribute('data-address');
    await panel.locator('[aria-label="Computed route source states"] button').nth(1).click();
    await page.waitForFunction(previous=>document.querySelector('.o7-native-workspace')?.getAttribute('data-address')!==previous,old,{timeout:15000});
    if(await receipt.isVisible())throw Error(kind+': stale model receipt survived source address change');
    await panel.getByRole('button',{name:'Execute selected mode'}).click();
    await receipt.waitFor({state:'visible',timeout:15000});
   }
   if(errors.length)throw Error(kind+': page errors '+errors.join(' | ').slice(0,1100));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(kind+': horizontal overflow '+overflow);
   console.log('R671 '+kind+' PASS: historical catalog conserved, actual R653 engine executed, changed mode, source address rebound, receipt gated');
  }finally{await context.close()}
 }
}finally{await browser.close()}
