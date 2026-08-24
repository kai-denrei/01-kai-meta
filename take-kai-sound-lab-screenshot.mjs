import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// Kai Sound Lab — synthesized game/UI sound recipes. Select a preset before
// capturing so the detail pane isn't the empty-state placeholder.
const URL = 'https://kai-denrei.github.io/kai-sound-lab/';
const OUT = 'screenshots/kai-sound-lab.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForLoadState('load');
await page.waitForTimeout(4000);
await page.getByText('Confirm', { exact: true }).first().click().catch(() => {});
await page.waitForTimeout(1500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 800));
await browser.close();
console.log('wrote', OUT);
