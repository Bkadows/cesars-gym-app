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
  
  console.log("Searching transcript for cg_stock...");
  let lineNum = 0;
  for await (const line of rl) {
    lineNum++;
    if (line.includes('cg_stock') && line.includes('data')) {
      console.log(`Line ${lineNum}:`);
      console.log(line.substring(0, 1000) + '...');
    }
  }
  console.log("Search finished.");
}

searchTranscript();
