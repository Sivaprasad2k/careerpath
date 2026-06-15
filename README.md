# CareerPath

> A workflow-driven Job Application and Interview Tracking Platform.

> Portfolio-grade Spring Boot + React project demonstrating engineering maturity.

---

## Architecture

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3, Spring Security, JWT, Spring Data JPA, Hibernate |
| Database | PostgreSQL 16, Flyway migrations |
| Frontend | React 18, Vite, Tailwind CSS, React Query, Zustand |
| Testing | JUnit 5, Testcontainers, MockMvc |

**Pattern:** Modular Monolith with feature-based package isolation.

---

## Project Structure

```
interviewflow/
├── backend/          Spring Boot application
│   ├── src/main/java/com/interviewflow/
│   │   ├── auth/           JWT auth, BCrypt, User entity
│   │   ├── application/    Core workflow engine + state machine
│   │   ├── interview/      Interview round management
│   │   ├── task/           Task management + auto-creation
│   │   ├── notification/   Event-driven in-app notifications
│   │   ├── audit/          Immutable JSONB audit trail
│   │   ├── config/         Security, JPA, OpenAPI config
│   │   └── common/         Exceptions, response envelope, utils
│   └── src/main/resources/db/migration/  6 Flyway migrations
└── frontend/         React + Vite + Tailwind
    └── src/
        ├── features/       Auth, Applications, Interviews, Tasks, Notifications
        ├── components/     AppShell, UI primitives
        ├── api/            Axios instance + per-feature API modules
        └── store/          Zustand auth store
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 21 (for local backend dev)
- Node 20 (for local frontend dev)

### Run with Docker Compose

```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Run locally (development)

**Backend:**
```bash
cd backend
# Start PostgreSQL
docker compose up postgres -d
# Run backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Application Workflow

```
DRAFT → APPLIED → SCREENING → TECHNICAL_ROUND → HR_ROUND → OFFER_RECEIVED
                                    ↓ (any stage)
                                 REJECTED
```

Every transition is a named HTTP endpoint. The state machine validates all transitions.
Invalid transitions return HTTP 409 Conflict.

### Workflow API Endpoints

```
POST /api/v1/applications                           Create (→ DRAFT)
POST /api/v1/applications/{id}/apply                DRAFT → APPLIED
POST /api/v1/applications/{id}/move-to-screening    APPLIED → SCREENING
POST /api/v1/applications/{id}/move-to-technical-round  SCREENING → TECHNICAL_ROUND
POST /api/v1/applications/{id}/move-to-hr-round     TECHNICAL_ROUND → HR_ROUND
POST /api/v1/applications/{id}/accept-offer         HR_ROUND → OFFER_RECEIVED
POST /api/v1/applications/{id}/reject               Any → REJECTED
```

---

## Security

- **JWT Authentication** — access token (15 min) + refresh token (7 days)
- **BCrypt** password hashing (strength 12)
- **Ownership validation** — every service method asserts the requesting user owns the resource
- **Row-level security** — `findByIdAndUserId` pattern prevents horizontal privilege escalation
- **No generic status PATCH** — only named workflow endpoints

---

## Event Architecture

Every workflow action publishes a Spring ApplicationEvent:

| Event | Listeners |
|---|---|
| ApplicationCreatedEvent | AuditEventListener, NotificationEventListener |
| ApplicationAppliedEvent | AuditEventListener, NotificationEventListener, TaskAutoCreationListener |
| TechnicalRoundScheduledEvent | AuditEventListener, NotificationEventListener, TaskAutoCreationListener |
| OfferReceivedEvent | AuditEventListener, NotificationEventListener |
| ApplicationRejectedEvent | AuditEventListener, NotificationEventListener |

---

## Running Tests

```bash
cd backend
./mvnw test
```

Tests use Testcontainers — a real PostgreSQL instance is started automatically.
No H2 or in-memory database is used.

---

## API Documentation

Swagger UI available at `/swagger-ui.html` when the backend is running.
All endpoints are documented with `@Operation` annotations.
Click **Authorize** and paste your JWT access token to test protected routes.

---

## Architecture Decision Records

| ADR | Decision |
|---|---|
| ADR-001 | Modular Monolith — depth over infra complexity |
| ADR-002 | Spring Events over Kafka — in-JVM, testable, migratable |
| ADR-003 | Explicit workflow endpoints over generic PATCH |
| ADR-004 | Feature-based packages — cohesion over layer folders |
| ADR-005 | JSONB audit values — schema-agnostic diff capture |
| ADR-006 | UUID primary keys — no sequential ID enumeration |
