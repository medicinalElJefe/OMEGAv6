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
    const text = document.querySelector('#rasterEmpty')?.textContent || '';
    return !/Reading Cloud Optimized GeoTIFF ranges/i.test(text);
  }, null, { timeout: 60000 });
  const rasterText = (await page.textContent('#rasterEmpty') || '').trim();
  const rasterStats = (await page.textContent('#rasterStats') || '').trim();
  const rasterLoaded = !/Raster unavailable|No actual COG raster loaded/i.test(rasterText) && /ACTUAL GRD/i.test(rasterStats);

  console.log(JSON.stringify({ statusText, obs, pixels, beforeFrame, afterFrame, rasterLoaded, rasterText, rasterStats, pageErrors, consoleErrors, failedRequests }, null, 2));
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(' | ')}`);
  assert.ok(rasterLoaded, `real COG raster failed: ${rasterText}\n${rasterStats}\nrequest failures: ${failedRequests.join('\n')}`);

  console.log('SAR_R3_LIVE_DATA_PASS');
} finally {
  await browser.close();
}
