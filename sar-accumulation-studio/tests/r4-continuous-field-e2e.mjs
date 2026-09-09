import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base=process.env.SAR_TEST_URL;
assert.ok(base,'SAR_TEST_URL is required');
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  assert.ok(response?.ok(),`root failed ${response?.status()}`);
  await page.waitForSelector('#omegaFieldHud',{state:'visible',timeout:20000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.length>100,null,{timeout:30000});
  const initial=await page.evaluate(()=>({
    cells:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.length,
    states:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.summary.states,
    modes:globalThis.OMEGA_SAR_SKINS,
    numeric:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>Number.isFinite(c.value)).length,
    prior:globalThis.OMEGA_SAR_CONTINUOUS_FIELD.cells.filter(c=>c.state==='CONTEXT_PRIOR').length
  }));
  assert.ok(initial.cells>100,'continuous field not initialized');
  assert.ok(initial.prior>0,'world structural prior missing before local SAR load');
  for(const name of ['OVERALL_CANON','UNIFIED_COHERENCE','MODE188','DEEP_MOTHER','HIGH_FATHER','NO_NOTHING_TRUTH','GUIDANCE_FIELD','FULL_SPHERE','ALPHA','CRIMSON','FORECAST','RECOVERY','STABILIZATION','INTEGRATION','TRUTH_TRAVERSAL','RAFT188','CTDE','GAMMA_ADMISSION','CONTINUANCE_EVOLUTION','HEAVY_PRUNE'])assert.ok(initial.modes.includes(name),`mode missing: ${name}`);

  await page.selectOption('#sourceMode','stac');
  await page.fill('#maxResults','12');
  await page.fill('#aoi','POINT(-110.9747 32.2226)');
  await page.fill('#jumpLat','32.2226');await page.fill('#jumpLon','-110.9747');
  await page.click('#jumpLocation');
  await page.click('#load');
  await page.waitForFunction(()=>document.querySelector('#status')?.dataset.kind==='ok',null,{timeout:45000});
  const obs=Number((await page.textContent('#obsCount')||'0').trim());assert.ok(obs>0,'no real Sentinel-1 acquisitions loaded');
  const raster=page.locator('#loadRaster');assert.equal(await raster.isDisabled(),false,'real scene exposes no raster');
  await raster.click();
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_FIELD_RUNTIME?.patchAnchors?.length>=4,null,{timeout:90000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_CONTINUOUS_FIELD?.cells?.some(c=>Number.isFinite(c.value)),null,{timeout:60000});
  const after=await page.evaluate(()=>{
    const f=globalThis.OMEGA_SAR_CONTINUOUS_FIELD;
    return {
      anchors:globalThis.OMEGA_SAR_FIELD_RUNTIME.patchAnchors.length,
      numeric:f.cells.filter(c=>Number.isFinite(c.value)).length,
      admitted:f.summary.admittedFraction,
      contradictions:f.summary.contradictions,
      badAdmission:f.cells.filter(c=>c.gammaAdmission?.startsWith('ADMIT')&&!Number.isFinite(c.value)).length,
      measuredAndInferred:f.cells.filter(c=>c.measured&&c.inferred).length,
      hud:document.querySelector('#omegaFieldHud')?.textContent||''
    };
  });
  assert.ok(after.anchors>=4,'calibrated patch did not bind measured anchors');
  assert.ok(after.numeric>0,'measured anchors did not create any numeric reconstructed SAR state');
  assert.equal(after.badAdmission,0,'Gamma/Mode188 admitted a cell without numeric state');
  assert.equal(after.measuredAndInferred,0,'measured/inferred identity collision');
  assert.match(after.hud,/Ω CONTINUOUS SAR/i);

  const mapStats=await page.evaluate(()=>{
    const c=document.querySelector('#map'),ctx=c.getContext('2d'),w=c.width,h=c.height;
    const data=ctx.getImageData(0,0,w,h).data;let min=255,max=0,count=0;
    const step=Math.max(4,Math.floor((w*h)/12000));
    for(let p=0;p<w*h;p+=step){const i=p*4;const y=(data[i]+data[i+1]+data[i+2])/3;if(data[i+3]){min=Math.min(min,y);max=Math.max(max,y);count++;}}
    return {range:max-min,count};
  });
  assert.ok(mapStats.count>100,'main Earth field rendered too few pixels');
  assert.ok(mapStats.range>20,`main Earth field lacks visible structure: range ${mapStats.range}`);
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log(JSON.stringify({initial,obs,after,mapStats},null,2));
  console.log('SAR_R4_CONTINUOUS_OMEGA_FIELD_PASS');
}finally{await browser.close();}
