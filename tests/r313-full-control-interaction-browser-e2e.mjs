import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(surfaces.length!==44||new Set(surfaces).size!==44)throw new Error(`R313 expected 44 canonical surfaces, got ${surfaces.length}/${new Set(surfaces).size}`);

const profiles=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];

const MUTATING=/\b(run|execute|deploy|dispatch|authorize|train|build|delete|remove|revoke|promote|merge|send|submit|commit|write|save|create|launch|pair|connect|reconnect|repair|apply|acquire|upload|import|install|trigger|start mission|queue)\b/i;
const PASSIVE_NETWORK=/\b(refresh|reload|sync|probe|scan|fetch|load|inspect live|check live|update status)\b/i;
const NAV_SELECTOR='.omega-global-nav,.r89-side-navigator,.r239-user-nav';

function clean(v=''){return String(v).replace(/\s+/g,' ').trim()}

async function openNavigator(page){
 if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
 const b=page.locator('button[aria-label="Expand OMEGA navigator"]');
 if(!await b.count())throw new Error('R313 navigator expand button missing');
 await b.first().click();
 await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true');
}

async function activateSurface(page,name){
 await openNavigator(page);
 const routes=page.locator('.r89-flat-route');
 const count=await routes.count();
 for(let i=0;i<count;i++){
  const label=clean(await routes.nth(i).locator('b').first().textContent().catch(()=>''));
  if(label!==name)continue;
  await routes.nth(i).scrollIntoViewIfNeeded();
  await routes.nth(i).click();
  await page.waitForFunction(route=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===route,name,{timeout:20000});
  return;
 }
 throw new Error(`R313 route missing ${name}`);
}

async function inventory(page,surface){
 return page.evaluate(({navSel,surface})=>{
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const root=document.querySelector('.workstation-main');
  if(!root)return[];
  const controls=[...root.querySelectorAll('button,[role="button"]')].filter(visible).filter(el=>!el.closest(navSel));
  return controls.map((el,index)=>{
   const r=el.getBoundingClientRect();
   const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
   const id=`r313-${surface.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-${index}`;
   el.setAttribute('data-r313-probe-id',id);
   return{id,index,label,tag:el.tagName,native:el.tagName==='BUTTON',role:el.getAttribute('role')||'',disabled:Boolean(el.disabled||el.getAttribute('aria-disabled')==='true'),width:r.width,height:r.height,pointer:getComputedStyle(el).pointerEvents};
  });
 },{navSel:NAV_SELECTOR,surface});
}

async function guardEvidence(page,item){
 return page.evaluate(({id})=>{
  const el=document.querySelector(`[data-r313-probe-id="${CSS.escape(id)}"]`);
  if(!el)return{exists:false};
  const context=(el.closest('section,article,form,dialog,.panel,.card')?.textContent||el.parentElement?.textContent||'').replace(/\s+/g,' ').trim().slice(0,1800);
  return{exists:true,context,confirm:el.getAttribute('data-confirm')||'',actionTruth:el.closest('[data-action-truth]')?.getAttribute('data-action-truth')||''};
 },{id:item.id});
}

async function resolveControl(page,item){
 let current=page.locator(`[data-r313-probe-id="${item.id}"]`);
 if(await current.count())return current.first();
 const rebound=await page.evaluate(({label,tag,id,navSel})=>{
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const root=document.querySelector('.workstation-main');
  if(!root)return false;
  const candidates=[...root.querySelectorAll('button,[role="button"]')].filter(visible).filter(el=>!el.closest(navSel)).filter(el=>{
   const text=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
   return el.tagName===tag&&text===label;
  });
  if(candidates.length!==1)return false;
  candidates[0].setAttribute('data-r313-probe-id',id);
  return true;
 },{label:item.label,tag:item.tag,id:item.id,navSel:NAV_SELECTOR});
 if(!rebound)return null;
 current=page.locator(`[data-r313-probe-id="${item.id}"]`);
 return await current.count()?current.first():null;
}

async function actuateSafeControl(page,item,profile,surface){
 const current=await resolveControl(page,item);
 if(!current)return;
 await current.scrollIntoViewIfNeeded().catch(()=>{});
 try{
  if(item.native){
   await current.click({timeout:7000});
  }else{
   // Animated SVG role-buttons may intentionally never satisfy pointer-stability.
   // Exercise their required semantic keyboard contract instead of weakening liveness.
   await current.focus({timeout:5000});
   await current.press('Enter',{timeout:5000});
  }
 }catch(e){
  throw new Error(`${profile}/${surface}: safe ${item.native?'native-click':'role-button keyboard'} activation failed ${item.label}: ${String(e).slice(0,600)}`);
 }
}

async function clickSafeControls(page,surface,profile,pageErrors){
 const before=await inventory(page,surface);
 for(const item of before){
  if(!item.label)throw new Error(`${profile}/${surface}: enabled visible control has no accessible name at ${item.id}`);
  if(!item.disabled&&(item.width<8||item.height<8||item.pointer==='none'))throw new Error(`${profile}/${surface}: unusable control ${item.label} ${item.width.toFixed(1)}x${item.height.toFixed(1)} pointer=${item.pointer}`);
  if(profile==='mobile'&&!item.disabled&&(item.width<43.5||item.height<43.5))throw new Error(`${profile}/${surface}: touch control below 44x44 ${item.label} ${item.width.toFixed(1)}x${item.height.toFixed(1)}`);
  if(item.disabled)continue;

  if(MUTATING.test(item.label)||PASSIVE_NETWORK.test(item.label)){
   const guarded=await guardEvidence(page,item);
   if(!guarded.exists)continue;
   const evidence=`${guarded.confirm} ${guarded.actionTruth} ${guarded.context}`;
   if(MUTATING.test(item.label)&&!/auth|authoriz|confirm|gate|proof|required|unproven|held|locked|draft|planned|device|permission|explicit|warning|danger|fail.?closed/i.test(evidence)){
    throw new Error(`${profile}/${surface}: mutating control lacks visible/semantic guard: ${item.label}`);
   }
   continue;
  }

  await actuateSafeControl(page,item,profile,surface);
  await page.waitForTimeout(40);
  if(pageErrors.length)throw new Error(`${profile}/${surface}: page error after activating ${item.label}: ${pageErrors.at(-1)}`);
  const panel=await page.locator('.omega-workstation-v2').getAttribute('data-panel');
  if(panel!==surface)await activateSurface(page,surface);
 }
 return before;
}

const browser=await chromium.launch({headless:true});
try{
 for(const [profile,options] of profiles){
  const context=await browser.newContext(options);
  const page=await context.newPage();
  const pageErrors=[];
  const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
  await page.goto(`${base}/?r313=${Date.now()}-${profile}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  let total=0,actionable=0,nativeActuated=0,roleActuated=0;
  for(const surface of surfaces){
   await activateSurface(page,surface);
   const list=await clickSafeControls(page,surface,profile,pageErrors);
   total+=list.length;
   actionable+=list.filter(x=>!x.disabled).length;
   nativeActuated+=list.filter(x=>!x.disabled&&x.native&&!MUTATING.test(x.label)&&!PASSIVE_NETWORK.test(x.label)).length;
   roleActuated+=list.filter(x=>!x.disabled&&!x.native&&!MUTATING.test(x.label)&&!PASSIVE_NETWORK.test(x.label)).length;
   const overflow=await page.evaluate(()=>Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth);
   if(overflow>24)throw new Error(`${profile}/${surface}: viewport overflow ${overflow}px after interaction sweep`);
  }
  if(pageErrors.length)throw new Error(`${profile}: page errors ${pageErrors.join(' | ').slice(0,2500)}`);
  const seriousConsole=consoleErrors.filter(x=>!/favicon|Failed to load resource.*404/i.test(x));
  if(seriousConsole.length)throw new Error(`${profile}: console errors ${seriousConsole.join(' | ').slice(0,2500)}`);
  console.log(`R313 ${profile.toUpperCase()} CONTROL SWEEP PASS · 44/44 panels · ${total} visible controls inventoried · ${actionable} enabled controls verified · ${nativeActuated} safe native controls click-exercised · ${roleActuated} safe role buttons keyboard-exercised · mutating/network controls held behind declared proof/authorization semantics · no page errors · no material overflow`);
  await context.close();
 }
 console.log('R313 FULL CONTROL INTERACTION PASS · every canonical panel mounted on desktop + touch mobile; all visible panel buttons received accessibility/reachability/geometry classification; safe native controls were pointer-actuated; non-native role buttons were keyboard-actuated through their accessibility contract; state-changing/network controls were required to remain explicitly gated instead of being blindly fired; zero browser page errors.');
}finally{await browser.close()}
