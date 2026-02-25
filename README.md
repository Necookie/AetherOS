# AetherOS

> AI-Integrated Web-Based Operating System Simulator
> 
> 🌐 **Live Demo:** [aetheros.necookie.dev](https://aetheros.necookie.dev)

Welcome to the AetherOS monorepo. Based on **PRD v4.0**, this project aims to provide a deterministic OS laboratory bridging systems theory, visual simulation, and conversational AI. The project serves as an educational and diagnostic platform demonstrating full-stack engineering capabilities.

## Architecture Highlights
- **Frontend Desktop UI**: Powered by React, Vite, Tailwind CSS, and Zustand.
- **Kernel Simulation**: A persistent, tick-based Web Worker acting as the "kernel". It handles deterministic state like processes and CPU metrics, offloading computation from the main thread.
- **Backend API**: Node.js & Fastify API to proxy requests to an AI Agent (OpenAI API).
- **Persistence (Planned)**: Self-hosted Supabase and PostgreSQL database via Docker.
- **CDN & Deployment**: The frontend is deployed globally via Cloudflare Pages at [aetheros.necookie.dev](https://aetheros.necookie.dev).

## Supported Features (80/20 Implementation)
Currently implemented features (Minimal Scaffolding Phase):
- [x] Command Line Interface (Stubbed using `xterm.js`)
- [x] Task Manager (Basic PID inspection via state)
- [x] AI Assistant (Tested against simple mock Fastify backend)
- [ ] Desktop Shell (Draggable window bounds)
- [ ] File Manager (Pending architecture)
- [ ] Web Browser Sandboxing (Pending iframe handling)
- [ ] System Settings panel

## Security Notes
- The `OPENAI_API_KEY` resides strictly on the server-side proxy server (`server` package). The client never touches it.
- Basic API rate limiting (100req/min) and CORS strategies are configured via Fastify.

---

## Local Development Guide

### Prerequisites
- Node.js (v18+)
- Docker (for PostgreSQL database)

### Setup Steps
1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Setup environment variables:**
   - In `client/`, copy `.env.example` to `.env`.
   - In `server/`, copy `.env.example` to `.env`. Add your `OPENAI_API_KEY` if testing live AI mode, or leave empty to use safe mock mode.
4. **Boot up Postgres Database (Optional):**
   *(Note: Full Supabase parity is not integrated yet. This represents the basic database infrastructure.)*
   ```bash
   docker-compose up -d
   ```

### Running the App
The project uses `concurrently` (via npm workspaces) to launch everything in a single terminal.

```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3000`

### Build and Lint
To verify the project is production ready:
```bash
npm run build
npm run lint
```

## Next Steps
- Implement FAT-style file allocation and disk storage mock logic.
- Elaborate upon the kernel round-robin scheduler inside the `kernel.worker.ts`.
- Replace basic PostgreSQL Docker layer with complete local Supabase instance.
