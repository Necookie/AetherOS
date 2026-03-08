# Phase 11: Performance, Reliability, and Quality Hardening

## Measured Performance Improvements

Build baseline (before this phase):
- Command: `npm run build` in `client/`
- Main JS bundle: `dist/assets/index-C06Vf5hX.js` = **652.18 kB** (gzip **176.74 kB**)
- Result: single heavy entry chunk with Vite warning for >500 kB chunks

Build after this phase:
- Command: `npm run build` in `client/`
- Main JS bundle: `dist/assets/index-D9QO5UEu.js` = **265.07 kB** (gzip **80.89 kB**)
- Deferred chunks created for heavy app windows:
  - `TerminalWindow-TXM1VzCc.js` = 293.87 kB (gzip 74.29 kB)
  - `BrowserApp-BFiwrINa.js` = 27.50 kB (gzip 8.86 kB)
  - `FileManagerApp-N9sDiVmx.js` = 26.98 kB (gzip 7.27 kB)
  - Additional app chunks (`SettingsApp`, `AppStoreApp`, `TaskManagerWindow`, `NotesApp`, `DocsApp`, `BoardsApp`)

Impact summary:
- Initial entry bundle reduced by **387.11 kB** (about **59.4%** smaller uncompressed).
- Heavy app code now loads on demand when opening each app window.

## Architecture and Coupling Improvements

- Switched app window registration from eager static imports to lazy module loaders with recoverable wrappers.
- Reduced top-level shell rerender pressure by narrowing `ShellFrame` subscriptions and moving window-map subscriptions into localized components (`Dock`, `AppLauncher`).
- Reworked desktop window rendering to:
  - Subscribe to `windowOrder` only at container level
  - Render each window via per-window component selectors, minimizing unrelated rerenders

## Reliability Hardening

- Added per-window recovery boundary with:
  - Crash capture and error message surface
  - `Retry window` recovery action
  - `Close app` recovery action
- Added lazy-load fallback UI for window modules (`Loading module` state).
- Expanded app-level crash fallback with `Reset desktop session` recovery action in addition to full reload.

## Test and Verification

- Added selector coverage for new window selector behavior:
  - `client/src/features/window-manager/selectors.test.ts`
- Validation run results:
  - `npm run test`: passed (23 files / 62 tests)
  - `npm run build`: passed
  - Lint status:
    - Touched files lint clean
    - Project-wide lint still has pre-existing issues in `browserConnectivityService.test.ts`

## Hardening Checklist

- [x] Introduced lazy loading/code splitting for desktop apps.
- [x] Added granular fallback UI during lazy app boot.
- [x] Added window-level error boundaries with recovery flows.
- [x] Added app-level session recovery action.
- [x] Reduced unnecessary shell-level rerenders via selector/subscription isolation.
- [x] Added tests for selector changes.
- [x] Documented measured before/after build performance.

## Residual Risks

- Terminal app chunk remains large because of terminal runtime + `xterm`; startup cost is deferred but still significant when Terminal is first opened.
- No browser-level profiling trace artifacts (React Profiler flamecharts) are committed yet; current measurements are bundle/build based.
- Project-wide lint has unrelated existing failures outside touched scope.

## Suggested Follow-up for Phase 12

1. Add interactive performance profiling harness (React Profiler marks + scripted window open/drag scenarios) and store baseline traces in `docs/perf/`.
2. Split terminal runtime internals further (parser/engine/fit dependencies) to reduce first-open latency.
3. Add integration tests for crash recovery paths (window retry/close behavior) with a browser test runner.
4. Resolve remaining baseline lint issues and enforce clean lint in CI gate.
