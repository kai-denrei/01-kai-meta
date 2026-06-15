import { chromium } from 'playwright';

// pazorukore ("パズルコア · PazoruKore" — "Puzzle Core"): a minimalist
// score-and-stars puzzle game with ten stages and a perfect-run achievement.
const URL = 'https://kai-denrei.github.io/pazorukore/';
const OUT = 'screenshots/pazorukore.png';
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
