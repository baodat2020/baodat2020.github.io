
/* ============================================================
   main.js — Portfolio JS for baodat.dev
   Handles: CP API fetching, Rating chart, Scroll effects
   ============================================================ */

const CF_HANDLE = 'baodat';
const AC_HANDLE = 'baodat';

// ── Codeforces rank color map
const CF_RANK_COLORS = {
  'newbie': '#a8a8a8',
  'pupil': '#00ff00',
  'specialist': '#03a89e',
  'expert': '#aaaaff',
  'candidate master': '#ff88ff',
  'master': '#ffcc88',
  'international master': '#ffbb55',
  'grandmaster': '#ff7777',
  'international grandmaster': '#ff3333',
  'legendary grandmaster': '#aa0000',
};

function getAtCoderRankColor(rating) {
    if (rating < 400) return { rank: 'Grey', color: '#808080' };
    if (rating < 800) return { rank: 'Brown', color: '#804000' };
    if (rating < 1200) return { rank: 'Green', color: '#008000' };
    if (rating < 1600) return { rank: 'Cyan', color: '#00C0C0' };
    if (rating < 2000) return { rank: 'Blue', color: '#0000FF' };
    if (rating < 2400) return { rank: 'Yellow', color: '#C0C000' };
    if (rating < 2800) return { rank: 'Orange', color: '#FF8000' };
    return { rank: 'Red', color: '#FF0000' };
}

function hexToRgba(hex, alpha) {
    if(!hex) return `rgba(13,204,242,${alpha})`;
    let c = hex.substring(1).split('');
    if(c.length == 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    c = '0x' + c.join('');
    return `rgba(${(c>>16)&255}, ${(c>>8)&255}, ${c&255}, ${alpha})`;
}

// ── Back to Top
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
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
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  el.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
  revealObserver.observe(el);
});

// ── Helpers
function setText(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = val;
  el.classList.remove('loading');
}

function setError(id, msg = 'N/A') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('loading');
  el.style.color = 'var(--text-muted)';
}

// ── Codeforces — User Info
let cfRatingHistory = [];

async function fetchCF() {
  try {
    const [infoRes, ratingRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.info?handles=${CF_HANDLE}`),
      fetch(`https://codeforces.com/api/user.rating?handle=${CF_HANDLE}`)
    ]);

    if (infoRes.ok) {
      const data = await infoRes.json();
      if (data.status === 'OK' && data.result.length > 0) {
        const user = data.result[0];
        const rating = user.rating ?? '—';
        const maxRating = user.maxRating ?? '—';
        const rank = user.rank ?? '—';

        setText('cf-rating', rating.toString());
        setText('cf-max-rating', maxRating.toString());

        const rankEl = document.getElementById('cf-rank');
        if (rankEl) {
          rankEl.textContent = rank;
          const rankKey = rank.toLowerCase();
          const hexColor = CF_RANK_COLORS[rankKey] || '#0dccf2';
          rankEl.style.color = hexColor;
          rankEl.style.backgroundColor = hexToRgba(hexColor, 0.1);
          rankEl.style.borderColor = hexToRgba(hexColor, 0.2);
          // Remove default hardcoded tailwind classes that conflict
          rankEl.className = rankEl.className.replace(/text-\w+-\d+/g, '').replace(/bg-\w+-\d+\/\d+/g, '').replace(/border-\w+-\d+\/\d+/g, '');
        }

        // Update Progress bar (max 3500 roughly for 100%)
        const ratingPct = Math.min(100, Math.max(0, (rating / 3500) * 100));
        const color = CF_RANK_COLORS[rank.toLowerCase()] || '#0dccf2';
        const cfCard = document.getElementById('cf-card') || document.querySelector('.group:has(#cf-rating)');
        if (cfCard) {
            const bar = cfCard.querySelector('.h-full.bg-orange-500');
            if (bar) {
                bar.style.width = `${ratingPct}%`;
                bar.style.backgroundColor = color;
                bar.style.boxShadow = `0 0 10px ${hexToRgba(color, 0.5)}`;
                bar.className = bar.className.replace('bg-orange-500', ''); // clear original hardcode
            }
        }
      } else {
        ['cf-rating', 'cf-max-rating', 'cf-rank'].forEach(id => setError(id));
      }
    }

    if (ratingRes.ok) {
      const rData = await ratingRes.json();
      if (rData.status === 'OK') {
        cfRatingHistory = rData.result;
        setText('cf-contests', cfRatingHistory.length.toString());
        renderCFChart(cfRatingHistory);
      } else {
        setError('cf-contests');
      }
    }
  } catch (err) {
    ['cf-rating', 'cf-max-rating', 'cf-rank', 'cf-contests'].forEach(id => setError(id, 'Err'));
    console.warn('CF API error:', err);
  }
}

// ── AtCoder — via kenkoooo.com & CORS Proxy for official stats
async function fetchAC() {
  try {
    const headers = { 'Accept': 'application/json' };
    
    // Instead of failing due to direct fetch CORS/Cloudflare, use allOrigins proxy
    // to fetch the user history directly from AtCoder
    const historyRes = await fetch(`https://api.codetabs.com/v1/proxy/?quest=https://atcoder.jp/users/${AC_HANDLE}/history/json`);
    
    if (historyRes.ok) {
      const history = await historyRes.json();
      if (Array.isArray(history) && history.length > 0) {
        setText('ac-contests', history.length.toString());
        const latest = history[history.length - 1].NewRating || 0;
        
        // Find max rating
        let maxRating = 0;
        for (const contest of history) {
            maxRating = Math.max(maxRating, contest.NewRating);
        }
        
        setText('ac-rating', latest.toLocaleString());
        
        // Update Max Rating
        const acCard = document.getElementById('ac-card') || document.querySelector('.group:has(#ac-rating)');
        if (acCard) {
            const spans = acCard.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('max.')) {
                    span.innerHTML = `max. ${maxRating}`;
                }
            });
            
            // Update Rank Badge
            let rankBadge = acCard.querySelector('.px-3.py-1.rounded-full');
            const rankData = getAtCoderRankColor(latest);
            if (rankBadge) {
                rankBadge.textContent = rankData.rank;
                rankBadge.style.color = rankData.color;
                rankBadge.style.backgroundColor = hexToRgba(rankData.color, 0.1);
                rankBadge.style.borderColor = hexToRgba(rankData.color, 0.2);
                rankBadge.className = rankBadge.className.replace(/text-\w+-\d+/g, '').replace(/bg-\w+-\d+\/\d+/g, '').replace(/border-\w+-\d+\/\d+/g, '');
            }

            // Update Progress bar (max 3200 roughly for 100%)
            const ratingPct = Math.min(100, Math.max(0, (latest / 3200) * 100));
            const bar = acCard.querySelector('.h-full.bg-blue-500');
            if (bar) {
                bar.style.width = `${ratingPct}%`;
                bar.style.backgroundColor = rankData.color;
                bar.style.boxShadow = `0 0 10px ${hexToRgba(rankData.color, 0.5)}`;
                bar.className = bar.className.replace('bg-blue-500', ''); // clear original
            }
        }
      } else {
        setText('ac-contests', '0');
        setText('ac-rating', '0');
      }
    } else {
      throw new Error("AtCoder history unreachable");
    }

    // Try Kenkoooo API for streak and AC count
    // Note: If Kenkoooo API fails, we just show N/A instead of hardcoding
    Promise.all([
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${AC_HANDLE}`, { headers }),
      fetch(`https://kenkoooo.com/atcoder/atcoder-api/v3/user/streak_rank?user=${AC_HANDLE}`, { headers })
    ]).then(async ([acRankRes, streakRes]) => {
      if (acRankRes.ok) {
        const d = await acRankRes.json();
        setText('ac-ac-count', d.count ? d.count.toLocaleString() : 'N/A');
      } else {
        setError('ac-ac-count', 'N/A');
      }
      
      if (streakRes.ok) {
        const d = await streakRes.json();
        setText('ac-streak', d.streak ? `${d.streak} ngày` : 'N/A');
      } else {
        setError('ac-streak', 'N/A');
      }
    }).catch(e => {
      setError('ac-ac-count', 'N/A');
      setError('ac-streak', 'N/A');
    });

  } catch (err) {
    console.warn('AtCoder API returned Error. No fallback used:', err);
    setError('ac-ac-count', 'Error');
    setError('ac-rating', 'Error');
    setError('ac-contests', 'Error');
    setError('ac-streak', 'Error');
  }
}

// ── Chart
let ratingChart = null;

function getRatingZoneColor(rating) {
  if (rating >= 2400) return '#ff0000';
  if (rating >= 2100) return '#ff8c00';
  if (rating >= 1900) return '#aa00aa';
  if (rating >= 1600) return '#0000ff';
  if (rating >= 1400) return '#03a89e';
  if (rating >= 1200) return '#008000';
  return '#808080';
}

function renderCFChart(history) {
  const canvas = document.getElementById('ratingChart');
  if (!canvas) return;

  const labels = history.map(r => {
    const d = new Date(r.ratingUpdateTimeSeconds * 1000);
    return d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
  });
  const ratings = history.map(r => r.newRating);

  const gradient = canvas.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(13, 204, 242, 0.3)');
  gradient.addColorStop(1, 'rgba(13, 204, 242, 0)');

  const pointColors = ratings.map(r => getRatingZoneColor(r));

  if (ratingChart) ratingChart.destroy();

  ratingChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Rating',
        data: ratings,
        borderColor: '#0dccf2',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: pointColors,
        pointBorderColor: '#050810',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(16, 31, 34, 0.95)',
          borderColor: 'rgba(13, 204, 242, 0.3)',
          borderWidth: 1,
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          padding: 12,
          callbacks: {
            title: (items) => {
              const i = items[0].dataIndex;
              return history[i].contestName;
            },
            label: (item) => {
              const i = item.dataIndex;
              const r = history[i];
              const delta = r.newRating - r.oldRating;
              const sign = delta >= 0 ? '+' : '';
              return [`Rating: ${r.newRating}`, `Change: ${sign}${delta}`];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11, family: "'Fira Code', monospace" }, maxTicksLimit: 10 },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#64748b', font: { size: 11 } },
        }
      }
    }
  });
}

window.switchChart = function (platform) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + platform)?.classList.add('active');
  if (platform === 'cf' && cfRatingHistory.length > 0) {
    renderCFChart(cfRatingHistory);
  }
};

// ── Blog Preview (latest 3 posts)
async function renderBlogPreview() {
  const grid = document.getElementById('blog-preview-grid');
  if (!grid) return;
  try {
    const res = await fetch('posts/index.json');
    const posts = await res.json();
    const latest = posts.slice(0, 3);
    grid.innerHTML = latest.map(p => buildBlogCard(p)).join('');

    // Trigger animation observer for dynamically added cards
    grid.querySelectorAll('.reveal').forEach((el, index) => {
      revealObserver.observe(el);
      el.style.transitionDelay = `${index * 0.1}s`;
    });
  } catch (e) {
    console.warn('Could not load posts:', e);
  }
}

function buildBlogCard(post) {
  const tagLabels = { cp: 'CP', algo: 'Algorithm', life: 'Life' };
  const tag = tagLabels[post.tag] || post.tag;
  const imageSrc = post.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuBgoOw05aHhyUPbWwErgZqov6E0Jj24fMZ9FSmlYgku1kDc3uV1l488zLRdIU1pSEsi9CCcZ0F60_2gpgPMM61kMXd1XX0Oi5sNSTnjflli8eJ3bLu1MpIQB7pbFk5yR3YDMRfhUNaF1NCh10ePGkLkKFot0zE2Ba8T2vorkZOEoWpfgnsQRcdQNHXjsG3xIO5OI-mDCeZU2BMfmMVoff4NBzXMF22Kvi8wD1Unuyym5df-2WRNXm9MPTy_EiWvb6_AmzpKB5ndaw";
  return `
    <a href="post.html?slug=${post.slug}" class="flex flex-col rounded-xl border border-primary/10 bg-background-dark/50 hover:border-primary/30 transition-all overflow-hidden group reveal opacity-0 translate-y-8 duration-700 ease-out">
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

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ── Init
document.addEventListener('DOMContentLoaded', () => {
  fetchCF();
  fetchAC();
  renderBlogPreview();
});
