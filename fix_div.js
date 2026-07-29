const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('                        </div>\n\n                \n                    <div id="tab-health"', '                        </div>\n                    </div>\n\n                    <div id="tab-health"');

fs.writeFileSync('index.html', html);
console.log("Fixed div");
