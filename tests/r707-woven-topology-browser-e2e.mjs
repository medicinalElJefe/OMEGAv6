import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R707 exact promoted SHA must be 40 hex');
 const r=await fetch(base+'/omega-build-receipt.json?r707='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R707 build receipt unavailable: '+r.status);
 const receipt=await r.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)throw Error('R707 live receipt not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r707='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const input=page.locator('[data-r706-scenario-input]');
   await input.waitFor({state:'visible',timeout:30000});
   await page.locator('[data-r624-execute]').click();
   const root=page.locator('[data-r707-vector-instrument="source-model-only"]');
   await root.waitFor({state:'visible',timeout:10000});
   if(await root.locator('[data-r707-node]').count()!==2)throw Error(device+': computed node count mismatch');
   if(await root.locator('[data-r707-edge-kind]').count()!==2)throw Error(device+': computed edge count mismatch');
   const before=Number(await root.locator('[data-r707-node="A"] circle').getAttribute('cx'));
   await root.locator('[data-r707-mirror]').click();
   const after=Number(await root.locator('[data-r707-node="A"] circle').getAttribute('cx'));
   if(Math.abs(before+after-640)>0.02)throw Error(device+': observer reflection invariant broken');
   await root.locator('[data-r707-frame]').focus();
   await root.locator('[data-r707-frame]').press('ArrowRight');
   if(!(await root.locator('[data-r707-topology-summary]').innerText()).includes('directional edges'))throw Error(device+': frame controls not active');
   await root.locator('[data-r707-export]').click();
   const svg=await root.locator('[data-r707-portable]').inputValue();
   if(!svg.includes('<svg ')||!svg.includes('MODEL ONLY')||/<script|onload=|onclick=/i.test(svg))throw Error(device+': unsafe or absent static vector export');
   const scenario=JSON.parse(await input.inputValue());
   scenario.nodes[0].continuity=0.6;
   scenario.edgeFrames[0][0].kind='BLOCKED';
   await input.fill(JSON.stringify(scenario));
   if(await page.locator('[data-r707-svg]').count())throw Error(device+': stale vector survived input editing');
   await page.locator('[data-r624-execute]').click();
   await page.locator('[data-r707-svg]').waitFor({state:'visible',timeout:10000});
   if(await page.locator('[data-r707-edge-kind="BLOCKED"]').count()!==1)throw Error(device+': typed blocked edge not projected');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   await page.locator('[data-r706-scenario-input]').waitFor({state:'visible',timeout:30000});
   const restored=JSON.parse(await page.locator('[data-r706-scenario-input]').inputValue());
   if(restored.nodes[0].continuity!==0.6||restored.edgeFrames[0][0].kind!=='BLOCKED')throw Error(device+': source input persistence failed');
   await page.locator('[data-r624-execute]').click();
   await page.locator('[data-r707-edge-kind="BLOCKED"]').waitFor({state:'attached',timeout:10000});
   await page.locator('[data-r706-scenario-input]').fill(JSON.stringify({...restored,proof:{liveRuntimeVerified:true}}));
   await page.locator('[data-r624-execute]').click();
   await page.waitForFunction(()=>document.querySelector('[data-r624-output]')?.textContent?.includes('REFUSED_NO_EXECUTION'),null,{timeout:10000});
   if(await page.locator('[data-r707-svg]').count())throw Error(device+': forged authority left a live vector');
   if(errors.length)throw Error(device+': page errors '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': viewport overflow '+overflow);
   console.log('R707 '+device+' PASS: real R706/R623 vector execution, typed edges, mirror/frame controls, safe SVG, persisted recompute, forged authority refusal, no overflow');
  }finally{await context.close()}
 }
}finally{await browser.close()}
