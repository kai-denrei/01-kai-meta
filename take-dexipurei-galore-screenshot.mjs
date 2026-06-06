import { chromium } from 'playwright';

// dexipurei-galore ("ディスプレイ galore"): a gallery of display simulators —
// type text and watch it render across seven-segment, split-flap, dot-matrix and
// other readout styles. The gallery grid of live previews is the card hero.
const URL = 'https://kai-denrei.github.io/dexipurei-galore/';
const OUT = 'screenshots/dexipurei-galore.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
// Let the SW settle and any one-time reload finish, then let the simulators animate.
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => {});
await page.waitForLoadState('load');
await page.waitForTimeout(2500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
