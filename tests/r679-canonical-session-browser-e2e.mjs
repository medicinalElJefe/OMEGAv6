import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R679 requires exact promoted SHA');
 const res=await fetch(base+'/omega-build-receipt.json?r679='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!res.ok)throw Error('R679 exact build receipt not reachable: '+res.status);
 const receipt=await res.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)
  throw Error('R679 source is not the promoted SHA; production proof held');
}
const browser=await chromium.launch({headless:true});
async function openModes(page){
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
 await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
 const route=page.locator('[data-capability-route="Modes"]');await route.waitFor({state:'visible',timeout:15000});
 await route.locator('footer button').click();
 await page.locator('.o7-native-workspace[data-route="Modes"]').waitFor({state:'visible',timeout:25000});
 const full=page.getByRole('button',{name:'Open full Modes workspace'});
 if(await full.isVisible())await full.click();
 const panel=page.locator('[data-r679-session-ledger="true"]');
 await panel.waitFor({state:'visible',timeout:25000});
 await panel.getByRole('button',{name:'Open source-bound session recorder'}).click();
 await panel.locator('[data-r679-session-open="true"]').waitFor({state:'visible',timeout:15000});
 return panel;
}
try{
 for(const [label,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport,acceptDownloads:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r679='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   let panel=await openModes(page);
   await panel.getByRole('button',{name:'Start new source-bound session'}).click({timeout:30000});
   await panel.locator('[data-r679-session-record="true"]').waitFor({state:'visible',timeout:20000});
   await panel.getByRole('button',{name:'Execute and record source receipt'}).click();
   await page.getByText('1/128 events').waitFor({state:'visible',timeout:20000});
   await panel.getByLabel('R679 execution family').selectOption('OPERATOR_RUN');
   await panel.getByLabel('R679 operator').selectOption('P_plus_011');
   await panel.getByRole('button',{name:'Execute and record source receipt'}).click();
   await page.getByText('2/128 events').waitFor({state:'visible',timeout:20000});
   await panel.getByLabel('R679 execution family').selectOption('DONOR_REPLAY');
   await panel.getByRole('button',{name:'Execute and record source receipt'}).click();
   await page.getByText('3/128 events').waitFor({state:'visible',timeout:20000});
   await panel.getByRole('button',{name:'Replay and verify entire session'}).click();
   const verified=panel.locator('[data-r679-verification="valid"]');
   await verified.waitFor({state:'visible',timeout:20000});
   if(!(await verified.innerText()).includes('3/3 events re-executed'))throw Error(label+': source executions not replayed');
   const persisted=await page.evaluate(()=>localStorage.getItem('omega.r679.model.session.v1'));
   if(!persisted)throw Error(label+': session did not persist in localStorage');
   const stored=JSON.parse(persisted);
   if(stored.events.length!==3||stored.events[2].outputHash!=='5f2bed97e66c0fe0e0755d3c805ed591bd37a5100e099308c998f73280381ed5')
    throw Error(label+': source donor receipt missing in persisted record');
   const downloadPromise=page.waitForEvent('download');
   await panel.getByRole('button',{name:'Export evidence JSON'}).click();
   const download=await downloadPromise;
   if(!download.suggestedFilename().startsWith('omega-r679-local-session-'))throw Error(label+': export filename not source-bound');
   await page.reload({waitUntil:'domcontentloaded'});
   panel=await openModes(page);
   await page.getByText('3/128 events').waitFor({state:'visible',timeout:20000});
   await panel.getByRole('button',{name:'Replay and verify entire session'}).click();
   await panel.locator('[data-r679-verification="valid"]').waitFor({state:'visible',timeout:20000});
   await page.evaluate(()=>{const k='omega.r679.model.session.v1';const s=JSON.parse(localStorage.getItem(k));s.events[0].action.mode='EXPLORE';localStorage.setItem(k,JSON.stringify(s))});
   await page.reload({waitUntil:'domcontentloaded'});
   panel=await openModes(page);
   await panel.getByRole('button',{name:'Replay and verify entire session'}).click();
   const rejected=panel.locator('[data-r679-verification="held"]');
   await rejected.waitFor({state:'visible',timeout:20000});
   if(!(await rejected.innerText()).includes('CHAIN_HASH:0')&&!(await rejected.innerText()).includes('REPLAY_OUTPUT:0'))throw Error(label+': edit did not invalidate output chain');
   await panel.locator('input[type=file]').setInputFiles({name:'omega-session.json',mimeType:'application/json',buffer:Buffer.from(persisted)});
   await page.getByText('IMPORTED_UNVERIFIED').waitFor({state:'visible',timeout:15000});
   await panel.getByRole('button',{name:'Replay and verify entire session'}).click();
   await panel.locator('[data-r679-verification="valid"]').waitFor({state:'visible',timeout:20000});
   const exported=page.waitForEvent('download');
   await panel.getByRole('button',{name:'Export full portable source + session'}).click();
   const bundleDownload=await exported;
   if(!bundleDownload.suggestedFilename().startsWith('omega-r684-portable-proof-'))throw Error(label+': R684 portable export missing');
   const stream=await bundleDownload.createReadStream(),pieces=[];
   if(!stream)throw Error(label+': source snapshot download unreadable');
   for await(const piece of stream)pieces.push(piece);
   const portable=Buffer.concat(pieces);
   if(portable.length<800000||portable.length>2*1024*1024)throw Error(label+': R684 bounded source snapshot size incorrect');
   const payload=JSON.parse(portable.toString());
   if(payload.sourceCount!==20736||payload.sourceKeys.length!==8||payload.session.events.length!==3)
    throw Error(label+': missing full canonical source or original 3 receipts');
   const good=panel.locator('[data-r684-portable-proof="verified"]');
   await good.waitFor({state:'visible',timeout:30000});
   if(!(await good.innerText()).includes('VERIFIED_LOCAL_REPLAY_AND_LIVE_SOURCE_MATCH'))throw Error(label+': original source not reverified');
   const input=panel.locator('input[aria-label="Import R684 portable proof file"]');
   const damaged=structuredClone(payload);damaged.session.events[0].action.mode='EXPLORE';
   await input.setInputFiles({name:'tampered.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(damaged))});
   await panel.locator('[data-r684-portable-proof="held"]').waitFor({state:'visible',timeout:30000});
   await input.setInputFiles({name:'original.json',mimeType:'application/json',buffer:portable});
   await good.waitFor({state:'visible',timeout:30000});
   await panel.getByRole('button',{name:'Restore verified portable session locally'}).click();
   await page.getByText('PORTABLE_SOURCE_SESSION_RESTORED').waitFor({state:'visible',timeout:20000});
   await panel.getByRole('button',{name:'Replay and verify entire session'}).click();
   await panel.locator('[data-r679-verification="valid"]').waitFor({state:'visible',timeout:20000});
   if(errors.length)throw Error(label+': uncaught browser errors '+errors.join(' | ').slice(0,1000));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(label+': horizontal layout overflow '+overflow);
   console.log('R679/R684 '+label+' PASS: MODE/GRAPH/DONOR source executions, full 3-record replay, download, reload persistence, deliberate tamper rejection, verified import recovery and responsive layout');
  }finally{await context.close()}
 }
}finally{await browser.close()}
