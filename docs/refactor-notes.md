# Refactor Notes

## Baseline Scan

Date: 2026-02-28

Repo shape:
- npm workspaces monorepo with `client` and `server`
- Client: React 18 + Vite + Zustand + TypeScript
- Server: Fastify + TypeScript
- No shared package yet; client/server contracts are duplicated inline

Entry points:
- Client app bootstrap: `client/src/main.tsx`
- Client app shell switcher: `client/src/App.tsx`
- Kernel worker: `client/src/worker/kernel.worker.ts`
- Desktop shell: `client/src/components/DesktopShell.tsx`
- Window manager state: `client/src/stores/windowStore.ts`
- File manager app: `client/src/apps/file-manager/FileManagerApp.tsx`
- VFS core: `client/src/vfs/vfsCore.ts`
- Server bootstrap: `server/src/index.ts`
- Server composition root: `server/src/server.ts`
- AI route: `server/src/routes/ai.ts`

## Baseline Commands

Commands run from repo root:
- `npm.cmd run lint`
- `npm.cmd run build`

Initial results:
- `lint` failed because no ESLint config was present for the client workspace.
- `build` failed in this sandbox during the client Vite step with `spawn EPERM` when Vite attempted to start `esbuild`.
- `install` was not rerun because `node_modules` was already present.
- No dedicated typecheck script existed at the root or server workspace.

Current validation status after refactor:
- `npm.cmd run lint`: passes
- `npx.cmd tsc -p client\tsconfig.json --noEmit`: passes
- `npx.cmd tsc -p server\tsconfig.json --noEmit`: passes
- `npm.cmd run build`: still blocked in this sandbox by Vite/esbuild spawn restrictions

## Original Hotspots

Client architecture concentration:
- `client/src/stores/windowStore.ts` owned window lifecycle, focus, z-order, maximize/minimize, and geometry updates in one file.
- `client/src/apps/browser/BrowserApp.tsx` mixed view rendering, global keyboard listeners, navigation policy, toast state, and direct store mutation.
- `client/src/stores/fsStore.ts` combined navigation, selection, view state, mutation commands, filtering, and error handling in one Zustand store.
- `client/src/worker/kernel.worker.ts` defined message shapes inline with no protocol versioning or validation.

Render churn risks:
- `client/src/components/Taskbar.tsx` subscribed to the full `windows` object and recomputed app state for every render.
- `client/src/components/desktop/DesktopWindows.tsx` rendered in `Object.values` order instead of explicit z-order order.
- `client/src/apps/file-manager/FileManagerApp.tsx` pulled a large slice of the file store without selectors.

Server structure issues:
- `server/src/server.ts` registered plugins and routes inline.
- AI route owned request parsing, mock/live mode branching, env access, and error shaping in one function.

## Constraints And Risks

- Preserve all visible flows: loading -> login -> desktop, taskbar behavior, file manager actions, browser behavior, and terminal command outputs.
- Do not move `OPENAI_API_KEY` to the client under any condition.
- Do not alter window drag/resize/minimize/maximize semantics while extracting helpers.
- Keep worker tick cadence at 1s and preserve current UI update frequency.
- Avoid path aliases unless both Vite and TypeScript are updated together and imports stay stable.
- Browser app has global keybindings; refactors must keep their scope and side effects unchanged.
- The workspace already contains an untracked `prompt.txt`; do not modify or remove it.

## Completed Safe Improvements

- Added `docs/architecture.md`, `docs/refactor-plan.md`, and this notes file.
- Added repo ESLint configuration and aligned client node-side config files with `tsconfig.node.json`.
- Extracted pure window-manager helpers into `client/src/features/window-manager`.
- Formalized kernel worker message contracts in `client/src/features/kernel`.
- Moved VFS navigation/list derivation into `client/src/features/vfs`.
- Extracted browser tab creation and navigation helpers under `client/src/apps/browser`.
- Reduced broad Zustand subscriptions in hot UI surfaces.
- Modularized Fastify plugin and AI service composition.
- Removed one unused legacy window component: `client/src/components/DraggableWindow.tsx`.

## Remaining Trade-Offs

- Worker updates still send full process snapshots every second.
- Browser app still contains keyboard shortcut orchestration and some store mutation glue.
- No end-to-end or smoke automation exists yet.
- Root build cannot be fully validated inside this sandbox because Vite requires an `esbuild` child process that is denied here.
