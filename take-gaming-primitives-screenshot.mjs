import { chromium } from 'playwright';
// Land on /primitives (the catalog page) — the / route auto-opens a search modal
// that occludes the hero, and /primitives has richer visual content anyway.
const URL = 'https://kai-denrei.github.io/gaming-primitives/p/';
const OUT = 'screenshots/gaming-primitives.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2000);
// Auto-opened search palette overlays the header; close it by hiding the panel
// (the close button on this site only narrows the panel; setting display:none
// removes it entirely from the screenshot).
await page.evaluate(() => {
  const panel = document.getElementById('gp-search');
  if (panel) panel.style.display = 'none';
});
await page.waitForTimeout(300);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
