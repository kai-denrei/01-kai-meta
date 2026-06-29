import { chromium } from 'playwright';

// Dorje Sempa / "The Path" — a calm, scholarly guide to the Karma Kagyu
// lineage, Diamond Way Buddhism and the Vajrayāna, with Tibetan script set
// as a typographic art object.
const URL = 'https://kai-denrei.github.io/dorje-sempa/';
const OUT = 'screenshots/dorje-sempa.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => {});
await page.waitForLoadState('load');
await page.waitForTimeout(2000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 1500));
await browser.close();
console.log('wrote', OUT);
