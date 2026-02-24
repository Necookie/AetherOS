# AetherOS - Server (Backend)

This is the API backend for AetherOS, handling system health checks and AI diagnostics via OpenAI.

## Tech Stack
- Node.js & TypeScript
- Fastify
- @fastify/cors & @fastify/rate-limit

## Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. (Optional) Provide your `OPENAI_API_KEY`. If left empty, the server will safely return mocked responses.
3. Install dependencies from the root monorepo:
   ```bash
   npm install
   ```

## Running the Server
The Server can be started using the root script `npm run dev`, or locally via:
```bash
npm run dev
```

## Endpoints
### `GET /health`
Returns the server status and timestamp.
```bash
curl http://localhost:3000/health
```

### `POST /api/ai`
Processes AI prompts.
```bash
curl -X POST http://localhost:3000/api/ai \
     -H "Content-Type: application/json" \
     -d '{"message": "What is thrashing?"}'
```
