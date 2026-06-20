const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1200, height: 1200 });
  
  // Navigate to index.html
  const fileUrl = 'file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html';
  await page.goto(fileUrl);
  
  console.log("Loading dashboard and waiting for Firestore sync (5s)...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const metrics = await page.evaluate(() => {
    return {
      today: document.getElementById('kpi-hoy-val')?.textContent?.trim(),
      month: document.getElementById('kpi-mes-val')?.textContent?.trim(),
      active: document.getElementById('kpi-activos-val')?.textContent?.trim(),
      avg: document.getElementById('income-range-avg')?.textContent?.trim(),
      legend: document.getElementById('dash-mix-legend')?.innerHTML?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')?.trim(),
      cajaSection: document.querySelector('.caja-grid')?.textContent?.replace(/\s+/g, ' ')?.trim()
    };
  });
  
  console.log('\n--- VERIFIED METRICS ---');
  console.log('Ingresos Hoy:', metrics.today);
  console.log('Ingresos del Mes:', metrics.month);
  console.log('Miembros Activos:', metrics.active);
  console.log('Promedio Diario (7d):', metrics.avg);
  console.log('Distribución Categorías:', metrics.legend);
  console.log('Resumen de hoy en Caja:', metrics.cajaSection);
  
  // Take screenshot
  const screenshotPath = '/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/restored_dashboard.png';
  await page.screenshot({ path: screenshotPath });
  console.log(`\nScreenshot saved to: ${screenshotPath}`);
  
  await browser.close();
})();
