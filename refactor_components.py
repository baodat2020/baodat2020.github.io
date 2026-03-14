import os
import glob
import re

os.makedirs('d:/projects/githuo-baodat/components', exist_ok=True)

header_content = """<!-- Header -->
<header class="sticky top-0 z-50 w-full border-b border-primary/10 bg-background-dark/80 backdrop-blur-md px-4 md:px-20 lg:px-40 py-3">
    <div class="mx-auto flex max-w-[1200px] items-center justify-between">
        <div class="flex items-center gap-8">
            <a href="{{root}}index.html" class="flex items-center gap-3 text-primary">
                <span class="material-symbols-outlined text-3xl">terminal</span>
                <h2 class="text-xl font-extrabold tracking-tight font-display">baodat</h2>
            </a>
            
            <nav class="hidden md:flex items-center gap-6">
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}index.html">Trang chủ</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}index.html#about">Về tôi</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}index.html#stats">Thành tích</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}index.html#projects">Dự án</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}blog.html">Blog</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}documents.html">Tài liệu</a>
                <a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium" href="{{root}}index.html#contact">Liên hệ</a>
            </nav>
        </div>
        <div class="flex items-center gap-4">
            <div class="hidden sm:flex items-center bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
                <span class="material-symbols-outlined text-primary text-sm mr-2">search</span>
                <input class="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-100 placeholder:text-slate-500 w-32 lg:w-48" placeholder="Tìm kiếm bài viết..."/>
            </div>
            <div class="flex gap-2">
                <a class="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all" href="https://github.com/baodat2020" target="_blank" rel="noopener">
                    <span class="material-symbols-outlined text-xl leading-none">code</span>
                </a>
                <a class="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all" href="https://codeforces.com/profile/baodat" target="_blank" rel="noopener">
                    <span class="material-symbols-outlined text-xl leading-none">public</span>
                </a>
                <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                    <span class="material-symbols-outlined text-xl leading-none" id="mobile-menu-icon" aria-label="Menu">menu</span>
                </button>
            </div>
        </div>
    </div>
</header>"""

menu_content = """<!-- Mobile Menu Overlay -->
<div id="mobile-menu" class="hidden md:hidden fixed inset-x-0 top-[73px] bottom-0 z-40 bg-background-dark/95 backdrop-blur-xl flex-col items-center justify-start pt-10 gap-6 overflow-y-auto pb-10">
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}index.html">Trang chủ</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}index.html#about">Về tôi</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}index.html#stats">Thành tích</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}index.html#projects">Dự án</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}blog.html">Blog</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}documents.html">Tài liệu</a>
    <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{{root}}index.html#contact">Liên hệ</a>
</div>"""

footer_content = """<!-- Footer -->
<footer id="contact" class="mt-auto border-t border-primary/10 bg-background-dark px-4 md:px-20 lg:px-40 py-12">
    <div class="mx-auto max-w-[1200px] flex flex-col items-center justify-between gap-6 md:flex-row">
        <div class="flex flex-col items-center md:items-start gap-4">
            <div class="flex items-center gap-2 text-primary">
                <span class="material-symbols-outlined">terminal</span>
                <span class="font-black text-xl tracking-tight font-display">baodat</span>
            </div>
            <p class="text-slate-500 text-sm">© 2026 Tôn Thất Bảo Đạt. Designed for competitive programmers.</p>
        </div>
        <div class="flex gap-6">
            <a class="text-slate-500 hover:text-primary transition-colors flex items-center gap-2" href="https://github.com/baodat2020" target="_blank" rel="noopener">
                <span class="material-symbols-outlined text-lg">description</span>
                <span class="text-xs font-semibold">GitHub</span>
            </a>
            <a class="text-slate-500 hover:text-primary transition-colors flex items-center gap-2" href="https://www.facebook.com/greyparrotvn" target="_blank" rel="noopener">
                <span class="material-symbols-outlined text-lg">social_leaderboard</span>
                <span class="text-xs font-semibold">Facebook</span>
            </a>
            <a class="text-slate-500 hover:text-primary transition-colors flex items-center gap-2" href="mailto:baodat2020@gmail.com">
                <span class="material-symbols-outlined text-lg">mail</span>
                <span class="text-xs font-semibold">Email</span>
            </a>
        </div>
    </div>
</footer>"""

layout_js = """document.addEventListener('DOMContentLoaded', async () => {
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

    // Highlight current nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('header nav a');
    navLinks.forEach(link => {
        // basic matching for active link
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (currentPath.endsWith(linkPath) || (currentPath.endsWith('/') && linkPath.endsWith('index.html'))) {
            link.classList.remove('text-slate-400');
            link.classList.add('text-primary');
        }
    });

    // Initialize mobile menu events
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');

    if (btn && menu && icon) {
        btn.addEventListener('click', () => {
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
        });

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
                icon.textContent = 'menu';
                document.body.style.overflow = '';
            });
        });
    }
});
"""

with open('d:/projects/githuo-baodat/components/header.html', 'w', encoding='utf-8') as f:
    f.write(header_content)
with open('d:/projects/githuo-baodat/components/mobile-menu.html', 'w', encoding='utf-8') as f:
    f.write(menu_content)
with open('d:/projects/githuo-baodat/components/footer.html', 'w', encoding='utf-8') as f:
    f.write(footer_content)
with open('d:/projects/githuo-baodat/js/layout.js', 'w', encoding='utf-8') as f:
    f.write(layout_js)

print("Components and layout.js created.")

html_files = glob.glob('d:/projects/githuo-baodat/**/*.html', recursive=True)

header_pat = re.compile(r'<header.*?</header>', re.DOTALL)
menu_pat = re.compile(r'<div\s+id="mobile-menu".*?</div>', re.DOTALL)
footer_pat = re.compile(r'<footer.*?</footer>', re.DOTALL)
mobile_script_pat = re.compile(r'<script\s+src="[^"]*js/mobileMenu.js"></script>')

for filepath in html_files:
    if 'components\\' in filepath or 'components/' in filepath:
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    rel_path = os.path.relpath(filepath, 'd:/projects/githuo-baodat').replace('\\', '/')
    depth = rel_path.count('/')
    root_prefix = '../' * depth

    orig_content = content
    content = header_pat.sub('<div id="layout-header"></div>', content, count=1)
    content = menu_pat.sub('<div id="layout-mobile-menu"></div>', content, count=1)
    content = footer_pat.sub('<div id="layout-footer"></div>', content, count=1)
    content = mobile_script_pat.sub('', content)

    if 'js/layout.js' not in content:
        layout_js_tag = f'<script src="{root_prefix}js/layout.js"></script>'
        # Try to insert layout.js right before </body>, or at the end if not found
        if '</body>' in content:
            content = content.replace('</body>', f'  {layout_js_tag}\n</body>', 1)
        else:
            content += f'\n{layout_js_tag}'

    if orig_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {rel_path}")

try:
    os.remove('d:/projects/githuo-baodat/js/mobileMenu.js')
except Exception:
    pass

print("Done patching all HTML files.")
