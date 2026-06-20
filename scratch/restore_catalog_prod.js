const fs = require('fs');
const https = require('https');

const PROJECT_ID = 'cesarsgym-60653';
const API_KEY    = 'AIzaSyCvu1CdI0MP1_FirIHUyOXgh3yaYUgdK8w';
const DOC_URL    = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/store/cg_catalog?key=${API_KEY}`;

const catalogData = JSON.parse(fs.readFileSync('/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/reconstructed_catalog.json', 'utf8'));

// Format catalog array into Firestore REST API format
// Every item is a mapValue with fields: id, name, price, cat
const formattedValues = catalogData.map(item => {
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
      method: 'PATCH', // We can use PATCH to update/write the document
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

async function restore() {
  console.log(`📤 Restoring reconstructed catalog of ${catalogData.length} items to Firestore...`);
  // Use PATCH to write/create the document
  const { status, body } = await httpsPost(DOC_URL, postBody);
  
  if (status === 200) {
    console.log('✅ Catalog successfully restored to Firestore!');
  } else {
    console.error('❌ Failed to restore catalog:', status);
    console.error(JSON.stringify(body, null, 2));
  }
}

restore().catch(console.error);
