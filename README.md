# AetherOS

AI-integrated web-based operating system simulator built as a TypeScript monorepo.

Live demo: [aetheros.necookie.dev](https://aetheros.necookie.dev)

## What It Is

AetherOS simulates a desktop shell in the browser:
- boot flow from loading screen to login to desktop
- floating window manager with focus, z-order, drag, resize, minimize, and maximize
- terminal, task manager, file manager, and browser-style app surfaces
- kernel metrics generated in a Web Worker
- in-memory virtual filesystem for file-manager interactions
- Fastify server that proxies AI requests and falls back to mock mode when no OpenAI key is present

## Architecture

Root workspaces:
- `client`: React 18, Vite, Zustand, Tailwind, xterm.js
- `server`: Fastify, TypeScript, OpenAI proxy wrapper

Current folder map:
```text
client/
  src/
    apps/
      browser/
      file-manager/
    components/
    features/
      kernel/
      vfs/
      window-manager/
    stores/
    vfs/
    worker/
server/
  src/
    config/
    plugins/
    routes/
    services/
docs/
  architecture.md
  refactor-notes.md
  refactor-plan.md
```

Runtime overview:
- `client/src/App.tsx` owns loading/login/desktop flow.
- `client/src/stores/windowStore.ts` delegates window lifecycle transitions to feature helpers.
- `client/src/worker/kernel.worker.ts` emits typed kernel tick messages to `client/src/stores/useKernelStore.ts`.
- `client/src/vfs/*` provides the filesystem core, while `client/src/stores/fsStore.ts` adapts it for UI state.
- `server/src/server.ts` assembles Fastify plugins and routes.
- `server/src/routes/ai.ts` keeps the existing `POST /api/ai` shape and delegates mock/live behavior to `server/src/services/aiService.ts`.

## What Works Now

- Boot and login flow
- Desktop shell with wallpaper, icons, and taskbar
- Window manager behavior for drag, resize, minimize, maximize, focus, and z-order
- Terminal app with existing command handling and AI command path
- Task Manager with live process, CPU, memory, disk, and network metrics
- File Manager with icon/details views, navigation, rename, and delete on the in-memory VFS
- Browser app with tabs, embed/external fallback behavior, and URL safety checks
- AI proxy mock mode when `OPENAI_API_KEY` is unset

## What Is Still Pending

- True browser sandboxing and richer site compatibility
- Settings application implementation behind the desktop affordances
- Persistence layer for session state, VFS state, and user settings
- Stronger shared contracts if client and server begin sharing repo-level types

## Local Development

Prerequisites:
- Node.js 18+
- npm
- Docker only if you want the optional local Postgres container

Install:
```bash
npm install
```

Environment:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Defaults:
- `client/.env.example` sets `VITE_API_URL=http://localhost:3000`
- `server/.env.example` sets `PORT=3000`
- Leave `OPENAI_API_KEY` empty to use safe mock responses

Run:
```bash
npm run dev
```

Workspace URLs:
- client: `http://localhost:5173`
- server: `http://localhost:3000`

Validation:
```bash
npm run lint
npm run build
```

Optional local Postgres container:
```bash
docker-compose up -d
```

Current Docker scope:
- Docker starts a standalone Postgres instance only.
- The running app does not yet persist AetherOS state into that database.

## Security Notes

- `OPENAI_API_KEY` stays server-side only.
- Client requests go to the Fastify proxy at `POST /api/ai`.
- Fastify registers permissive CORS and a basic rate limit of `100` requests per minute.
- Without an API key, the AI route returns mock responses instead of failing open.

## Recommended Next Features

Recommended means not implemented yet.

Realism:
- `M` Session resume for open windows, bounds, and active app state. Dependency: persistence layer.
- `M` Better process modeling in the kernel worker with stable per-app profiles and lifecycle states. Dependency: current worker protocol.
- `L` VFS persistence with seeded system directories plus user-writable overlays. Dependency: storage design.

Security:
- `M` Harden browser isolation with clearer allow/block rules and sandbox diagnostics. Dependency: browser feature work.
- `S` Add server-side request schema validation for `/api/ai`. Dependency: none.
- `M` Restrict CORS by environment instead of `*`. Dependency: deployment env values.

Persistence:
- `S` Save browser history and settings locally. Dependency: storage choice.
- `M` Persist file-manager mutations across reloads. Dependency: VFS serialization.
- `L` Add multi-user profiles with separate home directories and session state. Dependency: persistence plus auth model.

UX:
- `S` Build the Settings app already hinted at by the desktop/taskbar shell. Dependency: none.
- `M` Add window snapping and keyboard shortcuts for layout control. Dependency: window-manager helpers already extracted.
- `M` Add notifications/toasts at shell level instead of per-app only. Dependency: shared desktop event channel.

DevEx:
- `S` Add lightweight route and worker protocol validation tests without introducing a large framework. Dependency: pick existing tooling strategy.
- `M` Promote shared client-worker contracts into a dedicated `shared/` package if server reuse appears. Dependency: broader cross-runtime type reuse.
- `S` Add CI for `lint`, TypeScript checks, and build verification. Dependency: target CI provider.

## Verification Snapshot

Verified during this refactor:
- `npm run lint`
- `npx tsc -p client/tsconfig.json --noEmit`
- `npx tsc -p server/tsconfig.json --noEmit`

Known limitation in this sandbox:
- `npm run build` is blocked here during the client Vite step because the sandbox denies the `esbuild` child-process spawn used by Vite config loading.
