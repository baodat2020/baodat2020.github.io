import os
import glob
import re

html_files = glob.glob('d:/projects/githuo-baodat/**/*.html', recursive=True)

for filepath in html_files:
    # Normalize path separator
    filepath = filepath.replace('\\', '/')
    
    # Get depth for root prefix
    rel_path = os.path.relpath(filepath, 'd:/projects/githuo-baodat').replace('\\', '/')
    depth = rel_path.count('/')
    root_prefix = '../' * depth

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. Add hamburger button near Codeforces link
    if "id=\"mobile-menu-btn\"" not in content:
        # We find the CF link: <a ... href="https://codeforces.com/profile/baodat" ... > ... </a>
        pattern = re.compile(r'(<a[^>]*href="https://codeforces.com/profile/baodat"[^>]*>.*?</a>)', re.DOTALL)
        if pattern.search(content):
            btn_html = r'\1\n          <button id="mobile-menu-btn" class="md:hidden p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all">\n            <span class="material-symbols-outlined text-xl leading-none" id="mobile-menu-icon" aria-label="Menu">menu</span>\n          </button>'
            content = pattern.sub(btn_html, content, count=1)
            modified = True

    # 2. Add Overlay Menu just after </header>
    if "id=\"mobile-menu\"" not in content:
        overlay_html = f"""
    <!-- Mobile Menu Overlay -->
    <div id="mobile-menu" class="hidden md:hidden fixed inset-x-0 top-[73px] bottom-0 z-40 bg-background-dark/95 backdrop-blur-xl flex-col items-center justify-start pt-10 gap-6 overflow-y-auto pb-10">
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}index.html">Trang chủ</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}index.html#about">Về tôi</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}index.html#stats">Thành tích</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}index.html#projects">Dự án</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}blog.html">Blog</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}documents.html">Tài liệu</a>
      <a class="text-slate-300 hover:text-primary transition-colors text-lg font-medium tracking-wide" href="{root_prefix}index.html#contact">Liên hệ</a>
    </div>"""
        if "</header>" in content:
            content = content.replace("</header>", f"</header>\n{overlay_html}", 1)
            modified = True

    # 3. Add script to bottom
    if "mobileMenu.js" not in content:
        script_tag = f'\n  <script src="{root_prefix}js/mobileMenu.js"></script>\n</body>'
        if "</body>" in content:
            content = content.replace("</body>", script_tag, 1)
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {rel_path}")

print("Done.")
