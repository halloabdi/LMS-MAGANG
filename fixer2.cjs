const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const original = code;
code = code.split('\\\\${').join('${');
code = code.split('\\\\`').join('\`');
fs.writeFileSync('src/App.jsx', code);
console.log('Fixed', original !== code ? 'some' : 'zero', 'issues');
