import { chromium } from '/Users/minikai/Dev/bjj-jikohyouka/node_modules/playwright/index.mjs';

// procedural3dvisuals — capture the Corona with the control rail visible, since
// the rail is what says "sandbox" rather than "a picture of a shader".
const URL = 'https://kai-denrei.github.io/procedural3dvisuals/?fx=corona';
const OUT = 'screenshots/procedural3dvisuals.png';
const VW = 800, VH = 500;
const browser = await chromium.launch({
  // WebGL is the entire page; headless needs a real GL backend.
  args: ['--use-gl=angle', '--use-angle=metal', '--enable-unsafe-swiftshader'],
});
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForFunction(() => window.fx && window.fx.current, null, { timeout: 25000 });
// Park on a frame with a full, symmetric ring rather than whatever rAF lands on.
await page.evaluate(() => {
  window.fx.state.paused = true;
  window.fx.state.time = 2.35;
  window.fx.current.material.uniforms.uTime.value = 2.35;
  document.body.classList.remove('hide-ui');       // localStorage may have hidden it
  const fab = document.getElementById('fab'); if (fab) fab.style.display = 'none';
  const badge = document.getElementById('cb-badge'); if (badge) badge.style.display = 'none';
});
await page.waitForTimeout(1200);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
