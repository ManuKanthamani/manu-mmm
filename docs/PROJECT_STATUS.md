# Project Status

**Last updated:** 2026-10-24

## Current state

- The initial Next.js App Router and TypeScript scaffold is in place.
- The PRD, system, database, and API design documents are present under `docs/`.
- Core application and V1 integration dependencies are recorded in `package.json` and `package-lock.json`.
- The scaffold home page was reached successfully at `http://localhost:3000` (HTTP 200).
- The public marketing homepage is implemented with the Stitch design as its visual reference and the PRD as the source for product claims.
- Homepage interactions have been manually checked, including the feature tabs, family task toggles, guest photo selection preview, account notices, and mobile navigation.
- The homepage header remains sticky while scrolling, and the mobile navigation toggle uses a close icon while open.
- Account creation, sign-in, forgot-password, and reset-password pages are implemented at `/create-account`, `/sign-in`, `/forgot-password`, and `/reset-password`.
- Authentication API routes support account creation, sign-in, password recovery, and password reset. Passwords are hashed with bcrypt; MongoDB stores users, hashed session tokens, hashed one-use reset tokens, and shared rate-limit counters.
- The marketing homepage links to the account creation and sign-in routes. The authenticated dashboard, session-aware route protection, wedding creation, and member management are still pending.
- Password recovery uses Resend. The response stays generic to avoid revealing whether an email belongs to an account; delivery must be checked in Resend logs when troubleshooting.

## Development environment

On this Windows environment, Next.js's native SWC binary fails to load. The working local development command uses the matching WebAssembly fallback with Webpack:

```powershell
$env:NEXT_TEST_WASM_DIR = (Join-Path (Get-Location) 'node_modules/@next/swc-wasm-nodejs')
npm.cmd run dev -- --webpack --hostname 127.0.0.1 --port 3000
```

The local `.env.local` file is ignored by Git and must not be committed. Authentication requires `MONGODB_URI`, `MONGODB_DB_NAME`, `SESSION_SECRET`, `RESEND_API_KEY`, and `EMAIL_FROM`. Set `APP_URL` to `http://localhost:3000` for local reset links and to the public app origin in deployment. For regular Resend delivery, `EMAIL_FROM` must use a verified domain; the Resend test sender is restricted to the Resend account email. `.env.example` contains placeholders only.

## Next planned work

Continue the PRD's Foundation phase:

1. Session resolution, route protection, and the authenticated dashboard shell
2. Wedding creation
3. Wedding member management

Before implementing each feature, follow the API, database, and system design documents.
