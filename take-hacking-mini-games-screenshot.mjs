import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// hacking-mini-games — capture the landing view.
const URL = 'https://kai-denrei.github.io/hacking-mini-games/';
const OUT = 'screenshots/hacking-mini-games.png';
// Content is vertically centered and overflows a 500px viewport, so shoot
// a taller 16:10 window and downscale to the catalog's 800x500 card size.
const VW = 1200, VH = 750;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForLoadState('load');
await page.waitForTimeout(2500);
// Page may auto-scroll; reset to the hero before capturing.
await page.evaluate(() => { window.scrollTo(0, 0); document.scrollingElement.scrollTop = 0; });
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 800));
await browser.close();
console.log('wrote', OUT);
