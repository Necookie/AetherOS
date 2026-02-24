# AetherOS - Client (Frontend)

The visual operating system shell for the AetherOS simulator.

## Tech Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Zustand (State Management)
- Web Worker (Simulated OS Environment)
- xterm.js (Terminal)

## Setup
1. Copy `.env.example` to `.env`. Ensure it points to the server url.
   ```bash
   cp .env.example .env
   ```
2. Install dependencies from the project root:
   ```bash
   npm install
   ```

## Running the Client
Start the application from the root project folder using `npm run dev`, or locally via:
```bash
npm run dev
```

This will run Vite on `http://localhost:5173`.
