import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R370 SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,permissions:['geolocation'],geolocation:{latitude:32.2226,longitude:-110.9747}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r370-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.getByLabel('Open Earth Now').waitFor({state:'visible',timeout:20000});
  await page.getByLabel('Open Earth Now').click();
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
  const sarButton=page.locator('.earth-r279-view-tabs button').filter({hasText:'SAR Truth'}).first();
  await sarButton.click();
  await page.waitForSelector('.sar-r285-live',{state:'visible',timeout:30000});

  const search=page.getByLabel('Search SAR location');
  await search.waitFor({state:'visible',timeout:10000});
  if(await page.locator('.r285-querybar label').filter({hasText:/^LAT$/}).count())throw new Error('R370 manual LAT remains primary SAR control');
  if(await page.locator('.r285-querybar label').filter({hasText:/^LON$/}).count())throw new Error('R370 manual LON remains primary SAR control');
  const useLocation=page.getByRole('button',{name:'Use my location'});
  if(!(await useLocation.isVisible()))throw new Error('R370 device-location control missing');
  await useLocation.click();
  await page.waitForFunction(()=>document.querySelector('.r3564-sar-coords code')?.textContent?.includes('32.22260')&&document.querySelector('.r3564-sar-coords code')?.textContent?.includes('-110.97470'),{timeout:12000});

  if(label==='desktop'){
   await search.fill('Tucson Arizona');
   await page.getByRole('button',{name:'Find location'}).click();
   await page.waitForSelector('.r3564-sar-results button',{state:'visible',timeout:20000});
   const first=page.locator('.r3564-sar-results button').first();
   const resultText=(await first.innerText()).trim();
   if(!/Tucson/i.test(resultText))throw new Error(`R370 place picker returned unexpected first result: ${resultText.slice(0,240)}`);
   await first.click();
  }

  await page.waitForFunction(()=>document.querySelectorAll('.r284-lens-card[data-r3565-lemma="true"]').length===12,{timeout:45000});
  const totalCards=await page.locator('.r284-lens-card').count();
  if(totalCards!==12)throw new Error(`R370 expected 12 analytical lenses, found ${totalCards}`);
  await page.waitForSelector('.r3565-lemma-canvas[data-truth-class="DERIVED_TRIANGULATED"]',{state:'visible',timeout:20000});
  const sarInstrument=page.locator('.sar-r285-live .sar-r280');
  const screen=sarInstrument.locator('.r280-screen');
  if(await screen.getAttribute('data-clean-view')!=='true')throw new Error('R370 clean SAR view must default active');
  if(await sarInstrument.locator('.r3565-lemma-badge').isVisible().catch(()=>false))throw new Error('R370 clean SAR view must not overlay the chain-lemma badge');
  const details=sarInstrument.getByRole('button',{name:'VIEW DETAILS',exact:true});
  await details.waitFor({state:'visible',timeout:10000});
  await details.click();
  if(await screen.getAttribute('data-clean-view')!=='false')throw new Error('R370 VIEW DETAILS did not restore analytical overlays');
  const badge=await sarInstrument.locator('.r3565-lemma-badge').innerText();
  if(!badge.includes('CHAIN LEMMA')||!badge.includes('NASA GIBS'))throw new Error(`R370 derived-field truth badge incomplete in detail view: ${badge}`);
  await sarInstrument.getByRole('button',{name:'CLEAN VIEW',exact:true}).click();
  if(await screen.getAttribute('data-clean-view')!=='true')throw new Error('R370 CLEAN VIEW did not restore unobstructed field');

  const allLensCards=page.locator('.r284-lens-card');
  for(let i=0;i<12;i++){
   const card=allLensCards.nth(i);await card.click();
   await page.waitForFunction(index=>document.querySelectorAll('.r284-lens-card')[index]?.getAttribute('data-active')==='true',i,{timeout:5000});
   if(!(await page.locator('.r3565-lemma-canvas').isVisible()))throw new Error(`R370 analytical lens ${i+1} lost chain-lemma field after selection`);
  }

  const slc=page.locator('.r285-mode button').filter({hasText:'SLC'}).first(),grd=page.locator('.r285-mode button').filter({hasText:'GRD'}).first();
  await slc.click();if(await slc.getAttribute('aria-pressed')!=='true')throw new Error('R370 SLC mode control did not activate');
  await grd.click();if(await grd.getAttribute('aria-pressed')!=='true')throw new Error('R370 GRD mode control did not reactivate');

  const advanced=page.locator('.r309-sar-assets');
  if(await page.locator('.r309-sar-assets[open]').count())throw new Error('R370 advanced evidence stacks must default collapsed');
  if(await advanced.count()){
   const first=advanced.first();await first.locator('summary').click();
   if(!(await first.evaluate(el=>el.hasAttribute('open'))))throw new Error('R370 evidence stack did not open');
   await first.locator('summary').click();
   if(await first.evaluate(el=>el.hasAttribute('open')))throw new Error('R370 evidence stack did not close');
  }

  const canvas=page.locator('.r3565-lemma-canvas');
  const rendered=await canvas.evaluate(el=>({count:el.querySelectorAll(':scope > i').length,unique:new Set([...el.querySelectorAll(':scope > i')].slice(0,1500).map(x=>getComputedStyle(x).backgroundColor)).size}));
  if(rendered.count<4096||rendered.unique<8)throw new Error(`R370 chain-lemma field materially insufficient ${JSON.stringify(rendered)}`);
  const screenBox=page.locator('.r280-screen'),centerBox=page.locator('.r280-center'),rect=await screenBox.boundingBox(),centerRect=await centerBox.boundingBox(),minWidth=label==='desktop'?500:viewport.width*.60;
  if(!rect||!centerRect||rect.width<minWidth||rect.height<300||rect.width<centerRect.width-2)throw new Error(`R370 ${label} analytical surface unusable ${JSON.stringify({rect,centerRect,minWidth})}`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`R370 ${label} introduced ${overflow}px horizontal overflow`);
  if(errors.length)throw new Error(`R370 ${label} browser errors ${errors.join(' | ')}`);
  await context.close();
 }
 console.log(`R370 LIVE EARTH/SAR CLOSURE PASS · exact promoted SHA ${expectedSha} · place search + device geolocation · all 12 analytical lenses actuated · GRD/SLC toggled · chain-lemma fields materially rendered · clean/detail overlay contract proved · evidence disclosure actuated · desktop/mobile relative field geometry · no page errors/overflow`);
}finally{await browser.close()}
