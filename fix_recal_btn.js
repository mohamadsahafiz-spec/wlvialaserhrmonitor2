const fs = require('fs');
let appJs = fs.readFileSync('js/app.js', 'utf8');

const originalRecalBlock = `
    if (DOM.btnOpenRecalibrate) DOM.btnOpenRecalibrate.addEventListener('click', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (!machine) return;

            const evalTime = getEvalTime();
            const est = LaserEngine.calculateEstimatedHour(machine.baseLaserHour, machine.baseTimestamp, evalTime);

            if (DOM.recalCurrentEstDisplay) DOM.recalCurrentEstDisplay.textContent = \`\${Math.round(est * 10) / 10} hrs\`;
            if (DOM.recalActualInput) DOM.recalActualInput.value = Math.round(est);
            if (DOM.recalReasonSelect) DOM.recalReasonSelect.value = 'Scheduled PM';

            UI.showModal(DOM.recalOverlay);
        });
    });
`;

appJs = appJs.replace(originalRecalBlock, '');

const newRecalBlock = `
    const openRecalibrateModal = () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (!machine) return;

            const evalTime = getEvalTime();
            const est = LaserEngine.calculateEstimatedHour(machine.baseLaserHour, machine.baseTimestamp, evalTime);

            if (DOM.recalCurrentEstDisplay) DOM.recalCurrentEstDisplay.textContent = \`\${Math.round(est * 10) / 10} hrs\`;
            if (DOM.recalActualInput) DOM.recalActualInput.value = Math.round(est);
            if (DOM.recalReasonSelect) DOM.recalReasonSelect.value = 'Scheduled PM';

            UI.showModal(DOM.recalOverlay);
        });
    };
    if (DOM.btnOpenRecalibrate) DOM.btnOpenRecalibrate.addEventListener('click', openRecalibrateModal);
`;

appJs = appJs.replace(
    /const btnOpenRecal2 = document\.getElementById\('btn-open-recalibrate-2'\);[\s\S]*?\}\);/,
    `const btnOpenRecal2 = document.getElementById('btn-open-recalibrate-2');
    if (btnOpenRecal2) {
        btnOpenRecal2.addEventListener('click', openRecalibrateModal);
    }`
);

// We need to insert newRecalBlock above btnOpenRecal2
appJs = appJs.replace(`const btnOpenRecal2 =`, newRecalBlock + '\n    const btnOpenRecal2 =');

fs.writeFileSync('js/app.js', appJs);
console.log("Fixed recalibration button");
