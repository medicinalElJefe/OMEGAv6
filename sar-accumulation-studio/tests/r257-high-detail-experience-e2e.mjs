import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const url=process.env.SAR_TEST_URL||'https://omega-sar-r4.jeffdeweyeljefe.workers.dev';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1720,height:1080},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));

function intersection(a,b){const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left)),h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));return w*h;}

try{
  const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});assert.ok(response?.ok(),`root HTTP ${response?.status()}`);
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R4_RUNTIME?.release==='R4-R257'&&globalThis.OMEGA_SAR_R257_EXPERIENCE?.state==='READY'&&globalThis.OMEGA_SAR_R257_DETAIL&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.state==='READY',null,{timeout:30000});

  const explore=await page.evaluate(()=>{
    const selectors={status:'#omegaExperienceStatus',controls:'#omegaSarPrimaryControls',search:'#placeDock .place-search',mapNav:'#omegaMapNav',quick:'#omegaQuickRail',transport:'.transport-deck'};
    const rects={};for(const [name,selector] of Object.entries(selectors)){const el=document.querySelector(selector),s=el?getComputedStyle(el):null,r=el?.getBoundingClientRect();if(el&&r&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>.02&&r.width>1&&r.height>1)rects[name]={left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}
    return {rects,dataBadge:getComputedStyle(document.querySelector('#omegaDataNativeBadge')).display,cellInspector:getComputedStyle(document.querySelector('#omegaCellInspector')).display,stage:document.querySelector('#omegaR257Stage')?.textContent,policy:globalThis.OMEGA_SAR_R257_EXPERIENCE?.overlapPolicy};
  });
  assert.equal(explore.dataBadge,'none','legacy data-native badge still occupies the main image');assert.equal(explore.cellInspector,'none','cell inspector must not float over Explore');assert.equal(explore.policy,'RESERVED_ZONES_AND_SINGLE_STACK');assert.ok(/READY|EARTH|SAR/i.test(explore.stage||''));
  const entries=Object.entries(explore.rects);for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const [an,a]=entries[i],[bn,b]=entries[j],area=intersection(a,b);assert.ok(area<4,`${an} overlaps ${bn} by ${area.toFixed(1)} px²`);}

  // Proof telemetry must occupy one bounded stack rather than independent floating cards.
  await page.click('#omegaModeSwitch [data-mode="proof"]');await page.waitForFunction(()=>getComputedStyle(document.querySelector('#omegaR257ProofStack')).display==='grid',null,{timeout:5000});
  const proof=await page.evaluate(()=>{const stack=document.querySelector('#omegaR257ProofStack'),sr=stack.getBoundingClientRect(),children=[...stack.children].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&r.width>1&&r.height>1}).map(el=>{const r=el.getBoundingClientRect();return {id:el.id,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,parent:el.parentElement?.id};});return {children,stack:{left:sr.left,top:sr.top,right:sr.right,bottom:sr.bottom},mode:document.body.dataset.mode};});
  assert.equal(proof.mode,'proof');assert.ok(proof.children.length>=3,'proof telemetry did not consolidate into the stack');for(const c of proof.children){assert.equal(c.parent,'omegaR257ProofStack');assert.ok(c.left>=proof.stack.left-1&&c.right<=proof.stack.right+1,'proof card escapes horizontal stack bounds');}
  const ordered=[...proof.children].sort((a,b)=>a.top-b.top);for(let i=1;i<ordered.length;i++)assert.ok(ordered[i].top>=ordered[i-1].bottom-1,`${ordered[i-1].id} overlaps ${ordered[i].id}`);
  await page.click('#omegaModeSwitch [data-mode="explore"]');

  // Drive the real Tucson acquisition path and require substantially higher regional source detail.
  await page.evaluate(()=>globalThis.OMEGA_SAR_LOCATION.jump(-110.9747,32.2226,{name:'Tucson',region:'Arizona',country:'United States'}));
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_INTERACTION?.activating===false&&Number(document.querySelector('#obsCount')?.textContent||0)>0,null,{timeout:80000});
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.state==='READY'&&globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT?.patch?.evidence?.measured===true,null,{timeout:150000,polling:250});
  await page.waitForFunction(()=>globalThis.OMEGA_DATA_NATIVE_TERRAIN?.state==='READY'&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='REGIONAL_SHAPED_SAR',null,{timeout:90000,polling:250});
  const regional=await page.evaluate(()=>({patch:{width:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch.width,height:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch.height,valid:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch.stats.validCount,evidence:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.patch.evidence},budget:globalThis.OMEGA_SAR_REGIONAL_MEASUREMENT.detailBudget(),terrain:{width:globalThis.OMEGA_DATA_NATIVE_TERRAIN.terrain.width,height:globalThis.OMEGA_DATA_NATIVE_TERRAIN.terrain.height,z:globalThis.OMEGA_DATA_NATIVE_TERRAIN.terrain.z,rawDem:globalThis.OMEGA_DATA_NATIVE_TERRAIN.terrain.rawDem},surface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,stage:globalThis.OMEGA_SAR_R257_EXPERIENCE.phase}));
  assert.equal(regional.patch.evidence.measured,true);assert.equal(regional.patch.evidence.inferred,false);assert.ok(Math.max(regional.patch.width,regional.patch.height)>=520,`regional source sampling stayed low: ${regional.patch.width}x${regional.patch.height}`);assert.ok(regional.patch.valid>50000,`regional measured support too sparse: ${regional.patch.valid}`);assert.ok(regional.budget>=640);assert.ok(regional.terrain.width>=330&&regional.terrain.height>=80,'R257 terrain LOD did not materially increase');assert.equal(regional.terrain.rawDem,true);assert.equal(regional.surface,'REGIONAL_SHAPED_SAR');

  // Promote the target to the maximum bounded real-source exact patch. This reads more
  // actual Sentinel-1 pixels; it is not a display upsample or inferred fill.
  await page.evaluate(()=>globalThis.OMEGA_SAR_R257_DETAIL.promoteDeep());
  await page.waitForFunction(()=>globalThis.OMEGA_SAR_R257_DETAIL?.state==='DEEP_READY'&&globalThis.OMEGA_SAR_R257_DETAIL?.deepPatch?.width>=240&&globalThis.OMEGA_SAR_RENDERER?.sarOverlay?.patch?.width>=240,null,{timeout:150000,polling:250});
  const deep=await page.evaluate(()=>({detail:globalThis.OMEGA_SAR_R257_DETAIL.deepPatch,rendered:{width:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.width,height:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.height,valid:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.stats.validCount,mesh:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.geoMesh?.validNodeCount,segments:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.geoMesh?.segments,evidence:globalThis.OMEGA_SAR_RENDERER.sarOverlay.patch.evidence},stage:globalThis.OMEGA_SAR_R257_EXPERIENCE.phase}));
  assert.ok(deep.rendered.width>=240&&deep.rendered.height>=240,`deep source patch is only ${deep.rendered.width}x${deep.rendered.height}`);assert.ok(deep.rendered.valid>40000);assert.ok(deep.rendered.segments>=10,'deep exact georegistration mesh stayed coarse');assert.equal(deep.rendered.evidence.measured,true);assert.equal(deep.rendered.evidence.inferred,false);

  await page.click('#omegaSarFit');await page.waitForFunction(()=>globalThis.OMEGA_SAR_LOCAL_FOCUS?.state==='CALIBRATED_PATCH_FIT_EXPLICIT'&&globalThis.OMEGA_SAR_LOCAL_FOCUS?.deep===true&&globalThis.OMEGA_DATA_NATIVE_SURFACE?.surface==='EXACT_SHAPED_SAR',null,{timeout:30000,polling:150});
  const fitted=await page.evaluate(()=>({focus:globalThis.OMEGA_SAR_LOCAL_FOCUS,scale:globalThis.OMEGA_SAR_RENDERER.view.scale,surface:globalThis.OMEGA_DATA_NATIVE_SURFACE.surface,stage:globalThis.OMEGA_SAR_R257_EXPERIENCE.phase,terrain:{width:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.width,z:globalThis.OMEGA_DATA_NATIVE_TERRAIN?.terrain?.z}}));
  assert.equal(fitted.focus.detailState,'DEEP_SOURCE_PATCH');assert.ok(fitted.scale>900&&fitted.scale<=7600);assert.equal(fitted.surface,'EXACT_SHAPED_SAR');

  await mkdir('test-results',{recursive:true});await page.screenshot({path:'test-results/r257-high-detail-experience.png',fullPage:false});
  assert.deepEqual(errors,[],`page errors: ${errors.join(' | ')}`);
  console.log('SAR_R257_HIGH_DETAIL_EXPERIENCE_PASS',JSON.stringify({explore,proof,regional,deep,fitted},null,2));
}finally{await browser.close();}
