<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><fmt:message key="app.analytics.title"/></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body class="analytics-page">

<nav class="navbar an-nav" id="navbar">
    <div class="nav-inner">
        <a href="/" class="nav-brand">
            <span class="nav-logo"><i class="fas fa-landmark"></i></span>
            <span class="nav-title">CivicConnect</span>
        </a>
        <div class="nav-links" id="navLinks">
            <a href="/" class="nav-link"><i class="fas fa-house"></i> Home</a>
            <a href="/" class="nav-link"><i class="fas fa-flag"></i> Report</a>
            <a href="/dashboard" class="nav-link"><i class="fas fa-map-location-dot"></i> Dashboard</a>
            <a href="/analytics" class="nav-link active"><i class="fas fa-chart-line"></i> Analytics</a>
        </div>
        <div class="nav-right">
            <button class="an-icon-btn" title="Notifications"><i class="fas fa-bell"></i><span class="an-dot"></span></button>
            <a href="#" class="an-auth">Login</a>
            <a href="#" class="an-auth primary">Register</a>
            <div class="lang-switcher">
                <a href="?lang=en" class="lang-btn ${empty param.lang || param.lang == 'en' ? 'active' : ''}">EN</a>
                <a href="?lang=es" class="lang-btn ${param.lang == 'es' ? 'active' : ''}">ES</a>
            </div>
            <div class="an-avatar">A</div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu"><i class="fas fa-bars"></i></button>
        </div>
    </div>
</nav>

<main class="an-main">

    <!-- Header -->
    <header class="an-header">
        <div>
            <h1>Analytics Dashboard</h1>
            <p class="an-sub">Real-time insights and performance monitoring for civic complaints.</p>
        </div>
        <div class="an-header-right">
            <div class="an-clock"><i class="fas fa-clock"></i> <span id="liveClock">--:--:--</span></div>
            <div class="an-date" id="liveDate"></div>
        </div>
    </header>

    <!-- Filter panel -->
    <section class="an-filters glass">
        <div class="an-filter-field">
            <label><i class="fas fa-calendar"></i> From</label>
            <input type="date" id="fFrom">
        </div>
        <div class="an-filter-field">
            <label><i class="fas fa-calendar"></i> To</label>
            <input type="date" id="fTo">
        </div>
        <div class="an-filter-field">
            <label><i class="fas fa-tags"></i> Category</label>
            <select id="fCat">
                <option value="">All</option>
                <option value="water">💧 Water</option>
                <option value="road">🛣 Road</option>
                <option value="garbage">🗑 Garbage</option>
                <option value="streetlight">💡 Street Light</option>
                <option value="sanitation">🚽 Sanitation</option>
                <option value="other">⚠ Others</option>
            </select>
        </div>
        <div class="an-filter-field">
            <label><i class="fas fa-flag"></i> Status</label>
            <select id="fStatus">
                <option value="">All</option>
                <option value="SUBMITTED">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
            </select>
        </div>
        <div class="an-filter-field">
            <label><i class="fas fa-building"></i> Department</label>
            <select id="fDept">
                <option value="">All</option>
            </select>
        </div>
        <div class="an-filter-field">
            <label><i class="fas fa-triangle-exclamation"></i> Priority</label>
            <select id="fPrio">
                <option value="">All</option>
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Emergency</option>
            </select>
        </div>
        <div class="an-filter-actions">
            <button class="an-btn primary" id="applyFilters"><i class="fas fa-check"></i> Apply</button>
            <button class="an-btn ghost" id="resetFilters"><i class="fas fa-rotate-left"></i> Reset</button>
        </div>
    </section>

    <!-- KPI cards -->
    <section class="an-kpis">
        <div class="an-kpi glass" data-k="total">
            <div class="kpi-ic grad-blue"><i class="fas fa-layer-group"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">Total Complaints</div>
                <div class="kpi-num" id="kTotal">0</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dTotal"></span><span class="kpi-spark"><canvas id="sTotal"></canvas></span></div>
            </div>
        </div>
        <div class="an-kpi glass" data-k="resolved">
            <div class="kpi-ic grad-green"><i class="fas fa-circle-check"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">Resolved</div>
                <div class="kpi-num" id="kResolved">0</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dResolved"></span><span class="kpi-spark"><canvas id="sResolved"></canvas></span></div>
            </div>
        </div>
        <div class="an-kpi glass" data-k="inprogress">
            <div class="kpi-ic grad-orange"><i class="fas fa-spinner"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">In Progress</div>
                <div class="kpi-num" id="kInProgress">0</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dInProgress"></span><span class="kpi-spark"><canvas id="sInProgress"></canvas></span></div>
            </div>
        </div>
        <div class="an-kpi glass" data-k="pending">
            <div class="kpi-ic grad-purple"><i class="fas fa-hourglass-half"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">Pending</div>
                <div class="kpi-num" id="kPending">0</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dPending"></span><span class="kpi-spark"><canvas id="sPending"></canvas></span></div>
            </div>
        </div>
        <div class="an-kpi glass" data-k="urgent">
            <div class="kpi-ic grad-red"><i class="fas fa-bell"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">Emergency</div>
                <div class="kpi-num" id="kUrgent">0</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dUrgent"></span><span class="kpi-spark"><canvas id="sUrgent"></canvas></span></div>
            </div>
        </div>
        <div class="an-kpi glass" data-k="avg">
            <div class="kpi-ic grad-cyan"><i class="fas fa-stopwatch"></i></div>
            <div class="kpi-body">
                <div class="kpi-label">Avg Resolution</div>
                <div class="kpi-num" id="kAvg">--</div>
                <div class="kpi-foot"><span class="kpi-delta" id="dAvg"></span><span class="kpi-spark"><canvas id="sAvg"></canvas></span></div>
            </div>
        </div>
    </section>

    <!-- Charts row 1 -->
    <section class="an-charts">
        <div class="an-card glass an-col-4">
            <div class="an-card-head"><h3><i class="fas fa-chart-pie"></i> Complaint Category</h3></div>
            <div class="an-canvas-wrap"><canvas id="catChart"></canvas></div>
            <div class="an-empty" id="emptyCat" style="display:none">No analytics available yet.</div>
        </div>
        <div class="an-card glass an-col-4">
            <div class="an-card-head"><h3><i class="fas fa-chart-bar"></i> Complaint Status</h3></div>
            <div class="an-canvas-wrap"><canvas id="statusChart"></canvas></div>
            <div class="an-empty" id="emptyStatus" style="display:none">No analytics available yet.</div>
        </div>
        <div class="an-card glass an-col-4">
            <div class="an-card-head"><h3><i class="fas fa-chart-pie"></i> Priority Distribution</h3></div>
            <div class="an-canvas-wrap"><canvas id="prioChart"></canvas></div>
            <div class="an-empty" id="emptyPrio" style="display:none">No analytics available yet.</div>
        </div>
    </section>

    <!-- Charts row 2 -->
    <section class="an-charts">
        <div class="an-card glass an-col-8">
            <div class="an-card-head"><h3><i class="fas fa-chart-line"></i> Monthly Trend</h3></div>
            <div class="an-canvas-wrap tall"><canvas id="trendChart"></canvas></div>
            <div class="an-empty" id="emptyTrend" style="display:none">No analytics available yet.</div>
        </div>
        <div class="an-card glass an-col-4">
            <div class="an-card-head"><h3><i class="fas fa-building"></i> Resolution by Dept</h3></div>
            <div class="an-canvas-wrap tall"><canvas id="deptChart"></canvas></div>
            <div class="an-empty" id="emptyDept" style="display:none">No analytics available yet.</div>
        </div>
    </section>

    <!-- Calendar heatmap -->
    <section class="an-card glass">
        <div class="an-card-head"><h3><i class="fas fa-calendar-days"></i> Complaint Frequency by Date</h3></div>
        <div class="cal-heat" id="calHeat"></div>
        <div class="cal-legend"><span>Less</span><i style="background:#1e293b"></i><i style="background:#1d4ed8"></i><i style="background:#2563eb"></i><i style="background:#7c3aed"></i><i style="background:#06b6d4"></i><span>More</span></div>
    </section>

    <!-- Map analytics -->
    <section class="an-card glass">
        <div class="an-card-head">
            <h3><i class="fas fa-map-location-dot"></i> Geographic Distribution</h3>
            <div class="an-map-toggle">
                <button class="an-mt active" id="mapNormal">Markers</button>
                <button class="an-mt" id="mapHeat">Heatmap</button>
            </div>
        </div>
        <div class="an-map-shell">
            <div id="anMap"></div>
            <div class="an-legend" id="anLegend">
                <div><span style="background:#2563EB"></span>Water</div>
                <div><span style="background:#F97316"></span>Road</div>
                <div><span style="background:#EF4444"></span>Garbage</div>
                <div><span style="background:#FACC15"></span>Street Light</div>
                <div><span style="background:#22C55E"></span>Sanitation</div>
                <div><span style="background:#8B5CF6"></span>Others</div>
            </div>
        </div>
    </section>

    <!-- Insights + Sidebar -->
    <section class="an-split">
        <div class="an-col-main">
            <!-- Recent table -->
            <div class="an-card glass">
                <div class="an-card-head">
                    <h3><i class="fas fa-table"></i> Recent Complaints</h3>
                    <div class="an-table-tools">
                        <div class="an-search"><i class="fas fa-search"></i><input type="text" id="tableSearch" placeholder="Search..."></div>
                        <button class="an-btn ghost sm" id="exportCsv"><i class="fas fa-file-csv"></i> CSV</button>
                        <button class="an-btn ghost sm" id="exportPdf"><i class="fas fa-file-pdf"></i> PDF</button>
                        <button class="an-btn ghost sm" id="printBtn"><i class="fas fa-print"></i> Print</button>
                    </div>
                </div>
                <div class="an-table-wrap">
                    <table class="an-table" id="recentTable">
                        <thead>
                            <tr>
                                <th data-sort="id">ID <i class="fas fa-sort"></i></th>
                                <th data-sort="category">Category <i class="fas fa-sort"></i></th>
                                <th data-sort="location">Location <i class="fas fa-sort"></i></th>
                                <th data-sort="status">Status <i class="fas fa-sort"></i></th>
                                <th data-sort="priority">Priority <i class="fas fa-sort"></i></th>
                                <th data-sort="department">Dept <i class="fas fa-sort"></i></th>
                                <th data-sort="created">Created <i class="fas fa-sort"></i></th>
                                <th data-sort="resolved">Resolved <i class="fas fa-sort"></i></th>
                            </tr>
                        </thead>
                        <tbody id="recentBody"></tbody>
                    </table>
                </div>
                <div class="an-pagination" id="pagination"></div>
            </div>

            <!-- AI Insights -->
            <div class="an-card glass">
                <div class="an-card-head"><h3><i class="fas fa-wand-magic-sparkles"></i> AI Insights</h3></div>
                <div class="an-insights" id="insights"></div>
            </div>
        </div>

        <!-- Right sidebar -->
        <aside class="an-col-side">
            <div class="an-card glass">
                <div class="an-card-head"><h3><i class="fas fa-star"></i> Top Categories</h3></div>
                <div id="topCats"></div>
            </div>
            <div class="an-card glass">
                <div class="an-card-head"><h3><i class="fas fa-location-dot"></i> Most Affected</h3></div>
                <div id="topLocs"></div>
            </div>
            <div class="an-card glass">
                <div class="an-card-head"><h3><i class="fas fa-bolt"></i> Live Activity</h3></div>
                <div class="an-activity" id="activity"></div>
            </div>
        </aside>
    </section>

    <footer class="an-footer">CivicConnect &mdash; Smart City Analytics Platform</footer>
</main>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script src="https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js"></script>
<script src="/static/js/analytics.js"></script>
</body>
</html>
