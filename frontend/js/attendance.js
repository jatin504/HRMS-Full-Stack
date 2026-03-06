/* ═══════════════════════════════════════════════════════════════
   Attendance Page
   ═══════════════════════════════════════════════════════════════ */

function renderAttendance(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Attendance</h2>
            <p>Mark and view daily attendance records</p>
        </div>

        <!-- Mark Attendance Form -->
        <div class="card form-card">
            <div class="section-title"><h3>Mark Attendance</h3></div>
            <form id="mark-attendance-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="att-employee">Employee</label>
                        <select id="att-employee" required>
                            <option value="">Loading employees…</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="att-date">Date</label>
                        <input type="date" id="att-date" required />
                    </div>
                    <div class="form-group">
                        <label for="att-status">Status</label>
                        <select id="att-status" required>
                            <option value="">Select status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" id="btn-mark-att">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Mark Attendance
                    </button>
                </div>
            </form>
        </div>

        <!-- View Attendance Records -->
        <div class="card">
            <div class="section-title"><h3>Attendance Records</h3></div>
            <div class="filter-bar">
                <div class="form-group">
                    <label for="filter-employee">Employee</label>
                    <select id="filter-employee">
                        <option value="">Select employee</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="filter-date">Filter by Date</label>
                    <input type="date" id="filter-date" />
                </div>
                <button class="btn btn-secondary" id="btn-filter" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    View Records
                </button>
                <button class="btn btn-secondary btn-sm" id="btn-clear-filter" style="display:none;">Clear</button>
            </div>
            <div id="attendance-records">
                ${emptyState('Select an employee', 'Choose an employee from the dropdown above to view their attendance records.', iconCalendar())}
            </div>
        </div>
    `;

    // Set default date to today
    document.getElementById('att-date').valueAsDate = new Date();

    // Load employees into both dropdowns
    loadAttendanceEmployees();

    // Form submission
    document.getElementById('mark-attendance-form').addEventListener('submit', handleMarkAttendance);

    // Filter controls – auto-load records when employee changes and auto-refresh on date change
    document.getElementById('filter-employee').addEventListener('change', () => {
        const hasEmployee = !!document.getElementById('filter-employee').value;
        document.getElementById('btn-filter').disabled = !hasEmployee;
        if (hasEmployee) handleFilterAttendance();
    });
    document.getElementById('filter-date').addEventListener('change', () => {
        if (document.getElementById('filter-employee').value) {
            handleFilterAttendance();
        }
    });
    document.getElementById('btn-filter').addEventListener('click', handleFilterAttendance);
    document.getElementById('btn-clear-filter').addEventListener('click', () => {
        document.getElementById('filter-employee').value = '';
        document.getElementById('filter-date').value = '';
        document.getElementById('btn-filter').disabled = true;
        document.getElementById('btn-clear-filter').style.display = 'none';
        document.getElementById('attendance-records').innerHTML =
            emptyState('Select an employee', 'Choose an employee from the dropdown above to view their attendance records.', iconCalendar());
    });
}

async function loadAttendanceEmployees() {
    try {
        const employees = await api.getEmployees();
        const opts = employees.map(e =>
            `<option value="${e.id}">${esc(e.employee_id)} – ${esc(e.full_name)}</option>`
        ).join('');

        const markSelect = document.getElementById('att-employee');
        markSelect.innerHTML = `<option value="">Select employee</option>${opts}`;

        const filterSelect = document.getElementById('filter-employee');
        filterSelect.innerHTML = `<option value="">Select employee</option>${opts}`;
    } catch (err) {
        showToast('Failed to load employees: ' + err.message, 'error');
    }
}

async function handleMarkAttendance(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-mark-att');
    btn.disabled = true;
    btn.textContent = 'Marking…';

    try {
        await api.markAttendance({
            employee_id: parseInt(document.getElementById('att-employee').value),
            date: document.getElementById('att-date').value,
            status: document.getElementById('att-status').value,
        });
        showToast('Attendance marked successfully!', 'success');
        document.getElementById('att-employee').value = '';
        document.getElementById('att-status').value = '';

        // If the filter is active for this employee, refresh
        const filterEmp = document.getElementById('filter-employee').value;
        if (filterEmp) handleFilterAttendance();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Mark Attendance`;
    }
}

async function handleFilterAttendance() {
    const empId = document.getElementById('filter-employee').value;
    const dateVal = document.getElementById('filter-date').value;
    const el = document.getElementById('attendance-records');

    if (!empId) return;

    document.getElementById('btn-clear-filter').style.display = 'inline-flex';
    el.innerHTML = `<div class="loading-container"><div class="spinner"></div><p>Loading records…</p></div>`;

    try {
        const records = await api.getAttendance(empId, dateVal);
        if (records.length === 0) {
            el.innerHTML = emptyState(
                'No records found',
                dateVal ? `No attendance records for this employee on ${dateVal}.` : 'No attendance records found for this employee.',
                iconCalendar()
            );
            return;
        }
        el.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Employee ID</th>
                            <th>Employee Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(r => `
                            <tr>
                                <td>${r.date}</td>
                                <td>${esc(r.employee_code || '')}</td>
                                <td>${esc(r.employee_name || '')}</td>
                                <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        el.innerHTML = errorState('Failed to load attendance', err.message);
    }
}

function iconCalendar() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
}
