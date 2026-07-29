const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');

// Replace showFleetView
appJs = appJs.replace(
    /function showFleetView\(\) \{\s+if \(DOM\.viewSingle\) \{\s+DOM\.viewSingle\.classList\.add\('hidden'\);\s+DOM\.viewSingle\.classList\.remove\('as-modal'\);\s+\}/,
    `function showFleetView() {
    if (DOM.viewSingle && !DOM.viewSingle.classList.contains('hidden')) {
        const modalContainer = DOM.viewSingle.querySelector('.mach-modal-container');
        if (modalContainer && AppState.lastCardRect) {
            const cardRect = AppState.lastCardRect;
            const modalRect = modalContainer.getBoundingClientRect();
            
            // Revert transform to original card position
            const scaleX = cardRect.width / modalRect.width;
            const scaleY = cardRect.height / modalRect.height;
            const translateX = cardRect.left - modalRect.left + (cardRect.width - modalRect.width) / 2;
            const translateY = cardRect.top - modalRect.top + (cardRect.height - modalRect.height) / 2;
            
            modalContainer.style.transition = 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease';
            modalContainer.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scaleX}, \${scaleY})\`;
            modalContainer.style.opacity = '0';
            
            DOM.viewSingle.style.transition = 'background-color 250ms ease, backdrop-filter 250ms ease';
            DOM.viewSingle.style.backgroundColor = 'transparent';
            DOM.viewSingle.style.backdropFilter = 'blur(0px)';
            
            setTimeout(() => {
                DOM.viewSingle.classList.add('hidden');
                DOM.viewSingle.classList.remove('as-modal');
                modalContainer.style.transform = '';
                modalContainer.style.opacity = '';
                modalContainer.style.transition = '';
                DOM.viewSingle.style.backgroundColor = '';
                DOM.viewSingle.style.backdropFilter = '';
                DOM.viewSingle.style.transition = '';
            }, 250);
        } else {
            DOM.viewSingle.classList.add('hidden');
            DOM.viewSingle.classList.remove('as-modal');
        }
    }`
);

fs.writeFileSync('js/app.js', appJs);
console.log("Replaced JS!");
