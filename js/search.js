/**
 * search.js — Client-side search for baodat portfolio
 * Filters results from posts/index.json
 */

(function() {
    let allPosts = [];
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');

    async function initSearch() {
        if (!searchInput) return;

        try {
            // Determine search data path based on current depth
            const pathPrefix = window.location.pathname.includes('/posts/') ? '../' : '';
            const response = await fetch(`${pathPrefix}posts/index.json`);
            allPosts = await response.json();

            searchInput.addEventListener('input', handleSearch);
            
            // Hide search when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                    searchResults.classList.add('hidden');
                }
            });

            // Show search when focusing if there's input
            searchInput.addEventListener('focus', () => {
                if (searchInput.value.trim().length > 0) {
                    searchResults.classList.remove('hidden');
                }
            });

        } catch (error) {
            console.error('Failed to initialize search:', error);
        }
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        const filtered = allPosts.filter(post => 
            post.title.toLowerCase().includes(query) || 
            post.excerpt.toLowerCase().includes(query) ||
            post.tag.toLowerCase().includes(query)
        ).slice(0, 5); // Limit to 5 results

        renderResults(filtered);
        searchResults.classList.remove('hidden');
    }

    function renderResults(results) {
        if (results.length === 0) {
            searchResultsList.innerHTML = `
                <div class="p-4 text-center text-slate-500 text-sm italic">
                    Không tìm thấy bài viết nào...
                </div>
            `;
            return;
        }

        const pathPrefix = window.location.pathname.includes('/posts/') ? '' : 'posts/';
        const rootPrefix = window.location.pathname.includes('/posts/') ? '../' : '';

        searchResultsList.innerHTML = results.map(post => `
            <a href="${rootPrefix}${pathPrefix}${post.slug}.html" class="block p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-none">
                <div class="flex items-center gap-3">
                    <img src="${rootPrefix}${post.image}" class="w-10 h-10 rounded object-cover border border-primary/20" onerror="this.src='${rootPrefix}assets/vibe-coding.png'"/>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-sm font-bold text-slate-100 truncate">${post.title}</h4>
                        <p class="text-[10px] text-slate-500 truncate">${post.excerpt}</p>
                    </div>
                    <span class="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded uppercase">${post.tag}</span>
                </div>
            </a>
        `).join('');
    }

    // Initialize if script is loaded after DOM/Header
    if (document.getElementById('search-input')) {
        initSearch();
    } else {
        // Fallback for dynamic loading
        document.addEventListener('componentsLoaded', initSearch);
    }
})();
