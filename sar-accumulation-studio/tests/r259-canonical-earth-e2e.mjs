import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.featureRelease==='R259'&&globalThis.OMEGA_EARTH_CANON?.state==='READY'&&globalThis.OMEGA_EARTH_SOURCE_ADAPTERS?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_COMPOSITOR,null,{timeout:30000});
  const boot=await page.evaluate(()=>({runtime:globalThis.OMEGA_SAR_R4_RUNTIME,canon:globalThis.OMEGA_EARTH_CANON,adapterFamilies:globalThis.OMEGA_EARTH_SOURCE_ADAPTERS.documentedFamilies.map(x=>({family:x.family,status:x.status})),readout:document.querySelector('#omegaR259CanonReadout')?.textContent||''}));
  assert.equal(boot.runtime.featureRelease,'R259');assert.equal(boot.runtime.patchRelease,'R259.0');assert.equal(boot.runtime.boundaries.documentedAdapterIsLiveData,false);assert.equal(boot.adapterFamilies.length,6);assert.ok(boot.adapterFamilies.every(x=>x.status==='DOCUMENTED_ADAPTER_PENDING'));assert.match(boot.readout,/CANON/i);

  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='READY'&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence?.measured===true,null,{timeout:160000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_EARTH_CANON_CUBE?.renderPlan?.authority==='REGIONAL_MEASURED_SAR'&&globalThis.OMEGA_EARTH_CANON_DETAIL?.state==='READY'&&globalThis.OMEGA_EARTH_CANON_DETAIL?.renderedCells>0,null,{timeout:45000,polling:150});
  const live=await page.evaluate(()=>{
    const cube=globalThis.OMEGA_EARTH_CANON_CUBE,detail=globalThis.OMEGA_EARTH_CANON_DETAIL,regional=globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch;
    return {summary:cube.summary,renderPlan:cube.renderPlan,packetClasses:cube.packets.map(p=>({source:p.sourceFamily,evidence:p.evidenceClass,measured:p.measured,live:p.canClaimLiveMeasurement})),detail:{state:detail.state,source:detail.source,terrainBlend:detail.terrainBlend,stats:detail.stats,cells:detail.renderedCells},regional:{id:regional.id,width:regional.width,height:regional.height,measured:regional.evidence.measured,inferred:regional.evidence.inferred},readout:document.querySelector('#omegaR259CanonReadout')?.textContent||'',english:globalThis.OMEGA_EARTH_CANON.english};
  });
  assert.ok(live.summary.measured>=1);assert.equal(live.renderPlan.authority,'REGIONAL_MEASURED_SAR');assert.equal(live.renderPlan.primarySurface,'REGIONAL_CANONICAL_SHAPE');assert.ok(live.renderPlan.reconstructionWeight<.05);assert.ok(live.packetClasses.some(p=>p.source==='SENTINEL1_SAR'&&p.measured&&p.live));assert.equal(live.regional.measured,true);assert.equal(live.regional.inferred,false);assert.ok(Math.max(live.regional.width,live.regional.height)>=520);assert.equal(live.detail.state,'READY');assert.ok(live.detail.cells>0);assert.ok(live.detail.stats.valid>50000);assert.match(live.readout,/REGIONAL MEASURED SAR/i);assert.match(live.english.Mode188,/STAY|TURN|ESCALATE/i);assert.match(live.english.OverallCanon,/measured evidence outranks/i);

  const pending=await page.evaluate(()=>globalThis.OMEGA_EARTH_SOURCE_ADAPTERS.documentedFamilies.map(x=>x.family));assert.deepEqual(pending.sort(),['ENVIRONMENT','GNSS','PORE_PRESSURE','SEISMIC','STRAIN','TILT'].sort());
  await page.selectOption('#omegaR258LayerSelect','curvature');await page.waitForFunction(()=>globalThis.OMEGA_SAR_R258_CALCULUS?.mode==='curvature'&&globalThis.OMEGA_EARTH_CANON_DETAIL?.state==='STANDBY_SPECIALIZED_VIEW',null,{timeout:5000});
  const derived=await page.evaluate(()=>({mode:globalThis.OMEGA_SAR_R258_CALCULUS.mode,measured:globalThis.OMEGA_SAR_R258_CALCULUS.source.evidence.measured,boundary:globalThis.OMEGA_SAR_R258_CALCULUS.boundary}));assert.equal(derived.mode,'curvature');assert.equal(derived.measured,true);assert.match(derived.boundary,/Derived|never promoted|source-bound/i);
  await page.selectOption('#omegaR258LayerSelect','detail');await page.waitForFunction(()=>globalThis.OMEGA_EARTH_CANON_DETAIL?.state==='READY',null,{timeout:5000});

  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/r259-canonical-earth.png',fullPage:false});
  assert.deepEqual(pageErrors,[],`page errors: ${pageErrors.join(' | ')}`);
  console.log('SAR_R259_CANONICAL_EARTH_PASS',JSON.stringify({boot:{featureRelease:boot.runtime.featureRelease,adapterFamilies:boot.adapterFamilies},live:{summary:live.summary,renderPlan:live.renderPlan,detail:live.detail},derived},null,2));
}finally{await browser.close();}