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

async function detailsDiagnostic(details){
  return details.evaluate(el=>({
    className:String(el.className||''),
    summary:(el.querySelector(':scope > summary')?.textContent||'').replace(/\s+/g,' ').trim().slice(0,240),
    open:Boolean(el.open),
    ancestors:[...function*(){let p=el.parentElement?.closest('details')||null;while(p){yield String(p.className||p.tagName);p=p.parentElement?.closest('details')||null}}()],
    children:[...el.children].filter(x=>x.tagName!=='SUMMARY').map(node=>{const s=getComputedStyle(node),r=node.getBoundingClientRect();return{tag:node.tagName,className:String(node.className||''),display:s.display,visibility:s.visibility,opacity:s.opacity,width:Number(r.width.toFixed(2)),height:Number(r.height.toFixed(2)),text:(node.textContent||'').replace(/\s+/g,' ').trim().slice(0,180)}})
  }));
}

async function hiddenSummaryDiagnostic(details){
  return details.evaluate(el=>{
    const summary=el.querySelector(':scope > summary');
    const es=getComputedStyle(el),er=el.getBoundingClientRect();
    if(!summary)return{className:String(el.className||''),summary:null};
    const s=getComputedStyle(summary),r=summary.getBoundingClientRect();
    return{
      className:String(el.className||''),
      open:Boolean(el.open),
      details:{display:es.display,visibility:es.visibility,opacity:es.opacity,width:Number(er.width.toFixed(2)),height:Number(er.height.toFixed(2)),overflow:es.overflow,position:es.position},
      summary:{text:(summary.textContent||'').replace(/\s+/g,' ').trim().slice(0,240),display:s.display,visibility:s.visibility,opacity:s.opacity,width:Number(r.width.toFixed(2)),height:Number(r.height.toFixed(2)),overflow:s.overflow,position:s.position,contentVisibility:s.contentVisibility},
      parent:summary.parentElement?{tag:summary.parentElement.tagName,className:String(summary.parentElement.className||'')}:null,
      ancestors:[...function*(){let p=el.parentElement;while(p){const ps=getComputedStyle(p),pr=p.getBoundingClientRect();yield{tag:p.tagName,className:String(p.className||''),display:ps.display,visibility:ps.visibility,width:Number(pr.width.toFixed(2)),height:Number(pr.height.toFixed(2)),overflow:ps.overflow};p=p.parentElement}}()].slice(0,8)
    };
  });
}

async function scrollLocatorForContinuity(locator){
  await locator.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest'}));
}

async function waitForStableLocator(page,locator,label){
  let prior=null,stable=0;
  for(let i=0;i<30;i++){
    const box=await locator.boundingBox().catch(()=>null);
    if(box&&prior){
      const delta=Math.max(Math.abs(box.x-prior.x),Math.abs(box.y-prior.y),Math.abs(box.width-prior.width),Math.abs(box.height-prior.height));
      stable=delta<=0.5?stable+1:0;
      if(stable>=2)return;
    }else stable=0;
    prior=box;
    await page.waitForTimeout(34);
  }
  throw new Error(`${label}: disclosure geometry did not reach two-frame continuity`);
}

async function assertLocatorViewportReachability(locator,label){
  const diag=await locator.evaluate(el=>{
    const rect=el.getBoundingClientRect(),root=document.scrollingElement;
    const inside=rect.right>0&&rect.left<window.innerWidth&&rect.bottom>0&&rect.top<window.innerHeight;
    const ancestors=[];let p=el.parentElement;
    while(p&&ancestors.length<12){
      const cs=getComputedStyle(p),r=p.getBoundingClientRect();
      ancestors.push({tag:p.tagName,className:String(p.className||''),x:Number(r.x.toFixed(2)),y:Number(r.y.toFixed(2)),width:Number(r.width.toFixed(2)),height:Number(r.height.toFixed(2)),overflowX:cs.overflowX,overflowY:cs.overflowY,position:cs.position,scrollTop:Number(p.scrollTop||0),scrollHeight:Number(p.scrollHeight||0),clientHeight:Number(p.clientHeight||0)});
      p=p.parentElement;
    }
    return{inside,rect:{x:Number(rect.x.toFixed(2)),y:Number(rect.y.toFixed(2)),top:Number(rect.top.toFixed(2)),bottom:Number(rect.bottom.toFixed(2)),left:Number(rect.left.toFixed(2)),right:Number(rect.right.toFixed(2)),width:Number(rect.width.toFixed(2)),height:Number(rect.height.toFixed(2))},viewport:{width:window.innerWidth,height:window.innerHeight,scrollX:window.scrollX,scrollY:window.scrollY},document:root?{scrollTop:root.scrollTop,scrollHeight:root.scrollHeight,clientHeight:root.clientHeight,scrollLeft:root.scrollLeft,scrollWidth:root.scrollWidth,clientWidth:root.clientWidth}:null,ancestors};
  });
  if(!diag.inside)throw new Error(`${label}: stable control remains outside viewport · ${JSON.stringify(diag)}`);
  return diag;
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
      if(!await summary.isVisible()){const diag=await hiddenSummaryDiagnostic(details);throw new Error(`${viewport}/${route}: details #${i} summary is not visible · ${JSON.stringify(diag)}`)}
      const before=await details.evaluate(el=>el.open);
      const beforeState=await directContentState(details);
      if(!before&&beforeState.visible>0)throw new Error(`${viewport}/${route}: closed details #${i} leaks ${beforeState.visible}/${beforeState.count} direct content regions`);
      if(before&&beforeState.text>0&&beforeState.visible===0)throw new Error(`${viewport}/${route}: open details #${i} hides all meaningful direct content`);
      await scrollLocatorForContinuity(summary);
      await waitForStableLocator(page,summary,`${viewport}/${route}: details #${i} before toggle`);
      await assertLocatorViewportReachability(summary,`${viewport}/${route}: details #${i} before toggle`);
      await summary.click({timeout:10000});
      await page.waitForTimeout(35);
      const after=await details.evaluate(el=>el.open);
      if(after===before)throw new Error(`${viewport}/${route}: details #${i} summary did not toggle`);
      const afterState=await directContentState(details);
      if(after&&afterState.text>0&&afterState.visible===0){const diag=await detailsDiagnostic(details);throw new Error(`${viewport}/${route}: opened details #${i} exposes no meaningful direct content · ${JSON.stringify(diag)}`)}
      if(!after&&afterState.visible>0)throw new Error(`${viewport}/${route}: closed details #${i} still exposes ${afterState.visible} direct content regions`);
      await scrollLocatorForContinuity(summary);
      await waitForStableLocator(page,summary,`${viewport}/${route}: details #${i} before restore`);
      await assertLocatorViewportReachability(summary,`${viewport}/${route}: details #${i} before restore`);
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
    await scrollLocatorForContinuity(control);
    await waitForStableLocator(page,control,`${viewport}/${route}: ${label||`aria-expanded #${i}`} before toggle`);
    await assertLocatorViewportReachability(control,`${viewport}/${route}: ${label||`aria-expanded #${i}`} before toggle`);
    await control.click({timeout:10000});
    await page.waitForTimeout(50);
    const after=await control.getAttribute('aria-expanded');
    if(after===before)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} did not toggle`);
    if(id){
      const state=await targetState(page,id);
      if(after==='true'&&!state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} says expanded but #${id} is not visible`);
      if(after==='false'&&state.visible)throw new Error(`${viewport}/${route}: ${label||`aria-expanded #${i}`} says collapsed but #${id} remains visible`);
    }
    await scrollLocatorForContinuity(control);
    await waitForStableLocator(page,control,`${viewport}/${route}: ${label||`aria-expanded #${i}`} before restore`);
    await assertLocatorViewportReachability(control,`${viewport}/${route}: ${label||`aria-expanded #${i}`} before restore`);
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
    const errors=[];page.on('pageerror',e=>errors.push(e?.stack||String(e)));
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