import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const expected=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(expected.length!==44||new Set(expected).size!==44)throw new Error(`R286/R304 expected 44 unique canonical surfaces, received ${expected.length}/${new Set(expected).size}`);

const profiles=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];

async function openNavigator(page){
  if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
  const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(!await expand.count())throw new Error('R286/R304 global navigator expand control missing');
  await expand.first().scrollIntoViewIfNeeded();
  await expand.first().click();
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}

async function verifyNavigatorModeTouchTargets(page,viewportName){
  if(viewportName!=='mobile')return;
  const state=await page.evaluate(()=>{
    const coarse=matchMedia('(any-pointer: coarse)').matches;
    const buttons=[...document.querySelectorAll('.r89-nav-mode button')].map(el=>{const r=el.getBoundingClientRect();return{label:(el.textContent||'').replace(/\s+/g,' ').trim(),width:r.width,height:r.height}});
    return{coarse,buttons};
  });
  if(state.coarse!==true)throw new Error(`mobile: R304 expected coarse-pointer emulation, received ${JSON.stringify(state)}`);
  if(state.buttons.length!==2)throw new Error(`mobile: R304 expected two navigator-mode controls, received ${state.buttons.length}`);
  const undersized=state.buttons.filter(x=>x.width<43.5||x.height<43.5);
  if(undersized.length)throw new Error(`mobile: R304 navigator-mode targets below 44px: ${undersized.map(x=>`${x.label} ${x.width.toFixed(1)}×${x.height.toFixed(1)}`).join(' | ')}`);
}

async function verifyWorkspaceSubmenus(page,viewportName){
  await openNavigator(page);
  const filters=page.locator('.r105-workspace-filter button');
  const count=await filters.count();
  if(count!==7)throw new Error(`${viewportName}: expected ALL + six workspace submenu controls, received ${count}`);
  const labels=(await filters.allTextContents()).map(x=>x.replace(/\s+/g,' ').trim());
  if(!labels[0]?.startsWith('ALL'))throw new Error(`${viewportName}: workspace submenu must begin with ALL, received ${labels[0]||'missing'}`);
  for(let i=0;i<count;i++){
    const button=filters.nth(i);
    await button.scrollIntoViewIfNeeded();
    await button.click({timeout:10000});
    await page.waitForFunction(index=>{
      const buttons=[...document.querySelectorAll('.r105-workspace-filter button')];
      return buttons[index]?.classList.contains('active')===true;
    },i,{timeout:10000});
    const visibleRoutes=await page.locator('.r89-flat-route:visible').count();
    if(visibleRoutes<1)throw new Error(`${viewportName}: workspace submenu ${labels[i]} produced no reachable routes`);
  }
  await filters.first().click();
  await page.waitForFunction(()=>document.querySelector('.r105-workspace-filter button')?.classList.contains('active')===true,{timeout:10000});
  const allRoutes=await page.locator('.r89-flat-route:visible').count();
  if(allRoutes!==44)throw new Error(`${viewportName}: ALL workspace submenu did not restore 44 routes; received ${allRoutes}`);
}

async function clickRoute(page,route){
  await openNavigator(page);
  const buttons=page.locator('.r89-flat-route');
  const count=await buttons.count();
  let hit=-1;
  for(let i=0;i<count;i++){
    const label=(await buttons.nth(i).locator('b').first().textContent().catch(()=>''))?.trim();
    if(label===route){hit=i;break}
  }
  if(hit<0)throw new Error(`R286/R304 route button missing: ${route}`);
  const button=buttons.nth(hit);
  await button.scrollIntoViewIfNeeded();
  await button.click({timeout:10000});
  await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,route,{timeout:20000});
  await page.waitForFunction(()=>{
    const main=document.querySelector('.workstation-main');
    if(!main)return false;
    const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
    const children=[...main.children].filter(visible);
    const rich=[...main.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible);
    return children.length>0&&(((main.textContent||'').replace(/\s+/g,' ').trim().length>=8)||rich.length>0);
  },{timeout:20000});
}

function usableSnapshot(){
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
  const main=document.querySelector('.workstation-main');
  const rect=main?.getBoundingClientRect();
  const buttons=[...document.querySelectorAll('.workstation-main button')].filter(visible);
  const unusable=buttons.filter(b=>{const r=b.getBoundingClientRect();return !b.disabled&&(r.width<8||r.height<8||getComputedStyle(b).pointerEvents==='none')}).map(b=>(b.textContent||b.getAttribute('aria-label')||'unnamed').trim().slice(0,80));
  const visibleChildren=main?[...main.children].filter(visible).length:0;
  const textLength=(main?.textContent||'').replace(/\s+/g,' ').trim().length;
  const richVisible=main?[...main.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible).length:0;
  return{width:rect?.width||0,height:rect?.height||0,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,visibleButtons:buttons.length,unusable,visibleChildren,textLength,richVisible};
}

async function verifySarGeometry(page,viewportName){
  const sar=await page.evaluate(()=>{
    const grid=document.querySelector('.sar-r280 .r280-canvas');
    if(!grid)return null;
    const style=getComputedStyle(grid);
    const cols=style.gridTemplateColumns.split(/\s+/).filter(Boolean).length;
    const rows=style.gridTemplateRows.split(/\s+/).filter(Boolean).length;
    return{cols,rows,cells:grid.children.length};
  });
  if(!sar)throw new Error(`${viewportName}/SAR Truth: canonical SAR canvas missing`);
  if(sar.cols!==78||sar.rows!==78||sar.cells!==6084)throw new Error(`${viewportName}/SAR Truth: geometry mismatch ${JSON.stringify(sar)}`);
}

const browser=await chromium.launch({headless:true});
try{
  for(const [name,contextOptions] of profiles){
    const context=await browser.newContext(contextOptions);
    const page=await context.newPage();
    const pageErrors=[];
    page.on('pageerror',e=>pageErrors.push(String(e)));
    await page.goto(`${base}/?r304=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
    await openNavigator(page);
    await verifyNavigatorModeTouchTargets(page,name);
    await verifyWorkspaceSubmenus(page,name);
    const navLabels=(await page.locator('.r89-flat-route b').allTextContents()).map(x=>x.trim()).filter(Boolean);
    const unique=[...new Set(navLabels)];
    if(unique.length!==44)throw new Error(`${name}: expected 44 unique route controls, received ${unique.length}`);
    for(const route of expected)if(!unique.includes(route))throw new Error(`${name}: navigator omitted canonical route ${route}`);

    for(const route of expected){
      await clickRoute(page,route);
      const snap=await page.evaluate(usableSnapshot);
      if(snap.width<220||snap.height<80)throw new Error(`${name}/${route}: workstation unusable ${JSON.stringify(snap)}`);
      if(snap.overflow>24)throw new Error(`${name}/${route}: viewport overflow ${snap.overflow}px`);
      if(snap.unusable.length)throw new Error(`${name}/${route}: visible enabled controls are non-interactive ${snap.unusable.join(' | ')}`);
      if(snap.visibleChildren<1||(snap.textLength<8&&snap.richVisible<1))throw new Error(`${name}/${route}: no visible route content mounted ${JSON.stringify(snap)}`);
      if(route==='SAR Truth')await verifySarGeometry(page,name);
    }

    await openNavigator(page);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});
    await openNavigator(page);

    if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ').slice(0,3000)}`);
    await context.close();
  }
  console.log('R286/R304 ALL-SURFACE BROWSER PASS · mobile navigator-mode controls browser-proven at >=44×44px under coarse-pointer emulation · ALL + six contextual workspace submenus pointer-verified · 44/44 canonical route buttons pointer-clicked on desktop + 390px touch mobile · exact data-panel transitions · route-agnostic visible-content proof · enabled control hit geometry · no material viewport overflow · navigator Escape/reopen proof · exact 78×78/6084-cell SAR geometry · no page errors.');
}finally{await browser.close()}
