import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R681 exact promoted SHA proof required');
 const r=await fetch(base+'/omega-build-receipt.json?r681='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R681 exact-SHA build receipt unavailable HTTP '+r.status);
 const v=await r.json();
 if(v?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||v?.source?.sha!==expectedSha||v?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R681 live promoted build receipt does not bind exact release SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(String(error)));
  try{
   await page.goto(base+'/?omega7=1&r681='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const card=page.locator('[data-capability-route="Modes"]');
   await card.waitFor({state:'visible',timeout:20000});
   await card.locator('footer button').click();
   await page.locator('.o7-native-workspace[data-route="Modes"]').waitFor({state:'visible',timeout:25000});
   const full=page.getByRole('button',{name:'Open full Modes workspace'});
   if(await full.isVisible())await full.click();
   const original=page.locator('.sbm21-app'), woven=page.locator('[data-r671-operational-modes="true"]');
   const graph=page.locator('[data-r676-operator-panel="true"]');
   const audit=page.locator('[data-r681-native-truth="historical-source"]');
   for(const [name,node] of [['source mode catalog',original],['woven executor',woven],['historic graph',graph],['native decision truth',audit]]){
    await node.waitFor({state:'visible',timeout:30000}).catch(e=>{throw Error(device+': '+name+' missing: '+String(e))});
   }
   if(!(await audit.innerText()).includes('Production decision-policy admission: HELD'))throw Error(device+': native policy unverified release guard missing');
   await audit.getByRole('button',{name:'Inspect native decision proof'}).click();
   let text=await audit.getByRole('group',{name:'Source classification counts'}).innerText();
   if(!text.includes('20,707')||!text.includes('29')||!text.includes('0'))throw Error(device+': original source counts not present');
   await audit.getByRole('button',{name:'Recovered kernel re-evaluation'}).click();
   text=await audit.getByRole('group',{name:'Source classification counts'}).innerText();
   if(!text.includes('20,646')||!text.includes('66')||!text.includes('24'))throw Error(device+': source kernel re-evaluation not present');
   if(!(await audit.innerText()).includes('Saved vs re-evaluated disagreements: 84'))throw Error(device+': contradiction ledger disappeared');
   await audit.locator('details summary').click();
   const evidence=await audit.innerText();
   if(!evidence.includes('be3dc2f5a7e80f672d9a6820d780d7821195005f5d8760a05c9f116135b5b13c')||
      !evidence.includes('R125_EXTERNAL_ADMISSION_PROOF_REQUIRED'))throw Error(device+': source identity or release veto missing');
   await audit.getByRole('button',{name:'Close native decision proof'}).click();
   if(await audit.getByRole('group',{name:'Source classification counts'}).isVisible())throw Error(device+': original/native historical detail did not close');
   if(pageErrors.length)throw Error(device+': uncaught browser exception '+pageErrors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': horizontal overflow '+overflow);
   console.log('R681 '+device+' PASS: R21/R671/R676 preserved, source-exact native decision census and recomputed contrast shown, 84 contradictions and R125 veto retained without UI overflow');
  }finally{await context.close()}
 }
}finally{await browser.close()}
