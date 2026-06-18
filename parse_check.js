const vm = require('vm');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Match only the inline script tag (without src attribute)
const scriptRegex = /<script\b[^>]*?(?<!src="[^"]*")>([\s\S]*?)<\/script>/i;
const match = html.match(scriptRegex);

if (match) {
  const code = match[1];
  try {
    new vm.Script(code, { filename: 'inline_script.js' });
    console.log("Success: No syntax errors found in the inline script!");
  } catch (e) {
    console.error("Syntax Error detected:");
    console.error(e.stack || e.message);
    
    // Let's print the line and surrounding lines
    const matchLine = e.stack.match(/inline_script\.js:(\d+)/);
    if (matchLine) {
      const lineNum = parseInt(matchLine[1], 10);
      console.log(`\nError is around line ${lineNum} of the inline script (which is around line ${lineNum + 1115} in index.html):`);
      const lines = code.split('\n');
      const start = Math.max(0, lineNum - 5);
      const end = Math.min(lines.length, lineNum + 5);
      for (let i = start; i < end; i++) {
        console.log(`${i + 1}: ${lines[i]}`);
      }
    }
  }
} else {
  console.log("No inline script tag found!");
}
