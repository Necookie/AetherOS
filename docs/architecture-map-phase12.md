# AetherOS Architecture Map (Phase 12)

## Runtime Topology

```text
App.tsx
  -> boot/login/session orchestration
  -> DesktopShell (ShellFrame)
      -> TopBar, Dock, AppLauncher, Flyouts, NotificationCenter
      -> DesktopIcons + WidgetBoard + DesktopWindows
          -> windowStore selectors
          -> lazy app windows (browser, file manager, terminal, docs, notes, boards, settings, app store, task manager)
```

## Module Responsibilities

- `client/src/features/shell/*`
  - Shell chrome, launcher, dock, top bar, quick settings, date/time flyouts.
  - Presentation models for catalog/calendar/launcher state.
- `client/src/features/window-manager/*`
  - Window lifecycle, focus ordering, geometry, drag bounds, selectors, keyboard shortcuts.
- `client/src/features/notifications/*`
  - Notification storage, grouping, publish/clear/read action workflow.
- `client/src/features/settings/*`
  - Settings defaults, normalization, storage, and wallpaper/theme application.
- `client/src/features/accounts/*`
  - Multi-account session selection, authentication state, and lock/logout flows.
- `client/src/features/background-jobs/*`
  - Scheduler used by shell-level system jobs and periodic notifications.
- `client/src/stores/*`
  - Zustand orchestration layer for windows, kernel metrics, session, filesystem, and browser state.
- `client/src/apps/*`
  - App-specific UI and domain logic, loaded lazily via app manifest.
- `client/src/vfs/*`
  - Virtual filesystem core and state transitions for file operations.
- `client/src/worker/*`
  - Kernel metric simulation in a Web Worker.
- `server/src/*`
  - Fastify API, plugin setup, AI route, OpenAI client wrapper with mock fallback.

## Extension Guide

### Add a New Desktop App
1. Create app UI in `client/src/apps/<app-name>/<AppName>.tsx`.
2. Add app metadata to [`client/src/config/appManifest.ts`](/C:/Users/dheyn/Documents/02_Dev/AetherOS/client/src/config/appManifest.ts).
3. Register default window config in [`client/src/config/windows.ts`](/C:/Users/dheyn/Documents/02_Dev/AetherOS/client/src/config/windows.ts).
4. Optionally pin in dock order via [`client/src/features/shell/model/appCatalog.ts`](/C:/Users/dheyn/Documents/02_Dev/AetherOS/client/src/features/shell/model/appCatalog.ts).
5. Add tests close to domain logic (`*.test.ts`).

### Add a New Shell Flyout or Surface
1. Place UI in `client/src/features/shell/components`.
2. Keep non-UI derivation logic in `client/src/features/shell/model`.
3. Reuse motion/interaction utilities from [`client/src/index.css`](/C:/Users/dheyn/Documents/02_Dev/AetherOS/client/src/index.css).
4. Wire open/close behavior in [`ShellFrame.tsx`](/C:/Users/dheyn/Documents/02_Dev/AetherOS/client/src/features/shell/components/ShellFrame.tsx).

### Add a System Notification Source
1. Publish through `notificationService.publish`.
2. Group by stable `groupKey`.
3. Prefer idempotent action callbacks for repeated invocations.
