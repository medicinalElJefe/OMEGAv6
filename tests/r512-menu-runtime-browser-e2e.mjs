import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const fixtures=process.env.OMEGA_R512_USE_FIXTURES==='1';

async function mock(page){
 const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/restoration',r=>json(r,{status:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/core-health',r=>json(r,{status:'READY'}));
 await page.route('**/api/health',r=>json(r,{ok:true,status:'READY'}));
}

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1365,height:900}});
 if(fixtures)await mock(page);
 await page.goto(base+'/?omega7=1&r512='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});

 const primary=page.locator('.o7-nav');
 for(const label of ['Home','Work','Explore','Create','Build','System'])if(!(await primary.getByRole('button',{name:label,exact:true}).isVisible()))throw new Error('primary menu missing '+label);

 await primary.getByRole('button',{name:'Explore',exact:true}).click();
 const start=page.locator('.o7-start-menu[data-r512-menu="TASK_FIRST"]');
 await start.waitFor({state:'visible',timeout:10000});
 for(const group of ['Live world','Traverse','Model & compare'])if(!(await start.getByText(group,{exact:true}).isVisible()))throw new Error('Explore Start here missing '+group);
 await start.getByRole('button',{name:/Earth & Weather/i}).click();
 await page.locator('.o7-native-host[data-native-host-route="Earth Now"]').waitFor({state:'visible',timeout:20000});

 await page.locator('.o7-native-toolbar button').first().click();
 await primary.getByRole('button',{name:'Home',exact:true}).click();
 const recovered=page.locator('.o7-recovered[data-r486-visible-convergence="true"]');
 await recovered.waitFor({state:'visible',timeout:15000});
 const browse=recovered.getByRole('button',{name:/Browse recovered capabilities/i});
 if(await browse.isVisible())await browse.click();

 const runtimeButton=recovered.locator('button[data-r512-executor="RUNTIME"]');
 await runtimeButton.waitFor({state:'visible',timeout:15000});
 if((await runtimeButton.textContent())?.trim()!=='Run current executor')throw new Error('RUNTIME recovered action is not executable');
 await runtimeButton.click();
 await page.locator('.o7-native-host[data-native-host-route="System"]').waitFor({state:'visible',timeout:20000});
 await page.locator('.o7-recovered-operation').waitFor({state:'visible',timeout:10000});
 const runtimePacket=await page.evaluate(()=>JSON.parse(localStorage.getItem('omega.r512.recoveredExecution')||'null'));
 if(runtimePacket?.schema!=='OMEGA_CORPUS_EXECUTION_INTENT_R473'||runtimePacket?.launchSchema!=='OMEGA_RECOVERED_SOFTWARE_RUNTIME_R512')throw new Error('typed R512/R473 runtime packet missing');
 if(runtimePacket.id!=='RUNTIME'||runtimePacket.operation!=='RUN_CANONICAL_RUNTIME'||runtimePacket.route!=='System'||runtimePacket.launchState!=='CURRENT_EXECUTOR_BOUND')throw new Error('RUNTIME packet did not bind exact current executor '+JSON.stringify(runtimePacket));
 if(runtimePacket.receiptAuthority!=='R142'||runtimePacket.admissionAuthority!=='R125'||runtimePacket.canonicalMutation!==false)throw new Error('RUNTIME packet authority drift');

 await page.locator('.o7-native-toolbar button').first().click();
 await primary.getByRole('button',{name:'Home',exact:true}).click();
 const gpuButton=page.locator('button[data-r512-executor="GPU"]');
 await gpuButton.waitFor({state:'visible',timeout:15000});
 if((await gpuButton.textContent())?.trim()!=='Open required evidence gate')throw new Error('GPU truth gate falsely looks executable');
 await gpuButton.click();
 await page.locator('.o7-native-host[data-native-host-route="Visual Instrument"]').waitFor({state:'visible',timeout:20000});
 const gpuPacket=await page.evaluate(()=>JSON.parse(localStorage.getItem('omega.r512.recoveredExecution')||'null'));
 if(gpuPacket?.id!=='GPU'||gpuPacket?.launchState!=='EVIDENCE_OR_DEVICE_REQUIRED'||gpuPacket?.state!=='TRUTH_GATED')throw new Error('GPU gate packet truth drift '+JSON.stringify(gpuPacket));

 console.log('R512 MENU + RECOVERED SOFTWARE BROWSER PASS · task-first menus navigate · RUNTIME emits typed executor packet · GPU stays truth-gated · historical software no longer route-only');
}finally{await browser.close()}
