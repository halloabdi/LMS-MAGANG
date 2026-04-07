const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');

let inTemplate = false;
let lastUnclosedLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let backtickCount = 0;
  // This simple logic ignores escaped backticks, but hopefully there aren't tricky ones
  for(let j=0; j<line.length; j++) {
    if (line[j] === '\`' && (j === 0 || line[j-1] !== '\\\\')) {
      backtickCount++;
    }
  }
  
  if (backtickCount % 2 !== 0) {
    inTemplate = !inTemplate;
    if (inTemplate) {
      lastUnclosedLine = i + 1;
      console.log('Opened on line:', i + 1, '->', line.trim());
    } else {
      console.log('Closed on line:', i + 1, '->', line.trim());
    }
  }
}
if (inTemplate) {
  console.log('UNTERMINATED TEMPLATE OPENED AT LINE:', lastUnclosedLine);
}
