import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
// R663: PR acceptance must never silently fall back to the already deployed
// OMEGA_PUBLIC_URL when a candidate preview URL was omitted by CI.
if(process.env.GITHUB_ACTIONS==='true'&&process.env.GITHUB_EVENT_NAME==='pull_request'){
 if(!process.env.OMEGA_E2E_URL)throw Error('R663 PR candidate browser proof requires OMEGA_E2E_URL; refusing deployed Worker fallback');
 const host=new URL(base).hostname;
 if(!['127.0.0.1','localhost','[::1]'].includes(host))throw Error('R663 PR candidate browser proof must target local preview, not production: '+host);
}
const expectedSha=process.env.OMEGA_EXPECTED_SHA?.trim()||'';
if(expectedSha){
 if(!/^[a-f0-9]{40}$/.test(expectedSha))throw Error('R608 expected production SHA must be 40 lowercase hexadecimal characters');
 const response=await fetch(base+'/omega-build-receipt.json?r608='+Date.now(),{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw Error('R608 promoted build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R608 production receipt does not attest exact promoted SHA');
 console.log('R608 deployed SHA attested: '+expectedSha);
}
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r606='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Create'}).click();
  await page.locator('.o7-r519-portal[data-r519-visual-navigation="CREATE"] button[data-r519-direct="Visual Instrument"]').click();
  const workspace=page.locator('[data-omega7-native="forecast.visual"][data-route="Visual Instrument"]');
  await workspace.waitFor({state:'visible',timeout:30000});
  await workspace.locator('[data-r594-seven-star-entry] button').first().click();
  const instrument=workspace.locator('[data-r605-historical-mandala="true"]');
  await instrument.waitFor({state:'visible',timeout:15000});
  // R609: verify the rendered workbook formula output, not only control visibility.
  const assertFrame=async(seconds)=>{
   const address=Number(await workspace.getAttribute('data-address'));
   if(!Number.isInteger(address)||address<0||address>=20736)throw Error(label+': invalid canonical address '+address);
   const d=Math.floor(address/1728),p=Math.floor(address/144)%12,r=Math.floor(address/12)%12,h=address%12;
   const baseStar=((d+p+r+h)%7)+1;
   const sector=Math.floor(seconds/(86400/7))+1;
   const activeStar=((baseStar+sector-2)%7)+1;
   const operators=['Alpha / Potential','011 Construct','Adaptive Flow','Carrier Field','Omega Integration','01-1 Prune / Refine','Release / Return'];
   const gates=['STAY','STAY','PRUNE','TURN','STAY','INTEGRATE','STAY','STAY','PRUNE','TURN','INTEGRATE','INTEGRATE'];
   const output=await instrument.innerText();
   if(!output.includes('Base star '+baseStar+' → active star '+activeStar))
    throw Error(label+': historical star formula mismatch at address '+address+' clock '+seconds);
   if(!output.includes(operators[activeStar-1]))
    throw Error(label+': historical operator mismatch at address '+address+' clock '+seconds);
   if(!output.includes('Mode 188 gate '+gates[r]))
    throw Error(label+': historical regulation gate mismatch at address '+address);
   if(!(await instrument.locator('[data-r605-sector]').innerText()).includes('Sector '+sector+'/7'))
    throw Error(label+': historical clock sector mismatch at '+seconds);
  };
  await instrument.getByRole('button',{name:'Reset clock to sector 1'}).click();
  await assertFrame(0);
  // R663: exercise real browser-side historical evidence comparison, discrepancy and refusal.
  const recon=instrument.locator('[data-r663-reconciliation="true"]');
  // The reconciliation tool is below the historical frame inside a scrollable
  // OMEGA7 workspace. Verify it exists before scrolling it into the painted
  // viewport, and report actual rendered content if an older bundle is served.
  const reconCount=await recon.count();
  if(reconCount!==1){
   const rendered=(await instrument.innerText()).slice(-1800);
   throw Error(label+': expected exactly one R663 reconciliation tool; found '+reconCount+'; historical instrument tail: '+rendered);
  }
  await recon.scrollIntoViewIfNeeded({timeout:10000});
  await recon.waitFor({state:'visible',timeout:15000});
  const evidence=recon.getByLabel('Reconciliation evidence JSON');
  const addressForCompare=Number(await workspace.getAttribute('data-address'));
  const digitsForCompare=[Math.floor(addressForCompare/1728),Math.floor(addressForCompare/144)%12,Math.floor(addressForCompare/12)%12,addressForCompare%12];
  const baseForCompare=(digitsForCompare.reduce((a,b)=>a+b,0)%7)+1;
  const good={sourceId:'STATE_COORDINATES',row:0,address:addressForCompare,digits:digitsForCompare,baseStar:baseForCompare,activeStar:baseForCompare};
  await evidence.fill(JSON.stringify([good,{...good,row:1,activeStar:99}]));
  await recon.locator('[data-r663-compare]').click();
  const comparison=recon.locator('[data-r663-receipt="true"]');
  await comparison.waitFor({state:'visible',timeout:5000});
  if(!(await comparison.innerText()).includes('1 matching rows')||!(await comparison.innerText()).includes('1 field discrepancies'))throw Error(label+': R663 mismatch comparison not executed');
  if(!(await comparison.innerText()).includes('Original source authenticated: no'))throw Error(label+': R663 source provenance inflated');
  // R663: real local file intake must reach the same comparison executor without
  // uploading private bytes or silently retaining a previous receipt.
  const localFile=recon.getByLabel('Import local reconciliation JSON file');
  const fileRows=[good,{...good,row:1,baseStar:99}];
  await localFile.setInputFiles({name:'reconciliation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fileRows))});
  await page.waitForFunction(expected=>document.querySelector('[aria-label="Reconciliation evidence JSON"]')?.value===expected,JSON.stringify(fileRows),{timeout:10000});
  if(await comparison.count())throw Error(label+': R663 file import retained a stale comparison');
  await recon.locator('[data-r663-compare]').click();
  if(!(await comparison.innerText()).includes('1 matching rows')||!(await comparison.innerText()).includes('1 field discrepancies'))throw Error(label+': R663 local file did not execute formula comparison');
  await localFile.setInputFiles({name:'too-large.json',mimeType:'application/json',buffer:Buffer.alloc(262145,32)});
  await recon.locator('[data-r663-error="true"]').waitFor({state:'visible',timeout:5000});
  if(!(await recon.locator('[data-r663-error]').innerText()).includes('INPUT_TOO_LARGE_256K'))throw Error(label+': R663 oversized local file was accepted');
  if(await evidence.inputValue())throw Error(label+': R663 rejected file retained previous private evidence');
  await evidence.fill(JSON.stringify(Array.from({length:257},(_,i)=>({...good,row:i}))));
  if(await comparison.count())throw Error(label+': R663 stale receipt survived evidence change');
  await recon.locator('[data-r663-compare]').click();
  if(!(await comparison.innerText()).includes('Compared 256 rows'))throw Error(label+': R663 bounded batch failed');
  await recon.locator('[data-r663-next]').click();
  if(!(await comparison.innerText()).includes('Compared 1 rows'))throw Error(label+': R663 next batch failed');
  await evidence.fill(JSON.stringify([{sourceId:'STATE_COORDINATES',row:0,address:addressForCompare}]));
  await recon.locator('[data-r663-compare]').click();
  await recon.locator('[data-r663-error="true"]').waitFor({state:'visible',timeout:5000});
  if(!(await recon.locator('[data-r663-error]').innerText()).includes('UNTESTABLE_SOURCE_ROW'))throw Error(label+': R663 untestable evidence was accepted');
  const initialAddress=await workspace.getAttribute('data-address');
  const before=await instrument.locator('[data-r605-frame]').innerText();
  if(!before.includes('20,736'))throw Error(label+': historical state table missing');
  await instrument.getByRole('button',{name:'Next address'}).click();
  await page.waitForFunction(old=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')!==old,initialAddress,{timeout:10000});
  await assertFrame(0);
  const after=await instrument.locator('[data-r605-frame]').innerText();
  if(before===after)throw Error(label+': source-backed address labels did not advance');
  await instrument.getByRole('button',{name:'Previous address'}).click();
  await page.waitForFunction(old=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')===old,initialAddress,{timeout:10000});
  await instrument.getByRole('button',{name:'Reset clock to sector 1'}).click();
  if(!(await instrument.locator('[data-r605-sector]').innerText()).includes('Sector 1/7'))throw Error(label+': clock reset failed');
  const slider=instrument.getByRole('slider',{name:'Historical clock seconds'});
  await slider.focus();await slider.press('End');
  await assertFrame(86399);
  await page.waitForFunction(()=>document.querySelector('[data-r605-sector]')?.textContent?.includes('Sector 7/7'),null,{timeout:10000});
  // R610: sample the interior of every sector, not only first and last.
  // Native range setter + input event exercises React's real controlled onChange.
  for(let sector=1;sector<=7;sector++){
   const seconds=Math.floor((sector-.5)*86400/7);
   await slider.evaluate((element,value)=>{
    const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
    if(!setter)throw Error('native range value setter unavailable');
    setter.call(element,String(value));
    element.dispatchEvent(new Event('input',{bubbles:true}));
    element.dispatchEvent(new Event('change',{bubbles:true}));
   },seconds);
   await page.waitForFunction(expected=>document.querySelector('[data-r605-sector]')?.textContent?.includes('Sector '+expected+'/7'),sector,{timeout:10000});
   await assertFrame(seconds);
  }
  const checkbox=instrument.getByRole('checkbox',{name:'Live local clock'});
  await checkbox.check();
  if(!(await slider.isDisabled()))throw Error(label+': live clock did not disable manual clock');
  await checkbox.uncheck();
  if(await slider.isDisabled())throw Error(label+': manual clock did not resume');
  const legacy=workspace.locator('[data-r594-seven-star-entry] details');
  await legacy.locator('summary').click();
  await workspace.locator('[data-r594-seven-star="true"]').waitFor({state:'visible',timeout:10000});
  if(errors.length)throw Error(label+': '+errors.join(' | '));
  await page.close();
 }
 console.log('R606/R663 HISTORICAL MANDALA BROWSER PASS · desktop/mobile · original formulas, canonical traversal, 7 clock sectors, live/manual control, legacy access');
}finally{await browser.close()}
