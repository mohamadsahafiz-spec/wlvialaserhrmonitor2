/* =====================================================
   LASER ENGINE (laserEngine.js)
   Calculation engine for laser operating hours, remaining
   lifetime, health %, deviation analysis, accuracy,
   and recalibration logic.
   ===================================================== */

export const LaserEngine = {
    /**
     * Calculate continuous estimated laser hour from baseline and timestamp.
     * Assumes continuous 24-hour daily operation.
     * Formula: Current Laser Hour = Base Laser Hour + Elapsed Time (in Hours)
     * Current Laser Hour is NEVER permanently stored; calculated dynamically.
     */
    calculateEstimatedHour(baseLaserHour, baseTimestamp, currentTime) {
        const baseHour = Number(baseLaserHour) || 0;
        const baseMs = new Date(baseTimestamp).getTime();
        const currentMs = new Date(currentTime).getTime();

        if (isNaN(baseMs) || isNaN(currentMs) || currentMs < baseMs) {
            return baseHour;
        }

        const elapsedMs = currentMs - baseMs;
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        return baseHour + elapsedHours;
    },

    /**
     * Calculate remaining operating hours before rated life limit.
     */
    calculateRemainingHours(currentHour, ratedLife) {
        const rated = Number(ratedLife) || 25000;
        return rated - Number(currentHour || 0);
    },

    /**
     * Calculate remaining days based on remaining hours (assuming 24h/day continuous operation).
     */
    calculateRemainingDays(remainingHours) {
        const rem = Number(remainingHours) || 0;
        if (rem < 0) {
            return Math.floor(Math.abs(rem) / 24);
        }
        return Math.floor(rem / 24);
    },

    /**
     * Calculate remaining days breakdown and warning/alarm threshold info.
     */
    calculateRemainingDaysInfo(remainingTotal, ratedLife, warningLife) {
        const rated = Number(ratedLife) || 25000;
        const warn = Number(warningLife) || Math.floor(rated * 0.8);
        const warningThreshold = rated - warn;

        let daysVal = 0;
        let statusMsg = "";
        let urgency = "SAFE";

        if (remainingTotal > warningThreshold) {
            daysVal = Math.floor((remainingTotal - warningThreshold) / 24);
            statusMsg = "Days to WARNING";
            urgency = "SAFE";
        } else if (remainingTotal >= 0) {
            daysVal = Math.floor(remainingTotal / 24);
            statusMsg = "Days to ALARM";
            urgency = "WARNING";
        } else {
            daysVal = Math.floor(Math.abs(remainingTotal) / 24);
            statusMsg = "Days Overdue";
            urgency = "ALARM";
        }

        return {
            daysVal,
            statusMsg,
            urgency,
            formattedText: remainingTotal < 0 ? `${daysVal}d overdue` : `${daysVal.toLocaleString()} days`
        };
    },

    /**
     * Calculate health consumption percentage against rated life limit (0 - 100%).
     */
    calculateHealthPercent(currentHour, ratedLife) {
        const rated = Number(ratedLife) || 25000;
        const curr = Number(currentHour) || 0;
        if (rated <= 0) return 100;
        return Math.max(0, Math.min(100, (curr / rated) * 100));
    },

    /**
     * Calculate machine health status based on current laser hour and rated/warning limits.
     */
    calculateMachineStatus(currentHour, ratedLife, warningLife) {
        const curr = Number(currentHour) || 0;
        const rated = Number(ratedLife) || 25000;
        const warn = Number(warningLife) || Math.floor(rated * 0.8);

        if (curr >= rated) {
            return 'ALARM';
        } else if (curr >= warn) {
            return 'WARNING';
        } else {
            return 'SAFE';
        }
    },

    /**
     * Calculate equivalent machine age in Years and Days based on current laser hour.
     */
    calculateMachineAge(currentHour) {
        const hrs = Number(currentHour) || 0;
        const years = Math.floor(hrs / 8760);
        const remainDays = Math.floor((hrs % 8760) / 24);
        return { years, remainDays, formattedText: `${years} Years • ${remainDays} Days` };
    },

    /**
     * Calculate days elapsed since last recalibration.
     */
    calculateDaysSinceRecalibration(lastRecalibrationDate, currentTime) {
        const recalMs = new Date(lastRecalibrationDate).getTime();
        const currentMs = new Date(currentTime).getTime();
        if (isNaN(recalMs) || isNaN(currentMs) || currentMs < recalMs) {
            return 0;
        }
        return Math.floor((currentMs - recalMs) / (1000 * 60 * 60 * 24));
    },

    /**
     * Determine Accuracy level based solely on days since last recalibration.
     * 0–30 days -> HIGH (Green)
     * 31–90 days -> MEDIUM (Yellow)
     * >90 days -> LOW (Red)
     */
    calculateAccuracy(daysSinceRecalibration) {
        const days = Number(daysSinceRecalibration) || 0;
        if (days <= 30) {
            return { level: 'HIGH', label: '🟢 HIGH', color: 'var(--green)', code: 'HIGH', icon: '🟢' };
        } else if (days <= 90) {
            return { level: 'MEDIUM', label: '🟡 MEDIUM', color: 'var(--yellow)', code: 'MEDIUM', icon: '🟡' };
        } else {
            return { level: 'LOW', label: '🔴 LOW', color: 'var(--red)', code: 'LOW', icon: '🔴' };
        }
    },

    /**
     * Determine advisory status for next recommended recalibration.
     * 0–30 days -> Status: No Action Required
     * 31–90 days -> Status: Verify During Next Service Visit
     * >90 days -> Status: Recalibration Recommended
     */
    calculateRecalibrationRecommendation(daysSinceRecalibration) {
        const days = Number(daysSinceRecalibration) || 0;
        if (days <= 30) {
            return { status: 'No Action Required', urgency: 'SAFE', color: 'var(--green)' };
        } else if (days <= 90) {
            return { status: 'Verify During Next Service Visit', urgency: 'WARNING', color: 'var(--yellow)' };
        } else {
            return { status: 'Recalibration Recommended', urgency: 'ALARM', color: 'var(--red)' };
        }
    },

    /**
     * Calculate suggested next recalibration date (30 days from last recalibration).
     */
    calculateNextRecalibrationDate(lastRecalibrationDate) {
        const recalDate = new Date(lastRecalibrationDate);
        if (isNaN(recalDate.getTime())) return new Date().toISOString().split('T')[0];
        const nextDate = new Date(recalDate);
        nextDate.setDate(nextDate.getDate() + 30);
        return nextDate.toISOString().split('T')[0];
    },

    /**
     * Calculate estimated End-of-Life date based on rated life and continuous 24h consumption.
     */
    calculateEstimatedEndOfLifeDate(currentHour, ratedLife, currentTime) {
        const remainingHours = this.calculateRemainingHours(currentHour, ratedLife);
        const now = new Date(currentTime);
        if (remainingHours <= 0) {
            return 'EXCEEDED';
        }
        const eolMs = now.getTime() + (remainingHours * 3600 * 1000);
        return new Date(eolMs).toISOString().split('T')[0];
    },

    /**
     * Calculate deviation between actual machine hour meter reading and estimated hour.
     * Deviation = Actual Hour - Estimated Hour
     */
    calculateDeviation(actualHour, estimatedHour) {
        return Number(actualHour) - Number(estimatedHour);
    },

    /**
     * Rating scale based on deviation absolute difference:
     * 0–10 hrs -> ★★★★★ Excellent
     * 11–25 hrs -> ★★★★☆ Very Good
     * 26–50 hrs -> ★★★☆☆ Good
     * 51–100 hrs -> ★★☆☆☆ Fair
     * >100 hrs -> ★☆☆☆☆ Poor
     */
    calculateDeviationRating(differenceHours) {
        const absDiff = Math.abs(Number(differenceHours) || 0);
        let rating = '';
        let label = '';
        let warningMsg = null;

        if (absDiff <= 10) {
            rating = '★★★★★ Excellent';
            label = 'Excellent';
        } else if (absDiff <= 25) {
            rating = '★★★★☆ Very Good';
            label = 'Very Good';
        } else if (absDiff <= 50) {
            rating = '★★★☆☆ Good';
            label = 'Good';
        } else if (absDiff <= 100) {
            rating = '★★☆☆☆ Fair';
            label = 'Fair';
        } else {
            rating = '★☆☆☆☆ Poor';
            label = 'Poor';
            warningMsg = 'Machine likely experienced extended downtime. Baseline has been updated successfully.';
        }

        return { absDiff, rating, label, warningMsg };
    },

    /**
     * Full machine metrics calculation. Returns all health and lifetime indicators.
     * Strictly delegates each calculation step to its dedicated function.
     */
    calculateMachineMetrics(machine, currentTime) {
        const now = currentTime ? new Date(currentTime) : new Date();
        const baseHour = Number(machine.baseLaserHour) || 0;
        const baseTs = machine.baseTimestamp || now.toISOString();
        const ratedLife = Number(machine.ratedLife) || 25000;
        const warningLife = Number(machine.warningLife) || Math.floor(ratedLife * 0.8);

        const currentHour = this.calculateEstimatedHour(baseHour, baseTs, now);
        const runningHours = Math.max(0, (now.getTime() - new Date(baseTs).getTime()) / (1000 * 60 * 60));
        const daysPassed = Math.floor(runningHours / 24);

        const remainingTotal = this.calculateRemainingHours(currentHour, ratedLife);
        const remainingDaysInfo = this.calculateRemainingDaysInfo(remainingTotal, ratedLife, warningLife);
        const status = this.calculateMachineStatus(currentHour, ratedLife, warningLife);
        const healthPercent = this.calculateHealthPercent(currentHour, ratedLife);
        const age = this.calculateMachineAge(currentHour);

        const daysSinceRecal = this.calculateDaysSinceRecalibration(machine.lastRecalibrationDate || baseTs, now);
        const accuracy = this.calculateAccuracy(daysSinceRecal);
        const recalRecommendation = this.calculateRecalibrationRecommendation(daysSinceRecal);
        const nextRecalDate = this.calculateNextRecalibrationDate(machine.lastRecalibrationDate || baseTs);
        const eolDate = this.calculateEstimatedEndOfLifeDate(currentHour, ratedLife, now);

        return {
            currentHour: Math.round(currentHour * 10) / 10,
            currentHourRaw: currentHour,
            runningHours: Math.round(runningHours * 10) / 10,
            daysPassed,
            remainingTotal: Math.round(remainingTotal * 10) / 10,
            remainingDaysInfo,
            status,
            healthPercent: Math.round(healthPercent * 10) / 10,
            daysSinceRecal,
            accuracy,
            recalRecommendation,
            nextRecalDate,
            eolDate,
            age,
            lastRecalibrationDate: machine.lastRecalibrationDate || baseTs
        };
    },

    /**
     * Perform Recalibration logic.
     * Updates Base Laser Hour, Base Timestamp, and Last Recalibration Date.
     * Stores record in Calibration History (latest 10 records).
     */
    executeRecalibration(machine, actualHour, reason, timestamp) {
        const recalTime = timestamp ? new Date(timestamp) : new Date();
        const recalISO = recalTime.toISOString();
        const currentEstimated = this.calculateEstimatedHour(machine.baseLaserHour, machine.baseTimestamp, recalTime);
        const diff = this.calculateDeviation(actualHour, currentEstimated);
        const ratingInfo = this.calculateDeviationRating(diff);

        const dateStr = recalTime.toISOString().split('T')[0];
        const timeStr = recalTime.toTimeString().split(' ')[0].substring(0, 5);

        const historyRecord = {
            date: dateStr,
            time: timeStr,
            estimatedHour: Math.round(currentEstimated * 10) / 10,
            actualHour: Number(actualHour),
            difference: Math.round(diff * 10) / 10,
            reason: reason || 'Manual Verification',
            rating: ratingInfo.rating
        };

        const existingHistory = Array.isArray(machine.calibrationHistory) ? machine.calibrationHistory : [];
        const newHistory = [historyRecord, ...existingHistory].slice(0, 10);

        const updatedMachine = {
            ...machine,
            baseLaserHour: Number(actualHour),
            baseTimestamp: recalISO,
            lastRecalibrationDate: recalISO,
            calibrationHistory: newHistory,
            lastUpdated: recalISO
        };

        return {
            updatedMachine,
            analysis: {
                estimatedHour: Math.round(currentEstimated * 10) / 10,
                actualHour: Number(actualHour),
                difference: Math.round(diff * 10) / 10,
                ratingInfo
            }
        };
    }
};

window.LaserEngine = LaserEngine;

