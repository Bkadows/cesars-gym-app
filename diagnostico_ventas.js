// Diagnóstico de ventas en Firestore - Cesar's Gym (REST API, sin firebase-admin)
// Ejecutar con: node diagnostico_ventas.js

const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';
const DOC_URL    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_ventas?key=${API_KEY}`;

const TODAY = new Date().toISOString().slice(0,10);

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

// Parsear valores de Firestore REST API
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
  console.log('📡 Consultando Firestore (REST API)...');
  console.log(`   Proyecto: ${PROJECT_ID}`);
  console.log(`   Fecha hoy: ${TODAY}\n`);

  const { status, body } = await httpsGet(DOC_URL);

  if (status !== 200) {
    console.error('❌ Error HTTP:', status);
    console.error(JSON.stringify(body, null, 2));
    process.exit(1);
  }

  // El documento tiene { fields: { data: <arrayValue|mapValue> } }
  let ventas = [];
  try {
    const dataField = body.fields?.data;
    if (!dataField) {
      console.log('⚠️  El documento cg_ventas existe pero no tiene campo "data".');
      console.log('Raw:', JSON.stringify(body, null, 2));
      process.exit(0);
    }
    const parsed = parseFirestoreValue(dataField);
    if (Array.isArray(parsed)) {
      ventas = parsed;
    } else {
      console.log('⚠️  El campo data no es un array:', typeof parsed);
      process.exit(0);
    }
  } catch(e) {
    console.error('Error parseando datos:', e.message);
    process.exit(1);
  }

  console.log(`📦 Total ventas en Firestore: ${ventas.length}`);

  const ventasHoy = ventas.filter(v => {
    const d = v.date || v.payDate || '';
    return d.startsWith(TODAY);
  });

  console.log(`📅 Ventas de HOY (${TODAY}): ${ventasHoy.length}\n`);

  if (ventasHoy.length === 0) {
    console.log('⚠️  NO HAY VENTAS DE HOY EN FIRESTORE.');

    // Mostrar últimas 15 ventas
    const ultimas = ventas.slice(-15).reverse();
    console.log('📋 Últimas ventas registradas en Firestore:');
    ultimas.forEach((v, i) => {
      const items = (v.items||[]).map(it => `${it.name||it.cat}(${it.qty||1})`).join(', ');
      const fecha = v.date || v.payDate || '?';
      console.log(`  [${i+1}] ${fecha} | Cliente: ${v.customer||'—'} | S/${v.total||0} | ${items}`);
    });
  } else {
    console.log('✅ VENTAS DE HOY EN FIRESTORE:\n');
    let totalHoy = 0;
    ventasHoy.forEach((v, i) => {
      const items = (v.items||[]).map(it => `${it.name||it.cat}(x${it.qty||1}) S/${it.price||0}`).join(', ');
      console.log(`  [${i+1}] ${v.date||v.payDate} | ${v.customer||'—'} | S/${v.total||0}`);
      console.log(`       Items: ${items}`);
      totalHoy += parseFloat(v.total)||0;
    });
    console.log(`\n  💰 TOTAL HOY: S/ ${totalHoy.toFixed(2)}`);

    const fs = require('fs');
    fs.writeFileSync('ventas_backup_hoy.json', JSON.stringify(ventasHoy, null, 2));
    console.log(`\n💾 Backup de ventas de hoy guardado en: ventas_backup_hoy.json`);
  }

  // Resumen por fecha (últimos 14 días)
  const porFecha = {};
  ventas.forEach(v => {
    const d = (v.date || v.payDate || 'sin-fecha').slice(0,10);
    porFecha[d] = (porFecha[d] || 0) + 1;
  });
  const fechas = Object.entries(porFecha).sort();
  console.log('\n📊 Distribución de ventas (últimas fechas):');
  fechas.slice(-10).forEach(([d, c]) => {
    const marker = d === TODAY ? ' ⬅ HOY' : '';
    console.log(`   ${d}: ${c} registros${marker}`);
  });
}

main().catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
