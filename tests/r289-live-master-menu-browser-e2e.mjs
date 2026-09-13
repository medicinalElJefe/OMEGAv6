import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const expectedMenus=['01','02','03','04','05','06','07','08','09','10','11','12'];
const viewports=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false,isMobile:false}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];

async function openNavigator(page){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 await expand.first().waitFor({state:'visible',timeout:15000});
 await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',undefined,{timeout:10000});
}

async function visibleRouteSnapshot(page){
 return page.locator('.r89-flat-route:visible').evaluateAll(nodes=>nodes.map(node=>({name:node.getAttribute('data-route-name')||'',master:node.getAttribute('data-master-menu')||''})));
}

async function assertControlIntegrity(locator,label,{minHeight,minFont=0}={}){
 const count=await locator.count();
 if(count<1)throw new Error(`${label}: no controls found`);
 for(let i=0;i<count;i++){
  const item=locator.nth(i);
  await item.scrollIntoViewIfNeeded();
  const result=await item.evaluate((el,{minHeight,minFont})=>{
   const rect=el.getBoundingClientRect();
   const css=getComputedStyle(el);
   const x=Math.min(innerWidth-1,Math.max(0,rect.left+rect.width/2));
   const y=Math.min(innerHeight-1,Math.max(0,rect.top+rect.height/2));
   const hit=document.elementFromPoint(x,y);
   return {height:rect.height,width:rect.width,font:parseFloat(css.fontSize)||0,visible:css.display!=='none'&&css.visibility!=='hidden'&&rect.width>0&&rect.height>0,occluded:!hit||!(hit===el||el.contains(hit)),hit:hit?.className||hit?.tagName||''};
  },{minHeight,minFont});
  if(!result.visible)throw new Error(`${label}[${i}]: control is not visibly rendered`);
  if(result.height<minHeight-.5)throw new Error(`${label}[${i}]: ${result.height}px target is below ${minHeight}px contract`);
  if(minFont&&result.font<minFont-.1)throw new Error(`${label}[${i}]: ${result.font}px text is below ${minFont}px readability contract`);
  if(result.occluded)throw new Error(`${label}[${i}]: center point is intercepted by ${String(result.hit).slice(0,160)}`);
 }
}

async function prove(viewportName,contextOptions){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext(contextOptions);
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 try{
  await page.goto(`${base}/?r311menus=${Date.now()}-${viewportName}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openNavigator(page);

  const shell=page.locator('#omega-global-navigator');
  if(await shell.getAttribute('data-master-menu-presentation-revision')==='')throw new Error(`${viewportName}: live navigator missing R289 presentation revision`);
  const master=page.getByRole('navigation',{name:'Recovered OMEGA master menus'});
  await master.waitFor({state:'visible',timeout:10000});
  const masterButtons=master.locator('button');
  if(await masterButtons.count()!==13)throw new Error(`${viewportName}: expected ALL + 12 recovered master-menu controls`);
  const workspace=page.getByRole('navigation',{name:'Application workspace submenu'});
  const workspaceButtons=workspace.locator('button');
  if(await workspaceButtons.count()!==7)throw new Error(`${viewportName}: existing ALL + six workspace controls were not preserved`);

  const coarse=viewportName==='mobile';
  await assertControlIntegrity(masterButtons,`${viewportName}:master-menu`,{minHeight:coarse?44:40,minFont:coarse?10:10.5});
  await assertControlIntegrity(workspaceButtons,`${viewportName}:workspace-filter`,{minHeight:coarse?44:40,minFont:10});
  const tech=page.locator('.r239-tech-toggle:visible');
  if(await tech.count())await assertControlIntegrity(tech,`${viewportName}:technical-toggle`,{minHeight:coarse?44:38,minFont:9.5});

  await masterButtons.first().click();
  await page.waitForFunction(()=>document.querySelector('#omega-global-navigator')?.getAttribute('data-master-menu')==='ALL',undefined,{timeout:10000});
  let routes=await visibleRouteSnapshot(page);
  if(routes.length!==44)throw new Error(`${viewportName}: ALL MENUS did not expose all 44 canonical routes; received ${routes.length}`);
  if(new Set(routes.map(x=>x.name)).size!==44)throw new Error(`${viewportName}: ALL MENUS contains duplicate route identities`);

  const perMenu=new Map();
  for(let i=0;i<expectedMenus.length;i++){
   const id=expectedMenus[i],button=masterButtons.nth(i+1);
   await button.scrollIntoViewIfNeeded();
   await button.click();
   await page.waitForFunction(menu=>document.querySelector('#omega-global-navigator')?.getAttribute('data-master-menu')===menu,id,{timeout:10000});
   routes=await visibleRouteSnapshot(page);
   if(routes.length<1)throw new Error(`${viewportName}: recovered menu ${id} owns no visible routes`);
   if(routes.some(x=>x.master!==id))throw new Error(`${viewportName}: recovered menu ${id} leaked route(s) from another menu: ${JSON.stringify(routes.filter(x=>x.master!==id))}`);
   perMenu.set(id,routes.length);
  }

  await masterButtons.first().click();
  for(let i=0;i<await workspaceButtons.count();i++){
   const button=workspaceButtons.nth(i);
   await button.scrollIntoViewIfNeeded();
   await button.click();
   await page.waitForTimeout(25);
   routes=await visibleRouteSnapshot(page);
   if(routes.length<1)throw new Error(`${viewportName}: workspace filter ${i} produced no reachable routes`);
  }
  await workspaceButtons.first().click();

  const menu01=masterButtons.nth(1);await menu01.click();
  await page.waitForFunction(()=>document.querySelector('#omega-global-navigator')?.getAttribute('data-master-menu')==='01',undefined,{timeout:10000});
  routes=await visibleRouteSnapshot(page);
  const firstName=routes[0]?.name;if(!firstName)throw new Error(`${viewportName}: menu 01 has no route for search-intersection proof`);
  const search=page.locator('.r88-search input');await search.fill(firstName);
  await page.waitForFunction(name=>[...document.querySelectorAll('.r89-flat-route')].filter(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}).every(el=>el.getAttribute('data-route-name')===name),firstName,{timeout:10000});
  routes=await visibleRouteSnapshot(page);
  if(routes.length!==1||routes[0].name!==firstName||routes[0].master!=='01')throw new Error(`${viewportName}: search did not intersect the active recovered-menu filter deterministically`);
  await search.fill('');

  await masterButtons.first().click();
  await workspaceButtons.first().click();
  await page.waitForFunction(()=>document.querySelectorAll('.r89-flat-route').length===44,undefined,{timeout:10000});
  const route=page.locator('.r89-flat-route').first();
  const routeName=await route.getAttribute('data-route-name');if(!routeName)throw new Error(`${viewportName}: canonical route identity missing`);
  await route.scrollIntoViewIfNeeded();
  const routeStyle=await route.locator('span>b').first().evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize)||0}));
  if(routeStyle.font<12)throw new Error(`${viewportName}: route title regressed to ${routeStyle.font}px`);
  await route.click();
  await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,routeName,{timeout:20000});

  await openNavigator(page);
  const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
  if(overflow>10)throw new Error(`${viewportName}: live master-menu presentation causes ${overflow}px document overflow`);
  const menuGeometry=await master.evaluate(el=>({clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,overflowX:getComputedStyle(el).overflowX}));
  if(!['auto','scroll'].includes(menuGeometry.overflowX))throw new Error(`${viewportName}: recovered-menu row is not horizontally scroll-contained`);
  if(errors.length)throw new Error(`${viewportName}: browser page errors ${errors.join(' | ').slice(0,3000)}`);
  console.log(`R311 ${viewportName.toUpperCase()} PASS · 12 recovered menus + 7 workspace controls · readable typography · ${coarse?'44px coarse-pointer targets':'40px desktop targets'} · center-point reachability · ${[...perMenu.entries()].map(([id,count])=>`${id}:${count}`).join(' ')} · 44-route ALL restore · search intersection · native route activation · overflow ${overflow}px`);
 }finally{await context.close();await browser.close()}
}

for(const [name,options] of viewports)await prove(name,options);
console.log('R289/R311 LIVE MASTER-MENU BROWSER PASS · actual R88/R239 navigator · ALL + 12 recovered master menus · ALL + six workspace filters · readable controls · real coarse-pointer 44px geometry · center-point occlusion proof · master/workspace/search composition · canonical route activation · desktop/mobile containment · no page errors');
