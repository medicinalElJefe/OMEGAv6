import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=process.env.OMEGA_EXPECTED_SHA?.trim()||'';
if(expectedSha){
 if(!/^[a-f0-9]{40}$/.test(expectedSha))throw Error('R608 expected production SHA must be 40 lowercase hexadecimal characters');
 const urls=[base+'/api/health',base+'/api/status',base+'/'];
 let observed='';
 for(const url of urls){
  try{
   const response=await fetch(url,{headers:{'cache-control':'no-cache'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)continue;
   const body=(await response.text()).slice(0,100000);
   const header=response.headers.get('x-omega-sha')||response.headers.get('x-deployment-sha')||'';
   const match=header.match(/[a-f0-9]{40}/)||body.match(/(?:commitSha|commit_sha|deployedSha|deploy_sha|buildSha|build_sha|sha)["'\\s:=]+["']?([a-f0-9]{40})/i);
   const value=match?.[1]||match?.[0]||'';
   if(value){observed=value.toLowerCase();break}
  }catch{}
 }
 if(!observed)throw Error('R608 deployed SHA attestation unavailable; do not claim exact-SHA browser proof');
 if(observed!==expectedSha)throw Error('R608 deployed SHA mismatch: expected '+expectedSha+', observed '+observed);
 console.log('R608 deployed SHA attested: '+observed);
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
  const initialAddress=await workspace.getAttribute('data-address');
  const before=await instrument.locator('[data-r605-frame]').innerText();
  if(!before.includes('20,736'))throw Error(label+': historical state table missing');
  await instrument.getByRole('button',{name:'Next address'}).click();
  await page.waitForFunction(old=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')!==old,initialAddress,{timeout:10000});
  const after=await instrument.locator('[data-r605-frame]').innerText();
  if(before===after)throw Error(label+': source-backed address labels did not advance');
  await instrument.getByRole('button',{name:'Previous address'}).click();
  await page.waitForFunction(old=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')===old,initialAddress,{timeout:10000});
  await instrument.getByRole('button',{name:'Reset clock to sector 1'}).click();
  if(!(await instrument.locator('[data-r605-sector]').innerText()).includes('Sector 1/7'))throw Error(label+': clock reset failed');
  const slider=instrument.getByRole('slider',{name:'Historical clock seconds'});
  await slider.focus();await slider.press('End');
  await page.waitForFunction(()=>document.querySelector('[data-r605-sector]')?.textContent?.includes('Sector 7/7'),null,{timeout:10000});
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
 console.log('R606 HISTORICAL MANDALA BROWSER PASS · desktop/mobile · original formulas, canonical traversal, 7 clock sectors, live/manual control, legacy access');
}finally{await browser.close()}
