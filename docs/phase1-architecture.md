# Phase 1 Architecture Notes (Current Baseline)

## Objective

Phase 1 established a feature-first shell architecture with clear domain boundaries and reusable UI primitives.
That foundation is still the active architecture in the current codebase.

## Stable Module Boundaries

- `client/src/features/shell/*`
  - Shell chrome and interaction surfaces: top bar, dock, launcher, flyouts.
  - Presentation models (`appCatalog`, `calendar`, `launcher`) remain pure and reusable.
- `client/src/features/window-manager/*`
  - Source of truth for window lifecycle, focus, geometry, z-order, and selectors.
- `client/src/design-system/*`
  - Token and primitive CSS layers used by shell and apps.
- `client/src/stores/*`
  - Zustand orchestration layer across windows, kernel, VFS, browser, session, and settings.

## Important Additions Since Initial Phase 1

- `features/notifications`: grouped notification center + action model.
- `features/background-jobs`: scheduler used for periodic system alerts.
- `features/accounts`: local profile/PIN session simulation with per-user storage scoping.
- `features/permissions`: role guards and local permission grants.
- `features/app-registry`: catalog, semver/dependency validation, lifecycle hooks.
- `features/productivity`: shared autosave/repository domain for Notes/Docs/Boards.

## Extension Points

- Add apps via:
  - `client/src/config/appManifest.ts`
  - `client/src/config/windows.ts`
- Add shell surfaces in `client/src/features/shell/components`.
- Keep derived logic in `client/src/features/shell/model`.
- Add role/permission rules in `client/src/features/permissions`.
- Extend app package simulation in `client/src/features/app-registry`.

## Guardrails

- Keep cross-feature contracts typed and explicit.
- Keep stores orchestration-focused; place pure logic in feature modules.
- Preserve per-user scoping for any new persisted local keys.
