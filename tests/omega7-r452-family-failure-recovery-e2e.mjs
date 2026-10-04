import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const representatives=[
 ['Command Center','COMMAND_RUNTIME'],
 ['Earth Now','EARTH_WEATHER'],
 ['Traversal','MOTION_TRAVERSAL'],
 ['Relativity','SCIENCE_RELATIVITY_ATLAS'],
 ['Forecast','FORECAST_VISUAL_FIELD'],
 ['Workspace','WORK_CREATE_CONTINUITY'],
 ['Hybrid Link','DEVELOPMENT_COMPUTE'],
 ['Evidence & Proof','SYSTEM_EVIDENCE_GOVERNANCE']
];

async function openExact(page,route){
 await page.locator('.o7-search-trigger').click();
 const input=page.locator('.o7-command input');
 await input.fill(route);
 const result=page.locator(`[data-command-route="${route}"]`);
 await result.waitFor({state:'visible',timeout:10000});
 await result.click();
}

async function proveFamily(browser,route,family){
 const context=await browser.newContext({viewport:{width:1280,height:860}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base+'/?omega7=1',{waitUntil:'domcontentloaded',timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});

 let injected=false;
 await page.route('**/assets/*.js',async req=>{
  if(!injected&&req.request().resourceType()==='script'){
   injected=true;
   await req.abort('failed');
   return;
  }
  await req.continue();
 });

 await openExact(page,route);
 const failure=page.locator('[data-omega7-failure]');
 await failure.waitFor({state:'visible',timeout:15000});
 if(!injected)throw new Error(`R452 ${family} did not inject lazy-chunk failure`);
 if(!await page.locator('.o7-app').isVisible())throw new Error(`R452 ${family} failure killed OMEGA7 shell`);
 const text=await failure.innerText();
 if(!text.includes('Your OMEGA state was not discarded.'))throw new Error(`R452 ${family} lost state-preservation contract`);

 await page.unroute('**/assets/*.js');
 const recover=failure.locator('button');
 const recoverText=await recover.innerText();
 if(recoverText!=='Recover')throw new Error(`R452 ${family} chunk failure did not offer deterministic Recover action`);
 await Promise.all([
  page.waitForEvent('framenavigated',{predicate:frame=>frame===page.mainFrame(),timeout:30000}),
  recover.click()
 ]);
 await page.waitForLoadState('domcontentloaded',{timeout:30000});
 await page.locator('.o7-app').waitFor({state:'visible',timeout:30000});
 await page.waitForFunction(r=>document.querySelector('.o7-main')?.getAttribute('data-native-route')===r,route,{timeout:20000});
 await page.waitForFunction(()=>Boolean(document.querySelector('.o7-native-host'))&&!document.querySelector('[data-omega7-failure]')&&!document.querySelector('.o7-native-loading'),{timeout:25000});
 if(errors.length>2)throw new Error(`R452 ${family} unexpected repeated page errors: ${errors.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 for(const [route,family] of representatives)await proveFamily(browser,route,family);
 console.log('OMEGA7 R452 FAILURE/RECOVERY PASS · eight lazy capability families isolated · shell survived · exact route recovered after clean reload · canonical/user state preservation contract retained');
}finally{await browser.close()}
