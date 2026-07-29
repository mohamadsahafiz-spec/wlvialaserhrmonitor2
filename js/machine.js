/* =====================================================
   MACHINE.JS - Single Machine Detailed View Controller
   ===================================================== */
import { LaserEngine } from './laserEngine.js';
import { ChartRenderer } from './charts.js';
import { StorageService } from './storage.js';
import { UI } from './ui.js';

export const MachineController = {
    /**
     * Render the single machine dashboard and update all metric displays.
     */
    renderSingleDashboard(machine, DOM, evalTime, silent = false) {
        if (!machine || !DOM) return;

        const metrics = LaserEngine.calculateMachineMetrics(machine, evalTime);

        // Header Elements
        const headerNum = document.getElementById('mach-header-num');
        const headerName = document.getElementById('mach-header-name');
        const headerModel = document.getElementById('mach-header-model');
        const headerStatus = document.getElementById('mach-header-status');
        if (headerNum) headerNum.textContent = machine.machineNo;
        if (headerName) headerName.textContent = machine.machineName || machine.machineNo;
        if (headerModel) headerModel.textContent = `${machine.model} • SN: ${machine.serialNo || 'N/A'}`;
        if (headerStatus) {
            const statusClass = metrics.status === 'SAFE' ? 'color-safe' : (metrics.status === 'WARNING' ? 'color-warning' : 'color-alarm');
            const bgClass = metrics.status === 'SAFE' ? 'bg-safe' : (metrics.status === 'WARNING' ? 'bg-warning' : 'bg-alarm');
            headerStatus.className = `mc-status-badge ${statusClass}`;
            headerStatus.innerHTML = `<div class="mc-led ${bgClass} led-solid"></div> ${metrics.status}`;
        }

        // Read-only Machine Profile Cards
        const infoNum = document.getElementById('info-mach-no');
        const infoModel = document.getElementById('info-model');
        const infoSerial = document.getElementById('info-serial');
        const infoDept = document.getElementById('info-dept');
        const infoRated = document.getElementById('info-rated');
        const infoBaseDate = document.getElementById('info-base-date');
        if (infoNum) infoNum.textContent = machine.machineNo;
        if (infoModel) infoModel.textContent = machine.model;
        if (infoSerial) infoSerial.textContent = machine.serialNo;
        if (infoDept) infoDept.textContent = machine.department;
        if (infoRated) infoRated.textContent = `${machine.ratedLife || 25000} hrs`;
        if (infoBaseDate) infoBaseDate.textContent = machine.baseTimestamp ? new Date(machine.baseTimestamp).toLocaleDateString() : 'N/A';

        // EOL Date Card
        const machEol = document.getElementById('mach-eol-date');
        if (machEol) machEol.textContent = metrics.eolDate || 'N/A';

        // Confidence Center
        if (DOM.confEstimatedHour) UI.animateValue(DOM.confEstimatedHour, 0, metrics.currentHour, 800, " hrs");
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

        // Tab duplicate elements
        const healthTabPercent = document.getElementById('health-tab-percent');
        const confAccuracyTab = document.getElementById('conf-accuracy-tab');
        const confAccuracyCalib = document.getElementById('conf-accuracy-calib');
        const confLastRecal2 = document.getElementById('conf-last-recal-2');
        const confNextRecal2 = document.getElementById('conf-next-recal-2');
        if (healthTabPercent) UI.animateValue(healthTabPercent, 0, Math.round(metrics.healthPercent), 800, "%");
        if (confAccuracyTab) {
            confAccuracyTab.textContent = metrics.accuracy.label;
            confAccuracyTab.style.color = metrics.accuracy.color;
        }
        if (confAccuracyCalib) {
            confAccuracyCalib.textContent = metrics.accuracy.label;
            confAccuracyCalib.style.color = metrics.accuracy.color;
        }
        if (confLastRecal2) {
            confLastRecal2.textContent = metrics.lastRecalibrationDate ?
                new Date(metrics.lastRecalibrationDate).toLocaleDateString() + ' ' +
                new Date(metrics.lastRecalibrationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        }
        if (confNextRecal2) confNextRecal2.textContent = metrics.nextRecalDate;

        // Metrics
        if (DOM.currentHour) UI.animateValue(DOM.currentHour, 0, metrics.currentHour, 800, " hrs");
        if (DOM.currentAge) DOM.currentAge.textContent = metrics.age.formattedText;
        if (DOM.runningHour) UI.animateValue(DOM.runningHour, 0, metrics.runningHours, 800, " hrs");
        if (DOM.runningDay) DOM.runningDay.textContent = metrics.daysPassed + " Days";

        this.updateRemainingCardUI(metrics, DOM);
        this.updateStatusCardUI(metrics.status, DOM);

        if (DOM.progressBar) ChartRenderer.updateProgressBar(DOM.progressBar, metrics.healthPercent);
        if (DOM.healthPercent) UI.animateValue(DOM.healthPercent, 0, Math.round(metrics.healthPercent), 800, "%");

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

        const formatHours = (remainingTotal < 0 ? "-" : "") + Math.abs(remainingTotal) + " hrs";
        UI.animateValue(DOM.remainingHour, 0, Math.abs(metrics.remainingTotal), 800, " hrs");
        if (DOM.remainingDay) DOM.remainingDay.textContent = remInfo.daysVal + " " + remInfo.statusMsg;
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

    renderMaintenanceLog(machine, containerElement) {
        if (!containerElement) return;
        containerElement.innerHTML = '';
        if (!machine.maintenanceHistory || machine.maintenanceHistory.length === 0) {
            containerElement.innerHTML = `<div style="text-align:center; color:var(--muted); padding: 24px;">No maintenance records found. Click "+ Add Record" to start.</div>`;
            return;
        }
        
        // Show max 10 records
        const records = machine.maintenanceHistory.slice(0, 10);
        
        records.forEach((log, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-marker">
                    <div class="timeline-dot"></div>
                    ${index !== records.length - 1 ? '<div class="timeline-line"></div>' : ''}
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-meta">
                            <span class="timeline-date" contenteditable="true" data-field="date" data-index="${index}">${log.date}</span>
                            <span class="timeline-engineer" contenteditable="true" data-field="engineer" data-index="${index}">${log.engineer}</span>
                        </div>
                        <button class="btn-icon-danger btn-delete-record" data-index="${index}" title="Delete Record">
                            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div class="timeline-action" contenteditable="true" data-field="action" data-index="${index}">${log.action}</div>
                    <div class="timeline-notes" contenteditable="true" data-field="notes" data-index="${index}">${log.notes}</div>
                </div>
            `;
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

    updateLegendsAndScales(machine, DOM) {
        const warn = Math.round((machine.ratedLife || 25000) * 0.8);
        const rated = machine.ratedLife || 25000;

        if (DOM.legendSafe) DOM.legendSafe.textContent = `0 – ${warn - 1} hrs`;
        if (DOM.legendWarning) DOM.legendWarning.textContent = `${warn} – ${rated - 1} hrs`;
        if (DOM.legendAlarm) DOM.legendAlarm.textContent = `${rated}+ hrs`;

        if (DOM.scaleWarn) DOM.scaleWarn.textContent = `${warn} hrs (WARN)`;
        if (DOM.scaleAlarm) DOM.scaleAlarm.textContent = `${rated} hrs (ALARM)`;
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
                <td><strong>${Number(rec.estimatedHour)} hrs</strong></td>
                <td><strong>${Number(rec.actualHour)} hrs</strong></td>
                <td style="color:${diffColor}; font-weight:700;">${diffText}</td>
                <td>${rec.reason || 'Manual Verification'}</td>
                <td style="color:var(--primary); font-weight:600;">${rec.rating || ''}</td>
            `;
            tbodyElement.appendChild(tr);
        });
    }
};

window.MachineController = MachineController;
