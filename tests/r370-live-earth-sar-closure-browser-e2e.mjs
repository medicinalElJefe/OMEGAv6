import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||process.env.OMEGA_PROMOTED_SHA||'').trim();
if(!base)throw new Error('OMEGA_E2E_URL or OMEGA_PUBLIC_URL required');
if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('OMEGA_EXPECTED_SHA or OMEGA_PROMOTED_SHA must be exact promoted SHA');

const receipt=await fetch(base+'/omega-build-receipt.json',{headers:{'cache-control':'no-cache'}}).then(async r=>{if(!r.ok)throw new Error(`receipt HTTP ${r.status}`);return r.json()});
const served=receipt?.promotion?.promotedMergeSha||receipt?.source?.sha||'';
if(served!==expectedSha)throw new Error(`R370 SHA mismatch expected ${expectedSha} served ${served||'NONE'}`);

async function waitAnalytical(page,timeout=45000){
 await page.waitForFunction(()=>{const el=document.querySelector('.sar-r285-live .sar-r280');if(!el)return false;const cards=[...el.querySelectorAll('.r284-lens-card')],head=el.querySelector('.r280-screen-head b')?.textContent||'',lemma=el.querySelector('.r3565-lemma-canvas[data-truth-class="DERIVED_TRIANGULATED"]'),native=head.includes('BOUND MEASUREMENT FIELD')?el.querySelector('.r280-canvas'):null,coords=document.querySelector('.r3564-sar-coords code')?.textContent?.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/),targetBound=!lemma||Boolean(coords&&lemma.getAttribute('data-target-lat')===Number(coords[1]).toFixed(5)&&lemma.getAttribute('data-target-lon')===Number(coords[2]).toFixed(5));return cards.length===12&&cards.every(card=>card.querySelector('.r3565-mini-lemma,.r284-mini-grid'))&&Boolean(lemma||native)&&targetBound},{timeout});
}
async function analyticalState(sarInstrument){
 return sarInstrument.evaluate(el=>{const visible=node=>{if(!node)return false;const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0},head=el.querySelector('.r280-screen-head b')?.textContent||'',lemma=el.querySelector('.r3565-lemma-canvas[data-truth-class="DERIVED_TRIANGULATED"]'),native=head.includes('BOUND MEASUREMENT FIELD')?el.querySelector('.r280-canvas'):null,field=visible(lemma)?lemma:visible(native)?native:null,cells=field?[...field.querySelectorAll(':scope > i')]:[],cards=[...el.querySelectorAll('.r284-lens-card')],badge=el.querySelector('.r3565-lemma-badge'),grid=el.querySelector('.r280-grid'),readout=el.querySelector('.r284-view-readout');return{kind:field&&field===lemma?'DERIVED_TRIANGULATED':field&&field===native?'BOUND_NATIVE':'PENDING',count:cells.length,unique:new Set(Array.from({length:Math.min(1500,cells.length)},(_,i)=>cells[Math.round(i*(cells.length-1)/Math.max(1,Math.min(1500,cells.length)-1))]).map(x=>getComputedStyle(x).backgroundColor)).size,populated:cards.filter(card=>card.querySelector('.r3565-mini-lemma,.r284-mini-grid')).length,badge:badge?.textContent||'',gridVisible:visible(grid),readoutVisible:visible(readout),readout:readout?.textContent||'',head}});
}

const browser=await chromium.launch({headless:true});
try{
 for(const [label,viewport,dpr] of [['desktop',{width:1440,height:960},1],['mobile',{width:390,height:844},2]]){
  const context=await browser.newContext({viewport,deviceScaleFactor:dpr,permissions:['geolocation'],geolocation:{latitude:32.2226,longitude:-110.9747}});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?omega6=1&r370-live=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
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

  await waitAnalytical(page);
  const totalCards=await page.locator('.r284-lens-card').count();
  if(totalCards!==12)throw new Error(`R370 expected 12 analytical lenses, found ${totalCards}`);
  const sarInstrument=page.locator('.sar-r285-live .sar-r280');
  const initialState=await analyticalState(sarInstrument);
  if(initialState.kind==='PENDING'||initialState.populated!==12)throw new Error(`R370 analytical state did not settle across all 12 lenses ${JSON.stringify(initialState)}`);
  const screen=sarInstrument.locator('.r280-screen');
  if(await screen.getAttribute('data-clean-view')!=='true')throw new Error('R370 clean SAR view must default active');
  if(await sarInstrument.locator('.r3565-lemma-badge').isVisible().catch(()=>false))throw new Error('R370 clean SAR view must not overlay the chain-lemma badge');
  const details=sarInstrument.getByRole('button',{name:'VIEW DETAILS',exact:true});
  await details.waitFor({state:'visible',timeout:10000});
  await details.click();
  if(await screen.getAttribute('data-clean-view')!=='false')throw new Error('R370 VIEW DETAILS did not restore analytical overlays');
  const detailState=await analyticalState(sarInstrument);
  if(detailState.kind==='DERIVED_TRIANGULATED'){
   if(!detailState.badge.includes('CHAIN LEMMA')||!detailState.badge.includes('NASA GIBS'))throw new Error(`R370 derived-field truth badge incomplete in detail view: ${detailState.badge}`);
  }else if(detailState.kind==='BOUND_NATIVE'){
   if(!detailState.gridVisible||!detailState.readoutVisible||!detailState.readout.trim())throw new Error(`R370 native measurement field lacks explicit detail overlays/readout ${JSON.stringify(detailState)}`);
  }else throw new Error('R370 detail view has neither derived triangulated nor bound native analytical field');
  await sarInstrument.getByRole('button',{name:'CLEAN VIEW',exact:true}).click();
  if(await screen.getAttribute('data-clean-view')!=='true')throw new Error('R370 CLEAN VIEW did not restore unobstructed field');

  const allLensCards=page.locator('.r284-lens-card');
  for(let i=0;i<12;i++){
   const card=allLensCards.nth(i);await card.click();
   await page.waitForFunction(index=>document.querySelectorAll('.r284-lens-card')[index]?.getAttribute('data-active')==='true',i,{timeout:5000});
   await waitAnalytical(page,10000);
   const lensState=await analyticalState(sarInstrument);
   if(lensState.kind==='PENDING'||lensState.count<4096||lensState.unique<8)throw new Error(`R370 analytical lens ${i+1} lost a material derived/native field ${JSON.stringify(lensState)}`);
  }

  const slc=page.locator('.r285-mode button').filter({hasText:'SLC'}).first(),grd=page.locator('.r285-mode button').filter({hasText:'GRD'}).first();
  await slc.click();if(await slc.getAttribute('aria-pressed')!=='true')throw new Error('R370 SLC mode control did not activate');
  await grd.click();if(await grd.getAttribute('aria-pressed')!=='true')throw new Error('R370 GRD mode control did not reactivate');

  const advanced=page.locator('.r309-sar-assets');
  if(await page.locator('.r309-sar-assets[open]').count())throw new Error('R370 advanced evidence stacks must default collapsed');
  if(await advanced.count()){
   const first=advanced.first();await first.locator('summary').click();
   await page.waitForFunction(()=>document.querySelectorAll('.r309-sar-assets[open]').length>0,{timeout:5000}).catch(()=>{throw new Error('R370 evidence stack did not open')});
   const opened=page.locator('.r309-sar-assets[open]').first();await opened.locator('summary').click();
   await page.waitForFunction(()=>document.querySelectorAll('.r309-sar-assets[open]').length===0,{timeout:5000}).catch(()=>{throw new Error('R370 evidence stack did not close')});
  }

  const rendered=await analyticalState(sarInstrument);
  if(rendered.kind==='PENDING'||rendered.count<4096||rendered.unique<8)throw new Error(`R370 analytical field materially insufficient ${JSON.stringify(rendered)}`);
  const screenBox=page.locator('.r280-screen'),centerBox=page.locator('.r280-center'),rect=await screenBox.boundingBox(),centerMetrics=await centerBox.evaluate(el=>{const rect=el.getBoundingClientRect(),style=getComputedStyle(el),paddingLeft=Number.parseFloat(style.paddingLeft)||0,paddingRight=Number.parseFloat(style.paddingRight)||0;return{rect:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},paddingLeft,paddingRight,contentWidth:rect.width-paddingLeft-paddingRight}}),minWidth=label==='desktop'?500:viewport.width*.60;
  if(!rect||!centerMetrics||rect.width<minWidth||rect.height<300||rect.width<centerMetrics.contentWidth-2||rect.width>centerMetrics.rect.width+2)throw new Error(`R370 ${label} analytical surface unusable ${JSON.stringify({rect,centerMetrics,minWidth})}`);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>12)throw new Error(`R370 ${label} introduced ${overflow}px horizontal overflow`);
  if(errors.length)throw new Error(`R370 ${label} browser errors ${errors.join(' | ')}`);
  await context.close();
 }
 console.log(`R370 LIVE EARTH/SAR CLOSURE PASS · exact promoted SHA ${expectedSha} · place search + device geolocation · all 12 analytical lenses actuated · GRD/SLC toggled · derived/native transition-safe fields materially rendered · clean/detail overlay contract proved · evidence disclosure actuated · desktop/mobile relative field geometry · no page errors/overflow`);
}finally{await browser.close()}
