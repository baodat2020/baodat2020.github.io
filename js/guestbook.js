/**
 * guestbook.js - Guestbook / Comments System
 * Manages fetching and posting messages to Supabase
 */

(async function() {
    const container = document.getElementById('guestbook-container');
    if (!container) return;

    let config = null;

    async function loadConfig() {
        if (config) return config;
        const res = await fetch('/config.json');
        config = await res.json();
        return config;
    }

    async function fetchEntries() {
        try {
            const { supabaseUrl, supabaseKey } = await loadConfig();
            const res = await fetch(`${supabaseUrl}/rest/v1/guestbook?select=*&order=created_at.desc`, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch entries');
            return await res.json();
        } catch (err) {
            console.error('Guestbook fetch error:', err);
            return [];
        }
    }

    async function postEntry(name, message) {
        try {
            const { supabaseUrl, supabaseKey } = await loadConfig();
            const res = await fetch(`${supabaseUrl}/rest/v1/guestbook`, {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ name, message })
            });
            if (!res.ok) throw new Error('Failed to post entry');
            return true;
        } catch (err) {
            console.error('Guestbook post error:', err);
            alert('Gửi tin nhắn thất bại. Vui lòng thử lại sau.');
            return false;
        }
    }

    function renderEntries(entries) {
        const list = document.getElementById('guestbook-list');
        if (!list) return;

        if (entries.length === 0) {
            list.innerHTML = '<p class="text-slate-500 italic text-center py-8">Chưa có lời nhắn nào. Hãy là người đầu tiên!</p>';
            return;
        }

        list.innerHTML = entries.map(entry => `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 mb-4 reveal">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-primary">${escapeHtml(entry.name)}</span>
                    <span class="text-[10px] text-slate-500 uppercase tracking-widest">${new Date(entry.created_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(entry.message)}</p>
            </div>
        `).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial load
    const entries = await fetchEntries();
    renderEntries(entries);

    // Form Handling
    const form = document.getElementById('guestbook-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('gb-name');
            const msgInput = document.getElementById('gb-message');
            const submitBtn = form.querySelector('button[type="submit"]');

            if (!nameInput.value || !msgInput.value) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Đang gửi...';

            const success = await postEntry(nameInput.value, msgInput.value);
            
            if (success) {
                nameInput.value = '';
                msgInput.value = '';
                const updatedEntries = await fetchEntries();
                renderEntries(updatedEntries);
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Gửi lời nhắn <span class="material-symbols-outlined text-sm">send</span>';
        });
    }
})();
