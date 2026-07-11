<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><fmt:message key="app.dashboard.title"/></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css"/>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>

<nav class="navbar" id="navbar">
    <div class="nav-inner">
        <a href="/" class="nav-brand">
            <span class="nav-logo"><i class="fas fa-landmark"></i></span>
            <span class="nav-title">CivicConnect</span>
        </a>
        <div class="nav-links" id="navLinks">
            <a href="/" class="nav-link"><i class="fas fa-plus-circle"></i> <fmt:message key="app.complaint.new"/></a>
            <a href="/dashboard" class="nav-link active"><i class="fas fa-map-location-dot"></i> <fmt:message key="app.dashboard.title"/></a>
            <a href="/analytics" class="nav-link"><i class="fas fa-chart-pie"></i> <fmt:message key="app.analytics.title"/></a>
        </div>
        <div class="nav-right">
            <div class="lang-switcher">
                <a href="?lang=en" class="lang-btn ${empty param.lang || param.lang == 'en' ? 'active' : ''}">EN</a>
                <a href="?lang=es" class="lang-btn ${param.lang == 'es' ? 'active' : ''}">ES</a>
            </div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
        </div>
    </div>
</nav>

<main class="dash-layout">

    <!-- Filter sidebar -->
    <aside class="dash-sidebar" id="sidebar" aria-label="Filters">
        <div class="sidebar-head">
            <i class="fas fa-filter"></i>
            <h2>Filters</h2>
        </div>

        <div class="filter-group">
            <label class="filter-label"><i class="fas fa-magnifying-glass"></i> Search</label>
            <div class="input-wrap">
                <i class="fas fa-search"></i>
                <input type="text" id="fSearch" placeholder="Title or description...">
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label"><i class="fas fa-tags"></i> Category</label>
            <select id="fCategory" class="filter-select">
                <option value="">All Categories</option>
                <option value="water">💧 Water Leakage</option>
                <option value="road">🛣 Road Damage</option>
                <option value="garbage">🗑 Garbage</option>
                <option value="streetlight">💡 Street Light</option>
                <option value="sanitation">🚽 Sanitation</option>
                <option value="other">⚠ Others</option>
            </select>
        </div>

        <div class="filter-group">
            <label class="filter-label"><i class="fas fa-flag"></i> Status</label>
            <div class="chip-row" id="fStatus">
                <button class="chip" data-status="SUBMITTED">Pending</button>
                <button class="chip" data-status="IN_PROGRESS">In Progress</button>
                <button class="chip" data-status="RESOLVED">Resolved</button>
                <button class="chip" data-status="REJECTED">Rejected</button>
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label"><i class="fas fa-triangle-exclamation"></i> Priority</label>
            <div class="chip-row" id="fPriority">
                <button class="chip" data-priority="NORMAL">Normal</button>
                <button class="chip" data-priority="URGENT">Emergency</button>
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label"><i class="fas fa-calendar"></i> Date From</label>
            <input type="date" id="fDateFrom" class="filter-date">
            <label class="filter-label" style="margin-top:.5rem"><i class="fas fa-calendar"></i> Date To</label>
            <input type="date" id="fDateTo" class="filter-date">
        </div>

        <div class="filter-actions">
            <button class="btn-apply" id="applyFilters"><i class="fas fa-check"></i> Apply Filters</button>
            <button class="btn-reset" id="resetFilters"><i class="fas fa-rotate-left"></i> Reset</button>
        </div>
    </aside>

    <!-- Main map area -->
    <section class="dash-main">
        <!-- Live stats -->
        <div class="stat-row" id="statRow">
            <div class="stat-card grad-blue" data-stat="total">
                <div class="stat-ic"><i class="fas fa-layer-group"></i></div>
                <div class="stat-body">
                    <div class="stat-num" id="statTotal">0</div>
                    <div class="stat-label">Total Complaints</div>
                </div>
            </div>
            <div class="stat-card grad-green" data-stat="resolved">
                <div class="stat-ic"><i class="fas fa-circle-check"></i></div>
                <div class="stat-body">
                    <div class="stat-num" id="statResolved">0</div>
                    <div class="stat-label">Resolved</div>
                </div>
            </div>
            <div class="stat-card grad-orange" data-stat="pending">
                <div class="stat-ic"><i class="fas fa-hourglass-half"></i></div>
                <div class="stat-body">
                    <div class="stat-num" id="statPending">0</div>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
            <div class="stat-card grad-purple" data-stat="inprogress">
                <div class="stat-ic"><i class="fas fa-spinner"></i></div>
                <div class="stat-body">
                    <div class="stat-num" id="statInProgress">0</div>
                    <div class="stat-label">In Progress</div>
                </div>
            </div>
            <div class="stat-card grad-red" data-stat="urgent">
                <div class="stat-ic"><i class="fas fa-bell"></i></div>
                <div class="stat-body">
                    <div class="stat-num" id="statUrgent">0</div>
                    <div class="stat-label">Emergency</div>
                </div>
            </div>
        </div>

        <!-- Map + controls -->
        <div class="map-shell">
            <div id="map"></div>

            <div class="map-toggle">
                <button class="toggle-btn active" id="modeNormal">Normal</button>
                <button class="toggle-btn" id="modeHeat">Heatmap</button>
            </div>

            <div class="map-layers" id="layerControl">
                <button class="layer-btn active" data-layer="street"><i class="fas fa-road"></i> Street</button>
                <button class="layer-btn" data-layer="satellite"><i class="fas fa-satellite"></i> Satellite</button>
                <button class="layer-btn" data-layer="dark"><i class="fas fa-moon"></i> Dark</button>
                <button class="layer-btn" data-layer="terrain"><i class="fas fa-mountain"></i> Terrain</button>
            </div>

            <div class="map-legend" id="legend">
                <div class="legend-title">Legend</div>
                <div class="legend-item"><span class="legend-dot" style="background:#2563EB"></span> Water</div>
                <div class="legend-item"><span class="legend-dot" style="background:#F97316"></span> Roads</div>
                <div class="legend-item"><span class="legend-dot" style="background:#EF4444"></span> Garbage</div>
                <div class="legend-item"><span class="legend-dot" style="background:#FACC15"></span> Street Light</div>
                <div class="legend-item"><span class="legend-dot" style="background:#22C55E"></span> Sanitation</div>
                <div class="legend-item"><span class="legend-dot" style="background:#8B5CF6"></span> Others</div>
            </div>

            <div class="map-empty" id="mapEmpty" style="display:none">
                <div class="empty-illo"><i class="fas fa-map-location-dot"></i></div>
                <h3>No complaints available</h3>
                <p>New complaints will automatically appear here.</p>
                <button class="empty-refresh" id="emptyRefresh"><i class="fas fa-rotate"></i> Refresh</button>
            </div>

            <div class="live-pill" id="livePill"><span class="live-dot"></span> LIVE</div>
        </div>

        <!-- Recent complaints table -->
        <div class="recent-panel">
            <div class="recent-head">
                <h3><i class="fas fa-table"></i> Recent Complaints</h3>
                <span class="recent-count" id="recentCount">0</span>
            </div>
            <div class="table-wrap">
                <table class="recent-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="recentBody"></tbody>
                </table>
            </div>
        </div>
    </section>
</main>

<!-- Right details drawer -->
<div class="drawer-overlay" id="drawerOverlay" style="display:none"></div>
<aside class="details-drawer" id="drawer" aria-label="Complaint details">
    <button class="drawer-close" id="drawerClose" aria-label="Close"><i class="fas fa-xmark"></i></button>
    <div id="drawerContent"></div>
</aside>

<footer class="footer">
    <p>CivicConnect &mdash; Smart City Command Center</p>
</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
<script src="/static/js/dashboard.js"></script>
</body>
</html>
