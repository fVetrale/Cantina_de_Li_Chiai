# Local Infrastructure

Docker Compose stack for local development.
Starts **PostgreSQL 16** and **Redis 7**, both bound to `127.0.0.1` only.

---

## Quick start

```bash
# Start all services in the background
docker compose -f infra/docker-compose.yml up -d

# Check service health
docker compose -f infra/docker-compose.yml ps

# View logs
docker compose -f infra/docker-compose.yml logs -f

# Stop services (data is preserved in named volumes)
docker compose -f infra/docker-compose.yml stop

# Stop and remove containers (data is preserved)
docker compose -f infra/docker-compose.yml down

# ⚠️  Stop and destroy all data (volumes included)
docker compose -f infra/docker-compose.yml down -v
```

---

## Connection strings for `.env`

Copy these into your local `.env` file (never commit this file):

```dotenv
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/winery_dev
REDIS_URL=redis://127.0.0.1:6379
```

---

## Notes

- Credentials (`postgres`/`postgres`) are **local dev only** and are not secrets.
- Production databases are managed separately and must never use these credentials.
- Data volumes (`pg_data`, `redis_data`) survive container restarts; use `down -v` only when you need a clean slate.
- Run `medusa db:migrate` (from `apps/backend`) after starting the stack for the first time.
