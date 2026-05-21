import { chromium } from 'playwright';

// Heptaweave opens on a landing with two mode glyphs (hourglass = timed,
// infinity = endless) — too sparse for a thumbnail. Tap the endless mode
// to land in a play screen showing the Cistercian numeral and the answer
// grid of heptacipher logograms.
const URL = 'https://kai-denrei.github.io/heptaweave/';
const OUT = 'screenshots/heptaweave.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500);

// Click the endless mode button (∞). Try by data-mode first, fall back to text.
const clicked = await page.evaluate(() => {
  const byData = document.querySelector('.mode-btn[data-mode="ENDLESS"]');
  if (byData) { byData.click(); return 'endless'; }
  const btns = Array.from(document.querySelectorAll('.mode-btn, button'));
  const target = btns.find(b => /∞|endless/i.test(b.textContent || ''));
  if (target) { target.click(); return 'fallback'; }
  return null;
});
console.log('mode click:', clicked);
await page.waitForTimeout(1500);

await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
