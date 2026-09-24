import{chromium}from'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const profiles=[['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1}],['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}]];
const routes=['Command Center','Visual Instrument','Convergence','Evidence & Proof','System'];
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();

async function openNavigator(page){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
 const b=page.locator('button[aria-label="Expand OMEGA navigator"]');
 await b.first().click({timeout:10000});
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}
async function route(page,name){
 await openNavigator(page);
 const rows=page.locator('.r89-flat-route');
 for(let i=0;i<await rows.count();i++){
  if(clean(await rows.nth(i).locator('b').first().textContent())!==name)continue;
  await rows.nth(i).scrollIntoViewIfNeeded();
  await rows.nth(i).click({timeout:10000});
  await page.waitForFunction(x=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===x,name,{timeout:20000});
  await page.waitForSelector('.r356-product-frame[data-route="'+name.replaceAll('"','\\"')+'"]',{timeout:30000});
  return;
 }
 throw new Error('R356 route missing '+name);
}
const browser=await chromium.launch({headless:true});
try{
 for(const[profile,opts]of profiles){
  const context=await browser.newContext(opts),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(base+'/?r356='+Date.now()+'-'+profile,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  if(await page.locator('main.r71-home').count()){
   const home=await page.locator('main.r71-home').evaluate(el=>({bg:getComputedStyle(el).backgroundImage||getComputedStyle(el).backgroundColor,width:el.getBoundingClientRect().width}));
   if(!home.bg||home.width<220)throw new Error(profile+': R356 Home product grammar not applied');
  }
  for(const name of routes){
   await route(page,name);
   const frame=page.locator('.r356-product-frame').first();
   const title=clean(await frame.locator('.r356-route-header h1').textContent());
   if(title!==name)throw new Error(profile+'/'+name+': route header mismatch '+title);
   if(await page.locator('.omega-workstation-v2>.workstation-topbar').count())throw new Error(profile+'/'+name+': obsolete ready-state topbar still mounted');
   if(await frame.locator('.r356-state-ribbon').count()!==1)throw new Error(profile+'/'+name+': state ribbon missing or duplicated');
   if(await frame.locator('.r356-context-rail').count()!==1)throw new Error(profile+'/'+name+': context rail missing or duplicated');
   const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
   if(overflow>24)throw new Error(profile+'/'+name+': viewport overflow '+overflow+'px');
   const headers=await frame.locator(':scope > .r356-route-header').count();
   if(headers!==1)throw new Error(profile+'/'+name+': expected one canonical route header, got '+headers);
   if(name==='Convergence'){
    const groups=frame.locator('.r356-module-group');
    if(await groups.count()!==5)throw new Error(profile+'/Convergence: expected 5 deliberate module groups');
    const cap=frame.locator('.r356-capability-context');
    if(await cap.count()!==1)throw new Error(profile+'/Convergence: capability context missing');
    if(await cap.evaluate(el=>el.hasAttribute('open')))throw new Error(profile+'/Convergence: capability topology must be secondary by default');
    const legacy=frame.locator('.r121-legacy-convergence');
    for(let i=0;i<await legacy.count();i++)if(await legacy.nth(i).evaluate(el=>el.hasAttribute('open')))throw new Error(profile+'/Convergence: historical body '+i+' unexpectedly dominates first view');
    if(await frame.locator('.r138-capability-field:visible').count())throw new Error(profile+'/Convergence: capability topology visible before explicit context disclosure');
    await cap.locator('summary').click({timeout:10000});
    if(!await frame.locator('.r138-capability-field').first().isVisible())throw new Error(profile+'/Convergence: capability topology not reachable after explicit disclosure');
   }
  }
  if(errors.length)throw new Error(profile+': page errors '+errors.join(' | ').slice(0,3000));
  if(!await page.locator('.r356-canonical-nav').count())throw new Error(profile+': R356 canonical navigator missing');
  console.log('R356 '+profile.toUpperCase()+' PRODUCT DESIGN PASS · coherent frame on '+routes.length+' representative routes · Convergence grouped + legacy/context secondary · no obsolete topbar · no material overflow · no page errors');
  await context.close();
 }
 console.log('R356 COHERENT PRODUCT BROWSER PASS · desktop + mobile product composition proven without reducing route authority');
}finally{await browser.close()}
