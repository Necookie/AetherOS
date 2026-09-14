# AetherOS

AetherOS is a web-based OS simulator for OS/HCI coursework, built as a TypeScript monorepo. In production, Cloudflare Pages serves the application and Pages Functions provide its same-origin API. The Fastify workspace provides an equivalent local-development server.

## Current Scope

This project currently focuses on functional OS simulation only.

- Included: shell UX, windowing, process simulation, in-memory/local-persistent VFS, core apps, settings, notifications, and app lifecycle simulation.
- Excluded for now: real authentication, real database, and cloud file storage.

## Implemented Features

- Boot sequence: staged diagnostics screen -> lock/login screen -> desktop shell
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
  - copy, cut, paste, rename, move, delete, hidden toggle
  - conflict-safe paste with pending-cut feedback and destination status
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
  - permission center with per-profile grant review, source context, and revoke controls
- Shell command palette:
  - fuzzy ranked results across apps, settings destinations, task manager views, downloads, and session actions
  - quick-create commands for Notes, Docs, and Boards templates
  - full keyboard navigation with default focus, arrow selection, Enter execution, and Escape close
  - highlighted match fragments plus per-result metadata for status and action context
- Notifications + background jobs:
  - grouped notification center with typed actions and body deep links
  - smart notification flows that reuse open windows, restore minimized apps, and route into app context
  - periodic system-health and latency alerts with direct Task Manager/Browser destinations
- Download Manager:
  - dedicated window with grouped queue, progress bars, retry/cancel controls, and deterministic simulation ticks
  - browser-triggered downloads now flow through the manager, materialize into the VFS `Downloads` directory with duplicate-name handling, and expose open-file/open-folder/copy-path follow-up actions
  - shell entry point in the top bar plus notification milestones for complete/fail/retry events
- Boot diagnostics:
  - deterministic staged service startup with timing indicators
  - occasional non-blocking advisory warnings for demo realism
  - clean handoff into the existing login/session flow
- Productivity apps:
  - Notes, Docs, Boards
  - autosave, draft recovery, linked records, attachment path validation
  - shared template system with quick-create from app chrome and the shell command palette
  - Docs now supports structured blocks for headings, inline links, and checklist items with migration from legacy rich-text records
  - Boards now supports drag-and-drop card moves, in-column reordering, column reordering, and keyboard move fallbacks from focused drag handles
  - template starters include lecture notes, project briefs, sprint boards, and personal planning flows
  - shared internal clipboard for text copy/cut/paste across Notes and Docs
- App Store simulation:
  - install/update/uninstall simulation
  - dependency and version validation
  - lifecycle hooks
- Per-user local persistence:
  - session snapshot
  - settings
  - VFS snapshot
  - permission grants and revoke state

## Monorepo Layout

```text
client/
  src/
    apps/                  # app implementations (browser, file manager, downloads, notes, docs, boards, settings, app store)
    components/            # shared UI components (window, terminal, task manager, login)
    config/                # app/window manifest and desktop icon config
    features/
      accounts/            # local profile and session services
      app-registry/        # package catalog/version/dependency domain
      background-jobs/     # scheduler
      downloads/           # download queue simulation + manager service
      clipboard/           # shared typed clipboard state for text and file payloads
      notifications/       # notification domain and flyout
      permissions/         # role guards + local grants
      settings/            # settings defaults, normalization, storage, theming
      shell/               # top bar, dock, launcher, flyouts
      window-manager/      # window lifecycle/geometry/focus/selectors
      productivity/        # shared notes/docs/boards repository + autosave
    stores/                # Zustand orchestration stores
    vfs/                   # virtual filesystem core + service
    worker/                # kernel.worker.ts metrics/process simulation
server/                      # local-development API adapter + shared services
  src/
    config/                # env loader
    plugins/               # cors/rate-limit
    routes/                # /health and /api/ai
    services/              # shared OpenAI, AI, and search services
functions/                   # Cloudflare Pages Functions under /api/*
docs/
  architecture-map-phase12.md
  brand.md
  phase1-architecture.md
  phase11-performance-hardening.md
  phase12-release-readiness.md
feature_plan.md            # new functional roadmap checklist
supabase_plan.md           # deferred persistence/auth roadmap (out of scope now)
```

## API

Production requests use the same AetherOS origin and are handled by the Pages Functions in `functions/api/`. The Fastify workspace exposes the same behavior during local development.

- `GET /api/health` -> health + timestamp
- `POST /api/ai` -> `{ reply, mode }`
  - `mode: "mock"` when `OPENAI_API_KEY` is missing
  - `mode: "live"` when key is configured
- `GET /api/search?q=...` -> browser search results
  - `mode: "mock"` when `TAVILY_SEARCH_API_KEY` and `TAVILY_API_KEY` are missing
  - `mode: "live"` when Tavily is configured

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

`client/.env` is only needed for the two-process local development workflow. Production uses same-origin `/api/*` routes and does not require `VITE_API_URL`.

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

## Cloudflare Deployment

The Vite build is deployed to the existing `aetheros` Cloudflare Pages project. Files in `functions/api/` are bundled as same-origin Pages Functions.

Store production credentials as encrypted Pages secrets:

```bash
npx wrangler pages secret put TAVILY_SEARCH_API_KEY --project-name aetheros
npx wrangler pages secret put OPENAI_API_KEY --project-name aetheros
```

- `TAVILY_SEARCH_API_KEY` for live browser search; mock results are used when omitted.
- `OPENAI_API_KEY` for live AI replies; mock replies are used when omitted.

Production builds always call the same-origin `/api/*` functions. `VITE_API_URL` is read only in development.

Useful commands:

```bash
npm run dev:cloudflare
npm run deploy:cloudflare
npm run types:cloudflare
```

`wrangler.pages.jsonc` is the source of truth for direct Wrangler deployments and local Pages emulation. It is passed explicitly so it does not override the existing Git-connected project's dashboard settings. Rerun `npm run types:cloudflare` after changing bindings. For Git-based Cloudflare builds, use `npm run build:cloudflare` as the build command and `client/dist` as the output directory. The existing `aetheros.necookie.dev` custom domain remains attached to the Pages project.

Configure Cloudflare rate-limiting rules for `/api/search` and `/api/ai` to protect provider quotas. No request state is kept in the Pages Functions isolate.

## Notes for OS/HCI Scope

- This repository intentionally uses local simulation over backend persistence for now.
- The next major milestone is functional realism and interaction quality, not auth/database integration.
- See `feature_plan.md` for the done-vs-needed checklist.

## Roadmap Status

The following items are already implemented and reflected in the updated checklist:

- Window snapping with halves and quarter layouts
- Desktop and File Manager multi-select with marquee/modifier support
- Trash flow with restore and permanent delete
- Task Manager causal impact reporting from simulated app activity

Current work is now centered on the next 10 execution phases listed in `feature_plan.md` and mirrored as implementation prompts in `prompts/phase1.txt` through `prompts/phase10.txt`.
