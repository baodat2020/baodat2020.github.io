/**
 * monitor.js - Administrator Dashboard Logic (Supabase Auth Edition)
 * Handles secure authentication via Supabase Auth and restricted data fetching.
 */

(async function() {
    console.log('Monitor System v3.3 - Debugging Injection');
    const authOverlay = document.getElementById('auth-overlay');
    const dashboard = document.getElementById('dashboard');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    let config = null;
    let supabase = null;

    async function initSupabase() {
        try {
            // Using global config from env-config.js
            config = window.ENV_CONFIG;
            if (!config || !config.supabaseUrl || !config.supabaseKey) {
                throw new Error('Cấu hình (ENV_CONFIG) bị thiếu hoặc không hợp lệ.');
            }
            
            // Initialize Supabase Client
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
            return true;
        } catch (err) {
            console.error('Lỗi khởi tạo:', err);
            authError.textContent = `Lỗi cấu hình: ${err.message}. Hãy đảm bảo bạn đã thiết lập GitHub Secrets.`;
            authError.classList.remove('hidden');
            return false;
        }
    }

    const isInitialized = await initSupabase();

    // --- Authentication ---
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isInitialized) {
            alert("Hệ thống chưa được cấu hình. Hãy kiểm tra GitHub Secrets và file config.json.");
            return;
        }
        
        const email = document.getElementById('monitor-email').value;
        const pass = document.getElementById('monitor-pass').value;
        const submitBtn = authForm.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="animate-spin mr-2">⏳</span> Đang xác thực...';

        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

        if (error) {
            authError.textContent = `Access Denied: ${error.message}`;
            authError.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Unlock Dashboard';
            setTimeout(() => authError.classList.add('hidden'), 5000);
        } else {
            unlockDashboard();
        }
    });

    function unlockDashboard() {
        authOverlay.classList.add('hidden');
        dashboard.classList.remove('hidden');
        setTimeout(() => dashboard.classList.add('opacity-100'), 50);
        initDashboard();
    }

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
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
            // RLS will ensure we only see logs if authenticated
            const { data, error } = await supabase
                .from('visit_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Fetch error:', err);
            authError.textContent = "Data access restricted. Check your RLS policies.";
            authError.classList.remove('hidden');
            return [];
        }
    }

    function renderStats(logs) {
        document.getElementById('stat-total').textContent = logs.length;
        
        const uniqueIps = new Set(logs.map(d => d.ip_address)).size;
        document.getElementById('stat-unique').textContent = uniqueIps;

        // Top Page
        const pages = logs.reduce((acc, curr) => {
            acc[curr.page_path] = (acc[curr.page_path] || 0) + 1;
            return acc;
        }, {});
        const topPage = Object.entries(pages).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';
        document.getElementById('stat-page').textContent = topPage;
    }

    function renderTable(logs) {
        const tbody = document.getElementById('visit-table-body');
        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="py-10 text-center text-slate-600 italic">No data found or access denied.</td></tr>';
            return;
        }

        tbody.innerHTML = logs.slice(0, 50).map(row => `
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

    function parseUA(uaString) {
        const ua = uaString.toLowerCase();
        if (ua.includes('windows')) return 'Windows';
        if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
        if (ua.includes('android')) return 'Android';
        if (ua.includes('macintosh')) return 'MacOS';
        if (ua.includes('linux')) return 'Linux';
        return 'Other';
    }

    function renderChart(logs) {
        // Clear existing chart if any
        const chartWrapper = document.getElementById('deviceChart').parentElement;
        const oldCanvas = document.getElementById('deviceChart');
        oldCanvas.remove();
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'deviceChart';
        newCanvas.height = 300;
        chartWrapper.appendChild(newCanvas);

        const devices = logs.reduce((acc, curr) => {
            const dev = parseUA(curr.user_agent);
            acc[dev] = (acc[dev] || 0) + 1;
            return acc;
        }, {});

        const ctx = newCanvas.getContext('2d');
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
                cutout: '70%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    refreshBtn.addEventListener('click', initDashboard);

    // Auto-login check
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                unlockDashboard();
            }
        });
    }

})();
