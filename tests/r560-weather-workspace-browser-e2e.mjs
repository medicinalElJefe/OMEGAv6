import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R560 exact SHA required');
 const r=await fetch(base+'/omega-build-receipt.json?r560='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R560 receipt HTTP '+r.status);
 const receipt=await r.json();
 if(receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R560 exact SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,extraHTTPHeaders:{'cache-control':'no-cache'}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r560='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   await page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"] button[data-r519-direct="Earth Now"]').click();
   await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Earth Now',null,{timeout:20000});
   const studioButton=page.locator('[data-r563-weather-open="true"]');
   await studioButton.click();
   const studio=page.locator('[data-r563-weather-studio="true"]');
   await studio.waitFor({state:'visible',timeout:30000});
   const satPanel=studio.locator('[data-r563-satellite-panel="true"]');
   const forecastPanel=studio.locator('[data-r563-forecast-panel="true"]');
   await satPanel.waitFor({state:'visible'});
   await forecastPanel.waitFor({state:'visible'});
   await page.waitForFunction(()=>{const s=document.querySelector('[data-r563-weather-studio]');return !!s&&s.querySelectorAll('select option').length>0},null,{timeout:30000});
   await page.waitForFunction(()=>['READY','ERROR'].includes(document.querySelector('[data-r563-forecast-panel] [data-weather-state]')?.getAttribute('data-weather-state')),null,{timeout:30000});
   if(await forecastPanel.locator('[data-weather-state]').getAttribute('data-weather-state')!=='READY'){
    const details=await forecastPanel.locator('[data-weather-state]').evaluate(el=>({state:el.getAttribute('data-weather-state'),error:el.querySelector('.earth-r375-error')?.textContent||'',text:(el.textContent||'').slice(0,1000)}));
    throw Error(name+': dedicated studio weather source not READY: '+JSON.stringify(details));
   }
   const observed=satPanel.locator('figure img');
   await observed.waitFor({state:'visible',timeout:30000});
   await page.waitForFunction(()=>{const img=document.querySelector('[data-r563-satellite-panel] figure img');return !!img&&img.complete},null,{timeout:30000});
   if(!(await observed.evaluate(img=>img.naturalWidth>0)))throw Error(name+': NOAA satellite image did not load');
   await page.locator('[data-r563-earth-open="true"]').click();
   await studio.waitFor({state:'hidden',timeout:15000});
   const workspace=page.locator('[data-omega7-native="earth.weather"]');
   await workspace.waitFor({state:'visible',timeout:30000});
   await workspace.locator('[data-r560-weather-open="true"]').click();
   const weather=workspace.locator('[data-earth-view="WEATHER"]');
   await weather.waitFor({state:'visible',timeout:30000});
   await page.waitForFunction(()=>{const el=document.querySelector('[data-earth-view="WEATHER"]');return el&&['READY','ERROR'].includes(el.getAttribute('data-weather-state'))},null,{timeout:30000});
   if(await weather.getAttribute('data-weather-state')!=='READY')throw Error(name+': weather source not READY: '+(await weather.innerText()).slice(0,900));
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   await page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"] button[data-r519-direct="Earth Now"]').click();
   await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Earth Now',null,{timeout:20000});
   await page.locator('[data-earth-view="WEATHER"]').waitFor({state:'visible',timeout:30000});
   await page.locator('[data-r560-satellite-open="true"]').click();
   await page.locator('[data-earth-view="WEATHER"]').waitFor({state:'hidden',timeout:30000});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(name+': horizontal overflow '+overflow);
   if(errors.length)throw Error(name+': page errors '+errors.join(' | ').slice(0,700));
   console.log('R560 '+name+' weather source, persistence, satellite switch, layout PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
