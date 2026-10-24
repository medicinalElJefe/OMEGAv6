import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&r594='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Create'}).click();
  await page.locator('.o7-r519-portal[data-r519-visual-navigation="CREATE"] button[data-r519-direct="Visual Instrument"]').click();
  await page.locator('[data-omega7-native="forecast.visual"][data-route="Visual Instrument"]').waitFor({state:'visible',timeout:30000});
  await page.locator('[data-r594-seven-star-entry] button').first().click();
  const legacy=page.locator('[data-r594-seven-star-entry] details');
  await legacy.locator('summary').click();
  const star=page.locator('[data-r594-seven-star="true"]');await star.waitFor({state:'visible',timeout:20000});
  const svg=star.locator('svg');const before=await svg.innerHTML();
  await star.getByRole('slider',{name:'Seven-Star rotation'}).fill('95');
  const after=await svg.innerHTML();if(before===after)throw Error(label+': rotation did not change rendered geometry');
  await star.getByRole('button',{name:'Play Seven-Star motion'}).click();
  const movingBefore=await svg.innerHTML();
  await page.waitForTimeout(350);
  const movingAfter=await svg.innerHTML();if(movingBefore===movingAfter)throw Error(label+': motion did not advance geometry');
  await star.getByRole('button',{name:'Pause Seven-Star motion'}).click();
  await star.getByRole('slider',{name:'Seven-Star asymmetry'}).fill('0.8');
  const addressBefore=await page.locator('[data-omega7-native="forecast.visual"]').getAttribute('data-address');
  await star.getByRole('button',{name:'Traverse node 1'}).click();
  await page.waitForFunction(old=>document.querySelector('[data-omega7-native="forecast.visual"]')?.getAttribute('data-address')!==old,addressBefore,{timeout:10000});
  await star.getByRole('button',{name:'Reset'}).click();
  if(await star.getByRole('slider',{name:'Seven-Star rotation'}).inputValue()!=='0')throw Error(label+': reset failed');
  if(errors.length)throw Error(label+': '+errors.join(' | '));
  await page.close();
 }
 console.log('R594 SEVEN STAR BROWSER PASS · desktop/mobile · rotation, asymmetry, address traversal, reset · no page errors');
}finally{await browser.close()}
