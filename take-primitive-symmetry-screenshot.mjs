import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// primitive-symmetry — capture the landing view.
// The catalog entry has always pointed at screenshots/primitive-symmetry.webp,
// but the file was never captured, so that card rendered broken.
const URL = 'https://kai-denrei.github.io/primitive-symmetry/';
const OUT = 'screenshots/primitive-symmetry.png';
const VW = 800, VH = 500;
const browser = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForLoadState('load');
await page.waitForTimeout(5000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 400));
await browser.close();
console.log('wrote', OUT);
