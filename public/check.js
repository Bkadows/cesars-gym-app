const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR STACK:', err.stack || err.toString()));
  await page.goto('file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html');
  await page.evaluate(() => goTo('members'));
  await page.evaluate(() => goTo('historial'));
  await page.evaluate(() => goTo('inventario'));
  await browser.close();
})();

