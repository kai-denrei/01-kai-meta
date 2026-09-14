import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// lab-satisfying-lasers — capture the Lab view with the parameter panel visible,
// since the panel + export buttons are what say "harvestable FX lab".
const URL = 'https://kai-denrei.github.io/lab-satisfying-lasers/#/lab';
const OUT = 'screenshots/lab-satisfying-lasers.png';
const VW = 800, VH = 500;
const browser = await chromium.launch({
  // WebGL is the entire page; headless needs a real GL backend.
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForSelector('#controls > *', { timeout: 25000 });
await page.evaluate(() => {
  // Default burst firing leaves the beam dark ~65% of the time; rate 0 = continuous fire.
  const rate = document.getElementById('burstRate');
  rate.value = 0; rate.dispatchEvent(new Event('input'));
  const badge = document.getElementById('cb-badge'); if (badge) badge.style.display = 'none';
});
await page.waitForTimeout(2000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
