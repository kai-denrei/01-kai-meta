import { chromium } from 'playwright';

// mandala_cymatics: audio-reactive cymatic mandala. Without a mic the page sits
// "at rest" but the mandala structure still draws — let it settle, then snap.
const URL = 'https://kai-denrei.github.io/mandala_cymatics/';
const OUT = 'screenshots/mandala_cymatics.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
