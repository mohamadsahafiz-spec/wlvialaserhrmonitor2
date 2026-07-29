const fs = require('fs');
let js = fs.readFileSync('js/app.js', 'utf8');

js = js.replace(/maintTbody: document\.getElementById\('maint-tbody'\)/, 'maintTbody: document.getElementById(\'maint-timeline\')');
js = js.replace(/maintTbody: document\.getElementById\('calibration-tbody'\)/, 'calibrationTbody: document.getElementById(\'calibration-tbody\')');

fs.writeFileSync('js/app.js', js);
console.log("Fixed DOM refs");
