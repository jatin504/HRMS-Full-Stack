/* ═══════════════════════════════════════════════════════════════
   Employees Page
   ═══════════════════════════════════════════════════════════════ */

function renderEmployees(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Employees</h2>
            <p>Manage your organisation's employee directory</p>
        </div>

        <!-- Add Employee Form -->
        <div class="card form-card">
            <div class="section-title"><h3>Add New Employee</h3></div>
            <form id="add-employee-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="emp-id">Employee ID</label>
                        <input type="text" id="emp-id" placeholder="e.g. EMP001" required />
                    </div>
                    <div class="form-group">
                        <label for="emp-name">Full Name</label>
                        <input type="text" id="emp-name" placeholder="e.g. John Doe" required />
                    </div>
                    <div class="form-group">
                        <label for="emp-email">Email Address</label>
                        <input type="email" id="emp-email" placeholder="e.g. john@company.com" required />
                    </div>
                    <div class="form-group">
                        <label for="emp-dept">Department</label>
                        <select id="emp-dept" required>
                            <option value="">Select department</option>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Design">Design</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Sales">Sales</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                            <option value="Support">Support</option>
                        </select>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary" id="btn-add-emp">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add Employee
                    </button>
                </div>
            </form>
        </div>

        <!-- Employee List -->
        <div class="card">
            <div class="section-title"><h3>Employee Directory</h3></div>
            <div id="employee-list">
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Loading employees…</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-employee-form').addEventListener('submit', handleAddEmployee);
    loadEmployees();
}

async function loadEmployees() {
    const el = document.getElementById('employee-list');
    try {
        const employees = await api.getEmployees();
        if (employees.length === 0) {
            el.innerHTML = emptyState(
                'No employees found',
                'Use the form above to add your first employee.',
                iconUsers()
            );
            return;
        }
        el.innerHTML = `
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Employee ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${employees.map(e => `
                            <tr id="emp-row-${e.id}">
                                <td><strong>${esc(e.employee_id)}</strong></td>
                                <td>${esc(e.full_name)}</td>
                                <td>${esc(e.email)}</td>
                                <td><span class="badge badge-department">${esc(e.department)}</span></td>
                                <td class="text-muted">${formatDate(e.created_at)}</td>
                                <td>
                                    <button class="btn-icon" title="Delete" onclick="confirmDeleteEmployee(${e.id}, '${esc(e.full_name)}')">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        el.innerHTML = errorState('Failed to load employees', err.message);
    }
}

async function handleAddEmployee(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-add-emp');
    btn.disabled = true;
    btn.textContent = 'Adding…';

    try {
        await api.createEmployee({
            employee_id: document.getElementById('emp-id').value.trim(),
            full_name: document.getElementById('emp-name').value.trim(),
            email: document.getElementById('emp-email').value.trim(),
            department: document.getElementById('emp-dept').value,
        });
        showToast('Employee added successfully!', 'success');
        e.target.reset();
        loadEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Employee`;
    }
}

/* Delete flow (uses the shared modal from index.html) */
let pendingDeleteId = null;

function confirmDeleteEmployee(id, name) {
    pendingDeleteId = id;
    document.getElementById('delete-modal-text').textContent =
        `Are you sure you want to delete "${name}"? All their attendance records will also be removed.`;
    document.getElementById('delete-modal').classList.add('active');
}

document.getElementById('delete-cancel').addEventListener('click', () => {
    document.getElementById('delete-modal').classList.remove('active');
    pendingDeleteId = null;
});

document.getElementById('delete-confirm').addEventListener('click', async () => {
    if (pendingDeleteId === null) return;
    const modal = document.getElementById('delete-modal');
    const btn = document.getElementById('delete-confirm');
    btn.disabled = true;
    btn.textContent = 'Deleting…';
    try {
        await api.deleteEmployee(pendingDeleteId);
        showToast('Employee deleted successfully.', 'success');
        loadEmployees();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Delete';
        modal.classList.remove('active');
        pendingDeleteId = null;
    }
});
