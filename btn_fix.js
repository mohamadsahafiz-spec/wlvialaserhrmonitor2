const fs = require('fs');
let css = fs.readFileSync('css/style.css', 'utf8');

css = css.replace(/\.btn:hover\s*{[\s\S]*?}/, `.btn:hover {
    background: var(--glass-bg-hover);
    border-color: rgba(255,255,255,0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.btn:active {
    transform: scale(0.96) translateY(0);
}`);

css = css.replace(/\.btn-primary:hover\s*{[\s\S]*?}/, `.btn-primary:hover {
    background: #0ea5e9;
    border-color: #38bdf8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4), 0 0 16px rgba(14, 165, 233, 0.2);
}
.btn-primary:active {
    transform: scale(0.96) translateY(0);
}`);

fs.writeFileSync('css/style.css', css);
console.log("Updated btn styles");
