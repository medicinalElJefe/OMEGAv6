import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R739 exact production SHA required');
 const response=await fetch(base+'/omega-build-receipt.json?r739='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw Error('R739 production receipt unavailable '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)
  throw Error('R739 exact production SHA mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:device==='mobile'?2:1});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  try{
   await page.goto(base+'/?omega7=1&r739='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
   const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
   await portal.waitFor({state:'visible',timeout:20000});
   await portal.locator('button[data-r519-node="Atlas"]').click();
   await portal.locator('button[data-r519-launch="Atlas"]').click();
   const workspace=page.locator('.o7-science-workspace[data-route="Atlas"]');
   await workspace.waitFor({state:'visible',timeout:30000});
   const open=workspace.locator('.o7-open-instrument');
   if(await open.count())await open.click();
   const instrument=workspace.locator('[data-r732-basin-instrument="source-model"]');
   await instrument.waitFor({state:'visible',timeout:30000});
   await instrument.locator('[data-r732-run]').click();
   const inverse=instrument.locator('[data-r739-inverse]');
   await inverse.waitFor({state:'visible',timeout:45000});
   await inverse.locator('[data-r739-hub]').click();
   const summary=await inverse.locator('[data-r739-summary]').innerText();
   const root=Number(summary.match(/Address (\d+)/)?.[1]);
   const direct=Number(summary.match(/(\d+) direct source predecessors/)?.[1]);
   if(!Number.isSafeInteger(root)||!Number.isSafeInteger(direct)||direct<1)
    throw Error(device+': source preimage hub not computed');
   await page.locator('.o7-science-workspace[data-route="Atlas"][data-address="'+root+'"]').waitFor({state:'visible',timeout:10000});
   const rows=inverse.locator('[data-r739-table] tbody tr');
   if(await rows.count()<1)throw Error(device+': reverse source traversal missing');
   const first=rows.first(),predecessor=Number(await first.locator('[data-r739-parent]').innerText());
   const successor=Number(await first.locator('td').nth(2).innerText());
   if(successor!==root||!Number.isSafeInteger(predecessor)||predecessor<0||predecessor>=20736)
    throw Error(device+': inverse edge not bound to selected source successor');
   await first.locator('[data-r739-parent]').click();
   await page.locator('.o7-science-workspace[data-route="Atlas"][data-address="'+predecessor+'"]').waitFor({state:'visible',timeout:10000});
   await inverse.locator('[data-r739-hub]').click();
   await inverse.locator('[data-r739-depth]').selectOption('1');
   await inverse.locator('[data-r739-nodes]').selectOption('32');
   const bounded=await inverse.locator('[data-r739-summary]').innerText();
   if(!bounded.includes('unique reverse nodes')||!bounded.includes('exact source edges')||
      !bounded.includes('cycle return edges')||await rows.count()>32)
    throw Error(device+': bounded inverse traversal or cycle accounting missing');
   if(!(await inverse.locator('[data-r739-boundary]').innerText()).toLowerCase().includes('not observed causal ancestry'))
    throw Error(device+': model/source boundary missing');
   if(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)>8)
    throw Error(device+': horizontal overflow');
   if(errors.length)throw Error(device+': browser errors '+errors.slice(0,3).join(' | '));
   console.log('R739 '+device+' exact inverse source edges, branch hub, bounded traversal, navigation and containment PASS');
  }finally{await context.close();}
 }
}finally{await browser.close();}
