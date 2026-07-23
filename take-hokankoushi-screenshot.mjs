import { chromium } from 'playwright';

// Neural Sheet / hokankoushi — a flat lattice folds onto 3-D shapes like a
// self-organizing map discovering the shape of data (with zero actual learning).
// Three.js animation; give the fold + sparkles a few seconds to develop.
const URL = 'https://kai-denrei.github.io/hokankoushi/';
const OUT = 'screenshots/hokankoushi.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForLoadState('load');
await page.waitForTimeout(4000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 800));
await browser.close();
console.log('wrote', OUT);
