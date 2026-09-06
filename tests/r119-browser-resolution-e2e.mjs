import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const ROUTES=['Matter Traversal','Traversal','Convergence','System Atlas'];

async function routeDiagnostics(page){
 return page.evaluate(()=>({
  panel:document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')||'',
  expanded:document.documentElement.dataset.omegaNavExpanded||'',
  boot:[...document.querySelectorAll('.boot')].map(x=>(x.textContent||'').trim()).filter(Boolean).slice(0,8),
  canvases:[...document.querySelectorAll('canvas')].map(c=>({label:c.getAttribute('aria-label')||'',r:c.dataset.omegaResolution||'',p:c.dataset.omegaResolutionProfile||'',logical:c.dataset.omegaLogicalAnchors||'',virtual:c.dataset.omegaVirtualAddresses||'',backing:c.dataset.omegaBackingPixels||'',w:c.width,h:c.height})).slice(0,20)
 }));
}

async function openRoute(page,route){
 const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(await expand.count())await expand.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
 const found=await page.evaluate(route=>{
  const buttons=[...document.querySelectorAll('.r89-flat-route')];
  const button=buttons.find(x=>x.querySelector('b')?.textContent?.trim()===route);
  if(!button)return false;button.click();return true;
 },route);
 if(!found)throw new Error(`route button missing ${route} · ${JSON.stringify(await routeDiagnostics(page))}`);
 await page.waitForFunction(route=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===route,route,{timeout:20000});
 await page.waitForFunction(route=>{
  const root=document.querySelector('.omega-workstation-v2');
  if(!root||root.getAttribute('data-panel')!==route)return false;
  const surface=root.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(route)}"]`)||root.querySelector('.omega-surface-r81');
  if(!surface)return false;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const loading=[...surface.querySelectorAll('.r109-specialist-loading,.boot')].some(x=>visible(x)&&/LOADING|PREPARING|BOOT|MATERIALIZING/i.test(x.textContent||''));
  return !loading;
 },route,{timeout:20000});
}

async function assertR119Canvas(page,scope='body'){
 const result=await page.evaluate(scope=>{
  const root=document.querySelector(scope)||document.body;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>=180&&r.height>=120};
  return [...root.querySelectorAll('canvas')].filter(visible).map(c=>{const r=c.getBoundingClientRect();return{label:c.getAttribute('aria-label')||'',cssW:r.width,cssH:r.height,w:c.width,h:c.height,resolution:c.dataset.omegaResolution||'',profile:c.dataset.omegaResolutionProfile||'',logical:c.dataset.omegaLogicalAnchors||'',virtual:c.dataset.omegaVirtualAddresses||'',backing:Number(c.dataset.omegaBackingPixels||0)}});
 },scope);
 const r119=result.find(x=>x.resolution==='R119');
 if(!r119)throw new Error(`no visible R119 canvas in ${scope} · ${JSON.stringify(result).slice(0,1800)}`);
 if(r119.logical!=='20736'||r119.virtual!=='61917364224')throw new Error(`R119 logical/virtual metadata mismatch · ${JSON.stringify(r119)}`);
 if(r119.w<Math.round(r119.cssW)||r119.h<Math.round(r119.cssH))throw new Error(`R119 backing surface lower than CSS surface · ${JSON.stringify(r119)}`);
 if(r119.backing<=0||r119.backing>16_000_000)throw new Error(`R119 backing budget violation · ${JSON.stringify(r119)}`);
 return r119;
}

async function runViewport(browser,name,viewport,deviceScaleFactor){
 const context=await browser.newContext({viewport,deviceScaleFactor});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('main.r71-home',{timeout:30000});
 const home=await assertR119Canvas(page,'.r71-home');
 console.log(`R119 ${name} HOME · ${home.profile} · ${home.w}x${home.h} backing · ${home.backing} pixels`);
 for(const route of ROUTES){
  await openRoute(page,route);
  if(route==='System Atlas'){
   await page.waitForFunction(()=>/R119 CORPUS \+ SITES \+ MODES \+ RESOLUTION/.test(document.querySelector('.omega-surface-r81')?.textContent||''),{timeout:12000});
   await page.evaluate(()=>{const d=document.querySelector('.r119-ultra-mount');if(d)d.setAttribute('open','')});
   await page.waitForFunction(()=>/One machine from the complete corpus/.test(document.querySelector('.r119-ultra-fabric')?.textContent||''),{timeout:8000});
   const txt=await page.locator('.r119-ultra-fabric').innerText();
   for(const token of ['100','24','179','62','Four-role federation','Truth class travels with every output'])if(!txt.includes(token))throw new Error(`${name} System Atlas missing R119 corpus token ${token}`);
  }else{
   const canvas=await assertR119Canvas(page,'.omega-surface-r81');
   console.log(`R119 ${name} ${route} · ${canvas.profile} · ${canvas.w}x${canvas.h} backing · ${canvas.backing} pixels`);
  }
 }
 const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-window.innerWidth);
 if(overflow>8)throw new Error(`${name} horizontal overflow ${overflow}px`);
 if(errors.length)throw new Error(`${name} browser errors: ${errors.join(' | ').slice(0,2200)}`);
 await context.close();
}

const browser=await chromium.launch({headless:true});
try{
 await runViewport(browser,'desktop-hiDPI',{width:1440,height:960},3);
 await runViewport(browser,'mobile-hiDPI',{width:390,height:844},3);
 console.log('R119 BROWSER RESOLUTION PASS · Home + Matter + Traversal + Convergence + System Atlas · desktop/mobile high-DPI · bounded backing pixels · 20,736 logical anchors preserved');
}finally{await browser.close()}
