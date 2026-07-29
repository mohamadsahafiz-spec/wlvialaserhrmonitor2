const fs = require('fs');
let js = fs.readFileSync('js/ui.js', 'utf8');

js = js.replace(/export function animateValue[\s\S]*?}/, '');

const animateValueFunc = `
    animateValue(obj, start, end, duration, formatStr = '') {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeOut = progress * (2 - progress);
            const current = Math.floor(easeOut * (end - start) + start);
            obj.textContent = current.toLocaleString() + formatStr;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.textContent = end.toLocaleString() + formatStr;
            }
        };
        window.requestAnimationFrame(step);
    }
`;

js = js.replace('window.UI = UI;', animateValueFunc + '\n};\nwindow.UI = UI;');
js = js.replace('};\n\n    animateValue', ',\n    animateValue');
fs.writeFileSync('js/ui.js', js);
console.log("Fixed UI animate");
