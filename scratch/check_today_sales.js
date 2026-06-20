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

async function main() {
  const { status, body } = await httpsGet(DOC_URL);
  if (status !== 200) {
    console.error('HTTP Error:', status);
    process.exit(1);
  }
  const dataField = body.fields?.data;
  const ventas = parseFirestoreValue(dataField) || [];
  const hoy = ventas.filter(v => (v.date || v.payDate || '').startsWith('2026-06-19'));
  console.log(`Encontradas ${hoy.length} ventas de hoy (2026-06-19) en Firestore:`);
  hoy.forEach((v, i) => {
    const items = (v.items||[]).map(it => `${it.name}(x${it.qty}) S/${it.price}`).join(', ');
    console.log(`[${i+1}] Cliente: ${v.customer} | Total: S/${v.total} | Metodo: ${v.method} | Items: ${items} | Time: ${v.datetime}`);
  });
}
main().catch(console.error);
