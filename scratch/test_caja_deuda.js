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
  
  // 1. Add product to ticket
  await page.evaluate(() => {
    addToTicket('h2o');
  });
  
  // 2. Set customer name directly in DOM
  await page.evaluate(() => {
    document.getElementById('ticket-customer').value = 'TEST DEUDOR';
  });
  
  // 3. Click Pagar a la salida button
  console.log("Clicking Pagar a la salida (Deuda) button...");
  await page.evaluate(() => {
    const btn = document.querySelector('[data-method="Pendiente"]');
    if (btn) btn.click();
    else console.error("Pendiente button not found!");
  });
  
  // Verify that the button is now highlighted as active, and others are not
  const activeMethod = await page.evaluate(() => {
    const activeBtn = document.querySelector('.pay-method-btn.active');
    return activeBtn ? activeBtn.getAttribute('data-method') : null;
  });
  console.log("Active payment method in DOM after click:", activeMethod);
  
  // 4. Click cobrar
  console.log("Clicking REGISTRAR COBRO...");
  await page.evaluate(() => {
    cobrar();
  });
  
  // Wait 1s for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 5. Query localStorage (K_VENTAS) to verify if the last transaction is pending and has method 'Pendiente'
  const lastVenta = await page.evaluate(() => {
    const K_VENTAS = 'cg_ventas';
    const ventas = JSON.parse(localStorage.getItem(K_VENTAS) || '[]');
    return ventas[ventas.length - 1];
  });
  
  console.log('\n--- VERIFIED NEW TRANSACTION ---');
  console.log('Cliente:', lastVenta?.customer);
  console.log('Total:', lastVenta?.total);
  console.log('Metodo:', lastVenta?.method);
  console.log('Status:', lastVenta?.status);
  
  const success = 
    lastVenta?.customer === 'TEST DEUDOR' &&
    lastVenta?.total === 1.5 &&
    lastVenta?.method === 'Pendiente' &&
    lastVenta?.status === 'pending';
    
  if (success) {
    console.log('\n✅ TEST PASSED: Pagar a la salida (Deuda) works perfectly!');
  } else {
    console.error('\n❌ TEST FAILED: Transaction not recorded correctly.');
    process.exit(1);
  }
  
  await browser.close();
})();
