import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const cases=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const near=(a,b,t=3)=>Math.abs(a-b)<=t;
const fail=(scope,message,detail={})=>{throw new Error(`R318 ${scope}: ${message} · ${JSON.stringify(detail)}`)};

async function rect(locator){return locator.evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,display:getComputedStyle(el).display,visibility:getComputedStyle(el).visibility,position:getComputedStyle(el).position}})}
async function visibleChildren(locator){return locator.evaluate(el=>[...el.children].filter(x=>x.tagName!=='SUMMARY').filter(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1}).length)}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of cases){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/?r318-viewport=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.r257-shell',{timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavPresent==='true',{timeout:10000});

  const shell=page.locator('.r257-shell');
  const rail=page.locator('.r94-nav-rail');
  const panel=page.locator('#omega-global-navigator');
  const diagnostics=page.locator('.r318-system-diagnostics');
  const truth=page.locator('.r257-truth-ribbon');
  const experienceBar=page.locator('.r257-experience-bar');
  if(await diagnostics.count()!==1)fail(name,'expected exactly one bounded system diagnostics disclosure',{count:await diagnostics.count()});

  for(const [label,target] of [['truth ribbon',truth],['experience bar',experienceBar],['diagnostics',diagnostics]]){
   const p=await target.evaluate(el=>getComputedStyle(el).position);
   if(['fixed','sticky','absolute'].includes(p))fail(name,`${label} regained overlay positioning`,{position:p});
  }

  if(await diagnostics.getAttribute('open')!==null)fail(name,'system diagnostics must be closed by default');
  if(await visibleChildren(diagnostics)!==0)fail(name,'closed system diagnostics leak visible content');

  const collapsedShell=await rect(shell),railRect=await rect(rail);
  if(collapsedShell.left<railRect.right-2)fail(name,'canonical shell overlaps persistent navigation rail',{collapsedShell,railRect});
  if(collapsedShell.right>viewport.width+2)fail(name,'canonical shell escapes viewport',{collapsedShell,viewport});

  const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(await trigger.count()!==1)fail(name,'global navigator trigger missing',{count:await trigger.count()});
  await trigger.click({timeout:10000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
  await page.waitForTimeout(260);
  const expandedShell=await rect(shell),expandedPanel=await rect(panel);
  if(name==='desktop'){
   if(expandedPanel.display==='none'||expandedPanel.visibility==='hidden'||expandedPanel.width<100)fail(name,'expanded navigator panel is not visibly laid out',{expandedPanel});
   if(expandedShell.left<expandedPanel.right-3)fail(name,'expanded desktop navigator covers canonical shell',{expandedShell,expandedPanel});
   if(expandedShell.right>viewport.width+2)fail(name,'expanded desktop shell escapes viewport',{expandedShell,viewport});
  }else{
   if(!near(expandedShell.left,collapsedShell.left,3)||!near(expandedShell.width,collapsedShell.width,3))fail(name,'mobile navigator changed underlying shell geometry instead of using its bounded drawer contract',{collapsedShell,expandedShell});
   if(expandedPanel.left<railRect.right-3||expandedPanel.right>viewport.width+2)fail(name,'mobile navigator drawer escapes its bounded viewport region',{expandedPanel,railRect,viewport});
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='false',{timeout:10000});
  await page.waitForTimeout(220);

  const advanced=page.locator('button[aria-label="Experience depth: Advanced"]');
  await advanced.click({timeout:10000});
  await page.waitForTimeout(80);
  const summary=diagnostics.locator(':scope > summary');
  if(!await summary.isVisible())fail(name,'diagnostics summary must be reachable in Advanced depth');
  if(await visibleChildren(diagnostics)!==0)fail(name,'closed diagnostics leak after depth change');
  await summary.click({timeout:10000});
  await page.waitForTimeout(80);
  if(await diagnostics.getAttribute('open')===null)fail(name,'diagnostics disclosure did not open on explicit request');
  const openPosition=await diagnostics.evaluate(el=>getComputedStyle(el).position);
  if(['fixed','sticky','absolute'].includes(openPosition))fail(name,'opened diagnostics became an overlay',{openPosition});
  await summary.click({timeout:10000});
  await page.waitForTimeout(50);

  const immersive=page.locator('button[aria-label="Enter immersive experience"]');
  await immersive.click({timeout:10000});
  await page.waitForFunction(()=>document.querySelector('.r257-shell')?.getAttribute('data-r257-immersive')==='true',{timeout:10000});
  if(!await page.locator('.r257-immersive-dock').isVisible())fail(name,'explicit immersive mode did not expose its exit control');
  await page.reload({waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.r257-shell',{timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavPresent==='true',{timeout:10000});
  if(await page.locator('.r257-shell').getAttribute('data-r257-immersive')!=='false')fail(name,'immersive viewport state returned after reload');
  if(await page.locator('.r257-immersive-dock').count()!==0)fail(name,'immersive fixed dock returned after reload');
  const reloadedShell=await rect(page.locator('.r257-shell')),reloadedRail=await rect(page.locator('.r94-nav-rail'));
  if(reloadedShell.left<reloadedRail.right-2||reloadedShell.right>viewport.width+2)fail(name,'reload broke canonical shell/nav ownership',{reloadedShell,reloadedRail,viewport});
  if(pageErrors.length)fail(name,'page errors occurred',pageErrors.slice(0,8));
  await context.close();
 }
 console.log('R318 VIEWPORT OWNERSHIP BROWSER PASS · desktop/mobile canonical shell owns layout · diagnostics default closed and normal-flow only · desktop expanded navigator reserves space · mobile drawer preserves bounded underlying shell · immersive viewport state is session-only and cannot return after reload · no page errors');
}finally{await browser.close()}
