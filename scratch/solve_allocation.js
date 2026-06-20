const dailyTargets = {
  '2026-06-01': 350.00, '2026-06-02': 280.00, '2026-06-03': 320.00, '2026-06-04': 210.00,
  '2026-06-05': 380.00, '2026-06-06': 150.00, '2026-06-08': 360.00, '2026-06-09': 250.00,
  '2026-06-10': 310.00, '2026-06-11': 257.50, '2026-06-12': 650.00, '2026-06-13': 450.00,
  '2026-06-15': 680.00, '2026-06-16': 480.00, '2026-06-17': 580.00, '2026-06-18': 323.00,
};

// Checkin slot capacities from heatmap calculation
const dateSlotCapacities = {
  '2026-06-01': 41, '2026-06-02': 80, '2026-06-03': 60, '2026-06-04': 53,
  '2026-06-05': 45, '2026-06-06': 53, '2026-06-08': 39, '2026-06-09': 77,
  '2026-06-10': 57, '2026-06-11': 50, '2026-06-12': 41, '2026-06-13': 49,
  '2026-06-15': 33, '2026-06-16': 73, '2026-06-17': 55, '2026-06-18': 46
};

// Items pools
const paidEntradas = [];
for (let i = 0; i < 410; i++) paidEntradas.push({ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', price: 7 });
for (let i = 0; i < 70; i++) paidEntradas.push({ id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', price: 5 });
for (let i = 0; i < 1; i++) paidEntradas.push({ id: 'entrada-especial', name: 'ENTRADA ESPECIAL', cat: 'ENTRADA', price: 7.5 });

const otherItems = [];
for (let i = 0; i < 9; i++) otherItems.push({ id: 'mens1', name: 'MENS 1', cat: 'ADICIONAL', price: 110, isMemb: true });
for (let i = 0; i < 1; i++) otherItems.push({ id: 'mesescolar', name: 'MES ESCOLAR', cat: 'ADICIONAL', price: 85, isMemb: true });
for (let i = 0; i < 2; i++) otherItems.push({ id: 'interdiario', name: '1 MES INTERDIARIO', cat: 'ADICIONAL', price: 65, isMemb: true });
for (let i = 0; i < 54; i++) otherItems.push({ id: 'iso', name: 'ISO', cat: 'SUPLEMENTO', price: 6 });
for (let i = 0; i < 100; i++) otherItems.push({ id: 'h2om', name: 'H2OM', cat: 'BEBIDA', price: 2.5 });
for (let i = 0; i < 196; i++) otherItems.push({ id: 'h2o', name: 'H2O', cat: 'BEBIDA', price: 1.5 });
for (let i = 0; i < 1; i++) otherItems.push({ id: 'loacongas05l', name: 'LOA CON GAS 0.5L', cat: 'BEBIDA', price: 2 });
for (let i = 0; i < 50; i++) otherItems.push({ id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', price: 2.5 });
for (let i = 0; i < 99; i++) otherItems.push({ id: 'xb', name: 'XB', cat: 'PRE-ENTRENO', price: 4 });
for (let i = 0; i < 6; i++) otherItems.push({ id: 'nitraflex', name: 'NITRAFLEX', cat: 'PRE-ENTRENO', price: 8 });
for (let i = 0; i < 100; i++) otherItems.push({ id: 'gomitas', name: 'GOMITAS', cat: 'ADICIONAL', price: 1.5 });
for (let i = 0; i < 18; i++) otherItems.push({ id: 'platano', name: 'PLÁTANO', cat: 'ADICIONAL', price: 0.5 });

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function solve() {
  const days = Object.keys(dailyTargets);
  
  for (let attempt = 0; attempt < 5000; attempt++) {
    const remDays = { ...dailyTargets };
    const dayItems = {};
    days.forEach(d => dayItems[d] = []);
    
    // Stage 1: Distribute paid entrances
    shuffle(paidEntradas);
    let stage1Success = true;
    
    for (const ent of paidEntradas) {
      // Find days that can fit this entrance under both revenue and checkin capacity constraints
      const fitDays = days.filter(d => 
        remDays[d] >= ent.price && 
        dayItems[d].filter(it => it.cat === 'ENTRADA').length < dateSlotCapacities[d]
      );
      
      if (fitDays.length === 0) {
        stage1Success = false;
        break;
      }
      
      // Choose a day randomly from fitDays to avoid getting stuck in local minima
      const chosenDay = fitDays[Math.floor(Math.random() * fitDays.length)];
      dayItems[chosenDay].push(ent);
      remDays[chosenDay] = Number((remDays[chosenDay] - ent.price).toFixed(2));
    }
    
    if (!stage1Success) continue;
    
    // Stage 2: Distribute other items to match remaining targets exactly
    const sortedOthers = [...otherItems].sort((a, b) => b.price - a.price);
    let stage2Success = true;
    
    for (const item of sortedOthers) {
      const fitDays = days.filter(d => remDays[d] >= item.price);
      if (fitDays.length === 0) {
        stage2Success = false;
        break;
      }
      
      // Sort fitDays by remaining capacity descending
      fitDays.sort((a, b) => remDays[b] - remDays[a]);
      const chosenDay = fitDays[0];
      
      dayItems[chosenDay].push(item);
      remDays[chosenDay] = Number((remDays[chosenDay] - item.price).toFixed(2));
    }
    
    if (!stage2Success) continue;
    
    // Double check that all days are exactly met
    let exact = true;
    for (const d of days) {
      if (remDays[d] !== 0) {
        exact = false;
        break;
      }
    }
    
    if (exact) {
      console.log(`✅ Success after ${attempt} attempts!`);
      return dayItems;
    }
  }
  
  console.log("❌ Failed to find a solution after 5000 attempts.");
  return null;
}

const result = solve();
if (result) {
  Object.entries(result).forEach(([d, items]) => {
    const paidCount = items.filter(it => it.cat === 'ENTRADA').length;
    const capacity = dateSlotCapacities[d];
    console.log(`  Day ${d}: ${items.length} items, ${paidCount}/${capacity} paid entrances`);
  });
}
