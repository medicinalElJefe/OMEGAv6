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
 const context=await browser.newContext({viewport:{width:1440,height:960}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(`${base}/?r3566-live=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});
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

 // Search a real place through the canonical geocoder bridge and select a returned result.
 await search.fill('Tucson Arizona');
 await page.getByRole('button',{name:'Find location'}).click();
 await page.waitForSelector('.r3564-sar-results button',{state:'visible',timeout:20000});
 const first=page.locator('.r3564-sar-results button').first();
 const resultText=(await first.innerText()).trim();
 if(!/Tucson/i.test(resultText))throw new Error(`R356.6 place picker returned unexpected first result: ${resultText.slice(0,240)}`);
 await first.click();
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
 const rect=await main.boundingBox();if(!rect||rect.width<500||rect.height<300)throw new Error(`R356.6 main analytical surface unusable ${JSON.stringify(rect)}`);
 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
 if(overflow>12)throw new Error(`R356.6 introduced ${overflow}px horizontal overflow`);
 if(errors.length)throw new Error(`R356.6 browser errors ${errors.join(' | ')}`);
 await context.close();
 console.log(`R356.6 LIVE EARTH/SAR ACCEPTANCE PASS · exact promoted SHA ${expectedSha} · human place selection works · device-location control present · 12-lens deck · chain-lemma satellite fields render before native SAR closure · advanced evidence collapsed · no page errors/overflow`);
}finally{await browser.close()}
