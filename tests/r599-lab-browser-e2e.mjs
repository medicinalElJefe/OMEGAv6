import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R601 expected SHA must be 40 hex digits');
 const response=await fetch(base+'/omega-build-receipt.json?r601='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R601 production build receipt unavailable: '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R601 live build receipt not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r599='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Create'}).click();
  await page.locator('.o7-r519-portal[data-r519-visual-navigation="CREATE"] button[data-r519-direct="Visual Instrument"]').click();
  await page.locator('[data-omega7-native="forecast.visual"][data-route="Visual Instrument"]').waitFor({state:'visible',timeout:30000});
  await page.locator('[data-r598-woven-lab-entry] button').first().click();
  const lab=page.locator('[data-r598-morphogenesis="true"]');await lab.waitFor({state:'visible',timeout:20000});
  const rows=lab.locator('details tbody tr');if(await rows.count()!==7)throw Error(label+': seven-system ledger missing');
  const initial=await lab.locator('[data-r598-conservation]').innerText();
  await lab.getByRole('button',{name:'Step formation'}).click();
  const after=await lab.locator('[data-r598-conservation]').innerText();
  if(initial===after||!after.includes('Step 1'))throw Error(label+': state did not advance');
  const residual=await lab.locator('[data-r599-ledger-residual]').innerText();
  if(!residual.includes('Channel budget residual'))throw Error(label+': missing conservation receipt');
  await lab.getByRole('button',{name:'Play formation'}).click();
  await page.waitForTimeout(450);
  await lab.getByRole('button',{name:'Pause formation'}).click();
  const animated=await lab.locator('[data-r598-conservation]').innerText();
  if(animated===after)throw Error(label+': animation did not evolve');
  await lab.getByRole('button',{name:'Reset formation'}).click();
  if(!(await lab.locator('[data-r598-conservation]').innerText()).includes('Step 0'))throw Error(label+': reset did not restore initial state');
  const mode=lab.getByRole('combobox',{name:'Formation exchange topology'});
  await mode.selectOption('convergent');
  await lab.getByRole('button',{name:'Step formation'}).click();
  const incoming=Number(await lab.locator('details tbody tr').nth(3).locator('td').nth(2).innerText());
  if(!(incoming>0))throw Error(label+': multi-parent topology did not reach spatial system four');
  await lab.locator('[data-r601-topology-edges] summary').click();
  await lab.getByRole('checkbox',{name:'Formation edge s1-s4'}).uncheck();
  if(!(await lab.locator('[data-r598-conservation]').innerText()).includes('Step 0'))throw Error(label+': topology toggle did not reset seeded experiment');
  await lab.getByRole('button',{name:'Step formation'}).click();
  const reduced=Number(await lab.locator('details tbody tr').nth(3).locator('td').nth(2).innerText());
  if(!(reduced<incoming))throw Error(label+': disabling an edge did not reduce governed ingress');
  await mode.selectOption('legacy');
  await lab.getByRole('button',{name:'Step formation'}).click();
  if(!(await lab.locator('[data-r598-conservation]').innerText()).includes('Step 1'))throw Error(label+': R598 legacy comparison path lost');
  const graph=lab.locator('[data-r600-governed-graph="true"]');await graph.waitFor({state:'visible',timeout:20000});
  await graph.getByRole('button',{name:'Advance exchange'}).click();
  if(!(await graph.locator('[data-r600-budget]').innerText()).includes('Step 1'))throw Error(label+': governed graph did not advance');
  await graph.locator('input[type="checkbox"]').nth(5).uncheck();
  if(!(await graph.locator('[data-r600-budget]').innerText()).includes('blocked request 0.00000'))throw Error(label+': disabled blocked edge still requested transfer');
  await graph.getByRole('button',{name:'Reset exchange'}).click();
  if(!(await graph.locator('[data-r600-budget]').innerText()).includes('Step 0'))throw Error(label+': governed graph reset failed');
  if(errors.length)throw Error(label+': '+errors.join(' | '));
  await page.close();
 }
 console.log('R599 LAB BROWSER PASS · desktop/mobile · 7-system ledger · step · animation · reset · R600 graph advance/blocked-toggle/reset · no page errors');
}finally{await browser.close()}
