import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// Spherical Stalberg Grid (#td) — tower defense mode.
// Give the mesh a few seconds to generate and render before capturing.
const URL = 'https://kai-denrei.github.io/spherical-stalberg-grid/#td';
const OUT = 'screenshots/spherical-stalberg-grid-td.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForLoadState('load');
await page.waitForTimeout(3000);
// Dismiss the field-manual splash so the capture shows actual gameplay.
await page.keyboard.press('Space');
await page.waitForTimeout(1200);
await page.keyboard.press('Space');
// Hide the tweakpane control panel and let the intro banner clear.
// Hide the lil-gui debug panel and the tutorial callout banner.
await page.addStyleTag({ content: '.lil-gui, #td-callouts { display: none !important; }' });
await page.keyboard.down('w');
await page.waitForTimeout(2500);
await page.keyboard.up('w');
await page.waitForTimeout(12000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 800));
await browser.close();
console.log('wrote', OUT);
