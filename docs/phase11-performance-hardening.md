# Phase 11: Performance, Reliability, and Quality Hardening

## What Phase 11 Delivered

- Lazy loading/code splitting for app windows via recoverable lazy wrappers.
- Narrower Zustand subscriptions to reduce unnecessary shell rerenders.
- Window-level error recovery (`Retry window`, `Close app`) plus app-level reset fallback.
- Selector-focused tests for window-manager behavior.

## Last Recorded Build Snapshot

Historical measurements recorded in this phase:

- Before: main entry bundle around 652 kB (uncompressed)
- After: main entry bundle around 265 kB (uncompressed)
- Heavy modules deferred (Terminal, Browser, File Manager, etc.)

These values are phase measurements, not strict current guarantees.

## Why It Still Matters

This hardening is still active in the current architecture:

- Desktop startup cost remains lower due to deferred app loading.
- Failure isolation is improved through window-level boundaries.
- Rerender pressure remains reduced through selector/subscription isolation.

## Residual Risks

- Terminal first-open cost is still relatively high because of xterm/runtime footprint.
- No committed profiling trace set yet for repeatable interaction benchmarks.
- Project-wide lint can still contain unrelated baseline issues outside touched scope.

## Follow-up Direction

- Add repeatable shell interaction profiling harness and baselines.
- Further split terminal runtime path if first-open latency becomes a blocker.
- Add integration tests for window recovery and shell-level interactions.
