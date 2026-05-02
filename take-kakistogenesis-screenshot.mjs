import { chromium } from 'playwright';

// Capture the chamber tab (default landing tab) of kakistogenesis.
// Allow ~3s for the framer-motion particle animation to settle into a
// representative frame, then screenshot.

const URL = 'https://kai-denrei.github.io/kakistogenesis/';
const OUT = 'screenshots/kakistogenesis.png';
const VW = 800;
const VH = 500;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VW, height: VH },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(3000);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
