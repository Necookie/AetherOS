# AetherOS

> AI-Integrated Web-Based Operating System Simulator
> 
> 🌐 **Live Demo:** [aetheros.necookie.dev](https://aetheros.necookie.dev)

Welcome to the AetherOS monorepo. Based on **PRD v4.0**, this project aims to provide a deterministic OS laboratory bridging systems theory, visual simulation, and conversational AI. The project serves as an educational and diagnostic platform demonstrating full-stack engineering capabilities.

## Architecture Highlights
- **Frontend Desktop UI**: Powered by React, Vite, Tailwind CSS, and Zustand.
- **Kernel Simulation**: A persistent, tick-based Web Worker acting as the "kernel". It handles deterministic state like processes and CPU metrics, offloading computation from the main thread.
- **Backend API**: Node.js & Fastify API to proxy requests to an AI Agent (OpenAI API).
- **Virtual File System (VFS)**: In-memory filesystem with seeded OS-like directories and files.
- **Persistence (Planned)**: Self-hosted Supabase and PostgreSQL database via Docker.
- **CDN & Deployment**: The frontend is deployed globally via Cloudflare Pages at [aetheros.necookie.dev](https://aetheros.necookie.dev).

## Current OS Status (Feb 26, 2026)
- Boot flow: loading screen -> login -> desktop
- Desktop shell with wallpaper, icons, and taskbar
- Window manager with drag, resize, minimize/maximize, and z-order focus
- Core apps: Terminal, Task Manager, File Manager
- Kernel simulation via Web Worker (process list + CPU/mem/disk/net metrics)
- In-memory VFS backing the File Manager

## Supported Features (80/20 Implementation)
Currently implemented features (Minimal Scaffolding Phase):
- [x] Boot + Login flow (loading screen -> login -> desktop)
- [x] Desktop Shell (taskbar, wallpaper, icons, window focus/z-order)
- [x] Window Manager (drag/resize/minimize/maximize)
- [x] Command Line Interface (`xterm.js` + core commands)
- [x] Task Manager (process list + performance metrics)
- [x] AI Assistant (mock/live via Fastify proxy)
- [x] File Manager (VFS-backed, icon/details views, rename/delete)
- [ ] Web Browser Sandboxing (Pending iframe handling)
- [ ] System Settings panel (desktop icon only)

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

## Recommendations To Make It Feel Real
- Add a window manager: z-order focus, minimize/maximize, snap, and multi-monitor layout.
- Introduce a file system simulation: directory tree, file metadata, permissions, and an indexed search.
- Persist OS state: boot resumes last session, open apps, window positions, and user settings.
- Simulate app lifecycles: cold start delays, background tasks, and graceful shutdown.
- Add a notification center with badges, toasts, and system alerts.
- Build a system settings app: theme, time, language, network, and power profiles.
- Create a system audio layer: volume mixer per app and alert sounds.
- Add a browser sandbox: tabs, history, downloads, and safe iframe isolation.
- Improve resource realism: per-process disk and network spikes, plus throttling under load.
- Add user accounts and lock screen: login profiles, permissions, and fast user switching.
