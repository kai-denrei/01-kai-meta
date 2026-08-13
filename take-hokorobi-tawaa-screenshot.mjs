import { chromium } from 'playwright';

// HokorobiTawaa — mobile-first PWA tower defense on a procedural Stalberg
// board, monochrome Three.js wireframe. Give the board a few seconds to
// generate and render before capturing.
const URL = 'https://kai-denrei.github.io/HokorobiTawaa/';
const OUT = 'screenshots/hokorobi-tawaa.png';
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
