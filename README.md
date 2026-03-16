# Agenda (Evolution Scheduler)

Backend service built with **NestJS** for managing WhatsApp instances, users, and scheduled message delivery through **Evolution API**.

It combines:
- JWT authentication for admin users
- Instance lifecycle management (create/list/connect/logout/delete)
- Scheduled message CRUD + cron processing
- Evolution webhook ingestion for message/connection events
- Redis + RabbitMQ infrastructure modules
- Prometheus metrics endpoint
- OpenAPI/Swagger docs

## Table of contents

- [Architecture overview](#architecture-overview)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Domain modules](#domain-modules)
- [HTTP API overview](#http-api-overview)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Testing and quality checks](#testing-and-quality-checks)
- [Observability](#observability)
- [Data model (Prisma)](#data-model-prisma)
- [Notes and conventions](#notes-and-conventions)

## Architecture overview

`AppModule` wires all domain modules and enables the Nest scheduler. The app bootstraps Swagger at `/docs`, exposes metrics at `/metrics`, and listens on `PORT` (default: `3000`).

High-level flow:
1. Admin authenticates (`/auth/register`, `/auth/login`) and receives JWT.
2. Admin manages WhatsApp instances (`/instances`, `/evolution/...`).
3. Scheduled messages are created via API (`/scheduled-messages`) and processed by cron workers.
4. Evolution sends callbacks to `/webhooks/evolution/*` for connection/message updates.
5. Message lifecycle and status are persisted in PostgreSQL via Prisma.

## Tech stack

- **Runtime:** Node.js 22
- **Framework:** NestJS 11
- **ORM/DB:** Prisma + PostgreSQL
- **Messaging/infra:** RabbitMQ, Redis
- **External integration:** Evolution API
- **Docs:** Swagger (`/docs`)
- **Metrics:** Prometheus (`/metrics`)
- **Testing:** Jest (unit + e2e)

## Repository structure

```text
.
├── prisma/                  # Prisma schema + migrations
├── src/
│   ├── common/              # shared interceptors/utilities
│   ├── core/                # core platform modules (e.g., prisma)
│   ├── modules/             # business/infra modules
│   │   ├── admins/
│   │   ├── auth/
│   │   ├── consumers/
│   │   ├── evolution-api/
│   │   ├── instances/
│   │   ├── jwt/
│   │   ├── openai/
│   │   ├── prometheus/
│   │   ├── rabbitmq/
│   │   ├── redis/
│   │   ├── scheduled-messages/
│   │   ├── users/
│   │   └── webhooks/
│   ├── app.module.ts
│   └── main.ts
├── test/                    # e2e + shared test mocks
└── docker-compose.yaml
```

## Domain modules

| Module | Purpose |
|---|---|
| `auth` | Admin register/login and JWT issuing |
| `jwt` | Strategy/guard/decorators for protected endpoints |
| `admins` | Authenticated admin profile read/update |
| `users` | User CRUD within an admin scope |
| `instances` | Persisted instance management tied to admins |
| `evolution-api` | Direct Evolution API operations (status/connect/send/etc.) |
| `scheduled-messages` | Scheduled message CRUD and dispatch orchestration |
| `webhooks` | Evolution webhook handlers (`connection-update`, `messages-upsert`) |
| `openai` | Schedule-intent parsing service |
| `rabbitmq` | Broker connection + queue publishing/consuming support |
| `consumers` | Queue consumers (e.g., message upsert pipeline) |
| `redis` | Redis connection/service abstraction |
| `prometheus` | Metrics exposition and HTTP instrumentation |

## HTTP API overview

> Full and up-to-date API schema is available at **`GET /docs`**.

### Public endpoints

- `POST /auth/register`
- `POST /auth/login`
- `POST /webhooks/evolution/connection-update`
- `POST /webhooks/evolution/messages-upsert`
- `GET /metrics`
- `GET /` (health/basic response)

### Authenticated endpoints (JWT bearer)

- `GET/PATCH /admins/me`
- `POST/GET/PATCH/DELETE /users` (with `:id` and query variants)
- `POST/GET/DELETE /instances` (and `GET /instances/:id`)
- `GET/POST /evolution/instances...`
- `POST /evolution/messages/text`
- `POST/GET/PATCH/DELETE /scheduled-messages`

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | no | HTTP port (default `3000`) |
| `DATABASE_URL` | yes | PostgreSQL connection URL for Prisma |
| `JWT_SECRET` | yes | JWT signing secret |
| `EVOLUTION_API_URL` | yes | Base URL of Evolution API |
| `EVOLUTION_API_KEY` | yes | API key used to call Evolution |
| `EVOLUTION_WEBHOOK_URL` | yes | Webhook URL registered in Evolution |
| `OPENAI_API_KEY` | optional | Enables OpenAI schedule parsing features |
| `RABBITMQ_HOST` | optional | RabbitMQ hostname |
| `RABBITMQ_PORT` | optional | RabbitMQ port |
| `RABBITMQ_DEFAULT_USER` | optional | RabbitMQ username |
| `RABBITMQ_DEFAULT_PASS` | optional | RabbitMQ password |
| `REDIS_HOST` | optional | Redis hostname |
| `REDIS_PORT` | optional | Redis port |
| `REDIS_PASSWORD` | optional | Redis password |

### Example `.env`

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agenda
JWT_SECRET=change-me

EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-key
EVOLUTION_WEBHOOK_URL=http://localhost:3000/webhooks/evolution

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

OPENAI_API_KEY=
```

## Running locally

### 1) Install dependencies

```bash
npm ci
```

### 2) Configure environment

Create `.env` based on the example above.

### 3) Run database migrations

```bash
npx prisma migrate deploy
```

For local development (iterative migration generation), use:

```bash
npx prisma migrate dev
```

### 4) Start the API

```bash
npm run start:dev
```

### 5) Open Swagger docs

- `http://localhost:3000/docs`

### Docker alternative

```bash
docker compose up --build
```

## Testing and quality checks

```bash
npm run test
npm run test:e2e
npm run lint
npm run build
```

## Observability

- **Swagger/OpenAPI:** `GET /docs`
- **Prometheus metrics:** `GET /metrics`
- Global HTTP metrics are collected through `HttpMetricsInterceptor`.

## Data model (Prisma)

Core entities:
- `Admin`
- `User`
- `Instance`
- `ScheduledMessage`
- `Message`

Enums:
- `MessageStatus`
- `ScheduledMessageStatus`

See full schema in `prisma/schema.prisma`.

## Notes and conventions

- This project uses **soft delete flags** (`del`) on selected entities.
- Controllers generally map 1:1 with module services.
- Webhook controllers are excluded from Swagger via `@ApiExcludeController()`.
- Prefer updating DTOs + service logic together when adding API fields.
