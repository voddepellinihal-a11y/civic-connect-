<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><fmt:message key="app.error.title"/></title>
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand"><fmt:message key="app.title"/></div>
        <div class="nav-links">
            <a href="/"><fmt:message key="app.complaint.new"/></a>
            <a href="/dashboard"><fmt:message key="app.dashboard.title"/></a>
            <a href="/analytics"><fmt:message key="app.analytics.title"/></a>
        </div>
    </nav>

    <div class="container">
        <div class="error-page">
            <h1><fmt:message key="app.error.title"/></h1>
            <p><fmt:message key="app.error.message"/></p>
            <a href="/" class="btn btn-primary">Back to Home</a>
        </div>
    </div>
</body>
</html>
