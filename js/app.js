/* =====================================================
   APP.JS - Main Application Entry & Controller
   ===================================================== */
import { StorageService } from './storage.js';
import { LaserEngine } from './laserEngine.js';
import { DashboardController } from './dashboard.js';
import { MachineController } from './machine.js';
import { RecalibrationController } from './recalibration.js';
import { UI } from './ui.js';
import { getCurrentEvalTime, getQueryParam, setQueryParam } from './utils.js';

const AppState = {
    machines: [],
    settings: {},
    currentMachineId: null,
    simulatedDate: new Date().toISOString().split('T')[0],
    filters: { search: '', status: 'ALL', dept: 'ALL', model: 'ALL', sort: 'no-asc' },
    pendingRecalibration: null
};

let DOM = {};

function initDOM() {
    DOM = {
        // Navigation Views
        viewFleet: document.getElementById('view-fleet'),
        viewSingle: document.getElementById('view-single'),
        viewSettings: document.getElementById('view-settings'),
        fleetGrid: document.getElementById('fleet-grid'),

        // Filters
        filterSearch: document.getElementById('filter-search'),
        filterStatus: document.getElementById('filter-status'),
        filterDept: document.getElementById('filter-dept'),
        filterModel: document.getElementById('filter-model'),
        filterSort: document.getElementById('filter-sort'),

        // Machine Detail Form
        detMachNo: document.getElementById('det-mach-no'),
        detModel: document.getElementById('det-model'),
        detSerialNo: document.getElementById('det-serial-no'),
        detDept: document.getElementById('det-dept'),
        detRated: document.getElementById('det-rated'),
        prevHour: document.getElementById('prevHour'),
        prevDate: document.getElementById('prevDate'),
        todayDate: document.getElementById('todayDate'),

        // Confidence Center
        confEstimatedHour: document.getElementById('conf-estimated-hour'),
        confAccuracy: document.getElementById('conf-accuracy'),
        confLastRecal: document.getElementById('conf-last-recal'),
        confNextRecal: document.getElementById('conf-next-recal'),
        confStatus: document.getElementById('conf-status'),

        // Metric Card Elements
        currentHour: document.getElementById('currentHour'),
        currentAge: document.getElementById('currentAge'),
        runningHour: document.getElementById('runningHour'),
        runningDay: document.getElementById('runningDay'),
        remainingCard: document.getElementById('remainingCard'),
        remainingHour: document.getElementById('remainingHour'),
        remainingDay: document.getElementById('remainingDay'),
        remainingDot: document.getElementById('remainingDot'),
        remainingText: document.getElementById('remainingText'),
        statusText: document.getElementById('statusText'),
        recommendation: document.getElementById('recommendation'),
        progressBar: document.getElementById('progressBar'),
        healthPercent: document.getElementById('healthPercent'),

        // History Tables
        maintTbody: document.getElementById('maintenance-tbody'),
        btnAddRecord: document.getElementById('btn-add-record'),
        calibrationTbody: document.getElementById('calibration-tbody'),

        // Legends & Scales
        legendSafe: document.getElementById('legend-safe'),
        legendWarning: document.getElementById('legend-warning'),
        legendAlarm: document.getElementById('legend-alarm'),
        scaleWarn: document.getElementById('scale-warn'),
        scaleAlarm: document.getElementById('scale-alarm'),

        // Buttons
        btnBack: document.getElementById('btn-back'),
        btnSaveMachine: document.getElementById('btn-save-machine'),
        btnDeleteMachine: document.getElementById('btn-delete-machine'),
        btnExportCsv: document.getElementById('btn-export-csv'),
        btnPrint: document.getElementById('btn-print'),
        btnTheme: document.getElementById('btn-theme'),

        // Recalibration Modal
        btnCloseMachModal: document.getElementById('btn-close-mach-modal'),
        btnOpenRecalibrate: document.getElementById('btn-open-recalibrate'),
        recalOverlay: document.getElementById('recalibrate-modal-overlay'),
        btnCloseRecalModal: document.getElementById('btn-close-recal-modal'),
        btnCancelRecalModal: document.getElementById('btn-cancel-recal-modal'),
        btnSubmitRecalibrate: document.getElementById('btn-submit-recalibrate'),
        recalCurrentEstDisplay: document.getElementById('recal-current-est'),
        recalActualInput: document.getElementById('recal-actual-hour'),
        recalReasonSelect: document.getElementById('recal-reason'),

        // Deviation Analysis Modal
        deviationOverlay: document.getElementById('deviation-modal-overlay'),
        btnCloseDevModal: document.getElementById('btn-close-dev-modal'),
        btnBackDevModal: document.getElementById('btn-back-dev-modal'),
        btnConfirmDeviation: document.getElementById('btn-confirm-deviation'),
        devEstHourDisplay: document.getElementById('dev-est-hour'),
        devActualHourDisplay: document.getElementById('dev-actual-hour'),
        devDiffDisplay: document.getElementById('dev-diff'),
        devRatingDisplay: document.getElementById('dev-rating'),
        devWarningBox: document.getElementById('dev-warning-box'),

        // Add Machine Modal
        btnOpenAdd: document.getElementById('btn-open-add'),
        addModalOverlay: document.getElementById('add-modal-overlay'),
        btnCloseAddModal: document.getElementById('btn-close-modal'),
        btnCancelAddModal: document.getElementById('btn-cancel-modal'),
        btnSubmitMachine: document.getElementById('btn-submit-machine'),
        newMachNo: document.getElementById('new-mach-no'),
        newMachModel: document.getElementById('new-mach-model'),
        newMachSerial: document.getElementById('new-mach-serial'),
        newMachDept: document.getElementById('new-mach-dept'),
        newMachRated: document.getElementById('new-mach-rated'),
        newMachCurrent: document.getElementById('new-mach-current'),

        // Edit Machine Modal
        editModalOverlay: document.getElementById('edit-modal-overlay'),
        btnCloseEditModal: document.getElementById('btn-close-edit-modal'),
        btnCancelEditModal: document.getElementById('btn-cancel-edit-modal'),
        btnSubmitEditMachine: document.getElementById('btn-submit-edit-machine'),
        editMachId: document.getElementById('edit-mach-id'),
        editMachNo: document.getElementById('edit-mach-no'),
        editMachModel: document.getElementById('edit-mach-model'),
        editMachSerial: document.getElementById('edit-mach-serial'),
        editMachDept: document.getElementById('edit-mach-dept'),
        editMachRated: document.getElementById('edit-mach-rated'),
        editMachBaseHour: document.getElementById('edit-mach-base-hour'),

        // Mode Authentication Modal & Controls
        btnToggleMode: document.getElementById('btn-toggle-mode'),
        modeLabel: document.getElementById('mode-label'),
        modeModalOverlay: document.getElementById('mode-modal-overlay'),
        inputModePassword: document.getElementById('input-mode-password'),
        btnSubmitModeAuth: document.getElementById('btn-submit-mode-auth'),
        btnCancelModeModal: document.getElementById('btn-cancel-mode-modal'),
        btnCloseModeModal: document.getElementById('btn-close-mode-modal'),
        modePasswordError: document.getElementById('mode-password-error')
    };
}

let pendingEngineerAction = null;

function updateModeBadgeUI() {
    const isEng = AppState.settings.accessMode === 'ENGINEER';
    if (DOM.btnToggleMode) {
        DOM.btnToggleMode.className = `user-profile-btn ${isEng ? 'user-eng' : 'user-cust'}`;
        DOM.btnToggleMode.title = `Current User: ${isEng ? 'Engineer Mode' : 'Customer Mode'}. Click to switch.`;
        DOM.btnToggleMode.innerHTML = `
            <div class="user-avatar ${isEng ? 'avatar-engineer' : 'avatar-customer'}">${isEng ? 'E' : 'C'}</div>
            <div class="user-info">
                <span id="mode-label" class="user-name">${isEng ? 'Engineer Admin' : 'Customer View'}</span>
                <span class="user-role-badge ${isEng ? 'role-eng' : 'role-cust'}">${isEng ? 'Full Access' : 'Read Only'}</span>
            </div>
            <svg class="icon user-dropdown-icon" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
        `;
    }
}

function requireEngineerMode(actionCallback) {
    if (AppState.settings.accessMode === 'ENGINEER') {
        if (typeof actionCallback === 'function') actionCallback();
    } else {
        pendingEngineerAction = actionCallback;
        if (DOM.inputModePassword) DOM.inputModePassword.value = '';
        if (DOM.modePasswordError) DOM.modePasswordError.style.display = 'none';
        UI.showModal(DOM.modeModalOverlay);
    }
}


function getEvalTime() {
    const simDateStr = DOM.todayDate ? DOM.todayDate.value : AppState.simulatedDate;
    return getCurrentEvalTime(simDateStr);
}

async function initApp() {
    initDOM();
    AppState.machines = await StorageService.loadMachinesAsync();
    AppState.settings = StorageService.loadSettings();

    UI.applyTheme(AppState.settings.theme);
    updateModeBadgeUI();

    if (DOM.todayDate) DOM.todayDate.value = AppState.simulatedDate;

    // Check page route or query parameter
    const urlMachineId = getQueryParam('id');
    const path = window.location.pathname;

    if (path.includes('machine.html') || urlMachineId) {
        const idToLoad = urlMachineId || (AppState.machines[0] ? AppState.machines[0].id : null);
        if (idToLoad) {
            showMachineDetail(idToLoad);
        } else {
            showFleetView();
        }
    } else if (path.includes('settings.html')) {
        showSettingsView();
    } else {
        showFleetView();
    }

    setupEventListeners();

    // Smooth real-time 1-second refresh
    setInterval(() => {
        const evalTime = getEvalTime();
        if (DOM.viewFleet && !DOM.viewFleet.classList.contains('hidden')) {
            DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, evalTime, handleMachineSelect, handleEditMachine, handleDeleteMachine, true);
        } else if (DOM.viewSingle && !DOM.viewSingle.classList.contains('hidden') && AppState.currentMachineId) {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine) {
                MachineController.renderSingleDashboard(machine, DOM, evalTime, true);
            }
        }
    }, 1000);
}

function showFleetView() {
    if (DOM.viewSingle) {
        DOM.viewSingle.classList.add('hidden');
        DOM.viewSingle.classList.remove('as-modal');
    }
    if (DOM.viewSettings) DOM.viewSettings.classList.add('hidden');
    if (DOM.viewFleet) DOM.viewFleet.classList.remove('hidden');

    AppState.currentMachineId = null;
    setQueryParam('id', null);

    const evalTime = getEvalTime();
    if (DOM.fleetGrid) {
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, evalTime, handleMachineSelect, handleEditMachine, handleDeleteMachine);
    }
}

function handleMachineSelect(id) {
    if (window.location.pathname.includes('machine.html')) {
        showMachineDetail(id);
    } else if (DOM.viewSingle) {
        showMachineDetail(id);
    } else {
        window.location.href = `machine.html?id=${id}`;
    }
}

function handleEditMachine(id) {
    requireEngineerMode(() => {
        const machine = AppState.machines.find(m => m.id === id);
        if (!machine) return;

        if (DOM.editMachId) DOM.editMachId.value = machine.id;
        if (DOM.editMachNo) DOM.editMachNo.value = machine.machineNo || '';
        if (DOM.editMachModel) DOM.editMachModel.value = machine.model || 'BMD302W';
        if (DOM.editMachSerial) DOM.editMachSerial.value = machine.serialNo || '';
        if (DOM.editMachDept) DOM.editMachDept.value = machine.department || 'Wafer Prep';
        if (DOM.editMachRated) DOM.editMachRated.value = machine.ratedLife || 25000;
        if (DOM.editMachBaseHour) DOM.editMachBaseHour.value = machine.baseLaserHour || 0;

        UI.showModal(DOM.editModalOverlay);
    });
}

function handleDeleteMachine(id) {
    requireEngineerMode(() => {
        const machine = AppState.machines.find(m => m.id === id);
        const mName = machine ? `${machine.machineNo} (${machine.machineName})` : 'this machine';
        if (confirm(`Are you sure you want to delete ${mName}? This action cannot be undone.`)) {
            StorageService.deleteMachine(id);
            AppState.machines = StorageService.loadMachines();
            if (AppState.currentMachineId === id) {
                AppState.currentMachineId = null;
            }
            UI.showToast(`Deleted machine ${machine ? machine.machineNo : ''}`, 'warning');
            if (window.location.pathname.includes('machine.html')) {
                window.location.href = 'index.html';
            } else {
                showFleetView();
            }
        }
    });
}

function showMachineDetail(id) {
    AppState.currentMachineId = id;
    setQueryParam('id', id);

    if (DOM.viewFleet) {
        DOM.viewFleet.classList.remove('hidden');
        if (DOM.viewSingle) {
            DOM.viewSingle.classList.add('as-modal');
            DOM.viewSingle.classList.remove('hidden');
        }
    } else {
        if (DOM.viewSingle) DOM.viewSingle.classList.remove('hidden');
    }
    if (DOM.viewSettings) DOM.viewSettings.classList.add('hidden');

    const machine = AppState.machines.find(m => m.id === id);
    if (!machine) return;

    if (DOM.detMachNo) DOM.detMachNo.value = machine.machineNo;
    if (DOM.detModel) DOM.detModel.value = machine.model;
    if (DOM.detSerialNo) DOM.detSerialNo.value = machine.serialNo;
    if (DOM.detDept) DOM.detDept.value = machine.department;
    if (DOM.detRated) DOM.detRated.value = machine.ratedLife;

    if (DOM.prevHour) DOM.prevHour.value = machine.baseLaserHour;
    if (DOM.prevDate) DOM.prevDate.value = new Date(machine.baseTimestamp).toISOString().slice(0, 16);

    const evalTime = getEvalTime();
    MachineController.renderMaintenanceLog(machine, DOM.maintTbody);
    MachineController.renderCalibrationHistory(machine, DOM.calibrationTbody);
    MachineController.renderSingleDashboard(machine, DOM, evalTime);
}

function showSettingsView() {
    if (DOM.viewFleet) DOM.viewFleet.classList.add('hidden');
    if (DOM.viewSingle) DOM.viewSingle.classList.add('hidden');
    if (DOM.viewSettings) DOM.viewSettings.classList.remove('hidden');
}

function setupEventListeners() {
    // Search & Filter Listeners
    if (DOM.filterSearch) DOM.filterSearch.addEventListener('input', (e) => {
        AppState.filters.search = e.target.value;
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
    });
    if (DOM.filterStatus) DOM.filterStatus.addEventListener('change', (e) => {
        AppState.filters.status = e.target.value;
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
    });
    if (DOM.filterDept) DOM.filterDept.addEventListener('change', (e) => {
        AppState.filters.dept = e.target.value;
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
    });
    if (DOM.filterModel) DOM.filterModel.addEventListener('change', (e) => {
        AppState.filters.model = e.target.value;
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
    });
    if (DOM.filterSort) DOM.filterSort.addEventListener('change', (e) => {
        AppState.filters.sort = e.target.value;
        DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
    });

    // Mode Switching & Password Auth Listeners
    if (DOM.btnToggleMode) {
        DOM.btnToggleMode.addEventListener('click', () => {
            if (AppState.settings.accessMode === 'ENGINEER') {
                AppState.settings.accessMode = 'CUSTOMER';
                StorageService.saveSettings(AppState.settings);
                updateModeBadgeUI();
                UI.showToast('Switched to Customer Mode (Read-Only)', 'warning');
            } else {
                requireEngineerMode(() => {
                    UI.showToast('Engineer Mode Unlocked!', 'success');
                });
            }
        });
    }

    if (DOM.btnSubmitModeAuth) {
        DOM.btnSubmitModeAuth.addEventListener('click', () => {
            const entered = DOM.inputModePassword ? DOM.inputModePassword.value : '';
            const correct = AppState.settings.engineerPassword || '1234';
            if (entered === correct) {
                AppState.settings.accessMode = 'ENGINEER';
                StorageService.saveSettings(AppState.settings);
                updateModeBadgeUI();
                UI.hideModal(DOM.modeModalOverlay);
                UI.showToast('Engineer Mode Unlocked!', 'success');
                if (pendingEngineerAction) {
                    const cb = pendingEngineerAction;
                    pendingEngineerAction = null;
                    cb();
                }
            } else {
                if (DOM.modePasswordError) DOM.modePasswordError.style.display = 'block';
            }
        });
    }

    const closeModeModal = () => {
        UI.hideModal(DOM.modeModalOverlay);
        pendingEngineerAction = null;
    };
    if (DOM.btnCancelModeModal) DOM.btnCancelModeModal.addEventListener('click', closeModeModal);
    if (DOM.btnCloseModeModal) DOM.btnCloseModeModal.addEventListener('click', closeModeModal);

    // Detail Inputs
    if (DOM.prevHour) DOM.prevHour.addEventListener('input', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine) {
                machine.baseLaserHour = Number(DOM.prevHour.value) || 0;
                MachineController.renderSingleDashboard(machine, DOM, getEvalTime());
            }
        });
    });

    if (DOM.prevDate) DOM.prevDate.addEventListener('change', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine && DOM.prevDate.value) {
                machine.baseTimestamp = new Date(DOM.prevDate.value).toISOString();
                MachineController.renderSingleDashboard(machine, DOM, getEvalTime());
            }
        });
    });

    if (DOM.todayDate) DOM.todayDate.addEventListener('change', () => {
        AppState.simulatedDate = DOM.todayDate.value;
        const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
        if (machine) {
            MachineController.renderSingleDashboard(machine, DOM, getEvalTime());
        }
    });

    if (DOM.detRated) DOM.detRated.addEventListener('input', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine) {
                machine.ratedLife = Number(DOM.detRated.value) || 25000;
                machine.warningLife = Math.floor(machine.ratedLife * 0.8);
                MachineController.renderSingleDashboard(machine, DOM, getEvalTime());
            }
        });
    });

    if (DOM.btnBack) DOM.btnBack.addEventListener('click', () => {
        if (window.location.pathname.includes('machine.html')) {
            window.location.href = 'index.html';
        } else {
            showFleetView();
        }
    });

    if (DOM.btnCloseMachModal) DOM.btnCloseMachModal.addEventListener('click', () => {
        if (window.location.pathname.includes('machine.html')) {
            window.location.href = 'index.html';
        } else {
            showFleetView();
        }
    });

    // Modal Tabs Switching Listener
    const tabBtns = document.querySelectorAll('.mach-tab-btn');
    const tabPanes = document.querySelectorAll('.mach-tab-pane');

    function switchTab(tabId) {
        tabBtns.forEach(b => {
            if (b.getAttribute('data-tab') === tabId) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        tabPanes.forEach(pane => {
            if (pane.id === `tab-${tabId}`) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            if (targetTab === 'config' && AppState.settings.accessMode !== 'ENGINEER') {
                requireEngineerMode(() => {
                    switchTab(targetTab);
                });
                return;
            }
            switchTab(targetTab);
        });
    });

    // ESC Key to Close Modal Workspace
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && DOM.viewSingle && !DOM.viewSingle.classList.contains('hidden')) {
            showFleetView();
        }
    });

    // Backdrop Click Outside to Close Modal Workspace
    if (DOM.viewSingle) {
        DOM.viewSingle.addEventListener('click', (e) => {
            if (DOM.viewSingle.classList.contains('as-modal') && e.target === DOM.viewSingle) {
                showFleetView();
            }
        });
    }

    // Secondary Action Triggers
    const btnOpenRecal2 = document.getElementById('btn-open-recalibrate-2');
    if (btnOpenRecal2) {
        btnOpenRecal2.addEventListener('click', () => {
            if (DOM.btnOpenRecalibrate) DOM.btnOpenRecalibrate.click();
        });
    }

    const btnEditConfig = document.getElementById('btn-edit-config-trigger');
    if (btnEditConfig) {
        btnEditConfig.addEventListener('click', () => {
            if (AppState.settings.accessMode !== 'ENGINEER') {
                requireEngineerMode(() => {
                    switchTab('config');
                });
            } else {
                switchTab('config');
            }
        });
    }

    if (DOM.btnSaveMachine) DOM.btnSaveMachine.addEventListener('click', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine) {
                if (DOM.detMachNo) machine.machineNo = DOM.detMachNo.value.trim() || machine.machineNo;
                if (DOM.detModel) {
                    machine.model = DOM.detModel.value;
                    machine.machineName = `Wafer Driller ${DOM.detModel.value}`;
                }
                if (DOM.detSerialNo) machine.serialNo = DOM.detSerialNo.value.trim() || machine.serialNo;
                if (DOM.detDept) machine.department = DOM.detDept.value;
                if (DOM.detRated) {
                    machine.ratedLife = Number(DOM.detRated.value) || 25000;
                    machine.warningLife = Math.floor(machine.ratedLife * 0.8);
                }
                if (DOM.prevHour) machine.baseLaserHour = Number(DOM.prevHour.value) || 0;
                if (DOM.prevDate && DOM.prevDate.value) {
                    machine.baseTimestamp = new Date(DOM.prevDate.value).toISOString();
                }

                StorageService.saveMachine(machine);
                MachineController.updateLegendsAndScales(machine, DOM);
                UI.showToast(`Saved machine ${machine.machineNo} ✓`, 'success');

                const origTxt = DOM.btnSaveMachine.textContent;
                DOM.btnSaveMachine.textContent = "Saved ✓";
                setTimeout(() => DOM.btnSaveMachine.textContent = origTxt, 1200);
            }
        });
    });

    if (DOM.btnAddRecord) DOM.btnAddRecord.addEventListener('click', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (machine) {
                if (!Array.isArray(machine.maintenanceHistory)) machine.maintenanceHistory = [];
                machine.maintenanceHistory.unshift({
                    date: AppState.simulatedDate,
                    engineer: 'Engineer',
                    action: 'Routine Inspection',
                    notes: 'Inspected optical alignment and cooling flow.'
                });
                StorageService.saveMachine(machine);
                MachineController.renderMaintenanceLog(machine, DOM.maintTbody);
                UI.showToast('Added maintenance record', 'success');
            }
        });
    });

    // Recalibration Flow
    if (DOM.btnOpenRecalibrate) DOM.btnOpenRecalibrate.addEventListener('click', () => {
        requireEngineerMode(() => {
            const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
            if (!machine) return;

            const evalTime = getEvalTime();
            const est = LaserEngine.calculateEstimatedHour(machine.baseLaserHour, machine.baseTimestamp, evalTime);

            if (DOM.recalCurrentEstDisplay) DOM.recalCurrentEstDisplay.textContent = `${Math.round(est * 10) / 10} hrs`;
            if (DOM.recalActualInput) DOM.recalActualInput.value = Math.round(est);
            if (DOM.recalReasonSelect) DOM.recalReasonSelect.value = 'Scheduled PM';

            UI.showModal(DOM.recalOverlay);
        });
    });

    const closeRecalModal = () => UI.hideModal(DOM.recalOverlay);
    if (DOM.btnCloseRecalModal) DOM.btnCloseRecalModal.addEventListener('click', closeRecalModal);
    if (DOM.btnCancelRecalModal) DOM.btnCancelRecalModal.addEventListener('click', closeRecalModal);

    if (DOM.btnSubmitRecalibrate) DOM.btnSubmitRecalibrate.addEventListener('click', () => {
        const actualHour = Number(DOM.recalActualInput.value);
        if (isNaN(actualHour) || actualHour < 0) {
            UI.showToast("Please enter a valid actual machine hour reading.", "error");
            return;
        }

        const machine = AppState.machines.find(m => m.id === AppState.currentMachineId);
        if (!machine) return;

        const evalTime = getEvalTime();
        const reason = DOM.recalReasonSelect.value;

        const result = RecalibrationController.prepareRecalibration(machine, actualHour, reason, evalTime);
        AppState.pendingRecalibration = result;

        if (DOM.devEstHourDisplay) DOM.devEstHourDisplay.textContent = `${result.analysis.estimatedHour.toLocaleString()} hrs`;
        if (DOM.devActualHourDisplay) DOM.devActualHourDisplay.textContent = `${result.analysis.actualHour.toLocaleString()} hrs`;

        const diff = result.analysis.difference;
        if (DOM.devDiffDisplay) {
            DOM.devDiffDisplay.textContent = diff > 0 ? `+${diff} hrs` : `${diff} hrs`;
            DOM.devDiffDisplay.style.color = RecalibrationController.getDeviationColor(diff);
        }

        if (DOM.devRatingDisplay) DOM.devRatingDisplay.textContent = result.analysis.ratingInfo.rating;

        if (DOM.devWarningBox) {
            if (result.analysis.ratingInfo.warningMsg) {
                DOM.devWarningBox.textContent = result.analysis.ratingInfo.warningMsg;
                DOM.devWarningBox.classList.remove('hidden');
            } else {
                DOM.devWarningBox.classList.add('hidden');
            }
        }

        closeRecalModal();
        UI.showModal(DOM.deviationOverlay);
    });

    const closeDevModal = () => UI.hideModal(DOM.deviationOverlay);
    if (DOM.btnCloseDevModal) DOM.btnCloseDevModal.addEventListener('click', closeDevModal);
    if (DOM.btnBackDevModal) DOM.btnBackDevModal.addEventListener('click', () => {
        closeDevModal();
        UI.showModal(DOM.recalOverlay);
    });

    if (DOM.btnConfirmDeviation) DOM.btnConfirmDeviation.addEventListener('click', () => {
        if (!AppState.pendingRecalibration) return;

        const { updatedMachine } = AppState.pendingRecalibration;
        StorageService.saveMachine(updatedMachine);
        AppState.machines = StorageService.loadMachines();
        AppState.pendingRecalibration = null;

        closeDevModal();
        UI.showToast('Recalibration Baseline Applied ✓', 'success');

        const m = AppState.machines.find(item => item.id === AppState.currentMachineId);
        if (m) {
            if (DOM.prevHour) DOM.prevHour.value = m.baseLaserHour;
            if (DOM.prevDate) DOM.prevDate.value = new Date(m.baseTimestamp).toISOString().slice(0, 16);
            MachineController.renderCalibrationHistory(m, DOM.calibrationTbody);
            MachineController.renderSingleDashboard(m, DOM, getEvalTime());
        }
    });

    // Global Header Action Buttons
    if (DOM.btnTheme) DOM.btnTheme.addEventListener('click', () => {
        const nextTheme = UI.toggleTheme();
        AppState.settings.theme = nextTheme;
        StorageService.saveSettings(AppState.settings);
    });

    if (DOM.btnPrint) DOM.btnPrint.addEventListener('click', () => UI.printReport());
    if (DOM.btnExportCsv) DOM.btnExportCsv.addEventListener('click', () => {
        UI.exportToCSV(AppState.machines, getEvalTime(), AppState.simulatedDate);
        UI.showToast('CSV Report Downloaded', 'success');
    });

    // Add Machine Modal
    const openAddModal = () => {
        requireEngineerMode(() => {
            if (DOM.newMachNo) DOM.newMachNo.value = '';
            if (DOM.newMachSerial) DOM.newMachSerial.value = '';
            if (DOM.newMachRated) DOM.newMachRated.value = '25000';
            if (DOM.newMachCurrent) DOM.newMachCurrent.value = '0';
            UI.showModal(DOM.addModalOverlay);
        });
    };
    const closeAddModal = () => UI.hideModal(DOM.addModalOverlay);

    if (DOM.btnOpenAdd) DOM.btnOpenAdd.addEventListener('click', openAddModal);
    if (DOM.btnCloseAddModal) DOM.btnCloseAddModal.addEventListener('click', closeAddModal);
    if (DOM.btnCancelAddModal) DOM.btnCancelAddModal.addEventListener('click', closeAddModal);

    if (DOM.btnSubmitMachine) DOM.btnSubmitMachine.addEventListener('click', () => {
        const no = (DOM.newMachNo ? DOM.newMachNo.value.trim() : '') || 'NEW-000';
        const model = DOM.newMachModel ? DOM.newMachModel.value : 'BMD302W';
        const serial = (DOM.newMachSerial ? DOM.newMachSerial.value.trim() : '') || 'SN-XXXX';
        const dept = DOM.newMachDept ? DOM.newMachDept.value : 'Wafer Prep';
        const rated = Number(DOM.newMachRated ? DOM.newMachRated.value : 25000) || 25000;
        const current = Number(DOM.newMachCurrent ? DOM.newMachCurrent.value : 0) || 0;
        const nowISO = getEvalTime().toISOString();

        const newMachine = {
            id: 'WD-' + Math.floor(Math.random() * 100000),
            machineNo: no,
            machineName: `Wafer Driller ${model}`,
            model: model,
            serialNo: serial,
            department: dept,
            ratedLife: rated,
            warningLife: Math.floor(rated * 0.8),
            baseLaserHour: current,
            baseTimestamp: nowISO,
            lastRecalibrationDate: nowISO,
            maintenanceHistory: [],
            calibrationHistory: []
        };

        StorageService.saveMachine(newMachine);
        AppState.machines = StorageService.loadMachines();
        closeAddModal();
        UI.showToast(`Created machine ${no}`, 'success');

        if (DOM.fleetGrid) {
            DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
        }
    });

    // Edit Machine Modal
    const closeEditModal = () => UI.hideModal(DOM.editModalOverlay);
    if (DOM.btnCloseEditModal) DOM.btnCloseEditModal.addEventListener('click', closeEditModal);
    if (DOM.btnCancelEditModal) DOM.btnCancelEditModal.addEventListener('click', closeEditModal);

    if (DOM.btnSubmitEditMachine) DOM.btnSubmitEditMachine.addEventListener('click', () => {
        const id = DOM.editMachId ? DOM.editMachId.value : null;
        if (!id) return;

        const machine = AppState.machines.find(m => m.id === id);
        if (!machine) return;

        if (DOM.editMachNo) machine.machineNo = DOM.editMachNo.value.trim() || machine.machineNo;
        if (DOM.editMachModel) {
            machine.model = DOM.editMachModel.value;
            machine.machineName = `Wafer Driller ${DOM.editMachModel.value}`;
        }
        if (DOM.editMachSerial) machine.serialNo = DOM.editMachSerial.value.trim() || machine.serialNo;
        if (DOM.editMachDept) machine.department = DOM.editMachDept.value;
        if (DOM.editMachRated) {
            machine.ratedLife = Number(DOM.editMachRated.value) || 25000;
            machine.warningLife = Math.floor(machine.ratedLife * 0.8);
        }
        if (DOM.editMachBaseHour) {
            machine.baseLaserHour = Number(DOM.editMachBaseHour.value) || 0;
        }

        StorageService.saveMachine(machine);
        AppState.machines = StorageService.loadMachines();
        closeEditModal();
        UI.showToast(`Updated machine ${machine.machineNo}`, 'success');

        if (DOM.fleetGrid) {
            DashboardController.renderFleetView(DOM.fleetGrid, AppState.machines, AppState.filters, getEvalTime(), handleMachineSelect, handleEditMachine, handleDeleteMachine);
        }
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", (e) => {
        // Ctrl+S or Cmd+S to Save
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
            e.preventDefault();
            if (DOM.btnSaveMachine) DOM.btnSaveMachine.click();
        }
        // Ctrl+P or Cmd+P to Print Report
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
            e.preventDefault();
            UI.printReport();
        }
        // Ctrl+E or Cmd+E to Toggle Engineer Mode
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
            e.preventDefault();
            if (DOM.btnToggleMode) DOM.btnToggleMode.click();
        }
        // Focus search input on / or Ctrl+F
        if ((e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f")) && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            if (DOM.filterSearch) {
                e.preventDefault();
                DOM.filterSearch.focus();
            }
        }
        // Escape closes all modals
        if (e.key === "Escape") {
            closeAddModal();
            closeEditModal();
            closeRecalModal();
            closeDevModal();
            closeModeModal();
        }
    });
}

window.addEventListener('DOMContentLoaded', initApp);
