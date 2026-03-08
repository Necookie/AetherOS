# Phase 1 Architecture Notes

## Overview
Phase 1 establishes a feature-first shell architecture and a design-system baseline for AetherOS while preserving existing app/window domains.

## Module Boundaries
- `client/src/features/shell/components`
  - Shell frame and layout composition (`ShellFrame`, `TopBar`, `Dock`, launcher and flyouts).
  - Desktop chrome is isolated from app implementations.
- `client/src/features/shell/model`
  - Shell-specific pure logic (`appCatalog`, `calendar`, icon mapping).
  - Shared data and logic for launcher, dock, and flyouts.
- `client/src/design-system`
  - Token and primitive CSS layers (`tokens.css`, `primitives.css`) plus typed constants (`tokens.ts`).
  - Provides stable extension points for future theming and spacing/radius/z-index changes.
- Existing domains kept intact:
  - `features/window-manager` remains source of truth for window behavior.
  - `stores/windowStore` remains the orchestration point for launching/focusing/minimizing windows.

## Extension Points
- Add new apps by updating `client/src/config/windows.ts`; dock and launcher pick them up through `appCatalog`.
- Add shell flyouts as independent components under `features/shell/components`.
- Adjust shell layering or dimensions through design tokens (`--shell-*`, `--ds-z-*`).
- Future theme variants can override token files without changing feature components.

## Quality Gates Added
- Client:
  - `npm run typecheck --workspace=client`
  - `npm run lint --workspace=client`
  - `npm run test --workspace=client`
- Server:
  - Added `typecheck` script (`tsc --noEmit`) for workspace-level validation.
