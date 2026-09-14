# Architecture Decisions

## ADR-001: Use a single Next.js/TypeScript application for v0.1

### Decision
Use Next.js with TypeScript for both UI and server-side API routes.

### Why
- Fastest path to a public web MVP.
- One repository and one deployable unit.
- Easy server-side protection of AI credentials.
- Straightforward CI and hosting options.

### Alternatives
- Separate React frontend + API backend: more deployment and integration overhead for no MVP benefit.
- Rails: viable, but this MVP benefits from one lightweight TypeScript codebase and simple serverless deployment.

## ADR-002: No database in the first vertical slice

### Decision
Process uploaded data transiently and do not persist user test/spec content yet.

### Why
Reduces security/privacy surface and implementation time while validating the core value proposition.

## ADR-003: Analyzer abstraction with deterministic mock first

### Decision
Stabilize the analysis request/response contract before adding a paid AI provider.

### Why
CI, local development, and demos must not depend on credentials or paid API availability. The mock is explicitly labeled and is not presented as AI output.

## ADR-004: Use OpenAI Responses API with Structured Outputs for production analysis

### Decision
Add an `openai` analyzer provider behind the existing server-side analyzer contract. Use the Responses API with JSON Schema Structured Outputs. Keep `mock` as the default local/CI provider.

### Why
- Structured Outputs provides a machine-validated contract for impact, reason, and suggested modification.
- API credentials remain server-side and are never sent to the browser.
- The uploaded requirement/test content is treated as untrusted data and cannot override analyzer instructions.
- `store: false` is used for analysis requests because test cases and requirements may contain company-confidential content.
- Provider/model are configurable through environment variables so the product is not hard-coded to one model.

### Current limits
The first production path defaults to 200 test cases per AI analysis. This keeps latency and cost bounded while validating value. Larger suites will require batching or candidate-selection work in a later issue.
