/* ═══════════════════════════════════════════════════════════════
   API Wrapper – all fetch calls go through here
   ═══════════════════════════════════════════════════════════════ */

const API_BASE = window.HRMS_CONFIG?.API_URL || '__API_URL_PLACEHOLDER__';

const api = {
    /**
     * Check backend health (useful for handling cold starts)
     */
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE}/health`);
            return res.ok;
        } catch (err) {
            return false;
        }
    },

    /**
     * Generic request helper.
     * Returns parsed JSON on success; throws { status, message } on error.
     */
    async request(method, path, body = null) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${API_BASE}${path}`, opts);

        if (!res.ok) {
            let message = 'Something went wrong';
            try {
                const err = await res.json();
                message = err.detail || JSON.stringify(err);
            } catch (_) { /* ignore parse error */ }
            throw { status: res.status, message };
        }

        return res.json();
    },

    // ── Employees ──────────────────────────────────────────────
    getEmployees() { return this.request('GET', '/employees'); },
    getEmployee(id) { return this.request('GET', `/employees/${id}`); },
    createEmployee(data) { return this.request('POST', '/employees', data); },
    deleteEmployee(id) { return this.request('DELETE', `/employees/${id}`); },

    // ── Attendance ─────────────────────────────────────────────
    markAttendance(data) { return this.request('POST', '/attendance', data); },
    getAttendance(empId, dateFilter = '') {
        const qs = dateFilter ? `?date=${dateFilter}` : '';
        return this.request('GET', `/attendance/${empId}${qs}`);
    },

    // ── Dashboard ──────────────────────────────────────────────
    getDashboard() { return this.request('GET', '/dashboard'); },
};
