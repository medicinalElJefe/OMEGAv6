import {chromium} from'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
const overrideVersion=String(process.env.OMEGA_WORKER_VERSION_ID||'').trim();
const overrideWorker=String(process.env.OMEGA_WORKER_NAME||'omegav6').trim();
const affinityKey=String(process.env.OMEGA_VERSION_AFFINITY_KEY||`omega-r501-${expectedSha.slice(0,12)}`).trim();
const headers={'cache-control':'no-cache','pragma':'no-cache','Cloudflare-Workers-Version-Key':affinityKey,...(overrideVersion?{'Cloudflare-Workers-Version-Overrides':`${overrideWorker}="${overrideVersion}"`}:{})};
if(!base)throw new Error('R501 requires OMEGA_E2E_URL or OMEGA_PUBLIC_URL');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R501 requires exact promoted/source SHA');

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let receipt=null,last='UNOBSERVED';
for(let attempt=1;attempt<=20;attempt++){
 try{
  const r=await fetch(`${base}/omega-build-receipt.json?r501=${Date.now()}-${attempt}`,{headers});
  const raw=await r.text();
  if(r.ok){
   const x=JSON.parse(raw),source=String(x?.source?.sha||''),promoted=String(x?.promotion?.promotedMergeSha||'');
   last=`source ${source||'NONE'} promoted ${promoted||'NONE'}`;
   if(x?.schema==='OMEGA_GOVERNED_BUILD_RECEIPT_V1'&&source===expectedSha&&promoted===expectedSha){receipt=x;break}
  }else last=`HTTP ${r.status} ${raw.slice(0,160)}`;
 }catch(error){last=error instanceof Error?error.message:String(error)}
 if(attempt<20)await sleep(1000);
}
if(!receipt)throw new Error(`R501 exact receipt did not converge · expected ${expectedSha} · last ${last}`);

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,extraHTTPHeaders:headers});
  const page=await context.newPage(),pageErrors=[],assetFailures=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('requestfailed',r=>{if(/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(r.url()))assetFailures.push(`${r.url()} :: ${r.failure()?.errorText||'FAILED'}`)});
  page.on('response',r=>{if(r.status()>=400&&/\/assets\/.*\.(?:js|css)(?:\?|$)/i.test(r.url()))assetFailures.push(`${r.status()} ${r.url()}`)});

  await page.goto(`${base}/?r501=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:15000});
  if(await page.locator('main.r71-home').count())throw new Error(`R501 ${label}: plain canonical URL fell back to OMEGA6`);

  await page.locator('.o7-search-trigger').click();
  const input=page.locator('.o7-command input');
  await input.waitFor({state:'visible',timeout:10000});
  await input.fill('Convergence');
  const route=page.locator('[data-command-route="Convergence"]');
  await route.waitFor({state:'visible',timeout:10000});
  await route.click();

  const host=page.locator('.o7-native-host[data-native-host-route="Convergence"]');
  await host.waitFor({state:'visible',timeout:15000});
  await host.locator('.o7-native-workspace').waitFor({state:'visible',timeout:30000});
  const opener=host.locator('.o7-open-instrument');
  if(await opener.count()){
   await opener.waitFor({state:'visible',timeout:10000});
   await opener.click();
  }
  const panel=host.locator('[data-r501-exact-traversal="true"]');
  await panel.waitFor({state:'visible',timeout:30000});

  const state=await panel.evaluate(el=>({
   verified:el.getAttribute('data-r501-verified'),
   provenance:el.getAttribute('data-r501-provenance'),
   text:(el.textContent||'').replace(/\s+/g,' ').trim()
  }));
  if(state.verified!=='true')throw new Error(`R501 ${label}: exact traversal envelope is not verified: ${JSON.stringify(state)}`);
  if(state.provenance!=='DER')throw new Error(`R501 ${label}: Earth query provenance widened beyond DER: ${JSON.stringify(state)}`);
  const upper=state.text.toUpperCase();
  for(const token of['R501 · LIVE EXACT TRAVERSAL BINDING','R500 ENVELOPE IS NOW CONSUMED BY CONVERGENCE','EXACT CANON ADDRESS','ATLAS360 MODEL FRAME','EARTH QUERY CONTEXT','SOURCE CLOCK EVIDENCE','CANONICAL MUTATION NO','PRODUCTION AUTHORITY CHANGED NO','OBSERVATION FROM MODEL CLAIMED NO']){
   if(!upper.includes(token))throw new Error(`R501 ${label}: live panel missing ${token}: ${state.text.slice(0,2200)}`);
  }
  const clocks=state.text.match(/(\d+)\s+OBS\s*·\s*(\d+)\s+GAP/i);
  if(!clocks||Number(clocks[1])+Number(clocks[2])!==4)throw new Error(`R501 ${label}: source clock OBS/GAP partition is not complete: ${state.text.slice(0,2200)}`);

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)>window.innerWidth+3);
  if(overflow)throw new Error(`R501 ${label}: horizontal overflow on Convergence executor`);
  if(pageErrors.length)throw new Error(`R501 ${label}: page errors ${pageErrors.join(' | ').slice(0,2400)}`);
  if(assetFailures.length)throw new Error(`R501 ${label}: asset failures ${assetFailures.join(' | ').slice(0,2400)}`);
  console.log(`R501 LIVE EXACT TRAVERSAL BROWSER PASS · ${label} · exact SHA ${expectedSha} · verified R500 envelope consumed by Convergence · DER query boundary · 4-way OBS/GAP clock partition · no authority inflation/page errors/overflow`);
  await context.close();
 }
}finally{await browser.close()}
