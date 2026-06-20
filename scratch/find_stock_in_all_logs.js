const fs = require('fs');
const readline = require('readline');

async function searchTranscript() {
  const filePath = '/Users/abraham/.gemini/antigravity/brain/e417cfe6-20ab-4a24-9e16-87415554e979/.system_generated/logs/transcript_full.jsonl';
  
  if (!fs.existsSync(filePath)) {
    console.error("Transcript file not found at " + filePath);
    return;
  }
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  console.log("Scanning entire transcript for stock object patterns...");
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    
    // Check if the line has a JSON structure containing h2o, creature, nitro, xb, etc. with numbers
    if (line.includes('cg_stock') || line.includes('K_STOCK')) {
      // Find all matches for {"h2o": ...} or similar patterns
      // A typical stock object would be like: "h2o": 12 or {"h2o":12
      // Let's print sections of lines that have K_STOCK or cg_stock
      const idx = line.indexOf('cg_stock');
      if (idx !== -1) {
        const start = Math.max(0, idx - 100);
        const end = Math.min(line.length, idx + 1000);
        console.log(`\nLine ${lineNum} (cg_stock context):`);
        console.log(line.substring(start, end) + '...');
      }
    }
  }
  console.log("\nScan complete.");
}

searchTranscript();
