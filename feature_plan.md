# AetherOS Feature Plan (Function-First, No Auth/DB)

Date: 2026-03-09

## Scope Lock

- No real authentication implementation
- No database integration
- No cloud storage integration
- Focus on OS simulation quality, interactivity, reliability, and HCI value

## Done (Implemented)

### Core Shell and Session

- [x] Loading -> lock/login -> desktop flow
- [x] Local profile-based login simulation (admin/member/guest)
- [x] Session lock/logout and profile switching
- [x] Per-user local state scoping

### Windowing and Desktop

- [x] Multi-window open/close/focus/z-order
- [x] Drag, resize, minimize, maximize, restore
- [x] Desktop icons with launch/focus behavior
- [x] Dock/launcher integration
- [x] Window-level crash recovery boundary

### Kernel + Process Simulation

- [x] Web Worker kernel tick loop
- [x] Simulated CPU/memory/disk/network metrics
- [x] Process list with app-linked process lifecycle
- [x] Simulated network latency metric
- [x] Task Manager with process/performance/network views

### Filesystem + Terminal

- [x] Virtual filesystem core with path ops and snapshots
- [x] Seeded directory tree and system/user paths
- [x] File Manager browse/rename/move/delete flows
- [x] Terminal built-ins (`ls`, `cd`, `cat`, `mkdir`, `touch`, `rm`, `mv`, `cp`, etc.)
- [x] Terminal history and autocomplete
- [x] VFS local persistence

### Browser Simulation

- [x] Tab model with open/close/switch
- [x] Address/navigation normalization
- [x] Unsafe scheme blocking
- [x] Embed vs external fallback handling
- [x] Simulated offline cache behavior
- [x] History/bookmark side panels

### Settings, Widgets, Notifications

- [x] Settings sections (appearance/desktop/accessibility/behavior)
- [x] Theme/wallpaper/custom palette controls
- [x] Accessibility toggles and checks
- [x] Widgets (clock/weather/system stats)
- [x] Notification center with grouping and actions
- [x] Background jobs emitting system alerts

### Productivity + App Lifecycle

- [x] Notes/Docs/Boards apps
- [x] Shared autosave and draft recovery
- [x] Cross-link parsing between records
- [x] Attachment path validation against VFS
- [x] App Store install/update/remove simulation
- [x] App dependency/version validation

## Needed for a Really Good OS Simulator (Next Priorities)

### P0 - Demo-Critical Functional Upgrades

- [x] Window snapping and tiling layouts (left/right/quarters)
- [x] Multi-select desktop/file operations with marquee and modifier keys
- [x] Recycle Bin/Trash flow with restore and permanent delete
- [x] Real Task Manager impact from active app actions (more causal metrics)
- [x] Global browser-safe keyboard shortcut map (launcher/app switcher/task manager/terminal/window actions) with remapping support
- [x] Consistent unsaved-change guards for Notes/Docs/Boards plus window close/minimize and session lock/logout flows

### P1 - OS Realism and HCI Quality

- [x] Boot diagnostics screen (services starting, timing, failures)
- [ ] Notification-to-action deep links across apps
- [ ] Download Manager simulation with queue/progress/fail/retry states
- [ ] Browser downloads into VFS `Downloads` directory (simulated pipeline)
- [ ] Clipboard simulation across apps and file manager operations
- [ ] Better permission UX (central permission panel + revoke controls)
- [ ] Robust command palette/launcher with fuzzy search and keyboard nav

### P2 - Productivity and Data Workflows

- [ ] Richer Docs editor (headings, links, checklist blocks)
- [ ] Boards drag-and-drop cards and reorder columns
- [ ] Notes/Docs/Boards templates and quick-create flows
- [ ] Cross-app "open linked record" jumps with split-view option
- [ ] Export/import for productivity records (JSON/Markdown)

### P3 - System Reliability and Observability

- [ ] Deterministic state restore test suite for session/settings/vfs
- [ ] Integration tests for shell interactions and flyout behavior
- [ ] Browser app resilience tests for offline/error transitions
- [ ] Performance budget checks in CI (bundle + interaction targets)
- [ ] In-app diagnostics panel (state snapshot + recent errors)

### P4 - Polish for Final Presentation

- [ ] Onboarding/tutorial overlays for first-time users
- [ ] Full power menu behavior (restart shell, lock, sign out)
- [ ] Better audio/haptic simulation hooks (optional)
- [ ] Demo scenarios ("student workflow", "developer workflow")
- [ ] Instructor-ready scripted walkthrough with expected outcomes

## Acceptance Targets for OS/HCI Subject

- [ ] Core tasks completable without guidance in under 2 minutes
- [ ] Error states provide actionable recovery options
- [ ] Keyboard-first usage covers all major flows
- [ ] Interaction latency feels immediate on common hardware
- [ ] System behavior is predictable and explainable during demo

## Out of Scope Until This Plan Is Mature

- [ ] Real auth provider integration
- [ ] Real database persistence layer
- [ ] Cloud user file storage

Keep these unchecked intentionally until functional objectives are complete.

## Today Focus (2026-03-10)

- [x] Phase 1 - Boot diagnostics screen with staged startup feedback
- [ ] Phase 2 - Notification action deep links into apps/windows
- [ ] Phase 3 - Download Manager simulation with queue/progress/retry UX
- [ ] Phase 4 - Browser download pipeline into VFS `Downloads`
- [ ] Phase 5 - Shared clipboard simulation across apps and file workflows
- [ ] Phase 6 - Permission Center with grant review and revoke controls
- [ ] Phase 7 - Launcher upgraded into a fuzzy command palette with keyboard navigation
- [ ] Phase 8 - Docs editor blocks for headings, links, and checklists
- [ ] Phase 9 - Boards drag-and-drop for cards and column ordering
- [ ] Phase 10 - Productivity templates and quick-create entry points
