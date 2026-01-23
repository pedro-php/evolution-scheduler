# Agenda – WhatsApp Message Scheduler (Evolution API)

Agenda is a **NestJS backend** that integrates with **Evolution API (Baileys)** to send and schedule WhatsApp messages.

It supports:
- User authentication (JWT)
- WhatsApp Evolution instance management
- Sending messages
- Scheduling messages via WhatsApp chat commands
- Cron-based message delivery
- Delivery status tracking via webhooks

---

## Tech Stack

- Node.js 22
- NestJS
- Prisma ORM
- PostgreSQL
- Evolution API (Baileys)
- Swagger (OpenAPI)
- Docker / Docker Compose

---

## Project Structure

```
src/
├── core/
│   └── prisma/
├── modules/
│   ├── auth/
│   ├── jwt/
│   ├── users/
│   ├── evolution/
│   ├── scheduled-messages/
│   └── webhooks/
├── cron/
└── main.ts
```

---

## Authentication

- JWT-based authentication
- Protected routes use `JwtAuthGuard`
- Swagger supports Bearer authentication

---

## Swagger Documentation

Swagger is enabled by default.

```
GET /docs
```

---

## Evolution API Integration

### Supported Routes

```
POST   /evolution/instances
GET    /evolution/instances/:name/status
POST   /evolution/instances/:name/connect
POST   /evolution/instances/:name/logout
POST   /evolution/messages/text
```

---

## Webhooks

```
POST /webhooks/evolution/messages-upsert
POST /webhooks/evolution/send-message
```

---

## Message Scheduling via WhatsApp

### Command Format

```
!schedule "Message text" "YYYY-MM-DD HH:mm"
```

### Example

```
!schedule "Hello from the future" "2026-01-25 09:00"
```

---

## Cron Job

Pending messages are sent automatically when `scheduledFor <= now`.

---

## Database Models (Simplified)

### ScheduledMessage

```
id
instance
to
text
scheduledFor
status
userId? (optional)
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@postgres:5432/reminders
JWT_SECRET=super-secret
EVOLUTION_API_URL=http://evolution:8080
EVOLUTION_API_KEY=your-api-key
EVOLUTION_WEBHOOK_URL=http://api:3000/webhooks/evolution
```

---

## Docker

```bash
docker compose up --build
```