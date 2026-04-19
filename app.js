// ====== RENDER PLACE CARDS ======
const grid = document.getElementById('placesGrid');
const tabs = document.querySelectorAll('.region-tab');

function render(filter = 'all') {
  grid.innerHTML = '';
  const filtered = filter === 'all' ? places : places.filter(p => p.regionGroup === filter);
  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.style.animationDelay = `${i * 0.08}s`;
    card.innerHTML = `
      <div class="place-image">
        <span class="place-tag">${p.tag}</span>
        <img src="images/${p.img}" alt="${p.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="img-placeholder" style="display:none;">ضع صورة باسم:<br><strong>${p.img}</strong></div>
      </div>
      <div class="place-info">
        <div class="region-label">${p.region}</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="place-meta">
          <span>📅 ${p.season}</span>
          <span>🌡 ${p.temp}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    render(t.dataset.region);
  });
});

render();

// ====== DARK MODE ======
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('wijhat-theme');

if (savedTheme === 'dark') {
  html.setAttribute('data-theme', 'dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
    localStorage.setItem('wijhat-theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
    localStorage.setItem('wijhat-theme', 'dark');
  }
  // Update map tiles if map is initialized
  if (typeof map !== 'undefined' && map) updateMapTiles();
});

// ====== ANIMATED COUNTERS ======
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.s-num').forEach(el => {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();
        function animate(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(target * eased).toLocaleString('ar-SA');
          if (progress < 1) requestAnimationFrame(animate);
        }
        requestAnimationFrame(animate);
      });
      counterObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

counterObserver.observe(document.querySelector('.sustain-stats'));

// ====== NAV SCROLL ======
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  if (window.scrollY > 50) {
    nav.style.padding = '0.7rem 3rem';
    nav.style.background = getComputedStyle(document.documentElement).getPropertyValue('--nav-bg-scroll');
  } else {
    nav.style.padding = '1.2rem 3rem';
    nav.style.background = getComputedStyle(document.documentElement).getPropertyValue('--nav-bg');
  }
});
