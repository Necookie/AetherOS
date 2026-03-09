# AetherOS Architecture Map (Phase 12+)

## Runtime Topology

```text
App.tsx
  -> boot/login/session orchestration
  -> DesktopShell (ShellFrame)
      -> TopBar + Dock + Launcher + Flyouts + NotificationCenter
      -> DesktopIcons + WidgetBoard + DesktopWindows
          -> windowStore selectors
          -> lazy-loaded apps (browser, file manager, terminal, settings, app store, notes, docs, boards, task manager)
```

## Module Responsibilities

- `client/src/features/shell/*`
  - Shell layout, launcher, dock, top bar, quick settings, date-time flyout.
- `client/src/features/window-manager/*`
  - Window lifecycle, geometry, focus, z-order, keyboard helpers/selectors.
- `client/src/features/notifications/*`
  - Notification state, grouping, action invocation, center flyout.
- `client/src/features/background-jobs/*`
  - Scheduler and recurring system jobs (health/latency alerts).
- `client/src/features/settings/*`
  - Defaults, normalization, storage, and runtime token application.
- `client/src/features/accounts/*`
  - Local profile/session simulation and active-user scoping.
- `client/src/features/permissions/*`
  - Role-based guards and prompt-based local grants.
- `client/src/features/app-registry/*`
  - Simulated package catalog, dependency validation, lifecycle hooks.
- `client/src/features/productivity/*`
  - Shared repository/autosave/link parsing for Notes/Docs/Boards.
- `client/src/stores/*`
  - Zustand stores for windows, kernel, fs, browser, settings, session, app registry.
- `client/src/vfs/*`
  - Virtual filesystem core, path ops, snapshots, and persistence adapter.
- `client/src/worker/*`
  - Kernel metric/process simulation worker.
- `server/src/*`
  - Fastify server, CORS/rate limit plugins, health + AI routes.

## Extension Guide

### Add a New Desktop App

1. Create UI at `client/src/apps/<app-name>/<AppName>.tsx`.
2. Add metadata to `client/src/config/appManifest.ts`.
3. Register lazy window component in `client/src/config/windows.ts`.
4. Optionally add pinned order in `client/src/features/shell/model/appCatalog.ts`.
5. Add domain tests (`*.test.ts`) near implementation.

### Add a New Shell Surface

1. Add UI in `client/src/features/shell/components`.
2. Keep derivation logic in `client/src/features/shell/model`.
3. Wire open/close in `ShellFrame.tsx`.

### Add a New Notification Source

1. Publish through `notificationService.publish`.
2. Use stable `groupKey` values.
3. Keep action handlers idempotent.

### Add Role-Limited Actions

1. Define guard rules in `features/permissions/guards.ts`.
2. Use `permissionService.request` for promptable exceptions.
3. Surface denials via shell notifications.
