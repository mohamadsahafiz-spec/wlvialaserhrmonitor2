/* =====================================================
   MACHINE.JS - Single Machine Detailed View Controller
   ===================================================== */
import { LaserEngine } from './laserEngine.js';
import { ChartRenderer } from './charts.js';
import { StorageService } from './storage.js';

export const MachineController = {
    /**
     * Render the single machine dashboard and update all metric displays.
     */
    renderSingleDashboard(machine, DOM, evalTime, silent = false) {
        if (!machine || !DOM) return;

        const metrics = LaserEngine.calculateMachineMetrics(machine, evalTime);

        // Confidence Center
        if (DOM.confEstimatedHour) DOM.confEstimatedHour.textContent = metrics.currentHour.toLocaleString() + ' hrs';
        if (DOM.confAccuracy) {
            DOM.confAccuracy.textContent = metrics.accuracy.label;
            DOM.confAccuracy.style.color = metrics.accuracy.color;
        }
        if (DOM.confLastRecal) {
            DOM.confLastRecal.textContent = metrics.lastRecalibrationDate ?
                new Date(metrics.lastRecalibrationDate).toLocaleDateString() + ' ' +
                new Date(metrics.lastRecalibrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        }
        if (DOM.confNextRecal) DOM.confNextRecal.textContent = metrics.nextRecalDate;
        if (DOM.confStatus) {
            DOM.confStatus.textContent = metrics.recalRecommendation.status;
            DOM.confStatus.style.color = metrics.recalRecommendation.color;
        }

        // Metrics
        if (DOM.currentHour) DOM.currentHour.textContent = metrics.currentHour.toLocaleString() + " hrs";
        if (DOM.currentAge) DOM.currentAge.textContent = metrics.age.formattedText;
        if (DOM.runningHour) DOM.runningHour.textContent = metrics.runningHours.toLocaleString() + " hrs";
        if (DOM.runningDay) DOM.runningDay.textContent = metrics.daysPassed + " Days";

        this.updateRemainingCardUI(metrics, DOM);
        this.updateStatusCardUI(metrics.status, DOM);

        if (DOM.progressBar) ChartRenderer.updateProgressBar(DOM.progressBar, metrics.healthPercent);
        if (DOM.healthPercent) DOM.healthPercent.textContent = Math.round(metrics.healthPercent) + "%";

        if (!silent) {
            this.updateLegendsAndScales(machine, DOM);
        }
    },

    updateRemainingCardUI(metrics, DOM) {
        if (!DOM.remainingHour || !DOM.remainingCard) return;

        const remInfo = metrics.remainingDaysInfo;
        const remainingTotal = metrics.remainingTotal;

        DOM.remainingHour.className = "value";
        DOM.remainingCard.className = "card glass-panel";
        if (DOM.remainingDot) DOM.remainingDot.className = "led";

        if (remInfo.urgency === "SAFE") {
            DOM.remainingHour.classList.add("color-safe");
            DOM.remainingCard.classList.add("glow-safe");
            if (DOM.remainingDot) DOM.remainingDot.classList.add("bg-safe", "led-solid");
            if (DOM.remainingText) {
                DOM.remainingText.className = "color-safe";
                DOM.remainingText.textContent = "SAFE";
            }
        } else if (remInfo.urgency === "WARNING") {
            DOM.remainingHour.classList.add("color-warning");
            DOM.remainingCard.classList.add("glow-warning");
            if (DOM.remainingDot) DOM.remainingDot.classList.add("bg-warning", "blink-slow");
            if (DOM.remainingText) {
                DOM.remainingText.className = "color-warning";
                DOM.remainingText.textContent = "WARNING";
            }
        } else {
            DOM.remainingHour.classList.add("color-alarm");
            DOM.remainingCard.classList.add("glow-alarm");
            if (DOM.remainingDot) DOM.remainingDot.classList.add("bg-alarm", "blink-fast");
            if (DOM.remainingText) {
                DOM.remainingText.className = "color-alarm";
                DOM.remainingText.textContent = "ALARM";
            }
        }

        const formatHours = (remainingTotal < 0 ? "-" : "") + Math.abs(remainingTotal).toLocaleString() + " hrs";
        DOM.remainingHour.textContent = formatHours;
        if (DOM.remainingDay) DOM.remainingDay.textContent = remInfo.daysVal.toLocaleString() + " " + remInfo.statusMsg;
    },

    updateStatusCardUI(status, DOM) {
        if (!DOM.statusText || !DOM.recommendation) return;
        DOM.statusText.textContent = status;
        DOM.statusText.style.textShadow = "none";

        if (status === "SAFE") {
            DOM.statusText.style.color = "var(--green)";
            DOM.statusText.style.textShadow = "0 0 18px rgba(52,211,153,.35)";
            DOM.recommendation.textContent = "Continue normal operation. Review during the next preventive maintenance.";
        } else if (status === "WARNING") {
            DOM.statusText.style.color = "var(--yellow)";
            DOM.statusText.style.textShadow = "0 0 18px rgba(251,191,36,.35)";
            DOM.recommendation.textContent = "Prepare laser replacement and schedule maintenance before reaching the alarm limit.";
        } else {
            DOM.statusText.style.color = "var(--red)";
            DOM.statusText.style.textShadow = "0 0 18px rgba(248,113,113,.45)";
            DOM.recommendation.textContent = "Laser lifetime exceeded. Replacement is strongly recommended to reduce unplanned downtime.";
        }
    },

    updateLegendsAndScales(machine, DOM) {
        const warn = machine.warningLife || Math.floor((machine.ratedLife || 25000) * 0.8);
        const rated = machine.ratedLife || 25000;
        if (DOM.legendSafe) DOM.legendSafe.textContent = `0 – ${(warn - 1).toLocaleString()} hrs`;
        if (DOM.legendWarning) DOM.legendWarning.textContent = `${warn.toLocaleString()} – ${(rated - 1).toLocaleString()} hrs`;
        if (DOM.legendAlarm) DOM.legendAlarm.textContent = `${rated.toLocaleString()}+ hrs`;
        if (DOM.scaleWarn) DOM.scaleWarn.textContent = `${warn.toLocaleString()} hrs`;
        if (DOM.scaleAlarm) DOM.scaleAlarm.textContent = `${rated.toLocaleString()} hrs`;
    },

    renderMaintenanceLog(machine, tbodyElement) {
        if (!tbodyElement) return;
        tbodyElement.innerHTML = '';
        if (!machine.maintenanceHistory || machine.maintenanceHistory.length === 0) {
            tbodyElement.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--muted); padding: 24px;">No maintenance records found. Click "+ Add Record" to start.</td></tr>`;
            return;
        }

        machine.maintenanceHistory.forEach((log, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td contenteditable="true" class="editable-cell" data-field="date" data-index="${index}">${log.date}</td>
                <td contenteditable="true" class="editable-cell font-semibold" data-field="engineer" data-index="${index}">${log.engineer}</td>
                <td contenteditable="true" class="editable-cell" data-field="action" data-index="${index}">${log.action}</td>
                <td contenteditable="true" class="editable-cell text-muted" data-field="notes" data-index="${index}">${log.notes}</td>
                <td>
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div class="photo-placeholder" title="View Attachment">
                            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:var(--muted);"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </div>
                        <button class="btn-icon-danger btn-delete-record" data-index="${index}" title="Delete Record">
                            <svg class="icon" viewBox="0 0 24 24" style="width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            `;
            tbodyElement.appendChild(tr);
        });

        const editableCells = tbodyElement.querySelectorAll('.editable-cell');
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

        const deleteBtns = tbodyElement.querySelectorAll('.btn-delete-record');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                if (confirm("Delete this maintenance record?")) {
                    machine.maintenanceHistory.splice(idx, 1);
                    StorageService.saveMachine(machine);
                    this.renderMaintenanceLog(machine, tbodyElement);
                }
            });
        });
    },

    renderCalibrationHistory(machine, tbodyElement) {
        if (!tbodyElement) return;
        tbodyElement.innerHTML = '';
        const history = Array.isArray(machine.calibrationHistory) ? machine.calibrationHistory : [];

        if (history.length === 0) {
            tbodyElement.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding: 18px;">No calibration records yet. Use "Recalibrate" to record actual meter hours.</td></tr>`;
            return;
        }

        history.forEach(rec => {
            const tr = document.createElement('tr');
            let dateStr = 'N/A';
            if (rec.date) {
                if (rec.time) {
                    dateStr = `${rec.date} ${rec.time}`;
                } else if (rec.date.includes('T')) {
                    const d = new Date(rec.date);
                    dateStr = `${d.toISOString().split('T')[0]} ${d.toTimeString().split(' ')[0].substring(0, 5)}`;
                } else {
                    dateStr = rec.date;
                }
            }
            const diffText = rec.difference > 0 ? `+${rec.difference} hrs` : `${rec.difference} hrs`;
            const diffColor = Math.abs(rec.difference) <= 25 ? 'var(--green)' : (Math.abs(rec.difference) <= 100 ? 'var(--yellow)' : 'var(--red)');

            tr.innerHTML = `
                <td>${dateStr}</td>
                <td><strong>${Number(rec.estimatedHour).toLocaleString()} hrs</strong></td>
                <td><strong>${Number(rec.actualHour).toLocaleString()} hrs</strong></td>
                <td style="color:${diffColor}; font-weight:700;">${diffText}</td>
                <td>${rec.reason || 'Manual Verification'}</td>
                <td style="color:var(--primary); font-weight:600;">${rec.rating || ''}</td>
            `;
            tbodyElement.appendChild(tr);
        });
    }
};

window.MachineController = MachineController;
