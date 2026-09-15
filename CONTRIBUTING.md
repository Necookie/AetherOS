# Contributing to AetherOS

## Development

Use Node.js 22.12 or newer (under 25) and npm 11. Install dependencies with `npm install`, then run `npm run dev`.

## Before opening a pull request

```text
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
```

Keep changes focused, add tests for behavior changes, and include responsive or keyboard coverage when changing interactive UI. Do not commit secrets, generated output, browser profiles, or local environment files.

## Pull requests

Use a Conventional Commit-style title, explain the user-visible impact, and describe verification. Each pull request should represent one coherent feature or fix and must pass protected `main` checks.
