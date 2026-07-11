/* analytics.js — Smart City Analytics Platform (CivicConnect) */
(function () {
  "use strict";

  var CATEGORY_META = {
    water:       { label: "Water",       icon: "💧", color: "#2563EB" },
    road:        { label: "Road",        icon: "🛣", color: "#F97316" },
    garbage:     { label: "Garbage",     icon: "🗑", color: "#EF4444" },
    streetlight: { label: "Street Light",icon: "💡", color: "#FACC15" },
    sanitation:  { label: "Sanitation",  icon: "🚽", color: "#22C55E" },
    safety:      { label: "Safety",      icon: "🛡", color: "#06B6D4" },
    electricity: { label: "Electricity", icon: "⚡", color: "#EAB308" },
    gas:         { label: "Gas",         icon: "🔥", color: "#DC2626" },
    other:       { label: "Others",      icon: "⚠", color: "#8B5CF6" }
  };
  var STATUS_META = {
    SUBMITTED:   { label: "Pending",    color: "#8B5CF6", cls: "st-pending" },
    IN_PROGRESS: { label: "In Progress",color: "#F59E0B", cls: "st-progress" },
    RESOLVED:    { label: "Resolved",   color: "#22C55E", cls: "st-resolved" },
    REJECTED:    { label: "Rejected",   color: "#EF4444", cls: "st-rejected" }
  };

  var ALL = [];
  var ANALYTICS = null;
  var FILTERS = { from: "", to: "", cat: "", status: "", dept: "", prio: "" };
  var charts = {};
  var map = null, markerLayer = null, heatLayer = null, mapMode = "normal";
  var sortKey = "created", sortDir = -1, page = 1, pageSize = 8;

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    startClock();
    loadAll();
    bindFilters();
    bindTable();
    bindExports();
    bindMapToggle();
    setInterval(loadAll, 15000);
  });

  function initNav() {
    var t = document.getElementById("navToggle");
    if (t) t.addEventListener("click", function () {
      document.getElementById("navLinks").classList.toggle("open");
    });
  }

  function startClock() {
    function tick() {
      var d = new Date();
      var p = function (n) { return (n < 10 ? "0" : "") + n; };
      var clk = document.getElementById("liveClock");
      var dt = document.getElementById("liveDate");
      if (clk) clk.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
      if (dt) dt.textContent = d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    }
    tick(); setInterval(tick, 1000);
  }

  function loadAll() {
    fetch("/api/analytics/dashboard").then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { ANALYTICS = d || null; })
      .catch(function () { ANALYTICS = null; })
      .then(function () {
        return fetch("/api/complaints").then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; });
      })
      .then(function (list) {
        ALL = Array.isArray(list) ? list : [];
        applyAndRender();
      });
  }

  function applyAndRender() {
    var data = filterData(ALL);
    renderKpis(data);
    renderCatChart(data);
    renderStatusChart(data);
    renderPrioChart(data);
    renderTrendChart(data);
    renderDeptChart(data);
    renderCalendar(data);
    renderMap(data);
    renderTopCats(data);
    renderTopLocs(data);
    renderActivity(data);
    renderInsights(data);
    renderTable(data);
  }

  function filterData(list) {
    return list.filter(function (c) {
      var created = c.createdAt ? new Date(c.createdAt) : null;
      if (FILTERS.from && created && created < new Date(FILTERS.from)) return false;
      if (FILTERS.to && created && created > new Date(FILTERS.to + "T23:59:59")) return false;
      if (FILTERS.cat && normCat(c.category) !== FILTERS.cat) return false;
      if (FILTERS.status && (c.status || "SUBMITTED") !== FILTERS.status) return false;
      if (FILTERS.dept && (c.assignedDepartment || "Unassigned") !== FILTERS.dept) return false;
      if (FILTERS.prio && (c.priority || "NORMAL") !== FILTERS.prio) return false;
      return true;
    });
  }

  function normCat(c) {
    if (!c) return "other";
    var k = String(c).toLowerCase();
    if (k.indexOf("water") >= 0) return "water";
    if (k.indexOf("road") >= 0) return "road";
    if (k.indexOf("garbage") >= 0 || k.indexOf("waste") >= 0) return "garbage";
    if (k.indexOf("light") >= 0 || k.indexOf("streetlight") >= 0) return "streetlight";
    if (k.indexOf("sanit") >= 0) return "sanitation";
    if (k.indexOf("safety") >= 0) return "safety";
    if (k.indexOf("electric") >= 0) return "electricity";
    if (k.indexOf("gas") >= 0) return "gas";
    return "other";
  }

  /* ---------- KPIs ---------- */
  function renderKpis(data) {
    var total = data.length;
    var resolved = data.filter(function (c) { return c.status === "RESOLVED"; }).length;
    var inProg = data.filter(function (c) { return c.status === "IN_PROGRESS"; }).length;
    var pending = data.filter(function (c) { return c.status === "SUBMITTED"; }).length;
    var urgent = data.filter(function (c) { return c.priority === "URGENT"; }).length;
    var avg = avgResolution(data);

    animateNum("kTotal", total);
    animateNum("kResolved", resolved);
    animateNum("kInProgress", inProg);
    animateNum("kPending", pending);
    animateNum("kUrgent", urgent);
    document.getElementById("kAvg").textContent = avg == null ? "--" : avg + "h";

    var deltas = computeDeltas(data);
    setDelta("dTotal", deltas.total);
    setDelta("dResolved", deltas.resolved);
    setDelta("dInProgress", deltas.inProg);
    setDelta("dPending", deltas.pending);
    setDelta("dUrgent", deltas.urgent);
    setDelta("dAvg", deltas.avg, true);

    sparkline("sTotal", deltas.series.total);
    sparkline("sResolved", deltas.series.resolved);
    sparkline("sInProgress", deltas.series.inProg);
    sparkline("sPending", deltas.series.pending);
    sparkline("sUrgent", deltas.series.urgent);
    sparkline("sAvg", deltas.series.avg);
  }

  function computeDeltas(data) {
    var today = new Date();
    function dayKey(d) { return d.toISOString().slice(0, 10); }
    function bucket(days) {
      var map = {};
      for (var i = days - 1; i >= 0; i--) {
        var d = new Date(today); d.setDate(d.getDate() - i);
        map[dayKey(d)] = 0;
      }
      return map;
    }
    var last7 = bucket(7), prev7 = bucket(7), last30 = bucket(30);
    data.forEach(function (c) {
      if (!c.createdAt) return;
      var k = dayKey(new Date(c.createdAt));
      if (last7[k] !== undefined) last7[k]++;
      if (last30[k] !== undefined) last30[k]++;
      var d = new Date(c.createdAt);
      var diff = Math.floor((today - d) / 86400000);
      if (diff >= 7 && diff < 14) {
        var pk = dayKey(new Date(today.getTime() - (diff - 6) * 86400000));
        if (prev7[pk] !== undefined) prev7[pk]++;
      }
    });
    function sum(o) { return Object.keys(o).reduce(function (a, k) { return a + o[k]; }, 0); }
    function pct(curr, prev) {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    }
    var ls = sum(last7), ps = sum(prev7);
    return {
      total: pct(ls, ps),
      resolved: pct(data.filter(function (c) { return c.status === "RESOLVED"; }).length, 0),
      inProg: 0, pending: 0, urgent: 0, avg: 0,
      series: { total: vals(last7), resolved: vals(last7), inProg: vals(last7), pending: vals(last7), urgent: vals(last7), avg: vals(last30) }
    };
    function vals(o) { return Object.keys(o).map(function (k) { return o[k]; }); }
  }

  function setDelta(id, val, invertGood) {
    var el = document.getElementById(id);
    if (!el) return;
    var good = invertGood ? val <= 0 : val >= 0;
    el.className = "kpi-delta " + (good ? "up" : "down");
    el.innerHTML = (val > 0 ? '<i class="fas fa-arrow-up"></i>' : val < 0 ? '<i class="fas fa-arrow-down"></i>' : '<i class="fas fa-minus"></i>') + " " + Math.abs(val) + "%";
  }

  function sparkline(id, arr) {
    var cv = document.getElementById(id);
    if (!cv || !window.Chart) return;
    if (charts[id]) charts[id].destroy();
    if (!arr || arr.length === 0) arr = [0, 0, 0, 0];
    var ctx = cv.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, 24);
    g.addColorStop(0, "rgba(56,189,248,0.5)");
    g.addColorStop(1, "rgba(56,189,248,0)");
    charts[id] = new Chart(ctx, {
      type: "line",
      data: { labels: arr.map(function (_, i) { return i; }), datasets: [{ data: arr, borderColor: "#38BDF8", borderWidth: 2, fill: true, backgroundColor: g, tension: 0.4, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
  }

  function animateNum(id, target) {
    var el = document.getElementById(id);
    if (!el) return;
    var start = parseInt(el.textContent.replace(/\D/g, ""), 10) || 0;
    var t0 = performance.now(), dur = 800;
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function avgResolution(data) {
    var rs = data.filter(function (c) { return c.status === "RESOLVED" && c.createdAt; });
    if (!rs.length) return null;
    // resolved timestamp = last RESOLVED statusHistory entry
    var sum = 0, n = 0;
    rs.forEach(function (c) {
      var ts = null;
      if (Array.isArray(c.statusHistory)) {
        c.statusHistory.forEach(function (h) { if (h.status === "RESOLVED" && h.changedAt) ts = h.changedAt; });
      }
      if (ts) { sum += (new Date(ts) - new Date(c.createdAt)) / 3600000; n++; }
    });
    return n ? Math.round((sum / n) * 10) / 10 : null;
  }

  /* ---------- Charts ---------- */
  function countByCat(data) {
    var m = {};
    data.forEach(function (c) { var k = normCat(c.category); m[k] = (m[k] || 0) + 1; });
    return m;
  }
  function destroy(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

  function renderCatChart(data) {
    destroy("catChart");
    var m = countByCat(data);
    var keys = Object.keys(m);
    var empty = document.getElementById("emptyCat");
    if (!keys.length) { if (empty) empty.style.display = "block"; return; } else if (empty) empty.style.display = "none";
    var ctx = document.getElementById("catChart");
    charts.catChart = new Chart(ctx, {
      type: "doughnut",
      data: { labels: keys.map(function (k) { return (CATEGORY_META[k] || {}).label || k; }),
        datasets: [{ data: keys.map(function (k) { return m[k]; }), backgroundColor: keys.map(function (k) { return (CATEGORY_META[k] || {}).color || "#888"; }), borderColor: "rgba(255,255,255,0.08)", borderWidth: 2 }] },
      options: chartPieOpts()
    });
  }

  function renderStatusChart(data) {
    destroy("statusChart");
    var order = ["SUBMITTED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
    var counts = order.map(function (s) { return data.filter(function (c) { return (c.status || "SUBMITTED") === s; }).length; });
    var empty = document.getElementById("emptyStatus");
    if (data.length === 0) { if (empty) empty.style.display = "block"; return; } else if (empty) empty.style.display = "none";
    charts.statusChart = new Chart(document.getElementById("statusChart"), {
      type: "bar",
      data: { labels: order.map(function (s) { return STATUS_META[s].label; }), datasets: [{ data: counts, backgroundColor: order.map(function (s) { return STATUS_META[s].color; }), borderRadius: 6 }] },
      options: chartBarOpts()
    });
  }

  function renderPrioChart(data) {
    destroy("prioChart");
    var urg = data.filter(function (c) { return c.priority === "URGENT"; }).length;
    var nor = data.length - urg;
    var empty = document.getElementById("emptyPrio");
    if (data.length === 0) { if (empty) empty.style.display = "block"; return; } else if (empty) empty.style.display = "none";
    charts.prioChart = new Chart(document.getElementById("prioChart"), {
      type: "doughnut",
      data: { labels: ["Normal", "Emergency"], datasets: [{ data: [nor, urg], backgroundColor: ["#22C55E", "#EF4444"], borderColor: "rgba(255,255,255,0.08)", borderWidth: 2 }] },
      options: chartPieOpts()
    });
  }

  function renderTrendChart(data) {
    destroy("trendChart");
    var m = {};
    data.forEach(function (c) {
      if (!c.createdAt) return;
      var d = new Date(c.createdAt);
      var k = d.getFullYear() + "-" + (d.getMonth() + 1);
      m[k] = (m[k] || 0) + 1;
    });
    var keys = Object.keys(m).sort();
    var empty = document.getElementById("emptyTrend");
    if (!keys.length) { if (empty) empty.style.display = "block"; return; } else if (empty) empty.style.display = "none";
    charts.trendChart = new Chart(document.getElementById("trendChart"), {
      type: "line",
      data: { labels: keys.map(function (k) { return k; }), datasets: [{ label: "Complaints", data: keys.map(function (k) { return m[k]; }), borderColor: "#38BDF8", backgroundColor: "rgba(56,189,248,0.15)", fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: "#38BDF8" }] },
      options: chartLineOpts()
    });
  }

  function renderDeptChart(data) {
    destroy("deptChart");
    var m = {};
    data.forEach(function (c) {
      var d = c.assignedDepartment || "Unassigned";
      m[d] = m[d] || { total: 0, resolved: 0 };
      m[d].total++;
      if (c.status === "RESOLVED") m[d].resolved++;
    });
    var depts = Object.keys(m);
    var empty = document.getElementById("emptyDept");
    if (!depts.length) { if (empty) empty.style.display = "block"; return; } else if (empty) empty.style.display = "none";
    charts.deptChart = new Chart(document.getElementById("deptChart"), {
      type: "bar",
      data: { labels: depts, datasets: [{ label: "Resolved", data: depts.map(function (d) { return m[d].resolved; }), backgroundColor: "#22C55E", borderRadius: 4 },
        { label: "Total", data: depts.map(function (d) { return m[d].total; }), backgroundColor: "#3B82F6", borderRadius: 4 }] },
      options: Object.assign(chartBarOpts(), { indexAxis: "y" })
    });
  }

  function chartPieOpts() {
    return { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1", padding: 12, font: { size: 11 } } }, tooltip: { callbacks: { label: function (c) { return c.label + ": " + c.parsed; } } } } };
  }
  function chartBarOpts() {
    return { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: { x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } }, y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true } } };
  }
  function chartLineOpts() {
    return { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { color: "#94a3b8", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.05)" } }, y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true } } };
  }

  /* ---------- Calendar heatmap ---------- */
  function renderCalendar(data) {
    var el = document.getElementById("calHeat");
    if (!el) return;
    var counts = {};
    data.forEach(function (c) { if (c.createdAt) { var k = new Date(c.createdAt).toISOString().slice(0, 10); counts[k] = (counts[k] || 0) + 1; } });
    var max = Math.max(1, Math.max.apply(null, Object.keys(counts).map(function (k) { return counts[k]; })));
    function lvl(n) { if (n === 0) return 0; var r = n / max; return r > 0.66 ? 4 : r > 0.4 ? 3 : r > 0.15 ? 2 : 1; }
    var colors = ["#1e293b", "#1d4ed8", "#2563eb", "#7c3aed", "#06b6d4"];
    var today = new Date();
    var html = "";
    for (var w = 0; w < 16; w++) {
      html += '<div class="cal-week">';
      for (var d = 0; d < 7; d++) {
        var dt = new Date(today); dt.setDate(dt.getDate() - ((15 - w) * 7 + (6 - d)));
        var k = dt.toISOString().slice(0, 10);
        var n = counts[k] || 0, v = lvl(n);
        html += '<div class="cal-day" title="' + k + ": " + n + '" style="background:' + colors[v] + '"></div>';
      }
      html += "</div>";
    }
    el.innerHTML = html;
  }

  /* ---------- Map ---------- */
  function renderMap(data) {
    var el = document.getElementById("anMap");
    if (!el) return;
    if (!map) {
      map = L.map("anMap", { zoomControl: true }).setView([20.59, 78.96], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 19 }).addTo(map);
      markerLayer = L.markerClusterGroup();
      map.addLayer(markerLayer);
    }
    markerLayer.clearLayers();
    if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
    var pts = [];
    data.forEach(function (c) {
      if (c.latitude == null || c.longitude == null) return;
      var lat = parseFloat(c.latitude), lng = parseFloat(c.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      pts.push([lat, lng]);
      var meta = CATEGORY_META[normCat(c.category)] || CATEGORY_META.other;
      var m = L.circleMarker([lat, lng], { radius: 7, color: meta.color, fillColor: meta.color, fillOpacity: 0.8, weight: 2 });
      m.bindPopup("<b>" + meta.icon + " " + (meta.label) + "</b><br>" + (c.location || "") + "<br><span class='" + (STATUS_META[c.status || "SUBMITTED"].cls) + "'>" + (STATUS_META[c.status || "SUBMITTED"].label) + "</span>");
      markerLayer.addLayer(m);
    });
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.2));
    if (mapMode === "heat" && pts.length) {
      heatLayer = L.heatLayer(pts, { radius: 25, blur: 15, maxZoom: 12 }).addTo(map);
    }
  }

  function bindMapToggle() {
    var n = document.getElementById("mapNormal"), h = document.getElementById("mapHeat");
    if (n) n.addEventListener("click", function () { mapMode = "normal"; n.classList.add("active"); h.classList.remove("active"); renderMap(filterData(ALL)); });
    if (h) h.addEventListener("click", function () { mapMode = "heat"; h.classList.add("active"); n.classList.remove("active"); renderMap(filterData(ALL)); });
  }

  /* ---------- Sidebars ---------- */
  function renderTopCats(data) {
    var el = document.getElementById("topCats");
    if (!el) return;
    var m = countByCat(data);
    var arr = Object.keys(m).map(function (k) { return { k: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
    var total = data.length || 1;
    el.innerHTML = arr.map(function (o) {
      var meta = CATEGORY_META[o.k] || CATEGORY_META.other;
      var pct = Math.round((o.n / total) * 100);
      return '<div class="top-row"><span class="top-ic" style="background:' + meta.color + '">' + meta.icon + '</span>' +
        '<div class="top-bar"><div class="top-name">' + meta.label + '</div><div class="top-track"><i style="width:' + pct + '%;background:' + meta.color + '"></i></div></div>' +
        '<span class="top-val">' + o.n + '</span></div>';
    }).join("") || "<p class='an-muted'>No data.</p>";
  }

  function renderTopLocs(data) {
    var el = document.getElementById("topLocs");
    if (!el) return;
    var m = {};
    data.forEach(function (c) { if (c.location) { m[c.location] = (m[c.location] || 0) + 1; } });
    var arr = Object.keys(m).map(function (k) { return { k: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
    el.innerHTML = arr.map(function (o) {
      return '<div class="loc-row"><i class="fas fa-location-dot"></i><span class="loc-name">' + o.k + '</span><span class="loc-val">' + o.n + '</span></div>';
    }).join("") || "<p class='an-muted'>No locations.</p>";
  }

  function renderActivity(data) {
    var el = document.getElementById("activity");
    if (!el) return;
    var events = [];
    data.forEach(function (c) {
      var base = c.createdAt || null;
      if (base) events.push({ t: base, txt: "New complaint #" + c.id + " (" + ((CATEGORY_META[normCat(c.category)] || {}).label || c.category) + ")", ic: "fa-flag", c: "blue" });
      if (Array.isArray(c.statusHistory)) c.statusHistory.forEach(function (h) {
        if (h.changedAt) events.push({ t: h.changedAt, txt: "Status → " + (STATUS_META[h.status] ? STATUS_META[h.status].label : h.status) + " #" + c.id, ic: "fa-rotate", c: "green" });
      });
    });
    events.sort(function (a, b) { return new Date(b.t) - new Date(a.t); });
    el.innerHTML = events.slice(0, 12).map(function (e) {
      return '<div class="act-row"><span class="act-ic ' + e.c + '"><i class="fas ' + e.ic + '"></i></span><div class="act-txt">' + e.txt + '</div><div class="act-time">' + relTime(e.t) + '</div></div>';
    }).join("") || "<p class='an-muted'>No activity.</p>";
  }

  function renderInsights(data) {
    var el = document.getElementById("insights");
    if (!el) return;
    var ins = [];
    if (!data.length) { el.innerHTML = "<p class='an-muted'>No data available to generate insights.</p>"; return; }
    var m = countByCat(data);
    var top = Object.keys(m).sort(function (a, b) { return m[b] - m[a]; })[0];
    if (top) ins.push({ i: "fa-lightbulb", c: "blue", t: ((CATEGORY_META[top] || {}).label || top) + " complaints dominate with " + m[top] + " reports (" + Math.round(m[top] / data.length * 100) + "% of total)." });
    var resolved = data.filter(function (c) { return c.status === "RESOLVED"; }).length;
    var rate = Math.round(resolved / data.length * 100);
    ins.push({ i: "fa-circle-check", c: rate >= 50 ? "green" : "orange", t: "Resolution rate is " + rate + "% (" + resolved + " of " + data.length + " resolved)." });
    var avg = avgResolution(data);
    if (avg != null) ins.push({ i: "fa-stopwatch", c: "cyan", t: "Average resolution time is " + avg + " hours." });
    var urg = data.filter(function (c) { return c.priority === "URGENT" && c.status !== "RESOLVED"; }).length;
    if (urg) ins.push({ i: "fa-triangle-exclamation", c: "red", t: urg + " urgent complaint(s) still awaiting resolution — prioritize these." });
    el.innerHTML = ins.map(function (o) {
      return '<div class="ins-row"><span class="ins-ic ' + o.c + '"><i class="fas ' + o.i + '"></i></span><div class="ins-txt">' + o.t + '</div></div>';
    }).join("");
  }

  /* ---------- Table ---------- */
  function renderTable(data) {
    var rows = data.slice().map(function (c) {
      var resolvedTs = null;
      if (Array.isArray(c.statusHistory)) c.statusHistory.forEach(function (h) { if (h.status === "RESOLVED" && h.changedAt) resolvedTs = h.changedAt; });
      return { id: c.id, category: normCat(c.category), catLabel: (CATEGORY_META[normCat(c.category)] || {}).label || c.category, location: c.location || "-",
        status: c.status || "SUBMITTED", priority: c.priority || "NORMAL", department: c.assignedDepartment || "Unassigned",
        created: c.createdAt, resolved: resolvedTs };
    });
    rows.sort(function (a, b) {
      var va = a[sortKey], vb = b[sortKey];
      if (va == null) va = ""; if (vb == null) vb = "";
      if (va < vb) return -1 * sortDir; if (va > vb) return 1 * sortDir; return 0;
    });
    var search = (document.getElementById("tableSearch").value || "").toLowerCase();
    if (search) rows = rows.filter(function (r) { return (r.catLabel + r.location + r.status + r.department + r.id).toLowerCase().indexOf(search) >= 0; });
    window.__rows = rows;
    var totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    if (page > totalPages) page = totalPages;
    var slice = rows.slice((page - 1) * pageSize, page * pageSize);
    var body = document.getElementById("recentBody");
    body.innerHTML = slice.map(function (r) {
      var sm = STATUS_META[r.status];
      return "<tr><td>#" + r.id + "</td><td><span class='cat-chip'>" + r.catLabel + "</span></td><td>" + esc(r.location) + "</td>" +
        "<td><span class='st-badge " + sm.cls + "'>" + sm.label + "</span></td>" +
        "<td><span class='pr-badge " + (r.priority === "URGENT" ? "pr-urgent" : "pr-normal") + "'>" + r.priority + "</span></td>" +
        "<td>" + esc(r.department) + "</td><td>" + fmtDate(r.created) + "</td><td>" + (r.resolved ? fmtDate(r.resolved) : '<span class="an-muted">—</span>') + "</td></tr>";
    }).join("") || "<tr><td colspan='8' class='an-empty'>No complaints match the filters.</td></tr>";
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    var el = document.getElementById("pagination");
    if (!el) return;
    var html = "";
    html += '<button ' + (page <= 1 ? "disabled" : "") + ' data-p="' + (page - 1) + '"><i class="fas fa-chevron-left"></i></button>';
    for (var i = 1; i <= totalPages; i++) html += '<button class="' + (i === page ? "active" : "") + '" data-p="' + i + '">' + i + "</button>";
    html += '<button ' + (page >= totalPages ? "disabled" : "") + ' data-p="' + (page + 1) + '"><i class="fas fa-chevron-right"></i></button>';
    el.innerHTML = html;
    Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { var p = parseInt(b.getAttribute("data-p"), 10); if (!isNaN(p)) { page = p; renderTable(filterData(ALL)); } });
    });
  }

  function bindTable() {
    Array.prototype.forEach.call(document.querySelectorAll("#recentTable th[data-sort]"), function (th) {
      th.addEventListener("click", function () {
        var k = th.getAttribute("data-sort");
        if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = 1; }
        renderTable(filterData(ALL));
      });
    });
    var s = document.getElementById("tableSearch");
    if (s) s.addEventListener("input", function () { page = 1; renderTable(filterData(ALL)); });
  }

  /* ---------- Filters / exports ---------- */
  function bindFilters() {
    var dept = document.getElementById("fDept");
    if (dept) {
      var depts = {};
      ALL.forEach(function (c) { depts[c.assignedDepartment || "Unassigned"] = 1; });
      Object.keys(depts).sort().forEach(function (d) { var o = document.createElement("option"); o.value = d;o.textContent = d; dept.appendChild(o); });
    }
    document.getElementById("applyFilters").addEventListener("click", function () {
      FILTERS.from = document.getElementById("fFrom").value;
      FILTERS.to = document.getElementById("fTo").value;
      FILTERS.cat = document.getElementById("fCat").value;
      FILTERS.status = document.getElementById("fStatus").value;
      FILTERS.dept = document.getElementById("fDept").value;
      FILTERS.prio = document.getElementById("fPrio").value;
      applyAndRender();
    });
    document.getElementById("resetFilters").addEventListener("click", function () {
      FILTERS = { from: "", to: "", cat: "", status: "", dept: "", prio: "" };
      ["fFrom", "fTo", "fCat", "fStatus", "fDept", "fPrio"].forEach(function (id) { document.getElementById(id).value = ""; });
      applyAndRender();
    });
  }

  function bindExports() {
    var csv = document.getElementById("exportCsv");
    if (csv) csv.addEventListener("click", function () {
      var rows = window.__rows || [];
      var head = ["ID", "Category", "Location", "Status", "Priority", "Department", "Created", "Resolved"];
      var lines = [head.join(",")];
      rows.forEach(function (r) { lines.push([r.id, r.catLabel, '"' + String(r.location).replace(/"/g, '""') + '"', r.status, r.priority, r.department, r.created || "", r.resolved || ""].join(",")); });
      download(new Blob([lines.join("\n")], { type: "text/csv" }), "civicconnect_complaints.csv");
    });
    var pdf = document.getElementById("exportPdf");
    if (pdf) pdf.addEventListener("click", function () { window.print(); });
    var pr = document.getElementById("printBtn");
    if (pr) pr.addEventListener("click", function () { window.print(); });
  }

  function download(blob, name) {
    var url = URL.createObjectURL(blob); var a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  /* ---------- utils ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fmtDate(s) { if (!s) return "—"; var d = new Date(s); return isNaN(d) ? "—" : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
  function relTime(s) { if (!s) return ""; var d = new Date(s), diff = (Date.now() - d) / 1000; if (diff < 60) return "just now"; if (diff < 3600) return Math.floor(diff / 60) + "m ago"; if (diff < 86400) return Math.floor(diff / 3600) + "h ago"; return Math.floor(diff / 86400) + "d ago"; }
})();
