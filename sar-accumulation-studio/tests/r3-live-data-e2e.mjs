import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.SAR_TEST_URL;
assert.ok(base, 'SAR_TEST_URL is required');

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

  await page.selectOption('#sourceMode', 'stac');
  await page.fill('#maxResults', '12');
  await page.fill('#aoi', 'POINT(-110.9747 32.2226)');
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
  const rasterLoaded = /CALIBRATED GRD/i.test(rasterStats) && /PRODUCT LUT/i.test(rasterStats) && /PRODUCT_GCP_BILINEAR|NEAREST_GCP_FALLBACK/i.test(proof);

  const canvasPixels = await page.evaluate(() => {
    const c = document.querySelector('#raster');
    if (!c || !c.width || !c.height) return 0;
    const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let visible = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i]) visible++;
    return visible;
  });

  console.log(JSON.stringify({ statusText, obs, pixels, beforeFrame, afterFrame, rasterLoaded, rasterText, rasterStats, proof, canvasPixels, pageErrors, consoleErrors, failedRequests }, null, 2));
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.ok(rasterLoaded, `calibrated Sentinel-1 patch failed: ${rasterText}\n${rasterStats}\n${proof}\nrequest failures: ${failedRequests.join('\n')}`);
  assert.ok(canvasPixels > 1000, `calibrated patch rendered too few visible measurement pixels: ${canvasPixels}`);

  console.log('SAR_R3_CALIBRATED_LIVE_DATA_PASS');
} finally {
  await browser.close();
}
