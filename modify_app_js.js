const fs = require('fs');

let appJs = fs.readFileSync('js/app.js', 'utf8');

// Replace handleMachineSelect
appJs = appJs.replace(
    /function handleMachineSelect\(id\) \{\s+if \(window\.location\.pathname[\s\S]*?\}\s+\}/,
    `function handleMachineSelect(id, cardElement) {
    if (DOM.viewSingle) {
        showMachineDetail(id, cardElement);
    }
}`
);

// Replace showMachineDetail signature and the DOM view showing logic
appJs = appJs.replace(
    /function showMachineDetail\(id\) \{\s+AppState\.currentMachineId[\s\S]*?if \(DOM\.viewSettings\)[^\n]+/,
    `function showMachineDetail(id, cardElement) {
    AppState.currentMachineId = id;
    setQueryParam('id', id);

    if (DOM.viewSettings) DOM.viewSettings.classList.add('hidden');

    if (DOM.viewSingle) {
        DOM.viewSingle.classList.add('as-modal');
        DOM.viewSingle.classList.remove('hidden');
        
        // Wait for next frame to ensure modal container is rendered to get its dimensions
        requestAnimationFrame(() => {
            if (cardElement) {
                const modalContainer = DOM.viewSingle.querySelector('.mach-modal-container');
                if (modalContainer) {
                    const cardRect = cardElement.getBoundingClientRect();
                    const modalRect = modalContainer.getBoundingClientRect();
                    
                    // Calculate scale and translation
                    const scaleX = cardRect.width / modalRect.width;
                    const scaleY = cardRect.height / modalRect.height;
                    
                    const translateX = cardRect.left - modalRect.left + (cardRect.width - modalRect.width) / 2;
                    const translateY = cardRect.top - modalRect.top + (cardRect.height - modalRect.height) / 2;
                    
                    // Initial state for animation
                    modalContainer.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scaleX}, \${scaleY})\`;
                    modalContainer.style.opacity = '0';
                    modalContainer.style.transformOrigin = 'center center';
                    modalContainer.style.transition = 'none';
                    
                    DOM.viewSingle.style.backgroundColor = 'transparent';
                    DOM.viewSingle.style.backdropFilter = 'blur(0px)';
                    DOM.viewSingle.style.transition = 'none';
                    
                    // Force reflow
                    modalContainer.offsetHeight;
                    
                    // Animate to center
                    modalContainer.style.transition = 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 200ms ease';
                    modalContainer.style.transform = 'translate(0, 0) scale(1)';
                    modalContainer.style.opacity = '1';
                    
                    DOM.viewSingle.style.transition = 'background-color 300ms ease, backdrop-filter 300ms ease';
                    DOM.viewSingle.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
                    DOM.viewSingle.style.backdropFilter = 'blur(14px)';
                    
                    // Store the originating rect for close animation
                    AppState.lastCardRect = cardRect;
                }
            } else {
                // Fallback if no card element is passed
                DOM.viewSingle.style.backgroundColor = 'rgba(15, 23, 42, 0.75)';
                DOM.viewSingle.style.backdropFilter = 'blur(14px)';
            }
        });
    }`
);

fs.writeFileSync('js/app.js', appJs);
console.log("Replaced JS!");
