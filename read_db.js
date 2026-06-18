const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log("Loading page and waiting for Firebase Firestore sync...");
  await page.goto('file:///Users/abraham/.gemini/antigravity/scratch/cesars-gym-app/public/index.html');
  
  // Wait 4 seconds for Firestore onSnapshot to trigger and load the cache
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const membersData = await page.evaluate(() => {
    return localStorage.getItem('cg_members');
  });
  
  if (membersData) {
    const members = JSON.parse(membersData);
    console.log(`\nTotal registered members: ${members.length}`);
    console.log("\nList of all members:");
    members.forEach((m, idx) => {
      // Calculate status based on daysLeft function
      const today = new Date();
      today.setHours(0,0,0,0);
      const endD = new Date(m.end + 'T00:00:00');
      const diff = Math.round((endD - today) / 86400000);
      let status = 'active';
      if (diff < 0) status = 'expired';
      else if (diff <= 7) status = 'expiring';
      
      console.log(`${idx + 1}. Name: ${m.name} | End Date: ${m.end} | Days Left: ${diff} | Calculated Status: ${status}`);
    });
  } else {
    console.log("No members found in localStorage.");
  }
  
  await browser.close();
})();
