import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const sha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(sha){
 if(!/^[0-9a-f]{40}$/i.test(sha))throw Error('R583 requires exact SHA');
 const response=await fetch(base+'/omega-build-receipt.json?r583='+Date.now(),{cache:'no-store'});
 if(!response.ok)throw Error('R583 receipt '+response.status);
 const receipt=await response.json();
 if(receipt?.source?.sha!==sha||receipt?.promotion?.promotedMergeSha!==sha)throw Error('R583 promoted SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r583='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   await page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"] button[data-r519-direct="Earth Now"]').click();
   await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Earth Now',null,{timeout:20000});
   await page.locator('[data-r563-weather-open="true"]').click();
   const map=page.locator('[data-r580-radar-map="true"]');
   await map.waitFor({state:'visible',timeout:30000});
   await page.waitForFunction(()=>['READY','ERROR'].includes(document.querySelector('[data-r580-radar-map]')?.getAttribute('data-radar-state')),null,{timeout:30000});
   const state=await map.getAttribute('data-radar-state');
   if(state!=='READY')throw Error(name+': radar not READY: '+state+' '+(await map.innerText()).slice(0,600));
   const radar=map.locator('img.omega-r580-radar');
   await radar.first().waitFor({state:'attached',timeout:20000});
   await page.waitForFunction(()=>[...document.querySelectorAll('[data-r580-radar-map] img.omega-r580-radar')].some(x=>x.complete&&x.naturalWidth>0),null,{timeout:30000});
   const first=await radar.first().getAttribute('src');
   const timestamp=await map.locator('.omega-r580-timeline strong').innerText();
   const count=await map.locator('img.omega-r580-radar').count();
   if(count<4)throw Error(name+': insufficient radar tile coverage '+count);
   await map.getByRole('button',{name:'Previous'}).click();
   const previous=await radar.first().getAttribute('src');
   const previousTime=await map.locator('.omega-r580-timeline strong').innerText();
   if(first===previous||timestamp===previousTime)throw Error(name+': previous did not change observation frame and timestamp');
   await map.getByRole('button',{name:'Next'}).click();
   if(await radar.first().getAttribute('src')!==first)throw Error(name+': next did not restore selected radar frame');
   await map.getByRole('button',{name:'Zoom radar in'}).click();
   if(await radar.first().getAttribute('src')===first)throw Error(name+': zoom did not update XYZ radar tile');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(name+': horizontal overflow '+overflow);
   if(errors.length)throw Error(name+': page errors '+errors.join(' | ').slice(0,500));
   console.log('R583 '+name+' real radar pixels, historical frame stepping, time, zoom and layout PASS');
  }finally{await context.close()}
 }
}finally{await browser.close()}
