import { chromium } from 'playwright';

// 8-bit-elements: classical elements as 8-bit cellular/raster simulations. The
// page shows a "Loading…" splash until JS hydrates the canvas, so wait for the
// sim to start animating before snapping.
const URL = 'https://kai-denrei.github.io/8-bit-elements/';
const OUT = 'screenshots/8-bit-elements.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
