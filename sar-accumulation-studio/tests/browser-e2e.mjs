import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.SAR_TEST_URL || 'http://127.0.0.1:8765/';
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X6ixNwAAAABJRU5ErkJggg==','base64');
const countries = {type:'FeatureCollection',features:[{type:'Feature',properties:{ADMIN:'United States of America'},geometry:{type:'Polygon',coordinates:[[[-125,24],[-66,24],[-66,50],[-125,50],[-125,24]]]}}]};
const nominatim = {display_name:'Tucson, Pima County, Arizona, United States',name:'Tucson',category:'place',type:'city',address:{city:'Tucson',county:'Pima County',state:'Arizona',country:'United States'}};

const browser = await chromium.launch({headless:true});
try {
  for (const viewport of [{width:1440,height:1000},{width:900,height:900},{width:390,height:844}]) {
    const page = await browser.newPage({viewport});
    const consoleErrors=[];
    page.on('console',msg=>{ if(msg.type()==='error') consoleErrors.push(msg.text()); });
    page.on('pageerror',err=>consoleErrors.push(err.message));
    await page.route('**nominatim.openstreetmap.org/reverse**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(nominatim)}));
    await page.route('**natural-earth-vector@ca96624a/**',route=>route.fulfill({status:200,contentType:'application/geo+json',body:JSON.stringify(countries)}));
    await page.route('**gibs.earthdata.nasa.gov/**',route=>route.fulfill({status:200,contentType:'image/png',body:tinyPng}));

    try {
      await page.goto(base,{waitUntil:'commit',timeout:15000});
      await page.waitForSelector('#map',{state:'visible',timeout:15000});
      await page.waitForSelector('#earthLocationConsole',{state:'visible',timeout:15000});
      await page.waitForSelector('#canonConsole',{state:'visible',timeout:15000});
      await page.waitForSelector('#nisarNativeConsole',{state:'visible',timeout:15000});
    } catch (error) {
      console.error(`STARTUP_FAILURE ${viewport.width}x${viewport.height}: ${error.message}`);
      console.error(`URL ${page.url()}`);
      console.error(`BODY_PREFIX ${(await page.locator('body').innerText().catch(()=>'' )).slice(0,1000)}`);
      console.error(`CONSOLE ${consoleErrors.join(' | ')}`);
      throw error;
    }
    await page.waitForTimeout(200);

    const overflow = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
    assert.ok(overflow <= 2, `horizontal overflow ${overflow}px at ${viewport.width}`);

    for (const selector of ['#map','#raster','#probeChart','#canonConsole','#nisarNativeConsole','#earthLocationConsole']) {
      const box=await page.locator(selector).boundingBox();
      assert.ok(box && box.width>20 && box.height>20, `${selector} not visibly mounted at ${viewport.width}`);
    }

    await page.fill('#jumpLat','32.222600');
    await page.fill('#jumpLon','-110.974700');
    await page.click('#jumpLocation');
    await page.waitForFunction(()=>document.querySelector('#earthSelectedCoords')?.textContent.includes('32.222600'),null,{timeout:10000});
    await page.waitForFunction(()=>document.querySelector('#earthPlaceName')?.textContent==='Tucson',null,{timeout:10000});
    assert.match(await page.textContent('#earthPlaceRegion'),/Arizona/);

    const map=page.locator('#map');
    const box=await map.boundingBox();
    assert.ok(box);
    await page.mouse.move(box.x+box.width*.58,box.y+box.height*.44);
    await page.waitForFunction(()=>!/move over map/.test(document.querySelector('#earthHoverCoords')?.textContent||''),null,{timeout:5000});

    const beforeCenter=await page.textContent('#earthViewCenter');
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.68,box.y+box.height*.56,{steps:6});
    await page.mouse.up();
    await page.waitForTimeout(100);
    const afterCenter=await page.textContent('#earthViewCenter');
    assert.notEqual(afterCenter,beforeCenter,'drag pan did not change map center');

    const beforeScale=parseFloat((await page.textContent('#earthViewScale')).replace('×',''));
    await page.locator('[data-map-command="zoom-in"]').click();
    await page.waitForTimeout(80);
    const afterScale=parseFloat((await page.textContent('#earthViewScale')).replace('×',''));
    assert.ok(afterScale>beforeScale,'zoom-in control did not increase scale');

    await page.locator('[data-map-command="world"]').click();
    await page.waitForTimeout(80);
    assert.equal(await page.textContent('#earthViewScale'),'1.00×');
    assert.equal(await page.textContent('#earthViewCenter'),'0.000000, 0.000000');

    const health=await page.locator('#earthSurfaceHealth span').allTextContents();
    for(const name of ['Earth map','Sentinel raster','Browse','Probe','Atlas','Ledger','Canon','NISAR']){
      assert.ok(health.some(x=>x.includes(`${name} MOUNTED`)),`${name} surface not mounted`);
    }

    const serious=consoleErrors.filter(e=>!/favicon|Failed to load resource|ERR_BLOCKED_BY_CLIENT/i.test(e));
    assert.deepEqual(serious,[],`browser errors at ${viewport.width}: ${serious.join(' | ')}`);
    await page.close();
  }
  console.log('SAR_BROWSER_E2E_PASS desktop/tablet/mobile map + surface interaction');
} finally {
  await browser.close();
}
