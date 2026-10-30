import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expected=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expected){
 if(!/^[0-9a-f]{40}$/i.test(expected))throw Error('R707 exact promoted SHA must be 40 hex');
 const r=await fetch(base+'/omega-build-receipt.json?r707='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R707 build receipt unavailable: '+r.status);
 const receipt=await r.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expected||receipt?.promotion?.promotedMergeSha!==expected)throw Error('R707 live receipt not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r707='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const input=page.locator('[data-r706-scenario-input]');
   await input.waitFor({state:'visible',timeout:30000});
   await page.locator('[data-r624-execute]').click();
   const root=page.locator('[data-r707-vector-instrument="source-model-only"]');
   await root.waitFor({state:'visible',timeout:10000});
   if(await root.locator('[data-r707-node]').count()!==2)throw Error(device+': computed node count mismatch');
   if(await root.locator('[data-r707-edge-kind]').count()!==2)throw Error(device+': computed edge count mismatch');
   if(!(await root.locator('[data-r708-path-status]').innerText()).includes('ADMISSIBLE GRAPH PATH: A → B'))throw Error(device+': source-bound R708 witness missing');
   if(await root.locator('[data-r708-on-path="true"]').count()!==1)throw Error(device+': route highlight must bind one source edge');
   if(!(await root.locator('[data-r710-summary]').innerText()).includes('1 critical'))throw Error(device+': R710 single-edge cut not computed');
   await root.locator('[data-r710-failure]').selectOption('edge-0');
   if(!(await root.locator('[data-r710-status]').innerText()).includes('COUNTERFACTUAL PATH_LOST'))throw Error(device+': R710 failed edge must disconnect A to B');
   if(await root.locator('[data-r708-on-path="true"]').count()!==0)throw Error(device+': R710 failed path still highlighted');
   if(await root.locator('[data-r710-failed-edge="true"]').count()!==1)throw Error(device+': R710 removed edge not marked');
   await root.locator('[data-r710-failure]').selectOption('');
   if(await root.locator('[data-r708-on-path="true"]').count()!==1)throw Error(device+': R710 baseline path not restored');
   await root.locator('[data-r708-origin]').selectOption('B');
   await root.locator('[data-r708-target]').selectOption('A');
   if(!(await root.locator('[data-r708-path-status]').innerText()).includes('ADMISSIBLE GRAPH PATH: B → A'))throw Error(device+': reverse RETURN witness missing');
   const before=Number(await root.locator('[data-r707-node="A"] circle').getAttribute('cx'));
   await root.locator('[data-r707-mirror]').click();
   const after=Number(await root.locator('[data-r707-node="A"] circle').getAttribute('cx'));
   if(Math.abs(before+after-640)>0.02)throw Error(device+': observer reflection invariant broken');
   if(!(await root.locator('[data-r711-summary]').innerText()).includes('3 recomputed frames'))throw Error(device+': R711 integrated source frames missing');
   await root.locator('[data-r711-export]').click();
   const portableSession=JSON.parse(await root.locator('[data-r711-portable]').inputValue());
   if(portableSession.schema!=='OMEGA_COMPUTATIONAL_SESSION_INPUT_R711'||portableSession.origin!=='B'||portableSession.target!=='A'||portableSession.mirrored!==true||portableSession.scenario.edgeFrames.length!==3)throw Error(device+': R711 portable session lost source/route/observer');
   await root.locator('[data-r713-edge]').selectOption('edge-1');
   await root.locator('[data-r713-intervene]').click();
   const counterfactual=await root.locator('[data-r713-summary]').innerText();
   if(!counterfactual.includes('1 changed source frames')||!counterfactual.includes('1 changed route frames'))throw Error(device+': R713 developmental route intervention was not recomputed');
   if(!(await root.locator('[data-r708-path-status]').innerText()).includes('ADMISSIBLE GRAPH PATH: B → A'))throw Error(device+': R713 intervention mutated baseline route');
   const derivative=root.locator('[data-r714-derivatives]');
   if(await derivative.locator('[data-r714-order]').count()!==3)throw Error(device+': R714 derivative orders missing');
   const jerkRow=derivative.locator('[data-r714-order="jerk"]');
   const jerkChanges=Number(await jerkRow.locator('td').nth(1).innerText());
   const jerkPeak=await jerkRow.locator('td').nth(3).innerText();
   if(!Number.isSafeInteger(jerkChanges)||jerkChanges<0||((jerkChanges===0)!==(jerkPeak==='none')))
    throw Error(device+': R714 derivative count/peak contradicts its computed witness');
   await derivative.locator('[data-r714-witnesses] summary').click();
   if(!(await derivative.locator('[data-r714-witnesses]').innerText()).includes('Sample 0'))throw Error(device+': R714 finite-difference witness missing');
   // The first intervention blocks a RETURN edge and may alter graph reachability
   // without altering the state kernel. Require a positive third derivative only
   // for the independently regression-proved state-changing frame-2 INGRESS cut.
   await root.locator('[data-r709-frame-choice="1"]').click();
   await root.locator('[data-r713-edge]').selectOption('edge-0');
   await root.locator('[data-r713-intervene]').click();
   const positiveJerk=Number(await root.locator('[data-r714-order="jerk"] td').nth(1).innerText());
   if(!(positiveJerk>0))throw Error(device+': R714 frame-2 INGRESS intervention failed to propagate into recomputed jerk');
   if(!(await derivative.locator('[data-r714-boundary]').innerText()).includes('not measured time'))throw Error(device+': R714 scientific truth boundary missing');
   await root.locator('[data-r715-run]').click();
   const frontier=root.locator('[data-r715-result]');
   await frontier.waitFor({state:'visible',timeout:30000});
   if(!(await frontier.locator('[data-r715-coverage]').innerText()).includes('2 of 2 eligible source edges evaluated'))throw Error(device+': R715 declared-frame intervention coverage incomplete');
   if(await frontier.locator('[data-r715-edge-row]').count()!==2)throw Error(device+': R715 did not enumerate both eligible source edges');
   if(!(await frontier.locator('[data-r715-edge-row="1"] [data-r715-impact]').innerText()).includes('MODEL_ROUTE_LOSS'))throw Error(device+': R715 B → A RETURN cut must lose the selected reverse route');
   if(!(await frontier.locator('[data-r715-edge-row="0"] [data-r715-impact]').innerText()).includes('MODEL_STATE_SENSITIVITY'))throw Error(device+': R715 A → B INGRESS cut must change modeled state without losing B → A route');
   if(!(await frontier.locator('[data-r715-boundary]').innerText()).includes('No empirical prediction'))throw Error(device+': R715 model-only truth boundary missing');
   if(await frontier.locator('[data-r715-next]').isEnabled())throw Error(device+': R715 falsely reports additional edges');
   await root.locator('[data-r716-run]').click();
   const joint=root.locator('[data-r716-result]');
   await joint.waitFor({state:'visible',timeout:30000});
   if(!(await joint.locator('[data-r716-coverage]').innerText()).includes('1 of 1 eligible edge pairs evaluated'))throw Error(device+': R716 pair coverage incorrect');
   if(await joint.locator('[data-r716-row]').count()!==1)throw Error(device+': R716 pair not independently evaluated');
   if(!(await joint.locator('[data-r716-row="0-1"] [data-r716-gate]').innerText()).includes('MODEL_ROUTE_LOSS'))throw Error(device+': R716 joint cut did not lose reverse RETURN route');
   if(!(await joint.locator('[data-r716-boundary]').innerText()).includes('not empirical causation'))throw Error(device+': R716 scientific truth boundary missing');
   if(await joint.locator('[data-r716-next]').isEnabled())throw Error(device+': R716 falsely reports additional pairs');
   await root.locator('[data-r718-first-frame]').selectOption('0');
   await root.locator('[data-r718-first-edge]').selectOption('0');
   // Exercise a genuine second-frame transition. Selecting '1' while the
   // initial controlled value is already '1' is not a change event in a
   // browser, so it cannot establish that React accepted a new selection.
   await root.locator('[data-r718-second-frame]').selectOption('2');
   await root.locator('[data-r718-second-frame]').evaluate(el=>{if(el.value!=='2')throw Error('Second frame not selected');});
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="2"]').waitFor({state:'attached',timeout:10000});
   if(await root.locator('[data-r718-second-frame]').inputValue()!=='2'){
    const opts=await root.locator('[data-r718-second-frame] option').evaluateAll(nodes=>nodes.map(n=>n.value));
    throw Error(device+': R718 second-frame transition to 2 reverted; available '+JSON.stringify(opts));
   }
   await root.locator('[data-r718-second-frame]').selectOption('1');
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="1"]').waitFor({state:'attached',timeout:10000});
   // A genuine frame change must survive React's controlled-select update
   // before the dependent edge select is changed.
   if(await root.locator('[data-r718-second-frame]').inputValue()!=='1'){
    const opts=await root.locator('[data-r718-second-frame] option').evaluateAll(nodes=>nodes.map(n=>n.value));
    throw Error(device+': R718 second-frame transition to 1 reverted; available '+JSON.stringify(opts));
   }
   await root.locator('[data-r718-second-edge]').selectOption('0');
   await page.waitForTimeout(50);
   const visibleFrames=[
    await root.locator('[data-r718-first-frame]').inputValue(),
    await root.locator('[data-r718-second-frame]').inputValue()
   ];
   const visibleEdges=[
    await root.locator('[data-r718-first-edge]').inputValue(),
    await root.locator('[data-r718-second-edge]').inputValue()
   ];
   if(visibleFrames.join('/')!=='0/1'||visibleEdges.join('/')!=='0/0'){
    const options=await root.locator('[data-r718-second-frame] option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,label:n.textContent})));
    throw Error(device+': R718 visible cross-frame selection drift: '+visibleFrames.join('/')+' edges '+visibleEdges.join('/')+' available frames '+JSON.stringify(options));
   }
   await root.locator('[data-r718-run]').click();
   const temporal=root.locator('[data-r718-result]');
   // Wait for either a computed result or an explicit model refusal; report the
   // refusal immediately instead of disguising it as a 30-second selector timeout.
   await page.waitForFunction(()=>!!document.querySelector('[data-r718-result], [data-r718-error]'),null,{timeout:30000});
   const temporalRefusal=await root.locator('[data-r718-error]').allInnerTexts();
   if(temporalRefusal.length)throw Error(device+': R718 model refused valid cross-frame selection: '+temporalRefusal.join(' | '));
   await temporal.waitFor({state:'visible',timeout:10000});
   if(await temporal.locator('[data-r718-timeline]').count()!==4)throw Error(device+': R718 did not recompute full longitudinal state timeline');
   if(!(await temporal.locator('[data-r718-summary]').innerText()).includes('joint-changed node states'))throw Error(device+': R718 source-model carry missing');
   if(!(await temporal.locator('[data-r718-boundary]').innerText()).includes('not exhaustive cross-frame search'))throw Error(device+': R718 source-model boundary missing');
   await root.locator('[data-r718-second-frame]').selectOption('0');
   await root.locator('[data-r718-run]').click();
   if(!(await root.locator('[data-r718-error]').innerText()).includes('REFUSED'))throw Error(device+': R718 did not refuse same-frame pair');
   await root.locator('[data-r718-second-frame]').selectOption('1');
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="1"]').waitFor({state:'attached',timeout:10000});
   await root.locator('[data-r718-run]').click();
   await temporal.waitFor({state:'visible',timeout:30000});
   await root.locator('[data-r717-run]').click();
   const minimalCuts=root.locator('[data-r717-result]');
   await minimalCuts.waitFor({state:'visible',timeout:30000});
   if(!(await minimalCuts.locator('[data-r717-coverage]').innerText()).includes('2 single-edge cuts'))throw Error(device+': R717 failed to enumerate source-frame single cuts');
   if((await minimalCuts.locator('[data-r717-row="1"] [data-r717-minimum]').innerText()).trim()!=='1')throw Error(device+': R717 failed to prove the minimum B to A RETURN cut');
   if(!(await minimalCuts.locator('[data-r717-row="1"]').innerText()).includes('B → A'))throw Error(device+': R717 missing exact source-edge cut witness');
   if(!(await minimalCuts.locator('[data-r717-boundary]').innerText()).includes('no cut up to two'))throw Error(device+': R717 failed to distinguish bounded proof from global resilience');
   if(!(await root.locator('[data-r708-path-status]').innerText()).includes('ADMISSIBLE GRAPH PATH: B → A'))throw Error(device+': R717 proof mutated baseline route');
   await root.locator('[data-r713-candidate]').fill(JSON.stringify({...portableSession,authority:'FORGED'}));
   await root.locator('[data-r713-compare]').click();
   if(!(await root.locator('[data-r713-error]').innerText()).includes('REFUSED'))throw Error(device+': R713 forged candidate was not refused');
   await root.locator('[data-r712-save]').click();
   if(!(await root.locator('[data-r712-save-status]').innerText()).includes('Saved portable'))throw Error(device+': R712 save acknowledgement absent');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   await root.waitFor({state:'visible',timeout:30000});
   if(await root.locator('[data-r708-origin]').inputValue()!=='B'||await root.locator('[data-r708-target]').inputValue()!=='A')throw Error(device+': R712 reload lost route endpoints');
   if(await root.locator('[data-r707-mirror]').getAttribute('aria-pressed')!=='true')throw Error(device+': R712 reload lost observer reflection');
   if(!(await root.locator('[data-r711-summary]').innerText()).includes('3 recomputed frames'))throw Error(device+': R712 reload did not recompute');
   const importInput=page.locator('[data-r712-import-input]');
   await importInput.fill(JSON.stringify({...portableSession,authority:'FORGED_PRODUCTION'}));
   await page.locator('[data-r712-import]').click();
   if(!(await page.locator('[data-r706-status]').innerText()).includes('REFUSED'))throw Error(device+': R712 forged authority was not refused');
   if(await root.locator('[data-r708-origin]').inputValue()!=='B')throw Error(device+': R712 forged import changed current session');
   await importInput.fill(JSON.stringify({...portableSession,origin:'A',target:'B',mirrored:false}));
   await page.locator('[data-r712-import]').click();
   if(!(await page.locator('[data-r706-status]').innerText()).includes('independently recomputed'))throw Error(device+': R712 valid import did not recompute');
   if(await root.locator('[data-r708-origin]').inputValue()!=='A'||await root.locator('[data-r708-target]').inputValue()!=='B')throw Error(device+': R712 valid import failed to restore route');
   if(await root.locator('[data-r707-mirror]').getAttribute('aria-pressed')!=='false')throw Error(device+': R712 valid import failed to restore observer');
   await importInput.fill(JSON.stringify(portableSession));
   await page.locator('[data-r712-import]').click();
   if(await root.locator('[data-r708-origin]').inputValue()!=='B'||await root.locator('[data-r707-mirror]').getAttribute('aria-pressed')!=='true')throw Error(device+': R712 repeated import did not reset child state');
   await root.locator('[data-r707-frame]').focus();
   await root.locator('[data-r707-frame]').press('ArrowRight');
   if(!(await root.locator('[data-r707-topology-summary]').innerText()).includes('directional edges'))throw Error(device+': frame controls not active');
   await root.locator('[data-r707-export]').click();
   const svg=await root.locator('[data-r707-portable]').inputValue();
   if(!svg.includes('<svg ')||!svg.includes('MODEL ONLY')||/<script|onload=|onclick=/i.test(svg))throw Error(device+': unsafe or absent static vector export');
   await root.locator('[data-r708-origin]').selectOption('A');
   await root.locator('[data-r708-target]').selectOption('B');
   const editedTimeline=JSON.parse(await input.inputValue());
   editedTimeline.edgeFrames[1][0].kind='BLOCKED';
   editedTimeline.edgeFrames[2][0].kind='RESIDUE';
   editedTimeline.edgeFrames[2][0].weight=0.4;
   await input.fill(JSON.stringify(editedTimeline));
   await page.locator('[data-r624-execute]').click();
   const timeRoot=page.locator('[data-r707-vector-instrument="source-model-only"]');
   await timeRoot.waitFor({state:'visible',timeout:10000});
   if(!(await timeRoot.locator('[data-r709-summary]').innerText()).includes('2/3 frames reachable'))throw Error(device+': R709 recomputed frame reachability missing');
   if(!(await timeRoot.locator('[data-r709-frame-choice="1"]').innerText()).includes('PATH_LOST'))throw Error(device+': R709 first loss not surfaced');
   if(!(await timeRoot.locator('[data-r709-frame-choice="2"]').innerText()).includes('PATH_RECOVERED'))throw Error(device+': R709 recovery not surfaced');
   await timeRoot.locator('[data-r709-frame-choice="1"]').click();
   if(!(await timeRoot.locator('[data-r708-path-status]').innerText()).includes('NO ADMISSIBLE GRAPH PATH'))throw Error(device+': R709 loss frame not navigable');
   await timeRoot.locator('[data-r709-frame-choice="2"]').click();
   if(!(await timeRoot.locator('[data-r708-path-status]').innerText()).includes('ADMISSIBLE GRAPH PATH'))throw Error(device+': R709 recovery frame not navigable');
   await timeRoot.locator('[data-r709-frame-choice="0"]').click();
   const scenario=JSON.parse(await input.inputValue());
   scenario.nodes[0].continuity=0.6;
   scenario.edgeFrames[0][0].kind='BLOCKED';
   await input.fill(JSON.stringify(scenario));
   if(await page.locator('[data-r707-svg]').count())throw Error(device+': stale vector survived input editing');
   await page.locator('[data-r624-execute]').click();
   await page.locator('[data-r707-svg]').waitFor({state:'visible',timeout:10000});
   if(await page.locator('[data-r707-edge-kind="BLOCKED"]').count()!==1)throw Error(device+': typed blocked edge not projected');
   if(!(await page.locator('[data-r708-path-status]').innerText()).includes('NO ADMISSIBLE GRAPH PATH: A → B'))throw Error(device+': blocked source edge incorrectly admitted as transport');
   await page.locator('[data-r708-exclusions] summary').click();
   if(!(await page.locator('[data-r708-exclusions]').innerText()).includes('BLOCKED'))throw Error(device+': blocked edge refusal evidence absent');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   await page.locator('[data-r706-scenario-input]').waitFor({state:'visible',timeout:30000});
   const restored=JSON.parse(await page.locator('[data-r706-scenario-input]').inputValue());
   if(restored.nodes[0].continuity!==0.6||restored.edgeFrames[0][0].kind!=='BLOCKED')throw Error(device+': source input persistence failed');
   await page.locator('[data-r624-execute]').click();
   await page.locator('[data-r707-edge-kind="BLOCKED"]').waitFor({state:'attached',timeout:10000});
   if(!(await page.locator('[data-r708-path-status]').innerText()).includes('NO ADMISSIBLE GRAPH PATH'))throw Error(device+': persisted input must recompute R708 refusal');
   await page.locator('[data-r706-scenario-input]').fill(JSON.stringify({...restored,proof:{liveRuntimeVerified:true}}));
   await page.locator('[data-r624-execute]').click();
   await page.waitForFunction(()=>document.querySelector('[data-r624-output]')?.textContent?.includes('REFUSED_NO_EXECUTION'),null,{timeout:10000});
   if(await page.locator('[data-r707-svg]').count())throw Error(device+': forged authority left a live vector');
   if(errors.length)throw Error(device+': page errors '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': viewport overflow '+overflow);
   console.log('R707/R708/R709/R710/R711/R712 '+device+' PASS: source-computed topology and route witnesses, typed refusal, mirror/frame controls, safe SVG, persisted recompute, forged authority refusal, no overflow');
  }finally{await context.close()}
 }
}finally{await browser.close()}
