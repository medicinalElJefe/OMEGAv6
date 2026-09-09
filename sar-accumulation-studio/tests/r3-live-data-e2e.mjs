import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.SAR_TEST_URL;
assert.ok(base, 'SAR_TEST_URL is required');

function near(a,b,tolerance){return Math.abs(Number(a)-Number(b))<=tolerance;}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('requestfailed', req => failedRequests.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'failed'}`));

  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 30000 });
  assert.ok(response?.ok(), `root failed: ${response?.status()}`);
  await page.waitForSelector('#load', { state: 'visible', timeout: 15000 });
  await page.waitForSelector('#sarCalControls', { state: 'attached', timeout: 15000 });
  await page.waitForSelector('#placeNavigator', { state: 'attached', timeout: 15000 });
  await page.waitForSelector('canvas.sar-earth-overlay', { state: 'attached', timeout: 15000 });

  assert.equal(await page.inputValue('#visual'), 'earth', 'primary instrument did not default to Earth + SAR evidence');
  await page.waitForFunction(() => /NASA GIBS/.test(document.querySelector('#contextStamp')?.textContent || ''), null, { timeout: 30000 });

  const earthSurface = await page.evaluate(() => {
    const c = document.querySelector('#map');
    const ctx = c?.getContext('2d');
    if (!c || !ctx || !c.width || !c.height) return null;
    const sx = Math.max(1, Math.floor(c.width / 36)), sy = Math.max(1, Math.floor(c.height / 20));
    const values=[];
    for(let y=Math.floor(sy/2);y<c.height;y+=sy)for(let x=Math.floor(sx/2);x<c.width;x+=sx){
      const p=ctx.getImageData(x,y,1,1).data;values.push((p[0]+p[1]+p[2])/3);
    }
    const mean=values.reduce((a,b)=>a+b,0)/values.length;
    const variance=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;
    return {mean,variance,min:Math.min(...values),max:Math.max(...values)};
  });
  assert.ok(earthSurface && earthSurface.variance > 35 && earthSurface.max-earthSurface.min > 25, `main field does not look like a real image surface: ${JSON.stringify(earthSurface)}`);

  await page.fill('#placeSearchInput', 'Tucson, Arizona');
  await page.click('#placeSearchForm button[type=submit]');
  await page.waitForSelector('#placeSearchResults .place-result:not(.loading):not(.empty)', { state: 'visible', timeout: 15000 });
  await page.locator('#placeSearchResults .place-result:not(.loading):not(.empty)').first().click();
  await page.waitForFunction(() => /Tucson/i.test(document.querySelector('#selectedPlaceName')?.textContent || '') || /Tucson/i.test(document.querySelector('#selectedPlaceRegion')?.textContent || ''), null, { timeout: 10000 });
  const jumpLat=Number(await page.inputValue('#jumpLat')),jumpLon=Number(await page.inputValue('#jumpLon'));
  assert.ok(near(jumpLat,32.22,0.35)&&near(jumpLon,-110.97,0.45),`place search did not navigate to Tucson: ${jumpLat}, ${jumpLon}`);
  assert.match(await page.inputValue('#aoi'),/^POINT\(-?\d+\.\d+ -?\d+\.\d+\)$/,'place navigation did not synchronize the SAR AOI');

  await page.selectOption('#sourceMode', 'stac');
  await page.fill('#maxResults', '12');
  await page.fill('#aoi', `POINT(${jumpLon.toFixed(6)} ${jumpLat.toFixed(6)})`);
  await page.click('#load');

  await page.waitForFunction(() => {
    const status = document.querySelector('#status');
    return status?.dataset.kind === 'ok' || status?.dataset.kind === 'error';
  }, null, { timeout: 45000 });

  const statusText = (await page.textContent('#status') || '').trim();
  const statusKind = await page.getAttribute('#status', 'data-kind');
  assert.equal(statusKind, 'ok', `live catalog failed: ${statusText}\nrequest failures: ${failedRequests.join('\n')}`);

  const obs = Number((await page.textContent('#obsCount') || '0').trim());
  const pixels = Number((await page.textContent('#pixelReady') || '0').trim());
  assert.ok(obs > 0, `expected real Sentinel-1 observations, got ${obs}`);
  assert.ok(pixels > 0, `expected at least one actual COG scene, got ${pixels}`);

  const beforeFrame = (await page.textContent('#frameIndex') || '').trim();
  await page.click('#prev');
  await page.waitForTimeout(150);
  const afterFrame = (await page.textContent('#frameIndex') || '').trim();
  assert.notEqual(afterFrame, beforeFrame, 'timeline navigation did not move to another real acquisition');

  const rasterButton = page.locator('#loadRaster');
  assert.equal(await rasterButton.isDisabled(), false, 'current real scene exposes no raster asset');
  await rasterButton.click();
  await page.waitForFunction(() => {
    const stats = document.querySelector('#rasterStats')?.textContent || '';
    const empty = document.querySelector('#rasterEmpty')?.textContent || '';
    return /CALIBRATED GRD/i.test(stats) || /Calibrated patch unavailable/i.test(empty);
  }, null, { timeout: 60000 });

  const rasterText = (await page.textContent('#rasterEmpty') || '').trim();
  const rasterStats = (await page.textContent('#rasterStats') || '').trim();
  const proof = (await page.textContent('#sarCalProof') || '').trim();
  const rasterLoaded = /CALIBRATED GRD/i.test(rasterStats) && /PRODUCT LUT/i.test(rasterStats) && /PRODUCT_GCP_BILINEAR|PRODUCT_GCP_LOCAL_TRIANGLE|NEAREST_GCP_FALLBACK/i.test(proof) && /PATCH_GEOREGISTERED_GCP_MESH|PATCH_GEOREGISTRATION_PARTIAL/i.test(proof);

  const canvasPixels = await page.evaluate(() => {
    const c = document.querySelector('#raster');
    if (!c || !c.width || !c.height) return 0;
    const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let visible = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]) visible++;
    return visible;
  });

  await page.waitForTimeout(250);
  const earthSarPixels = await page.evaluate(() => {
    const c=document.querySelector('canvas.sar-earth-overlay');
    if(!c||!c.width||!c.height)return 0;
    const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let visible=0;for(let i=3;i<data.length;i+=4)if(data[i]>8)visible++;return visible;
  });

  console.log(JSON.stringify({ statusText, obs, pixels, earthSurface, jumpLat, jumpLon, beforeFrame, afterFrame, rasterLoaded, rasterText, rasterStats, proof, canvasPixels, earthSarPixels, pageErrors, consoleErrors, failedRequests }, null, 2));
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.ok(rasterLoaded, `calibrated Sentinel-1 patch failed: ${rasterText}\n${rasterStats}\n${proof}\nrequest failures: ${failedRequests.join('\n')}`);
  assert.ok(canvasPixels > 1000, `calibrated patch rendered too few visible measurement pixels: ${canvasPixels}`);
  assert.ok(earthSarPixels > 250, `calibrated SAR did not visibly register onto the main Earth field: ${earthSarPixels}`);

  console.log('SAR_R3_EARTH_REGISTERED_LIVE_DATA_PASS');
} finally {
  await browser.close();
}
