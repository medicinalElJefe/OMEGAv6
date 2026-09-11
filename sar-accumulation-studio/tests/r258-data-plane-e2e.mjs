import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R257'&&globalThis.OMEGA_SAR_R4_RUNTIME?.featureRelease==='R258'&&globalThis.OMEGA_SAR_R258_EXPERIENCE?.state==='READY'&&globalThis.OMEGA_SAR_R258_CALCULUS&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.state==='READY',null,{timeout:30000});
  await page.evaluate(()=>{globalThis.OMEGA_SAR_EXPERIENCE?.setMode?.('explore');globalThis.OMEGA_SAR_EXPERIENCE?.setDrawer?.(null);});
  await page.waitForTimeout(250);

  const explore=await page.evaluate(()=>{
    const box=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,display:c.display,visibility:c.visibility,opacity:Number(c.opacity)};};
    return {map:box('.map-wrap'),proof:box('#omegaR257ProofStack'),precision:box('#omegaPrecisionStrip'),browse:box('.sar-source-browse-layer'),drawer:document.body.dataset.drawer||null,mode:document.body.dataset.mode,layout:globalThis.OMEGA_SAR_R258_EXPERIENCE.layout,featureRelease:globalThis.OMEGA_SAR_R4_RUNTIME.featureRelease};
  });
  assert.equal(explore.featureRelease,'R258');assert.equal(explore.layout,'ONE_IMAGE_PLANE_WITH_RESERVED_TOOL_ZONES');assert.equal(explore.mode,'explore');assert.equal(explore.drawer,null);assert.equal(explore.precision.display,'none');assert.ok(explore.browse.opacity===0||explore.browse.visibility==='hidden','source footprint/browse still owns the main image');assert.ok(explore.map.width>1690,`Explore image plane lost width: ${explore.map.width}`);

  await page.click('#omegaModeSwitch [data-mode="proof"]');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('#omegaR257ProofStack')).display==='grid',null,{timeout:5000});await page.waitForTimeout(260);
  const proof=await page.evaluate(()=>{const m=document.querySelector('.map-wrap').getBoundingClientRect(),p=document.querySelector('#omegaR257ProofStack').getBoundingClientRect();return {map:{left:m.left,top:m.top,right:m.right,bottom:m.bottom},proof:{left:p.left,top:p.top,right:p.right,bottom:p.bottom},drawer:document.body.dataset.drawer||null,mode:document.body.dataset.mode};});
  assert.equal(proof.mode,'proof');assert.equal(proof.drawer,null);assert.ok(proof.map.right<=proof.proof.left-3,`PROOF overlaps image by ${overlap(proof.map,proof.proof)} px²`);
  await page.click('#omegaModeSwitch [data-mode="explore"]');await page.waitForTimeout(200);

  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:90000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='READY'&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence?.measured===true&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='REGIONAL_SHAPED_SAR',null,{timeout:160000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R258_CALCULUS?.layerVisible===true&&globalThis.OMEGA_SAR_R258_CALCULUS?.spatial?.stats?.validCount>50000,null,{timeout:30000,polling:150});
  const measured=await page.evaluate(()=>({
    mapOpacity:Number(getComputedStyle(document.querySelector('#map')).opacity),browseOpacity:Number(getComputedStyle(document.querySelector('.sar-source-browse-layer')).opacity),
    surface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,mode:globalThis.OMEGA_SAR_R258_CALCULUS.mode,visible:globalThis.OMEGA_SAR_R258_CALCULUS.layerVisible,cells:globalThis.OMEGA_SAR_R258_CALCULUS.renderedCells,
    source:globalThis.OMEGA_SAR_R258_CALCULUS.source,spatial:globalThis.OMEGA_SAR_R258_CALCULUS.spatial,boundary:globalThis.OMEGA_SAR_R258_CALCULUS.boundary
  }));
  assert.ok(measured.mapOpacity<=.002,'legacy map renderer remains visibly double exposed');assert.ok(measured.browseOpacity<=.001,'source footprint remains visible over measured SAR');assert.equal(measured.surface,'REGIONAL_SHAPED_SAR');assert.equal(measured.mode,'detail');assert.equal(measured.visible,true);assert.ok(measured.cells>0);assert.equal(measured.source.evidence.measured,true);assert.equal(measured.source.evidence.inferred,false);assert.ok(Math.max(measured.source.width,measured.source.height)>=520);assert.ok(measured.spatial.stats.validCount>50000);assert.match(measured.boundary,/never promoted|source-bound/i);

  await page.selectOption('#omegaR258LayerSelect','gradient');await page.waitForFunction(()=>globalThis.OMEGA_SAR_R258_CALCULUS?.mode==='gradient'&&globalThis.OMEGA_SAR_R258_CALCULUS?.layerVisible===true,null,{timeout:5000});
  const gradient=await page.evaluate(()=>({mode:globalThis.OMEGA_SAR_R258_CALCULUS.mode,sourceMeasured:globalThis.OMEGA_SAR_R258_CALCULUS.source.evidence.measured,gradientP98:globalThis.OMEGA_SAR_R258_CALCULUS.spatial.scales.gradientP98,readout:document.querySelector('#omegaR258CalculusReadout')?.textContent||''}));
  assert.equal(gradient.mode,'gradient');assert.equal(gradient.sourceMeasured,true);assert.ok(Number.isFinite(gradient.gradientP98)&&gradient.gradientP98>0);assert.match(gradient.readout,/∇σ⁰|SOURCE|VALID|∇/i);

  await page.click('#omegaSarEvidence');await page.waitForFunction(()=>document.body.dataset.drawer==='evidence',null,{timeout:5000});await page.waitForTimeout(280);
  const evidence=await page.evaluate(()=>{const m=document.querySelector('.map-wrap').getBoundingClientRect(),d=document.querySelector('.evidence-dock').getBoundingClientRect();return {map:{left:m.left,top:m.top,right:m.right,bottom:m.bottom},drawer:{left:d.left,top:d.top,right:d.right,bottom:d.bottom}};});
  assert.ok(evidence.map.right<=evidence.drawer.left-3,`Evidence drawer covers image by ${overlap(evidence.map,evidence.drawer)} px²`);
  await page.click('#omegaModeSwitch [data-mode="explore"]');await page.waitForFunction(()=>!document.body.dataset.drawer,null,{timeout:5000});

  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/r258-data-plane.png',fullPage:false});
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R258_DATA_PLANE_PASS',JSON.stringify({explore,proof,measured,gradient,evidence},null,2));
}finally{await browser.close();}
