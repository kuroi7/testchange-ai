# Release Checklist

Use this checklist before creating a production release.

## Code quality

- [ ] `npm install` succeeds
- [ ] `npm run lint` succeeds
- [ ] `npm run typecheck` succeeds
- [ ] `npm test` succeeds
- [ ] `npm run build` succeeds
- [ ] CI is green on the release PR

## Production configuration

- [ ] Production deployment is connected to the `main` branch
- [ ] HTTPS is enabled
- [ ] `ANALYZER_PROVIDER=openai`
- [ ] `OPENAI_API_KEY` is configured only as a server-side secret
- [ ] `OPENAI_MODEL=gpt-5.6-terra` (or an explicitly approved replacement)
- [ ] `OPENAI_ANALYSIS_TIMEOUT_MS=45000`
- [ ] `OPENAI_MAX_TEST_CASES=200`
- [ ] No secrets are committed to GitHub

## Critical user journey

- [ ] Open the production URL
- [ ] Upload a representative CSV
- [ ] Enter a requirement/specification change
- [ ] Start analysis
- [ ] Confirm the result identifies the analyzer as production AI, not Mock
- [ ] Confirm every input test case is represented exactly once
- [ ] Confirm impact levels are one of High / Medium / Low / None
- [ ] Confirm reason and suggested modification are displayed
- [ ] Export the results as CSV
- [ ] Open the exported CSV and confirm formula-like values are safely escaped

## Error and privacy checks

- [ ] Invalid CSV is rejected safely
- [ ] Missing required input is rejected safely
- [ ] Provider timeout/error produces a user-safe error
- [ ] Browser responses do not expose `OPENAI_API_KEY`
- [ ] Application logs do not contain full uploaded test/spec content
- [ ] Analysis requests use provider storage disabled where supported

## Browser / UX smoke checks

- [ ] Desktop layout is usable
- [ ] Mobile layout is usable enough for MVP
- [ ] Loading state is visible while analysis runs
- [ ] Mock/AI result mode is clearly distinguishable

## Release

- [ ] Production smoke test passed
- [ ] README reflects the current product status and deployment configuration
- [ ] Known limitations are documented
- [ ] GitHub Release `v0.1.0` is created
- [ ] Release notes include features, known limitations, how to try, and feedback instructions
