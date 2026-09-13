import {chromium} from 'playwright';
import fs from 'node:fs';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const source=fs.readFileSync('src/OmegaWorkstationFullV2.tsx','utf8');
const block=(source.match(/export const OMEGA_SURFACES=\[(.*?)\] as const/s)||[])[1]||'';
const routes=[...block.matchAll(/'([^']+)'/g)].map(m=>m[1]);
if(routes.length!==44||new Set(routes).size!==44)throw new Error(`R313 expected 44 unique canonical surfaces, received ${routes.length}`);

const viewports=[['desktop',{width:1440,height:960}],['mobile',{width:390,height:844}]];
const risky=/run|execute|deploy|dispatch|delete|remove|apply patch|write|commit|submit|train|authorize|queue|mission|promote/i;
let detailsExercised=0,ariaExercised=0;

async function openNavigator(page){
  if(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))return;
  const trigger=page.locator('button[aria-label="Expand OMEGA navigator"]');
  if(!await trigger.count())throw new Error('R313 global navigator trigger missing');
  await trigger.first().click({timeout:10000});
  await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
}

async function openRoute(page,route){
  await openNavigator(page);
  const buttons=page.locator('.r89-flat-route');
  const count=await buttons.count();
  let hit=-1;
  for(let i=0;i<count;i++){
    const label=(await buttons.nth(i).locator('b').first().textContent().catch(()=>''))?.trim();
    if(label===route){hit=i;break}
  }
  if(hit<0)throw new Error(`R313 route missing: ${route}`);
  await buttons.nth(hit).scrollIntoViewIfNeeded();
  await buttons.nth(hit).click({timeout:10000});
  await page.waitForFunction(name=>document.querySelector('.omega-workstation-v2')?.getAttribute('data-panel')===name,route,{timeout:20000});
  await page.waitForFunction(name=>{
    const surface=document.querySelector(`.omega-surface-r81[data-surface-name="${CSS.escape(name)}"]`);
    if(!surface||surface.querySelector('.panel-failure'))return false;
    const loader=[...surface.querySelectorAll('.r109-specialist-loading')].some(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>1&&r.height>1});
    return !loader;
  },route,{timeout:30000});
}

async function directContentState(details){
  return details.evaluate(el=>{
    const visible=node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
    const content=[...el.children].filter(x=>x.tagName!=='SUMMARY');
    return{count:content.length,visible:content.filter(visible).length,text:content.map(x=>(x.textContent||'').trim()).join(' ').length};
  });
}

async function testDetails(page,viewport,route){
  const list=page.locator('.workstation-main .omega-surface-r81 details');
  const count=await list.count();
  for(let i=0;i<count;i++){
    const details=list.nth(i);
    const ancestorStates=await details.evaluate(el=>{
      const states=[];let p=el.parentElement?.closest('details')||null;
      while(p){states.push(p.open);p.open=true;p=p.parentElement?.closest('details')||null}
      return states;
    });
    try{
      if(!await details.isVisible().catch(()=>false))continue;
      const summary=details.locator(':scope > summary');
      if(await summary.count()!==1)throw new Error(`${viewport}/${route}: visible details #${i} does not own exactly one direct summary`);
      if(!await summary.isVisible())throw new Error(`${viewport}/${route}: details #${i} summary is not visible`);
      const before=await details.evaluate(el=>el.open);
      const beforeState=await directContentState(details);
      if(!before&&beforeState.visible>0)throw new Error(`${viewport}/${route}: closed details #${i} leaks ${beforeState.visible}/${beforeState.count} direct content regions`);
      if(before&&beforeState.text>0&&beforeState.visible===0)throw new Error(`${viewport}/${route}: open details #${i} hides all meaningful direct content`);
      await summary.click({timeout:10000});
      await page.waitForTimeout(35);
      const after=await details.evaluate(el=>el.open);
      if(after===before)throw new Error(`${viewport}/${route}: details #${i} summary did not toggle`);
      const afterState=await directContentState(details);
      if(after&&afterState.text>0&&afterState.visible===0)throw new Error(`${viewport}/${route}: opened details #${i} exposes no meaningful direct content`);
      if(!after&&afterState.visible>0)throw new Error(`${viewport}/${route}: closed details #${i} still exposes ${afterState.visible} direct content regions`);
      await summary.click({timeout:10000});
      await page.waitForTimeout(35);
      const restored=await details.evaluate(el=>el.open);
      if(restored!==before)throw new Error(`${viewport}/${route}: details #${i} did not restore original open=${before}`);
      const restoredState=await directContentState(details);
      if(!before&&restoredState.visible>0)throw new Error(`${viewport}/${route}: details #${i} leaks content again after close`);
      if(before&&restoredState.text>0&&restoredState.visible===0)throw new Error(`${viewport}/${route}: details #${i} failed to restore visible open content`);
      detailsExercised++;
    }finally{
      await details.evaluate((el,states)=>{let p=el.parentElement?.closest('details')||null;let i=0;while(p){p.open=Boolean(states[i++]);p=p.parentElement?.closest('details')||null}},ancestorStates);
    }
  }
}

async function targetState(page,id){
  return page.evaluate(targetId=>{
    const el=document.getElementById(targetId);if(!el)return{exists:false,visible:false};
    const s=getComputedStyle(el),r=el.getBoundingClientRect();return{exists:true,visible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0&&r.height>0};
  },id);
}

async function testAriaExpanded(page,viewport,route){
  const controls=page.locator('.workstation-main .omega-surface-r81 [aria-expanded]');
  const count=await controls.count();
  for(let i=0;i<count;i++){
    const control=controls.nth(i);
    if(!await control.isVisible().catch(()=>false)||!await control.isEnabled().catch(()=>false))continue;
    const label=((await control.getAttribute('aria-label'))||(await control.textContent())||'').replace(/\s+/g,' ').trim();
    if(risky.test(label))continue;
    const before=await control.getAttribute('aria-expanded');
    if(before!=='true'&&before!=='false')throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} has invalid state ${before}`);
    const id=await control.getAttribute('aria-controls');
    if(id){const state=await targetState(page,id);if(!state.exists)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} controls missing #${id}`)}
    await control.scrollIntoViewIfNeeded();
    await control.click({timeout:10000});
    await page.waitForTimeout(50);
    const after=await control.getAttribute('aria-expanded');
    if(after===before)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} did not toggle`);
    if(id){
      const state=await targetState(page,id);
      if(after==='true'&&!state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} says expanded but #${id} is not visible`);
      if(after==='false'&&state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} says collapsed but #${id} remains visible`);
    }
    await control.click({timeout:10000});
    await page.waitForTimeout(35);
    const restored=await control.getAttribute('aria-expanded');
    if(restored!==before)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} failed to restore ${before}`);
    if(id){
      const state=await targetState(page,id);
      if(restored==='true'&&!state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} restored expanded but target is hidden`);
      if(restored==='false'&&state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} restored collapsed but target remains visible`);
    }
    ariaExercised++;
  }
}

const browser=await chromium.launch({headless:true});
try{
  for(const [viewportName,viewport] of viewports){
    const context=await browser.newContext({viewport,deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(String(e)));
    await page.goto(`${base}/?r313-panel-disclosure=${Date.now()}-${viewportName}`,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForSelector('main.r71-home,.omega-workstation-v2',{timeout:30000});
    for(const route of routes){
      await openRoute(page,route);
      await testDetails(page,viewportName,route);
      await testAriaExpanded(page,viewportName,route);
      if(errors.length)throw new Error(`${viewportName}/${route}: page errors ${errors.join(' | ').slice(0,4000)}`);
    }
    await context.close();
  }
  console.log(`R313 ALL-PANEL DISCLOSURE PASS · 44/44 canonical surfaces × desktop/mobile · ${detailsExercised} native details disclosures recursively revealed, pointer-toggled, direct-content visibility verified and restored · ${ariaExercised} safe aria-expanded controls toggled and restored · closed panels may not leak author-CSS content · missing aria-controls targets fail closed · no execution/deploy/dispatch/authorization controls invoked · no page errors.`);
}finally{await browser.close()}
