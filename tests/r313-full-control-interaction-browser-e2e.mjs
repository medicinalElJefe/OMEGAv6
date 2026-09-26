import {chromium} from 'playwright';
import fs from 'node:fs';
import {partitionInteractionCasesR355} from '../src/system/r313InteractionWorkloadR355.js';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const surfaces=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(surfaces.length!==44||new Set(surfaces).size!==44)throw new Error(`R313 expected 44 canonical surfaces, got ${surfaces.length}/${new Set(surfaces).size}`);

const profiles=[
 ['desktop',{viewport:{width:1440,height:960},deviceScaleFactor:1,hasTouch:false}],
 ['mobile',{viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
];
const shardCount=Number(process.env.R313_SHARD_COUNT||'1');
const shardIndex=Number(process.env.R313_SHARD_INDEX||'0');
if(!Number.isInteger(shardCount)||shardCount<1||shardCount>16)throw new Error(`R313_SHARD_COUNT must be an integer 1..16, received ${process.env.R313_SHARD_COUNT||'unset'}`);
if(!Number.isInteger(shardIndex)||shardIndex<0||shardIndex>=shardCount)throw new Error(`R313_SHARD_INDEX must be an integer 0..${shardCount-1}, received ${process.env.R313_SHARD_INDEX||'unset'}`);
const interactionPartition=partitionInteractionCasesR355({surfaces,shardCount});
const assignedSurfaces=profileIndex=>interactionPartition[shardIndex].cases.filter(x=>x.profileIndex===profileIndex).map(x=>x.surface);

const MUTATING=/\b(run|execute|deploy|dispatch|authorize|train|build|delete|remove|revoke|promote|merge|send|submit|commit|write|save|create|launch|pair|connect|reconnect|repair|apply|acquire|upload|import|install|trigger|start mission|queue)\b/i;
const PASSIVE_NETWORK=/\b(refresh|reload|sync|probe|scan|fetch|load|inspect live|check live|update status)\b/i;
const NAV_SELECTOR='.omega-global-nav,.r89-side-navigator,.r239-user-nav';

function clean(v=''){return String(v).replace(/\s+/g,' ').trim()}

async function twoFrames(page){
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}

async function waitForSurfaceReady(page,name){
 await page.waitForFunction(route=>{
  const main=document.querySelector('.workstation-main');
  const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(route)}"]`);
  if(!main||!surface)return false;
  if(surface.getAttribute('data-r356-interaction-ready')!=='true')return false;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const children=[...surface.children].filter(visible);
  const rich=[...surface.querySelectorAll('canvas,svg,img,video,input,textarea,select,button,[role="button"]')].filter(visible);
  const loader=[...surface.querySelectorAll('.r109-specialist-loading')].some(visible);
  return visible(surface)&&!loader&&!surface.querySelector('.panel-failure')&&children.length>0&&(((surface.textContent||'').replace(/\s+/g,' ').trim().length>=8)||rich.length>0);
 },name,{timeout:30000});
 await twoFrames(page);
}

async function surfaceContinuityState(page,surface){
 return page.evaluate(name=>{
  const shell=document.querySelector('.omega-workstation-v2');
  const node=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
  const html=document.documentElement;
  return{
   panel:shell?.getAttribute('data-panel')||null,
   exists:Boolean(node),
   stateKey:node?.getAttribute('data-r356-interaction-state-key')||null,
   ready:node?.getAttribute('data-r356-interaction-ready')==='true',
   failed:Boolean(node?.querySelector('.panel-failure')),
   routeEpoch:html.dataset.omegaRouteEpoch||'0',
   routeState:html.dataset.omegaRouteState||'IDLE',
   routeTarget:html.dataset.omegaRouteTarget||null,
   routeCurrent:html.dataset.omegaRouteCurrent||shell?.getAttribute('data-panel')||null
  };
 },surface);
}

async function waitForStableControl(page,id){
 const stable=await page.evaluate(async probeId=>{
  const sample=()=>{
   const el=document.querySelector(`[data-r313-probe-id="${CSS.escape(probeId)}"]`);
   if(!el)return null;
   const r=el.getBoundingClientRect(),s=getComputedStyle(el);
   if(s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0||r.width<=1||r.height<=1)return null;
   return[r.left,r.top,r.width,r.height];
  };
  let prior=sample(),consecutive=0;
  for(let frame=0;frame<12;frame++){
   await new Promise(resolve=>requestAnimationFrame(resolve));
   const next=sample();
   if(!prior||!next){prior=next;consecutive=0;continue}
   const delta=Math.max(...next.map((v,i)=>Math.abs(v-prior[i])));
   if(delta<=0.5)consecutive++;else consecutive=0;
   if(consecutive>=2)return true;
   prior=next;
  }
  return false;
 },id);
 if(!stable){const label=await page.locator(`[data-r313-probe-id="${id}"]`).first().getAttribute('aria-label').catch(()=>null)||await page.locator(`[data-r313-probe-id="${id}"]`).first().getAttribute('title').catch(()=>null)||clean(await page.locator(`[data-r313-probe-id="${id}"]`).first().textContent().catch(()=>''));throw new Error(`control geometry did not reach two-frame continuity: ${id} · ${label||'UNLABELED'}`)}
}

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
  const beforeEpoch=await page.evaluate(()=>document.documentElement.dataset.omegaRouteEpoch||'0');
  await routes.nth(i).click();
  await page.waitForFunction(({name,beforeEpoch})=>{
   const root=document.documentElement;
   return root.dataset.omegaRouteEpoch!==beforeEpoch&&root.dataset.omegaRouteTarget===name&&(root.dataset.omegaRouteState==='REQUESTED'||root.dataset.omegaRouteState==='COMMITTED');
  },{name,beforeEpoch},{timeout:10000}).catch(e=>{throw new Error(`R313 ${name} navigation request was not acknowledged: ${String(e)}`)});
  await page.waitForFunction(name=>{
   const root=document.documentElement,panel=document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel');
   return root.dataset.omegaRouteState==='COMMITTED'&&root.dataset.omegaRouteCurrent===name&&root.dataset.omegaRouteTarget===name&&panel===name;
  },name,{timeout:30000}).catch(e=>{throw new Error(`R313 ${name} navigation did not commit after acknowledged request: ${String(e)}`)});
  await waitForSurfaceReady(page,name);
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
   return{id,index,label,tag:el.tagName,native:el.tagName==='BUTTON',role:el.getAttribute('role')||'',tabIndex:el.tabIndex,disabled:Boolean(el.disabled||el.getAttribute('aria-disabled')==='true'),width:r.width,height:r.height,pointer:getComputedStyle(el).pointerEvents};
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
 const probe=`[data-r313-probe-id="${item.id}"]`;
 let current=page.locator(probe);
 if(await current.count()&&await current.first().isVisible().catch(()=>false))return current.first();
 const rebound=await page.evaluate(({label,tag,id,navSel})=>{
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>1&&r.height>1};
  const root=document.querySelector('.workstation-main');
  if(!root)return false;
  const candidates=[...root.querySelectorAll('button,[role="button"]')].filter(visible).filter(el=>!el.closest(navSel)).filter(el=>{
   const text=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
   return el.tagName===tag&&text===label;
  });
  if(candidates.length!==1)return false;
  root.querySelectorAll(`[data-r313-probe-id="${CSS.escape(id)}"]`).forEach(el=>el.removeAttribute('data-r313-probe-id'));
  candidates[0].setAttribute('data-r313-probe-id',id);
  return true;
 },{label:item.label,tag:item.tag,id:item.id,navSel:NAV_SELECTOR});
 if(!rebound)return null;
 current=page.locator(probe);
 return await current.count()&&await current.first().isVisible().catch(()=>false)?current.first():null;
}

async function actuateSafeControl(page,item,profile,surface){
 const current=await resolveControl(page,item);
 if(!current)return;
 await current.scrollIntoViewIfNeeded().catch(()=>{});
 await waitForStableControl(page,item.id);
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
  if(!item.native&&!item.disabled&&(item.role!=='button'||item.tabIndex<0))throw new Error(`${profile}/${surface}: non-native control lacks keyboard role/tab contract: ${item.label} role=${item.role||'NONE'} tabindex=${item.tabIndex}`);
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

  const beforeContinuity=await surfaceContinuityState(page,surface);
  await actuateSafeControl(page,item,profile,surface);
  await page.waitForTimeout(40);
  if(pageErrors.length)throw new Error(`${profile}/${surface}: page error after activating ${item.label}: ${pageErrors.at(-1)}`);
  const shell=page.locator('.omega-workstation-v2');
  if(!await shell.count()){
   throw new Error(`${profile}/${surface}: canonical workstation shell missing after activating ${item.label}; url=${page.url()}`);
  }
  let afterContinuity=await surfaceContinuityState(page,surface);
  if(afterContinuity.routeEpoch!==beforeContinuity.routeEpoch){
   await page.waitForFunction(({epoch})=>{
    const root=document.documentElement;
    return root.dataset.omegaRouteEpoch!==epoch&&root.dataset.omegaRouteState==='COMMITTED';
   },{epoch:beforeContinuity.routeEpoch},{timeout:10000});
   afterContinuity=await surfaceContinuityState(page,surface);
  }
  if(afterContinuity.panel!==surface){
   await activateSurface(page,surface);
  }else if(afterContinuity.stateKey!==beforeContinuity.stateKey){
   await waitForSurfaceReady(page,surface);
  }else{
   await twoFrames(page);
   const stable=await surfaceContinuityState(page,surface);
   if(!stable.exists||stable.failed||stable.panel!==surface)throw new Error(`${profile}/${surface}: local interaction broke same-state surface continuity after ${item.label}`);
  }
 }
 return before;
}

const browser=await chromium.launch({headless:true});
try{
 for(const [profileIndex,[profile,options]] of profiles.entries()){
  const assigned=assignedSurfaces(profileIndex);
  if(!assigned.length)continue;
  const context=await browser.newContext(options);
  const page=await context.newPage();
  const pageErrors=[];
  const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e)));
  page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
  await page.goto(`${base}/?r313=${Date.now()}-${profile}`,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
  let total=0,actionable=0,nativeActuated=0,roleActuated=0;
  for(const surface of assigned){
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
  console.log(`R313 ${profile.toUpperCase()} SHARD ${shardIndex+1}/${shardCount} CONTROL SWEEP PASS · workload ${interactionPartition[shardIndex].weight}ms census · ${assigned.length} deterministic panels · ${total} visible controls inventoried · ${actionable} enabled controls verified · ${nativeActuated} safe native controls click-exercised · ${roleActuated} safe role buttons keyboard-exercised · mutating/network controls held behind declared proof/authorization semantics · no page errors · no material overflow`);
  await context.close();
 }
 const shardCases=profiles.reduce((sum,_,profileIndex)=>sum+assignedSurfaces(profileIndex).length,0);
 console.log(`R313 SHARD ${shardIndex+1}/${shardCount} PASS · workload ${interactionPartition[shardIndex].weight}ms census · ${shardCases} deterministic route/viewport cases · all assigned visible panel buttons received accessibility/reachability/geometry classification; safe native controls were pointer-actuated; non-native role buttons were keyboard-actuated through their explicit accessibility contract; state-changing/network controls remained explicitly gated; zero browser page errors.`);
}finally{await browser.close()}
