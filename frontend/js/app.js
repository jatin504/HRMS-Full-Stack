/* ═══════════════════════════════════════════════════════════════
   App Router & Shared Utilities
   ═══════════════════════════════════════════════════════════════ */

/* ── Shared helpers ──────────────────────────────────────────── */

/** HTML-escape a string */
function esc(str) {
    const el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
}

/** Format ISO date string to readable format */
function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Reusable empty state HTML */
function emptyState(title, message, icon) {
    return `
        <div class="empty-state">
            <div class="empty-icon">${icon || ''}</div>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

/** Reusable error state HTML */
function errorState(title, message) {
    return `
        <div class="error-state">
            <div class="error-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
            </div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="btn btn-secondary" onclick="location.reload()">Retry</button>
        </div>
    `;
}

/** Toast notification */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
}

/* ── Router ──────────────────────────────────────────────────── */

const pages = {
    dashboard: renderDashboard,
    employees: renderEmployees,
    attendance: renderAttendance,
};

function navigate() {
    const hash = (location.hash || '#dashboard').replace('#', '');
    const page = pages[hash] || pages.dashboard;
    const app = document.getElementById('app');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === hash);
    });

    // Render page
    page(app);

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
}

/** 
 * Verify backend connectivity on startup (handles cold starts)
 */
async function verifyBackendConnectivity() {
    const app = document.getElementById('app');
    const originalContent = app.innerHTML;

    // Show splash / waking up state
    app.innerHTML = `
        <div class="loading-container" style="height: calc(100vh - 100px);">
            <div class="spinner"></div>
            <h3>Waking up server…</h3>
            <p>We're starting the backend engines. This may take 30-60 seconds on free-tier hosting.</p>
        </div>
    `;

    let retries = 0;
    const maxRetries = 20; // ~1 minute total

    while (retries < maxRetries) {
        const isUp = await api.checkHealth();
        if (isUp) {
            navigate(); // Actually load the page
            return;
        }
        retries++;
        await new Promise(r => setTimeout(r, 3000)); // wait 3s between checks
    }

    app.innerHTML = errorState('Connection Timeout', 'The backend server is taking too long to respond. Please try refreshing the page.');
}

window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', verifyBackendConnectivity);

/* ── Mobile sidebar toggle ───────────────────────────────────── */
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
});

document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
});
