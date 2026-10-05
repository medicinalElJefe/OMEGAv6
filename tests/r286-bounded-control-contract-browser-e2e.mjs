import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const navigation=fs.readFileSync('src/navigationRegistry.ts','utf8');
const block=navigation.slice(navigation.indexOf('export const OMEGA_NAVIGATION=['),navigation.indexOf('export const OMEGA_NAV_GROUPS'));
const routes=[...block.matchAll(/name:'([^']+)'/g)].map(m=>m[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error(`R286 expected 44 unique canonical surfaces, received ${routes.length}/${new Set(routes).size}`);

const profiles=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];

async function openNavigator(page){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
 const b=page.locator('button[aria-label="Expand OMEGA navigator"]').first();
 await b.click({timeout:10000,noWaitAfter:true});
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}

async function go(page,route){
 await openNavigator(page);
 const buttons=page.locator('.r89-flat-route');
 const count=await buttons.count();
 for(let i=0;i<count;i++){
   const label=((await buttons.nth(i).locator('b').first().textContent().catch(()=>''))||'').trim();
   if(label!==route)continue;
   await buttons.nth(i).click({timeout:10000});
   await page.waitForFunction(name=>{
     const active=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
     return Boolean(active);
   },route,{timeout:15000});
   await page.waitForFunction(name=>{
     const s=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
     return Boolean(s&&!s.querySelector('.panel-failure')&&![...s.querySelectorAll('.r109-specialist-loading')].some(x=>getComputedStyle(x).display!=='none'));
   },route,{timeout:20000});
   return;
 }
 throw new Error(`R286 route missing: ${route}`);
}

const browser=await chromium.launch({headless:true});
try{
 for(const [profile,options] of profiles){
   const context=await browser.newContext(options);
   const page=await context.newPage();
   const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(`${base}/?r286-bounded=${Date.now()}-${profile}`,{waitUntil:'domcontentloaded',timeout:45000});
   await page.waitForFunction(()=>Boolean(
     document.querySelector('button[aria-label="Expand OMEGA navigator"]') ||
     document.querySelector('.r89-flat-route')
   ),{timeout:30000});
   for(const route of routes){
     await go(page,route);
     const audit=await page.evaluate(name=>{
       const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
       const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
       const controls=[...surface.querySelectorAll('button,[role="button"]')].filter(visible);
       const failures=[];
       for(const el of controls){
         const disabled=Boolean(el.disabled)||el.getAttribute('aria-disabled')==='true';
         if(disabled)continue;
         const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
         const r=el.getBoundingClientRect(), style=getComputedStyle(el);
         if(!label)failures.push('unnamed enabled control');
         if(style.pointerEvents==='none')failures.push(`${label||'unnamed'} pointer-events:none`);
         if(![r.left,r.top,r.width,r.height].every(Number.isFinite)||r.width<8||r.height<8)failures.push(`${label||'unnamed'} unusable geometry`);
         if(el.getAttribute('role')==='button'&&el.tagName.toLowerCase()!=='button'&&el.tabIndex<0)failures.push(`${label||'unnamed'} semantic button is not keyboard reachable`);
         const id=el.getAttribute('aria-controls');
         if(id&&!document.getElementById(id))failures.push(`${label||'unnamed'} aria-controls target missing: ${id}`);
       }
       return{count:controls.length,failures:[...new Set(failures)]};
     },route);
     if(audit.failures.length)throw new Error(`${profile}/${route}: bounded control contract failure:\n${audit.failures.join('\n')}`);
     if(errors.length)throw new Error(`${profile}/${route}: page errors: ${errors.join(' | ').slice(0,3000)}`);
     console.log(`R286 BOUNDED PASS · ${profile}/${route} · visibleControls=${audit.count}`);
   }
   await context.close();
 }
 console.log('R286 BOUNDED CONTROL CONTRACT PASS · all 44 canonical surfaces × desktop/mobile censused · enabled controls named, pointer-active, finite/usable, semantic buttons keyboard-reachable, aria-controls targets valid, zero page errors · route/scroll/disclosure/action-effect assertions remain owned by their dedicated blocking gates.');
}finally{await browser.close()}
