document.addEventListener('DOMContentLoaded', () => {
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
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
      } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        icon.textContent = 'menu';
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a link
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
