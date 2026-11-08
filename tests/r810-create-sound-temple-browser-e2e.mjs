import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?omega7=1&omega7route=Create',{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Create',null,{timeout:30000});
  const temple=page.locator('[data-r805-create-sound-temple="true"]');
  await temple.waitFor({state:'visible',timeout:30000});
  if(await temple.locator('.soma-audio-r45').count())throw Error(name+': sound mounted before explicit open');
  await temple.getByRole('button',{name:'Open Sound Temple',exact:true}).click();
  const audio=temple.locator('.soma-audio-r45');
  await audio.waitFor({state:'visible',timeout:30000});
  if(!(await audio.locator('header strong').innerText()).includes('READY'))throw Error(name+': audio active without user start');
  if(await audio.locator('.soma-lanes button').count()!==12)throw Error(name+': missing inherited 12 phase controls');
  // Exercise actual Web Audio and phase advance; the timer must not reset on every tick.
  const phaseClock=audio.locator('input[type="range"][min=".5"]');
  await phaseClock.focus();
  await phaseClock.press('Home');
  const initial=await audio.locator('.soma-lanes button.active').innerText();
  await audio.getByRole('button',{name:'Sequence 12 phases',exact:true}).click();
  await page.waitForFunction(previous=>{const active=document.querySelector('.soma-audio-r45 .soma-lanes button.active');return active&&active.textContent!==previous},initial,{timeout:8000});
  if(!(await audio.locator('header strong').innerText()).includes('LOCAL ACTIVE'))throw Error(name+': Web Audio sequence did not start');
  await audio.getByRole('button',{name:'Stop',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.soma-audio-r45 header strong')?.textContent?.includes('READY'),null,{timeout:10000});
  await temple.getByRole('button',{name:'Close Sound Temple',exact:true}).click();
  await audio.waitFor({state:'detached',timeout:15000});
  await page.locator('.o7-nav-r512').getByRole('button',{name:/Explore/i}).click();
  await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),null,{timeout:15000});
  await page.locator('.o7-intro-r512').waitFor({state:'visible',timeout:15000});
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>8)throw Error(name+': horizontal overflow '+overflow);
  if(errors.length)throw Error(name+': '+errors.join(' | '));
  await context.close();
 }
 console.log('R810 CREATE SOMA INTEGRATION PASS · 12 lanes · explicit user start · close · domain navigation · desktop/mobile');
}finally{await browser.close()}
