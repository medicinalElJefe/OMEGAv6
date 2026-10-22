import {chromium} from 'playwright';

const base=String(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('R499 bridge browser proof requires OMEGA_E2E_URL or OMEGA_PUBLIC_URL');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R499 bridge browser proof requires exact promoted SHA');

const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 // Seed the authoritative address before application initialization, not after mount.
 await context.addInitScript(()=>localStorage.setItem('omega.v6.address','12345'));
 const page=await context.newPage();
 const pageErrors=[],assetFailures=[];
 page.on('pageerror',error=>pageErrors.push(String(error)));
 page.on('requestfailed',request=>{if(/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(request.url()))assetFailures.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText||'FAILED'}`)});
 page.on('response',response=>{if(response.status()>=400&&/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(response.url()))assetFailures.push(`${response.status()} ${response.url()}`)});

 await page.goto(`${base}/?omega7=1&r499-canonical=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
 const entryAddress=await page.evaluate(()=>localStorage.getItem('omega.v6.address'));
 if(Number(entryAddress)!==12345)throw new Error(`R499 OMEGA7 entry changed canonical address: ${entryAddress}`);

 const bridge=page.locator('.o7-v6');
 await bridge.waitFor({state:'visible',timeout:10000});
 await bridge.click();
 await page.locator('main.r71-home').waitFor({state:'visible',timeout:30000});
 const afterExit=await page.evaluate(()=>({omega7:localStorage.getItem('omega7.enabled'),address:localStorage.getItem('omega.v6.address')}));
 if(afterExit.omega7!=='false')throw new Error(`R499 OMEGA7→OMEGA6 bridge did not persist explicit compatibility state: ${afterExit.omega7}`);
 if(Number(afterExit.address)!==12345)throw new Error(`R499 bridge changed canonical address: ${afterExit.address}`);

 await page.goto(`${base}/?omega7=1&r499-reentry=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
 const reentry=await page.evaluate(()=>({omega7:localStorage.getItem('omega7.enabled'),address:localStorage.getItem('omega.v6.address')}));
 if(reentry.omega7!=='true'||Number(reentry.address)!==12345)throw new Error(`R499 OMEGA6→OMEGA7 re-entry continuity failed: ${JSON.stringify(reentry)}`);

 await page.goto(`${base}/?omega6=1&r499-oneshot=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('main.r71-home').waitFor({state:'visible',timeout:30000});
 const oneShot=await page.evaluate(()=>({omega7:localStorage.getItem('omega7.enabled'),address:localStorage.getItem('omega.v6.address')}));
 if(Number(oneShot.address)!==12345)throw new Error(`R499 one-shot compatibility changed canonical address: ${oneShot.address}`);

 if(pageErrors.length)throw new Error(`R499 bridge browser page errors: ${pageErrors.join(' | ').slice(0,2400)}`);
 if(assetFailures.length)throw new Error(`R499 bridge asset failures: ${assetFailures.join(' | ').slice(0,3000)}`);
 await context.close();
 console.log(`R499 SEQUENTIAL BRIDGE BROWSER PASS · exact promoted SHA ${expectedSha} · OMEGA7→OMEGA6→OMEGA7 reversible transition · ?omega6=1 compatibility path · canonical address preserved · no deferred asset/page failures`);
}finally{
 await browser.close();
}
