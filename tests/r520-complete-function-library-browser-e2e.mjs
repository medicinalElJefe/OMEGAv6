import {chromium} from 'playwright';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {planMissionR121} from '../src/swarm/swarmCoreR121.js';
const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedSha=String(process.env.OMEGA_EXPECTED_SHA||'').trim();
const useFixtures=process.env.OMEGA_R520_USE_FIXTURES==='1';
async function mockBoundedApis(page){
 if(!useFixtures)return;
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED',state:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{}}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED'}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R520_TEST_TRANSPORT_FIXTURE',nodes:[]}));
}
async function assertHeaderHitboxes(page,label){
 const result=await page.evaluate(()=>{
  const brand=document.querySelector('.o7-brand'),library=document.querySelector('[data-r520-full-library="open"]'),rollback=document.querySelector('.o7-v6');
  if(!(brand instanceof HTMLElement)||!(library instanceof HTMLElement)||!(rollback instanceof HTMLElement))return {missing:true};
  const b=brand.getBoundingClientRect(),l=library.getBoundingClientRect(),v=rollback.getBoundingClientRect();
  const hit=r=>document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)?.closest('button');
  const disjoint=(x,y)=>x.right<=y.left||y.right<=x.left||x.bottom<=y.top||y.bottom<=x.top;
  return {width:innerWidth,brand:{x:b.left,width:b.width,height:b.height},library:{x:l.left,width:l.width,height:l.height},rollback:{x:v.left,width:v.width,height:v.height},
   brandHit:hit(b)===brand,libraryHit:hit(l)===library,rollbackHit:hit(v)===rollback,
   separated:disjoint(b,l)&&disjoint(b,v)&&disjoint(l,v),
   inViewport:b.left>=0&&l.left>=0&&v.left>=0&&b.right<=innerWidth&&l.right<=innerWidth&&v.right<=innerWidth,
   touchSafe:[b,l,v].every(r=>r.width>=44&&r.height>=44)};
 });
 if(result.missing||!result.brandHit||!result.libraryHit||!result.rollbackHit||!result.separated||!result.inViewport||(label.startsWith('mobile')&&!result.touchSafe))
  throw new Error(label+': OMEGA home/function/rollback header touch geometry regression: '+JSON.stringify(result));
 await page.locator('.o7-brand').click({timeout:5000});
 return result;
}
async function check(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await mockBoundedApis(page);
  await page.goto(base+'/?omega7=1&r520='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});
  const trigger=page.locator('button[data-r520-full-library="open"]');
  await trigger.waitFor({state:'visible',timeout:20000});
  await assertHeaderHitboxes(page,label+' initial');
  const contextBar=page.locator('[data-r1020-workbench="UNIFIED_CONTEXT"]');
  if(await contextBar.locator('[data-r538-workflow]').count()!==1||await contextBar.locator('[data-r536-journey]').count()!==1)throw new Error(label+': workspace continuity controls not conserved');
  const contextStyle=await contextBar.locator('[data-r538-workflow]').evaluate(el=>getComputedStyle(el).borderRadius);
  if(contextStyle!=='0px')throw new Error(label+': context controls regressed into cards');
  if(label==='mobile'){
   await page.setViewportSize({width:320,height:700});
   await assertHeaderHitboxes(page,label+' narrow 320px');
   await page.setViewportSize(viewport);
   await assertHeaderHitboxes(page,label+' restored 390px');
  }
  await trigger.click();
  const pane=page.locator('.o7-r520-library[aria-label="OMEGA complete function library"]');
  await pane.waitFor({state:'visible',timeout:15000});
  if(await pane.getAttribute('data-r1019-design')!=='DESKTOP_COMMAND_SURFACE')throw new Error(label+': workstation menu design missing');
  const layout=await pane.evaluate(el=>{const row=el.querySelector('[data-r520-route]'),rail=el.querySelector('.o7-r520-matrix');return {flat:row?getComputedStyle(row).borderRadius==='0px':false,rail:rail?getComputedStyle(rail).flexDirection:null}});
  if(!layout.flat||layout.rail!==(label==='mobile'?'row':'column'))throw new Error(label+': flat native menu layout regressed: '+JSON.stringify(layout));
  // A responsive tab may put its number and label on separate lines; verify the actual
  // visible tab and its exact count instead of relying on an incidental whitespace layout.
  for(const [id,count,name] of [['ROUTES','44','Current tools'],['RECOVERED','72','Recovered lineages'],['HISTORY','100','Historical systems'],['OPTIONS','36','Menu definitions'],['CONTRACTS','18','Capability contracts']]){
    const tab=pane.locator('button[data-r520-tab="'+id+'"]');
    if(!(await tab.isVisible()))throw new Error(label+': inventory tab is not visible: '+id);
    const countText=(await tab.locator('strong').innerText()).trim();
    const visibleText=(await tab.innerText()).replace(/\s+/g,' ').trim();
    if(countText!==count||!visibleText.includes(name))throw new Error(label+': incorrect source inventory label/count for '+id+': '+visibleText);
  }
  async function expandAll(){
   const toggles=pane.locator('.o7-r520-group-title');
   const n=await toggles.count();
   if(n<1)throw new Error(label+': function source group empty');
   for(let i=0;i<n;i++){
    const button=toggles.nth(i);
    if(await button.getAttribute('aria-expanded')!=='true')await button.click();
   }
  }
  if(await pane.locator('[data-r520-route]').count()!==44)throw new Error(label+': all current tools must be immediately visible in default menu');
  await pane.getByRole('button',{name:'Collapse all',exact:true}).click();
  if(await pane.locator('[data-r520-route]').count()!==0)throw new Error(label+': collapse-all failed');
  await pane.getByRole('button',{name:'Expand all',exact:true}).click();
  await pane.getByRole('button',{name:'Detail',exact:true}).click();
  if(await pane.getAttribute('data-r1018-density')!=='DETAIL')throw new Error(label+': detail layout failed');
  await pane.getByRole('button',{name:'Compact',exact:true}).click();
  await expandAll();
  const routeIds=await pane.locator('[data-r520-route]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-route')));
  if(routeIds.length!==44||new Set(routeIds).size!==44)throw new Error(label+': route library omission/duplication: '+routeIds.length);
  for(const route of ['Matter Traversal','Atlas','Earth Now','Forecast','System Atlas','Archive Operators','Hybrid Link','Modes','Visual Instrument']){
   if(!routeIds.includes(route))throw new Error(label+': critical historical current route missing '+route);
  }
  await pane.locator('button[data-r520-tab="RECOVERED"]').click();
  await expandAll();
  const recoveredIds=await pane.locator('[data-r520-recovered]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-recovered')));
  if(recoveredIds.length!==72||new Set(recoveredIds).size!==72)throw new Error(label+': R486 source lineage hidden: '+recoveredIds.length);
  await pane.locator('button[data-r520-tab="HISTORY"]').click();
  await expandAll();
  const historicalIds=await pane.locator('[data-r520-historical]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-r520-historical')));
  if(historicalIds.length!==100||new Set(historicalIds).size!==100)throw new Error(label+': R83 historical source inventory hidden: '+historicalIds.length);
  const donor=pane.locator('[data-r520-state="archive_only"]').first();
  if(await donor.count()===0||!(await donor.innerText()).includes('Inspect lineage'))throw new Error(label+': historical donor masquerading as executable');
  const search=pane.getByRole('textbox',{name:'Search all functions'});
  await search.fill('Omega Atlas Desktop');
  const selected=pane.locator('[data-r520-historical="SYS-002"]');
  await selected.waitFor({state:'visible',timeout:10000});
  if(!(await selected.innerText()).includes('Omega Atlas Desktop'))throw new Error(label+': remembered historical name cannot be recovered');
  await search.fill('');
  for(const [tab,attr,expected] of [['OPTIONS','data-r520-option',36],['CONTRACTS','data-r520-contract',18]]){
    await pane.locator('button[data-r520-tab="'+tab+'"]').click();
    await expandAll();
    const ids=await pane.locator('['+attr+']').evaluateAll((nodes,key)=>nodes.map(n=>n.getAttribute(key)),attr);
    if(ids.length!==expected||new Set(ids).size!==expected)throw new Error(label+': missing historical '+tab+' source entries: '+ids.length);
  }
  await pane.locator('button[data-r520-tab="ROUTES"]').click();
  await pane.getByRole('combobox',{name:'Filter function group'}).selectOption('EXPLORE');
  await expandAll();
  const atlas=pane.locator('[data-r520-route="Atlas"]');
  await atlas.getByRole('button',{name:'Open State Atlas',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Atlas',{timeout:20000});
  if(await page.locator('.o7-r520-library').count())throw new Error(label+': drawer left open over running Atlas');
  await page.locator('.o7-native-host').waitFor({state:'visible',timeout:20000});
  await assertHeaderHitboxes(page,label+' after lazy function library loaded');
  if(await page.locator('.o7-native-failure').count())throw new Error(label+': recovered menu route opens broken Atlas');
  if(errors.length)throw new Error(label+': uncaught browser error '+errors.join(' | ').slice(0,1200));
  console.log('R520 '+label+' COMPLETE FUNCTION LIBRARY PASS · 44 routes · 72 lineages · 100 historical records · source filters · archived donor disclosure · remembered-name search · real Atlas launch');
 }finally{await context.close()}
}

// R1021: exact deployed browser -> real zero-provider deterministic cell -> archive.
// A single durable mission per promotion, then GET-only mobile recovery.
async function liveSwarmR1021(browser){
 if(!expectedSha||useFixtures)return;
 let intent='',expectedCell;
 for(let n=0;n<64;n++){
  const candidate='R1021 release acceptance '+expectedSha+' '+n;
  const cell=planMissionR121({intent:candidate,mode:'SOLO',requestedCells:1,providerBudget:0}).selected[0];
  if(cell.profile.domainRole==='MATHEMATICS'||cell.profile.domainRole==='DATA'){intent=candidate;expectedCell=cell;break}
 }
 if(!expectedCell)throw Error('R1021 no deterministic acceptance cell selected');
 let missionId='';
 async function openConsole(context){
  const page=await context.newPage();
  await page.goto(base+'/?omega7=1&omega7route='+encodeURIComponent('SAI Lab')+'&r1021='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
  await page.locator('[data-r1017-cloud-swarm]').waitFor({state:'visible',timeout:35000});
  await page.getByRole('button',{name:'Open cloud swarm console',exact:true}).click();
  const consoleRoot=page.locator('.r121-swarm');
  await consoleRoot.waitFor({state:'visible',timeout:25000});
  return {page,consoleRoot};
 }
 const desktop=await browser.newContext({viewport:{width:1440,height:960},acceptDownloads:true});
 try{
  const {page,consoleRoot}=await openConsole(desktop);
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await consoleRoot.getByLabel('Mission intent').fill(intent);
  await consoleRoot.getByLabel('Execution mode').selectOption('SOLO');
  const budget=consoleRoot.getByLabel('Maximum provider calls');
  if(await budget.inputValue()!=='0')throw Error('R1021 provider opt-in default regressed');
  const acceptedPromise=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/swarm/missions',{timeout:30000});
  await consoleRoot.getByRole('button',{name:'LAUNCH SWARM',exact:true}).click();
  const acceptedResponse=await acceptedPromise;
  if(!acceptedResponse.ok())throw Error('R1021 live mission admission HTTP '+acceptedResponse.status());
  const accepted=await acceptedResponse.json();missionId=accepted?.mission?.id;
  if(typeof missionId!=='string'||accepted.mission.total!==1||accepted.mission.providerBudget!==0||accepted.plan?.sampleCells?.[0]?.id!==expectedCell.id)throw Error('R1021 actual accepted mission diverges from deterministic plan');
  await consoleRoot.locator('[data-r1021-mission-status="COMPLETE"]').waitFor({state:'visible',timeout:90000});
  const status=await page.request.get(base+'/api/swarm/missions/'+encodeURIComponent(missionId));
  const receipt=(await status.json()).mission;
  if(!status.ok()||receipt?.id!==missionId||receipt.completed!==1||receipt.failed!==0||receipt.providerAttempts!==0||receipt.canonicalMutation!==false)throw Error('R1021 actual execution receipt invalid');
  const history=consoleRoot.locator('[data-r1014-result-history]');
  await history.getByRole('button',{name:'LOAD RESULT HISTORY',exact:true}).click();
  const row=history.locator('.r121-recent button[data-ok="true"]');
  await row.waitFor({state:'visible',timeout:20000});await row.click();
  const inspector=consoleRoot.locator('[data-r1013-mission-cell]');
  await inspector.locator('pre').waitFor({state:'visible',timeout:10000});
  await inspector.getByRole('button',{name:'VERIFY PAYLOAD SHA-256',exact:true}).click();
  await inspector.locator('[data-r1021-digest-feedback]').filter({hasText:'Payload bytes match reported SHA-256'}).waitFor({state:'visible',timeout:15000});
  const downloadPromise=page.waitForEvent('download',{timeout:25000});
  await history.getByRole('button',{name:'DOWNLOAD FULL ARCHIVE',exact:true}).click();
  const download=await downloadPromise;
  const file=await download.path();if(!file)throw Error('R1021 archive download missing');
  const archive=JSON.parse(await readFile(file,'utf8'));
  const result=archive.rows?.[0];
  if(archive.missionId!==missionId||archive.snapshot?.completeArchiveOfAccountedReturns!==true||archive.rows?.length!==1||result?.cellId!==expectedCell.id||result.executor!=='DETERMINISTIC'||result.ok!==true||typeof result.resultJson!=='string'||createHash('sha256').update(result.resultJson).digest('hex')!==result.receiptSha)throw Error('R1021 downloaded real result failed identity/digest validation');
  if(errors.length)throw Error('R1021 desktop browser errors '+errors.join(' | ').slice(0,1000));
  console.log('R1021 LIVE DETERMINISTIC SAI PASS · '+expectedSha+' · '+missionId+' · '+result.cellId+' · '+result.receiptSha+' · actual archive bytes · provider calls 0 · no Canon admission');
 }finally{await desktop.close()}
 const mobile=await browser.newContext({viewport:{width:390,height:844}});
 try{
  const {page,consoleRoot}=await openConsole(mobile);
  let writes=0;page.on('request',r=>{if(r.method()!=='GET'&&new URL(r.url()).pathname.startsWith('/api/swarm/missions'))writes++});
  await consoleRoot.getByLabel('Existing mission ID').fill(missionId);
  await consoleRoot.getByRole('button',{name:'RECOVER BY ID',exact:true}).click();
  await consoleRoot.locator('[data-r1021-mission-status="COMPLETE"]').waitFor({state:'visible',timeout:25000});
  const selected=await consoleRoot.locator('[data-r1021-mission-status]').getAttribute('data-r1021-mission-id');
  if(selected!==missionId||writes!==0)throw Error('R1021 mobile recovery identity or no-redispatch proof failed');
  console.log('R1021 MOBILE GET-ONLY RECOVERY PASS · '+expectedSha+' · '+missionId);
  await page.getByRole('button',{name:'Open organism console',exact:true}).click();
  await page.locator('.r123-organism').waitFor({state:'visible',timeout:25000});
  await page.locator('[data-r1027-recovery="organism"]').waitFor({state:'visible'});
  await page.getByRole('button',{name:'Close organism console',exact:true}).click();
  await page.getByRole('button',{name:'Open autonomic console',exact:true}).click();
  const autonomic=page.locator('.r125-auto');await autonomic.waitFor({state:'visible',timeout:25000});
  await page.locator('[data-r1027-recovery="autonomic"]').waitFor({state:'visible'});
  const planned=page.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname==='/api/swarm/autonomic/plan',{timeout:25000});
  await autonomic.getByRole('button',{name:'PREVIEW ROUTE',exact:true}).click();
  const returned=await planned;if(!returned.ok())throw Error('R1027 live preview rejected '+returned.status());
  const payload=await returned.json();if(!payload.plan||payload.plan.budgets?.providerTotal!==0)throw Error('R1027 plan lacks explicit zero budget');
  await autonomic.locator('.r125-plan').waitFor({state:'visible',timeout:15000});
  console.log('R1027 LIVE ORGANISM/AUTONOMIC ACCESS PASS · original consoles and zero-provider route preview; no mission launch');
 }finally{await mobile.close()}
}
if(expectedSha){
 if(!/^[0-9a-f]{40}$/i.test(expectedSha))throw new Error('R520 expected SHA must be full hexadecimal commit');
 const response=await fetch(base+'/omega-build-receipt.json?r520='+Date.now(),{headers:{'cache-control':'no-cache'}});
 if(!response.ok)throw new Error('R520 exact promoted build receipt HTTP '+response.status);
 const receipt=await response.json();
 if(receipt.schema!=='OMEGA_GOVERNED_BUILD_RECEIPT_V1'||receipt?.source?.sha!==expectedSha||receipt?.promotion?.promotedMergeSha!==expectedSha)throw new Error('R520 exact source/promoted build receipt mismatch');
}
const browser=await chromium.launch({headless:true});
try{
 await check(browser,'desktop',{width:1440,height:960});
 await check(browser,'mobile',{width:390,height:844});
 await liveSwarmR1021(browser);
 console.log('R520 ALL FUNCTIONS BROWSER PASS · source inventories are not claims that all historical software executes');
}finally{await browser.close()}
