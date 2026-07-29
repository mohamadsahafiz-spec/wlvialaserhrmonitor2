/* =====================================================
   DASHBOARD.JS - Fleet Overview Grid & Filtering Controller
   ===================================================== */
import { LaserEngine } from './laserEngine.js';
import { ChartRenderer } from './charts.js';

export const DashboardController = {
    /**
     * Update Fleet Statistics Summary Panel above grid.
     */
    updateFleetSummaryStats(machines, evalTime) {
        const totalEl = document.getElementById('stat-total-count');
        const safeEl = document.getElementById('stat-safe-count');
        const warnEl = document.getElementById('stat-warn-count');
        const alarmEl = document.getElementById('stat-alarm-count');
        const avgHealthEl = document.getElementById('stat-avg-health');
        const totalHrsEl = document.getElementById('stat-total-hours');

        if (!totalEl && !safeEl) return;

        let safeCount = 0, warnCount = 0, alarmCount = 0;
        let sumHealth = 0, sumHours = 0;

        machines.forEach(m => {
            const met = LaserEngine.calculateMachineMetrics(m, evalTime);
            if (met.status === 'SAFE') safeCount++;
            else if (met.status === 'WARNING') warnCount++;
            else if (met.status === 'ALARM') alarmCount++;

            sumHealth += met.healthPercent || 0;
            sumHours += met.currentHour || 0;
        });

        const total = machines.length;
        const avgHealth = total > 0 ? (sumHealth / total) : 0;

        if (totalEl) totalEl.textContent = total;
        if (safeEl) safeEl.textContent = safeCount;
        if (warnEl) warnEl.textContent = warnCount;
        if (alarmEl) alarmEl.textContent = alarmCount;
        if (avgHealthEl) avgHealthEl.textContent = `${Math.round(avgHealth * 10) / 10}%`;
        if (totalHrsEl) totalHrsEl.textContent = `${Math.round(sumHours)} hrs`;
    },

    /**
     * Render the machine fleet grid with active filters, sorting, and action handlers.
     */
    renderFleetView(container, machines, filters, evalTime, onSelectMachine, onEditMachine, onDeleteMachine, silent = false) {
        if (!container) return;

        this.updateFleetSummaryStats(machines, evalTime);

        const s = (filters.search || '').toLowerCase();

        const stat = filters.status || 'ALL';
        const dpt = filters.dept || 'ALL';
        const model = filters.model || 'ALL';
        const sortMode = filters.sort || 'no-asc';

        const filtered = machines.filter(m => {
            const metrics = LaserEngine.calculateMachineMetrics(m, evalTime);
            const matchSearch = (m.machineNo || '').toLowerCase().includes(s) ||
                                (m.machineName || '').toLowerCase().includes(s) ||
                                (m.serialNo || '').toLowerCase().includes(s) ||
                                (m.department || '').toLowerCase().includes(s) ||
                                (m.model || '').toLowerCase().includes(s);
            const matchStatus = (stat === 'ALL' || metrics.status === stat);
            const matchDept = (dpt === 'ALL' || m.department === dpt);
            const matchModel = (model === 'ALL' || m.model === model);
            return matchSearch && matchStatus && matchDept && matchModel;
        });

        // Sort machines based on selected sort option
        filtered.sort((a, b) => {
            const metricsA = LaserEngine.calculateMachineMetrics(a, evalTime);
            const metricsB = LaserEngine.calculateMachineMetrics(b, evalTime);

            switch (sortMode) {
                case 'no-asc':
                    return (a.machineNo || '').localeCompare(b.machineNo || '', undefined, { numeric: true, sensitivity: 'base' });
                case 'no-desc':
                    return (b.machineNo || '').localeCompare(a.machineNo || '', undefined, { numeric: true, sensitivity: 'base' });
                case 'hour-desc':
                    return metricsB.currentHour - metricsA.currentHour;
                case 'hour-asc':
                    return metricsA.currentHour - metricsB.currentHour;
                case 'remain-asc':
                    return metricsA.remainingTotal - metricsB.remainingTotal;
                case 'remain-desc':
                    return metricsB.remainingTotal - metricsA.remainingTotal;
                case 'health-asc':
                    return metricsA.healthPercent - metricsB.healthPercent;
                case 'health-desc':
                    return metricsB.healthPercent - metricsA.healthPercent;
                case 'status-urgent': {
                    const statusOrder = { 'ALARM': 0, 'WARNING': 1, 'SAFE': 2 };
                    return (statusOrder[metricsA.status] ?? 3) - (statusOrder[metricsB.status] ?? 3);
                }
                case 'recal-newest':
                    return new Date(metricsB.lastRecalibrationDate).getTime() - new Date(metricsA.lastRecalibrationDate).getTime();
                case 'recal-oldest':
                    return new Date(metricsA.lastRecalibrationDate).getTime() - new Date(metricsB.lastRecalibrationDate).getTime();
                default:
                    return 0;
            }
        });

        if (silent && container.children.length === filtered.length) {
            filtered.forEach((m, idx) => {
                const metrics = LaserEngine.calculateMachineMetrics(m, evalTime);
                const card = container.children[idx];
                if (card) {
                    const currentVal = card.querySelector('.mc-stat-val-current');
                    const remainVal = card.querySelector('.mc-stat-val-remain');
                    const daysVal = card.querySelector('.mc-stat-val-days');
                    const healthFill = card.querySelector('.mini-health-fill');
                    const healthText = card.querySelector('.mc-health-text');
                    if (currentVal) currentVal.textContent = `${metrics.currentHour} hrs`;
                    if (remainVal) {
                        const formatHrs = Math.abs(metrics.remainingTotal);
                        remainVal.textContent = metrics.remainingTotal < 0 ? `-${formatHrs} hrs` : `${formatHrs} hrs`;
                    }
                    if (daysVal) {
                        daysVal.textContent = metrics.remainingDaysInfo.formattedText;
                    }
                    ChartRenderer.updateMiniHealthTrack(healthFill, metrics.healthPercent, metrics.status);
                    if (healthText) healthText.textContent = `Health: ${Math.round(metrics.healthPercent)}%`;
                }
            });
            return;
        }

        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--muted); font-size: 15px;" class="glass-panel">No wafer driller machines match your search or filter criteria.</div>`;
            return;
        }

        filtered.forEach(machine => {
            const metrics = LaserEngine.calculateMachineMetrics(machine, evalTime);
            let badgeClass = '', dotColor = '';

            if (metrics.status === 'SAFE') {
                badgeClass = 'color-safe'; dotColor = 'var(--green)';
            } else if (metrics.status === 'WARNING') {
                badgeClass = 'color-warning'; dotColor = 'var(--yellow)';
            } else {
                badgeClass = 'color-alarm'; dotColor = 'var(--red)';
            }

            const card = document.createElement('div');
            card.className = 'machine-card glass-panel';
            card.setAttribute('data-id', machine.id);
            card.onclick = (e) => {
                if (typeof onSelectMachine === 'function') {
                    onSelectMachine(machine.id, e.currentTarget);
                }
            };

            const formatHrs = Math.abs(metrics.remainingTotal);
            const remainText = metrics.remainingTotal < 0 ? `-${formatHrs} hrs` : `${formatHrs} hrs`;
            const recalDateStr = metrics.lastRecalibrationDate ? new Date(metrics.lastRecalibrationDate).toLocaleDateString() : 'N/A';
            const remDaysText = metrics.remainingDaysInfo.formattedText;

            card.innerHTML = `
                <div class="mc-header">
                    <div>
                        <div class="mc-title">${machine.machineName}</div>
                        <div class="mc-subtitle">
                            <span class="mc-num-badge">${machine.machineNo}</span> • SN: ${machine.serialNo} • ${machine.department}
                        </div>
                    </div>
                    <div class="mc-status-badge ${badgeClass}" style="border-color:${dotColor}40;">
                        <div class="mc-led" style="background:${dotColor}; box-shadow: 0 0 8px ${dotColor}"></div>
                        ${metrics.status}
                    </div>
                </div>

                <div class="mc-stats">
                    <div class="mc-stat-item">
                        <span class="mc-stat-label">Current Laser Hr</span>
                        <span class="mc-stat-val mc-stat-val-current">${metrics.currentHour} hrs</span>
                    </div>
                    <div class="mc-stat-item">
                        <span class="mc-stat-label">Remaining Hr</span>
                        <span class="mc-stat-val mc-stat-val-remain ${badgeClass}">${remainText}</span>
                    </div>
                    <div class="mc-stat-item">
                        <span class="mc-stat-label">Remaining Days</span>
                        <span class="mc-stat-val mc-stat-val-days" style="font-size:15px; margin-top:4px;">${remDaysText}</span>
                    </div>
                </div>

                <div class="mc-extra-info">
                    <div>Accuracy: <strong style="color:${metrics.accuracy.color}">${metrics.accuracy.label}</strong></div>
                    <div>EOL Date: <strong>${metrics.eolDate}</strong></div>
                    <div>Last Recal: <strong>${recalDateStr}</strong></div>
                </div>

                <div class="mc-footer">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="mc-health-text">Health: ${Math.round(metrics.healthPercent)}%</span>
                        <div class="mini-health-track">
                            <div class="mini-health-fill" style="width: ${metrics.healthPercent}%;"></div>
                        </div>
                    </div>
                    <div class="mc-card-actions">
                        <button class="btn-card-action btn-edit-card" title="Edit Machine Properties" data-id="${machine.id}">
                            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-card-action btn-delete-card" title="Delete Machine" data-id="${machine.id}">
                            <svg class="icon" viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--red)"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;

            const fillEl = card.querySelector('.mini-health-fill');
            ChartRenderer.updateMiniHealthTrack(fillEl, metrics.healthPercent, metrics.status);

            const editBtn = card.querySelector('.btn-edit-card');
            if (editBtn) {
                editBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof onEditMachine === 'function') {
                        onEditMachine(machine.id);
                    }
                };
            }

            const deleteBtn = card.querySelector('.btn-delete-card');
            if (deleteBtn) {
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof onDeleteMachine === 'function') {
                        onDeleteMachine(machine.id);
                    }
                };
            }

            container.appendChild(card);
        });
    }
};

window.DashboardController = DashboardController;
