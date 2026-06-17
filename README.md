# CareerPath

> A workflow-driven Job Application and Interview Tracking Platform.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Backend** | Spring Boot 3.3, Java 17, Spring Security, JWT, Spring Data JPA, Hibernate |
| **Database** | PostgreSQL 16 (Neon), Flyway migrations |
| **Frontend** | React 18, Vite, CSS, React Query (TanStack), Zustand |
| **Testing** | JUnit 5, Testcontainers, MockMvc |
| **Deployment** | Backend: Render (Dockerized JRE 21), Frontend: Vercel |

**Architecture Pattern:** Modular Monolith with feature-based package isolation.

---

## 📂 Project Structure

```
interviewflow/
├── backend/          Spring Boot application
│   ├── src/main/java/com/interviewflow/
│   │   ├── auth/           JWT Auth, BCrypt, User entity
│   │   ├── application/    Core workflow engine + state machine (Opportunities, Notes, Timeline)
│   │   ├── calendar/       Calendar event tracking for interviews and deadlines
│   │   ├── document/       Attachment uploads (Resumes, Cover letters)
│   │   ├── reminder/       Event-driven follow-up alerts and task reminders
│   │   ├── notification/   Event-driven in-app notification alerts
│   │   ├── audit/          Immutable JSONB audit trail logs
│   │   ├── config/         Security, JPA, OpenAPI configurations
│   │   └── common/         Exceptions, response envelopes, utility handlers
│   └── src/main/resources/db/migration/  5 Flyway migration scripts
└── frontend/         React + Vite SPA
    └── src/
        ├── features/       Auth, Dashboard, Opportunities, Calendar, Tasks, Notifications, Timeline, Documents
        ├── components/     AppShell, UI primitives
        ├── api/            Axios instance + per-feature API modules
        └── store/          Zustand auth store
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 17+ (for local backend development)
- Node 18+ (for local frontend development)

### Run with Docker Compose

```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html

---

## 🔄 Application Workflow

Opportunities transition through a state machine that validates allowed status moves.

```
DRAFT ➔ APPLIED ➔ ASSESSMENT_RECEIVED ➔ ASSESSMENT_COMPLETED ➔ INTERVIEW_SCHEDULED ➔ INTERVIEW_COMPLETED ➔ OFFER_RECEIVED ➔ ACCEPTED (Terminal)
                                                                                                        ➔ DECLINED (Terminal)
                                                         ➔ REJECTED (Terminal - from any active state)
                                                         ➔ WITHDRAWN (Terminal - from any non-terminal state)
```

Every transition is a named, explicit HTTP endpoint. Invalid transitions return an HTTP `409 Conflict`.

### Transition API Endpoints

```
POST /api/v1/opportunities                           Create (→ DRAFT)
POST /api/v1/opportunities/{id}/apply                DRAFT → APPLIED
POST /api/v1/opportunities/{id}/receive-assessment   APPLIED → ASSESSMENT_RECEIVED
POST /api/v1/opportunities/{id}/complete-assessment  ASSESSMENT_RECEIVED → ASSESSMENT_COMPLETED
POST /api/v1/opportunities/{id}/schedule-interview   ASSESSMENT_COMPLETED/APPLIED → INTERVIEW_SCHEDULED
POST /api/v1/opportunities/{id}/complete-interview   INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED
POST /api/v1/opportunities/{id}/receive-offer        INTERVIEW_COMPLETED → OFFER_RECEIVED
POST /api/v1/opportunities/{id}/accept               OFFER_RECEIVED → ACCEPTED
POST /api/v1/opportunities/{id}/decline              OFFER_RECEIVED → DECLINED
POST /api/v1/opportunities/{id}/reject               Any → REJECTED
POST /api/v1/opportunities/{id}/withdraw              Any non-terminal → WITHDRAWN
```

---

## 🔒 Security & CORS

- **JWT Authentication** — Access token (15 mins) + refresh token (7 days) authentication flow.
- **BCrypt** password hashing (strength 12).
- **Ownership Validation** — Every service method validates that the requesting user owns the resource being updated.
- **Row-level Security** — Query patterns check `findByIdAndUserId` to prevent horizontal privilege escalation.
- **CORS Allowed Origins** — Configured globally for development (`http://localhost:[*]`) and Vercel production hosting (`https://*.vercel.app`) using origin patterns and supporting credentials headers.

---

## 🧪 Running Tests

```bash
cd backend
./mvnw test
```

*Tests use Testcontainers to spin up a real PostgreSQL instance automatically during execution. No in-memory databases are used for integration tests.*

---

## 🏁 Deployment Configuration

### 🚀 Backend (Render)
- Configured using a multi-stage Docker build based on Alpine JRE 21.
- Dynamically resolves listening port bindings via the `PORT` environment variable (`server.port=${PORT:8080}`).
- Employs public GET `/healthz` endpoints to satisfy Render load-balancer startup scans.

### 🌐 Frontend (Vercel)
- Configured with SPA rewrite rules in `frontend/vercel.json` to route all subpaths back to `index.html` for client-side React Router navigation.
- Fetches the backend URL at build time using the Vercel dashboard environment key `VITE_API_BASE_URL`.
