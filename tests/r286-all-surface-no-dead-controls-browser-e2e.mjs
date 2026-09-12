import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const expected=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(expected.length!==44||new Set(expected).size!==44)throw new Error(`R286 expected 44 unique canonical surfaces, received ${expected.length}/${new Set(expected).size}`);

const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const totals={desktop:0,mobile:0,disabledDesktop:0,disabledMobile:0};

async function openNavigator(page){
  if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
  const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(!await expand.count())throw new Error('R286 global navigator expand control missing');
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
  if(hit<0)throw new Error(`R286 route button missing: ${route}`);
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

function runtimeControlAudit(){
  const visible=el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0;
  };
  const reactProps=el=>{
    for(const key of Object.getOwnPropertyNames(el))if(key.startsWith('__reactProps$'))return el[key]||{};
    return {};
  };
  const listenerBound=(el,type)=>typeof globalThis.__omegaR286HasListener==='function'&&globalThis.__omegaR286HasListener(el,type)===true;
  const controls=[...document.querySelectorAll('.workstation-main button,.workstation-main [role="button"]')].filter(visible);
  const failures=[];
  let disabled=0;
  const signatures=[];
  for(const el of controls){
    const tag=el.tagName.toLowerCase();
    const p=reactProps(el);
    const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||el.getAttribute('value')||'').replace(/\s+/g,' ').trim().slice(0,120);
    const rect=el.getBoundingClientRect();
    const isDisabled=Boolean(el.disabled)||el.getAttribute('aria-disabled')==='true';
    const pointer=getComputedStyle(el).pointerEvents;
    const clickBound=typeof p.onClick==='function'||typeof p.onPointerUp==='function'||typeof p.onPointerDown==='function'||typeof p.onMouseUp==='function'||typeof p.onMouseDown==='function'||typeof el.onclick==='function'||listenerBound(el,'click')||listenerBound(el,'pointerup')||listenerBound(el,'pointerdown');
    const type=tag==='button'?(el.getAttribute('type')||'submit').toLowerCase():'';
    const form=tag==='button'?el.form:null;
    const fp=form?reactProps(form):{};
    const formBound=Boolean(form)&&(['submit','reset'].includes(type))&&(typeof fp.onSubmit==='function'||typeof fp.onReset==='function'||Boolean(form.getAttribute('action'))||listenerBound(form,'submit')||listenerBound(form,'reset'));
    const nativeFormAction=Boolean(el.getAttribute('formaction'));
    const actionBound=clickBound||formBound||nativeFormAction;
    const roleButton=tag!=='button'&&el.getAttribute('role')==='button';
    const keyboardBound=typeof p.onKeyDown==='function'||typeof p.onKeyUp==='function'||typeof p.onKeyPress==='function'||listenerBound(el,'keydown')||listenerBound(el,'keyup');
    const anchorKeyboard=tag==='a'&&Boolean(el.getAttribute('href'));
    if(isDisabled){disabled++;continue}
    if(!label)failures.push('unnamed enabled control');
    if(rect.width<8||rect.height<8)failures.push(`${label||'unnamed'} has unusable ${Math.round(rect.width)}×${Math.round(rect.height)} hit geometry`);
    if(pointer==='none')failures.push(`${label||'unnamed'} has pointer-events:none while enabled`);
    if(!actionBound)failures.push(`${label||'unnamed'} has no runtime click/pointer/form action binding`);
    if(roleButton&&!anchorKeyboard&&!keyboardBound)failures.push(`${label||'unnamed'} role=button has no runtime keyboard activation`);
    signatures.push(`${tag}:${label}:${clickBound?'click':formBound?'form':nativeFormAction?'formaction':'none'}`);
  }
  const main=document.querySelector('.workstation-main');
  const mainRect=main?.getBoundingClientRect();
  const overflow=Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth;
  const textLength=(main?.textContent||'').replace(/\s+/g,' ').trim().length;
  return{count:controls.length,disabled,failures:[...new Set(failures)],signatures:[...new Set(signatures)],width:mainRect?.width||0,height:mainRect?.height||0,overflow,textLength};
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
  for(const [name,viewport] of viewports){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
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
    await page.goto(`${base}/?r286-controls=${Date.now()}-${name}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
    await openNavigator(page);
    await verifyWorkspaceSubmenus(page,name);
    const navLabels=(await page.locator('.r89-flat-route b').allTextContents()).map(x=>x.trim()).filter(Boolean);
    const unique=[...new Set(navLabels)];
    if(unique.length!==44)throw new Error(`${name}: expected 44 unique route controls, received ${unique.length}`);
    for(const route of expected)if(!unique.includes(route))throw new Error(`${name}: navigator omitted canonical route ${route}`);

    for(const route of expected){
      await clickRoute(page,route);
      const audit=await page.evaluate(runtimeControlAudit);
      if(audit.width<220||audit.height<80)throw new Error(`${name}/${route}: workstation unusable ${JSON.stringify(audit)}`);
      if(audit.overflow>24)throw new Error(`${name}/${route}: viewport overflow ${audit.overflow}px`);
      if(audit.textLength<8&&audit.count<1)throw new Error(`${name}/${route}: no visible meaningful route content`);
      if(audit.failures.length)throw new Error(`${name}/${route}: dead/misbound control contract failure:\n${audit.failures.join('\n')}`);
      totals[name]+=audit.count;
      totals[name==='desktop'?'disabledDesktop':'disabledMobile']+=audit.disabled;
      if(route==='SAR Truth')await verifySarGeometry(page,name);
    }

    await openNavigator(page);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded!=='true',{timeout:10000});
    await openNavigator(page);
    if(pageErrors.length)throw new Error(`${name}: browser page errors ${pageErrors.join(' | ').slice(0,4000)}`);
    await context.close();
  }
  console.log(`R286 ALL-SURFACE NO-DEAD-CONTROL PASS · 44/44 canonical routes pointer-opened on desktop + 390px mobile · ALL + six workspace submenus pointer-exercised · ${totals.desktop} visible desktop controls + ${totals.mobile} visible mobile controls runtime-bound · ${totals.disabledDesktop+totals.disabledMobile} honestly disabled controls exempted · enabled controls require accessible labels, real React/native pointer-or-form action bindings, usable hit geometry and pointer events · role buttons require keyboard activation · exact data-panel transitions · exact 78×78/6084-cell SAR geometry · no material viewport overflow · navigator Escape/reopen · no page errors.`);
}finally{await browser.close()}
