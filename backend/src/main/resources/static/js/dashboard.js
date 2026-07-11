/* ======================================================
   CivicConnect — GIS Command Center (dashboard.js)
   Consumes existing /api/complaints endpoint. No backend changes.
   ====================================================== */

/* Category mapping: backend category code -> {key, icon, color, label} */
const CATEGORY_MAP = {
    WATER:       { key: 'water',       icon: '💧', color: '#2563EB', label: 'Water Leakage' },
    ROAD:        { key: 'road',        icon: '🛣', color: '#F97316', label: 'Road Damage' },
    GARBAGE:     { key: 'garbage',     icon: '🗑', color: '#EF4444', label: 'Garbage' },
    STREETLIGHT: { key: 'streetlight', icon: '💡', color: '#FACC15', label: 'Street Light' },
    SANITATION:  { key: 'sanitation', icon: '🚽', color: '#22C55E', label: 'Sanitation' },
    SAFETY:      { key: 'other',       icon: '🚦', color: '#8B5CF6', label: 'Traffic Signal' },
    ELECTRICITY: { key: 'streetlight', icon: '💡', color: '#FACC15', label: 'Street Light' },
    GAS:         { key: 'other',       icon: '🔥', color: '#8B5CF6', label: 'Gas / Emergency' },
    OTHER:       { key: 'other',       icon: '⚠', color: '#8B5CF6', label: 'Others' }
};

const STATUS_MAP = {
    SUBMITTED:   { label: 'Pending',     cls: 'st-pending' },
    IN_PROGRESS: { label: 'In Progress', cls: 'st-progress' },
    RESOLVED:    { label: 'Resolved',    cls: 'st-resolved' },
    REJECTED:    { label: 'Rejected',    cls: 'st-rejected' }
};

const PRIORITY_MAP = {
    NORMAL: 'Normal',
    URGENT: 'Emergency'
};

/* Tile layer definitions */
const TILES = {
    street:    { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',        attr: '© OpenStreetMap',                              options: { maxZoom: 19 } },
    satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri', options: { maxZoom: 19 } },
    dark:      { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '© CARTO', options: { maxZoom: 19 } },
    terrain:    { url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',      attr: '© OpenTopoMap', options: { maxZoom: 17 } }
};

let map, markerCluster, heatLayer, routingControl, currentLayer = 'street';
let allComplaints = [];
let markersById = {};
let activeFilters = { search: '', category: '', status: [], priority: [], from: '', to: '' };
let userLocation = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    initMap();
    bindUI();
    loadComplaints();
    // Real-time refresh every 15s
    setInterval(loadComplaints, 15000);

    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        loadComplaintById(id);
    }
}

function initMap() {
    map = L.map('map', { zoomControl: false, attributionControl: true }).setView([20.5937, 78.9629], 5);

    L.control.zoom({ position: 'topleft' }).addTo(map);
    L.control.scale({ position: 'bottomright' }).addTo(map);
    L.control.fullscreen = L.control.fullscreen || null;
    if (L.Control.Fullscreen) L.control.fullscreen({ position: 'topleft' }).addTo(map);

    // Locate me
    const locateBtn = L.control({ position: 'topleft' });
    locateBtn.onAdd = function () {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom locate-btn');
        btn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
        btn.title = 'Locate me';
        L.DomEvent.on(btn, 'click', locateMe);
        return btn;
    };
    locateBtn.addTo(map);

    // Compass (recenter north)
    const compassBtn = L.control({ position: 'topleft' });
    compassBtn.onAdd = function () {
        const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom compass-btn');
        btn.innerHTML = '<i class="fas fa-compass"></i>';
        btn.title = 'Reset view';
        L.DomEvent.on(btn, 'click', () => map.setView([20.5937, 78.9629], 5));
        return btn;
    };
    compassBtn.addTo(map);

    setTileLayer('street');
    markerCluster = L.markerClusterGroup({ chunkedLoading: true, maxClusterRadius: 50 });
    map.addLayer(markerCluster);
}

function setTileLayer(key) {
    if (map._tileLayer) map.removeLayer(map._tileLayer);
    const t = TILES[key];
    map._tileLayer = L.tileLayer(t.url, Object.assign({ attribution: t.attr }, t.options)).addTo(map);
}

function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLocation = [pos.coords.latitude, pos.coords.longitude];
            map.setView(userLocation, 15);
            L.circleMarker(userLocation, { radius: 8, color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 })
                .addTo(map).bindPopup('Your location').openPopup();
        },
        () => console.warn('Geolocation failed')
    );
}

function categoryMeta(cat) {
    if (!cat) return CATEGORY_MAP.OTHER;
    const up = cat.toUpperCase();
    return CATEGORY_MAP[up] || guessCategory(cat);
}

function guessCategory(text) {
    const t = text.toLowerCase();
    if (t.includes('water') || t.includes('leak')) return CATEGORY_MAP.WATER;
    if (t.includes('road') || t.includes('pothole') || t.includes('traffic')) return CATEGORY_MAP.ROAD;
    if (t.includes('garbage') || t.includes('waste')) return CATEGORY_MAP.GARBAGE;
    if (t.includes('light') || t.includes('electric')) return CATEGORY_MAP.STREETLIGHT;
    if (t.includes('sanit') || t.includes('sewage')) return CATEGORY_MAP.SANITATION;
    return CATEGORY_MAP.OTHER;
}

function makeIcon(meta, isUrgent) {
    const ring = isUrgent ? 'box-shadow:0 0 0 4px rgba(239,68,68,.6);' : '';
    return L.divIcon({
        className: 'cat-marker-wrap',
        html: `<div class="cat-marker ${isUrgent ? 'urgent' : ''}" style="--mc:${meta.color};${ring}">
                  <span class="cat-emoji">${meta.icon}</span>
               </div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36]
    });
}

function loadComplaints() {
    fetch('/api/complaints')
        .then(r => r.json())
        .then(data => {
            const isFirst = allComplaints.length === 0;
            const prevIds = new Set(allComplaints.map(c => c.id));
            allComplaints = data;
            renderMarkers(isFirst);
            renderStats();
            renderTable();
            renderHeat();
            toggleEmpty();
            // animate only genuinely new markers after first load
            if (!isFirst) {
                data.forEach(c => { if (!prevIds.has(c.id) && c.latitude && c.longitude) pulseNew(c.id); });
            }
        })
        .catch(err => console.error('Failed to load complaints', err));
}

function filteredComplaints() {
    return allComplaints.filter(c => {
        if (activeFilters.search) {
            const q = activeFilters.search.toLowerCase();
            if (!((c.title || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q))) return false;
        }
        if (activeFilters.category && categoryMeta(c.category).key !== activeFilters.category) return false;
        if (activeFilters.status.length && !activeFilters.status.includes(c.status)) return false;
        if (activeFilters.priority.length && !activeFilters.priority.includes(c.priority)) return false;
        if (activeFilters.from && new Date(c.createdAt) < new Date(activeFilters.from)) return false;
        if (activeFilters.to && new Date(c.createdAt) > new Date(activeFilters.to + 'T23:59:59')) return false;
        return true;
    });
}

function renderMarkers(isFirst) {
    markerCluster.clearLayers();
    markersById = {};
    const list = filteredComplaints();
    list.forEach(c => {
        if (c.latitude == null || c.longitude == null) return;
        const meta = categoryMeta(c.category);
        const isUrgent = c.priority === 'URGENT';
        const m = L.marker([c.latitude, c.longitude], { icon: makeIcon(meta, isUrgent) });
        m.bindPopup(popupHtml(c, meta), { maxWidth: 300 });
        m.on('click', () => openDrawer(c));
        m._cid = c.id;
        if (!isFirst) m._new = true;
        markerCluster.addLayer(m);
        markersById[c.id] = m;
    });
}

function popupHtml(c, meta) {
    const st = STATUS_MAP[c.status] || { label: c.status, cls: '' };
    const pr = PRIORITY_MAP[c.priority] || c.priority;
    const img = c.filePath
        ? `<img class="pop-img" src="/uploads/${c.filePath}" alt="attachment" onerror="this.style.display='none'">`
        : '';
    return `
      <div class="pop">
        <div class="pop-cat"><span class="pop-emoji">${meta.icon}</span> ${meta.label}</div>
        <div class="pop-title">${escapeHtml(c.title)}</div>
        <div class="pop-desc">${escapeHtml(c.description || '')}</div>
        <div class="pop-grid">
          <span class="badge ${st.cls}">${st.label}</span>
          <span class="badge ${c.priority === 'URGENT' ? 'pr-urgent' : 'pr-normal'}">${pr}</span>
        </div>
        <div class="pop-meta">
          <div><i class="fas fa-calendar"></i> ${fmtDate(c.createdAt)}</div>
          <div><i class="fas fa-user"></i> Anonymous Citizen</div>
          <div><i class="fas fa-location-dot"></i> ${c.latitude?.toFixed(4)}, ${c.longitude?.toFixed(4)}</div>
          <div><i class="fas fa-building"></i> ${escapeHtml(c.assignedDepartment || 'Unassigned')}</div>
        </div>
        ${img}
        <div class="pop-actions">
          <button class="pop-btn" onclick="openDrawerById(${c.id})">View Details</button>
          <button class="pop-btn ghost" onclick="routeTo(${c.latitude}, ${c.longitude})">Navigate</button>
        </div>
      </div>`;
}

function renderStats() {
    const list = allComplaints;
    animateNumber('statTotal', list.length);
    animateNumber('statResolved', list.filter(c => c.status === 'RESOLVED').length);
    animateNumber('statPending', list.filter(c => c.status === 'SUBMITTED').length);
    animateNumber('statInProgress', list.filter(c => c.status === 'IN_PROGRESS').length);
    animateNumber('statUrgent', list.filter(c => c.priority === 'URGENT').length);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = parseInt(el.textContent.replace(/\D/g, '')) || 0;
    const dur = 600, t0 = performance.now();
    function step(t) {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function renderTable() {
    const body = document.getElementById('recentBody');
    const list = filteredComplaints().slice(0, 50);
    document.getElementById('recentCount').textContent = list.length;
    body.innerHTML = '';
    list.forEach(c => {
        const meta = categoryMeta(c.category);
        const st = STATUS_MAP[c.status] || { label: c.status, cls: '' };
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${c.id}</td>
          <td><span class="cat-cell"><span class="cat-dot" style="background:${meta.color}"></span>${meta.label}</span></td>
          <td>${c.latitude != null ? c.latitude.toFixed(3) + ', ' + c.longitude.toFixed(3) : '—'}</td>
          <td><span class="badge ${st.cls}">${st.label}</span></td>
          <td><span class="badge ${c.priority === 'URGENT' ? 'pr-urgent' : 'pr-normal'}">${PRIORITY_MAP[c.priority] || c.priority}</span></td>
          <td>${fmtDate(c.createdAt)}</td>
          <td><button class="row-action" onclick="zoomTo(${c.id})"><i class="fas fa-eye"></i></button></td>`;
        body.appendChild(tr);
    });
}

function renderHeat() {
    if (!heatLayer) return;
    map.removeLayer(heatLayer);
    const pts = filteredComplaints()
        .filter(c => c.latitude != null && c.longitude != null)
        .map(c => [c.latitude, c.longitude, c.priority === 'URGENT' ? 1.0 : 0.6]);
    heatLayer.setLatLngs(pts);
    if (currentMode === 'heat') map.addLayer(heatLayer);
}

let currentMode = 'normal';
function toggleEmpty() {
    const empty = document.getElementById('mapEmpty');
    const hasData = allComplaints.some(c => c.latitude != null && c.longitude != null);
    empty.style.display = hasData ? 'none' : 'flex';
}

/* ---- Drawer ---- */
function openDrawerById(id) {
    const c = allComplaints.find(x => x.id === id);
    if (c) openDrawer(c);
}
function openDrawer(c) {
    const meta = categoryMeta(c.category);
    const st = STATUS_MAP[c.status] || { label: c.status, cls: '' };
    const img = c.filePath
        ? `<img class="drw-img" src="/uploads/${c.filePath}" alt="attachment" onerror="this.style.display='none'">`
        : `<div class="drw-img placeholder"><i class="fas fa-image"></i></div>`;
    const timeline = (c.statusHistory || []).map(h => `
        <div class="drw-tl-item">
            <span class="tl-dot"></span>
            <div><strong>${STATUS_MAP[h.status]?.label || h.status}</strong>
            <div class="tl-notes">${escapeHtml(h.notes || '')}</div>
            <div class="tl-time">${fmtDate(h.changedAt)}</div></div>
        </div>`).join('') || '<p class="drw-muted">No timeline yet.</p>';

    document.getElementById('drawerContent').innerHTML = `
      <div class="drw-head" style="--mc:${meta.color}">
        <span class="drw-cat-emoji">${meta.icon}</span>
        <div>
          <div class="drw-cat">${meta.label}</div>
          <h2 class="drw-title">${escapeHtml(c.title)}</h2>
        </div>
      </div>
      <div class="drw-badges">
        <span class="badge ${st.cls}">${st.label}</span>
        <span class="badge ${c.priority === 'URGENT' ? 'pr-urgent' : 'pr-normal'}">${PRIORITY_MAP[c.priority] || c.priority}</span>
      </div>
      ${img}
      <div class="drw-section"><h4>Description</h4><p>${escapeHtml(c.description || '')}</p></div>
      <div class="drw-section"><h4>Citizen</h4><p class="drw-muted">Anonymous Citizen</p></div>
      <div class="drw-section"><h4>Assigned Department</h4><p>${escapeHtml(c.assignedDepartment || 'Unassigned')}</p></div>
      <div class="drw-section"><h4>Location</h4><p>${c.latitude != null ? c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5) : '—'}</p></div>
      <div class="drw-section"><h4>Timeline</h4><div class="drw-timeline">${timeline}</div></div>
      <div class="drw-actions">
        <button class="drw-btn" onclick="updateStatus(${c.id},'IN_PROGRESS')"><i class="fas fa-spinner"></i> Mark In Progress</button>
        <button class="drw-btn ok" onclick="updateStatus(${c.id},'RESOLVED')"><i class="fas fa-check"></i> Resolve</button>
        <button class="drw-btn bad" onclick="updateStatus(${c.id},'REJECTED')"><i class="fas fa-ban"></i> Reject</button>
        <button class="drw-btn ghost" onclick="routeTo(${c.latitude}, ${c.longitude})"><i class="fas fa-route"></i> Navigate</button>
      </div>`;
    document.getElementById('drawer').classList.add('open');
    document.getElementById('drawerOverlay').style.display = 'block';
}
function closeDrawer() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('drawerOverlay').style.display = 'none';
}

function updateStatus(id, status) {
    fetch(`/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status, notes: 'Updated from dashboard' })
    }).then(() => { closeDrawer(); loadComplaints(); });
}

function loadComplaintById(id) {
    fetch(`/api/complaints/${id}`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(c => {
            if (c.latitude != null) map.setView([c.latitude, c.longitude], 15);
            openDrawer(c);
        })
        .catch(() => {});
}

function zoomTo(id) {
    const m = markersById[id];
    const c = allComplaints.find(x => x.id === id);
    if (m) map.setView(m.getLatLng(), 16), m.openPopup();
    else if (c && c.latitude != null) map.setView([c.latitude, c.longitude], 16);
}

function routeTo(lat, lng) {
    if (!lat || !lng) return;
    if (routingControl) map.removeControl(routingControl);
    const waypoints = userLocation ? [L.latLng(userLocation), L.latLng(lat, lng)] : [map.getCenter(), L.latLng(lat, lng)];
    routingControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: false,
        lineOptions: { styles: [{ color: '#2563EB', weight: 5 }] },
        createMarker: () => null,
        show: false
    }).addTo(map);
    routingControl.on('routesfound', (e) => {
        const r = e.routes[0];
        const km = (r.summary.totalDistance / 1000).toFixed(1);
        const min = Math.round(r.summary.totalTime / 60);
        L.popup().setLatLng([lat, lng]).setContent(
            `<div class="route-pop"><strong>Route</strong><br>Distance: ${km} km<br>ETA: ~${min} min</div>`
        ).openOn(map);
    });
}

function pulseNew(id) {
    const m = markersById[id];
    if (m && m._icon) {
        const el = m._icon.querySelector('.cat-marker');
        if (el) { el.classList.add('bounce'); setTimeout(() => el.classList.remove('bounce'), 1200); }
    }
}

/* ---- UI bindings ---- */
function bindUI() {
    document.getElementById('navToggle')?.addEventListener('click', () => document.getElementById('navLinks').classList.toggle('open'));

    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

    document.getElementById('emptyRefresh').addEventListener('click', loadComplaints);

    // status chips
    document.querySelectorAll('#fStatus .chip').forEach(ch => ch.addEventListener('click', () => {
        ch.classList.toggle('active');
        activeFilters.status = [...document.querySelectorAll('#fStatus .chip.active')].map(x => x.dataset.status);
    }));
    // priority chips
    document.querySelectorAll('#fPriority .chip').forEach(ch => ch.addEventListener('click', () => {
        ch.classList.toggle('active');
        activeFilters.priority = [...document.querySelectorAll('#fPriority .chip.active')].map(x => x.dataset.priority);
    }));

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // map mode toggle
    document.getElementById('modeNormal').addEventListener('click', () => setMode('normal'));
    document.getElementById('modeHeat').addEventListener('click', () => setMode('heat'));

    // layer control
    document.querySelectorAll('#layerControl .layer-btn').forEach(b => b.addEventListener('click', () => {
        document.querySelectorAll('#layerControl .layer-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        setTileLayer(b.dataset.layer);
        currentLayer = b.dataset.layer;
    }));
}

function applyFilters() {
    activeFilters.search = document.getElementById('fSearch').value.trim();
    const catSel = document.getElementById('fCategory');
    activeFilters.category = catSel.value;
    activeFilters.from = document.getElementById('fDateFrom').value;
    activeFilters.to = document.getElementById('fDateTo').value;
    renderMarkers(false);
    renderTable();
    renderHeat();
    toggleEmpty();
}

function resetFilters() {
    activeFilters = { search: '', category: '', status: [], priority: [], from: '', to: '' };
    document.getElementById('fSearch').value = '';
    document.getElementById('fCategory').value = '';
    document.getElementById('fDateFrom').value = '';
    document.getElementById('fDateTo').value = '';
    document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
    renderMarkers(false);
    renderTable();
    renderHeat();
    toggleEmpty();
}

function setMode(mode) {
    currentMode = mode;
    document.getElementById('modeNormal').classList.toggle('active', mode === 'normal');
    document.getElementById('modeHeat').classList.toggle('active', mode === 'heat');
    if (mode === 'heat') {
        if (!heatLayer) heatLayer = L.heatLayer([], { radius: 30, blur: 20, maxZoom: 12 }).addTo(map);
        renderHeat();
    } else if (heatLayer) {
        map.removeLayer(heatLayer);
    }
}

/* ---- helpers ---- */
function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
function fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d).toLocaleString(); } catch { return d; }
}
