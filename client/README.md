# AetherOS Client

Frontend workspace for the AetherOS browser-based OS simulator.

## Stack

- React 18 + TypeScript
- Vite
- Zustand
- Tailwind CSS
- xterm.js
- Web Worker (kernel simulation)

## What This Workspace Implements

- Boot/login/desktop shell flow
- Window manager and desktop surfaces
- Core apps:
  - Terminal
  - Task Manager
  - File Manager
  - Browser
  - Settings
  - Notes, Docs, Boards
  - App Store simulation
- Notifications, widgets, quick settings/date-time flyouts
- Local per-user persistence (session/settings/vfs/permissions)

## Setup

From repo root:

```bash
npm install
cp client/.env.example client/.env
```

Default env:

- `VITE_API_URL=http://localhost:3000`

## Run

From repo root:

```bash
npm run dev --workspace=client
```

or run both client+server:

```bash
npm run dev
```

Client default URL: `http://localhost:5173`

## Scripts

```bash
npm run lint --workspace=client
npm run typecheck --workspace=client
npm run test --workspace=client
npm run build --workspace=client
```

## Scope Note

This workspace currently targets functional OS simulation for OS/HCI requirements.
No real auth or database integration is required in this phase.
