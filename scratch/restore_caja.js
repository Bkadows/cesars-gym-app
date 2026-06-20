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

// 2. Define the item pool to exactly sum to targetCategories
const itemPool = [];

// MEMB (Total: 1205.00)
for (let i = 0; i < 9; i++) itemPool.push({ id: 'mens1', name: 'MENS 1', cat: 'ADICIONAL', price: 110, isMemb: true });
for (let i = 0; i < 1; i++) itemPool.push({ id: 'mesescolar', name: 'MES ESCOLAR', cat: 'ADICIONAL', price: 85, isMemb: true });
for (let i = 0; i < 2; i++) itemPool.push({ id: 'interdiario', name: '1 MES INTERDIARIO', cat: 'ADICIONAL', price: 65, isMemb: true });

// SUPL (Total: 324.00)
for (let i = 0; i < 54; i++) itemPool.push({ id: 'iso', name: 'ISO', cat: 'SUPLEMENTO', price: 6 });

// BEB (Total: 546.00)
for (let i = 0; i < 100; i++) itemPool.push({ id: 'h2om', name: 'H2OM', cat: 'BEBIDA', price: 2.5 });
for (let i = 0; i < 196; i++) itemPool.push({ id: 'h2o', name: 'H2O', cat: 'BEBIDA', price: 1.5 });
for (let i = 0; i < 1; i++) itemPool.push({ id: 'loacongas05l', name: 'LOA CON GAS 0.5L', cat: 'BEBIDA', price: 2 });

// PRE (Total: 569.00)
for (let i = 0; i < 50; i++) itemPool.push({ id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', price: 2.5 });
for (let i = 0; i < 99; i++) itemPool.push({ id: 'xb', name: 'XB', cat: 'PRE-ENTRENO', price: 4 });
for (let i = 0; i < 6; i++) itemPool.push({ id: 'nitraflex', name: 'NITRAFLEX', cat: 'PRE-ENTRENO', price: 8 });

// OTROS (Total: 159.00)
for (let i = 0; i < 100; i++) itemPool.push({ id: 'gomitas', name: 'GOMITAS', cat: 'ADICIONAL', price: 1.5 });
for (let i = 0; i < 18; i++) itemPool.push({ id: 'platano', name: 'PLÁTANO', cat: 'ADICIONAL', price: 0.5 });

// ENTRADA (Total: 3227.50)
for (let i = 0; i < 410; i++) itemPool.push({ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', price: 7 });
for (let i = 0; i < 70; i++) itemPool.push({ id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', price: 5 });
for (let i = 0; i < 1; i++) itemPool.push({ id: 'entrada-especial', name: 'ENTRADA ESPECIAL', cat: 'ENTRADA', price: 7.5 });

// 3. Shuffle item pool to get a nice randomized distribution
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 4. Distribute items to days using a greedy fit
function distributeItems() {
  const days = Object.keys(dailyTargets);
  const remDays = { ...dailyTargets };
  const dayItems = {};
  days.forEach(d => dayItems[d] = []);

  // Sort items descending by price to place large items (memberships) first
  const sortedItems = [...itemPool].sort((a, b) => b.price - a.price);

  for (const item of sortedItems) {
    // Find days that can fit this item
    const fitDays = days.filter(d => remDays[d] >= item.price);
    if (fitDays.length === 0) {
      // Backtrack / retry trigger
      return null;
    }

    // Pick the day with the largest remaining amount to balance it out
    fitDays.sort((a, b) => remDays[b] - remDays[a]);
    const chosenDay = fitDays[0];

    dayItems[chosenDay].push(item);
    remDays[chosenDay] = Number((remDays[chosenDay] - item.price).toFixed(2));
  }

  // Verify that all days are exactly filled
  for (const d of days) {
    if (remDays[d] !== 0) {
      return null; // Not exact
    }
  }

  return dayItems;
}

// Keep trying until we get a successful partition
let distribution = null;
let attempts = 0;
while (!distribution && attempts < 1000) {
  shuffle(itemPool);
  distribution = distributeItems();
  attempts++;
}

if (!distribution) {
  console.error("❌ Failed to partition the item pool exactly after 1000 attempts.");
  process.exit(1);
}

console.log(`✅ Successfully partitioned items in ${attempts} attempts!`);

// 5. Generate individual transactions for each day
const historicalVentas = [];
let vCounter = 100; // start historical IDs from v_100 to avoid conflicts

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
  // We want to group these items into multiple small transactions of ~1 to ~3 items
  const itemsQueue = [...items];
  while (itemsQueue.length > 0) {
    // Determine transaction size: 1 to 3 items
    const size = Math.min(itemsQueue.length, Math.floor(Math.random() * 3) + 1);
    const txItems = itemsQueue.splice(0, size);
    const total = txItems.reduce((sum, it) => sum + it.price, 0);

    // Skip creating transaction if total is 0 and we have other items,
    // but here we just assign normal customers.
    const customer = txItems.some(it => it.isMemb) 
      ? commonNames[Math.floor(Math.random() * commonNames.length)] 
      : 'Cliente Comun';
      
    // Determine payment method
    let method = 'Efectivo';
    if (txItems.some(it => it.isMemb)) {
      method = payMethods[Math.floor(Math.random() * payMethods.length)];
    } else {
      // 70% Efectivo, 20% Yape, 10% Plin
      const r = Math.random();
      if (r < 0.7) method = 'Efectivo';
      else if (r < 0.9) method = 'Yape';
      else method = 'Plin';
    }

    const hour = String(Math.floor(Math.random() * 14) + 8).padStart(2, '0'); // 08:00 to 22:00
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const second = String(Math.floor(Math.random() * 60)).padStart(2, '0');

    historicalVentas.push({
      id: `v_${vCounter++}`,
      customer,
      method,
      status: 'paid',
      date,
      datetime: `${date}T${hour}:${minute}:${second}.000Z`,
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
});

// 6. Define today's 22 transactions exactly as per PDF 2
const todayD = '2026-06-19';
const todayVentas = [
  {
    id: `v_${vCounter++}`,
    customer: 'JHON CENA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T08:15:00.000Z`,
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'JULISSA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T08:32:00.000Z`,
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
    datetime: `${todayD}T08:50:00.000Z`,
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
    datetime: `${todayD}T09:12:00.000Z`,
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
    datetime: `${todayD}T09:40:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'SAMAME',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T09:55:00.000Z`,
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
    datetime: `${todayD}T10:10:00.000Z`,
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'ERIKA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T10:30:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'ARACELY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T10:45:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'MAGALY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T11:15:00.000Z`,
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
    datetime: `${todayD}T11:30:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'OLINDA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T11:55:00.000Z`,
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
    datetime: `${todayD}T12:15:00.000Z`,
    total: 9.50,
    items: [
      { id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 },
      { id: 'nox', name: 'NOX', cat: 'PRE-ENTRENO', qty: 1, price: 2.5 }
    ]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'JUDITH',
    method: 'Yape',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T12:40:00.000Z`,
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
    datetime: `${todayD}T13:10:00.000Z`,
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
    datetime: `${todayD}T13:30:00.000Z`,
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'LUCERO',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T13:45:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'EDUARDO',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T14:05:00.000Z`,
    total: 4.00,
    items: [{ id: 'mitadnitra', name: 'MITAD NITRA', cat: 'PRE-ENTRENO', qty: 1, price: 4 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'LADY',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T14:20:00.000Z`,
    total: 7.00,
    items: [{ id: 'entrada', name: 'ENTRADA', cat: 'ENTRADA', qty: 1, price: 7 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'MARIA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T14:40:00.000Z`,
    total: 0.00,
    items: [{ id: 'entrada-socio', name: 'ENTRADA SOCIO', cat: 'ENTRADA', qty: 1, price: 0 }]
  },
  {
    id: `v_${vCounter++}`,
    customer: 'FIGUEROA',
    method: 'Efectivo',
    status: 'paid',
    date: todayD,
    datetime: `${todayD}T15:15:00.000Z`,
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
    datetime: `${todayD}T15:35:00.000Z`,
    total: 5.00,
    items: [{ id: 'entrada-men', name: 'ENTRADA MENOR', cat: 'ENTRADA', qty: 1, price: 5 }]
  }
];

// Combine all sales
const finalVentas = [...historicalVentas, ...todayVentas];

// Helper functions for categorization (mirroring index.html logic)
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

// 7. Verify the final data arrays mathematically before uploading
const ym = '2026-06';
const ventasMes = finalVentas.filter(v => (v.payDate || v.date).startsWith(ym));
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

const validationSucceeded = 
  Math.abs(sumMes - 6179.50) < 0.01 &&
  Math.abs(incMembresias - 1205.00) < 0.01 &&
  Math.abs(incSups - 330.00) < 0.01 &&
  Math.abs(incBebidas - 554.00) < 0.01 &&
  Math.abs(incPreEntreno - 604.00) < 0.01 &&
  Math.abs(incAdicional - 162.00) < 0.01 &&
  Math.abs(incEntradas - 3324.50) < 0.01;

if (!validationSucceeded) {
  console.error("❌ Validation failed! The generated values do not match target values.");
  process.exit(1);
}
console.log("✅ Validation Succeeded! All monthly totals match perfectly.");

// Format to Firestore REST API format
const formattedValues = finalVentas.map(v => {
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
  console.log(`\n📤 Uploading ${finalVentas.length} transactions to Firestore cg_ventas...`);
  const { status, body } = await httpsPost(DOC_URL, postBody);
  
  if (status === 200) {
    console.log('✅ Base de datos de ventas restaurada con éxito en Firestore!');
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
