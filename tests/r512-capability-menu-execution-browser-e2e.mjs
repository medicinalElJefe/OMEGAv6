import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const useFixtures=process.env.OMEGA_R512_USE_FIXTURES==='1';

async function mockBoundedApis(page){
 const json=(r,body)=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY',hybridLink:{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false}}));
 await page.route('**/api/restoration',r=>json(r,{status:'RETURNED',state:'RETURNED'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/api/hybrid/capabilities',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',operations:[],profiles:[],workspaceGovernor:{},boundaries:['R512_BROWSER_TRANSPORT_FIXTURE_ONLY']}));
 await page.route('**/api/plugins**',r=>json(r,{plugins:[],status:'RETURNED',truthBoundary:'R512 browser transport fixture only'}));
 await page.route('**/api/archive**',r=>json(r,{items:[],count:0,status:'RETURNED',truthBoundary:'R512 browser transport fixture only'}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_R512_BROWSER_FIXTURE',nodes:[]}));
}

async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 if(useFixtures)await mockBoundedApis(page);
 await page.goto(base+`/?omega7=1&r512=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});
 await page.locator('.o7-app[data-omega7="true"]').waitFor({state:'visible',timeout:30000});

 const nav=page.locator('.o7-nav-r512[data-navigation-revision="R512"]');
 await nav.waitFor({state:'visible',timeout:15000});
 if(await nav.locator('button').count()!==6)throw new Error(`${label}: R512 must retain exactly six top-level human menu areas`);
 for(const text of ['Home','Work','Explore','Create','Develop','System'])if(!(await nav.getByRole('button',{name:new RegExp(text,'i')}).count()))throw new Error(`${label}: missing primary R512 menu ${text}`);

 await nav.getByRole('button',{name:/Explore/i}).click();
 await page.locator('.o7-intro-r512').waitFor({state:'visible',timeout:15000});
 const quick=page.locator('.o7-quick-menu');
 await quick.waitFor({state:'visible',timeout:15000});
 if(await quick.locator('button').count()<3)throw new Error(`${label}: Explore quick menu is not usefully populated`);
 const quickText=(await quick.innerText()).toLowerCase();
 if(!quickText.includes('earth')||!quickText.includes('atlas'))throw new Error(`${label}: Explore quick menu lost high-value Earth/Atlas actions`);

 const grouped=page.locator('.o7-capability-grid-r512');
 await grouped.waitFor({state:'visible',timeout:15000});
 const groupTitles=(await grouped.locator('.o7-capability-group-title').allInnerTexts()).join(' ').toLowerCase();
 if(!groupTitles.includes('ready now'))throw new Error(`${label}: organized menu lacks Ready now grouping`);

 await nav.getByRole('button',{name:/Home/i}).click();
 const recovered=page.locator('.o7-recovered[data-r486-visible-convergence="true"]');
 await recovered.waitFor({state:'visible',timeout:20000});
 const browse=recovered.getByRole('button',{name:'Browse recovered capabilities',exact:true});
 if(await browse.isVisible())await browse.click();
 const runtime=recovered.locator('[data-r512-recovered-launch="RUNTIME"]');
 await runtime.waitFor({state:'visible',timeout:20000});
 const runtimeLabel=(await runtime.innerText()).toLowerCase();
 if(!runtimeLabel.includes('run recovered software'))throw new Error(`${label}: executable historical runtime still behaves like a generic route listing`);
 await runtime.click();

 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='System',{timeout:20000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:20000});
 const capsule=page.locator('.o7-executor-capsule[data-r512-executor="RUNTIME"]');
 await capsule.waitFor({state:'visible',timeout:15000});
 const capsuleText=(await capsule.innerText()).toLowerCase();
 for(const token of ['resolved historical software','run_canonical_runtime','executor','r142 / r125'])if(!capsuleText.includes(token))throw new Error(`${label}: recovered execution capsule missing ${token}: ${capsuleText.slice(0,900)}`);
 if(await page.locator('[data-omega7-failure],.o7-native-failure').count())throw new Error(`${label}: resolved historical runtime landed in a failed executor surface`);

 const persisted=await page.evaluate(()=>sessionStorage.getItem('omega.r512.executionCapsule'));
 if(!persisted)throw new Error(`${label}: recovered execution capsule was not retained for destination continuity`);
 const parsed=JSON.parse(persisted);
 if(parsed.recoveredId!=='RUNTIME'||parsed.route!=='System'||parsed.operation!=='RUN_CANONICAL_RUNTIME')throw new Error(`${label}: recovered execution identity drift ${persisted.slice(0,800)}`);

 await page.locator('.o7-native-toolbar button').first().click();
 await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
 const previousSearch=recovered.getByRole('textbox',{name:'Search previous software'});
 await previousSearch.fill('Omega Atlas Desktop');
 const desktopRow=recovered.locator('[data-r512-system-launch="SYS-002"]');
 await desktopRow.waitFor({state:'visible',timeout:15000});
 if(!(await desktopRow.innerText()).toLowerCase().includes('run current successor'))throw new Error(`${label}: Omega Atlas Desktop is still listed without a working successor action`);
 await desktopRow.click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='System',{timeout:20000});
 const desktopCapsule=page.locator('.o7-executor-capsule[data-r512-executor="SYS-002"]');
 await desktopCapsule.waitFor({state:'visible',timeout:15000});
 const desktopCapsuleText=(await desktopCapsule.innerText()).toLowerCase();
 if(!desktopCapsuleText.includes('continue_core_runtime')||!desktopCapsuleText.includes('system ledger'))throw new Error(`${label}: Omega Atlas Desktop did not carry its current successor execution identity`);
 if(await page.locator('[data-omega7-failure],.o7-native-failure').count())throw new Error(`${label}: Omega Atlas Desktop current successor failed to open`);

 await page.locator('.o7-native-toolbar button').first().click();
 await page.waitForFunction(()=>!document.querySelector('.o7-main')?.getAttribute('data-native-route'),{timeout:10000});
 await previousSearch.fill('CanonConsoleOmega_v32_Final_Complete_Package');
 const donorRow=recovered.locator('[data-r512-system-launch="SYS-012"]');
 await donorRow.waitFor({state:'visible',timeout:15000});
 if(!(await donorRow.innerText()).toLowerCase().includes('inspect lineage'))throw new Error(`${label}: donor package is being misrepresented as executable software`);
 await donorRow.click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='Archive Operators',{timeout:20000});
 const donorCapsule=page.locator('.o7-executor-capsule[data-r512-executor="SYS-012"]');
 await donorCapsule.waitFor({state:'visible',timeout:15000});
 const donorCapsuleText=(await donorCapsule.innerText()).toLowerCase();
 if(!donorCapsuleText.includes('archive only')||!donorCapsuleText.includes('inspect_archive_lineage'))throw new Error(`${label}: donor archive truth boundary was lost`);

 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);
 if(overflow>8)throw new Error(`${label}: R512 navigation/executor UI creates horizontal overflow ${overflow}px`);
 if(errors.length)throw new Error(`${label}: unhandled page errors ${errors.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await prove(browser,'desktop',{width:1440,height:960});
 await prove(browser,'mobile',{width:390,height:844});
 console.log('R512 CAPABILITY MENU + RECOVERED EXECUTION BROWSER PASS · organized menus · RUNTIME executor · Omega Atlas Desktop working successor · donor package archive-only truth · desktop + mobile');
}finally{await browser.close()}
