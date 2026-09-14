# Architecture

## Overview
A single Next.js application hosts the UI and server-side analysis API.

Browser
→ Next.js UI
→ POST /api/analyze
→ Analyzer interface
→ Mock analyzer now / AI provider later

## Principles
- One deployable unit for the MVP.
- No database until persistence is proven necessary.
- Uploaded test/spec data is processed transiently.
- AI provider details stay server-side.
- Analyzer output follows a stable domain contract so providers can be swapped.

## Components
- `app/page.tsx`: CSV upload, requirement input, results, export.
- `app/api/analyze/route.ts`: request validation and analyzer orchestration.
- `lib/types.ts`: domain contract.
- `lib/analyzers/*`: analysis implementations.
- `lib/csv.ts`: safe export handling.

## Next step
Add a production AI analyzer with structured output and retain the deterministic mock for tests/local fallback.
