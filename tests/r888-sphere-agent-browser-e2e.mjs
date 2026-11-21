import assert from 'node:assert/strict';
import {chromium} from 'playwright';
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
  assert.equal(errors.length,0,label+' unexpected uncaught errors '+errors.join('; '));
  console.log('R888 BROWSER '+label.toUpperCase()+' PASS: exact inner-state action, symmetric exchange, explicit checkpoint, exact restore and malformed checkpoint refusal');
 }finally{await ctx.close()}
}
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{await prove(browser,'desktop',{width:1440,height:900});await prove(browser,'mobile',{width:390,height:844})}finally{await browser.close()}
