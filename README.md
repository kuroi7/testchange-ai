# TestChange AI

TestChange AI is a **Change-aware QA Agent** and **Test Maintenance Layer**.

It answers one question:

> When this requirement changes, which existing tests are affected, and how should they change?

## MVP

The v0.1 MVP focuses on one end-to-end workflow:

1. Upload existing test cases as CSV.
2. Enter a requirement/specification change.
3. Analyze impact with AI.
4. Review affected test cases and suggested modifications.
5. Export the reviewed result as CSV.

## Product boundary

This project is **not** a test management system. The MVP deliberately excludes test execution, bug tracking, organization management, billing, and deep Jira/TestRail/Qase integrations.

## Tech stack

- Next.js
- TypeScript
- Zod
- OpenAI Responses API for production analysis
- Vitest
- GitHub Actions

## Local development

```bash
npm install
npm run dev
```

The analyzer defaults to deterministic Mock mode unless production AI is explicitly enabled.

## Production AI configuration

Configure the following as server-side environment variables. Never commit real secrets.

```env
ANALYZER_PROVIDER=openai
OPENAI_API_KEY=<server-side secret>
OPENAI_MODEL=gpt-5
OPENAI_ANALYSIS_TIMEOUT_MS=45000
OPENAI_MAX_TEST_CASES=200
```

`OPENAI_MODEL` must be a model available to the OpenAI API project associated with `OPENAI_API_KEY`. If OpenAI returns HTTP 404, verify model access for that API project and change this value to an available model.

Without `ANALYZER_PROVIDER=openai`, the application intentionally uses Mock mode.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

The v0.1 deployment target is Vercel because the application is a single Next.js deployment unit.

Recommended production setup:

1. Import `kuroi7/testchange-ai` into Vercel.
2. Use `main` as the production branch.
3. Add the production environment variables listed above in Vercel project settings.
4. Deploy.
5. Run the checklist in `docs/release-checklist.md` against the production URL before creating `v0.1.0`.

After changing any production environment variable in Vercel, trigger a new production deployment so the new value is applied.

## Security and privacy

- Provider API credentials are server-side only.
- Requirement and test-case content is treated as untrusted model input.
- The application validates structured AI output before returning results.
- Production analysis requests disable provider-side storage where supported.
- The first MVP does not require a database and does not intentionally persist uploaded test/spec content.
- Provider diagnostics redact strings that resemble API credentials before they are shown.

## Known v0.1 limitations

- Production AI analysis is capped at a configurable number of test cases per request (default: 200).
- Large-suite candidate filtering/batching is not implemented yet.
- AI results may contain false positives or false negatives and require human review.
- Jira, TestRail, Qase, GitHub Issue/PR, and Azure DevOps integrations are not part of v0.1.
- Authentication, billing, and organization management are not part of v0.1.

## Product docs

- `docs/product.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `docs/release-checklist.md`

## Status

The core MVP and production AI analyzer are implemented. Production deployment and release smoke testing are tracked in GitHub Issue #5.
