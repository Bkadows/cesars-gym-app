const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';
const DOC_URL    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_asistencias?key=${API_KEY}`;

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

async function run() {
  const { status, body } = await httpsGet(DOC_URL);
  console.log('Status:', status);
  if (status === 200) {
    const data = body.fields?.data?.arrayValue?.values || [];
    console.log('cg_asistencias count:', data.length);
    if (data.length > 0) {
      console.log('First 5 items:', JSON.stringify(data.slice(0, 5), null, 2));
    }
  } else {
    console.log('Error:', body);
  }
}

run();
