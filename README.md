# Messenger API

Backend API for a real-time messaging system built with **Node.js, Express, Prisma, and PostgreSQL**.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory based on your environment needs.

### 3. Database Setup
```bash
# Run migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

### 4. Run Application
```bash
# Development mode (with nodemon and pino-pretty)
npm run dev

# Production mode
npm start
```

---

## Tech Stack

- **Framework:** Express 5
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **Auth:** JWT (Access/Refresh tokens)
- **Logging:** Pino
- **Documentation:** Swagger (OpenAPI)
- **Testing:** Jest

---

## API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
**`http://localhost:5000/api`**

---

## Project Structure

```text
src/
 ├── modules/      # Domain modules (auth, users, conversations, messages)
 ├── shared/       # Shared logic (db, middleware, config, logger, errors)
 ├── socket/       # WebSocket implementation
 ├── app.js        # Express application setup
 └── server.js     # Server entry point
```

---

## Scripts

- `npm run lint` - Check code style
- `npm run format` - Format code with Prettier
- `npm test` - Run unit tests
- `npm run prisma:studio` - Open Prisma Studio GUI
