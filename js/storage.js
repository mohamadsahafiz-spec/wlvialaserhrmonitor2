/* =====================================================
   STORAGE.JS - Local Storage & Data Persistence Layer
   ===================================================== */
import { dateOffset } from './utils.js';

const STORAGE_KEY = 'wafer_driller_fleet_v5';
const SETTINGS_KEY = 'wafer_driller_settings_v5';

function getFallbackMachines() {
    return [
        {
            id: 'WD-101-ID',
            machineNo: 'WD-101',
            machineName: 'Wafer Driller BMD302W',
            serialNo: 'BMD3-9021',
            manufacturer: 'SemiconTech',
            model: 'BMD302W',
            department: 'Wafer Prep',
            lasers: [
                {
                    id: 'WD-101-L1',
                    name: 'Laser Head 1',
                    serialNo: 'BMD3-9021-L1',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 12500,
                    baseTimestamp: dateOffset(30),
                    lastRecalibrationDate: dateOffset(30),
                    calibrationHistory: [
                        { date: dateOffset(30), estimatedHour: 12490, actualHour: 12500, difference: 10, reason: 'Scheduled PM', rating: '★★★★★ Excellent' }
                    ]
                },
                {
                    id: 'WD-101-L2',
                    name: 'Laser Head 2',
                    serialNo: 'BMD3-9021-L2',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 20500,
                    baseTimestamp: dateOffset(30),
                    lastRecalibrationDate: dateOffset(30),
                    calibrationHistory: []
                }
            ],
            maintenanceHistory: [
                { date: dateOffset(120).split('T')[0], engineer: 'J. Smith', action: 'Lens Clean', notes: 'Routine check' },
                { date: dateOffset(60).split('T')[0], engineer: 'M. Doe', action: 'Filter Replace', notes: 'Dust accumulation high' }
            ],
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'WD-102-ID',
            machineNo: 'WD-102',
            machineName: 'Wafer Driller BMD250WM',
            serialNo: 'BMD2-40401',
            manufacturer: 'SemiconTech',
            model: 'BMD250WM',
            department: 'Packaging',
            lasers: [
                {
                    id: 'WD-102-L1',
                    name: 'Laser Head 1',
                    serialNo: 'BMD2-40401-L1',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 19800,
                    baseTimestamp: dateOffset(45),
                    lastRecalibrationDate: dateOffset(45),
                    calibrationHistory: [
                        { date: dateOffset(45), estimatedHour: 19780, actualHour: 19800, difference: 20, reason: 'Manual Verification', rating: '★★★★☆ Very Good' }
                    ]
                },
                {
                    id: 'WD-102-L2',
                    name: 'Laser Head 2',
                    serialNo: 'BMD2-40401-L2',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 14200,
                    baseTimestamp: dateOffset(45),
                    lastRecalibrationDate: dateOffset(45),
                    calibrationHistory: []
                },
                {
                    id: 'WD-102-L3',
                    name: 'Laser Head 3',
                    serialNo: 'BMD2-40401-L3',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 8900,
                    baseTimestamp: dateOffset(45),
                    lastRecalibrationDate: dateOffset(45),
                    calibrationHistory: []
                }
            ],
            maintenanceHistory: [
                { date: dateOffset(70).split('T')[0], engineer: 'T. Stark', action: 'Calibration', notes: 'Beam alignment drift corrected' }
            ],
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'WD-201-ID',
            machineNo: 'WD-201',
            machineName: 'Wafer Driller BMD302W',
            serialNo: 'BMD3-8832',
            manufacturer: 'SemiconTech',
            model: 'BMD302W',
            department: 'R&D',
            lasers: [
                {
                    id: 'WD-201-L1',
                    name: 'Laser Head 1',
                    serialNo: 'BMD3-8832-L1',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 24500,
                    baseTimestamp: dateOffset(95),
                    lastRecalibrationDate: dateOffset(95),
                    calibrationHistory: [
                        { date: dateOffset(95), estimatedHour: 24450, actualHour: 24500, difference: 50, reason: 'Breakdown', rating: '★★★☆☆ Good' }
                    ]
                },
                {
                    id: 'WD-201-L2',
                    name: 'Laser Head 2',
                    serialNo: 'BMD3-8832-L2',
                    ratedLife: 25000,
                    warningLife: 20000,
                    baseLaserHour: 18100,
                    baseTimestamp: dateOffset(95),
                    lastRecalibrationDate: dateOffset(95),
                    calibrationHistory: []
                }
            ],
            maintenanceHistory: [
                { date: dateOffset(200).split('T')[0], engineer: 'B. Banner', action: 'Diode Module 1 Replace', notes: 'Power drop detected' }
            ],
            lastUpdated: new Date().toISOString()
        },
        {
            id: 'WD-305-ID',
            machineNo: 'WD-305',
            machineName: 'Wafer Driller BMD250WM',
            serialNo: 'BMD2-771',
            manufacturer: 'SemiconTech',
            model: 'BMD250WM',
            department: 'Wafer Prep',
            lasers: [
                {
                    id: 'WD-305-L1',
                    name: 'Laser Head 1',
                    serialNo: 'BMD2-771-L1',
                    ratedLife: 20000,
                    warningLife: 15000,
                    baseLaserHour: 2500,
                    baseTimestamp: dateOffset(10),
                    lastRecalibrationDate: dateOffset(10),
                    calibrationHistory: []
                },
                {
                    id: 'WD-305-L2',
                    name: 'Laser Head 2',
                    serialNo: 'BMD2-771-L2',
                    ratedLife: 20000,
                    warningLife: 15000,
                    baseLaserHour: 3100,
                    baseTimestamp: dateOffset(10),
                    lastRecalibrationDate: dateOffset(10),
                    calibrationHistory: []
                },
                {
                    id: 'WD-305-L3',
                    name: 'Laser Head 3',
                    serialNo: 'BMD2-771-L3',
                    ratedLife: 20000,
                    warningLife: 15000,
                    baseLaserHour: 1800,
                    baseTimestamp: dateOffset(10),
                    lastRecalibrationDate: dateOffset(10),
                    calibrationHistory: []
                },
                {
                    id: 'WD-305-L4',
                    name: 'Laser Head 4',
                    serialNo: 'BMD2-771-L4',
                    ratedLife: 20000,
                    warningLife: 15000,
                    baseLaserHour: 2900,
                    baseTimestamp: dateOffset(10),
                    lastRecalibrationDate: dateOffset(10),
                    calibrationHistory: []
                }
            ],
            maintenanceHistory: [],
            lastUpdated: new Date().toISOString()
        }
    ];
}

export const StorageService = {
    normalizeMachines(list) {
        if (!Array.isArray(list)) return getFallbackMachines();
        return list.map(m => {
            const id = m.id || 'WD-' + Math.floor(Math.random() * 100000);
            const machineNo = m.machineNo || 'WD-000';
            const machineName = m.machineName || ('Wafer Driller ' + (m.model || 'BMD302W'));
            const serialNo = m.serialNo || 'SN-0000';
            const manufacturer = m.manufacturer || 'SemiconTech';
            const model = m.model || 'BMD302W';
            const department = m.department || 'Wafer Prep';

            // Multi-laser normalization: ensure lasers array exists and has valid objects
            let lasers = Array.isArray(m.lasers) && m.lasers.length > 0 ? m.lasers : null;

            if (!lasers) {
                // Migrate single laser machine object into multi-laser structure
                const rated = Number(m.ratedLife) || 25000;
                const warn = Number(m.warningLife) || Math.floor(rated * 0.8);
                const baseHour = typeof m.baseLaserHour === 'number' ? m.baseLaserHour : (Number(m.prevHour) || 0);
                let baseTs = (m.baseTimestamp && !isNaN(new Date(m.baseTimestamp).getTime()))
                    ? m.baseTimestamp
                    : ((m.prevDate && !isNaN(new Date(m.prevDate).getTime())) ? new Date(m.prevDate).toISOString() : new Date().toISOString());

                lasers = [{
                    id: `${id}-L1`,
                    name: 'Laser Head 1',
                    serialNo: m.laserSerialNo || (serialNo ? `${serialNo}-L1` : 'LS-101'),
                    ratedLife: rated,
                    warningLife: warn,
                    baseLaserHour: baseHour,
                    baseTimestamp: baseTs,
                    lastRecalibrationDate: m.lastRecalibrationDate || baseTs,
                    calibrationHistory: Array.isArray(m.calibrationHistory) ? m.calibrationHistory : []
                }];
            } else {
                // Ensure every laser in array is fully valid
                lasers = lasers.map((laser, idx) => {
                    const lRated = Number(laser.ratedLife) || 25000;
                    const lWarn = Number(laser.warningLife) || Math.floor(lRated * 0.8);
                    const lBase = typeof laser.baseLaserHour === 'number' ? laser.baseLaserHour : 0;
                    const lTs = (laser.baseTimestamp && !isNaN(new Date(laser.baseTimestamp).getTime())) ? laser.baseTimestamp : new Date().toISOString();

                    return {
                        id: laser.id || `${id}-L${idx + 1}`,
                        name: laser.name || `Laser Head ${idx + 1}`,
                        serialNo: laser.serialNo || `${serialNo}-L${idx + 1}`,
                        ratedLife: lRated,
                        warningLife: lWarn,
                        baseLaserHour: lBase,
                        baseTimestamp: lTs,
                        lastRecalibrationDate: laser.lastRecalibrationDate || lTs,
                        calibrationHistory: Array.isArray(laser.calibrationHistory) ? laser.calibrationHistory : []
                    };
                });
            }

            return {
                id,
                machineNo,
                machineName,
                serialNo,
                manufacturer,
                model,
                department,
                lasers,
                maintenanceHistory: Array.isArray(m.maintenanceHistory) ? m.maintenanceHistory : [],
                lastUpdated: m.lastUpdated || new Date().toISOString()
            };
        });
    },

    async loadMachinesAsync() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return this.normalizeMachines(parsed);
                }
            }
            // Fetch initial machines from data/machines.json if localStorage is empty
            const res = await fetch('data/machines.json');
            if (res.ok) {
                const json = await res.json();
                if (Array.isArray(json) && json.length > 0) {
                    const normalized = this.normalizeMachines(json);
                    this.saveMachines(normalized);
                    return normalized;
                }
            }
        } catch (err) {
            console.warn('[StorageService] Error loading data/machines.json, using fallbacks:', err);
        }
        const fallback = getFallbackMachines();
        this.saveMachines(fallback);
        return fallback;
    },

    loadMachines() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                const initial = getFallbackMachines();
                this.saveMachines(initial);
                return initial;
            }
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                const initial = getFallbackMachines();
                this.saveMachines(initial);
                return initial;
            }
            return this.normalizeMachines(parsed);
        } catch (err) {
            console.error('[StorageService] Error loading machines:', err);
            return getFallbackMachines();
        }
    },

    saveMachines(machines) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(machines));
        } catch (err) {
            console.error('[StorageService] Error saving machines:', err);
        }
    },

    getMachineById(id) {
        const machines = this.loadMachines();
        return machines.find(m => m.id === id) || null;
    },

    saveMachine(machineData) {
        const machines = this.loadMachines();
        const index = machines.findIndex(m => m.id === machineData.id);
        if (index !== -1) {
            machines[index] = { ...machines[index], ...machineData, lastUpdated: new Date().toISOString() };
        } else {
            machines.push({ ...machineData, lastUpdated: new Date().toISOString() });
        }
        this.saveMachines(machines);
        return machines;
    },

    deleteMachine(id) {
        let machines = this.loadMachines();
        machines = machines.filter(m => m.id !== id);
        this.saveMachines(machines);
        return machines;
    },

    loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            const defaults = {
                systemTitle: "Laser Management System",
                version: "1.0",
                theme: "dark",
                defaultRatedLife: 25000,
                defaultWarningPercentage: 80,
                engineerPassword: "1234",
                accessMode: "ENGINEER"
            };
            if (!raw) return defaults;
            const parsed = JSON.parse(raw);
            if (parsed.systemTitle === "Wafer Driller BMD302W/BMD250WM Management") {
                parsed.systemTitle = "Laser Management System";
            }
            return { ...defaults, ...parsed };
        } catch (err) {
            return {
                systemTitle: "Laser Management System",
                version: "1.0",
                theme: "dark",
                engineerPassword: "1234",
                accessMode: "ENGINEER"
            };
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (err) {
            console.error('[StorageService] Error saving settings:', err);
        }
    }
};

window.StorageService = StorageService;
