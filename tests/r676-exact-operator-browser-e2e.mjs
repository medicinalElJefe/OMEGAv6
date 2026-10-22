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
   const catalog=page.locator('.sbm21-app');
   const woven=page.locator('[data-r671-operational-modes="true"]');
   const panel=page.locator('[data-r676-operator-panel="true"]');
   // All three surfaces are asynchronously imported; navigation appearing does not
   // imply the contained lazy modules have committed to the DOM.
   for(const [name,node] of [['existing source-mode catalog',catalog],['R671 woven continuity executor',woven],['R676 exact graph operator',panel]]){
    try{await node.waitFor({state:'visible',timeout:30000})}
    catch(error){
     const diagnostic=await page.evaluate(()=>({route:document.querySelector('.o7-native-workspace')?.getAttribute('data-route'),
      instrumentOpen:!!document.querySelector('.o7-native-surface'),
      loaders:[...document.querySelectorAll('[role=status]')].map(e=>e.textContent?.trim().slice(0,160)),
      failures:[...document.querySelectorAll('[role=alert],.o7-native-failure')].map(e=>e.textContent?.trim().slice(0,400)),
      sourceModeMounted:!!document.querySelector('.sbm21-app'),
      wovenMounted:!!document.querySelector('[data-r671-operational-modes]'),
      operatorMounted:!!document.querySelector('[data-r676-operator-panel]')}));
     throw Error(label+': '+name+' did not mount: '+JSON.stringify({diagnostic,pageErrors:errors})+'; '+String(error))
    }
   }
   await panel.getByRole('button',{name:'Open historical construct/prune operator'}).click();
   const run=panel.getByRole('button',{name:'Construct 011'});
   await run.waitFor({state:'visible',timeout:30000});
   await run.click();
   const result=panel.locator('[data-r676-operator-receipt="true"]');
   await result.waitFor({state:'visible',timeout:20000});
   const disk=panel.locator('[data-r677-operator-disk="source-exact"] svg');
   await disk.waitFor({state:'visible',timeout:15000});
   const dots=await disk.locator('circle[fill="#79d5e4"]').count();
   if(dots!==143)throw Error(label+': native polar disk lost source nodes: '+dots+'/143 unselected');
   const diskDescription=await disk.getAttribute('aria-label');
   if(!diskDescription?.includes('144-node disk'))throw Error(label+': historical native geometry source boundary unavailable');
   let text=await result.innerText();
   if(!text.includes('P_plus_011')||!text.includes('1728')&&!text.includes('1,728'))throw Error(label+': restored construct operator not executed');
   await panel.getByRole('button',{name:'Prune 01−1'}).click();
   text=await result.innerText();if(!text.includes('P_minus_01m1'))throw Error(label+': prune did not execute');
   await panel.getByRole('button',{name:'Random walk'}).click();
   text=await result.innerText();if(!text.includes('P_rw'))throw Error(label+': weighted walk did not execute');
   await panel.getByLabel('Operator iteration count').selectOption('3');
   await panel.getByRole('button',{name:'Propagate construct−prune'}).click();
   text=await result.innerText();if(!text.includes('3 completed propagation iterations'))throw Error(label+': iterative engine receipt missing');
   if(!text.includes('its stored final distribution is reproduced by 59 effective updates'))throw Error(label+': original T60 discrepancy not preserved');
   await panel.getByRole('button',{name:'Verify original donor CSV (59 updates)'}).click();
   const parity=panel.locator('[data-r678-historical-parity="matched"]');
   await parity.waitFor({state:'visible',timeout:20000});
   const proofText=await parity.innerText();
   if(!proofText.includes('SOURCE-MATCHED')||!proofText.includes('5f2bed97e66c0fe0e0755d3c805ed591bd37a5100e099308c998f73280381ed5'))throw Error(label+': original donor full-vector digest was not matched');
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
