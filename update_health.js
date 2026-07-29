const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const healthTabAddition = `
                            <div class="progress-track" style="height:14px; margin: 24px 0 10px 0;">
                                <div id="progressBar" class="progress-fill" style="width: 0%;"></div>
                            </div>
                            <div class="progress-scale">
                                <span>0 hrs</span>
                                <span id="scaleWarn">20,000 hrs (WARN)</span>
                                <span id="scaleAlarm">25,000 hrs (ALARM)</span>
                            </div>
                            <div id="recommendation" class="recommendation-banner" style="margin-bottom: 24px;">
                                Continue normal operation. Review during next preventive maintenance.
                            </div>
`;

html = html.replace('<div class="health-trend-card', healthTabAddition + '<div class="health-trend-card');
fs.writeFileSync('index.html', html);
console.log("Updated health tab");
