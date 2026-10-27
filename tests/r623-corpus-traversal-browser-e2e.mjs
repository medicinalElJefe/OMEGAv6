import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R623 expected promoted SHA is invalid');
 const res=await fetch(base+'/omega-build-receipt.json?r623='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!res.ok)throw Error('R623 deployed receipt unavailable: '+res.status);
 const receipt=await res.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R623 receipt SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r623='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const panel=page.locator('[data-r623-traversal="read-only"]');
   await panel.waitFor({state:'visible',timeout:30000});
   const address=panel.getByLabel('Historical ten-axis address');
   const offset=panel.getByLabel('Historical traversal offset');
   const execute=panel.getByRole('button',{name:'Traverse address'});
   await address.fill('429981695');await offset.fill('1');await execute.click();
   let result=panel.locator('[data-r623-receipt="true"]');
   await result.waitFor({state:'visible',timeout:10000});
   if(!(await result.innerText()).includes('429,981,696'))throw Error(device+': band crossing failed');
   await offset.fill('2');
   if(await panel.locator('[data-r623-receipt="true"]').count())throw Error(device+': edited offset retained stale traversal receipt');
   await offset.fill('1');await execute.click();
   await result.waitFor({state:'visible',timeout:10000});
   await panel.getByRole('button',{name:'Use target as next origin'}).click();
   if(await address.inputValue()!=='429981696')throw Error(device+': continuation failed');
   await address.fill('0');await offset.fill('-1');await execute.click();
   await panel.locator('[data-r623-refusal="true"]').waitFor({state:'visible',timeout:10000});
   if(await panel.locator('[data-r623-receipt="true"]').count())throw Error(device+': invalid traversal retained stale receipt');
   await panel.getByLabel('Authorize address wrap').check();
   await panel.locator('[data-r623-refusal="true"]').waitFor({state:'hidden',timeout:10000});
   await execute.click();
   result=panel.locator('[data-r623-receipt="true"]');await result.waitFor({state:'visible',timeout:10000});
   const text=await result.innerText();
   if(!text.includes('61,917,364,223')||!text.includes('wrapped with authorization'))throw Error(device+': authorized wrap failed');
   if(!text.includes('Private original workbook proof: not asserted'))throw Error(device+': source authority falsely escalated');
   if(errors.length)throw Error(device+': page errors: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': horizontal overflow '+overflow);
   console.log('R623 '+device+' PASS: bounded crossing, continuation, refusal, explicit wrap, honest proof labeling, responsive containment');
  }finally{await context.close()}
 }
}finally{await browser.close()}
