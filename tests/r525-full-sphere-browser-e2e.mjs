import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const useFixtures=process.env.OMEGA_R525_USE_FIXTURES==='1';
async function prepare(page){
 if(!useFixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R525_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await prepare(page);
  await page.goto(base+'/?omega7=1&r525='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  // R538: real user-workspace persistence and portable local recovery, no canonical mutation.
  let workflow=page.locator('[data-r538-workflow="true"]');
  await workflow.waitFor({state:'visible',timeout:10000});
  await workflow.locator('[data-r538-bookmark]').click();
  await workflow.getByRole('button',{name:'History & saved states'}).click();
  if(!(await workflow.innerText()).includes('Saved states')||!(await workflow.innerText()).includes('State '))throw new Error(label+': R538 bookmark not visible');
  await workflow.getByRole('button',{name:'Portable snapshot'}).click();
  await workflow.getByRole('button',{name:'Prepare snapshot'}).click();
  const snapshotField=workflow.getByRole('textbox',{name:'Workspace snapshot JSON'});
  const portable=await snapshotField.inputValue();
  const parsed=JSON.parse(portable);
  if(parsed.version!==1||!parsed.bookmarks?.length||!Number.isInteger(parsed.address))throw new Error(label+': R538 portable user snapshot malformed');
  await snapshotField.fill('{"version":1,"address":20736,"history":[],"bookmarks":[]}');
  await workflow.getByRole('button',{name:'Import snapshot'}).click();
  if(!(await workflow.locator('[data-r538-snapshot-status]').innerText()).includes('REFUSED'))throw new Error(label+': R538 invalid snapshot not refused');
  await snapshotField.fill(portable);
  await workflow.getByRole('button',{name:'Import snapshot'}).click();
  if(!(await workflow.locator('[data-r538-snapshot-status]').innerText()).includes('imported locally'))throw new Error(label+': R538 valid snapshot import failed');
  await page.reload({waitUntil:'domcontentloaded'});
  workflow=page.locator('[data-r538-workflow="true"]');
  await workflow.waitFor({state:'visible',timeout:30000});
  await workflow.getByRole('button',{name:'History & saved states'}).click();
  if(!(await workflow.innerText()).includes('Saved states')||!(await workflow.innerText()).includes('State '))throw new Error(label+': R538 bookmark lost on reload');
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
  const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
  await portal.waitFor({state:'visible',timeout:18000});
  await portal.locator('button[data-r519-node="Atlas"]').click();
  await portal.locator('.o7-r519-inspector[data-r519-focus="Atlas"]').waitFor({state:'visible',timeout:10000});
  await portal.locator('button[data-r519-launch="Atlas"]').click();
  // R536: real route continuity, pin persistence and resume in the OMEGA7 shell.
  let journey=page.locator('[data-r536-journey="true"]');
  await journey.waitFor({state:'visible',timeout:10000});
  await journey.locator('[data-r536-pin-current]').click();
  await journey.getByRole('button',{name:'Recent work'}).click();
  await journey.locator('[data-r536-resume="Atlas"]').waitFor({state:'visible',timeout:5000});
  if(!(await journey.innerText()).includes('Pinned'))throw new Error(label+': R536 current route not pinned');
  await page.reload({waitUntil:'domcontentloaded'});
  journey=page.locator('[data-r536-journey="true"]');
  await journey.waitFor({state:'visible',timeout:30000});
  await journey.getByRole('button',{name:'Recent work'}).click();
  await journey.locator('[data-r536-resume="Atlas"]').waitFor({state:'visible',timeout:5000});
  await journey.locator('[data-r536-resume="Atlas"]').click();
  await page.locator('.o7-science-workspace[data-route="Atlas"]').waitFor({state:'visible',timeout:30000});
  if(!(await journey.innerText()).includes('Pinned'))throw new Error(label+': R536 pin lost after reload/resume');
  // R536 negative gate: unknown persisted routes must not become executable navigation.
  await page.evaluate(()=>localStorage.setItem('omega7.userJourney.r536',JSON.stringify({recent:['Atlas','UNREGISTERED_ROUTE'],pinned:['Atlas','UNREGISTERED_ROUTE']})));
  await page.reload({waitUntil:'domcontentloaded'});
  journey=page.locator('[data-r536-journey="true"]');
  await journey.waitFor({state:'visible',timeout:30000});
  await journey.getByRole('button',{name:'Recent work'}).click();
  if((await journey.innerText()).includes('UNREGISTERED_ROUTE'))throw new Error(label+': R536 admitted an unknown persisted route');
  await journey.locator('[data-r536-resume="Atlas"]').click();
  await page.locator('.o7-science-workspace[data-route="Atlas"]').waitFor({state:'visible',timeout:30000});

  const native=page.locator('.o7-science-workspace[data-route="Atlas"]');
  await native.waitFor({state:'visible',timeout:28000});
  const open=native.locator('.o7-open-instrument');
  if(await open.count())await open.click();
  const sphere=native.locator('[data-r525-sphere="OMEGA_FULL_SPHERE_ARCHIVE_GRAMMAR_R525"]');
  await sphere.waitFor({state:'visible',timeout:20000});
  const motion=native.locator('[data-r537-motion="source-model"]');
  await motion.waitFor({state:'visible',timeout:15000});
  await motion.getByLabel('Motion stability').fill('90');
  await motion.getByLabel('Motion harmony').fill('90');
  await motion.getByRole('spinbutton',{name:'Motion tier',exact:true}).fill('1');
  await motion.getByLabel('Motion steps').fill('4');
  const motionRules=await motion.locator('[data-r537-step-rule]').evaluateAll(xs=>xs.map(x=>x.getAttribute('data-r537-step-rule')));
  if(motionRules.join(',')!=='R1,R1,R6,R6')throw new Error(label+': R537 actual model transition rules incorrect '+motionRules);
  await motion.getByRole('button',{name:'Export motion snapshot'}).click();
  const motionText=motion.getByRole('textbox',{name:'Motion snapshot JSON'});
  const motionSnapshot=await motionText.inputValue();
  if(JSON.parse(motionSnapshot).canonicalMutation!==false)throw new Error(label+': R537 source model inflated canonical authority');
  await motionText.fill('{"version":1,"steps":4,"packet":{"face":99}}');
  await motion.getByRole('button',{name:'Import motion snapshot'}).click();
  if(!(await motion.locator('[data-r537-snapshot-status]').innerText()).includes('REFUSED'))throw new Error(label+': R537 malformed snapshot accepted');
  await motionText.fill(motionSnapshot);
  await motion.getByRole('button',{name:'Import motion snapshot'}).click();
  if(!(await motion.locator('[data-r537-snapshot-status]').innerText()).includes('LOCAL_MODEL_IMPORTED'))throw new Error(label+': R537 valid snapshot import failed');
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('omega7.r537.motion.v1')||'{}').steps===4);
  if(await sphere.locator('[data-r525-shell]').count()!==3||await sphere.locator('line[data-r525-edge]').count()!==90)throw new Error(label+': 3 genuine nested 20-vertex/30-edge shells not rendered');
  const execution=native.locator('[data-r531-source-execution="true"]');
  await execution.waitFor({state:'visible',timeout:10000});
  const executeBound=execution.locator('[data-r534-execute]');
  await executeBound.click();
  let bound=execution.locator('[data-r534-capability-receipt="SOURCE_MODEL_EXECUTED"]');
  await bound.waitFor({state:'visible',timeout:5000});
  if(await bound.getAttribute('data-r534-capability-id')!=='SPHERE')throw new Error(label+': SPHERE capability identity did not bind to source execution');
  const inspect=execution.locator('[data-r533-inspect]');
  await inspect.click();
  let model=execution.locator('[data-r533-model-receipt="SOURCE_MODEL_EXECUTED"]');
  await model.waitFor({state:'visible',timeout:5000});
  if(!(await model.innerText()).includes('"edgeCount":90'))throw new Error(label+': source visualization did not compute 90 edges');
  const evaluate=execution.locator('[data-r531-evaluate]');
  await evaluate.click();
  let receipt=execution.locator('[data-r531-receipt="HELD"]');
  await receipt.waitFor({state:'visible',timeout:5000});
  if(!(await receipt.innerText()).includes('SOURCE_HEAD_NOT_EXACT_GIT_SHA'))throw new Error(label+': unproven UI evaluation incorrectly passed exact source authority');
  for(const mode of ['TRAVERSAL','FORECAST','SAI_HYBRID']){
   const button=execution.locator('button[data-r531-executor="'+mode+'"]');
   await button.click();
   if(await button.getAttribute('aria-pressed')!=='true')throw new Error(label+': executor '+mode+' did not activate');
   if(await execution.locator('[data-r531-receipt]').count())throw new Error(label+': stale executor receipt remained after mode switch');
   await executeBound.click();
   bound=execution.locator('[data-r534-capability-receipt="'+(mode==='SAI_HYBRID'?'EXTERNAL_HOST_PROOF_REQUIRED':'SOURCE_MODEL_EXECUTED')+'"]');
   await bound.waitFor({state:'visible',timeout:5000});
   const capabilityId=mode==='FORECAST'?'FORECAST_LAE':mode==='SAI_HYBRID'?'HYBRID':mode;
   if(await bound.getAttribute('data-r534-capability-id')!==capabilityId)throw new Error(label+': '+mode+' missing accumulated capability binding');
   await inspect.click();
   model=execution.locator('[data-r533-model-receipt="'+(mode==='SAI_HYBRID'?'EXTERNAL_HOST_PROOF_REQUIRED':'SOURCE_MODEL_EXECUTED')+'"]');
   await model.waitFor({state:'visible',timeout:5000});
   if(mode==='TRAVERSAL'&&!(await model.innerText()).includes('nextAddress'))throw new Error(label+': traversal model did not execute');
   if(mode==='FORECAST'&&!(await model.innerText()).includes('modelNextAddress'))throw new Error(label+': forecast model did not execute');
   if(mode==='TRAVERSAL'||mode==='FORECAST'){
    const stepInput=execution.getByLabel('Source trace steps');
    await stepInput.fill('4');
    await execution.locator('[data-r627-trace-run]').click();
    const trace=execution.locator('[data-r627-trace-status="SOURCE_MODEL_EXECUTED"]');
    await trace.waitFor({state:'visible',timeout:5000});
    const parsed=JSON.parse(await trace.locator('[data-r627-trace-json]').textContent());
    if(parsed.executor!==mode||parsed.frames.length<1||parsed.frames.length>4||parsed.productionAdmissionClaimed!==false||parsed.historicalCapabilityRestored!==false||parsed.canonicalMutation!==false)throw new Error(label+': '+mode+' bounded source trace or proof boundary failed');
    for(const [index,frame] of parsed.frames.entries()){
     if(!Number.isInteger(frame.address)||!Number.isInteger(frame.nextAddress)||frame.stateId!==frame.address+1)throw new Error(label+': source trace coordinate sequence malformed');
     const previous=parsed.frames[index-1],earlier=parsed.frames[index-2];
     for(const [metric,velocityKey,accelerationKey] of [['continuity','continuityVelocity','continuityAcceleration'],['plasticity','plasticityVelocity','plasticityAcceleration'],['scar','scarVelocity','scarAcceleration']]){
      const velocity=previous?frame[metric]-previous[metric]:null;
      const acceleration=previous&&earlier?velocity-(previous[metric]-earlier[metric]):null;
      if(frame.developmental?.[velocityKey]!==velocity||frame.developmental?.[accelerationKey]!==acceleration)throw new Error(label+': '+mode+' source developmental derivative mismatch');
     }
    }
    const traceText=await trace.innerText();
    if(!traceText.includes('Δcontinuity')||!traceText.includes('Δscar')||!traceText.includes('per model successor'))throw new Error(label+': bounded source derivatives not displayed with nonphysical truth label');
    const nextAddress=parsed.frames[0].nextAddress;
    await trace.locator('button[data-r627-continue-address]').first().click();
    await page.waitForFunction(expected=>Number(document.querySelector('.o7-science-workspace[data-route="Atlas"]')?.getAttribute('data-address'))===expected,nextAddress,{timeout:5000});
    const savedAddress=await page.evaluate(()=>Number(localStorage.getItem('omega.v6.address')));
    if(savedAddress!==nextAddress)throw new Error(label+': source continuation did not persist in shared Atlas state');
    await trace.waitFor({state:'detached',timeout:5000});
    await stepInput.fill('13');
    await execution.locator('[data-r627-trace-run]').click();
    const held=execution.locator('[data-r627-trace-status="HELD"]');
    await held.waitFor({state:'visible',timeout:5000});
    if(!(await held.innerText()).includes('STEPS_MUST_BE_INTEGER_1_TO_12'))throw new Error(label+': out-of-range trace steps did not fail closed');
   }else if(await execution.locator('[data-r627-trace-run]').count()||await execution.locator('[data-r627-trace-status]').count()){
    throw new Error(label+': stale trace or unsupported native trace action survived executor switch');
   }
   await evaluate.click();
   receipt=execution.locator('[data-r531-receipt="HELD"]');
   await receipt.waitFor({state:'visible',timeout:5000});
   if(!(await receipt.innerText()).includes('AUTHORITY_NOT_CLOSED'))throw new Error(label+': '+mode+' bypassed authority boundary');
  }
  if(!(await sphere.locator('line[data-r525-edge]').count()))throw new Error(label+': developmental UI destroyed Full Sphere geometry');
  if(!(await native.locator('canvas').count()))throw new Error(label+': prior original AtlasViewport canvas was lost');
  const shellToggle=sphere.locator('button[data-r526-shell-toggle="1"]');
  if(await shellToggle.getAttribute('aria-pressed')!=='true')throw new Error(label+': middle shell initial visibility not enabled');
  await shellToggle.click();
  if(await sphere.locator('[data-r525-shell]').count()!==2||await sphere.locator('line[data-r525-edge]').count()!==60)throw new Error(label+': shell isolation did not remove exactly 30 actual edges');
  if(await shellToggle.getAttribute('aria-pressed')!=='false')throw new Error(label+': shell control accessibility state did not update');
  await shellToggle.click();
  if(await sphere.locator('[data-r525-shell]').count()!==3||await sphere.locator('line[data-r525-edge]').count()!==90)throw new Error(label+': shell restoration did not recover 90 actual edges');
  const motionMode=sphere.locator('button[data-r527-motion-mode="FOLD"]');
  await motionMode.click();
  if(await motionMode.getAttribute('aria-pressed')!=='true')throw new Error(label+': fold motion selection failed');
  const movingEdge=sphere.locator('line[data-r525-edge]').first();
  const beforeMotion=await movingEdge.getAttribute('x1');
  await sphere.locator('button[data-r525-motion="paused"]').click();
  await page.waitForTimeout(240);
  const afterMotion=await movingEdge.getAttribute('x1');
  if(beforeMotion===afterMotion)throw new Error(label+': fold animation did not move rendered geometry');
  const beforePause=await movingEdge.getAttribute('x1');
  await sphere.locator('button[data-r525-motion="playing"]').click();
  const afterPause=await movingEdge.getAttribute('x1');
  await page.waitForTimeout(180);
  const settledPause=await movingEdge.getAttribute('x1');
  if(afterPause!==settledPause)throw new Error(label+': paused geometry continued moving');
  if(Math.abs(Number(afterPause)-Number(beforePause))>1.5)throw new Error(label+': paused geometry snapped back to static fold');
  const words=await sphere.innerText();
  if(!words.includes('not an observation')&& !words.includes('Observation is not inferred'))throw new Error(label+': epistemic projection disclosure missing');
  if(!words.includes('No physics units')||!words.includes('historical six-video grammar'))throw new Error(label+': false historical/source claims');
  const rect=await sphere.boundingBox();
  if(!rect||rect.width<245||rect.x<0||rect.x+rect.width>viewport.width+4){
   const layout=await page.evaluate(()=>{
    const sphere=document.querySelector('[data-r525-sphere]');
    const chain=[];
    for(let el=sphere;el&&chain.length<14;el=el.parentElement){
     const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
     chain.push({tag:el.tagName,cls:String(el.className).slice(0,120),x:Math.round(r.x*10)/10,width:Math.round(r.width*10)/10,scrollWidth:el.scrollWidth,minWidth:cs.minWidth,display:cs.display,gridTemplateColumns:cs.gridTemplateColumns,overflowX:cs.overflowX});
    }
    return {viewport:innerWidth,documentScrollWidth:document.documentElement.scrollWidth,chain};
   });
   throw new Error(label+': responsive Full Sphere instrument geometry invalid '+JSON.stringify(rect)+'; ancestor diagnostics '+JSON.stringify(layout));
  }
  const first=sphere.locator('line[data-r525-edge]').first();
  const before=await first.getAttribute('x1');
  await sphere.locator('input[aria-label="Full Sphere observer rotation"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(before=>{
   const el=document.querySelector('line[data-r525-edge]');
   return Boolean(el&&el.getAttribute('x1')!==before);
  },before,{timeout:7000});
  const after=await first.getAttribute('x1');
  if(before===after)throw new Error(label+': rotation control did not change projected geometry');
  const start=Number(await sphere.getAttribute('data-r525-active-address'));
  const hit=sphere.locator('[data-r525-action="antipode"]');
  await hit.click();
  await page.waitForFunction(start=>Number(document.querySelector('[data-r525-sphere]')?.getAttribute('data-r525-active-address'))!==start,start,{timeout:15000});
  const anti=Number(await sphere.getAttribute('data-r525-active-address'));
  if(anti===start)throw new Error(label+': exact antipode did not actuate shared atlas state');
  if(Number(await native.getAttribute('data-address'))!==anti)throw new Error(label+': model update did not reach canonical Atlas address binding');
  await hit.click();
  await page.waitForFunction(start=>Number(document.querySelector('[data-r525-sphere]')?.getAttribute('data-r525-active-address'))===start,start,{timeout:10000});
  if(Number(await sphere.getAttribute('data-r525-active-address'))!==start)throw new Error(label+': antipodal involution failed through real UI clicks');
  await sphere.locator('button[data-r525-time="HISTORY"]').click();
  const history=Number(await sphere.getAttribute('data-r525-active-address'));
  if(history!==(start+20735)%20736)throw new Error(label+': historical *address* topology did not move to previous indexed state');
  if(!(await sphere.innerText()).includes('NOT an observation of historical time'))throw new Error(label+': history confused with temporal observation');
  await sphere.locator('button[data-r525-time="FORECAST"]').click();
  if(!(await sphere.innerText()).includes('No external future measurement'))throw new Error(label+': model forecast confused with observed future');
  await sphere.locator('button[data-r525-time="NOW"]').click();
  await sphere.locator('button[data-r525-lens="SCAR"]').click();
  if(await sphere.locator('button[data-r525-lens="SCAR"]').getAttribute('aria-pressed')!=='true')throw new Error(label+': scar projection control did not update');
  await sphere.locator('button[data-r525-motion="paused"]').click();
  await sphere.locator('button[data-r525-motion="playing"]').waitFor({state:'visible',timeout:3000});
  await sphere.locator('button[data-r525-motion="playing"]').click();
  if(!(await sphere.locator('button[data-r525-motion="paused"]').count()))throw new Error(label+': source projection did not resume after pause');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
  const resumedPortal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
  await resumedPortal.waitFor({state:'visible',timeout:18000});
  await resumedPortal.locator('button[data-r519-node="Atlas"]').click();
  await resumedPortal.locator('button[data-r519-launch="Atlas"]').click();
  const resumedNative=page.locator('.o7-science-workspace[data-route="Atlas"]');
  await resumedNative.waitFor({state:'visible',timeout:28000});
  const resumedOpen=resumedNative.locator('.o7-open-instrument');
  if(await resumedOpen.count())await resumedOpen.click();
  const restoredMotion=resumedNative.locator('[data-r537-motion="source-model"]');
  await restoredMotion.waitFor({state:'visible',timeout:15000});
  if(await restoredMotion.getByLabel('Motion steps').inputValue()!=='4'||await restoredMotion.getByLabel('Motion stability').inputValue()!=='90')
   throw new Error(label+': R537 local motion state lost on browser reload');
  // R539: prove the actual OMEGA7 Development route exposes the recovered source-state instrument.
  // This is a build-time historical snapshot, NOT live autonomous code execution.
  await page.locator('.o7-search-trigger').click();
  await page.locator('.o7-command input').fill('Development');
  await page.locator('button[data-command-route="Development"]').waitFor({state:'visible',timeout:12000});
  await page.locator('button[data-command-route="Development"]').click();
  const development=page.locator('.o7-development-workspace[data-route="Development"]');
  await development.waitFor({state:'visible',timeout:30000});
  const developmentOpen=development.locator('.o7-open-instrument');
  if(await developmentOpen.count())await developmentOpen.click();
  const selfbuild=development.locator('[data-r539-selfbuild="ROADMAP_EXHAUSTED"]');
  await selfbuild.waitFor({state:'visible',timeout:15000});
  const truth=await selfbuild.innerText();
  if(!truth.includes('5 / 5')||!truth.includes('Listed self-build capsules (not CanonState)')||!truth.includes('Source merges observed')||!truth.includes('Pending source PR')||!truth.includes('Not running')||!truth.includes('Build-time source snapshot'))
   throw new Error(label+': R539 self-build source-truth UI is missing or inflates execution claims');
  if(!truth.includes('Requires R535 admission'))throw new Error(label+': R539 exhausted successor admission not disclosed');
  console.log('R539 '+label+' DEVELOPMENT UI PASS · real route navigation · source-state 5/5 · 4 merged + 1 pending · no autonomous mutation claim');
  if(errors.length)throw new Error(label+': uncaught R525 browser errors '+errors.join(' | ').slice(0,700));
  console.log('R525 '+label+' FULL SPHERE OPERATION PASS · 3 nested 30-edge true meshes · rotation motion · exact antipode twice · history/forecast boundaries · prior Atlas preserved');
 }finally{await context.close()}
}
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R525 exact promoted SHA must be full commit');
 const response=await fetch(base+'/omega-build-receipt.json?r525='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error('R525 production build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw new Error('R525 live source/promoted receipt mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 await prove(browser,'desktop',{width:1440,height:960});
 await prove(browser,'mobile',{width:390,height:844});
 console.log('R525 FULL SPHERE BROWSER PASS · typed original geometry + existing Atlas state; no native/historical video fidelity claims');
}finally{await browser.close()}
