const fs = require('fs');

const path1 = '/Users/abraham/Downloads/cesars_gym_dashboard_2026-06.csv';
const path2 = '/Users/abraham/Downloads/cesars_gym_dashboard_2026-06-2.csv';

function inspectCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`\n--- Inspecting: ${filePath} ---`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  console.log(`Total lines: ${lines.length}`);
  console.log('First 20 lines:');
  console.log(lines.slice(0, 20).join('\n'));
}

inspectCSV(path1);
inspectCSV(path2);
