/* ======================================================
   CivicConnect — App JS (form interactions + dashboard/analytics)
   ====================================================== */

document.addEventListener('DOMContentLoaded', function () {

    /* --- Mobile nav toggle --- */
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });
        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    /* --- GPS Location --- */
    var gpsBtn = document.getElementById('gpsBtn');
    var gpsStatus = document.getElementById('gpsStatus');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', function () {
            if (!navigator.geolocation) {
                setGpsStatus('Geolocation is not supported by your browser.', 'error');
                return;
            }
            gpsBtn.classList.add('loading');
            gpsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';
            gpsStatus.textContent = '';
            gpsStatus.className = 'gps-status';

            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
                    document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
                    triggerInputEvents(document.getElementById('latitude'));
                    triggerInputEvents(document.getElementById('longitude'));
                    setGpsStatus('Location detected successfully!', 'success');
                    resetGpsBtn();
                },
                function (err) {
                    setGpsStatus('Could not get location: ' + err.message, 'error');
                    resetGpsBtn();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
        });
    }

    function setGpsStatus(msg, type) {
        if (!gpsStatus) return;
        gpsStatus.textContent = msg;
        gpsStatus.className = 'gps-status ' + type;
    }

    function resetGpsBtn() {
        if (!gpsBtn) return;
        gpsBtn.classList.remove('loading');
        gpsBtn.innerHTML = '<i class="fas fa-map-pin"></i> Use Current Location';
    }

    function triggerInputEvents(el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /* --- Drag & drop + file input --- */
    var uploadZone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('file');
    var uploadContent = document.getElementById('uploadContent');
    var uploadPreview = document.getElementById('uploadPreview');
    var previewImg = document.getElementById('previewImg');
    var previewName = document.getElementById('previewName');
    var previewSize = document.getElementById('previewSize');
    var previewRemove = document.getElementById('previewRemove');

    if (uploadZone && fileInput) {
        uploadZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', function () {
            uploadZone.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                handleFile(e.dataTransfer.files[0]);
            }
        });
        uploadZone.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', function () {
            if (fileInput.files.length) {
                handleFile(fileInput.files[0]);
            }
        });

        if (previewRemove) {
            previewRemove.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                clearFilePreview();
            });
        }
    }

    function handleFile(file) {
        if (!file) return;
        if (uploadContent) uploadContent.style.display = 'none';
        if (uploadPreview) uploadPreview.style.display = 'flex';
        if (previewName) previewName.textContent = file.name;
        if (previewSize) previewSize.textContent = formatFileSize(file.size);

        if (file.type.startsWith('image/') && previewImg) {
            var reader = new FileReader();
            reader.onload = function (e) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
    }

    function clearFilePreview() {
        if (fileInput) fileInput.value = '';
        if (uploadContent) uploadContent.style.display = '';
        if (uploadPreview) uploadPreview.style.display = 'none';
        if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
        if (previewName) previewName.textContent = '';
        if (previewSize) previewSize.textContent = '';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    /* --- Form submission with AJAX + success overlay --- */
    var form = document.getElementById('complaintForm');
    var submitBtn = document.getElementById('submitBtn');
    var successOverlay = document.getElementById('successOverlay');
    var successMsg = document.getElementById('successMsg');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var submitText = submitBtn.querySelector('.submit-text');
            var submitSpinner = submitBtn.querySelector('.submit-spinner');
            submitBtn.disabled = true;
            if (submitText) submitText.style.display = 'none';
            if (submitSpinner) submitSpinner.style.display = 'inline-flex';

            var formData = new FormData(form);

            fetch('/submit', {
                method: 'POST',
                body: formData,
                redirect: 'follow'
            })
            .then(function (response) {
                return response.text().then(function () {
                    return response;
                });
            })
            .then(function (response) {
                var url = response.url || '';
                var idMatch = url.match(/id=(\d+)/);
                var id = idMatch ? idMatch[1] : '';

                if (successOverlay && successMsg) {
                    successMsg.textContent = id
                        ? 'Your complaint has been recorded. ID: ' + id
                        : 'Your complaint has been recorded successfully.';
                    successOverlay.style.display = 'flex';
                } else {
                    window.location.href = '/dashboard' + (id ? '?id=' + id : '');
                }
            })
            .catch(function () {
                window.location.href = '/dashboard';
            });
        });
    }

    if (successOverlay) {
        successOverlay.addEventListener('click', function (e) {
            if (e.target === successOverlay) {
                var idMatch = (successMsg.textContent || '').match(/ID:\s*(\d+)/);
                window.location.href = '/dashboard' + (idMatch ? '?id=' + idMatch[1] : '');
            }
        });
    }

});

/* --- Dashboard: Load complaint detail --- */
async function loadComplaint() {
    var idEl = document.getElementById('complaintId');
    if (!idEl) return;
    var id = idEl.value;
    if (!id) return;

    try {
        var response = await fetch('/api/complaints/' + id);
        if (!response.ok) throw new Error('Complaint not found');
        var data = await response.json();

        document.getElementById('complaint-title').textContent = data.title;
        document.getElementById('complaint-status').textContent = data.status;
        document.getElementById('complaint-status').className = 'status-badge status-' + data.status;
        document.getElementById('complaint-priority').textContent = data.priority;
        document.getElementById('complaint-priority').className = 'priority-badge priority-' + data.priority;
        document.getElementById('complaint-category').textContent = data.category || 'N/A';
        document.getElementById('complaint-department').textContent = data.assignedDepartment || 'N/A';
        document.getElementById('complaint-description').textContent = data.description;

        var timeline = document.getElementById('status-timeline');
        timeline.innerHTML = '';
        if (data.statusHistory && data.statusHistory.length > 0) {
            data.statusHistory.forEach(function (item) {
                var div = document.createElement('div');
                div.className = 'timeline-item';
                div.innerHTML =
                    '<div class="status">' + item.status + '</div>' +
                    '<div class="notes">' + (item.notes || '') + '</div>' +
                    '<div class="time">' + new Date(item.changedAt).toLocaleString() + '</div>';
                timeline.appendChild(div);
            });
        } else {
            timeline.innerHTML = '<p>No status history available.</p>';
        }

        document.getElementById('complaint-detail').style.display = 'block';
        document.getElementById('error-msg').style.display = 'none';
    } catch (err) {
        document.getElementById('complaint-detail').style.display = 'none';
        document.getElementById('error-msg').textContent = err.message;
        document.getElementById('error-msg').style.display = 'block';
    }
}

/* --- Analytics: Load charts --- */
async function loadAnalytics() {
    try {
        var response = await fetch('/api/analytics/dashboard');
        var data = await response.json();

        document.getElementById('total-count').textContent = data.totalComplaints;
        document.getElementById('urgent-count').textContent = data.urgentCount;

        var categoryLabels = Object.keys(data.countByCategory);
        var categoryValues = Object.values(data.countByCategory);

        new Chart(document.getElementById('categoryChart'), {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryValues,
                    backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#8b5cf6', '#6b7280']
                }]
            }
        });

        var statusLabels = Object.keys(data.countByStatus);
        var statusValues = Object.values(data.countByStatus);

        new Chart(document.getElementById('statusChart'), {
            type: 'bar',
            data: {
                labels: statusLabels,
                datasets: [{
                    label: 'Count',
                    data: statusValues,
                    backgroundColor: '#2563eb'
                }]
            },
            options: { scales: { y: { beginAtZero: true } } }
        });
    } catch (err) {
        console.error('Failed to load analytics:', err);
    }
}
