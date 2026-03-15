/**
 * tracker.js - Visitor Monitoring System
 * Logs IP, User Agent, and Page Path to Supabase
 */

(async function() {
    try {
        // 1. Fetch Config
        const configRes = await fetch('/config.json');
        if (!configRes.ok) return;
        const config = await configRes.json();

        // 2. Get IP (Optional but requested)
        let ip = 'Unknown';
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            ip = ipData.ip;
        } catch (e) {
            console.warn('Could not fetch IP');
        }

        // 3. Prepare Data
        const logData = {
            ip_address: ip,
            user_agent: navigator.userAgent,
            page_path: window.location.pathname,
            referrer: document.referrer || 'Direct',
            screen_resolution: `${window.screen.width}x${window.screen.height}`
        };

        // 4. Send to Supabase via REST API (to avoid loading full SDK if not needed)
        // Note: Using REST API directly to keep it lightweight
        await fetch(`${config.supabaseUrl}/rest/v1/visit_logs`, {
            method: 'POST',
            headers: {
                'apikey': config.supabaseKey,
                'Authorization': `Bearer ${config.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(logData)
        });

    } catch (err) {
        // Fail silently to not disturb user experience
        console.error('Tracking failed:', err);
    }
})();
