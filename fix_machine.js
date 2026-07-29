const fs = require('fs');
let js = fs.readFileSync('js/machine.js', 'utf8');

js = js.replace(/DOM\.currentHour\.textContent = metrics\.currentHour\.toLocaleString\(\) \+ " hrs";/, 'UI.animateValue(DOM.currentHour, 0, metrics.currentHour, 800, " hrs");');
js = js.replace(/DOM\.remainingHour\.textContent = formatHours;/, 'UI.animateValue(DOM.remainingHour, 0, Math.abs(metrics.remainingTotal), 800, " hrs");');
js = js.replace(/DOM\.healthPercent\.textContent = Math\.round\(metrics\.healthPercent\) \+ "%";/, 'UI.animateValue(DOM.healthPercent, 0, Math.round(metrics.healthPercent), 800, "%");');

// In Health tab
js = js.replace(/healthTabPercent\.textContent = Math\.round\(metrics\.healthPercent\) \+ '%';/, 'UI.animateValue(healthTabPercent, 0, Math.round(metrics.healthPercent), 800, "%");');
js = js.replace(/DOM\.runningHour\.textContent = metrics\.runningHours\.toLocaleString\(\) \+ " hrs";/, 'UI.animateValue(DOM.runningHour, 0, metrics.runningHours, 800, " hrs");');
js = js.replace(/DOM\.confEstimatedHour\.textContent = metrics\.currentHour\.toLocaleString\(\) \+ ' hrs';/, 'UI.animateValue(DOM.confEstimatedHour, 0, metrics.currentHour, 800, " hrs");');

fs.writeFileSync('js/machine.js', js);
console.log("Updated machine.js");
