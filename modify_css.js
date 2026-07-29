const fs = require('fs');
let css = fs.readFileSync('css/dashboard.css', 'utf8');

css = css.replace(/animation: modalFadeIn 0\.25s cubic-bezier\(0\.16, 1, 0\.3, 1\);/, '');
fs.writeFileSync('css/dashboard.css', css);
console.log("Updated CSS");
