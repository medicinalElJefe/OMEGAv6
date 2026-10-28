import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw Error('R705 promoted SHA must be 40 hex digits');
 const r=await fetch(base+'/omega-build-receipt.json?r705='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!r.ok)throw Error('R705 live build receipt unavailable: '+r.status);
 const receipt=await r.json();
 if(receipt?.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw Error('R705 live receipt not bound to promoted SHA');
}
const browser=await chromium.launch({headless:true});
try{
 for(const [device,viewport] of [['desktop',{width:1440,height:900}],['mobile',{width:390,height:844}]]){
  const context=await browser.newContext({viewport});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  try{
   await page.goto(base+'/?omega7=1&r705='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   const audit=page.locator('[data-r705-capability-audit="source-resolution"]');
   await audit.waitFor({state:'visible',timeout:30000});
   if(!(await audit.innerText()).includes('not a live production-health certificate'))throw Error(device+': source/runtime truth boundary missing');
   // R624: test real browser interaction rather than just checking that source text contains a control.
   const inherited=audit.locator('[data-r624-inherited-development="local-only"]');
   await inherited.getByRole('button',{name:'Execute inherited replay'}).click();
   const replayOutput=inherited.locator('[data-r624-output]');
   await page.waitForFunction(()=>{const e=document.querySelector('[data-r624-output]');return e&&e.textContent&&!e.textContent.includes('Not executed')},{timeout:10000});
   let replay;
   try{replay=JSON.parse(await replayOutput.innerText())}catch(e){throw Error(device+': inherited replay did not yield parseable result: '+String(e))}
   if(!Array.isArray(replay.canonicalHistory)||replay.canonicalHistory.length!==4)throw Error(device+': canonical frame history missing');
   if(replay.developmental?.velocity?.length!==3||replay.developmental?.acceleration?.length!==2||replay.developmental?.jerk?.length!==1)throw Error(device+': heightened derivatives absent');
   if(replay.proof?.liveRuntimeVerified!==false||replay.proof?.historicalParityVerified!==false)throw Error(device+': local execution was promoted into unverifiable production or parity evidence');
   if(replay.canonicalHistory[0]?.[0]?.scar!==0.15)throw Error(device+': historical scar field was lost');

   // R706: edit real directed transport inputs, recompute, export only source inputs,
   // recover them after reload, and reject forged authority without admitting output.
   const scenarioInput=inherited.locator('[data-r706-scenario-input]');
   const scenario=JSON.parse(await scenarioInput.inputValue());
   scenario.nodes[0].continuity=0.6;
   scenario.edgeFrames[0][0].kind='BLOCKED';
   await scenarioInput.fill(JSON.stringify(scenario));
   await inherited.getByRole('button',{name:'Execute inherited replay'}).click();
   await page.waitForFunction(()=>document.querySelector('[data-r624-output]')?.textContent?.includes('"continuityBefore":0.6'),null,{timeout:10000});
   const edited=JSON.parse(await replayOutput.innerText());
   if(edited.canonicalHistory[0][0].continuity!==0.6||edited.summary?.changes?.[0]?.continuityBefore!==0.6)throw Error(device+': edited scenario was not executed');
   if(edited.proof?.liveRuntimeVerified!==false)throw Error(device+': edited scenario inflated proof');
   await inherited.locator('[data-r706-export]').click();
   const portable=JSON.parse(await inherited.locator('[data-r706-portable]').inputValue());
   if(portable.nodes[0].continuity!==0.6||portable.proof||portable.canonicalHistory)throw Error(device+': portable inputs carried output or authority');
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('.o7-nav-r519').getByRole('button',{name:'System'}).click();
   await page.waitForFunction(()=>document.querySelector('[data-r706-scenario-input]')?.value?.includes('"continuity": 0.6'),null,{timeout:10000});
   const restoredInput=page.locator('[data-r706-scenario-input]');
   const restored=JSON.parse(await restoredInput.inputValue());
   if(restored.nodes[0].continuity!==0.6||restored.edgeFrames[0][0].kind!=='BLOCKED')throw Error(device+': local scenario inputs did not recover');
   await restoredInput.fill(JSON.stringify({...restored,proof:{liveRuntimeVerified:true}}));
   await page.locator('[data-r624-execute]').click();
   await page.waitForFunction(()=>document.querySelector('[data-r624-output]')?.textContent?.includes('REFUSED_NO_EXECUTION'),null,{timeout:10000});
   if(await page.locator('[data-r706-summary-table]').count())throw Error(device+': forged authority retained computed summary');

   const pillar=audit.getByLabel('Filter capability pillar');
   const state=audit.getByLabel('Filter capability evidence state');
   if(await pillar.locator('option').count()!==13)throw Error(device+': architecture pillars not conserved');
   await state.selectOption('ALL');
   await audit.getByLabel('Search historical capabilities').fill('Workbook / Excel atlas runtime');
   const workbook=audit.locator('[data-r705-capability-id="WORKBOOK"]');
   await workbook.waitFor({state:'visible',timeout:10000});
   await pillar.selectOption('CALCULUS');
   await workbook.waitFor({state:'detached',timeout:10000}).catch(()=>{throw Error(device+': pillar filter failed to remove non-calculus capability')});
   // WORKBOOK is classified by the R474 atlas precedence rule as KNOWLEDGE_ATLASES,
   // even though its R473 domain is APPLICATIONS. Test the actual graph pillar.
   await pillar.selectOption('KNOWLEDGE_ATLASES');
   await workbook.waitFor({state:'visible',timeout:10000});
   if(!(await workbook.innerText()).includes('KNOWLEDGE ATLASES'))throw Error(device+': workbook R474 pillar classification drifted');
   if(!(await workbook.innerText()).includes('live execution still requires independent proof')&&!(await workbook.innerText()).includes('Remaining gap:'))throw Error(device+': no source-gap or proof boundary');
   await workbook.getByRole('button',{name:'Open current route: System Atlas'}).click();
   await page.locator('[data-native-host-route="System Atlas"]').waitFor({state:'visible',timeout:30000});
   if(errors.length)throw Error(device+': browser errors: '+errors.join(' | '));
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   if(overflow>8)throw Error(device+': horizontal overflow '+overflow);
   console.log('R705 '+device+' PASS: 12-pillar source audit, search/filter and real OMEGA7 System Atlas route launch; no source-to-live proof escalation');
  }finally{await context.close()}
 }
}finally{await browser.close()}
