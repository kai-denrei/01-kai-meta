import { chromium } from 'playwright';

// Brumachlys II: a WEGO (simultaneous-resolution) turn-based game — proof of
// concept. Both sides lock in orders, then the turn resolves at once.
const URL = 'https://kai-denrei.github.io/brumachlys-ii/';
const OUT = 'screenshots/brumachlys-ii.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 10000 }).catch(() => {});
await page.waitForLoadState('load');
await page.waitForTimeout(2000);
// Start a battle so the card shows actual play, not the lobby.
try {
  await page.getByText('BATTLE', { exact: true }).click({ timeout: 5000 });
  await page.waitForTimeout(3500);
} catch (e) { console.log('battle click skipped:', e.message); }
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
const text = await page.evaluate(() => document.body.innerText);
console.log('=== PAGE TEXT ===\n' + text.slice(0, 1500));
await browser.close();
console.log('wrote', OUT);
