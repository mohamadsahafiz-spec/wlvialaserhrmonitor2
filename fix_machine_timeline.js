const fs = require('fs');
let js = fs.readFileSync('js/machine.js', 'utf8');

const oldRender = js.substring(js.indexOf('    renderMaintenanceLog(machine, tbodyElement) {'), js.indexOf('    updateLegendsAndScales(machine, DOM) {'));

const newRender = `    renderMaintenanceLog(machine, containerElement) {
        if (!containerElement) return;
        containerElement.innerHTML = '';
        if (!machine.maintenanceHistory || machine.maintenanceHistory.length === 0) {
            containerElement.innerHTML = \`<div style="text-align:center; color:var(--muted); padding: 24px;">No maintenance records found. Click "+ Add Record" to start.</div>\`;
            return;
        }
        
        // Show max 10 records
        const records = machine.maintenanceHistory.slice(0, 10);
        
        records.forEach((log, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = \`
                <div class="timeline-marker">
                    <div class="timeline-dot"></div>
                    \${index !== records.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-meta">
                            <span class="timeline-date" contenteditable="true" data-field="date" data-index="\${index}">\${log.date}</span>
                            <span class="timeline-engineer" contenteditable="true" data-field="engineer" data-index="\${index}">\${log.engineer}</span>
                        </div>
                        <button class="btn-icon-danger btn-delete-record" data-index="\${index}" title="Delete Record">
                            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div class="timeline-action" contenteditable="true" data-field="action" data-index="\${index}">\${log.action}</div>
                    <div class="timeline-notes" contenteditable="true" data-field="notes" data-index="\${index}">\${log.notes}</div>
                </div>
            \`;
            containerElement.appendChild(item);
        });

        const editableCells = containerElement.querySelectorAll('[contenteditable="true"]');
        editableCells.forEach(cell => {
            cell.addEventListener('blur', (e) => {
                const idx = e.target.getAttribute('data-index');
                const field = e.target.getAttribute('data-field');
                machine.maintenanceHistory[idx][field] = e.target.textContent.trim();
                StorageService.saveMachine(machine);
            });
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.target.blur();
                }
            });
        });

        const delBtns = containerElement.querySelectorAll('.btn-delete-record');
        delBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                if (confirm('Delete this maintenance record?')) {
                    machine.maintenanceHistory.splice(idx, 1);
                    StorageService.saveMachine(machine);
                    this.renderMaintenanceLog(machine, containerElement);
                }
            });
        });
    },

`;

js = js.replace(oldRender, newRender);
fs.writeFileSync('js/machine.js', js);
console.log("Updated machine timeline rendering");
