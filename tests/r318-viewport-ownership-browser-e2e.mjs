import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const cases=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
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
  if(await diagnostics.count()!==1)fail(name,'expected exactly one bounded system diagnostics disclosure',{count:await diagnostics.count()});
  if(await shell.getAttribute('data-r257-presentation')!=='HEADLESS_CANONICAL_NAV')fail(name,'R257 must retain authority in headless canonical-nav presentation',{presentation:await shell.getAttribute('data-r257-presentation')});
  for(const selector of ['.r257-truth-ribbon','.r257-experience-bar','.r257-context-strip','.r257-immersive-dock'])if(await page.locator(selector).count()!==0)fail(name,'duplicate R257 chrome rendered in headless composition',{selector,count:await page.locator(selector).count()});
  const diagnosticPosition=await diagnostics.evaluate(el=>getComputedStyle(el).position);
  if(['fixed','sticky','absolute'].includes(diagnosticPosition))fail(name,'diagnostics regained overlay positioning',{position:diagnosticPosition});
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
   if(Math.abs(expandedShell.left-collapsedShell.left)>3||Math.abs(expandedShell.width-collapsedShell.width)>3)fail(name,'mobile navigator changed underlying shell geometry instead of using its bounded drawer contract',{collapsedShell,expandedShell});
   if(expandedPanel.left<railRect.right-3||expandedPanel.right>viewport.width+2)fail(name,'mobile navigator drawer escapes its bounded viewport region',{expandedPanel,railRect,viewport});
  }
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='false',{timeout:10000});

  const summary=diagnostics.locator(':scope > summary');
  try{await summary.waitFor({state:'visible',timeout:5000})}catch{fail(name,'system status summary must remain directly reachable',{summary:await rect(summary).catch(()=>null),diagnostics:await rect(diagnostics).catch(()=>null),navExpanded:await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded)})}
  await summary.click({timeout:10000});await page.waitForTimeout(80);
  if(await diagnostics.getAttribute('open')===null)fail(name,'diagnostics disclosure did not open on explicit request');
  if(['fixed','sticky','absolute'].includes(await diagnostics.evaluate(el=>getComputedStyle(el).position)))fail(name,'opened diagnostics became an overlay');
  await summary.click({timeout:10000});

  await page.reload({waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.r257-shell',{timeout:30000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavPresent==='true',{timeout:10000});
  if(await page.locator('.r257-shell').getAttribute('data-r257-presentation')!=='HEADLESS_CANONICAL_NAV')fail(name,'headless canonical-nav presentation did not survive reload');
  if(await page.locator('.r257-immersive-dock').count()!==0)fail(name,'obsolete R257 immersive dock rendered after reload');
  const reloadedShell=await rect(page.locator('.r257-shell')),reloadedRail=await rect(page.locator('.r94-nav-rail'));
  if(reloadedShell.left<reloadedRail.right-2||reloadedShell.right>viewport.width+2)fail(name,'reload broke canonical shell/nav ownership',{reloadedShell,reloadedRail,viewport});
  if(pageErrors.length)fail(name,'page errors occurred',pageErrors.slice(0,8));
  await context.close();
 }
 console.log('R318/R317.1 VIEWPORT OWNERSHIP BROWSER PASS · desktop/mobile R257 authority retained headlessly · R71/R82/R88 remains sole visible navigation · diagnostics default closed and normal-flow only · desktop expanded navigator reserves space · mobile drawer preserves bounded shell · no duplicate R257 chrome · reload stable · no page errors');
}finally{await browser.close()}
