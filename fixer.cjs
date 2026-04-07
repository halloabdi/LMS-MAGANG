const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const original = code;
code = code.replace(/\\\`/g, '\`');
code = code.replace(/\\\$\\w*\\{/g, '\\${'); 
code = code.replace(/\\\$\\{/g, '\\${');
fs.writeFileSync('src/App.jsx', code);
console.log('Fixed', original !== code ? 'some' : 'zero', 'issues');
