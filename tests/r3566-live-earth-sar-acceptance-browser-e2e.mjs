import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R356.6 SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
 const context=await browser.newContext({viewport,deviceScaleFactor:dpr,permissions:['geolocation'],geolocation:{latitude:32.2226,longitude:-110.9747}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${base}/?r3566-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.getByLabel('Open Earth Now').waitFor({state:'visible',timeout:20000});
 await page.getByLabel('Open Earth Now').click();
 await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Earth Now',{timeout:30000});
 const sarButton=page.locator('.earth-r279-view-tabs button').filter({hasText:'SAR Truth'}).first();
 await sarButton.click();
 await page.waitForSelector('.sar-r285-live',{state:'visible',timeout:30000});

 // Human-first location selection must be present directly in SAR.
 const search=page.getByLabel('Search SAR location');
 await search.waitFor({state:'visible',timeout:10000});
 if(await page.locator('.r285-querybar label').filter({hasText:/^LAT$/}).count())throw new Error('R356.6 manual LAT remains primary SAR control');
 if(await page.locator('.r285-querybar label').filter({hasText:/^LON$/}).count())throw new Error('R356.6 manual LON remains primary SAR control');
 if(!(await page.getByRole('button',{name:'Use my location'}).isVisible()))throw new Error('R356.6 device-location control missing');
 await page.getByRole('button',{name:'Use my location'}).click();
 await page.waitForFunction(()=>document.querySelector('.r3564-sar-coords code')?.textContent?.includes('32.22260')&&document.querySelector('.r3564-sar-coords code')?.textContent?.includes('-110.97470'),{timeout:12000});
 const deviceCoords=(await page.locator('.r3564-sar-coords code').innerText()).trim();
 if(!deviceCoords.includes('32.22260')||!deviceCoords.includes('-110.97470'))throw new Error(`R356.6 device geolocation did not become exact target: ${deviceCoords}`);

 // Search a real place through the canonical geocoder bridge and select a returned result on desktop;
 // mobile reuses the canonical target and proves the responsive operational surface.
 if(label==='desktop'){
  await search.fill('Tucson Arizona');
  await page.getByRole('button',{name:'Find location'}).click();
  await page.waitForSelector('.r3564-sar-results button',{state:'visible',timeout:20000});
  const first=page.locator('.r3564-sar-results button').first();
  const resultText=(await first.innerText()).trim();
  if(!/Tucson/i.test(resultText))throw new Error(`R356.6 place picker returned unexpected first result: ${resultText.slice(0,240)}`);
  await first.click();
 }
 await page.waitForFunction(()=>document.querySelector('.r285-source-ribbon')?.textContent?.includes('WGS84'),{timeout:10000});

 // Chain-lemma fields must render from already-bound satellite/evidence anchors without native SAR closure.
 await page.waitForFunction(()=>document.querySelectorAll('.r284-lens-card[data-r3565-lemma="true"]').length>=10,{timeout:45000});
 const lemmaCards=page.locator('.r284-lens-card[data-r3565-lemma="true"]');
 const lemmaCount=await lemmaCards.count();
 if(lemmaCount<10)throw new Error(`R356.6 expected derived satellite lemma coverage across lens deck, found ${lemmaCount}`);
 const totalCards=await page.locator('.r284-lens-card').count();
 if(totalCards!==12)throw new Error(`R356.6 expected 12 analytical lenses, found ${totalCards}`);
 const main=page.locator('.r280-screen');
 await page.waitForSelector('.r3565-lemma-canvas',{state:'visible',timeout:15000});
 const badge=await page.locator('.r3565-lemma-badge').innerText();
 if(!badge.includes('CHAIN LEMMA')||!badge.includes('NASA GIBS'))throw new Error(`R356.6 derived-field truth badge incomplete: ${badge}`);
 const text=await page.locator('.sar-r285-live').innerText();
 for(const token of ['Find location','Use my location','CHAIN LEMMA','DERIVED'])if(!text.includes(token))throw new Error(`R356.6 live SAR missing ${token}`);
 const advancedOpen=await page.locator('.r309-sar-assets[open]').count();
 if(advancedOpen>0)throw new Error(`R356.6 advanced SAR evidence stacks should default collapsed, found ${advancedOpen} open`);
 const evidenceStack=page.locator('.r309-sar-assets').first();
 if(await evidenceStack.count()){await evidenceStack.locator('summary').click();if(!(await evidenceStack.getAttribute('open'))&&!(await evidenceStack.evaluate(el=>el.hasAttribute('open'))))throw new Error('R356.6 advanced evidence stack did not open on operator action');await evidenceStack.locator('summary').click();if(await evidenceStack.evaluate(el=>el.hasAttribute('open')))throw new Error('R356.6 advanced evidence stack did not close on operator action');}
 const allLensCards=page.locator('.r284-lens-card');
 for(let i=0;i<12;i++){const card=allLensCards.nth(i);await card.click();await page.waitForFunction(index=>document.querySelectorAll('.r284-lens-card')[index]?.getAttribute('data-active')==='true',i,{timeout:5000});if(!(await page.locator('.r3565-lemma-canvas').isVisible()))throw new Error(`R356.6 analytical lens ${i+1} lost chain-lemma field after selection`);}
 const slc=page.locator('.r285-mode button').filter({hasText:'SLC'}).first(),grd=page.locator('.r285-mode button').filter({hasText:'GRD'}).first();
 await slc.click();if(await slc.getAttribute('aria-pressed')!=='true')throw new Error('R356.6 SLC mode control did not activate');
 await grd.click();if(await grd.getAttribute('aria-pressed')!=='true')throw new Error('R356.6 GRD mode control did not reactivate');
 const rect=await main.boundingBox();const minWidth=label==='desktop'?500:300;if(!rect||rect.width<minWidth||rect.height<300)throw new Error(`R356.6 ${label} main analytical surface unusable ${JSON.stringify(rect)}`);
 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
 if(overflow>12)throw new Error(`R356.6 ${label} introduced ${overflow}px horizontal overflow`);
 if(errors.length)throw new Error(`R356.6 ${label} browser errors ${errors.join(' | ')}`);
 await context.close();
 }
 console.log(`R365 LIVE EARTH/SAR ACCEPTANCE PASS · exact promoted SHA ${expectedSha} · desktop + 2×DPR mobile · human place search selectable · device geolocation actuated · exact WGS84 target updated · all 12 analytical lenses clickable · GRD/SLC mode controls actuated · chain-lemma fields remain materially rendered · evidence stacks open/close correctly · no page errors/overflow`);
}finally{await browser.close()}
