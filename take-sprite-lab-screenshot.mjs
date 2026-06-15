import { chromium } from 'playwright';

// sprite-lab ("Sprite Lab"): a no-build in-browser sprite-sheet animation lab —
// ingest sheets, audition cycles, audit loop seams / registration / centroid
// drift, and export an engine bundle, GIF or code. Deep-linked to the
// "mr_blue" character's "shooter" cycle.
const URL = 'https://kai-denrei.github.io/sprite-lab/#mr_blue/shooter';
const OUT = 'screenshots/sprite-lab.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => {});
await page.waitForLoadState('load');
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
