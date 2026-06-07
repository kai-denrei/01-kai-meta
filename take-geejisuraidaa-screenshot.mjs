import { chromium } from 'playwright';

// geejisuraidaa ("ゲージスライダー" — gauge slider): "eight controls · one contract".
// A set of gauge/slider input controls sharing a single interaction contract.
const URL = 'https://kai-denrei.github.io/geejisuraidaa/';
const OUT = 'screenshots/geejisuraidaa.png';
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
