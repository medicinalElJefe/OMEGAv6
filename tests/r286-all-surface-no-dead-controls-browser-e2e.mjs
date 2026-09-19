import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const expected=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(expected.length!==44||new Set(expected).size!==44)throw new Error(`R286/R313 expected 44 unique canonical surfaces, received ${expected.length}/${new Set(expected).size}`);

const profiles=[
  ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1}],
  ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];
const totals={desktop:0,mobile:0,disabledDesktop:0,disabledMobile:0,disclosuresDesktop:0,disclosuresMobile:0,panelsDesktop:0,panelsMobile:0};
const CONTROL_SELECTOR='button,[role="button"]';

async function twoFrames(page){
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function openNavigator(page){
  if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
  const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(!await expand.count())throw new Error('R286/R313 global navigator expand control missing');
  await expand.first().scrollIntoViewIfNeeded();
  await expand.first().click({timeout:10000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
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
    if(await page.locator('.r89-flat-route:visible').count()<1)throw new Error(`${viewportName}: workspace submenu ${labels[i]} produced no reachable routes`);
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
    const label=((await buttons.nth(i).locator('b').first().textContent().catch(()=>''))||'').trim();
    if(label===route){hit=i;break}
  }
  if(hit<0)throw new Error(`R286/R313 route button missing: ${route}`);
  const button=buttons.nth(hit);
  await button.scrollIntoViewIfNeeded();
  await button.click({timeout:10000});
  await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,route,{timeout:20000});
  await page.waitForFunction(name=>{
    const main=document.querySelector('.workstation-main');
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    if(!main||!surface)return false;
    const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
    const children=[...surface.children].filter(visible);
    const rich=[...surface.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible);
    const loader=[...surface.querySelectorAll('.r109-specialist-loading')].some(visible);
    return visible(surface)&&!loader&&!surface.querySelector('.panel-failure')&&children.length>0&&(((surface.textContent||'').replace(/\s+/g,' ').trim().length>=8)||rich.length>0);
  },route,{timeout:30000});
  // Command Center contains a deliberate staged header animation. Its controls are
  // stable well before this point, but the dedicated R313 diagnostic proves geometry
  // after a 250 ms presentation-settle interval. Match that product observation here
  // rather than racing the first staged repaint; other routes only need frame settlement.
  if(route==='Command Center')await page.waitForTimeout(300);else await twoFrames(page);
}

async function panelStructureAudit(page,route){
  return page.evaluate(name=>{
    const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    const failures=[];
    if(!surface)return{failures:['missing active SurfaceIntegrity root'],panelCount:0};
    if(!visible(surface))failures.push('active SurfaceIntegrity root is not visible');
    if(surface.querySelector('.panel-failure'))failures.push('PanelBoundary is rendering a failure surface');
    if([...surface.querySelectorAll('.r109-specialist-loading')].some(visible))failures.push('route-deferred specialist loader remained visible after panel readiness');
    const panels=[surface,...surface.querySelectorAll('section,aside,article,[role="region"],[role="dialog"],[role="tabpanel"]')].filter(visible);
    for(const panel of panels){
      const r=panel.getBoundingClientRect();
      if(![r.left,r.right,r.top,r.bottom,r.width,r.height].every(Number.isFinite))failures.push('visible panel returned non-finite geometry');
      if(r.width<8||r.height<8){const id=[panel.tagName.toLowerCase(),String(panel.className||'').trim().replace(/\s+/g,'.')].filter(Boolean).join('.');const parent=panel.parentElement?[panel.parentElement.tagName.toLowerCase(),String(panel.parentElement.className||'').trim().replace(/\s+/g,'.')].filter(Boolean).join('.'):'none';failures.push(`visible panel ${id||'unknown'} under ${parent} has unusable ${Math.round(r.width)}×${Math.round(r.height)} geometry`)};
    }
    for(const owner of surface.querySelectorAll('[aria-controls]')){
      const id=owner.getAttribute('aria-controls');
      if(id&&!document.getElementById(id))failures.push(`aria-controls target missing: ${id}`);
    }
    return{failures:[...new Set(failures)],panelCount:panels.length};
  },route);
}

async function inventoryControls(page,route){
  return page.evaluate(({name,selector})=>{
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    if(!surface)return[];
    const clean=el=>(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.getAttribute('value')||'').replace(/\s+/g,' ').trim();
    const rendered=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
    const occurrence=new Map();
    return [...surface.querySelectorAll(selector)].filter(rendered).map((el,index)=>{
      const tag=el.tagName.toLowerCase();
      const label=clean(el);
      const key=`${tag}\u0000${label}`;
      const nth=occurrence.get(key)||0;
      occurrence.set(key,nth+1);
      const id=`r313-control-${index}`;
      el.setAttribute('data-r313-control-probe',id);
      return{id,tag,label,nth};
    });
  },{name:route,selector:CONTROL_SELECTOR});
}

async function resolveProbe(page,route,probe){
  return page.evaluate(({name,probe,selector})=>{
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    if(!surface)return null;
    const clean=el=>(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.getAttribute('value')||'').replace(/\s+/g,' ').trim();
    const rendered=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
    let el=surface.querySelector(`[data-r313-control-probe="${CSS.escape(probe.id)}"]`);
    if(!el||!rendered(el)){
      const matches=[...surface.querySelectorAll(selector)].filter(rendered).filter(x=>x.tagName.toLowerCase()===probe.tag&&clean(x)===probe.label);
      el=matches[probe.nth]||null;
      if(el)el.setAttribute('data-r313-control-probe',probe.id);
    }
    if(!el)return null;
    const r=el.getBoundingClientRect();
    return{disabled:Boolean(el.disabled)||el.getAttribute('aria-disabled')==='true',pointer:getComputedStyle(el).pointerEvents,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}};
  },{name:route,probe,selector:CONTROL_SELECTOR});
}

async function actionContract(page,route,probe){
  return page.evaluate(({name,probe})=>{
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    const el=surface?.querySelector(`[data-r313-control-probe="${CSS.escape(probe.id)}"]`);
    if(!el)return{missing:true};
    const reactProps=node=>{for(const key of Object.getOwnPropertyNames(node))if(key.startsWith('__reactProps$'))return node[key]||{};return{}};
    const listenerBound=(node,type)=>typeof globalThis.__omegaR286HasListener==='function'&&globalThis.__omegaR286HasListener(node,type)===true;
    const p=reactProps(el),tag=el.tagName.toLowerCase();
    const clickBound=typeof p.onClick==='function'||typeof p.onPointerUp==='function'||typeof p.onPointerDown==='function'||typeof p.onMouseUp==='function'||typeof p.onMouseDown==='function'||typeof el.onclick==='function'||listenerBound(el,'click')||listenerBound(el,'pointerup')||listenerBound(el,'pointerdown');
    const type=tag==='button'?(el.getAttribute('type')||'submit').toLowerCase():'';
    const form=tag==='button'?el.form:null,fp=form?reactProps(form):{};
    const formBound=Boolean(form)&&(['submit','reset'].includes(type))&&(typeof fp.onSubmit==='function'||typeof fp.onReset==='function'||Boolean(form.getAttribute('action'))||listenerBound(form,'submit')||listenerBound(form,'reset'));
    const nativeFormAction=Boolean(el.getAttribute('formaction'));
    const roleButton=tag!=='button'&&el.getAttribute('role')==='button';
    const keyboardBound=typeof p.onKeyDown==='function'||typeof p.onKeyUp==='function'||typeof p.onKeyPress==='function'||listenerBound(el,'keydown')||listenerBound(el,'keyup');
    const anchorKeyboard=tag==='a'&&Boolean(el.getAttribute('href'));
    return{missing:false,actionBound:clickBound||formBound||nativeFormAction,roleButton,keyboardBound:keyboardBound||anchorKeyboard};
  },{name:route,probe});
}

async function proveReachable(page,route,probe){
  let reason='could not be scrolled to a reachable viewport hit region';
  for(let attempt=0;attempt<3;attempt++){
    const resolved=await resolveProbe(page,route,probe);
    if(!resolved){reason='disappeared without a live replacement during reachability proof';continue}
    const locator=page.locator(`[data-r313-control-probe="${probe.id}"]`).first();
    // Use Playwright's browser-level actionability scroll. This exercises Chromium's
    // real scroll chain instead of the application-patched Element.scrollIntoView path,
    // while every geometry, viewport and elementFromPoint assertion below stays strict.
    await locator.scrollIntoViewIfNeeded({timeout:10000}).catch(()=>{});
    await twoFrames(page);
    const live=await resolveProbe(page,route,probe);
    if(!live){reason='remounted without a resolvable live replacement after scrolling';continue}
    const r=live.rect;
    if(![r.left,r.right,r.top,r.bottom,r.width,r.height].every(Number.isFinite)){reason='returned non-finite viewport geometry';continue}
    if(r.width<8||r.height<8){reason=`has unusable ${Math.round(r.width)}×${Math.round(r.height)} hit geometry`;continue}
    const hit=await page.evaluate(({name,id})=>{
      const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
      const el=surface?.querySelector(`[data-r313-control-probe="${CSS.escape(id)}"]`);
      if(!el)return{reachable:false,reason:'live control missing at hit sample'};
      const r=el.getBoundingClientRect();
      const left=Math.max(r.left,1),right=Math.min(r.right,innerWidth-1),top=Math.max(r.top,1),bottom=Math.min(r.bottom,innerHeight-1);
      if(right-left<2||bottom-top<2)return{reachable:false,reason:`outside viewport after scroll rect ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`};
      const ix=Math.min(4,Math.max(.5,(right-left)*.08)),iy=Math.min(4,Math.max(.5,(bottom-top)*.08));
      const x0=left+ix,x1=right-ix,y0=top+iy,y1=bottom-iy;
      const xs=[(x0+x1)/2,x0+(x1-x0)*.25,x0+(x1-x0)*.75],ys=[(y0+y1)/2,y0+(y1-y0)*.25,y0+(y1-y0)*.75];
      const points=[[xs[0],ys[0]],[xs[1],ys[1]],[xs[2],ys[1]],[xs[1],ys[2]],[xs[2],ys[2]],[xs[1],ys[0]],[xs[2],ys[0]],[xs[0],ys[1]],[xs[0],ys[2]]];
      let blocker='none';
      for(const [x,y] of points){
        const node=document.elementFromPoint(x,y);
        if(node&&(node===el||el.contains(node)||node.contains(el)))return{reachable:true,reason:''};
        if(blocker==='none'&&node)blocker=`${node.tagName.toLowerCase()}.${[...node.classList].slice(0,2).join('.')}`;
      }
      return{reachable:false,reason:`no unobscured hit point; blocker ${blocker}; rect ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`};
    },{name:route,id:probe.id});
    if(hit.reachable)return{reachable:true,reason:'',rect:r};
    reason=hit.reason;
  }
  return{reachable:false,reason};
}

async function runtimeControlAudit(page,route){
  const probes=await inventoryControls(page,route);
  const failures=[];
  let disabled=0;
  for(const probe of probes){
    const display=(probe.label||'unnamed').slice(0,120);
    let state=await resolveProbe(page,route,probe);
    if(!state){failures.push(`${display} disappeared before audit`);continue}
    if(state.disabled){disabled++;continue}
    if(!probe.label)failures.push('unnamed enabled control');
    if(state.pointer==='none')failures.push(`${display} has pointer-events:none while enabled`);
    const action=await actionContract(page,route,probe);
    if(action.missing)failures.push(`${display} disappeared before action-binding proof`);
    else{
      if(!action.actionBound)failures.push(`${display} has no runtime click/pointer/form action binding`);
      if(action.roleButton&&!action.keyboardBound)failures.push(`${display} role=button has no runtime keyboard activation`);
    }
    const reach=await proveReachable(page,route,probe);
    if(!reach.reachable)failures.push(`${display} ${reach.reason}`);
  }
  const frame=await page.evaluate(name=>{
    const main=document.querySelector('.workstation-main'),r=main?.getBoundingClientRect();
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    return{width:r?.width||0,height:r?.height||0,overflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,textLength:(surface?.textContent||'').replace(/\s+/g,' ').trim().length};
  },route);
  return{count:probes.length,disabled,failures:[...new Set(failures)],...frame};
}

async function exerciseSafeDisclosures(page,viewportName,route){
  const surface=page.locator(`.omega-surface-r81[data-surface-name="${route.replaceAll('"','\\"')}"]`);
  let exercised=0;
  const expanders=surface.locator('[aria-expanded][aria-controls]');
  for(let i=0;i<await expanders.count();i++){
    const control=expanders.nth(i);
    if(!await control.isVisible())continue;
    const label=((await control.getAttribute('aria-label'))||(await control.getAttribute('title'))||(await control.textContent())||'').replace(/\s+/g,' ').trim();
    if(/run|execute|deploy|delete|commit|merge|dispatch|send|apply|write|repair|build|approve|authorize|train/i.test(label))continue;
    const before=await control.getAttribute('aria-expanded');
    await control.scrollIntoViewIfNeeded();
    await control.click({timeout:10000});
    await page.waitForTimeout(30);
    const after=await control.getAttribute('aria-expanded');
    if(after===before)throw new Error(`${viewportName}/${route}: aria-expanded control failed to toggle: ${label||'unnamed'}`);
    await control.click({timeout:10000});
    if(await control.getAttribute('aria-expanded')!==before)throw new Error(`${viewportName}/${route}: aria-expanded control failed to restore: ${label||'unnamed'}`);
    exercised++;
  }
  const details=surface.locator('details');
  for(let i=0;i<await details.count();i++){
    const item=details.nth(i);
    if(!await item.isVisible())continue;
    const summary=item.locator(':scope > summary').first();
    if(!await summary.count()||!await summary.isVisible())continue;
    const label=((await summary.textContent())||'').replace(/\s+/g,' ').trim();
    if(/run|execute|deploy|delete|commit|merge|dispatch|send|apply|write|repair|build|approve|authorize|train/i.test(label))continue;
    const before=await item.evaluate(el=>el.open);
    await summary.scrollIntoViewIfNeeded();
    await summary.click({timeout:10000});
    await page.waitForTimeout(30);
    if(await item.evaluate(el=>el.open)===before)throw new Error(`${viewportName}/${route}: details summary failed to toggle`);
    await summary.click({timeout:10000});
    if(await item.evaluate(el=>el.open)!==before)throw new Error(`${viewportName}/${route}: details summary failed to restore`);
    exercised++;
  }
  return exercised;
}

async function verifySarGeometry(page,viewportName){
  const sar=await page.evaluate(()=>{
    const grid=document.querySelector('.sar-r280 .r280-canvas');
    if(!grid)return null;
    const style=getComputedStyle(grid);
    return{cols:style.gridTemplateColumns.split(/\s+/).filter(Boolean).length,rows:style.gridTemplateRows.split(/\s+/).filter(Boolean).length,cells:grid.children.length};
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
    await page.addInitScript(()=>{
      const registry=new WeakMap();
      const original=EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener=function(type,listener,options){
        if(typeof listener==='function'||(listener&&typeof listener.handleEvent==='function')){
          let set=registry.get(this);if(!set){set=new Set();registry.set(this,set)}set.add(String(type));
        }
        return original.call(this,type,listener,options);
      };
      globalThis.__omegaR286HasListener=(el,type)=>registry.get(el)?.has(String(type))===true;
    });
    await page.goto(`${base}/?r313-panels=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
    await openNavigator(page);
    await verifyWorkspaceSubmenus(page,name);
    const navLabels=(await page.locator('.r89-flat-route b').allTextContents()).map(x=>x.trim()).filter(Boolean);
    const unique=[...new Set(navLabels)];
    if(unique.length!==44)throw new Error(`${name}: expected 44 unique route controls, received ${unique.length}`);
    for(const route of expected)if(!unique.includes(route))throw new Error(`${name}: navigator omitted canonical route ${route}`);

    for(const route of expected){
      await clickRoute(page,route);
      const structure=await panelStructureAudit(page,route);
      if(structure.failures.length)throw new Error(`${name}/${route}: panel structure failure:\n${structure.failures.join('\n')}`);
      totals[name==='desktop'?'panelsDesktop':'panelsMobile']+=structure.panelCount;

      const audit=await runtimeControlAudit(page,route);
      if(audit.width<220||audit.height<80)throw new Error(`${name}/${route}: workstation unusable ${JSON.stringify(audit)}`);
      if(audit.overflow>24)throw new Error(`${name}/${route}: viewport overflow ${audit.overflow}px`);
      if(audit.textLength<8&&audit.count<1)throw new Error(`${name}/${route}: no visible meaningful route content`);
      if(audit.failures.length)throw new Error(`${name}/${route}: dead/misbound/occluded control contract failure:\n${audit.failures.join('\n')}`);
      totals[name]+=audit.count;
      totals[name==='desktop'?'disabledDesktop':'disabledMobile']+=audit.disabled;

      const disclosures=await exerciseSafeDisclosures(page,name,route);
      totals[name==='desktop'?'disclosuresDesktop':'disclosuresMobile']+=disclosures;
      if(route==='SAR Truth')await verifySarGeometry(page,name);
      if(pageErrors.length)throw new Error(`${name}/${route}: browser page errors ${pageErrors.join(' | ').slice(0,4000)}`);
    }

    await openNavigator(page);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});
    await openNavigator(page);
    if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ').slice(0,4000)}`);
    await context.close();
  }
  console.log(`R286/R313 ALL-SURFACE + ALL-PANEL INTEGRITY PASS · 44/44 canonical routes pointer-opened on desktop + 390px mobile · active SurfaceIntegrity identity and PanelBoundary health proven on every route · route-deferred loaders resolve · ${totals.panelsDesktop+totals.panelsMobile} visible panel/region structures geometry-audited · ${totals.disclosuresDesktop+totals.disclosuresMobile} safe disclosures exercised and restored · ALL + six workspace submenus exercised · ${totals.desktop} desktop + ${totals.mobile} mobile visible controls audited on live browser nodes · ${totals.disabledDesktop+totals.disabledMobile} honestly disabled controls exempted · every enabled control requires an accessible name, real runtime action binding, finite usable geometry, pointer events and an unobscured elementFromPoint hit after browser-native scrollIntoView · role buttons require keyboard activation · aria-controls targets exist · exact 78×78/6084 SAR geometry · no material viewport overflow · navigator Escape/reopen · no page errors.`);
}finally{await browser.close()}
