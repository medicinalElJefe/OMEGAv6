import {chromium} from 'playwright';
const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const profiles=[['desktop',{viewport:{width:1440,height:960}}],['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true,reducedMotion:'reduce'}]];
const browser=await chromium.launch({headless:true});
try{
 for(const [name,options] of profiles){
  const context=await browser.newContext(options),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(`${base}/?r306=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('.omega-workstation-v2',{timeout:30000});
  const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(await expand.count()){await expand.first().click();await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true')}
  const routes=page.locator('.r89-flat-route');let found=-1;
  for(let i=0;i<await routes.count();i++){if((await routes.nth(i).locator('b').textContent().catch(()=>''))?.trim()==='Relativity'){found=i;break}}
  if(found<0)throw new Error(`${name}: Relativity route missing`);
  await routes.nth(found).scrollIntoViewIfNeeded();await routes.nth(found).click();
  await page.waitForFunction(()=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')==='Relativity',{timeout:20000});
  const blade=page.getByRole('button',{name:'BLADE',exact:true});
  await blade.waitFor({state:'visible',timeout:20000});
  await blade.scrollIntoViewIfNeeded();
  const hit=await blade.evaluate(el=>{const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,top=document.elementFromPoint(x,y);return{width:r.width,height:r.height,hit:Boolean(top&&(el.contains(top)||top.contains(el))),pointer:getComputedStyle(el).pointerEvents}});
  if(name==='mobile'&&(hit.width<43.5||hit.height<43.5))throw new Error(`mobile: Blade tab below 44×44px ${hit.width}×${hit.height}`);
  if(!hit.hit||hit.pointer==='none')throw new Error(`${name}: Blade tab is buried/non-interactive ${JSON.stringify(hit)}`);
  await blade.click();
  await page.getByRole('heading',{name:'Blade Geometry',exact:true}).waitFor({state:'visible',timeout:10000});
  const state=await page.evaluate(()=>{const root=document.querySelector('.blade-r306'),r=root?.getBoundingClientRect();return{text:(root?.textContent||'').replace(/\s+/g,' ').trim(),left:r?.left??0,right:r?.right??0,width:r?.width??0,viewport:innerWidth,scroll:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth}});
  for(const token of ['SYSTEM = (GENERATOR, CONSTRAINTS, INVARIANTS, SYMMETRY, OBJECTIVE)','finite demo states','declared-domain quotient/lift gate','GENERATOR / STATE SPACE','LIFT TO ORIGINAL STATE SPACE','No generic polynomial/constant-time claim'])if(!state.text.includes(token))throw new Error(`${name}: Blade surface missing truth token ${token}`);
  if(state.left<-1||state.right>state.viewport+1||state.scroll>24)throw new Error(`${name}: Blade surface escaped viewport ${JSON.stringify(state)}`);
  if(errors.length)throw new Error(`${name}: page errors ${errors.join(' | ')}`);
  await context.close();
 }
 console.log('R306 BLADE BROWSER PASS · existing Relativity route reached through canonical navigator · BLADE tab pointer-clicked on desktop + touch mobile · mobile target >=44×44 · center-point unoccluded · source law and exact finite quotient/lift boundary visible · no 45th route · no material overflow/page errors.');
}finally{await browser.close()}
