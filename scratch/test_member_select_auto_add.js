const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1200, height: 1200 });
  
  // Navigate to index.html
  const fileUrl = 'file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html';
  await page.goto(fileUrl);
  
  console.log("Loading page and waiting for Firestore sync (5s)...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Switch to Caja tab
  console.log("Navigating to Caja tab...");
  await page.evaluate(() => {
    goTo('caja');
  });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Seed mock active member in localStorage after the initial sync
  console.log("Seeding mock active member in localStorage...");
  await page.evaluate(() => {
    const K_MEMBERS = 'cg_members';
    const members = JSON.parse(localStorage.getItem(K_MEMBERS) || '[]');
    // Add Renato Delgado if not exists
    if (!members.some(m => m.name === 'RENATO DELGADO')) {
      const today = new Date();
      const end = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()).toISOString().slice(0, 10);
      members.push({
        id: 'mock_renato',
        name: 'RENATO DELGADO',
        plan: 'Mensual',
        start: today.toISOString().slice(0, 10),
        end: end,
        phone: '999999999'
      });
      localStorage.setItem(K_MEMBERS, JSON.stringify(members));
    }
  });
  
  // Type 'RENATO' in customer input to trigger suggestions
  console.log("Typing 'RENATO' in customer input...");
  await page.type('#ticket-customer', 'RENATO');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if suggestions are open
  const isSuggestionsOpen = await page.evaluate(() => {
    return document.getElementById('member-suggestions').classList.contains('open');
  });
  console.log("Suggestions open:", isSuggestionsOpen);
  
  // Click on the suggestion
  console.log("Clicking on Renato Delgado suggestion...");
  await page.evaluate(() => {
    const sug = document.querySelector('#member-suggestions .member-suggestion');
    if (sug) sug.click();
    else console.error("Renato Delgado suggestion element not found!");
  });
  
  // Wait 500ms
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Verify that customer input value is set and DOM contains the ENTRADA SOCIO row
  const state = await page.evaluate(() => {
    const customerVal = document.getElementById('ticket-customer').value;
    const ticketItem = document.querySelector('.ticket-row-swipe-wrap[data-prod-id="entrada-socio"]');
    const itemName = ticketItem ? ticketItem.querySelector('.ticket-name')?.textContent : null;
    return {
      customerVal,
      hasEntradaSocio: !!ticketItem,
      itemName
    };
  });
  
  console.log('\n--- VERIFIED AUTO-ADD STATE ---');
  console.log('Cliente en Input:', state.customerVal);
  console.log('Tiene Entrada Socio en DOM:', state.hasEntradaSocio);
  console.log('Nombre del item en DOM:', state.itemName);
  
  const success = 
    state.customerVal === 'RENATO DELGADO' &&
    state.hasEntradaSocio &&
    state.itemName === 'ENTRADA SOCIO';
    
  if (success) {
    console.log('\n✅ TEST PASSED: ENTRADA SOCIO is automatically added to the ticket on member suggestion click!');
  } else {
    console.error('\n❌ TEST FAILED: ENTRADA SOCIO was not auto-added.');
    process.exit(1);
  }
  
  await browser.close();
})();
