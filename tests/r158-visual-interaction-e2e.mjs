import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const visualRoutes=['Relativity','Data Motion','Field','Visual Instrument','Convergence','Matter Traversal','Atlas','Reality Lab'];
const visible=async locator=>locator.count()&&locator.first().isVisible();

async function openRoute(page,route){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count()&&await expand.first().isVisible())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000}).catch(()=>{});
 const ok=await page.evaluate(route=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()===route);
  if(!button)return false;
  button.click();
  return true;
 },route);
 if(!ok)throw new Error(`R158 route control missing: ${route}`);
 await page.waitForFunction(route=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===route,route,{timeout:20000});
 await page.waitForFunction(()=>![...document.querySelectorAll('.omega-surface-r81 .r109-specialist-loading,.omega-surface-r81 .boot')].some(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden'&&/LOADING|PREPARING|BOOT|MATERIALIZING/i.test(el.textContent||'')}),{timeout:20000}).catch(()=>{});
}

function intersection(a,b){
 const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
 const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
 return w*h;
}

async function globalVisualIntegrity(page,route,viewportName){
 const result=await page.evaluate(({route,viewportName})=>{
  const root=document.querySelector('.omega-workstation-v2');
  const main=document.querySelector('.workstation-main');
  const surface=root?.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(route)}"]`)||root?.querySelector('.omega-surface-r81');
  const isVisible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0};
  const visual=[...(surface?.querySelectorAll('canvas,svg,[data-omega-visual-output="true"]')||[])].filter(isVisible).sort((a,b)=>{const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return br.width*br.height-ar.width*ar.height})[0];
  const rect=x=>{const r=x?.getBoundingClientRect();return r?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}:null};
  const controls=[...document.querySelectorAll('.r94-nav-rail,.r94-nav-panel,.workstation-topbar')].filter(isVisible).map(el=>({className:el.className,rect:rect(el)}));
  return{viewportName,route,panel:root?.getAttribute('data-panel')||'',main:rect(main),visual:rect(visual),controls,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth};
 },{route,viewportName});
 if(result.panel!==route)throw new Error(`${viewportName} ${route}: active panel mismatch`);
 if(!result.main||result.main.width<220)throw new Error(`${viewportName} ${route}: working surface collapsed to ${result.main?.width||0}px`);
 if(result.overflow>8)throw new Error(`${viewportName} ${route}: viewport overflow ${result.overflow}px`);
 if(!result.visual||result.visual.width<180||result.visual.height<120)throw new Error(`${viewportName} ${route}: no usable visual output ${JSON.stringify(result.visual)}`);
 for(const c of result.controls){if(!c.rect)continue;const area=intersection(result.visual,c.rect);if(area>1)throw new Error(`${viewportName} ${route}: global control ${c.className} covers ${area.toFixed(1)}px² of visual output`)}
}

async function r158RelativityIntegrity(page,viewportName){
 await openRoute(page,'Relativity');
 await page.waitForSelector('.capu158-stage canvas',{state:'visible',timeout:30000});
 const geometry=await page.evaluate(()=>{
  const stage=document.querySelector('.capu158-stage');
  const rect=el=>{const r=el.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
  const isVisible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>1&&r.height>1&&s.display!=='none'&&s.visibility!=='hidden'};
  const stageRect=rect(stage);
  const selectors=['.capu158>header','.capu158-scenes','.capu158-controls','.capu158-kpis','.capu158-inspector','.capu158-resolution-strip','.capu158>footer'];
  const controls=selectors.flatMap(sel=>[...document.querySelectorAll(sel)]).filter(isVisible).map(el=>({sel:el.className||el.tagName,rect:rect(el)}));
  return{stage:stageRect,controls,focusPosition:getComputedStyle(document.querySelector('.capu158')).position,labelVisible:isVisible(document.querySelector('.capu158-stage-label'))};
 });
 if(geometry.stage.width<220||geometry.stage.height<360)throw new Error(`${viewportName}: R158 stage unusable ${JSON.stringify(geometry.stage)}`);
 for(const c of geometry.controls){const area=intersection(geometry.stage,c.rect);if(area>1)throw new Error(`${viewportName}: R158 control ${c.sel} covers ${area.toFixed(1)}px² of protected output`)}
 if(geometry.labelVisible)throw new Error(`${viewportName}: legacy stage label still covers the output plane`);

 const immersive=page.getByRole('button',{name:/Immersive/});
 if(await immersive.count()){await immersive.first().click();await page.waitForTimeout(150);const position=await page.locator('.capu158').evaluate(el=>getComputedStyle(el).position);if(position==='fixed')throw new Error(`${viewportName}: focus/immersive mode became a fixed covering overlay`)}

 await page.locator('.capu158-stage').scrollIntoViewIfNeeded();
 const stage=page.locator('.capu158-stage');
 const box=await stage.boundingBox();
 if(!box)throw new Error(`${viewportName}: R158 stage bounding box unavailable`);
 await page.mouse.move(box.x+Math.min(box.width-12,Math.max(12,box.width*.5)),box.y+Math.min(box.height-12,Math.max(12,box.height*.5)));
 const before=await page.evaluate(()=>window.scrollY);
 await page.mouse.wheel(0,420);
 await page.waitForTimeout(120);
 const after=await page.evaluate(()=>window.scrollY);
 if(after<=before)throw new Error(`${viewportName}: ordinary wheel input is trapped by the visual instead of scrolling the document`);

 await stage.scrollIntoViewIfNeeded();
 const zoomBefore=await page.locator('.capu158-controls label').filter({hasText:'Camera zoom'}).locator('input').inputValue();
 await page.keyboard.down(process.platform==='darwin'?'Meta':'Control');
 const box2=await stage.boundingBox();if(box2)await page.mouse.move(box2.x+box2.width*.5,box2.y+box2.height*.5);
 await page.mouse.wheel(0,-160);
 await page.keyboard.up(process.platform==='darwin'?'Meta':'Control');
 await page.waitForTimeout(120);
 const zoomAfter=await page.locator('.capu158-controls label').filter({hasText:'Camera zoom'}).locator('input').inputValue();
 if(Number(zoomAfter)<=Number(zoomBefore))throw new Error(`${viewportName}: deliberate Ctrl/Cmd+wheel zoom did not change the capability universe`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of viewports){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  for(const route of visualRoutes){await openRoute(page,route);await globalVisualIntegrity(page,route,name)}
  await r158RelativityIntegrity(page,name);
  if(pageErrors.length)throw new Error(`${name}: browser errors ${pageErrors.join(' | ').slice(0,2400)}`);
  await context.close();
 }
 console.log('R158 VISUAL INTERACTION PASS · protected output planes · controls and global navigation non-overlapping · desktop/mobile operational floor retained · document wheel scroll preserved · deliberate modified-wheel zoom retained');
}finally{await browser.close()}
