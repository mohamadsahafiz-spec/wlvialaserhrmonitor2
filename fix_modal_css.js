const fs = require('fs');
let css = fs.readFileSync('css/dashboard.css', 'utf8');

css = css.replace(/\.mach-modal-container\s*{[\s\S]*?}/, '');
fs.writeFileSync('css/dashboard.css', css);
console.log("Fixed dashboard.css duplicate");
