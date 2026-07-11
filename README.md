# CivicConnect - Citizen Complaint Management System

A Spring Boot 3.2 application for managing citizen complaints with REST APIs, JSP views, real-time notifications, and analytics.

## Tech Stack

- Java 17
- Spring Boot 3.2 (Web, Data JPA, Validation, Mail, WebSocket, WebFlux)
- JSP + JSTL views
- MySQL 8.0 (production) / H2 (testing)
- Maven
- Chart.js for analytics

## Prerequisites

- Java 17+
- MySQL 8.0
- Maven (or use included `mvnw`)

## Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE jalalert_db;
```

### 2. Set Environment Variables

```bash
# Database
export DB_USERNAME=your_mysql_user
export DB_PASSWORD=your_mysql_password

# Email (for urgent notifications)
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your_email@gmail.com
export MAIL_PASSWORD=your_app_password

# Google Maps (optional - app falls back to 0.0, 0.0 if not set)
export GOOGLE_MAPS_KEY=your_api_key
```

### 3. Build and Run

```bash
# Build
./mvnw clean package

# Run
java -jar target/jalalert-1.0.0.jar
```

The app starts at `http://localhost:8080`.

## Features

| Feature | Description |
|---------|-------------|
| Complaint Submission | Form with file upload, auto-categorization |
| Emergency Detection | Auto-flags "gas leak", "fire", etc. as URGENT |
| AI Categorization | Rule-based keyword matching (extensible interface) |
| Department Routing | Auto-assigns department based on category |
| Status Tracking | Full timeline history on dashboard |
| Analytics Dashboard | Chart.js charts (by category, status) |
| Push Notifications | WebSocket/STOMP on `/topic/status` |
| Email Alerts | @Async email for URGENT complaints |
| i18n | English/Spanish via `?lang=en\|es` |
| Geocoding | Google Maps API with 10s timeout + fallback |
| CORS Enabled | For future mobile app integration |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/complaints` | Create complaint (JSON) |
| GET | `/api/complaints` | List all complaints |
| GET | `/api/complaints/{id}` | Get complaint + timeline |
| PUT | `/api/complaints/{id}/status` | Update status |
| GET | `/api/analytics/dashboard` | Analytics data |

## JSP Pages

| URL | Page |
|-----|------|
| `/` | Complaint submission form |
| `/dashboard` | Status tracking (add `?id=N`) |
| `/analytics` | Analytics charts |

## WebSocket

Connect to `/ws` with STOMP. Subscribe to `/topic/status` for real-time status updates.

## Project Structure

```
backend/
├── src/main/java/com/jalalert/
│   ├── JalalertApplication.java
│   ├── config/          (WebConfig, WebSocketConfig, ViewController)
│   ├── controller/      (REST + Form controllers)
│   ├── dto/             (Request/Response DTOs)
│   ├── entity/          (JPA entities)
│   ├── exception/       (GlobalExceptionHandler)
│   ├── repository/      (JPA repositories)
│   └── service/         (Business logic, AI, Email, Geocoding, Notifications)
├── src/main/resources/
│   ├── application.properties
│   ├── db/migration/    (Flyway SQL)
│   ├── i18n/            (messages_en, messages_es)
│   └── static/          (CSS, JS)
├── src/main/webapp/WEB-INF/views/  (JSP files)
├── src/test/            (DataJpaTest + MockMvc tests)
└── pom.xml
```
