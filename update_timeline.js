const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldTableStr = `<div class="table-wrap">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Engineer</th>
                                            <th>Action</th>
                                            <th>Notes / Findings</th>
                                            <th style="width: 80px;">Attach</th>
                                        </tr>
                                    </thead>
                                    <tbody id="maint-tbody">
                                        <!-- Populated dynamically -->
                                    </tbody>
                                </table>
                            </div>`;

const newTimelineStr = `<div id="maint-timeline" class="history-timeline">
                                <!-- Populated dynamically -->
                            </div>`;

html = html.replace(oldTableStr, newTimelineStr);
fs.writeFileSync('index.html', html);
console.log("Updated HTML for timeline");
