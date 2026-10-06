import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
const overrideVersion=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim(),overrideWorker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
const overrideHeaders=overrideVersion?{'Cloudflare-Workers-Version-Overrides':`${overrideWorker}="${overrideVersion}"`}:{};
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be the exact promoted SHA');

const receiptResponse=await fetch(`${base}/omega-build-receipt.json?r489=${Date.now()}`,{headers:{'cache-control':'no-cache',...overrideHeaders}});
const receiptRaw=await receiptResponse.text();
if(!receiptResponse.ok)throw new Error(`R489 promoted build receipt HTTP ${receiptResponse.status}: ${receiptRaw.slice(0,400)}`);
const receipt=JSON.parse(receiptRaw);
if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1')throw new Error(`R489 unexpected build receipt schema ${receipt?.schema}`);
if(receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw new Error(`R489 exact-SHA mismatch expected ${expectedSha} source ${receipt?.source?.sha||'NONE'} promoted ${receipt?.promotion?.promotedMergeSha||'NONE'}`);

const groups=['All','Understand','Explore','Create','Build','Work','Recover'];
const routes=['Earth Now','Workspace','System Atlas'];
const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,extraHTTPHeaders:overrideHeaders});
  const page=await context.newPage(),pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/?r489-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  const app=page.locator('.o7-app[data-omega7="true"]');
  await app.waitFor({state:'visible',timeout:30000});
  if(await page.locator('main.r71-home').count())throw new Error(`${label}: plain canonical URL still mounted OMEGAv6 instead of OMEGA7`);

  const recovered=page.locator('.o7-recovered[data-r486-visible-convergence="true"]');
  await recovered.waitFor({state:'visible',timeout:20000});
  const initialText=await recovered.innerText(),initialTextNormalized=initialText.toLocaleLowerCase();
  for(const token of ['Recovered capability fabric','Your recovered work is connected to the product','Browse recovered capabilities','execute now','active adapters','truth/device gated','bound to current routes'])if(!initialTextNormalized.includes(token.toLocaleLowerCase()))throw new Error(`${label}: R486 visible convergence missing rendered label ${token}`);

  const summary=await recovered.locator('.o7-recovered-summary article b').allTextContents();
  if(summary.length!==4)throw new Error(`${label}: expected four recovered-capability summary measures, got ${summary.length}`);
  const executesNow=Number(summary[0]),adapters=Number(summary[1]),truthGated=Number(summary[2]),parts=summary[3].split('/').map(Number),routable=parts[0],total=parts[1];
  if(![executesNow,adapters,truthGated,routable,total].every(Number.isFinite)||total<40||routable!==total)throw new Error(`${label}: invalid recovered summary ${JSON.stringify({summary,executesNow,adapters,truthGated,routable,total})}`);

  await recovered.getByRole('button',{name:'Browse recovered capabilities',exact:true}).click();
  const nav=recovered.getByRole('navigation',{name:'Recovered capability groups'});
  await nav.waitFor({state:'visible',timeout:10000});
  for(const group of groups)if(!(await nav.getByRole('button',{name:group,exact:true}).isVisible()))throw new Error(`${label}: recovered group ${group} missing`);

  await nav.getByRole('button',{name:'All',exact:true}).click();
  await page.waitForFunction(expected=>document.querySelectorAll('.o7-recovered-grid > article').length===expected,total,{timeout:15000});
  const allCount=await recovered.locator('.o7-recovered-grid > article').count();
  if(allCount!==total)throw new Error(`${label}: visible recovered count ${allCount} != declared total ${total}`);
  const stateCounts={
   executesNow:await recovered.locator('.o7-recovered-grid > article[data-state="executes_now"]').count(),
   adapters:await recovered.locator('.o7-recovered-grid > article[data-state="executes_as_adapter"]').count(),
   truthGated:await recovered.locator('.o7-recovered-grid > article[data-state="truth_gated"]').count()
  };
  if(stateCounts.executesNow!==executesNow||stateCounts.adapters!==adapters||stateCounts.truthGated!==truthGated)throw new Error(`${label}: visible state counts do not match declared summary ${JSON.stringify({stateCounts,executesNow,adapters,truthGated})}`);

  for(const group of groups.slice(1)){
   await nav.getByRole('button',{name:group,exact:true}).click();
   await page.waitForFunction(()=>document.querySelectorAll('.o7-recovered-grid > article').length>0,{timeout:10000});
   if(await recovered.locator('.o7-recovered-grid > article').count()<1)throw new Error(`${label}: recovered group ${group} rendered empty`);
  }
  await nav.getByRole('button',{name:'All',exact:true}).click();

  await page.getByLabel('Interface depth').selectOption('ADVANCED');
  const proof=recovered.locator('.o7-recovered-grid details').first();
  await proof.locator('summary').click();
  const proofText=await proof.innerText();
  for(const token of ['Lineage & proof','Reality','Receipt','R142','Admission','R125','Boundary'])if(!proofText.includes(token))throw new Error(`${label}: lineage/proof disclosure missing ${token}`);

  const exercise=label==='desktop'?routes:['Earth Now'];
  for(const route of exercise){
   await page.locator('.o7-brand').click();
   await recovered.waitFor({state:'visible',timeout:10000});
   if(!(await recovered.getByRole('button',{name:`Open ${route}`,exact:true}).count()))throw new Error(`${label}: recovered capability has no executor button for ${route}`);
   await recovered.getByRole('button',{name:`Open ${route}`,exact:true}).first().click();
   await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:20000});
   await page.waitForSelector('.o7-native-workspace',{state:'visible',timeout:30000});
  }
  await page.locator('.o7-brand').click();
  await recovered.waitFor({state:'visible',timeout:10000});

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`${label}: R489 OMEGA7 recovered surface introduced ${overflow}px horizontal overflow`);
  if(pageErrors.length)throw new Error(`${label}: R489 browser page errors ${pageErrors.join(' | ').slice(0,2400)}`);
  await context.close();
 }
 console.log(`R489 LIVE VISIBLE CAPABILITY PASS · exact promoted SHA ${expectedSha} · plain canonical URL defaults OMEGA7 · R486 recovered fabric counts/states match · all seven groups visible/nonempty · R142/R125 lineage proof exposed · Earth/Workspace/System Atlas executors navigate · desktop/mobile no overflow/page errors`);
}finally{await browser.close()}
