import { chromium } from 'playwright';

// animation-primitives: the twelve principles of animation illustrated with
// live code. The demos animate continuously, so let the first clock tick settle
// before snapping.
const URL = 'https://kai-denrei.github.io/animation-primitives/';
const OUT = 'screenshots/animation-primitives.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
