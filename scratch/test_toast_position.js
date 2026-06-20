const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1200, height: 1200 });
  
  // Navigate to index.html
  const fileUrl = 'file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html';
  await page.goto(fileUrl);
  
  console.log("Loading page and waiting for Firestore sync (3s)...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Trigger a toast notification
  console.log("Triggering toast notification...");
  await page.evaluate(() => {
    toast('Cobrado S/ 7.00 — Efectivo');
  });
  
  // Wait 200ms for animation
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Get position of the toast element
  const boundingBox = await page.evaluate(() => {
    const el = document.getElementById('toast');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right
    };
  });
  
  console.log('\n--- VERIFIED TOAST POSITION ---');
  console.log('Top (Y):', boundingBox?.top);
  console.log('Left (X):', boundingBox?.left);
  console.log('Width:', boundingBox?.width);
  console.log('Height:', boundingBox?.height);
  
  // Centered verification: left + width/2 should be close to 600 (50% of 1200 viewport width)
  const centerLine = boundingBox ? (boundingBox.left + boundingBox.width / 2) : 0;
  console.log('Center Line X:', centerLine);
  
  const isTop = boundingBox && boundingBox.top < 100;
  const isCentered = Math.abs(centerLine - 600) < 5;
  
  if (isTop && isCentered) {
    console.log('\n✅ TEST PASSED: Toast notification is centered at the top of the screen!');
  } else {
    console.error('\n❌ TEST FAILED: Toast notification position is incorrect.');
    process.exit(1);
  }
  
  await browser.close();
})();
