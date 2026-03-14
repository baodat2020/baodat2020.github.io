/* ============================================================
   blog.js — Blog listing and individual post rendering
   ============================================================ */

const tagLabels = { cp: 'CP', algo: 'Algorithm', life: 'Life' };

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Back to Top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
            backToTop.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
        } else {
            backToTop.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
            backToTop.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        }
    });
}

// ── Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.remove('opacity-0', 'translate-y-8');
            entry.target.classList.add('opacity-100', 'translate-y-0');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

// ── Blog Listing Page
async function renderBlogAll() {
    const grid = document.getElementById('blog-all-grid');
    if (!grid) return;
    try {
        const res = await fetch('posts/index.json');
        const posts = await res.json();
        grid.innerHTML = posts.map(buildBlogCard).join('');
        // Trigger reveal for dynamically created cards
        grid.querySelectorAll('.reveal').forEach(el => {
            el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
            revealObserver.observe(el);
            // Slight stagger
            el.style.transitionDelay = `${Math.random() * 0.1}s`;
        });
    } catch (e) {
        grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Không thể tải bài viết.</p>';
        console.warn('Could not load posts:', e);
    }
}

function buildBlogCard(post) {
  const tag = tagLabels[post.tag] || post.tag;
  const imageSrc = post.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBgoOw05aHhyUPbWwErgZqov6E0Jj24fMZ9FSmlYgku1kDc3uV1l488zLRdIU1pSEsi9CCcZ0F60_2gpgPMM61kMXd1XX0Oi5sNSTnjflli8eJ3bLu1MpIQB7pbFk5yR3YDMRfhUNaF1NCh10ePGkLkKFot0zE2Ba8T2vorkZOEoWpfgnsQRcdQNHXjsG3xIO5OI-mDCeZU2BMfmMVoff4NBzXMF22Kvi8wD1Unuyym5df-2WRNXm9MPTy_EiWvb6_AmzpKB5ndaw";
  return `
    <a href=`posts/${post.slug}.html` class="flex flex-col rounded-xl border border-primary/10 bg-background-dark/50 hover:border-primary/30 transition-all overflow-hidden group reveal opacity-0 translate-y-8 duration-700 ease-out">
      <div class="h-40 overflow-hidden relative">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${imageSrc}" alt=""/>
        <div class="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-60"></div>
      </div>
      <div class="p-5 flex-1 flex flex-col">
        <div class="flex gap-2 mb-3">
          <span class="text-[10px] font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20 uppercase">${tag}</span>
        </div>
        <h5 class="text-slate-100 font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">${post.title}</h5>
        <p class="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">${post.excerpt}</p>
        <div class="flex items-center justify-between text-[11px] text-slate-500 border-t border-primary/10 pt-4">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">calendar_today</span>
            ${formatDate(post.date)}
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">schedule</span>
            ${post.readTime}
          </span>
        </div>
      </div>
    </a>`;
}

// ── Individual Post Page
async function renderPost() {
    const postBody = document.getElementById('post-body');
    if (!postBody) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        postBody.innerHTML = '<p style="color:var(--text-muted);">Bài viết không tìm thấy.</p>';
        return;
    }

    try {
        // Load index for metadata
        const indexRes = await fetch('posts/index.json');
        const posts = await indexRes.json();
        const meta = posts.find(p => p.slug === slug);

        if (meta) {
            document.title = `${meta.title} — baodat.dev`;
            const metaEl = document.getElementById('post-meta');
            if (metaEl) {
                metaEl.innerHTML = `<span class="rounded bg-primary/10 border border-primary/20 px-2 py-0.5">${tagLabels[meta.tag] || meta.tag}</span>`;
            }
            const titleEl = document.getElementById('post-title');
            if (titleEl) titleEl.textContent = meta.title;
            const infoEl = document.getElementById('post-info');
            if (infoEl) {
                infoEl.innerHTML = `
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">calendar_today</span> ${formatDate(meta.date)}</span>
          <span>·</span>
          <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">schedule</span> ${meta.readTime}</span>
          <span>·</span>
          <span>Tôn Thất Bảo Đạt</span>`;
            }
        }

        // Load and render markdown
        const mdRes = await fetch(`posts/${slug}.md`);
        if (!mdRes.ok) {
            postBody.innerHTML = '<p style="color:var(--text-muted);">Không thể tải nội dung bài viết.</p>';
            return;
        }
        const md = await mdRes.text();

        // Wait for marked.js and MathJax to be available
        const waitForLib = () => new Promise((resolve) => {
            if (window.marked && window.MathJax) resolve();
            else {
                const check = setInterval(() => {
                    if (window.marked && window.MathJax) { clearInterval(check); resolve(); }
                }, 50);
            }
        });
        await waitForLib();

        // Strip YAML frontmatter before parsing
        const cleanedMd = md.replace(/^---\n[\s\S]*?\n---\n/, '');
        postBody.innerHTML = window.marked.parse(cleanedMd);

        // Typeset MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
             window.MathJax.typesetPromise([postBody]).catch(e => console.error('MathJax error', e));
        }
    } catch (e) {
        postBody.innerHTML = '<p style="color:var(--text-muted);">Đã xảy ra lỗi khi tải bài viết.</p>';
        console.warn('Post load error:', e);
    }
}

// ── Init
document.addEventListener('DOMContentLoaded', () => {
    // Observe any static reveal elements
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
        revealObserver.observe(el);
    });

    // Detect which page we're on
    if (document.getElementById('blog-all-grid')) {
        renderBlogAll();
    } else if (document.getElementById('post-body')) {
        renderPost();
    }
});
