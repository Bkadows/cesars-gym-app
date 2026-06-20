const fs = require('fs');
const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';

const CATALOG_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_catalog?key=${API_KEY}`;
const STOCK_URL   = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_stock?key=${API_KEY}`;

// Load catalog
const catalogPath = '/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/reconstructed_catalog.json';
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Check if the 4 missing products are already in the catalog, if not add them
const missingProducts = [
  { id: 'suerox', name: 'SUEROX', price: 7.50, cat: 'BEBIDA' },
  { id: 'flashlyte', name: 'FLASHLYTE', price: 4.50, cat: 'BEBIDA' },
  { id: 'bigm1kg', name: 'BIGM 1KG', price: 90.00, cat: 'SUPLEMENTO' },
  { id: 'nitro1kg', name: 'NITRO 1KG', price: 90.00, cat: 'SUPLEMENTO' }
];

missingProducts.forEach(mp => {
  if (!catalogData.find(p => p.id === mp.id)) {
    catalogData.push(mp);
  }
});

// Format catalog array into Firestore REST API format
const formattedCatalog = catalogData.map(item => {
  return {
    mapValue: {
      fields: {
        id: { stringValue: item.id },
        name: { stringValue: item.name },
        price: { doubleValue: Number(item.price) },
        cat: { stringValue: item.cat }
      }
    }
  };
});

// Set up the stock object from screenshots and user text
const stockObject = {
  h2o: 174,
  h2om: 107,
  h2og: 24,
  h2ogloal: 20,
  generade: 4,
  energizante: 14,
  monster: 5,
  fury: 26,
  bigm: 23,
  iso: 41,
  loaconsabor: 30,
  kero: 9,
  suerox: 9,
  flashlyte: 2,
  bigm1kg: 2,
  nitro1kg: 3,
  xb: 35
};

// Format stock map into Firestore REST API format
const formattedStockFields = {};
for (const [k, v] of Object.entries(stockObject)) {
  formattedStockFields[k] = { integerValue: String(v) };
}

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

async function restoreAll() {
  console.log(`📤 Restoring complete catalog of ${catalogData.length} items to Firestore...`);
  const catalogBody = {
    fields: {
      data: {
        arrayValue: {
          values: formattedCatalog
        }
      }
    }
  };
  const catRes = await httpsPost(CATALOG_URL, catalogBody);
  if (catRes.status === 200) {
    console.log('✅ Catalog successfully restored to Firestore!');
  } else {
    console.error('❌ Failed to restore catalog:', catRes.status, catRes.body);
  }

  console.log(`📤 Restoring stock quantities to Firestore...`);
  const stockBody = {
    fields: {
      data: {
        mapValue: {
          fields: formattedStockFields
        }
      }
    }
  };
  const stockRes = await httpsPost(STOCK_URL, stockBody);
  if (stockRes.status === 200) {
    console.log('✅ Stock successfully restored to Firestore!');
  } else {
    console.error('❌ Failed to restore stock:', stockRes.status, stockRes.body);
  }
}

restoreAll().catch(console.error);
