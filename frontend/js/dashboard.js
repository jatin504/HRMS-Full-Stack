/* ═══════════════════════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════════════════════ */

function renderDashboard(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Dashboard</h2>
            <p>Overview of your HR metrics at a glance</p>
        </div>
        <div id="dashboard-content">
            <div class="loading-container">
                <div class="spinner"></div>
                <p>Loading dashboard data…</p>
            </div>
        </div>
    `;
    loadDashboard();
}

async function loadDashboard() {
    const el = document.getElementById('dashboard-content');
    try {
        const data = await api.getDashboard();
        el.innerHTML = `
            <div class="stats-grid">
                ${statCard('purple', 'Total Employees', data.total_employees, iconUsers())}
                ${statCard('green', 'Present Today', data.present_today, iconCheck())}
                ${statCard('red', 'Absent Today', data.absent_today, iconX())}
            </div>
            <div class="card">
                <div class="section-title">
                    <h3>Employee Attendance Summary</h3>
                </div>
                ${data.employee_present_days.length === 0
                ? emptyState('No employees yet', 'Add employees to see their attendance summary here.', iconUsers())
                : `<div class="table-wrapper">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                    <th>Total Present Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.employee_present_days.map(e => `
                                    <tr>
                                        <td>${esc(e.employee_code)}</td>
                                        <td>${esc(e.full_name)}</td>
                                        <td><span class="badge badge-department">${esc(e.department)}</span></td>
                                        <td><strong>${e.total_present}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>`
            }
            </div>
        `;
    } catch (err) {
        el.innerHTML = errorState('Failed to load dashboard', err.message);
    }
}

/* Helpers */
function statCard(color, label, value, icon) {
    return `
        <div class="stat-card ${color}">
            <div class="stat-icon">${icon}</div>
            <div class="stat-value">${value}</div>
            <div class="stat-label">${label}</div>
        </div>
    `;
}

function iconUsers() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;
}

function iconCheck() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
}

function iconX() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
}
