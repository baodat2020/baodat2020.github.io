document.addEventListener('DOMContentLoaded', async () => {
    // Determine path depth to root
    let rootPath = '';
    const scriptTag = document.querySelector('script[src$="layout.js"]');
    if (scriptTag) {
        const src = scriptTag.getAttribute('src');
        rootPath = src.substring(0, src.indexOf('js/layout.js'));
    }

    async function loadComponent(id, file) {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const response = await fetch(rootPath + 'components/' + file);
            if (!response.ok) throw new Error('Network error');
            let html = await response.text();
            
            // Replace {{root}} placeholders
            html = html.replace(/{{root}}/g, rootPath);
            
            el.innerHTML = html;
        } catch (e) {
            console.error('Failed to load component:', file, e);
        }
    }

    await Promise.all([
        loadComponent('layout-header', 'header.html'),
        loadComponent('layout-mobile-menu', 'mobile-menu.html'),
        loadComponent('layout-footer', 'footer.html')
    ]);

    // Handle fixed header height compensation
    const headerEl = document.querySelector('#layout-header header');
    if (headerEl) {
        document.getElementById('layout-header').style.height = headerEl.offsetHeight + 'px';
    }

    // Load search functionality
    const searchScript = document.createElement('script');
    searchScript.src = `${rootPath}js/search.js`;
    document.body.appendChild(searchScript);

    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('componentsLoaded'));

    // Highlight current nav item
    const currentUrl = new URL(window.location.href);
    const currentPath = currentUrl.pathname.replace(/\/index\.html$/, '/') || '/';
    
    // Select both desktop and mobile links
    const navLinks = document.querySelectorAll('header nav a, #mobile-menu a');
    
    navLinks.forEach(link => {
        try {
            const linkUrl = new URL(link.href, window.location.origin);
            const linkPath = linkUrl.pathname.replace(/\/index\.html$/, '/') || '/';
            
            // Check if paths match exactly (handling index.html vs /)
            const isPathMatch = (currentPath === linkPath);
            
            // For anchor links on the same page
            const isAnchorMatch = (currentPath === linkPath && currentUrl.hash === linkUrl.hash);

            if (isPathMatch) {
                link.classList.remove('text-slate-400', 'text-slate-300');
                link.classList.add('text-primary', 'font-bold');
            }
        } catch (err) {
            // Ignore invalid URLs
        }
    });

    // Initialize mobile menu events using event delegation
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('#mobile-menu-btn');
        if (btn) {
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('mobile-menu-icon');
            if (menu && icon) {
                const isHidden = menu.classList.contains('hidden');
                if (isHidden) {
                    menu.classList.remove('hidden');
                    menu.classList.add('flex');
                    icon.textContent = 'close';
                    document.body.style.overflow = 'hidden';
                } else {
                    menu.classList.add('hidden');
                    menu.classList.remove('flex');
                    icon.textContent = 'menu';
                    document.body.style.overflow = '';
                }
            }
            return;
        }

        const menu = document.getElementById('mobile-menu');
        if (menu && !menu.classList.contains('hidden')) {
            const link = e.target.closest('a');
            if (link && menu.contains(link)) {
                const icon = document.getElementById('mobile-menu-icon');
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                if (icon) icon.textContent = 'menu';
                document.body.style.overflow = '';
            }
        }
    });
});
