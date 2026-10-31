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
   if(await root.locator('[data-r718-first-frame]').getAttribute('data-r718-first-frame-value')!=='0')throw Error(device+': R718 initial first-frame state invalid');
   await root.locator('[data-r718-first-next]').click();
   if(await root.locator('[data-r718-first-frame]').getAttribute('data-r718-first-frame-value')!=='1')throw Error(device+': R718 first-frame navigation failed');
   await root.locator('[data-r718-first-previous]').click();
   if(await root.locator('[data-r718-first-frame]').getAttribute('data-r718-first-frame-value')!=='0')throw Error(device+': R718 first-frame return failed');
   await root.locator('[data-r718-first-edge]').selectOption('0');
   // Drive both frames through bounded state actions, then verify the displayed
   // state witness, eligible edge selector and executor remain synchronized.
   await root.locator('[data-r718-second-next]').click();
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="2"]').waitFor({state:'attached',timeout:10000});
   if(await root.locator('[data-r718-second-frame]').getAttribute('data-r718-second-frame-value')!=='2')throw Error(device+': R718 next-frame action did not update visible selection');
   await root.locator('[data-r718-second-previous]').click();
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="1"]').waitFor({state:'attached',timeout:10000});
   if(await root.locator('[data-r718-second-frame]').getAttribute('data-r718-second-frame-value')!=='1')throw Error(device+': R718 previous-frame action did not restore visible selection');
   await root.locator('[data-r718-second-edge]').selectOption('0');
   await page.waitForTimeout(50);
   const visibleFrames=[
    await root.locator('[data-r718-first-frame]').getAttribute('data-r718-first-frame-value'),
    await root.locator('[data-r718-second-frame]').getAttribute('data-r718-second-frame-value')
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
   await root.locator('[data-r718-second-previous]').click();
   await root.locator('[data-r718-run]').click();
   if(!(await root.locator('[data-r718-error]').innerText()).includes('REFUSED'))throw Error(device+': R718 did not refuse same-frame pair');
   await root.locator('[data-r718-second-next]').click();
   await root.locator('[data-r718-second-frame][data-r718-second-frame-state="1"]').waitFor({state:'attached',timeout:10000});
   await root.locator('[data-r718-run]').click();
   await temporal.waitFor({state:'visible',timeout:30000});
   // R719 discovers real R718 pairs across all ascending source frames,
   // pages without inventing global coverage, and loads a selected witness.
   await root.locator('[data-r719-run]').click();
   const crossFrontier=root.locator('[data-r719-result]');
   await crossFrontier.waitFor({state:'visible',timeout:30000});
   if(!(await crossFrontier.locator('[data-r719-coverage]').innerText()).includes('4 of 12 eligible source-frame pairs evaluated'))
    throw Error(device+': R719 source-bound cross-frame denominator incorrect');
   if(await crossFrontier.locator('[data-r719-row]').count()!==4)
    throw Error(device+': R719 first page must execute exactly four pairs');
   if(!(await crossFrontier.locator('[data-r719-boundary]').innerText()).includes('not exhaustive proof'))
    throw Error(device+': R719 scientific pagination boundary missing');
   await crossFrontier.locator('[data-r719-next]').click();
   if(await crossFrontier.locator('[data-r719-row="4"]').count()!==1)
    throw Error(device+': R719 second page did not advance deterministic ordinal');
   await crossFrontier.locator('[data-r719-next]').click();
   if(await crossFrontier.locator('[data-r719-row="8"]').count()!==1||
      await crossFrontier.locator('[data-r719-next]').isEnabled())
    throw Error(device+': R719 final page coverage or bound incorrect');
   await crossFrontier.locator('[data-r719-previous]').click();
   await crossFrontier.locator('[data-r719-previous]').click();
   await crossFrontier.locator('[data-r719-row="0"] [data-r719-inspect]').click();
   if(await root.locator('[data-r718-first-frame]').getAttribute('data-r718-first-frame-value')!=='0'||
      await root.locator('[data-r718-second-frame]').getAttribute('data-r718-second-frame-value')!=='1')
    throw Error(device+': R719 selected pair did not load into R718 frame controls');
   if(await root.locator('[data-r718-timeline]').count()!==4)
    throw Error(device+': R719 inspection did not execute R718 four-way timeline');
   // R720 plots four independently recomputed source histories, not a static illustration.
   const trajectory=root.locator('[data-r720-trajectory]');
   await trajectory.locator('[data-r720-metric]').selectOption('scar');
   await trajectory.locator('[data-r720-run]').click();
   await trajectory.locator('[data-r720-result]').waitFor({state:'visible',timeout:30000});
   if(await trajectory.locator('[data-r720-state]').count()!==4||
      await trajectory.locator('[data-r720-curve]').count()!==4||
      await trajectory.locator('[data-r720-residual-curve]').count()!==1)
    throw Error(device+': R720 did not render four source histories and residual');
   for(const row of await trajectory.locator('[data-r720-state]').all()){
    const values=(await row.locator('td').allInnerTexts()).slice(1).map(Number);
    if(values.length!==5||values.some(x=>!Number.isFinite(x))||
       Math.abs(values[4]-(values[3]-values[1]-values[2]+values[0]))>0.000003)
     throw Error(device+': R720 visible residual does not match independently computed histories');
   }
   if(!(await trajectory.locator('[data-r720-boundary]').innerText()).includes('not measured time'))
    throw Error(device+': R720 scientific boundary absent');
   await trajectory.locator('[data-r720-save]').click();
   if(!(await trajectory.locator('[data-r720-status]').innerText()).includes('Saved reproducible'))
    throw Error(device+': R720 local selection save failed');
   // R721 recomputes every source node and five model fields at every state.
   const atlas=root.locator('[data-r721-atlas]');
   await atlas.locator('[data-r721-run]').click();
   await atlas.locator('[data-r721-result]').waitFor({state:'visible',timeout:30000});
   if(await atlas.locator('[data-r721-cell]').count()!==10||
      !(await atlas.locator('[data-r721-coverage]').innerText()).includes('40 source cells'))
    throw Error(device+': R721 did not execute full 2-node x 5-field x 4-state source atlas');
   await atlas.locator('[data-r721-next]').click();
   await atlas.locator('[data-r721-next]').click();
   if(!(await atlas.locator('[data-r721-state-index]').innerText()).includes('State 2 of 3'))
    throw Error(device+': R721 model-state navigation failed');
   await atlas.locator('[data-r721-cell="A:scar"]').click();
   const atlasValues=(await atlas.locator('[data-r721-values] tbody td').allInnerTexts()).map(Number);
   if(atlasValues.length!==5||atlasValues.some(x=>!Number.isFinite(x))||
      Math.abs(atlasValues[4]-(atlasValues[3]-atlasValues[1]-atlasValues[2]+atlasValues[0]))>0.000003)
    throw Error(device+': R721 displayed matrix detail is not the four-way source residual');
   if(!(await atlas.locator('[data-r721-boundary]').innerText()).includes('No empirical causality'))
    throw Error(device+': R721 scientific boundary missing');
   await atlas.locator('[data-r721-save]').click();
   if(!(await atlas.locator('[data-r721-status]').innerText()).includes('Saved source field'))
    throw Error(device+': R721 local selection save failed');
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
   await root.locator('[data-r720-restore]').click();
   if(!(await root.locator('[data-r720-status]').innerText()).includes('independently recomputed')||
      await root.locator('[data-r720-metric]').inputValue()!=='scar'||
      await root.locator('[data-r720-state]').count()!==4)
    throw Error(device+': R720 local recovery failed to independently recompute source trajectory');
   await root.locator('[data-r721-restore]').click();
   if(!(await root.locator('[data-r721-status]').innerText()).includes('independently recomputed')||
      !(await root.locator('[data-r721-state-index]').innerText()).includes('State 2 of 3')||
      await root.locator('[data-r721-cell="A:scar"]').getAttribute('aria-pressed')!=='true')
    throw Error(device+': R721 local field selection recovery failed');
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
   await root.locator('[data-r720-restore]').click();
   if(!(await root.locator('[data-r720-error]').innerText()).includes('different source session'))
    throw Error(device+': R720 stale saved selection was accepted for a different session');
   await root.locator('[data-r721-restore]').click();
   if(!(await root.locator('[data-r721-error]').innerText()).includes('different source session'))
    throw Error(device+': R721 stale saved source selection was accepted');
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
   // R722: actual R28 snapshot -> verified portable export -> tamper refusal -> non-destructive recovery.
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Work'}).click();
   await page.locator('[data-capability-route="Memory"] footer button').click();
   await page.locator('[data-native-host-route="Memory"]').waitFor({state:'visible',timeout:30000});
   // The native route shell can appear before its lazy workspace has mounted.
   // Wait for the real Memory instrument/intro rather than checking count during loading.
   const memoryHost=page.locator('.o7-native-workspace[data-route="Memory"]');
   await memoryHost.waitFor({state:'visible',timeout:30000});
   const openMemory=memoryHost.locator('.o7-open-instrument');
   await memoryHost.locator('.o7-open-instrument, .r28-memory').first().waitFor({state:'visible',timeout:30000});
   if(await openMemory.isVisible())await openMemory.click();
   const memory=memoryHost.locator('.r28-memory');
   await memory.waitFor({state:'visible',timeout:30000});
   await memory.locator('textarea').fill('R722 independently recoverable packet observation');
   await memory.getByRole('button',{name:'Snapshot current packet'}).click();
   const recovery=page.locator('[data-r722-memory-recovery]');
   await recovery.waitFor({state:'visible',timeout:10000});
   await page.waitForFunction(()=>document.querySelector('[data-r722-count]')?.textContent?.includes('1 browser-local snapshots'));
   await recovery.locator('[data-r722-verify]').click();
   if(!(await recovery.locator('[data-r722-status]').innerText()).includes('1 local snapshot digests verified'))
    throw Error(device+': R722 existing R28 snapshot did not verify');
   await recovery.locator('[data-r722-export]').click();
   const portable=await recovery.locator('[data-r722-export-json]').inputValue();
   const bundle=JSON.parse(portable);
   if(bundle.schema!=='OMEGA_PORTABLE_MEMORY_R722_V1'||bundle.rows.length!==1)
    throw Error(device+': R722 portable bundle missing source snapshot');
   const altered=structuredClone(bundle);altered.rows[0].note+=' tampered';
   await recovery.locator('[data-r722-import-json]').fill(JSON.stringify(altered));
   await recovery.locator('[data-r722-import]').click();
   if(!(await recovery.locator('[data-r722-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R722 forged memory was not refused');
   await page.evaluate(()=>{localStorage.removeItem('omega.v6.memory.r28');window.dispatchEvent(new Event('omega-r722-memory-updated'))});
   await page.waitForFunction(()=>document.querySelector('[data-r722-count]')?.textContent?.includes('0 browser-local snapshots'));
   await recovery.locator('[data-r722-import-json]').fill(portable);
   await recovery.locator('[data-r722-import]').click();
   if(!(await recovery.locator('[data-r722-status]').innerText()).includes('1 new, 0 already present'))
    throw Error(device+': R722 verified import did not restore memory');
   if(!(await memory.innerText()).includes('R722 independently recoverable packet observation'))
    throw Error(device+': R28 Memory UI did not refresh from verified import');
   // R723 verified recall: real recovered note -> ranked source -> independent digest inspection -> replay.
   const recall=page.locator('[data-r723-recall]');
   await recall.waitFor({state:'visible',timeout:10000});
   await recall.locator('[data-r723-query]').fill('independently recoverable');
   await recall.locator('[data-r723-search]').click();
   await recall.locator('[data-r723-result]').first().waitFor({state:'visible',timeout:10000});
   if(!(await recall.locator('[data-r723-summary]').innerText()).includes('1 matching sources'))
    throw Error(device+': R723 verified source retrieval did not find recovered memory');
   await recall.locator('[data-r723-select]').click();
   if(!(await recall.locator('[data-r723-selected]').innerText()).includes('R722 independently recoverable packet observation'))
    throw Error(device+': R723 selected source does not match verified memory');
   await recall.locator('[data-r723-replay]').click();
   if(!(await recall.locator('[data-r723-status]').innerText()).includes('Verified local source address'))
    throw Error(device+': R723 verified address replay did not execute');
   // Existing R28 replay must refuse a locally altered row, not only imports.
   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[0].note+=' forged';localStorage.setItem(key,JSON.stringify(rows));
    window.dispatchEvent(new Event('omega-r722-memory-updated'));
   });
   await recall.locator('[data-r723-search]').click();
   if(!(await recall.locator('[data-r723-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R723 returned recalled evidence despite corrupted stored memory');
   await memory.locator('button[title="Replay snapshot state (verified)"]').click();
   if(!(await memory.locator('[data-r722-replay-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R28 unverified snapshot replay was not blocked');
   // The legacy capture path must not overwrite existing corrupted local data.
   await memory.locator('textarea').fill('must not overwrite forged snapshot');
   await memory.getByRole('button',{name:'Snapshot current packet'}).click();
   if(!(await memory.locator('[data-r722-replay-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R28 capture did not refuse corrupt persisted memory');
   const refusedCapture=await page.evaluate(()=>{
    const rows=JSON.parse(localStorage.getItem('omega.v6.memory.r28')||'[]');
    return rows.length===1&&rows[0].note.endsWith(' forged');
   });
   if(!refusedCapture)throw Error(device+': R28 capture overwrote corrupted local memory');
   await page.evaluate(valid=>{
    localStorage.setItem('omega.v6.memory.r28',JSON.stringify(valid));
    window.dispatchEvent(new Event('omega-r722-memory-updated'));
   },bundle.rows);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Work'}).click();
   await page.locator('[data-capability-route="Memory"] footer button').click();
   const reloadedMemoryHost=page.locator('.o7-native-workspace[data-route="Memory"]');
   await reloadedMemoryHost.waitFor({state:'visible',timeout:30000});
   await reloadedMemoryHost.locator('.o7-open-instrument, .r28-memory').first().waitFor({state:'visible',timeout:30000});
   const reopenMemory=reloadedMemoryHost.locator('.o7-open-instrument');
   if(await reopenMemory.isVisible())await reopenMemory.click();
   await reloadedMemoryHost.locator('[data-r722-memory-recovery]').waitFor({state:'visible',timeout:30000});
   if(!(await page.locator('[data-r722-count]').innerText()).includes('1 browser-local snapshots'))
    throw Error(device+': R722 imported memory not persistent after reload');
   const reloadedRecall=reloadedMemoryHost.locator('[data-r723-recall]');
   await reloadedRecall.locator('[data-r723-query]').fill('independently recoverable');
   await reloadedRecall.locator('[data-r723-search]').click();
   if(!(await reloadedRecall.locator('[data-r723-summary]').innerText()).includes('1 matching sources'))
    throw Error(device+': R723 recovered source recall did not survive reload');
   // R724 grounded intelligence: real saved R28 evidence is verified and carried into SAI Lab.
   await page.locator('.o7-nav-r519').getByRole('button',{name:'Develop'}).click();
   await page.locator('[data-capability-route="SAI Lab"] footer button').click();
   const saiHost=page.locator('.o7-native-workspace[data-route="SAI Lab"]');
   await saiHost.waitFor({state:'visible',timeout:30000});
   await saiHost.locator('.o7-open-instrument, [data-r724-intelligence]').first().waitFor({state:'visible',timeout:30000});
   const saiOpen=saiHost.locator('.o7-open-instrument');
   if(await saiOpen.isVisible())await saiOpen.click();
   const grounded=saiHost.locator('[data-r724-intelligence]');
   await grounded.waitFor({state:'visible',timeout:30000});
   await grounded.locator('[data-r724-question]').fill('What did I record about independently recoverable packet observation?');
   await grounded.locator('[data-r724-run]').click();
   await grounded.locator('[data-r724-source]').first().waitFor({state:'visible',timeout:10000});
   if(!(await grounded.locator('[data-r724-source]').first().innerText()).includes('R722 independently recoverable packet observation'))
    throw Error(device+': R724 SAI Lab did not return the verified R28 source');
   await grounded.locator('[data-r724-export]').click();
   const evidence=JSON.parse(await grounded.locator('[data-r724-json]').inputValue());
   if(evidence.schema!=='OMEGA_LOCAL_GROUNDED_INTELLIGENCE_R724_V1'||evidence.sources.length!==1||
      evidence.statements[0].text!=='R722 independently recoverable packet observation'||evidence.providerInference!==false)
    throw Error(device+': R724 exported ungrounded or incorrect source packet');
   await grounded.locator('[data-r724-replay]').click();
   if(!(await grounded.locator('[data-r724-status]').innerText()).includes('Verified local address'))
    throw Error(device+': R724 source-bound address replay failed');
   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[0].note+=' forged';localStorage.setItem(key,JSON.stringify(rows));
   });
   await grounded.locator('[data-r724-export]').click();
   if(!(await grounded.locator('[data-r724-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R724 revalidated export did not refuse tampered memory');
   await grounded.locator('[data-r724-run]').click();
   if(!(await grounded.locator('[data-r724-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R724 grounded query accepted corrupted local memory');
   // R725 source-bound longitudinal comparison: independently valid local snapshots,
   // real metric arithmetic, replay, export and refusal after source tampering.
   const pair=await page.evaluate(async valid=>{
    const first=valid[0],metrics={...first.metrics};
    const numeric=Object.keys(metrics).find(key=>typeof metrics[key]==='number'&&Number.isFinite(metrics[key]));
    if(numeric)metrics[numeric]+=0.125;
    const core={address:first.address===20735?20734:first.address+1,stateId:first.stateId+1,
     note:'R725 second verified chronological observation',metrics,decision:'R725_NEXT',
     routeNext:first.routeNext,authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
    const bytes=new TextEncoder().encode(JSON.stringify(core));
    const hash=await crypto.subtle.digest('SHA-256',bytes);
    const sha256=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
    const second={id:'r725-browser-second-0002',at:first.at+5000,...core,sha256};
    localStorage.setItem('omega.v6.memory.r28',JSON.stringify([first,second]));
    window.dispatchEvent(new Event('omega-r722-memory-updated'));
    return {earlier:first.id,later:second.id};
   },bundle.rows);
   const continuity=saiHost.locator('[data-r725-continuity]');
   await continuity.waitFor({state:'visible',timeout:10000});
   await page.waitForFunction(()=>document.querySelectorAll('[data-r725-later] option').length===3);
   await continuity.locator('[data-r725-earlier]').selectOption(pair.earlier);
   await continuity.locator('[data-r725-later]').selectOption(pair.later);
   await continuity.locator('[data-r725-compare]').click();
   await continuity.locator('[data-r725-result]').waitFor({state:'visible',timeout:10000});
   if(!(await continuity.locator('[data-r725-result]').innerText()).includes('R725 second verified chronological observation'))
    throw Error(device+': R725 comparison omitted verified later source');
   await continuity.locator('[data-r725-export]').click();
   const compared=JSON.parse(await continuity.locator('[data-r725-json]').inputValue());
   if(compared.schema!=='OMEGA_VERIFIED_MEMORY_CONTINUITY_R725_V1'||
      compared.elapsedRecordedMs!==5000||compared.causalInference!==false||
      compared.earlier.id!==pair.earlier||compared.later.id!==pair.later)
    throw Error(device+': R725 source-bound comparison packet or temporal boundary incorrect');
   await continuity.locator('[data-r725-replay-later]').click();
   if(!(await continuity.locator('[data-r725-status]').innerText()).includes('Verified later source address'))
    throw Error(device+': R725 verified later address selection failed');
   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[1].note+=' forged';localStorage.setItem(key,JSON.stringify(rows));
   });
   await continuity.locator('[data-r725-export]').click();
   if(!(await continuity.locator('[data-r725-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R725 comparison export accepted tampered source');
   // R726 verified multi-snapshot trajectory: every intervening observation is preserved.
   const trajectoryIds=await page.evaluate(async(firstId)=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[1].note=rows[1].note.replace(/ forged$/,'');
    const previous=rows[1];
    const core={address:previous.address===20735?20734:previous.address+1,
     stateId:previous.stateId+1,note:'R726 third verified trajectory observation',
     metrics:{...previous.metrics},decision:'R726_NEXT',routeNext:previous.routeNext,
     authority:'BROWSER_LOCAL_PACKET_SNAPSHOT'};
    const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(core)));
    const sha256=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
    const third={id:'r726-browser-third-0003',at:previous.at+5000,...core,sha256};
    localStorage.setItem(key,JSON.stringify([...rows,third]));
    window.dispatchEvent(new Event('omega-r722-memory-updated'));
    return {start:firstId,end:third.id};
   },pair.earlier);
   const memoryTrajectory=saiHost.locator('[data-r726-trajectory]');
   await memoryTrajectory.waitFor({state:'visible',timeout:10000});
   await page.waitForFunction(()=>document.querySelectorAll('[data-r726-end] option').length===4);
   await memoryTrajectory.locator('[data-r726-start]').selectOption(trajectoryIds.start);
   await memoryTrajectory.locator('[data-r726-end]').selectOption(trajectoryIds.end);
   await memoryTrajectory.locator('[data-r726-run]').click();
   await memoryTrajectory.locator('[data-r726-result]').waitFor({state:'visible',timeout:10000});
   if(await memoryTrajectory.locator('[data-r726-source]').count()!==3)
    throw Error(device+': R726 did not execute all three verified observations');
   await memoryTrajectory.locator('[data-r726-export]').click();
   const traced=JSON.parse(await memoryTrajectory.locator('[data-r726-json]').inputValue());
   if(traced.schema!=='OMEGA_VERIFIED_MEMORY_TRAJECTORY_R726_V1'||
      traced.sourceCount!==3||traced.edges.length!==2||traced.elapsedRecordedMs!==10000||
      traced.causalInference!==false||traced.sources[2].id!==trajectoryIds.end)
    throw Error(device+': R726 memoryTrajectory packet lost chronology or source identity');
   await memoryTrajectory.locator('[data-r726-replay]').last().click();
   if(!(await memoryTrajectory.locator('[data-r726-status]').innerText()).includes('Verified trajectory address'))
    throw Error(device+': R726 verified address replay failed');
   // R727 real discrete source projection and scrub-to-verified-address replay.
   const explorer=memoryTrajectory.locator('[data-r727-explorer]');
   await explorer.waitFor({state:'visible',timeout:10000});
   if(await explorer.locator('[data-r727-chart] circle').count()!==3||
      await explorer.locator('[data-r727-chart] path').count()!==3)
    throw Error(device+': R727 address chart omitted real discrete sources or edges');
   const metricOptions=await explorer.locator('[data-r727-metric] option').allTextContents();
   if(!metricOptions.length||!metricOptions[0].includes('20736-address path'))
    throw Error(device+': R727 address projection unavailable');
   if(!(await explorer.locator('[data-r727-coverage]').innerText()).includes('0 missing'))
    throw Error(device+': R727 address projection fabricated missing data');
   const cursor=explorer.locator('[data-r727-cursor]');
   await cursor.focus();
   await cursor.press('ArrowRight');
   if(!(await explorer.locator('[data-r727-selected]').innerText()).includes('address '+traced.sources[1].address))
    throw Error(device+': R727 recorded observation scrub did not select middle source');
   await explorer.locator('[data-r727-replay]').click();
   if(!(await memoryTrajectory.locator('[data-r726-status]').innerText()).includes('Verified trajectory address '+traced.sources[1].address))
    throw Error(device+': R727 verified source replay failed');
   console.log('R727 verified trajectory explorer '+device+' PASS: 3 discrete address observations, source scrub, reverified replay');
   // R729: save a real selected trajectory and recover after workspace source-state invalidation.
   await memoryTrajectory.locator('[data-r729-save]').click();
   await page.waitForFunction(()=>Boolean(localStorage.getItem('omega.v6.memory.trajectory.r729')));
   const checkpoint=await page.evaluate(()=>JSON.parse(localStorage.getItem('omega.v6.memory.trajectory.r729')||'null'));
   if(checkpoint?.schema!=='OMEGA_LOCAL_TRAJECTORY_CHECKPOINT_R729_V1'||
      checkpoint.cursorId!==traced.sources[1].id||checkpoint.packetSha256!==traced.packetSha256)
    throw Error(device+': R729 did not persist the selected source-bound checkpoint');
   await page.evaluate(()=>window.dispatchEvent(new Event('omega-r722-memory-updated')));
   await memoryTrajectory.locator('[data-r726-result]').waitFor({state:'hidden',timeout:10000});
   await memoryTrajectory.locator('[data-r729-restore]').click();
   await memoryTrajectory.locator('[data-r726-result]').waitFor({state:'visible',timeout:10000});
   if(!(await memoryTrajectory.locator('[data-r726-status]').innerText()).includes('restored 3 reverified')||
      !(await memoryTrajectory.locator('[data-r727-selected]').innerText()).includes('address '+traced.sources[1].address))
    throw Error(device+': R729 did not reverify and recover selected trajectory observation');
   console.log('R729 local trajectory checkpoint '+device+' PASS: saved source fingerprint, state reset, reverified restore and cursor');

   // R730: export a complete portable capsule, then import while local source memory is corrupted.
   await memoryTrajectory.locator('[data-r730-export]').click();
   const portableJSON=await memoryTrajectory.locator('[data-r730-json]').inputValue();
   const portable=JSON.parse(portableJSON);
   if(portable.schema!=='OMEGA_PORTABLE_TRAJECTORY_CAPSULE_R730_V1'||
      portable.memory.rows.length!==3||portable.memory.rows[1].id!==traced.sources[1].id)
    throw Error(device+': R730 capsule omitted independently verified original source snapshots');
   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[2].note+=' forged';localStorage.setItem(key,JSON.stringify(rows));
   });
   await memoryTrajectory.locator('[data-r730-import]').click();
   await memoryTrajectory.locator('[data-r726-result]').waitFor({state:'visible',timeout:10000});
   if(!(await memoryTrajectory.locator('[data-r726-status]').innerText()).includes('read-only traversal')||
      !(await memoryTrajectory.locator('[data-r727-selected]').innerText()).includes('address '+traced.sources[1].address)||
      await memoryTrajectory.locator('[data-r729-save]').isEnabled())
    throw Error(device+': R730 did not reverify isolated portable sources and preserve cursor');
   await memoryTrajectory.locator('[data-r727-replay]').click();
   if(!(await memoryTrajectory.locator('[data-r726-status]').innerText()).includes('Verified trajectory address'))
    throw Error(device+': R730 imported source address replay failed');
   if(!(await page.evaluate(()=>localStorage.getItem('omega.v6.memory.r28')||'')).includes(' forged'))
    throw Error(device+': R730 unexpectedly mutated original local memory');
   await memoryTrajectory.locator('[data-r730-json]').fill(JSON.stringify({...portable,sha256:'0'.repeat(64)}));
   await memoryTrajectory.locator('[data-r730-import]').click();
   if(!(await memoryTrajectory.locator('[data-r726-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R730 accepted tampered capsule');
   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[2].note=rows[2].note.replace(/ forged$/,'');
    localStorage.setItem(key,JSON.stringify(rows));
    window.dispatchEvent(new Event('omega-r722-memory-updated'));
   });
   await memoryTrajectory.locator('[data-r729-restore]').click();
   await memoryTrajectory.locator('[data-r726-result]').waitFor({state:'visible',timeout:10000});
   console.log('R730 portable trajectory capsule '+device+' PASS: export original sources, import despite damaged local store, verified replay, zero source mutation, tamper refusal');


   await page.evaluate(()=>{
    const key='omega.v6.memory.r28',rows=JSON.parse(localStorage.getItem(key)||'[]');
    rows[2].note+=' forged';localStorage.setItem(key,JSON.stringify(rows));
   });
   await memoryTrajectory.locator('[data-r726-export]').click();
   if(!(await memoryTrajectory.locator('[data-r726-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R726 memoryTrajectory export accepted tampered source');
   await memoryTrajectory.locator('[data-r729-restore]').click();
   if(!(await memoryTrajectory.locator('[data-r726-error]').innerText()).includes('digest mismatch'))
    throw Error(device+': R729 checkpoint restore accepted tampered original memory');
   console.log('R726 verified memory trajectory '+device+' PASS: 3 snapshots, 2 real edges, export, replay, tamper refusal');
   console.log('R725 verified memory continuity '+device+' PASS: two verified snapshots, metric deltas, export, replay, tamper refusal');
   console.log('R724 grounded intelligence '+device+' PASS: verified SAI Lab evidence, source packet, replay, tamper refusal');
   console.log('R723 verified recall '+device+' PASS: source-bound query, inspection, replay, tamper refusal, persisted recovery');
   console.log('R722 '+device+' PASS: real R28 snapshot, SHA-256 portable export, tamper refusal, local restore and reload persistence');
   if(errors.length)throw Error(device+': page errors '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': viewport overflow '+overflow);
   console.log('R707/R708/R709/R710/R711/R712 '+device+' PASS: source-computed topology and route witnesses, typed refusal, mirror/frame controls, safe SVG, persisted recompute, forged authority refusal, no overflow');
  }finally{await context.close()}
 }
}finally{await browser.close()}
