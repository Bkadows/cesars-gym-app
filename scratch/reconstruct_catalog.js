const fs = require('fs');
const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';
const DOC_URL    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_ventas?key=${API_KEY}`;

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch(e) { reject(new Error('JSON parse error: ' + data)); }
      });
    }).on('error', reject);
  });
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue'  in val) return val.stringValue;
  if ('integerValue' in val) return parseInt(val.integerValue);
  if ('doubleValue'  in val) return parseFloat(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue'    in val) return null;
  if ('arrayValue'   in val) return (val.arrayValue.values || []).map(parseFirestoreValue);
  if ('mapValue'     in val) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  return String(val);
}

async function reconstruct() {
  console.log('📡 Fetching sales to reconstruct catalog...');
  const { status, body } = await httpsGet(DOC_URL);
  
  if (status !== 200) {
    console.error('❌ Failed to fetch sales:', status);
    return;
  }
  
  let ventas = [];
  try {
    const dataField = body.fields?.data;
    if (dataField) {
      ventas = parseFirestoreValue(dataField) || [];
    }
  } catch(e) {
    console.error('Error parsing sales:', e.message);
    return;
  }
  
  console.log(`📦 Found ${ventas.length} sales. Reconstructing products...`);
  
  const productsMap = new Map();
  
  ventas.forEach(v => {
    const items = v.items || [];
    items.forEach(it => {
      if (it && it.id) {
        // We exclude standard membership plans if they were not part of catalog,
        // but it is safer to include everything that has cat and price.
        productsMap.set(it.id, {
          id: it.id,
          name: it.name || it.id.toUpperCase(),
          price: Number(it.price) || 0,
          cat: it.cat || 'ADICIONAL'
        });
      }
    });
  });
  
  const reconstructedCatalog = Array.from(productsMap.values());
  console.log(`\n✨ Reconstructed ${reconstructedCatalog.length} unique products from sales history:`);
  console.log(JSON.stringify(reconstructedCatalog, null, 2));
  
  // Write to a temporary file
  fs.writeFileSync('/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/reconstructed_catalog.json', JSON.stringify(reconstructedCatalog, null, 2));
  console.log(`\n💾 Saved reconstructed catalog to reconstructed_catalog.json`);
}

reconstruct().catch(console.error);
