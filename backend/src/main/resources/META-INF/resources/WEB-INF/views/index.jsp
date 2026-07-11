<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><fmt:message key="app.title"/></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
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
            <a href="/" class="nav-link active"><i class="fas fa-plus-circle"></i> <fmt:message key="app.complaint.new"/></a>
            <a href="/dashboard" class="nav-link"><i class="fas fa-chart-line"></i> <fmt:message key="app.dashboard.title"/></a>
            <a href="/analytics" class="nav-link"><i class="fas fa-chart-pie"></i> <fmt:message key="app.analytics.title"/></a>
        </div>
        <div class="nav-right">
            <div class="lang-switcher">
                <a href="?lang=en" class="lang-btn ${empty param.lang || param.lang == 'en' ? 'active' : ''}">EN</a>
                <a href="?lang=es" class="lang-btn ${param.lang == 'es' ? 'active' : ''}">ES</a>
            </div>
            <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </div>
</nav>

<main class="main-content">
    <div class="page-grid">

        <aside class="info-panel fade-in" role="complementary">
            <div class="info-card">
                <div class="info-icon"><i class="fas fa-bullhorn"></i></div>
                <h2 class="info-title">Report Civic Issues</h2>
                <p class="info-desc">Help improve your community by reporting problems that need attention.</p>
                <ul class="benefits-list">
                    <li><span class="benefit-icon"><i class="fas fa-bolt"></i></span><span>Fast Resolution</span></li>
                    <li><span class="benefit-icon"><i class="fas fa-satellite-dish"></i></span><span>Live Tracking</span></li>
                    <li><span class="benefit-icon"><i class="fas fa-brain"></i></span><span>AI Categorization</span></li>
                    <li><span class="benefit-icon"><i class="fas fa-map-marker-alt"></i></span><span>GPS Location</span></li>
                    <li><span class="benefit-icon"><i class="fas fa-shield-halved"></i></span><span>Secure System</span></li>
                </ul>
                <div class="info-illustration">
                    <i class="fas fa-city"></i>
                </div>
            </div>
        </aside>

        <section class="form-panel slide-up" aria-label="Complaint Form">
            <div class="form-card">
                <div class="form-header">
                    <div class="form-header-icon"><i class="fas fa-file-circle-plus"></i></div>
                    <h1 class="form-title"><fmt:message key="app.complaint.new"/></h1>
                    <p class="form-subtitle">Fill in the details below to submit your complaint</p>
                </div>

                <c:if test="${not empty success}">
                    <div class="alert alert-success" role="alert">
                        <i class="fas fa-check-circle"></i> ${success}
                    </div>
                </c:if>
                <c:if test="${not empty error}">
                    <div class="alert alert-error" role="alert">
                        <i class="fas fa-exclamation-triangle"></i> ${error}
                    </div>
                </c:if>

                <form action="/submit" method="post" enctype="multipart/form-data" class="complaint-form" id="complaintForm" novalidate>

                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-pen"></i> Complaint Details</div>

                        <div class="field-group">
                            <div class="input-wrapper">
                                <span class="input-icon"><i class="fas fa-heading"></i></span>
                                <input type="text" id="title" name="title" required maxlength="255" placeholder=" " autocomplete="off" aria-required="true">
                                <label for="title" class="floating-label"><fmt:message key="app.complaint.title"/> *</label>
                            </div>
                        </div>

                        <div class="field-group">
                            <div class="input-wrapper textarea-wrapper">
                                <span class="input-icon textarea-icon"><i class="fas fa-align-left"></i></span>
                                <textarea id="description" name="description" required maxlength="2000" rows="4" placeholder=" " aria-required="true"></textarea>
                                <label for="description" class="floating-label"><fmt:message key="app.complaint.description"/> *</label>
                            </div>
                        </div>

                        <div class="field-group">
                            <div class="input-wrapper select-wrapper">
                                <span class="input-icon"><i class="fas fa-tags"></i></span>
                                <select id="category" name="category" aria-label="Category">
                                    <option value="" disabled selected>-- Select Category --</option>
                                    <option value="Transport">&#x1F6A7; Road Damage</option>
                                    <option value="Sanitation">&#x1F6BD; Sanitation</option>
                                    <option value="Electricity">&#x1F4A1; Street Light</option>
                                    <option value="Safety">&#x1F6A6; Traffic Signal</option>
                                    <option value="Other">&#x26A0;&#xFE0F; Others</option>
                                </select>
                                <label for="category" class="floating-label category-label"><fmt:message key="app.complaint.category"/></label>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-location-dot"></i> Location</div>

                        <div class="location-fields">
                            <div class="field-group">
                                <div class="input-wrapper">
                                    <span class="input-icon"><i class="fas fa-location-crosshairs"></i></span>
                                    <input type="number" id="latitude" name="latitude" step="0.000001" placeholder=" " aria-label="Latitude">
                                    <label for="latitude" class="floating-label">Latitude</label>
                                </div>
                            </div>
                            <div class="field-group">
                                <div class="input-wrapper">
                                    <span class="input-icon"><i class="fas fa-location-crosshairs"></i></span>
                                    <input type="number" id="longitude" name="longitude" step="0.000001" placeholder=" " aria-label="Longitude">
                                    <label for="longitude" class="floating-label">Longitude</label>
                                </div>
                            </div>
                        </div>

                        <button type="button" class="gps-btn" id="gpsBtn" aria-label="Use current location">
                            <i class="fas fa-map-pin"></i> Use Current Location
                        </button>
                        <div class="gps-status" id="gpsStatus" aria-live="polite"></div>
                    </div>

                    <div class="form-section">
                        <div class="form-section-title"><i class="fas fa-camera"></i> Attachment</div>

                        <div class="upload-zone" id="uploadZone" role="button" tabindex="0" aria-label="Upload file">
                            <input type="file" id="file" name="file" accept="image/*,.pdf" class="file-input" aria-label="File upload">
                            <div class="upload-content" id="uploadContent">
                                <div class="upload-icon-wrap"><i class="fas fa-cloud-arrow-up"></i></div>
                                <p class="upload-text">Drag &amp; drop or <span class="upload-browse">browse</span></p>
                                <p class="upload-hint">Images or PDF up to 10MB</p>
                            </div>
                            <div class="upload-preview" id="uploadPreview" style="display:none">
                                <img id="previewImg" src="" alt="Preview">
                                <div class="preview-info">
                                    <span class="preview-name" id="previewName"></span>
                                    <span class="preview-size" id="previewSize"></span>
                                </div>
                                <button type="button" class="preview-remove" id="previewRemove" aria-label="Remove file">
                                    <i class="fas fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="submit-btn" id="submitBtn">
                        <span class="submit-text"><fmt:message key="app.complaint.submit"/></span>
                        <span class="submit-spinner" style="display:none"><i class="fas fa-circle-notch fa-spin"></i> Submitting...</span>
                        <span class="submit-ripple"></span>
                    </button>
                </form>
            </div>
        </section>

    </div>
</main>

<div class="success-overlay" id="successOverlay" style="display:none" role="dialog" aria-modal="true">
    <div class="success-card">
        <div class="success-icon"><i class="fas fa-circle-check"></i></div>
        <h2>Complaint Submitted!</h2>
        <p class="success-msg" id="successMsg"></p>
        <a href="/dashboard" class="success-btn"><i class="fas fa-chart-line"></i> View Dashboard</a>
    </div>
</div>

<footer class="footer">
    <p>CivicConnect &mdash; Citizen Complaint Management System</p>
</footer>

<script src="/static/js/app.js"></script>
</body>
</html>
