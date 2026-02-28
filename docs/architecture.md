# Architecture

## Overview

AetherOS is a two-workspace TypeScript monorepo:
- `client`: React/Vite desktop simulator UI
- `server`: Fastify API proxy for AI requests

The client simulates an OS-like shell with a loading flow, login screen, floating windows, a kernel metrics worker, and an in-memory virtual filesystem.

## Current Runtime Flow

Client boot:
1. `client/src/main.tsx` mounts `App`.
2. `client/src/App.tsx` initializes the kernel worker via `useKernelStore`.
3. `App` switches between loading, login, and desktop shell states.
4. `DesktopShell` renders desktop icons, ordered window instances, and the taskbar.

Window system:
- `client/src/stores/windowStore.ts` is now a thin Zustand layer over pure helpers in `client/src/features/window-manager/windowState.ts`.
- `client/src/components/system/Window.tsx` renders shell chrome and resize controls.
- `client/src/hooks/useWindowManager.ts` handles drag input using extracted geometry helpers.
- `client/src/config/windows.ts` maps taskbar launchers to app components.

Kernel metrics:
- `client/src/worker/kernel.worker.ts` runs a 1-second tick loop.
- `client/src/features/kernel/protocol.ts` defines the worker/client protocol and lightweight guards.
- `client/src/stores/useKernelStore.ts` owns the worker instance and exposes metrics/process actions to UI apps.

Virtual filesystem:
- `client/src/vfs/vfsCore.ts` implements the in-memory filesystem model.
- `client/src/vfs/vfsService.ts` seeds the filesystem.
- `client/src/features/vfs/fsState.ts` holds pure navigation/list derivation helpers.
- `client/src/stores/fsStore.ts` adapts VFS operations to file-manager UI state.

Apps:
- Terminal: `client/src/components/TerminalWindow.tsx` plus `client/src/components/terminal/*`
- Task Manager: `client/src/components/TaskManagerWindow.tsx`
- File Manager: `client/src/apps/file-manager/*`
- Browser: `client/src/apps/browser/*`

Server:
- `server/src/index.ts` loads env config and starts Fastify.
- `server/src/server.ts` assembles plugins and routes.
- `server/src/plugins/*` contains CORS and rate-limit registration.
- `server/src/routes/ai.ts` preserves the existing API surface.
- `server/src/services/aiService.ts` chooses mock or live AI behavior.

## Folder Map

Current client folders:
- `apps`: browser and file-manager feature folders
- `components`: shell screens, taskbar, windows, terminal/task-manager shells
- `features`: extracted helpers for window-manager, kernel protocol, and VFS state logic
- `stores`: Zustand stores for windowing, kernel, browser, and filesystem state
- `vfs`: filesystem core/service/types
- `worker`: kernel simulation worker
- `config`: app/window/desktop constants
- `types`: UI and app-level shared types
- `services`: HTTP client for AI proxy

Current server folders:
- `config`: env bootstrap
- `plugins`: Fastify plugin registration
- `routes`: Fastify route handlers
- `services`: OpenAI HTTP wrapper and AI mode orchestration

## Architectural Gaps

- No repo-level shared package yet for browser/client/server contracts.
- Worker updates still send full process snapshots each tick.
- Browser behavior still mixes some UI state and navigation state in `BrowserApp.tsx`.
- Persistence is not yet implemented for windows, VFS changes, or user/session state.
