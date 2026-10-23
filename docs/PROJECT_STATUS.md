# Project Status

**Last updated:** 2026-10-23

## Current state

- The initial Next.js App Router and TypeScript scaffold is in place.
- The PRD, system, database, and API design documents are present under `docs/`.
- Core application and V1 integration dependencies are recorded in `package.json` and `package-lock.json`.
- The scaffold home page was reached successfully at `http://localhost:3000` (HTTP 200).
- The public marketing homepage is implemented with the Stitch design as its visual reference and the PRD as the source for product claims.
- Homepage interactions have been manually checked, including the feature tabs, family task toggles, guest photo selection preview, account notices, and mobile navigation.
- The homepage header remains sticky while scrolling, and the mobile navigation toggle uses a close icon while open.
- Authentication and the wedding-management product features have not been implemented yet. Homepage sign-in and sign-up links are ready to connect to those routes.

## Development environment

On this Windows environment, Next.js's native SWC binary fails to load. The working local development command uses the matching WebAssembly fallback with Webpack:

```powershell
$env:NEXT_TEST_WASM_DIR = (Join-Path (Get-Location) 'node_modules/@next/swc-wasm-nodejs')
npm.cmd run dev -- --webpack --hostname 127.0.0.1 --port 3000
```

The local environment file is not committed. Add real service credentials to `.env.local` only when the corresponding integrations are implemented; `.env.example` is the safe template.

## Next planned work

Begin the PRD's Foundation phase:

1. Authentication and server-side sessions
2. Wedding creation
3. Wedding member management
4. Dashboard shell

Before implementing each feature, follow the API, database, and system design documents.
