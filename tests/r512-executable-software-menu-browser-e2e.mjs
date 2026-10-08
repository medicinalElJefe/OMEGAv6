import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const fixtures=process.env.OMEGA_R512_USE_FIXTURES==='1';

async function mocks(page){
 const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/restoration',r=>json(r,{state:'READY',restored:true}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_FEDERATION_R512_TEST',canonicalAuthority:'R125',nodes:[]}));
}

async function openNavigator(page){
 const open=page.locator('.r411-navigation-shell[data-navigation-owner] button[aria-label="Expand OMEGA navigator"]:visible').first();
 if(await open.count()){await open.click();return}
 const shell=page.locator('.r411-navigation-shell[data-navigation-owner].expanded:visible').first();
 await shell.waitFor({state:'visible',timeout:15000});
}

async function openSystemMap(page){
 await openNavigator(page);
 const system=page.getByRole('button',{name:'Browse full software and capability map'}).first();
 await system.waitFor({state:'visible',timeout:10000});
 await system.click();
 const inventory=page.locator('.r83-inventory').first();
 await inventory.waitFor({state:'visible',timeout:15000});
 const now=inventory.getByRole('button',{name:/Software now/i}).first();
 await now.waitFor({state:'visible',timeout:10000});
 if(await now.getAttribute('aria-pressed')!=='true')await now.click();
 return inventory;
}

async function launchByArtifact(page,artifact,expectedPanel,expectedState){
 const inventory=await openSystemMap(page);
 const row=inventory.locator('button').filter({hasText:artifact}).first();
 await row.waitFor({state:'visible',timeout:15000});
 if(await row.getAttribute('data-r512-software-state')!==expectedState)throw new Error(artifact+': expected '+expectedState+', got '+await row.getAttribute('data-r512-software-state'));
 await row.click();
 await page.waitForFunction(panel=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===panel,expectedPanel,{timeout:30000});
 const context=page.locator('.r512-legacy-launch-context').first();
 await context.waitFor({state:'visible',timeout:15000});
 if(!await context.getByText(artifact,{exact:true}).count())throw new Error(artifact+': recovered identity missing from current executor');
 if(await context.getAttribute('data-r512-state')!==expectedState)throw new Error(artifact+': context state mismatch');
 if(!await context.getByText(expectedPanel,{exact:false}).count())throw new Error(artifact+': current executor '+expectedPanel+' not visible in context');
}

async function prove(label,viewport){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  if(fixtures)await mocks(page);
  await page.goto(base+'/?omega6=1&r512='+Date.now()+'-'+label,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openNavigator(page);

  const task=page.locator('.r512-task-filter:visible');
  await task.waitFor({state:'visible',timeout:10000});
  if(await task.locator('button').count()!==7)throw new Error(label+': expected Everything + six task groups');
  const architecture=page.getByRole('navigation',{name:'Recovered OMEGA master menus'});
  await architecture.waitFor({state:'visible',timeout:10000});
  if(await architecture.locator('button').count()!==13)throw new Error(label+': all 12 recovered architecture menus were not preserved');

  await task.getByRole('button',{name:/Explore/i}).click();
  await page.waitForTimeout(50);
  const exploreRoutes=page.locator('.r89-flat-route:visible');
  if(await exploreRoutes.count()!==16)throw new Error(label+': Explore task group expected 16 current routes, received '+await exploreRoutes.count());
  await task.getByRole('button',{name:/Everything/i}).click();
  await page.waitForTimeout(50);
  if(await page.locator('.r89-flat-route:visible').count()!==44)throw new Error(label+': Everything did not restore all 44 routes');

  await launchByArtifact(page,'Omega Atlas OS','System','WORKING_SUCCESSOR');
  await launchByArtifact(page,'Mode188 Atlas Camera Shell','Hybrid Link','GATED_SUCCESSOR');

  const inventory=await openSystemMap(page);
  if(await inventory.locator('button').filter({hasText:'CanonConsoleOmega_v32_Final_Complete_Package'}).count())throw new Error(label+': donor-only software leaked into Software now');
  await inventory.getByRole('button',{name:/Software systems/i}).click();
  const donor=inventory.locator('button').filter({hasText:'CanonConsoleOmega_v32_Final_Complete_Package'}).first();
  await donor.waitFor({state:'visible',timeout:10000});
  if(await donor.getAttribute('data-r512-software-state')!=='ARCHIVE_ONLY')throw new Error(label+': donor is not truthfully classified archive-only');
  await donor.click();
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Archive Operators',undefined,{timeout:30000});
  const donorContext=page.locator('.r512-legacy-launch-context').first();
  await donorContext.waitFor({state:'visible',timeout:10000});
  if(await donorContext.getAttribute('data-r512-state')!=='ARCHIVE_ONLY')throw new Error(label+': archive lineage context missing');

  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>10)throw new Error(label+': R512 navigation/software UI causes '+overflow+'px horizontal overflow');
  if(errors.length)throw new Error(label+': page errors '+errors.join(' | ').slice(0,2400));
  console.log('R512 '+label.toUpperCase()+' PASS · task-first 6-group menu · 12 architecture menus preserved · working successor launch · gated successor launch · donor archive-only · overflow '+overflow+'px');
 }finally{await context.close();await browser.close()}
}

await prove('desktop',{width:1440,height:960});
await prove('mobile',{width:390,height:844});
console.log('R512 EXECUTABLE SOFTWARE BROWSER PASS · previous software launches current executor with visible lineage context instead of being merely listed');
