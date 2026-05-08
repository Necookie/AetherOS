# AetherOS Server

Backend API workspace for AetherOS.

## Stack

- Node.js + TypeScript
- Fastify
- `@fastify/cors`
- `@fastify/rate-limit`

## Current Responsibilities

- Health endpoint for runtime checks
- AI proxy endpoint used by the client
- Search endpoint used by the browser app
- Mock response fallback when OpenAI key is not set

## Endpoints

### `GET /health`

Returns server status and timestamp.

```bash
curl http://localhost:3000/health
```

### `POST /api/ai`

Request:

```json
{ "message": "What is thrashing?" }
```

Response shape:

```json
{ "reply": "...", "mode": "mock|live" }
```

Example:

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"message":"What is thrashing?"}'
```

### `GET /api/search?q=...`

Returns search results for the AetherOS browser.

```bash
curl "http://localhost:3000/api/search?q=window%20manager"
```

Response shape:

```json
{
  "query": "window manager",
  "mode": "mock|live",
  "results": [
    {
      "id": "live-1",
      "title": "Result title",
      "url": "https://example.com/page",
      "displayUrl": "example.com/page",
      "snippet": "Short summary",
      "source": "live"
    }
  ]
}
```

## Setup

From repo root:

```bash
npm install
cp server/.env.example server/.env
```

Env values:

- `PORT` defaults to `3000`
- `OPENAI_API_KEY` optional
  - empty -> `mode: "mock"`
  - set -> `mode: "live"`
- `TAVILY_SEARCH_API_KEY` or `TAVILY_API_KEY` optional
  - empty -> `/api/search` returns mock results
  - set -> `/api/search` returns live Tavily search results when available

## Run

From repo root:

```bash
npm run dev --workspace=server
```

or run both workspaces:

```bash
npm run dev
```

## Scripts

```bash
npm run lint --workspace=server
npm run typecheck --workspace=server
npm run build --workspace=server
```

## Scope Note

Server persistence/auth endpoints are intentionally out of scope for this phase.
The API is currently focused on health, AI relay, and browser search.
