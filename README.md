# Messenger API

Backend API for a real-time messaging system built with **Node.js, Express, Prisma, PostgreSQL, and Docker**.

---

# Features

* User authentication (JWT + refresh tokens)
* Conversations (private & group chats)
* Real-time messaging foundation
* Message status tracking (sent / read / delivered)
* Prisma ORM with PostgreSQL
* Dockerized database

---

# Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* JWT Authentication
* Docker / Docker Compose

---

# Project Structure

```
src/
 ├── modules/
 │   ├── auth/
 │   ├── users/
 │   ├── conversations/
 │   ├── messages/
 ├── shared/
 │   ├── db/
 │   ├── middleware/
 │   ├── config/
 │   └── docs/
 ├── app.js
 └── server.js
```

---

# Requirements

* Node.js 18+
* Docker + Docker Compose
* npm

---

# Getting Started

## 1. Clone repository

```bash
git clone https://github.com/Vasylenko-Artem/Messenger-api
cd Messenger-api
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Start database (Docker)

```bash
docker-compose up -d
```

---

## 4. Setup database (Prisma)

### First time setup:

```bash
npx prisma migrate dev --name init
```

### Generate Prisma Client:

```bash
npx prisma generate
```

---

## 5. Alternative (if DB already exists)

```bash
npx prisma db push
npx prisma generate
```

---

## 6. Start development server

```bash
npm run dev
```

---

# API Base URL

```
http://localhost:3000
```

---

# Authentication

Auth uses **JWT stored in httpOnly cookies**.

### Endpoints:

| Method | Endpoint       | Description    |
| ------ | -------------- | -------------- |
| POST   | /auth/register | Register user  |
| POST   | /auth/login    | Login          |
| POST   | /auth/refresh  | Refresh tokens |
| POST   | /auth/logout   | Logout         |
| GET    | /auth/status   | Current user   |

---

# Users

| Method | Endpoint  | Description      |
| ------ | --------- | ---------------- |
| GET    | /users/me | Get current user |
| PATCH  | /users/me | Update profile   |

---

# Conversations

| Method | Endpoint           | Description                |
| ------ | ------------------ | -------------------------- |
| POST   | /conversations     | Create conversation        |
| GET    | /conversations     | Get user conversations     |
| DELETE | /conversations/:id | Delete conversations by id |

---

# Messages

| Method | Endpoint                  | Description  |
| ------ | ------------------------- | ------------ |
| POST   | /messages                 | Send message |
| GET    | /messages/:conversationId | Get messages |
| PATCH  | /messages/:id             | Edit message |
| PATCH  | /messages/:id/read        | Mark as read |

---

# Database

Database schema is defined via Prisma.

Diagram:
[https://dbdiagram.io/d/Messenger-69ee8cb5c6a36f9c1b87ae83](https://dbdiagram.io/d/Messenger-69ee8cb5c6a36f9c1b87ae83)

### Main entities:

* User
* Conversation
* ConversationParticipant
* Message
* MessageStatus

---

# Docker Commands

### Start:

```bash
docker-compose up -d
```

### Stop:

```bash
docker-compose down
```

### Restart:

```bash
docker-compose down
docker-compose up -d
```

---

# Prisma Commands

### Create migration:

```bash
npx prisma migrate dev --name migration_name
```

### Generate client:

```bash
npx prisma generate
```

### Sync DB:

```bash
npx prisma db push
```

---

# Standard Workflow

After pulling changes:

```bash
git pull
npm install
docker-compose up -d
npx prisma generate
npm run dev
```

---

# Architecture Rules

* Auth module -> authentication only
* Users module -> profile management
* Conversations -> chat structure
* Messages -> core messaging logic
* Controllers contain no business logic
* Services handle all logic
* Prisma is single DB layer

---

# Future Improvements

* WebSocket real-time messaging
* Typing indicators
* Delivery receipts (live)
* Message pagination
* File uploads

---

# Notes

* All protected routes require JWT cookie
* Passwords are never returned from API
* Conversations require membership validation

---

# Status

Project is currently in **active development phase (MVP stage)**
