import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R705 promoted SHA must be 40 hex digits');
 const r=await fetch(base+'/omega-build-receipt.json?r705='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R705 live build receipt unavailable: '+r.status);
 const receipt=await r.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R705 live receipt not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r705='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const audit=page.locator('[data-r705-capability-audit="source-resolution"]');
   await audit.waitFor({state:'visible',timeout:30000});
   if(!(await audit.innerText()).includes('not a live production-health certificate'))throw Error(device+': source/runtime truth boundary missing');
   const pillar=audit.getByLabel('Filter capability pillar');
   const state=audit.getByLabel('Filter capability evidence state');
   if(await pillar.locator('option').count()!==13)throw Error(device+': architecture pillars not conserved');
   await state.selectOption('ALL');
   await audit.getByLabel('Search historical capabilities').fill('Workbook / Excel atlas runtime');
   const workbook=audit.locator('[data-r705-capability-id="WORKBOOK"]');
   await workbook.waitFor({state:'visible',timeout:10000});
   await pillar.selectOption('CALCULUS');
   await workbook.waitFor({state:'detached',timeout:10000}).catch(()=>{throw Error(device+': pillar filter failed to remove non-calculus capability')});
   await pillar.selectOption('APPLICATIONS');
   await workbook.waitFor({state:'visible',timeout:10000});
   if(!(await workbook.innerText()).includes('live execution still requires independent proof')&&!(await workbook.innerText()).includes('Remaining gap:'))throw Error(device+': no source-gap or proof boundary');
   await workbook.getByRole('button',{name:'Open current route: System Atlas'}).click();
   await page.locator('[data-native-host-route="System Atlas"]').waitFor({state:'visible',timeout:30000});
   if(errors.length)throw Error(device+': browser errors: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': horizontal overflow '+overflow);
   console.log('R705 '+device+' PASS: 12-pillar source audit, search/filter and real OMEGA7 System Atlas route launch; no source-to-live proof escalation');
  }finally{await context.close()}
 }
}finally{await browser.close()}
