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
            ratedLife: 25000,
            warningLife: 20000,
            baseLaserHour: 12500,
            baseTimestamp: dateOffset(30),
            lastRecalibrationDate: dateOffset(30),
            maintenanceHistory: [
                { date: dateOffset(120).split('T')[0], engineer: 'J. Smith', action: 'Lens Clean', notes: 'Routine check' },
                { date: dateOffset(60).split('T')[0], engineer: 'M. Doe', action: 'Filter Replace', notes: 'Dust accumulation high' }
            ],
            calibrationHistory: [
                { date: dateOffset(30), estimatedHour: 12490, actualHour: 12500, difference: 10, reason: 'Scheduled PM', rating: '★★★★★ Excellent' }
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
            ratedLife: 25000,
            warningLife: 20000,
            baseLaserHour: 19800,
            baseTimestamp: dateOffset(45),
            lastRecalibrationDate: dateOffset(45),
            maintenanceHistory: [
                { date: dateOffset(70).split('T')[0], engineer: 'T. Stark', action: 'Calibration', notes: 'Beam alignment drift corrected' }
            ],
            calibrationHistory: [
                { date: dateOffset(45), estimatedHour: 19780, actualHour: 19800, difference: 20, reason: 'Manual Verification', rating: '★★★★☆ Very Good' }
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
            ratedLife: 25000,
            warningLife: 20000,
            baseLaserHour: 24500,
            baseTimestamp: dateOffset(95),
            lastRecalibrationDate: dateOffset(95),
            maintenanceHistory: [
                { date: dateOffset(200).split('T')[0], engineer: 'B. Banner', action: 'Diode Module 1 Replace', notes: 'Power drop detected' }
            ],
            calibrationHistory: [
                { date: dateOffset(95), estimatedHour: 24450, actualHour: 24500, difference: 50, reason: 'Breakdown', rating: '★★★☆☆ Good' }
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
            ratedLife: 20000,
            warningLife: 15000,
            baseLaserHour: 2500,
            baseTimestamp: dateOffset(10),
            lastRecalibrationDate: dateOffset(10),
            maintenanceHistory: [],
            calibrationHistory: [],
            lastUpdated: new Date().toISOString()
        }
    ];
}

export const StorageService = {
    normalizeMachines(list) {
        if (!Array.isArray(list)) return getFallbackMachines();
        return list.map(m => {
            const rated = Number(m.ratedLife) || 25000;
            const warn = Number(m.warningLife) || Math.floor(rated * 0.8);
            const baseHour = typeof m.baseLaserHour === 'number' ? m.baseLaserHour : (Number(m.prevHour) || 0);
            let baseTs = m.baseTimestamp;
            if (!baseTs) {
                baseTs = m.prevDate ? new Date(m.prevDate).toISOString() : new Date().toISOString();
            }

            return {
                id: m.id || 'WD-' + Math.floor(Math.random() * 100000),
                machineNo: m.machineNo || 'WD-000',
                machineName: m.machineName || ('Wafer Driller ' + (m.model || 'BMD302W')),
                serialNo: m.serialNo || 'SN-0000',
                manufacturer: m.manufacturer || 'SemiconTech',
                model: m.model || 'BMD302W',
                department: m.department || 'Wafer Prep',
                ratedLife: rated,
                warningLife: warn,
                baseLaserHour: baseHour,
                baseTimestamp: baseTs,
                lastRecalibrationDate: m.lastRecalibrationDate || baseTs,
                maintenanceHistory: Array.isArray(m.maintenanceHistory) ? m.maintenanceHistory : [],
                calibrationHistory: Array.isArray(m.calibrationHistory) ? m.calibrationHistory : [],
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
