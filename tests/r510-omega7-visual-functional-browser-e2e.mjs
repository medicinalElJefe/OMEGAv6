import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||process.env.OMEGA_PUBLIC_URL||'http://127.0.0.1:4173').replace(/\/$/,'');

async function mocks(page){
 const json=(route,body)=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 await page.route('**/api/status',r=>json(r,{status:'READY',state:'READY'}));
 await page.route('**/api/hybrid/status',r=>json(r,{state:'DEVICE_PROOF_REQUIRED',nativeExecutionClaimed:false,devices:[],jobs:[],events:[]}));
 await page.route('**/omega-federation.json',r=>json(r,{schema:'OMEGA_FEDERATION_R510_UI_PROOF',canonicalAuthority:'R125',nodes:[]}));
}

async function prove(browser,label,viewport){
 const context=await browser.newContext({viewport,deviceScaleFactor:label==='mobile'?2:1,extraHTTPHeaders:{'cache-control':'no-cache','pragma':'no-cache'}});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await mocks(page);
 await page.goto(base+`/?omega7=1&r510=${Date.now()}-${label}`,{waitUntil:'domcontentloaded',timeout:45000});

 const app=page.locator('.o7-app[data-omega7="true"]');
 await app.waitFor({state:'visible',timeout:30000});
 const home=page.locator('.o7-home-established[data-r510-visual-restoration="CURRENT_R71_CANONICAL_HOME"]');
 await home.waitFor({state:'visible',timeout:30000});
 await home.locator('.r71-home[data-r510-embedded="true"]').waitFor({state:'visible',timeout:30000});
 await home.locator('.r95-membrane-stage').waitFor({state:'visible',timeout:30000});

 if(await page.locator('.o7-home-actions').count())throw new Error(`${label}: old OMEGA7 button-board HOME still exists`);
 if(await home.locator('.r411-navigation-shell,.r94-side-toolbar').count())throw new Error(`${label}: embedded R71 mounted a duplicate global navigator`);
 if(await page.locator('.o7-nav button').count()!==6)throw new Error(`${label}: OMEGA7 framing navigation regressed`);

 const geometry=await page.evaluate(()=>{
  const home=document.querySelector('.o7-home-established');
  const field=document.querySelector('.o7-home-established .r95-membrane-stage');
  const workbench=document.querySelector('.o7-home-established .r96-workbench');
  const main=document.querySelector('.o7-main');
  if(!home||!field||!workbench||!main)return null;
  const h=home.getBoundingClientRect(),f=field.getBoundingClientRect(),w=workbench.getBoundingClientRect(),m=main.getBoundingClientRect();
  return{
   homeWidth:h.width,fieldWidth:f.width,fieldHeight:f.height,workbenchHeight:w.height,mainWidth:m.width,
   viewportWidth:window.innerWidth,viewportHeight:window.innerHeight,
   overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth
  };
 });
 if(!geometry)throw new Error(`${label}: visual geometry unavailable`);
 if(geometry.overflow>8)throw new Error(`${label}: horizontal overflow ${geometry.overflow}px`);
 if(geometry.homeWidth<geometry.mainWidth-6)throw new Error(`${label}: visual HOME does not own main width ${JSON.stringify(geometry)}`);
 if(geometry.fieldHeight<Math.min(360,geometry.viewportHeight*.42))throw new Error(`${label}: canonical visual field is too small ${JSON.stringify(geometry)}`);
 if(label==='desktop'&&geometry.fieldWidth<geometry.homeWidth*.48)throw new Error(`${label}: visual field is not compositionally dominant ${JSON.stringify(geometry)}`);
 if(label==='mobile'&&geometry.fieldWidth<geometry.homeWidth*.82)throw new Error(`${label}: phone visual field does not use available width ${JSON.stringify(geometry)}`);

 const matter=home.locator('.r71-modes button').filter({hasText:'Matter'}).first();
 await matter.click();
 if(await matter.getAttribute('aria-pressed')!=='true')throw new Error(`${label}: visual projection control did not actuate`);

 const allTools=home.getByRole('button',{name:'All tools'});
 await allTools.click();
 await page.locator('.o7-command').waitFor({state:'visible',timeout:10000});
 await page.keyboard.press('Escape');
 await page.locator('.o7-command').waitFor({state:'detached',timeout:10000}).catch(async()=>page.locator('.o7-command').waitFor({state:'hidden',timeout:10000}));

 const systemMap=home.getByRole('button',{name:'System map'});
 await systemMap.click();
 await page.waitForFunction(()=>document.querySelector('.o7-main')?.getAttribute('data-native-route')==='System Atlas',{timeout:20000});
 await page.locator('.o7-native-host').waitFor({state:'visible',timeout:20000});
 if(await page.locator('[data-omega7-failure]').count())throw new Error(`${label}: System Atlas bridge entered failure state`);
 await page.locator('.o7-native-toolbar button').first().click();
 await home.waitFor({state:'visible',timeout:15000});

 if(errors.length)throw new Error(`${label}: unhandled page errors ${errors.join(' | ').slice(0,1800)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await prove(browser,'desktop',{width:1440,height:960});
 await prove(browser,'mobile',{width:390,height:844});
 console.log('R510 OMEGA7 VISUAL-FUNCTIONAL BROWSER PASS · current R71 visual field dominates desktop + mobile · old button board absent · one navigator · projection control actuates · All tools + System Atlas bridges work');
}finally{
 await browser.close();
}
