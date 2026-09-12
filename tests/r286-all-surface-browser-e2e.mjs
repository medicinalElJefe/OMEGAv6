import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const expected=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(expected.length===0||new Set(expected).size!==expected.length)throw new Error(`R286/R305 expected a non-empty unique canonical surface inventory, received ${expected.length}/${new Set(expected).size}`);

const profiles=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false,reducedMotion:'no-preference'}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'}],
];

async function waitForNavigatorSettled(page){
 await page.waitForFunction(()=>{
  if(document.documentElement.dataset.omegaNavExpanded!=='true')return false;
  const rail=document.querySelector('.r94-nav-rail'),panel=document.querySelector('.r94-nav-panel');
  if(!rail||!panel)return false;
  const rr=rail.getBoundingClientRect(),pr=panel.getBoundingClientRect(),style=getComputedStyle(panel);
  return style.visibility!=='hidden'&&style.pointerEvents!=='none'&&Number(style.opacity)>=.99&&Math.abs(pr.left-rr.right)<=1&&Math.abs(pr.top-rr.top)<=1;
 },{timeout:10000});
}

async function openNavigator(page){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true')){await waitForNavigatorSettled(page);return}
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(!await expand.count())throw new Error('R286/R305 global navigator expand control missing');
 await expand.first().scrollIntoViewIfNeeded();await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
 await waitForNavigatorSettled(page);
}

async function verifyR305InteractionEnvelope(page,viewportName){
 const state=await page.evaluate(()=>{
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
  const centerHit=el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||x>=innerWidth||y<0||y>=innerHeight)return null;for(let a=el.parentElement;a&&a!==document.documentElement;a=a.parentElement){const s=getComputedStyle(a),ar=a.getBoundingClientRect(),clipsX=/(auto|scroll|hidden|clip)/.test(s.overflowX),clipsY=/(auto|scroll|hidden|clip)/.test(s.overflowY);if((clipsX&&(x<ar.left||x>ar.right))||(clipsY&&(y<ar.top||y>ar.bottom)))return null}return{x,y,hit:document.elementFromPoint(x,y),rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}}};
  const coarse=matchMedia('(any-pointer: coarse)').matches,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targetElements=[...document.querySelectorAll('.r88-head-actions button,.r89-nav-mode button,.r94-rail-action,.r89-flat-route')].filter(visible);
  const targets=targetElements.map(el=>{const r=el.getBoundingClientRect();return{label:(el.textContent||el.getAttribute('aria-label')||el.className||'unnamed').replace(/\s+/g,' ').trim().slice(0,80),width:r.width,height:r.height}});
  const undersized=coarse?targets.filter(x=>x.height<43.5||x.width<43.5):[];
  const buriedTargets=targetElements.map(el=>({el,point:centerHit(el)})).filter(({el,point})=>Boolean(point?.hit&&!el.contains(point.hit)&&!point.hit.contains(el))).map(({el,point})=>`${(el.textContent||el.getAttribute('aria-label')||el.className||'unnamed').replace(/\s+/g,' ').trim().slice(0,64)} <- ${(point.hit?.textContent||point.hit?.getAttribute?.('aria-label')||point.hit?.className||point.hit?.tagName||'unknown').toString().replace(/\s+/g,' ').trim().slice(0,64)} @ ${point.rect.left.toFixed(1)},${point.rect.top.toFixed(1)}-${point.rect.right.toFixed(1)},${point.rect.bottom.toFixed(1)}`);
  const modeButtons=[...document.querySelectorAll('.r89-nav-mode button')].filter(visible).map(el=>{const r=el.getBoundingClientRect();return{label:(el.textContent||'').replace(/\s+/g,' ').trim(),width:r.width,height:r.height}});
  const route=document.querySelector('.r89-flat-route'),style=route?getComputedStyle(route):null,main=document.querySelector('.workstation-main'),r=main?.getBoundingClientRect(),rail=document.querySelector('.r94-nav-rail'),panel=document.querySelector('.r94-nav-panel');
  const z=el=>{if(!el)return 0;const value=getComputedStyle(el).zIndex;return value==='auto'?0:(Number(value)||0)};
  return{coarse,reduced,targetCount:targets.length,undersized,buriedTargets,modeButtons,railZ:z(rail),panelZ:z(panel),transitionDuration:style?.transitionDuration||'',animationDuration:style?.animationDuration||'',mainRect:r?{left:r.left,right:r.right,width:r.width}:null,viewportWidth:innerWidth};
 });
 if(!(state.railZ>state.panelZ))throw new Error(`${viewportName}: R305 persistent rail must remain above expanded panel in the internal navigator stack ${JSON.stringify({railZ:state.railZ,panelZ:state.panelZ})}`);
 if(state.buriedTargets.length)throw new Error(`${viewportName}: R305 expanded navigator controls are geometrically buried by another layer ${state.buriedTargets.join(' | ')}`);
 if(viewportName==='mobile'){
  if(state.coarse!==true)throw new Error(`mobile: R305 expected coarse-pointer emulation, received ${JSON.stringify(state)}`);
  if(state.reduced!==true)throw new Error(`mobile: R305 expected reduced-motion emulation, received ${JSON.stringify(state)}`);
  if(state.modeButtons.length!==2)throw new Error(`mobile: R305 expected two navigator-mode controls, received ${state.modeButtons.length}`);
  if(state.targetCount<1)throw new Error('mobile: R305 no navigator interaction targets were measurable');
  if(state.undersized.length)throw new Error(`mobile: R305 coarse-pointer navigator targets below 44px: ${state.undersized.map(x=>`${x.label} ${x.width.toFixed(1)}×${x.height.toFixed(1)}`).join(' | ')}`);
  if(state.transitionDuration&&state.transitionDuration!=='0s')throw new Error(`mobile: R305 reduced-motion navigator transition remained active: ${state.transitionDuration}`);
  if(state.animationDuration&&state.animationDuration!=='0s')throw new Error(`mobile: R305 reduced-motion navigator animation remained active: ${state.animationDuration}`);
 }
 if(state.mainRect&&(state.mainRect.left<-1||state.mainRect.right>state.viewportWidth+1))throw new Error(`${viewportName}: R305 active workstation escaped horizontal viewport containment ${JSON.stringify(state.mainRect)} / ${state.viewportWidth}`);
}

async function verifyWorkspaceSubmenus(page,viewportName){
 await openNavigator(page);const filters=page.locator('.r105-workspace-filter button'),count=await filters.count();
 if(count!==7)throw new Error(`${viewportName}: expected ALL + six workspace submenu controls, received ${count}`);
 const labels=(await filters.allTextContents()).map(x=>x.replace(/\s+/g,' ').trim());
 if(!labels[0]?.startsWith('ALL'))throw new Error(`${viewportName}: workspace submenu must begin with ALL, received ${labels[0]||'missing'}`);
 for(let i=0;i<count;i++){
  const button=filters.nth(i);await button.scrollIntoViewIfNeeded();await button.click({timeout:10000});
  await page.waitForFunction(index=>[...document.querySelectorAll('.r105-workspace-filter button')][index]?.classList.contains('active')===true,i,{timeout:10000});
  if(await page.locator('.r89-flat-route:visible').count()<1)throw new Error(`${viewportName}: workspace submenu ${labels[i]} produced no reachable routes`);
 }
 await filters.first().click();await page.waitForFunction(()=>document.querySelector('.r105-workspace-filter button')?.classList.contains('active')===true,{timeout:10000});
 const allRoutes=await page.locator('.r89-flat-route:visible').count();if(allRoutes!==expected.length)throw new Error(`${viewportName}: ALL workspace submenu did not restore the full dynamic route inventory; expected ${expected.length}, received ${allRoutes}`);
}

async function verifyReachabilityFabric(page,viewportName){
 await openNavigator(page);
 const systemMode=page.locator('.r89-nav-mode button').filter({hasText:'System map'}).first();
 if(!await systemMode.count())throw new Error(`${viewportName}: R305 System map navigator mode missing`);
 await systemMode.scrollIntoViewIfNeeded();await systemMode.click({timeout:10000});
 const audit=page.locator('.r83-inventory[data-reachability-revision="R305"]');
 await audit.waitFor({state:'visible',timeout:10000});
 const state=await audit.evaluate(el=>({pass:el.getAttribute('data-reachability-pass'),residuals:Number(el.getAttribute('data-reachability-residual-count')||'-1')}));
 if(state.pass!=='true'||state.residuals!==0)throw new Error(`${viewportName}: R305 no-burial reachability audit not clean ${JSON.stringify(state)}`);
 const allMode=page.locator('.r89-nav-mode button').filter({hasText:'All tools'}).first();
 await allMode.click({timeout:10000});
 await page.locator('.r89-flat-route:visible').first().waitFor({state:'visible',timeout:10000});
}

async function clickRoute(page,route){
 await openNavigator(page);const buttons=page.locator('.r89-flat-route');let hit=-1;
 for(let i=0;i<await buttons.count();i++){if((await buttons.nth(i).locator('b').first().textContent().catch(()=>''))?.trim()===route){hit=i;break}}
 if(hit<0)throw new Error(`R286/R305 route button missing: ${route}`);
 const button=buttons.nth(hit);await button.scrollIntoViewIfNeeded();await button.click({timeout:10000});
 await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,route,{timeout:20000});
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});
 await page.waitForFunction(()=>{
  const main=document.querySelector('.workstation-main');if(!main)return false;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const children=[...main.children].filter(visible),rich=[...main.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible);
  return children.length>0&&(((main.textContent||'').replace(/\s+/g,' ').trim().length>=8)||rich.length>0);
 },{timeout:20000});
}

function usableSnapshot(){
 const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
 const centerHit=el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||x>=innerWidth||y<0||y>=innerHeight)return null;for(let a=el.parentElement;a&&a!==document.documentElement;a=a.parentElement){const s=getComputedStyle(a),ar=a.getBoundingClientRect(),clipsX=/(auto|scroll|hidden|clip)/.test(s.overflowX),clipsY=/(auto|scroll|hidden|clip)/.test(s.overflowY);if((clipsX&&(x<ar.left||x>ar.right))||(clipsY&&(y<ar.top||y>ar.bottom)))return null}return{x,y,hit:document.elementFromPoint(x,y)}};
 const main=document.querySelector('.workstation-main'),rect=main?.getBoundingClientRect(),coarse=matchMedia('(any-pointer: coarse)').matches;
 const buttons=[...document.querySelectorAll('.workstation-main button')].filter(visible);
 const actions=[...document.querySelectorAll('.workstation-main button:not([disabled]),.workstation-main [role="button"]')].filter(visible);
 const forms=[...document.querySelectorAll('.workstation-main input:not([disabled]),.workstation-main select:not([disabled]),.workstation-main textarea:not([disabled])')].filter(visible);
 const interactives=[...new Set([...actions,...forms])];
 const unusable=buttons.filter(b=>{const r=b.getBoundingClientRect();return !b.disabled&&(r.width<8||r.height<8||getComputedStyle(b).pointerEvents==='none')}).map(b=>(b.textContent||b.getAttribute('aria-label')||'unnamed').trim().slice(0,80));
 const undersizedTouchActions=coarse?actions.filter(el=>{const r=el.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(el=>{const r=el.getBoundingClientRect();return`${(el.textContent||el.getAttribute('aria-label')||el.tagName).replace(/\s+/g,' ').trim().slice(0,64)} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`}):[];
 const undersizedTouchForms=coarse?forms.filter(el=>el.getBoundingClientRect().height<43.5).map(el=>{const r=el.getBoundingClientRect();return`${(el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.tagName).replace(/\s+/g,' ').trim().slice(0,64)} ${r.width.toFixed(1)}×${r.height.toFixed(1)}`}):[];
 const buried=interactives.map(el=>({el,point:centerHit(el)})).filter(({el,point})=>Boolean(point?.hit&&!el.contains(point.hit)&&!point.hit.contains(el))).map(({el,point})=>{const label=(el.textContent||el.getAttribute('aria-label')||el.getAttribute('placeholder')||el.tagName).replace(/\s+/g,' ').trim().slice(0,64),blocker=(point.hit?.textContent||point.hit?.getAttribute?.('aria-label')||point.hit?.className||point.hit?.tagName||'unknown').toString().replace(/\s+/g,' ').trim().slice(0,64);return`${label} <- ${blocker}`});
 const visibleChildren=main?[...main.children].filter(visible).length:0,textLength=(main?.textContent||'').replace(/\s+/g,' ').trim().length,richVisible=main?[...main.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible).length:0;
 return{mainPresent:Boolean(main&&rect),left:rect?.left??null,right:rect?.right??null,viewportWidth:innerWidth,width:rect?.width||0,height:rect?.height||0,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,visibleButtons:buttons.length,unusable,undersizedTouchActions,undersizedTouchForms,buried,coarse,visibleChildren,textLength,richVisible};
}

async function verifySarGeometry(page,viewportName){
 const sar=await page.evaluate(()=>{const grid=document.querySelector('.sar-r280 .r280-canvas');if(!grid)return null;const style=getComputedStyle(grid);return{cols:style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,rows:style.gridTemplateRows.split(/\s+/).filter(Boolean).length,cells:grid.children.length}});
 if(!sar)throw new Error(`${viewportName}/SAR Truth: canonical SAR canvas missing`);if(sar.cols!==78||sar.rows!==78||sar.cells!==6084)throw new Error(`${viewportName}/SAR Truth: geometry mismatch ${JSON.stringify(sar)}`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,contextOptions] of profiles){
  const context=await browser.newContext(contextOptions),page=await context.newPage(),pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(`${base}/?r305=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  await openNavigator(page);await verifyR305InteractionEnvelope(page,name);await verifyWorkspaceSubmenus(page,name);await verifyReachabilityFabric(page,name);await verifyR305InteractionEnvelope(page,name);
  const navLabels=(await page.locator('.r89-flat-route b').allTextContents()).map(x=>x.trim()).filter(Boolean),unique=[...new Set(navLabels)];
  if(unique.length!==expected.length)throw new Error(`${name}: expected ${expected.length} unique current route controls, received ${unique.length}`);for(const route of expected)if(!unique.includes(route))throw new Error(`${name}: navigator omitted canonical route ${route}`);
  for(const route of expected){
   await clickRoute(page,route);const snap=await page.evaluate(usableSnapshot);
   if(!snap.mainPresent||snap.left===null||snap.right===null||snap.left<-1||snap.right>snap.viewportWidth+1)throw new Error(`${name}/${route}: active workstation escaped horizontal viewport containment ${JSON.stringify({left:snap.left,right:snap.right,width:snap.width})} / ${snap.viewportWidth}`);
   if(snap.width<220||snap.height<80)throw new Error(`${name}/${route}: workstation unusable ${JSON.stringify(snap)}`);
   if(snap.overflow>24)throw new Error(`${name}/${route}: viewport overflow ${snap.overflow}px`);
   if(snap.unusable.length)throw new Error(`${name}/${route}: visible enabled controls are non-interactive ${snap.unusable.join(' | ')}`);
   if(name==='mobile'&&snap.undersizedTouchActions.length)throw new Error(`${name}/${route}: coarse-pointer action controls below 44×44px ${snap.undersizedTouchActions.join(' | ')}`);
   if(name==='mobile'&&snap.undersizedTouchForms.length)throw new Error(`${name}/${route}: coarse-pointer form controls below 44px high ${snap.undersizedTouchForms.join(' | ')}`);
   if(snap.buried.length)throw new Error(`${name}/${route}: visible interactive controls are geometrically buried by another layer ${snap.buried.join(' | ')}`);
   if(snap.visibleChildren<1||(snap.textLength<8&&snap.richVisible<1))throw new Error(`${name}/${route}: no visible route content mounted ${JSON.stringify(snap)}`);
   if(route==='SAR Truth')await verifySarGeometry(page,name);
  }
  await openNavigator(page);await verifyR305InteractionEnvelope(page,name);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});await openNavigator(page);await verifyR305InteractionEnvelope(page,name);
  if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ').slice(0,3000)}`);await context.close();
 }
 console.log(`R286/R305 ALL-SURFACE BROWSER PASS · expanded-panel settle proof · explicit rail-over-panel interaction stack · clipping-aware unclamped center-point occlusion proof · R304 direct-selector specificity preserved · expanded navigator center-point occlusion-proved against global world layers · R305 cross-ledger no-burial reachability audit clean · ALL + six contextual workspace submenus pointer-verified · ${expected.length}/${expected.length} current canonical routes derived dynamically and pointer-clicked on desktop + 390px 2×DPR touch/coarse mobile · every activated workstation horizontally contained · active-workspace controls proved after route collapse · coarse-pointer 44×44 action + 44px-high form-control proof · reduced-motion navigator proof · exact data-panel transitions · visible-content proof · SAR geometry retained when registered · Escape/reopen · no page errors · no historical route-count ceiling.`);
}finally{await browser.close()}