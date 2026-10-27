import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R625 expected SHA invalid');
 const r=await fetch(base+'/omega-build-receipt.json?r625='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R625 production receipt missing');
 const receipt=await r.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R625 live SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r625='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const panel=page.locator('[data-r624-inherited-development="local-only"]');
   await panel.waitFor({state:'visible',timeout:30000});
   if(!(await panel.innerText()).includes('not live production or historical parity proof'))throw Error(device+': local proof boundary absent');
   await panel.getByRole('button',{name:'Execute inherited replay'}).click();
   const output=panel.locator('[data-r624-output]');
   await output.waitFor({state:'visible'});
   await page.waitForFunction(()=>{const e=document.querySelector('[data-r624-output]');return e?.textContent?.includes('canonicalHistory')&&e?.textContent?.includes('developmental')},null,{timeout:10000});
   const result=JSON.parse(await output.innerText());
   if(result.canonicalHistory?.length!==4||result.developmental?.velocity?.length!==3||result.developmental?.acceleration?.length!==2||result.developmental?.jerk?.length!==1)throw Error(device+': inherited Heightened calculus derivatives not executed');
   if(result.proof?.sourceKernel!=='R651'||result.proof?.frameRuntime!=='R653'||result.proof?.liveRuntimeVerified!==false||result.proof?.historicalParityVerified!==false)throw Error(device+': inherited source/proof authority drift');
   if(errors.length)throw Error(device+': runtime errors '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': horizontal overflow '+overflow);
   console.log('R625 '+device+' PASS: actual R651/R653 developmental replay, velocity/acceleration/jerk and proof boundaries');
  }finally{await context.close()}
 }
}finally{await browser.close()}
