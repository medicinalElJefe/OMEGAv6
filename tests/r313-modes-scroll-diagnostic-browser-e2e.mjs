import {chromium} from 'playwright';

const base=(process.env.OMEGA_E2E_URL||'http://127.0.0.1:4173').replace(/\/$/,'');
const labels=['Next mode or authority','Inspect catalog'];

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true
  });
  const page=await context.newPage();
  await page.goto(`${base}/?r313-modes-scroll-diagnostic=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:45000});

  await page.waitForSelector('.r94-side-navigator,button[aria-label="Expand OMEGA navigator"],.r89-flat-route',{timeout:30000});
  if(!(await page.evaluate(()=>document.documentElement.dataset.omegaNavExpanded==='true'))){
    const expand=page.locator('button[aria-label="Expand OMEGA navigator"]');
    if(await expand.count()){
      await expand.first().click({timeout:10000});
      await page.waitForFunction(()=>document.documentElement.dataset.omegaNavExpanded==='true',{timeout:10000});
    }
  }

  await page.waitForSelector('.r89-flat-route',{timeout:20000});
  const routes=page.locator('.r89-flat-route');
  const count=await routes.count();
  let modesRoute=null;
  for(let i=0;i<count;i++){
    const route=routes.nth(i);
    const name=((await route.locator('b').first().textContent().catch(()=>''))||'').trim();
    if(name==='Modes'){modesRoute=route;break}
  }
  if(!modesRoute)throw new Error('R313 Modes diagnostic: Modes route missing');
  await modesRoute.scrollIntoViewIfNeeded();
  await modesRoute.click({timeout:10000});
  await page.waitForSelector('.omega-workstation-v2[data-panel="Modes"]',{timeout:30000});
  await page.waitForSelector('.sbm21-app',{timeout:30000});
  await page.waitForTimeout(300);

  const diagnostic=await page.evaluate(async labels=>{
    const rect=r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height});
    const nodeName=el=>el?`${el.tagName.toLowerCase()}${el.id?`#${el.id}`:''}${el.classList?.length?'.'+[...el.classList].slice(0,5).join('.'):''}`:'none';
    const info=el=>{
      if(!el)return null;
      const s=getComputedStyle(el),r=el.getBoundingClientRect();
      return{
        name:nodeName(el),rect:rect(r),
        offsetLeft:el.offsetLeft,offsetTop:el.offsetTop,offsetParent:nodeName(el.offsetParent),
        scrollTop:el.scrollTop,scrollLeft:el.scrollLeft,scrollHeight:el.scrollHeight,scrollWidth:el.scrollWidth,
        clientHeight:el.clientHeight,clientWidth:el.clientWidth,
        width:s.width,minWidth:s.minWidth,maxWidth:s.maxWidth,
        inlineSize:s.inlineSize,minInlineSize:s.minInlineSize,maxInlineSize:s.maxInlineSize,
        position:s.position,display:s.display,overflow:s.overflow,overflowX:s.overflowX,overflowY:s.overflowY,
        gridTemplateColumns:s.gridTemplateColumns,gridAutoColumns:s.gridAutoColumns,
        flex:s.flex,flexBasis:s.flexBasis,justifySelf:s.justifySelf,alignSelf:s.alignSelf,
        transform:s.transform,translate:s.translate,contain:s.contain,clipPath:s.clipPath
      };
    };
    const chainOf=el=>{
      const chain=[];
      let p=el;
      for(let i=0;p&&i<24;i++,p=p.parentElement)chain.push(info(p));
      return chain;
    };
    const findControl=needle=>[...document.querySelectorAll('.omega-workstation-v2[data-panel="Modes"] button,.omega-workstation-v2[data-panel="Modes"] [role="button"]')].find(el=>{
      const label=(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
      return label===needle||label.startsWith(needle);
    });
    const snapshot=()=>({
      viewport:{innerWidth,innerHeight,scrollX,scrollY,visualViewport:window.visualViewport?{width:visualViewport.width,height:visualViewport.height,offsetLeft:visualViewport.offsetLeft,offsetTop:visualViewport.offsetTop,scale:visualViewport.scale}:null},
      scrollingElement:nodeName(document.scrollingElement),
      html:info(document.documentElement),body:info(document.body),root:info(document.getElementById('root')),
      r257:info(document.querySelector('.r257-shell')),stage:info(document.querySelector('.r257-stage')),
      workstation:info(document.querySelector('.omega-workstation-v2[data-panel="Modes"]')),
      main:info(document.querySelector('.omega-workstation-v2[data-panel="Modes"] .workstation-main')),
      surface:info(document.querySelector('.omega-workstation-v2[data-panel="Modes"] .omega-surface-r81')),
      app:info(document.querySelector('.omega-workstation-v2[data-panel="Modes"] .sbm21-app'))
    });
    const out={initial:snapshot(),controls:[]};
    for(const needle of labels){
      const el=findControl(needle);
      if(!el){out.controls.push({needle,missing:true});continue}
      const before={control:info(el),chain:chainOf(el),global:snapshot()};
      el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const nativeAfter={control:info(el),chain:chainOf(el),global:snapshot()};
      out.controls.push({needle,before,nativeAfter});
    }
    return out;
  },labels);

  console.log(`R313 MODES SCROLL DIAGNOSTIC ${JSON.stringify(diagnostic)}`);
  await context.close();
}finally{
  await browser.close();
}
