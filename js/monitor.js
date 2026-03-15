/**
 * monitor.js - Administrator Dashboard Logic
 * Handles authentication, fetching data from Supabase, and rendering stats.
 */

(async function() {
    const authOverlay = document.getElementById('auth-overlay');
    const dashboard = document.getElementById('dashboard');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    let config = null;

    async function loadConfig() {
        if (config) return config;
        const res = await fetch('config.json');
        config = await res.json();
        return config;
    }

    // --- Authentication ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = document.getElementById('monitor-pass').value;
        const cfg = await loadConfig();

        // Simple check: In reality, we'd use Supabase Auth, 
        // but for a quick personal monitor, we use a secret injected via config.json
        if (pass === cfg.monitorPassword || pass === 'admin123') { // admin123 is fallback for initial setup
            unlockDashboard();
        } else {
            authError.classList.remove('hidden');
            setTimeout(() => authError.classList.add('hidden'), 3000);
        }
    });

    function unlockDashboard() {
        authOverlay.classList.add('hidden');
        dashboard.classList.remove('hidden');
        setTimeout(() => dashboard.classList.add('opacity-100'), 50);
        initDashboard();
    }

    logoutBtn.addEventListener('click', () => {
        window.location.reload();
    });

    // --- Dashboard Logic ---
    async function initDashboard() {
        const data = await fetchLogs();
        renderStats(data);
        renderTable(data);
        renderChart(data);
    }

    async function fetchLogs() {
        try {
            const cfg = await loadConfig();
            const res = await fetch(`${cfg.supabaseUrl}/rest/v1/visit_logs?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': cfg.supabaseKey,
                    'Authorization': `Bearer ${cfg.supabaseKey}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch logs');
            return await res.json();
        } catch (err) {
            console.error('Fetch error:', err);
            return [];
        }
    }

    function renderStats(data) {
        document.getElementById('stat-total').textContent = data.length;
        
        const uniqueIps = new Set(data.map(d => d.ip_address)).size;
        document.getElementById('stat-unique').textContent = uniqueIps;

        // Top Page
        const pages = data.reduce((acc, curr) => {
            acc[curr.page_path] = (acc[curr.page_path] || 0) + 1;
            return acc;
        }, {});
        const topPage = Object.entries(pages).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
        document.getElementById('stat-page').textContent = topPage;
    }

    function renderTable(data) {
        const tbody = document.getElementById('visit-table-body');
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-10 text-center text-slate-600 italic">No data found.</td></tr>';
            return;
        }

        tbody.innerHTML = data.slice(0, 50).map(row => `
            <tr class="hover:bg-white/[0.02] transition-colors">
                <td class="py-4 pr-4 pl-0 text-xs text-slate-400 font-mono tracking-tighter">
                    ${new Date(row.created_at).toLocaleString('vi-VN', { 
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                    })}
                </td>
                <td class="py-4 px-4 text-sm font-bold text-primary/80 font-mono">${row.ip_address}</td>
                <td class="py-4 px-4 text-xs font-medium text-slate-300">
                    <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">${row.page_path}</span>
                </td>
                <td class="py-4 px-4 text-xs text-slate-500 truncate max-w-[150px]" title="${row.user_agent}">
                    ${parseUA(row.user_agent)}
                </td>
            </tr>
        `).join('');
    }

    function parseUA(ua) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('Macintosh')) return 'MacOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Unknown';
    }

    function renderChart(data) {
        const devices = data.reduce((acc, curr) => {
            const dev = parseUA(curr.user_agent);
            acc[dev] = (acc[dev] || 0) + 1;
            return acc;
        }, {});

        const ctx = document.getElementById('deviceChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(devices),
                datasets: [{
                    data: Object.values(devices),
                    backgroundColor: ['#0dccf2', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#64748b', font: { weight: 'bold', size: 10 }, padding: 20 }
                    }
                },
                cutout: '70%'
            }
        });
    }

    refreshBtn.addEventListener('click', initDashboard);

})();
