/* ============================================================
   blog.js — Blog listing and individual post rendering
   ============================================================ */

const tagLabels = { cp: 'CP', algo: 'Algorithm', life: 'Life' };

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Navbar hamburger
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    hamburger.addEventListener('keydown', e => { if (e.key === 'Enter') navLinks.classList.toggle('open'); });
}

// ── Back to Top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });
}

// ── Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
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
    return `
    <a href="post.html?slug=${post.slug}" class="glass-card blog-card reveal">
      <div class="blog-card-meta">
        <span class="blog-tag ${post.tag}">${tagLabels[post.tag] || post.tag}</span>
        <span class="blog-date">${formatDate(post.date)}</span>
      </div>
      <h2 class="blog-card-title">${post.title}</h2>
      <p class="blog-card-excerpt">${post.excerpt}</p>
      <div class="blog-card-footer">
        <span class="read-time"><i class="fa-regular fa-clock" style="margin-right:4px;"></i>${post.readTime}</span>
        <span class="read-more">Đọc tiếp <i class="fa-solid fa-arrow-right"></i></span>
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
                metaEl.innerHTML = `<span class="blog-tag ${meta.tag}">${tagLabels[meta.tag] || meta.tag}</span>`;
            }
            const titleEl = document.getElementById('post-title');
            if (titleEl) titleEl.textContent = meta.title;
            const infoEl = document.getElementById('post-info');
            if (infoEl) {
                infoEl.innerHTML = `
          <span><i class="fa-regular fa-calendar" style="margin-right:5px;"></i>${formatDate(meta.date)}</span>
          <span>·</span>
          <span><i class="fa-regular fa-clock" style="margin-right:5px;"></i>${meta.readTime}</span>
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

        // Wait for marked.js to be available
        const waitForMarked = () => new Promise((resolve) => {
            if (window.marked) resolve();
            else {
                const check = setInterval(() => {
                    if (window.marked) { clearInterval(check); resolve(); }
                }, 50);
            }
        });
        await waitForMarked();

        postBody.innerHTML = window.marked.parse(md);
    } catch (e) {
        postBody.innerHTML = '<p style="color:var(--text-muted);">Đã xảy ra lỗi khi tải bài viết.</p>';
        console.warn('Post load error:', e);
    }
}

// ── Init
document.addEventListener('DOMContentLoaded', () => {
    // Observe any static reveal elements
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Detect which page we're on
    if (document.getElementById('blog-all-grid')) {
        renderBlogAll();
    } else if (document.getElementById('post-body')) {
        renderPost();
    }
});
