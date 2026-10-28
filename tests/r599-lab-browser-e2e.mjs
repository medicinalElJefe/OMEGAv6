import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
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
  if(errors.length)throw Error(label+': '+errors.join(' | '));
  await page.close();
 }
 console.log('R599 LAB BROWSER PASS · desktop/mobile · 7-system ledger · step · animation · reset · no page errors');
}finally{await browser.close()}
