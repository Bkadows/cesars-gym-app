const puppeteer = require('/Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto('file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html');
  
  // Wait 4 seconds for Firestore sync
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const data = await page.evaluate(() => {
    return {
      catalog: JSON.parse(localStorage.getItem('cg_catalog') || 'null'),
      stock: JSON.parse(localStorage.getItem('cg_stock') || 'null'),
      ventasCount: JSON.parse(localStorage.getItem('cg_ventas') || '[]').length
    };
  });
  
  console.log('--- FIRESTORE / LOCALSTORAGE STATE ---');
  console.log('Ventas count:', data.ventasCount);
  console.log('Stock:', data.stock);
  console.log('Catalog count:', data.catalog ? data.catalog.length : 'null');
  console.log('Catalog list:', data.catalog);
  
  await browser.close();
})();
