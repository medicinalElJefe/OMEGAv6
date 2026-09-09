import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.env.SAR_TEST_URL;
assert.ok(base, 'SAR_TEST_URL is required');
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X6ixNwAAAABJRU5ErkJggg==','base64');

const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const page = await browser.newPage({ viewport });
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror:${error.message}`));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(`console:${msg.text()}`); });
    await page.route(/https:\/\/gibs\.earthdata\.nasa\.gov\/.*/, route => route.fulfill({status:200,contentType:'image/png',body:tinyPng}));

    const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 20000 });
    assert.ok(response && response.ok(), `root HTTP failed at ${viewport.width}`);
    await page.waitForSelector('#map', { state:'visible', timeout:15000 });
    await page.waitForSelector('#jumpLocation', { state:'visible', timeout:15000 });
    await page.waitForTimeout(300);

    for (const selector of ['#map','#raster','#probeChart','#load','#timeline','#jumpLocation','#worldView','#sourceMode']) {
      const locator = page.locator(selector);
      assert.equal(await locator.count(), 1, `${selector} missing at ${viewport.width}`);
    }
    for (const selector of ['#map','#raster','#probeChart']) {
      const box = await page.locator(selector).boundingBox();
      assert.ok(box && box.width > 20 && box.height > 20, `${selector} has no usable display at ${viewport.width}`);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 2, `horizontal overflow ${overflow}px at ${viewport.width}`);

    await page.fill('#jumpLat','32.222600');
    await page.fill('#jumpLon','-110.974700');
    await page.click('#jumpLocation');
    await page.waitForFunction(() => (document.querySelector('#point')?.textContent || '').includes('32.22260'), null, {timeout:5000});
    assert.match(await page.textContent('#atlasAddress'), /A12/);

    const map = page.locator('#map');
    const box = await map.boundingBox();
    assert.ok(box);
    const beforePoint = await page.textContent('#point');
    await page.mouse.click(box.x + box.width * .62, box.y + box.height * .42);
    await page.waitForTimeout(150);
    const afterPoint = await page.textContent('#point');
    assert.notEqual(afterPoint, beforePoint, `map click did not select a new location at ${viewport.width}`);

    const beforeCanvas = await page.screenshot({fullPage:false});
    await page.mouse.move(box.x + box.width * .50, box.y + box.height * .50);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .70, box.y + box.height * .57, {steps:6});
    await page.mouse.up();
    await page.waitForTimeout(150);
    const afterCanvas = await page.screenshot({fullPage:false});
    assert.notDeepEqual(afterCanvas, beforeCanvas, `drag produced no visible change at ${viewport.width}`);

    await page.click('#worldView');
    await page.waitForTimeout(100);
    assert.deepEqual(errors.filter(x => !/favicon|Failed to load resource|ERR_BLOCKED_BY_CLIENT/i.test(x)), [], `browser errors at ${viewport.width}: ${errors.join(' | ')}`);
    await page.close();
  }
  console.log('SAR_RESCUE_BROWSER_PASS desktop+mobile startup, displays, jump, map click, pan, reset');
} finally {
  await browser.close();
}
