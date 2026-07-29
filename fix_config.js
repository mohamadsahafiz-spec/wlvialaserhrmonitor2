const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const advancedConfig = `
                                <details class="advanced-settings-details" style="margin-top: 16px; margin-bottom: 8px;">
                                    <summary style="cursor:pointer; color:var(--muted); font-size:13px; font-weight:600; padding:8px 0; outline:none; user-select:none;">
                                        Advanced Hardware Settings (Collapse)
                                    </summary>
                                    <div class="machine-info-grid" style="margin-top:12px; padding: 16px; background:rgba(0,0,0,0.2); border-radius:12px; border:1px solid var(--glass-border);">
                                        <div class="form-group">
                                            <label>Rated Life Limit (hrs)</label>
                                            <input type="number" id="det-rated" class="input-control" value="25000">
                                        </div>
                                        <div class="form-group">
                                            <label>Baseline Laser Hour (hrs)</label>
                                            <input type="number" id="prevHour" class="input-control" value="12500">
                                        </div>
                                        <div class="form-group">
                                            <label>Baseline Timestamp</label>
                                            <input type="datetime-local" id="prevDate" class="input-control">
                                        </div>
                                    </div>
                                </details>
                            </div>
`;

html = html.replace(/<div class="form-group">\s*<label>Rated Life Limit[\s\S]*?<\/div>\s*<\/div>/, advancedConfig);

fs.writeFileSync('index.html', html);
console.log("Updated config tab");
