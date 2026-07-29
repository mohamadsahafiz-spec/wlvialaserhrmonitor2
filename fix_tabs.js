const fs = require('fs');
let css = fs.readFileSync('css/dashboard.css', 'utf8');

css = css.replace(/\.mach-tab-btn\.active\s*{[\s\S]*?}/, `.mach-tab-btn.active {
    color: var(--primary);
    background: transparent;
    border-color: transparent;
    box-shadow: none;
}
.mach-tab-btn::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--primary);
    border-radius: 3px 3px 0 0;
    transform: scaleX(0);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
}
.mach-tab-btn.active::after {
    transform: scaleX(1);
}`);

css = css.replace(/\.mach-tab-btn\s*{[\s\S]*?}/, `.mach-tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 12px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--muted);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    white-space: nowrap;
    position: relative;
}`);

// Add sliding fade for tab panes
css = css.replace(/\.mach-tab-pane\.active\s*{[\s\S]*?}/, `.mach-tab-pane.active {
    display: block;
    animation: tabFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
@keyframes tabFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}`);

fs.writeFileSync('css/dashboard.css', css);
console.log("Updated tab CSS");
