import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r676='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const modes=page.locator('[data-capability-route="Modes"]');
   await modes.waitFor({state:'visible',timeout:20000});
   await modes.locator('footer button').click();
   await page.locator('.o7-native-workspace[data-route="Modes"]').waitFor({state:'visible',timeout:30000});
   const openLegacy=page.getByRole('button',{name:'Open full Modes workspace'});
   if(await openLegacy.isVisible())await openLegacy.click();
   if(!(await page.locator('.sbm21-app').isVisible()))throw Error(label+': original source-backed mode catalog disappeared');
   if(!(await page.locator('[data-r671-operational-modes="true"]').isVisible()))throw Error(label+': R671 woven continuity kernel disappeared');
   const panel=page.locator('[data-r676-operator-panel="true"]');
   await panel.waitFor({state:'visible',timeout:30000});
   await panel.getByRole('button',{name:'Open historical construct/prune operator'}).click();
   const run=panel.getByRole('button',{name:'Construct 011'});
   await run.waitFor({state:'visible',timeout:30000});
   await run.click();
   const result=panel.locator('[data-r676-operator-receipt="true"]');
   await result.waitFor({state:'visible',timeout:20000});
   let text=await result.innerText();
   if(!text.includes('P_plus_011')||!text.includes('1728')&&!text.includes('1,728'))throw Error(label+': restored construct operator not executed');
   await panel.getByRole('button',{name:'Prune 01−1'}).click();
   text=await result.innerText();if(!text.includes('P_minus_01m1'))throw Error(label+': prune did not execute');
   await panel.getByRole('button',{name:'Random walk'}).click();
   text=await result.innerText();if(!text.includes('P_rw'))throw Error(label+': weighted walk did not execute');
   await panel.getByLabel('Operator iteration count').selectOption('3');
   await panel.getByRole('button',{name:'Propagate construct−prune'}).click();
   text=await result.innerText();if(!text.includes('3 completed propagation iterations'))throw Error(label+': iterative engine receipt missing');
   if(!text.includes('Full historical 60-step propagation numerical parity remains unverified'))throw Error(label+': donor parity boundary missing');
   const first=panel.getByRole('button',{name:/Node \d+/}).first();
   if(!(await first.isVisible()))throw Error(label+': donor node selection unavailable');
   await first.click();
   await panel.getByRole('button',{name:'Construct 011'}).click();
   await result.waitFor({state:'visible',timeout:15000});
   if(errors.length)throw Error(label+': page exceptions '+errors.join(' | ').slice(0,900));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(label+': horizontal overflow '+overflow);
   console.log('R676 '+label+' PASS: preserved modes, original typed graph, P+/P-/random walk and 3-step propagation execute; source address rebinding works');
  }finally{await context.close()}
 }
}finally{await browser.close()}
