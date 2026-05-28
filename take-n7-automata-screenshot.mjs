import { chromium } from 'playwright';

// n7-automata: a 7-element cyclic cellular automaton on a hex grid. It animates
// continuously, so let it evolve a couple seconds into a rich state before snapping.
const URL = 'https://kai-denrei.github.io/n7-automata/';
const OUT = 'screenshots/n7-automata.png';
const VW = 800, VH = 500;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(2800);
await page.screenshot({ path: OUT, clip: { x: 0, y: 0, width: VW, height: VH } });
await browser.close();
console.log('wrote', OUT);
