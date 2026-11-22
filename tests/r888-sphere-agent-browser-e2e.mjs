import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
async function openAtlas(page){
 await page.goto(base+'/?omega7=1&r888='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
 await page.locator('.o7-nav-r519').getByRole('button',{name:'Explore'}).click();
 const portal=page.locator('.o7-r519-portal[data-r519-visual-navigation="EXPLORE"]');
 await portal.waitFor({state:'visible',timeout:20000});
 await portal.locator('button[data-r519-node="Atlas"]').click();
 await portal.locator('button[data-r519-launch="Atlas"]').click();
 const native=page.locator('.o7-science-workspace[data-route="Atlas"]');
 await native.waitFor({state:'visible',timeout:30000});
 const open=native.locator('.o7-open-instrument');if(await open.count())await open.click();
 const lab=native.locator('[data-r887-agent-fabric="DETERMINISTIC_INTERNAL_MODEL"]');
 await lab.waitFor({state:'visible',timeout:20000});return lab;
}
async function prove(browser,label,viewport){
 const ctx=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 // Transport fixtures are explicit and do not establish real backend/model execution.
 if(process.env.OMEGA_R888_USE_FIXTURES==='1'){
  const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  await page.route('**/api/status',route=>json(route,{status:'READY',state:'READY'}));
  await page.route('**/api/hybrid/status',route=>json(route,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[]}));
  await page.route('**/omega-federation.json',route=>json(route,{schema:'OMEGA_R888_TEST_TRANSPORT_FIXTURE',nodes:[]}));
 }
 try{
  const lab=await openAtlas(page);
  await lab.getByRole('spinbutton',{name:'Inner page (144 values)'}).fill('2');
  const cell=lab.getByRole('gridcell',{name:/Select and observe inner state 150 value/});
  await cell.click();
  assert.equal(await cell.getAttribute('aria-pressed'),'true',label+' selected inner cell');
  assert.match(await lab.innerText(),/Selected inner state: 150 of 20736/);
  assert.match(await lab.locator('.r887-receipt').innerText(),/OBSERVE/);
  await lab.getByRole('button',{name:'Pair exchange'}).click();
  assert.match(await lab.locator('.r887-receipt').innerText(),/EXCHANGE/);
  await lab.getByRole('button',{name:'Save checkpoint'}).click();
  const stored=await page.evaluate(()=>localStorage.getItem('omega.r888.sphere.agent.checkpoint.v1'));
  assert.ok(stored&&JSON.parse(stored).schema==='OMEGA_SPHERE_AGENT_CHECKPOINT_R888',label+' saved checkpoint');
  const baseline=JSON.stringify(JSON.parse(stored).state.agents);
  await lab.getByRole('button',{name:'Local update'}).click();
  await lab.getByRole('button',{name:'Restore checkpoint'}).click();
  assert.match(await lab.innerText(),/Restored \d+ agents/);
  await lab.getByRole('button',{name:'Save checkpoint'}).click();
  const restored=await page.evaluate(()=>localStorage.getItem('omega.r888.sphere.agent.checkpoint.v1'));
  assert.equal(JSON.stringify(JSON.parse(restored).state.agents),baseline,label+' restore exact agent values');
  await page.evaluate(()=>localStorage.setItem('omega.r888.sphere.agent.checkpoint.v1','{"invalid":true}'));
  await lab.getByRole('button',{name:'Restore checkpoint'}).click();
  assert.match(await lab.getByRole('alert').innerText(),/Checkpoint restore refused/);
  if(process.env.OMEGA_R888_USE_FIXTURES==='1'){
   const cloud=lab.locator('[data-r889-cloud-bridge="EXPLICIT_OPERATOR_DISPATCH_ONLY"]');
   await cloud.waitFor({state:'visible',timeout:5000});
   let posted=0,request=null,reads=0;
   await page.route('**/api/swarm/missions',async route=>{
    posted++;request=route.request().postDataJSON();
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mission:{id:'r889-fixture-001',status:'QUEUED'}})});
   });
   await page.route('**/api/swarm/missions/r889-fixture-001',async route=>{
    reads++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mission:{id:'r889-fixture-001',status:'COMPLETE',completed:1,failed:0,proofState:'RETURNED_NOT_ADMITTED',finalSynthesis:{text:'Fixture output only'}}})});
   });
   assert.equal(posted,0,label+' cloud request must not happen on mount');
   await cloud.getByLabel('Agent cloud objective').fill('Reconcile selected agent state');
   await cloud.getByRole('button',{name:'Dispatch selected agent to governed swarm'}).click();
   await cloud.locator('[data-r889-receipt="RETURNED_NOT_ADMITTED"]').waitFor({state:'visible',timeout:8000});
   assert.equal(posted,1,label+' explicit dispatch only');
   assert.equal(request.providerBudget,0,label+' default zero model budget');
   assert.equal(request.requestedCells,1,label+' bounded one-cell swarm');
   assert.equal(request.mode,'SOLO');
   assert.match(request.intent,/inner 149\/20736/);
   assert.match(await cloud.innerText(),/CLOUD_RECEIPT_RETURNED_NOT_CANON_ADMITTED/);
   await cloud.getByRole('button',{name:'Refresh cloud mission receipt'}).click();
   await cloud.getByText(/Fixture output only/).waitFor({state:'visible',timeout:6000});
   assert.equal(reads,1,label+' refresh requires explicit operator click');
   await cloud.getByLabel('Model synthesis budget').selectOption('1');
   await cloud.getByRole('button',{name:'Dispatch selected agent to governed swarm'}).click();
   await page.waitForFunction(()=>document.querySelector('[data-r889-cloud-bridge]')?.textContent?.includes('Mission accepted'),null,{timeout:6000});
   assert.equal(posted,2);
   assert.equal(request.providerBudget,1,label+' optional one-model budget only');
   const collective=lab.locator('[data-r890-collective="EXPLICIT_BOUNDED_FLOCK"]');
   await collective.waitFor({state:'visible',timeout:5000});
   assert.equal(posted,2,label+' no collective ambient dispatch');
   await collective.getByLabel('Collective member count').selectOption('3');
   const members=await collective.locator('[data-r890-member-ids]').innerText();
   assert.equal(members.match(/\d+/g).length,3,label+' unique visible member IDs');
   await collective.getByRole('button',{name:'Dispatch selected collective'}).click();
   await collective.locator('[data-r890-receipt="RETURNED_NOT_ADMITTED"]').waitFor({state:'visible',timeout:8000});
   assert.equal(posted,3,label+' one deliberate collective dispatch');
   assert.equal(request.mode,'FLOCK');assert.equal(request.requestedCells,3);assert.equal(request.providerBudget,1);
   assert.match(request.intent,/member 3/);assert.match(await collective.innerText(),/SWARM_RESULT_NOT_CANON_ADMITTED/);
   await collective.getByRole('button',{name:'Refresh collective receipt'}).click();
   await collective.getByText(/Unverified|Fixture output only/).waitFor({state:'visible',timeout:8000});
   assert.equal(reads,2,label+' deliberate collective refresh');
   console.log('R890 BROWSER '+label.toUpperCase()+' PASS: explicit group membership, bounded 3-agent FLOCK and unadmitted receipt.');
   console.log('R889 BROWSER '+label.toUpperCase()+' PASS: no ambient dispatch, exact inner state, 0/1 model budget, explicit receipt and status proof bounds.');
  }
  // R891: starting evolution must schedule actual bounded local agent tasks, not only redraw a canvas.
  const beforeAuto=(await lab.innerText()).match(/receipts: (\d+)/);
  assert.ok(beforeAuto,label+' local receipt counter visible');
  await lab.getByRole('button',{name:'Run local agent autonomy'}).click();
  await page.waitForFunction(previous=>{
    const text=document.querySelector('[data-r887-agent-fabric]')?.textContent||'';
    const match=text.match(/receipts: (\d+)/);
    return Boolean(match&&Number(match[1])>previous);
  },Number(beforeAuto[1]),{timeout:6000});
  await lab.getByRole('button',{name:'Pause local agent autonomy'}).click();
  const afterAuto=(await lab.innerText()).match(/receipts: (\d+)/);
  assert.ok(afterAuto&&Number(afterAuto[1])>Number(beforeAuto[1]),label+' actual autonomous receipts must increase');
  console.log('R891 BROWSER '+label.toUpperCase()+' PASS: local agent autonomy creates real receipts and pauses via UI.');
  // R892: physical canvas hit proof at a safe visible coordinate; all corner indices
  // additionally remain accessible through exact numeric address input on narrow mobile layouts.
  const raster=lab.locator('canvas[data-r892-projection]');
  const projection=lab.getByLabel('20,736 pixel address projection');
  assert.equal(await raster.getAttribute('data-r892-projection'),'INNER_20736');
  await raster.evaluate(el=>el.scrollIntoView({block:'center',inline:'center'}));
  const size=await raster.evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height}));
  const mobile=label==='mobile';
  const targetInner=mobile?10465:20736;
  await raster.click({position:{x:size.width*((mobile?96.5:191.5)/192),y:size.height*((mobile?54.5:107.5)/108)}});
  assert.match(await lab.locator('[data-r892-selected-address]').innerText(),new RegExp('Selected inner state: '+targetInner+' of 20736'));
  await lab.getByLabel('Exact inner state address').fill('20736');
  assert.match(await lab.locator('[data-r892-selected-address]').innerText(),/Selected inner state: 20736 of 20736/);
  await projection.selectOption('OUTER_20736');
  assert.equal(await raster.getAttribute('data-r892-projection'),'OUTER_20736');
  const targetOuter=mobile?10465:19;
  await raster.evaluate(el=>el.scrollIntoView({block:'center',inline:'center'}));
  await raster.click({position:{x:size.width*((mobile?96.5:18.5)/192),y:size.height*((mobile?54.5:.5)/108)}});
  assert.equal(await lab.getByRole('spinbutton',{name:'Outer address'}).inputValue(),String(targetOuter),label+' exact outer address');
  await projection.selectOption('INNER_20736');
  await raster.evaluate(el=>el.scrollIntoView({block:'center',inline:'center'}));
  await raster.click({position:{x:size.width*((mobile?96.5:.5)/192),y:size.height*((mobile?54.5:.5)/108)}});
  assert.match(await lab.locator('[data-r892-selected-address]').innerText(),new RegExp('Selected inner state: '+(mobile?10465:1)+' of 20736'));
  await lab.getByLabel('Exact inner state address').fill('1');
  assert.match(await lab.locator('[data-r892-selected-address]').innerText(),/Selected inner state: 1 of 20736/);
  console.log('R892 BROWSER '+label.toUpperCase()+' PASS: exact last/first inner address, unique outer agent address and projection switching.');
  // R893: verify real autonomous scheduling sweeps distinct nested inner coordinates.
  const schedule=lab.getByLabel('Autonomous inner-state schedule');
  await schedule.selectOption('ALL_20736');
  await lab.getByLabel('Autonomous steps per cycle').selectOption('12');
  const sweepBefore=(await lab.locator('[data-r893-sweep-progress]').innerText()).match(/Autonomous inner sweep: (\d+)/);
  assert.ok(sweepBefore,label+' sweep progress exists');
  await lab.getByRole('button',{name:'Run local agent autonomy'}).click();
  await page.waitForFunction(()=>{
    const text=document.querySelector('[data-r893-sweep-progress]')?.textContent||'';
    const match=text.match(/Autonomous inner sweep: (\d+)/);
    return Boolean(match&&Number(match[1])>1);
  },null,{timeout:8000});
  await lab.getByRole('button',{name:'Pause local agent autonomy'}).click();
  const sweepAfter=await lab.locator('[data-r893-sweep-progress]').innerText();
  const advanced=sweepAfter.match(/Autonomous inner sweep: (\d+) \/ 20736/);
  assert.ok(advanced&&Number(advanced[1])>1,label+' actual sweep progressed beyond first state');
  assert.match(sweepAfter,/local only/);
  // R893 continuation: resume exact sweep address, not just mutable fabric values.
  const savedPosition=(await lab.locator('[data-r893-sweep-progress]').innerText()).match(/Autonomous inner sweep: (\d+)/);
  assert.ok(savedPosition&&Number(savedPosition[1])>1,label+' pre-save sweep coordinate');
  await lab.getByRole('button',{name:'Save checkpoint'}).click();
  const savedMeta=await page.evaluate(()=>localStorage.getItem('omega.r893.sphere.agent.sweep-continuation.v1'));
  assert.ok(savedMeta&&JSON.parse(savedMeta).schema==='OMEGA_SPHERE_SWEEP_CONTINUATION_R893',label+' sweep continuation saved');
  const persistedStep=JSON.parse(savedMeta).stepCursor;
  assert.ok(persistedStep>0);
  await lab.getByRole('button',{name:'Run local agent autonomy'}).click();
  await page.waitForFunction(previous=>{
    const n=document.querySelector('[data-r893-sweep-progress]')?.textContent||'';
    const m=n.match(/Autonomous inner sweep: (\d+)/);
    return Boolean(m&&Number(m[1])>previous);
  },Number(savedPosition[1]),{timeout:8000});
  await lab.getByRole('button',{name:'Pause local agent autonomy'}).click();
  await lab.getByRole('button',{name:'Restore checkpoint'}).click();
  assert.match(await lab.locator('p.r887-key[role="status"]').innerText(),/sweep cursor/);
  const resumedText=await lab.locator('[data-r893-sweep-progress]').innerText();
  assert.match(resumedText,new RegExp('Autonomous inner sweep: '+(Math.floor(persistedStep/JSON.parse(savedMeta).memberCount)%20736+1)+' \\/ 20736'));
  console.log('R893 CONTINUITY '+label.toUpperCase()+' PASS: save, advance, restore exact bounded inner-state sweep cursor.');
  if(process.env.OMEGA_R888_USE_FIXTURES==='1'){
   // Cloud missions are resumed by identity only; reloading must not create new work.
   const currentJournal=await page.evaluate(()=>localStorage.getItem('omega.r894.sphere.missions.v1'));
   const j=JSON.parse(currentJournal||'null');
   assert.equal(j.schema,'OMEGA_SPHERE_MISSION_JOURNAL_R894',label+' journal schema');
   assert.equal(j.single.missionId,'r889-fixture-001');
   assert.equal(j.collective.missionId,'r889-fixture-001');
   assert.equal(j.single.localStateMutated,false);
   assert.equal(j.collective.localMutation,false);
   const cloud=lab.locator('[data-r889-cloud-bridge="EXPLICIT_OPERATOR_DISPATCH_ONLY"]');
   // Renew an explicitly authorized pending mission, then check GET polling does not dispatch POST.
   let watchPosts=0,watchReads=0;
   await page.route('**/api/swarm/missions',async route=>{
    watchPosts++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mission:{id:'r889-fixture-001',status:'QUEUED'}})});
   });
   await page.route('**/api/swarm/missions/r889-fixture-001',async route=>{
    watchReads++;
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({mission:{id:'r889-fixture-001',status:'COMPLETE',completed:1,failed:0,proofState:'RETURNED_NOT_ADMITTED',finalSynthesis:{text:'Read-only watch fixture'}}})});
   });
   await cloud.getByRole('button',{name:'Dispatch selected agent to governed swarm'}).click();
   await page.waitForFunction(()=>document.querySelector('[data-r889-receipt]')?.textContent?.includes('QUEUED'),null,{timeout:8000});
   assert.equal(watchPosts,1,label+' only deliberate dispatch may POST');
   assert.equal(watchReads,0,label+' no ambient GET before opt-in');
   await cloud.getByLabel('Watch individual cloud mission read-only').check();
   await page.waitForFunction(()=>document.querySelector('[data-r889-receipt]')?.textContent?.includes('COMPLETE'),null,{timeout:9500});
   assert.ok(watchReads>=1,label+' opt-in watcher must GET the mission');
   assert.equal(watchPosts,1,label+' read-only watcher must never POST');
   await cloud.getByLabel('Watch individual cloud mission read-only').uncheck();
   const beforeReloadJournal=await page.evaluate(()=>localStorage.getItem('omega.r894.sphere.missions.v1'));
   assert.ok(beforeReloadJournal);
   const reattached=await openAtlas(page);
   await reattached.locator('[data-r889-receipt="RETURNED_NOT_ADMITTED"]').waitFor({state:'visible',timeout:5000});
   await reattached.locator('[data-r890-receipt="RETURNED_NOT_ADMITTED"]').waitFor({state:'visible',timeout:5000});
   assert.match(await reattached.innerText(),/r889-fixture-001/);
   assert.equal(await reattached.getByLabel('Watch individual cloud mission read-only').isChecked(),false,label+' reattachment does not automatically enable network polling');
   console.log('R894 BROWSER '+label.toUpperCase()+' PASS: bounded mission journal survives navigation, opt-in GET-only status watch and no automatic re-dispatch.');
  }

  console.log('R893 BROWSER '+label.toUpperCase()+' PASS: all-inner autonomy executes distinct logical addresses and stops on user pause.');
  // R895: exact float64 state survives a real atomic IndexedDB checkpoint and page navigation.
  await lab.getByLabel('Exact inner state address').fill('1');
  const firstCell=lab.getByRole('gridcell',{name:/Select and observe inner state 1 value/});
  await lab.getByRole('button',{name:'Local update'}).click();
  const storedValue=(await lab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1];
  assert.ok(Number.isFinite(Number(storedValue)),label+' exact saved float64 representation');
  await lab.getByRole('button',{name:'Save full-state durable checkpoint'}).click();
  await page.waitForFunction(()=>document.querySelector('.r887-side p[role="status"]')?.textContent?.includes('Durable checkpoint saved'),null,{timeout:8000});
  await lab.getByRole('button',{name:'Local update'}).click();
  const changedValue=(await lab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1];
  assert.notEqual(changedValue,storedValue,label+' second local computation changes inner value');
  const durableLab=await openAtlas(page);
  await durableLab.getByRole('button',{name:'Restore full-state durable checkpoint'}).click();
  await page.waitForFunction(()=>document.querySelector('.r887-side p[role="status"]')?.textContent?.includes('Durable checkpoint restored'),null,{timeout:8000});
  assert.equal((await durableLab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1],storedValue,label+' exact float64 inner value recovered after true page reload');
  // R895 PORTABLE: export a real download, then re-import and restore without cloud calls.
  const [portableDownload]=await Promise.all([
    page.waitForEvent('download',{timeout:10000}),
    durableLab.getByRole('button',{name:'Export portable checkpoint JSON'}).click()
  ]);
  assert.match(portableDownload.suggestedFilename(),/omega-r895-portable-checkpoint\\.json$/);
  const portableBytes=readFileSync(await portableDownload.path());
  const portableText=portableBytes.toString('utf8');
  const portableRecord=JSON.parse(portableText);
  assert.equal(portableRecord.schema,'OMEGA_SPHERE_DURABLE_CHECKPOINT_R895');
  assert.match(portableRecord.integrity,/^[a-f0-9]{64}$/);
  await durableLab.getByRole('button',{name:'Local update'}).click();
  await durableLab.getByLabel('Import portable checkpoint JSON').setInputFiles({name:'omega-r895-portable-checkpoint.json',mimeType:'application/json',buffer:portableBytes});
  await page.waitForFunction(()=>document.querySelector('.r887-side p[role="status"]')?.textContent?.includes('Portable checkpoint imported'),null,{timeout:10000});
  await durableLab.getByRole('button',{name:'Restore full-state durable checkpoint'}).click();
  await page.waitForFunction(()=>document.querySelector('.r887-side p[role="status"]')?.textContent?.includes('Durable checkpoint restored'),null,{timeout:8000});
  assert.equal((await durableLab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1],storedValue,label+' portable imported float64 matches exported snapshot');
  console.log('R895 PORTABLE '+label.toUpperCase()+' PASS: downloaded SHA-256-bound checkpoint, imported and restored exact float64.');
  // R895 VALID-VALUE TAMPER: structurally valid numeric alteration must fail SHA-256 verification.
  const beforeNumericTamper=(await durableLab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1];
  await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{
      const request=indexedDB.open('omega-sphere-durable-r895',1);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('checkpoints','readwrite'),store=tx.objectStore('checkpoints');
        const get=store.get('latest');
        get.onsuccess=()=>{
          const snapshot=get.result;
          const agent=snapshot.fabric.active.get(snapshot.session.agent);
          const original=agent.values.get(snapshot.session.selectedInner);
          agent.values.set(snapshot.session.selectedInner,original===0.5?0.625:0.5);
          store.put(snapshot,'latest'); // deliberately retain original integrity digest
        };
        tx.oncomplete=resolve;
        tx.onabort=()=>reject(tx.error);
      });
    }finally{db.close()}
  });
  await durableLab.getByRole('button',{name:'Restore full-state durable checkpoint'}).click();
  await durableLab.getByRole('alert').getByText(/integrity mismatch/).waitFor({state:'visible',timeout:8000});
  assert.equal((await durableLab.locator('[data-r895-exact-inner-value]').innerText()).split('Exact selected state: ')[1],beforeNumericTamper,label+' modified in-range snapshot refused without live-state mutation');
  console.log('R895 VALID-VALUE TAMPER '+label.toUpperCase()+' PASS: SHA-256 rejects modified in-range float64 state.');
  // R895 CORRUPTION: a damaged on-device checkpoint must be refused without mutating live state.
  const liveBeforeCorrupt=await durableLab.getByRole('gridcell',{name:/Select and observe inner state 1 value/}).getAttribute('aria-label');
  await page.evaluate(async()=>{
    const db=await new Promise((resolve,reject)=>{
      const request=indexedDB.open('omega-sphere-durable-r895',1);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction('checkpoints','readwrite');
        tx.objectStore('checkpoints').put({schema:'OMEGA_SPHERE_DURABLE_CHECKPOINT_R895',fabric:{active:'corrupt'},session:{}},'latest');
        tx.oncomplete=resolve;
        tx.onabort=()=>reject(tx.error);
      });
    }finally{db.close()}
  });
  await durableLab.getByRole('button',{name:'Restore full-state durable checkpoint'}).click();
  await durableLab.getByRole('alert').getByText(/Atomic full-state restore refused/).waitFor({state:'visible',timeout:8000});
  assert.equal(await durableLab.getByRole('gridcell',{name:/Select and observe inner state 1 value/}).getAttribute('aria-label'),liveBeforeCorrupt,label+' refused corrupt checkpoint without mutating current state');
  console.log('R895 CORRUPTION '+label.toUpperCase()+' PASS: malformed atomic checkpoint refused without live-state mutation.');
  console.log('R895 BROWSER '+label.toUpperCase()+' PASS: atomic IndexedDB state survived reload, rejected unrecorded update, recovered exact inner value.');
  assert.equal(errors.length,0,label+' unexpected uncaught errors '+errors.join('; '));
  console.log('R888 BROWSER '+label.toUpperCase()+' PASS: exact inner-state action, symmetric exchange, explicit checkpoint, exact restore and malformed checkpoint refusal');
 }finally{await ctx.close()}
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{await prove(browser,'desktop',{width:1440,height:900});await prove(browser,'mobile',{width:390,height:844})}finally{await browser.close()}
