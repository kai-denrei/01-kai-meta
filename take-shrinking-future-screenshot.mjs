import { chromium } from 'playwright';

// shrinking-future: "The Future Shrinks" — the live dashboard, whose organic decision tree is
// the signature visual. Desktop layout needs width > 860 (below that the grid stacks), so shoot
// wide. Dots flow in on a canvas overlay once JS hydrates; wait before snapping.
const URL = 'https://kai-denrei.github.io/shrinking-future/dashboard.html';
const OUT = 'screenshots/shrinking-future.png';
const VW = 1600, VH = 1000;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT, '(then: cwebp -q 82', OUT, '-o screenshots/shrinking-future.webp)');
