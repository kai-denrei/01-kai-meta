import { chromium } from 'playwright';

// laifu-keisan: tabletop life counter PWA. The page is empty until JS hydrates
// the radial player board, so wait a beat before snapping.
const URL = 'https://kai-denrei.github.io/laifu-keisan/';
const OUT = 'screenshots/laifu-keisan.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
// Dismiss the wake-lock advisory toast so the board shows clean.
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const got = btns.find(b => /got it/i.test(b.textContent || ''));
  if (got) got.click();
});
await page.waitForTimeout(500);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
