# Smart Event Discovery & Ticket Booking Platform

Production-focused full-stack app for location-aware event discovery, hosting, booking, real-time trending, recommendations, and AI-based event suggestions.

## 1) Folder Structure

```text
vibeSphere/
  backend/
    app/
      core/
        cache.py
        config.py
        security.py
      routes/
        auth.py
        bookings.py
        chatbot.py
        discover.py
        events.py
      services/
        chatbot.py
        recommendation.py
        search.py
        trending.py
      db.py
      deps.py
      main.py
      models.py
      schemas.py
    requirements.txt
    .env.example
  frontend/
    src/
      api/client.js
      components/
        AuthPanel.jsx
        ChatbotPanel.jsx
        EventCard.jsx
        HostEventForm.jsx
      context/AuthContext.jsx
      App.jsx
      main.jsx
      index.css
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    index.html
  docker-compose.yml
  sample_data.sql
  README.md
```

## 2) High-Level Architecture

Frontend (React + Tailwind + Axios) -> FastAPI API Layer -> Domain services (Event, Booking, Search, Recommendation, Chatbot) -> PostgreSQL (+ optional Redis) + custom in-process LRU cache.

- **API Gateway role**: FastAPI acts as edge API with JWT auth, rate-limit-ready middleware extension point, and endpoint orchestration.
- **Logical microservices** (inside one repo for now):
  - `Event Service`: CRUD and host ownership controls
  - `Booking Service`: transactional booking with row lock
  - `Search Service`: Trie autocomplete
  - `Recommendation Service`: behavior + geo + trending hybrid ranker
  - `Chatbot Service`: local LLM orchestration via Ollama
- **Data stores**:
  - PostgreSQL: source of truth
  - LRU in app memory for hot reads
  - Optional Redis for distributed cache/session/rate limits

## 3) Feature Implementation Mapping

- **User System**: `/auth/signup`, `/auth/login`, `/auth/me` with JWT.
- **Event Management**: `/events` create/list/update/delete; host-only writes.
- **Location Discovery**: `/discover/nearby` uses bounding box + Haversine.
- **Search & Autocomplete**: `/events/autocomplete` backed by Trie.
- **Trending**: `/discover/trending` uses Heap-based top-K scoring.
- **Booking**: `/bookings` with `SELECT ... FOR UPDATE` and unique constraint.
- **Recommendations**: `/discover/recommended` combines interaction weights, distance, and trending fallback.
- **Caching**: `LRUCache` used in event listing hot path.
- **AI Chatbot**: `/chatbot/name`, `/chatbot/chat` using Ollama model.

Chatbot brand name: **VibeScout**.

## 4) Database Design (PostgreSQL)

Core entities:

- **users**
  - `id`, `email (unique)`, `password_hash`, `role`, `city`, `latitude`, `longitude`, `created_at`
- **events**
  - `id`, `host_id (FK users)`, `title`, `description`, `category`, `event_date`, `venue_name`,
  `latitude`, `longitude`, `price`, `capacity`, `tickets_available`, `image_url`, `views`, `is_active`
- **bookings**
  - `id`, `user_id (FK users)`, `event_id (FK events)`, `quantity`, `total_amount`, `status`, `booked_at`
  - unique constraint: `(user_id, event_id)` to block duplicate booking by same user
- **user_event_interactions**
  - `id`, `user_id`, `event_id`, `interaction_type`, `weight`, `created_at`

Indexes to keep:
- users: email
- events: date/category/lat/lon
- bookings: user_id/event_id
- interactions: user_id/event_id

## 5) API Contracts

### Auth
- `POST /auth/signup`
  - Request: `{ email, full_name, password, role, city?, latitude?, longitude? }`
  - Response: `{ access_token, token_type }`
- `POST /auth/login`
  - Request: `{ email, password }`
- `GET /auth/me` (Bearer token)

### Events
- `POST /events` (host only)
- `GET /events?category=&start_date=`
- `GET /events/autocomplete?q=ja`
- `GET /events/{event_id}`
- `PUT /events/{event_id}` (host owner only)
- `DELETE /events/{event_id}` (soft deactivate)

### Discovery
- `GET /discover/nearby?lat=&lon=&distance_km=&category=`
- `GET /discover/trending?k=10`
- `GET /discover/recommended` (auth)

### Booking
- `POST /bookings`
  - Request: `{ event_id, quantity }`
- `GET /bookings/mine`

### Chatbot
- `GET /chatbot/name`
- `POST /chatbot/chat`
  - Request: `{ message, latitude?, longitude? }`
  - Response: `{ reply, source }`

## 6) DSA Usage + Time Complexity

- **Trie (Autocomplete)** in `services/search.py`
  - insert: `O(L)`, prefix query: `O(P + R)` where `L` word length, `P` prefix length, `R` returned ids.
- **Heap / Priority Queue (Trending top-K)** in `services/trending.py`
  - build: `O(N log N)` (or optimize to `O(N log K)`), top-K pop: `O(K log N)`.
- **HashMap + DLL (LRU cache)** in `core/cache.py`
  - get/put: average `O(1)`.
- **Graph/similarity-style recommendation**
  - user-event interaction matrix approximated via weighted affinity scoring.
  - candidate scoring: `O(C)` where `C` candidate events.
- **Geospatial indexing strategy**
  - current implementation: bounding box pre-filter + Haversine refine.
  - production improvement: PostgreSQL PostGIS `GIST` index for `ST_DWithin`.

## 7) Scalability Plan (to 1M users)

- **Compute**
  - Horizontal scale FastAPI with load balancer (Nginx/ALB), stateless JWT auth.
- **Database**
  - Read replicas for discovery/search reads, partition events/bookings by date or region.
  - Connection pooling + query optimization.
- **Cache**
  - Keep local LRU for hot endpoint speed; add Redis for shared multi-instance cache.
- **Search**
  - Offload to OpenSearch/Elasticsearch once catalog grows.
- **Async workloads**
  - Celery/RQ for notifications, recommendation precompute, trending batch jobs.
- **Observability**
  - Metrics (Prometheus), tracing (OpenTelemetry), structured logs.

## 8) Concurrency Safety in Booking

Implemented in `routes/bookings.py`:

1. Begin transaction
2. Lock event row using `with_for_update()`
3. Check `tickets_available >= quantity`
4. Decrement inventory and insert booking atomically
5. Commit

This prevents overselling when many users book the same event simultaneously.

## 9) Caching Strategy

- **Current**: custom in-memory `LRUCache` for event list and frequently repeated query keys.
- **Why**: reduces DB hits for hot reads and keeps 99p latency stable.
- **Eviction**: least-recently-used item removed when capacity exceeded; TTL protects staleness.
- **Distributed extension**: add Redis for cross-instance coherence.

## 10) Local Run Steps

## Prerequisites
- Python 3.11+
- Node 18+
- PostgreSQL (or Docker)
- Optional: Ollama running with model pulled (`ollama pull mistral`)

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:8000`.

## 11) Docker Option

```bash
docker compose up -d
```

Starts PostgreSQL + Ollama services.

## 12) Chatbot Integration Steps (Open Source LLM)

1. Install Ollama
2. Pull model:
   - `ollama pull mistral`
3. Ensure `OLLAMA_BASE_URL` and `OLLAMA_MODEL` are set in backend `.env`
4. Use endpoint: `POST /chatbot/chat`

Fallback is included if model server is unavailable.

## 13) Optional Advanced Features to Add Next

- Rate limiting middleware (e.g., `slowapi` + Redis backend)
- WebSocket stream for live ticket count/trending updates
- Notification service (email/push) on booking confirmation or event changes

## 14) Production Hardening Checklist

- Move to Alembic migrations
- Add integration + load tests for booking races
- Add CI/CD (lint/test/security scans)
- Secrets manager for env vars
- TLS, CORS policy, WAF, structured RBAC audit logs

