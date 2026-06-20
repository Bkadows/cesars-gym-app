const fs = require('fs');

const catalogPath = '/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/reconstructed_catalog.json';
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const h2o = catalog.find(p => p.id === 'h2o');
if (h2o) {
  h2o.price = 1.5;
  console.log("Updated h2o price to 1.5 in JSON");
} else {
  console.log("h2o not found in JSON!");
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
