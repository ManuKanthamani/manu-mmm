# Make My Marriage

Wedding planning application designed as a TypeScript modular monolith using Next.js.

## Getting started

Requirements: Node.js 20.9 or later and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000 to view the app. The initial scaffold does not need external service credentials.

## Structure

- `src/app` — pages, layouts, and REST route handlers.
- `src/modules` — product domains and application logic.
- `src/server` — server-side infrastructure and service adapters.
- `src/components` — shared UI components.
- `src/lib` — general utilities usable by client and server code.
- `src/styles` — shared styles.
- `docs` — product and technical design documents.

## Scripts

- `npm run dev` — development server.
- `npm run build` — production build.
- `npm run start` — production server.
- `npm run lint` — lint the codebase.
- `npm run typecheck` — check TypeScript types.
