# AetherOS

AetherOS is a web-based OS simulator for OS/HCI coursework, built as a TypeScript monorepo.

## Current Scope

This project currently focuses on functional OS simulation only.

- Included: shell UX, windowing, process simulation, in-memory/local-persistent VFS, core apps, settings, notifications, and app lifecycle simulation.
- Excluded for now: real authentication, real database, and cloud file storage.

## Implemented Features

- Boot sequence: loading screen -> lock/login screen -> desktop shell
- Local multi-profile session simulation (admin/member/guest with PIN)
- Window manager:
  - open, close, focus, z-order
  - drag/resize/maximize/minimize/restore
  - per-window crash recovery boundary + retry/close
- Kernel simulation (Web Worker):
  - process list
  - CPU, memory, disk, network usage
  - simulated latency
  - app-linked process spawn/kill flow
- Task Manager:
  - processes tab with kill action
  - performance + network views
- File Manager (VFS-backed):
  - directory navigation/tree
  - icon/details views
  - rename, move, delete, hidden toggle
  - keyboard shortcuts
- Terminal:
  - built-in commands (`help`, `pwd`, `ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `mv`, `cp`, `clear`)
  - history navigation and tab completion
- Browser app:
  - tabbed browsing model
  - safe URL normalization/blocking for unsafe schemes
  - embed/external fallback
  - offline cache simulation + connectivity toggles
  - bookmarks/history side panels
- Settings app:
  - appearance (theme/wallpaper/custom palette)
  - desktop controls (icon scale/taskbar position/accent strength)
  - accessibility controls + checks
  - behavior toggles (animations/translucency/clock seconds)
- Notifications + background jobs:
  - grouped notification center with actions
  - periodic system-health and latency alerts
- Productivity apps:
  - Notes, Docs, Boards
  - autosave, draft recovery, linked records, attachment path validation
- App Store simulation:
  - install/update/uninstall simulation
  - dependency and version validation
  - lifecycle hooks
- Per-user local persistence:
  - session snapshot
  - settings
  - VFS snapshot
  - permission grants

## Monorepo Layout

```text
client/
  src/
    apps/                  # app implementations (browser, file manager, notes, docs, boards, settings, app store)
    components/            # shared UI components (window, terminal, task manager, login)
    config/                # app/window manifest and desktop icon config
    features/
      accounts/            # local profile and session services
      app-registry/        # package catalog/version/dependency domain
      background-jobs/     # scheduler
      notifications/       # notification domain and flyout
      permissions/         # role guards + local grants
      settings/            # settings defaults, normalization, storage, theming
      shell/               # top bar, dock, launcher, flyouts
      window-manager/      # window lifecycle/geometry/focus/selectors
      productivity/        # shared notes/docs/boards repository + autosave
    stores/                # Zustand orchestration stores
    vfs/                   # virtual filesystem core + service
    worker/                # kernel.worker.ts metrics/process simulation
server/
  src/
    config/                # env loader
    plugins/               # cors/rate-limit
    routes/                # /health and /api/ai
    services/              # OpenAI wrapper + ai service
docs/
  architecture-map-phase12.md
  brand.md
  phase1-architecture.md
  phase11-performance-hardening.md
  phase12-release-readiness.md
feature_plan.md            # new functional roadmap checklist
supabase_plan.md           # deferred persistence/auth roadmap (out of scope now)
```

## Backend API

- `GET /health` -> health + timestamp
- `POST /api/ai` -> `{ reply, mode }`
  - `mode: "mock"` when `OPENAI_API_KEY` is missing
  - `mode: "live"` when key is configured

## Local Development

Prerequisites:

- Node.js 18+
- npm

Install:

```bash
npm install
```

Environment setup:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Run both workspaces:

```bash
npm run dev
```

Workspace URLs:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

Quality checks:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Notes for OS/HCI Scope

- This repository intentionally uses local simulation over backend persistence for now.
- The next major milestone is functional realism and interaction quality, not auth/database integration.
- See `feature_plan.md` for the done-vs-needed checklist.
