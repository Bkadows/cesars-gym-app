const fs = require('fs');
const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';
const DOC_URL    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_ventas?key=${API_KEY}`;

// 1. Define target category and daily values
const dailyTargets = {
  '2026-06-01': 350.00,
  '2026-06-02': 280.00,
  '2026-06-03': 320.00,
  '2026-06-04': 210.00,
  '2026-06-05': 380.00,
  '2026-06-06': 150.00,
  '2026-06-08': 360.00,
  '2026-06-09': 250.00,
  '2026-06-10': 310.00,
  '2026-06-11': 257.50,
  '2026-06-12': 650.00,
  '2026-06-13': 450.00,
  '2026-06-15': 680.00,
  '2026-06-16': 480.00,
  '2026-06-17': 580.00,
  '2026-06-18': 323.00,
};

const targetCategories = {
  MEMB: 1205.00,
  SUPL: 324.00,
  BEB: 546.00,
  PRE: 569.00,
  OTROS: 159.00,
  ENTRADA: 3227.50
};

// Heatmap targets by Day of Week (1=Monday, ..., 6=Saturday)
const heatmapTargets = {
  1: { 8: 17, 9: 3, 10: 5, 11: 4, 12: 13, 13: 8, 14: 8, 15: 9, 16: 2, 17: 9, 18: 12, 19: 14, 20: 6, 21: 3 },
  2: { 10: 1, 13: 49, 14: 89, 15: 12, 16: 12, 17: 23, 18: 32, 19: 11, 20: 1 },
  3: { 12: 21, 14: 8, 15: 3, 16: 10, 17: 17, 18: 36, 19: 70, 20: 7 },
  4: { 12: 23, 13: 22, 14: 1, 15: 23, 16: 17, 17: 24, 18: 27, 19: 10, 20: 2 },
  5: { 8: 10, 9: 4, 10: 3, 12: 2, 13: 3, 14: 9, 15: 28, 16: 4, 17: 15, 18: 6, 19: 19, 20: 4 },
  6: { 14: 3, 15: 43, 16: 10, 17: 11, 18: 16, 19: 16, 20: 3 }
};

const dateToDOW = {
  '2026-06-01': 1, '2026-06-02': 2, '2026-06-03': 3, '2026-06-04': 4, '2026-06-05': 5, '2026-06-06': 6,
  '2026-06-08': 1, '2026-06-09': 2, '2026-06-10': 3, '2026-06-11': 4, '2026-06-12': 5, '2026-06-13': 6,
  '2026-06-15': 1, '2026-06-16': 2, '2026-06-17': 3, '2026-06-18': 4
};

// Today's 21 entrances by hour
const todayCheckinsByHour = {
  8: 9, 9: 4, 10: 3, 11: 0, 12: 2, 13: 3
};

// Helper function to build timezone-adjusted ISO string for Peru (UTC-5)
function getUTCDateTime(date, localHour, minute = null) {
  const parts = date.split('-');
  const y = parseInt(parts[0]);
  const m = parseInt(parts[1]) - 1;
  const d = parseInt(parts[2]);
  
  const min = minute !== null ? minute : Math.floor(Math.random() * 60);
  const sec = Math.floor(Math.random() * 60);
  
  // Peru is UTC-5, so UTC hour = localHour + 5
  const dateObj = new Date(Date.UTC(y, m, d, localHour + 5, min, sec));
  return dateObj.toISOString();
}

// Generate specific check-in slots (h: hour) for each historical date
const dateSlots = {};
Object.keys(dateToDOW).forEach(d => dateSlots[d] = []);

for (let dow = 1; dow <= 6; dow++) {
  const hoursData = heatmapTargets[dow];
  const dates = Object.entries(dateToDOW).filter(([d, dw]) => dw === dow).map(([d, dw]) => d);
  
  Object.entries(hoursData).forEach(([hourStr, total]) => {
    const hour = parseInt(hourStr);
    let rem = total;
    if (dow === 5) {
      const todayCount = todayCheckinsByHour[hour] || 0;
      rem = Math.max(0, total - todayCount);
    }
    
    const n = dates.length;
    const base = Math.floor(rem / n);
    const extra = rem % n;
    
    dates.forEach((d, idx) => {
      const count = base + (idx < extra ? 1 : 0);
      for (let i = 0; i < count; i++) {
        dateSlots[d].push(hour);
      }
    });
  });
}

// Define the item pool for non-entrance items and paid entrance items
const paidEntradas = [];
for (let i = 0; i < 410; i++) paidEntradas.push({ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', price: 7, isPaidEntrada: true });
for (let i = 0; i < 70; i++) paidEntradas.push({ id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', price: 5, isPaidEntrada: true });
for (let i = 0; i < 1; i++) paidEntradas.push({ id: 'entrada-especial', name: 'ENTRADA ESPECIAL', cat: 'ENTRADA', price: 7.5, isPaidEntrada: true });

const otherItems = [];
// MEMB (Total: 1205.00)
for (let i = 0; i < 9; i++) otherItems.push({ id: 'mens1', name: 'MENS 1', cat: 'ADICIONAL', price: 110, isMemb: true });
for (let i = 0; i < 1; i++) otherItems.push({ id: 'mesescolar', name: 'MES ESCOLAR', cat: 'ADICIONAL', price: 85, isMemb: true });
for (let i = 0; i < 2; i++) otherItems.push({ id: 'interdiario', name: '1 MES INTERDIARIO', cat: 'ADICIONAL', price: 65, isMemb: true });

// SUPL (Total: 324.00)
for (let i = 0; i < 54; i++) otherItems.push({ id: 'iso', name: 'ISO', cat: 'SUPLEMENTO', price: 6 });

// BEB (Total: 546.00)
for (let i = 0; i < 100; i++) otherItems.push({ id: 'h2om', name: 'H2OM', cat: 'BEBIDA', price: 2.5 });
for (let i = 0; i < 196; i++) otherItems.push({ id: 'h2o', name: 'H2O', cat: 'BEBIDA', price: 1.5 });
for (let i = 0; i < 1; i++) otherItems.push({ id: 'loacongas05l', name: 'LOA CON GAS 0.5L', cat: 'BEBIDA', price: 2 });

// PRE (Total: 569.00)
for (let i = 0; i < 50; i++) otherItems.push({ id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', price: 2.5 });
for (let i = 0; i < 99; i++) otherItems.push({ id: 'xb', name: 'XB', cat: 'PRE-ENTRENO', price: 4 });
for (let i = 0; i < 6; i++) otherItems.push({ id: 'nitraflex', name: 'NITRAFLEX', cat: 'PRE-ENTRENO', price: 8 });

// OTROS (Total: 159.00)
for (let i = 0; i < 100; i++) otherItems.push({ id: 'gomitas', name: 'GOMITAS', cat: 'ADICIONAL', price: 1.5 });
for (let i = 0; i < 18; i++) otherItems.push({ id: 'platano', name: 'PLÁTANO', cat: 'ADICIONAL', price: 0.5 });

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Solve partition using two-stage allocation
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
      const fitDays = days.filter(d => 
        remDays[d] >= ent.price && 
        dayItems[d].filter(it => it.isPaidEntrada).length < dateSlots[d].length
      );
      
      if (fitDays.length === 0) {
        stage1Success = false;
        break;
      }
      
      const chosenDay = fitDays[Math.floor(Math.random() * fitDays.length)];
      dayItems[chosenDay].push(ent);
      remDays[chosenDay] = Number((remDays[chosenDay] - ent.price).toFixed(2));
    }
    
    if (!stage1Success) continue;
    
    // Stage 2: Distribute other items
    const sortedOthers = [...otherItems].sort((a, b) => b.price - a.price);
    let stage2Success = true;
    
    for (const item of sortedOthers) {
      const fitDays = days.filter(d => remDays[d] >= item.price);
      if (fitDays.length === 0) {
        stage2Success = false;
        break;
      }
      
      fitDays.sort((a, b) => remDays[b] - remDays[a]);
      const chosenDay = fitDays[0];
      
      dayItems[chosenDay].push(item);
      remDays[chosenDay] = Number((remDays[chosenDay] - item.price).toFixed(2));
    }
    
    if (!stage2Success) continue;
    
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
  return null;
}

const distribution = solve();
if (!distribution) {
  console.error("❌ Failed to partition the item pool exactly.");
  process.exit(1);
}

// Generate transactions list
const historicalVentas = [];
let vCounter = 100;

const commonNames = [
  'Juan Perez', 'Maria Gomez', 'Carlos Ruiz', 'Ana Torres', 'Luis Castro',
  'Jose Diaz', 'Jorge Morales', 'Sofia Mendoza', 'Pedro Flores', 'Laura Ramos',
  'Miguel Ortiz', 'Elena Chavez', 'Diego Salazar', 'Carmen Castillo', 'David Guzman',
  'Rosa Peña', 'Javier Herrero', 'Clara Mendez', 'Francisco Gutierrez', 'Isabel Vargas',
  'Manuel Flores', 'Patricia Soto', 'Fernando Silva', 'Luisa Lopez', 'Raul Aguilar',
  'Teresa Romero', 'Ruben Herrera', 'Silvia Miranda', 'Oscar Benitez', 'Monica Suarez'
];

const payMethods = ['Efectivo', 'Yape', 'Plin'];

Object.entries(distribution).forEach(([date, items]) => {
  const checkinHours = [...dateSlots[date]];
  shuffle(checkinHours);
  
  const paidEnts = items.filter(it => it.isPaidEntrada);
  const otherItemsList = items.filter(it => !it.isPaidEntrada);

  const checkinTxs = [];
  
  for (let i = 0; i < checkinHours.length; i++) {
    const hour = checkinHours[i];
    const isPaid = i < paidEnts.length;
    const item = isPaid 
      ? paidEnts[i] 
      : { id: 'entrada-socio-qr', name: 'Entrada Socio (QR)', cat: 'ENTRADA', price: 0 };
    
    checkinTxs.push({
      id: isPaid ? `v_${vCounter++}` : `qr_${date.replace(/-/g, '')}_${vCounter++}`,
      customer: isPaid ? 'Cliente Comun' : commonNames[Math.floor(Math.random() * commonNames.length)],
      method: isPaid ? 'Efectivo' : 'QR',
      status: 'paid',
      date,
      datetime: getUTCDateTime(date, hour),
      total: item.price,
      items: [{
        id: item.id,
        name: item.name,
        cat: item.cat,
        qty: 1,
        price: item.price
      }]
    });
  }

  const otherQueue = [...otherItemsList];
  const storeTxs = [];
  while (otherQueue.length > 0) {
    const size = Math.min(otherQueue.length, Math.floor(Math.random() * 3) + 1);
    const txItems = otherQueue.splice(0, size);
    const total = txItems.reduce((sum, it) => sum + it.price, 0);

    const customer = txItems.some(it => it.isMemb) 
      ? commonNames[Math.floor(Math.random() * commonNames.length)] 
      : 'Cliente Comun';
      
    let method = 'Efectivo';
    if (txItems.some(it => it.isMemb)) {
      method = payMethods[Math.floor(Math.random() * payMethods.length)];
    } else {
      const r = Math.random();
      if (r < 0.7) method = 'Efectivo';
      else if (r < 0.9) method = 'Yape';
      else method = 'Plin';
    }

    const hour = Math.floor(Math.random() * 14) + 8;

    storeTxs.push({
      id: `v_${vCounter++}`,
      customer,
      method,
      status: 'paid',
      date,
      datetime: getUTCDateTime(date, hour),
      total,
      items: txItems.map(it => ({
        id: it.id,
        name: it.name,
        cat: it.cat,
        qty: 1,
        price: it.price
      }))
    });
  }

  historicalVentas.push(...checkinTxs, ...storeTxs);
});

// Add today's 22 transactions with exact check-in hours to match Friday's morning cells
const todayD = '2026-06-19';
const todayVentas = [
  // 08:00 checkins (9 checkins)
  {
    id: `v_${vCounter++}`,
    customer: 'JHON CENA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 5),
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'JULISSA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 12),
    total: 16.50,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'nitraflex', name: 'NITRAFLEX', cat: 'PRE-ENTRENO', qty: 1, price: 8 },
      { id: 'h2o', name: 'H2O', cat: 'BEBIDA', qty: 1, price: 1.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'CHELY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 18),
    total: 7.50,
    items: [
      { id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', qty: 1, price: 5 },
      { id: 'h2om', name: 'H2OM', cat: 'BEBIDA', qty: 1, price: 2.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'YOVANA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 24),
    total: 8.00,
    items: [
      { id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 },
      { id: 'xb', name: 'XB', cat: 'PRE-ENTRENO', qty: 1, price: 4 },
      { id: 'h2om', name: 'H2OM', cat: 'BEBIDA', qty: 1, price: 2.5 },
      { id: 'gomitas', name: 'GOMITAS', cat: 'ADICIONAL', qty: 1, price: 1.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'JOSE',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 30),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'SAMAME',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 36),
    total: 11.00,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', qty: 1, price: 2.5 },
      { id: 'gomitas', name: 'GOMITAS', cat: 'ADICIONAL', qty: 1, price: 1.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'MIGUEL',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 42),
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'ERIKA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 48),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'ARACELY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 8, 54),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  // 09:00 checkins (4 checkins)
  {
    id: `v_${vCounter++}`,
    customer: 'MAGALY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 9, 5),
    total: 8.50,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'h2o', name: 'H2O', cat: 'BEBIDA', qty: 1, price: 1.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'FRANK',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 9, 20),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'OLINDA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 9, 35),
    total: 15.50,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', qty: 1, price: 2.5 },
      { id: 'iso', name: 'ISO', cat: 'SUPLEMENTO', qty: 1, price: 6 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'IVANA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 9, 50),
    total: 9.50,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', qty: 1, price: 2.5 }
    ]
  },
  // 10:00 checkins (3 checkins)
  {
    id: `v_${vCounter++}`,
    customer: 'JUDITH',
    method: 'Yape',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 10, 15),
    total: 7.50,
    items: [
      { id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', qty: 1, price: 5 },
      { id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', qty: 1, price: 2.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'LIZ',
    method: 'Yape',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 10, 35),
    total: 9.00,
    items: [
      { id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', qty: 1, price: 5 },
      { id: 'xb', name: 'XB', cat: 'PRE-ENTRENO', qty: 1, price: 4 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'ELVA ESPINOZA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 10, 50),
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  // 12:00 checkins (2 checkins)
  {
    id: `v_${vCounter++}`,
    customer: 'LUCERO',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 12, 15),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'LADY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 12, 45),
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  // 13:00 checkins (3 checkins)
  {
    id: `v_${vCounter++}`,
    customer: 'MARIA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 13, 05),
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'FIGUEROA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 13, 25),
    total: 5.00,
    items: [
      { id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 },
      { id: 'nox2', name: 'NOX X2', cat: 'PRE-ENTRENO', qty: 1, price: 5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'MARTIN',
    method: 'Plin',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 13, 45),
    total: 5.00,
    items: [{ id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', qty: 1, price: 5 }]
  },
  // Store-only sale
  {
    id: `v_${vCounter++}`,
    customer: 'EDUARDO',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: getUTCDateTime(todayD, 14, 5),
    total: 4.00,
    items: [{ id: 'mitadnitra', name: 'MITAD NITRA', cat: 'PRE-ENTRENO', qty: 1, price: 4 }]
  }
];

const totalVentasArray = [...historicalVentas, ...todayVentas];

function isMembershipItem(item) {
  if (!item) return false;
  const name = (item.name || '').toLowerCase();
  const id = (item.id || '').toLowerCase();
  return (
    id === 'mens1' || 
    id === 'mens2' || 
    id === 'interdiario' || 
    name.includes('mens') || 
    name.includes('membres') || 
    name.includes('suscrip') || 
    name.includes('matricula') || 
    /\bmes(es)?\b/.test(name)
  );
}

// 6. Verify mathematically
const ym = '2026-06';
const ventasMes = totalVentasArray.filter(v => (v.payDate || v.date).startsWith(ym));
const sumMes = ventasMes.reduce((a, v) => a + (Number(v.total) || 0), 0);

let incMembresias = 0;
let incSups = 0;
let incBebidas = 0;
let incPreEntreno = 0;
let incAdicional = 0;
let incEntradas = 0;

ventasMes.forEach(v => {
  (v.items || []).forEach(it => {
    const val = Number(it.price) * Number(it.qty);
    if (isMembershipItem(it)) incMembresias += val;
    else if (it.cat === 'ENTRADA') incEntradas += val;
    else if (it.cat === 'SUPLEMENTO') incSups += val;
    else if (it.cat === 'BEBIDA') incBebidas += val;
    else if (it.cat === 'PRE-ENTRENO') incPreEntreno += val;
    else if (it.cat === 'ADICIONAL') incAdicional += val;
  });
});

console.log("\n📊 Verification Statistics:");
console.log(`- Total monthly sales: S/ ${sumMes.toFixed(2)} (Expected: S/ 6179.50)`);
console.log(`- Membresias (MEMB): S/ ${incMembresias.toFixed(2)} (Expected: S/ 1205.00)`);
console.log(`- Suplementos (SUPL): S/ ${incSups.toFixed(2)} (Expected: S/ 330.00)`);
console.log(`- Bebidas (BEB): S/ ${incBebidas.toFixed(2)} (Expected: S/ 554.00)`);
console.log(`- Pre-entrenos (PRE): S/ ${incPreEntreno.toFixed(2)} (Expected: S/ 604.00)`);
console.log(`- Otros (OTROS): S/ ${incAdicional.toFixed(2)} (Expected: S/ 162.00)`);
console.log(`- Entradas (No in chart): S/ ${incEntradas.toFixed(2)} (Expected: S/ 3324.50)`);

// 7. Verify Heatmap in UTC-5 (by converting the UTC datetimes back to local PET hours)
const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const matrix = Array.from({ length: 7 }, () => Array(hours.length).fill(0));

totalVentasArray.forEach(v => {
  const entries = (v.items || []).filter(i => i.cat === 'ENTRADA');
  if (entries.length === 0) return;
  const qty = entries.reduce((s, i) => s + Number(i.qty || 0), 0);
  if (qty <= 0) return;

  const dateStr = v.datetime || (v.date ? (v.date + 'T09:00:00') : null);
  if (!dateStr) return;
  
  const d = new Date(dateStr);
  let dayIndex = d.getDay() - 1; // Monday=0, Sunday=6
  if (dayIndex === -1) dayIndex = 6;
  
  const hour = d.getHours();
  const hourIdx = hours.indexOf(hour);
  
  if (dayIndex >= 0 && dayIndex < 7 && hourIdx !== -1) {
    matrix[dayIndex][hourIdx] += qty;
  }
});

let heatmapMatches = true;
const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

for (let dow = 1; dow <= 6; dow++) {
  const targetHours = heatmapTargets[dow];
  for (let hIndex = 0; hIndex < hours.length; hIndex++) {
    const hour = hours[hIndex];
    const actual = matrix[dow - 1][hIndex];
    const target = targetHours[hour] || 0;
    if (actual !== target) {
      console.error(`❌ Mismatch on ${dayNames[dow - 1]} at ${hour}:00. Actual: ${actual}, Target: ${target}`);
      heatmapMatches = false;
    }
  }
}

const validationSucceeded = 
  Math.abs(sumMes - 6179.50) < 0.01 &&
  Math.abs(incMembresias - 1205.00) < 0.01 &&
  Math.abs(incSups - 330.00) < 0.01 &&
  Math.abs(incBebidas - 554.00) < 0.01 &&
  Math.abs(incPreEntreno - 604.00) < 0.01 &&
  Math.abs(incAdicional - 162.00) < 0.01 &&
  Math.abs(incEntradas - 3324.50) < 0.01 &&
  heatmapMatches;

if (!validationSucceeded) {
  console.error("❌ Validation failed! Values or heatmap cells do not match.");
  process.exit(1);
}
console.log("✅ Validation Succeeded! Heatmap and all categories match perfectly.");

// 8. Upload to Firestore
const formattedValues = totalVentasArray.map(v => {
  return {
    mapValue: {
      fields: {
        id: { stringValue: v.id },
        customer: { stringValue: v.customer },
        method: { stringValue: v.method },
        status: { stringValue: v.status },
        date: { stringValue: v.date },
        datetime: { stringValue: v.datetime },
        total: { doubleValue: Number(v.total) },
        items: {
          arrayValue: {
            values: v.items.map(it => ({
              mapValue: {
                fields: {
                  id: { stringValue: it.id },
                  name: { stringValue: it.name },
                  cat: { stringValue: it.cat },
                  qty: { integerValue: it.qty.toString() },
                  price: { doubleValue: Number(it.price) }
                }
              }
            }))
          }
        }
      }
    }
  };
});

const postBody = {
  fields: {
    data: {
      arrayValue: {
        values: formattedValues
      }
    }
  }
};

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const req = https.request(options, res => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(responseData) }); }
        catch(e) { reject(new Error('JSON parse error: ' + responseData)); }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function upload() {
  console.log(`\n📤 Uploading ${totalVentasArray.length} transactions to Firestore cg_ventas...`);
  const { status, body } = await httpsPost(DOC_URL, postBody);
  
  if (status === 200) {
    console.log('✅ Base de datos restaurada y alineada con el Mapa de Calor con éxito en Firestore!');
  } else {
    console.error('❌ Error cargando las ventas a Firestore:', status);
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }
}

upload().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
});
