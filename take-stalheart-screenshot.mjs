import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// stalheart — landing view as a first-time visitor sees it.
const URL = 'https://kai-denrei.github.io/stalheart/';
const OUT = 'screenshots/stalheart.png';
const VW = 800, VH = 500;
const browser = await chromium.launch({
  // Several catalog pages are WebGL; headless needs a real GL backend.
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'load', timeout: 45000 });
await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.evaluate(() => {
  const badge = document.getElementById('cb-badge'); if (badge) badge.style.display = 'none';
});
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
