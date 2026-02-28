# Refactor Plan

## Goal

Restructure the codebase into clearer feature and domain boundaries while preserving current behavior, visuals, and public API shapes.

## Target Module Map

Client target shape:
- `client/src/features/desktop`
- `client/src/features/window-manager`
- `client/src/features/kernel`
- `client/src/features/vfs`
- `client/src/features/apps`
- `client/src/shared/types`
- `client/src/shared/utils`

Server target shape:
- `server/src/plugins`
- `server/src/routes`
- `server/src/services`
- `server/src/config`

Shared-contract target:
- Keep shared worker/client message types in client scope first.
- Introduce repo-level `shared/` only if both client and server start consuming the same types and the move stays non-breaking.

## Execution Order

1. Add architecture docs and baseline notes.
2. Extract window manager pure state transition helpers.
3. Formalize kernel worker protocol types and bridge utilities.
4. Split VFS and file-manager state logic into feature helpers/selectors.
5. Isolate app-specific domain logic for browser, terminal, and task manager.
6. Modularize Fastify plugins and AI service composition.
7. Update README to match the real post-refactor state.
8. Re-run validation and record any remaining blockers.

## Behavior-Preserving Rules

- Keep existing component exports usable while file moves happen.
- Prefer internal helper extraction before changing folder names visible to many importers.
- Maintain current route paths:
  - `GET /health`
  - `POST /api/ai`
- Maintain current AI response shapes:
  - mock: `{ reply, mode: 'mock' }`
  - live: `{ reply, mode: 'live' }`
  - error: `{ error: 'Failed to process AI request.' }`
- Keep browser external fallback behavior and pop-up blocked messaging unchanged.
- Keep terminal command handling intact; only move implementation details behind stable interfaces.

## Verification Checklist

Automated:
- `npm.cmd run lint`
- `npm.cmd run build`

Manual:
- Loading screen transitions to login
- Login transitions to desktop
- Desktop icons/taskbar open the same apps
- Window focus order and minimize/restore remain identical
- Task manager still updates process and metrics panels
- Terminal commands still produce the same outputs
- File manager still supports navigation, rename, delete, and view switching
- AI proxy still returns mock mode without `OPENAI_API_KEY`

## Known Baseline Blockers

- ESLint config is missing, so `lint` cannot currently validate source code.
- Client build is blocked in this sandbox by `spawn EPERM` during the Vite/esbuild step.

These blockers should be fixed or documented as part of repo hygiene, but code refactors should stay separable from tooling changes.
