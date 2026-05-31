import { chromium } from 'playwright';

// periodic-table-of-play: "Every game is made of verbs" — a scroll-driven essay
// that takes mechanics apart and rebuilds them from primitives. Hero viewport
// carries the thesis line and the verb list, which is what we want on the card.
const URL = 'https://kai-denrei.github.io/periodic-table-of-play/';
const OUT = 'screenshots/periodic-table-of-play.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
