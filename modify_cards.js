const fs = require('fs');
let css = fs.readFileSync('css/cards.css', 'utf8');
css = css.replace(/\.machine-card:hover\s*{[\s\S]*?}/, '');
fs.writeFileSync('css/cards.css', css);
console.log("Updated cards.css");
