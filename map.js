// ====== INTERACTIVE MAP ======
const regionColors = {
  south: '#8a3a1f',
  west: '#2e5b6b',
  center: '#c9962b',
  east: '#6b4a8a',
  north: '#4a6b3a',
};

let map, tileLayer, markers = [];

function initMap() {
  map = L.map('mapContainer', {
    scrollWheelZoom: false,
    zoomControl: true,
  }).setView([23.8, 43.5], 5.5);

  updateMapTiles();
  renderMarkers('all');

  // Fix: force recalculate after container fully renders
  setTimeout(() => { map.invalidateSize(); }, 400);
}

function updateMapTiles() {
  if (tileLayer) map.removeLayer(tileLayer);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
  const lightUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const osmFallback = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  tileLayer = L.tileLayer(isDark ? darkUrl : lightUrl, {
    attribution: '&copy; OpenStreetMap &copy; CartoDB',
    maxZoom: 16,
    subdomains: 'abcd',
    crossOrigin: true,
  }).addTo(map);

  // Fallback if tiles fail to load
  let errorCount = 0;
  tileLayer.on('tileerror', function () {
    errorCount++;
    if (errorCount > 3 && !isDark) {
      map.removeLayer(tileLayer);
      tileLayer = L.tileLayer(osmFallback, {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 16,
      }).addTo(map);
    }
  });
}

function renderMarkers(filter) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const filtered = filter === 'all' ? places : places.filter(p => p.regionGroup === filter);
  filtered.forEach(p => {
    const color = regionColors[p.regionGroup] || '#8a3a1f';
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        width:16px;height:16px;
        background:${color};
        border:3px solid #fff;
        border-radius:50%;
        box-shadow:0 2px 10px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
    marker.bindPopup(`
      <div class="map-popup">
        <h4>${p.name}</h4>
        <div class="mp-region">${p.region} — ${p.tag}</div>
        <p>${p.desc}</p>
        <div class="mp-meta">
          <span>📅 ${p.season}</span>
          <span>🌡 ${p.temp}</span>
        </div>
      </div>
    `, { maxWidth: 280 });
    markers.push(marker);
  });

  // Zoom to region on filter
  if (filter !== 'all' && markers.length > 0) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  } else if (filter === 'all') {
    map.setView([23.8, 43.5], 5.5);
  }
}

// Map filters
document.querySelectorAll('.map-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMarkers(btn.dataset.filter);
  });
});

// Lazy init
let mapInitialized = false;
const mapObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !mapInitialized) {
    initMap();
    mapInitialized = true;
    mapObserver.disconnect();
  }
}, { threshold: 0.05 });

mapObserver.observe(document.getElementById('mapContainer'));