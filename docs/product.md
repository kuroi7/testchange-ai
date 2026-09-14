# TestChange AI Product Spec

## Problem
QA engineers spend substantial time identifying which existing test cases are affected when requirements change, then rewriting those tests manually.

## Target User
- QA Engineer
- QA Lead
- Test Engineer
- Development Team

## Jobs To Be Done
When a requirement changes, identify impacted existing tests quickly and update them without omissions.

## Value Proposition
Compare a requirement change with existing test assets and surface likely impact plus suggested modifications.

## MVP Features
1. Requirement change input
2. Test case CSV import
3. Change impact analysis
4. Suggested modifications
5. Results review and CSV export

## Non Goals
- Test management system
- Test execution
- Bug tracking
- Billing
- Advanced RBAC
- Deep Jira/TestRail/Qase integrations

## User Flow
CSV Upload → Requirement Change Input → Analyze → Impact Results → Suggested Changes → CSV Export

## Data Model
### TestCase
- id
- title
- preconditions
- steps
- expectedResult

### AnalysisResult
TestCase fields plus:
- impact: high | medium | low | none
- reason
- suggestedModification

## Edge Cases
- malformed/empty CSV
- missing ID column
- file >5MB
- >5,000 rows
- long requirement text
- analyzer timeout/failure
- invalid structured AI output
- duplicate IDs
- spreadsheet formula injection on export

## Analytics Events
Future: Visit, CSV Uploaded, Analysis Started, Analysis Completed, Result Viewed, CSV Exported.

## Security
- Never expose AI API keys to the browser.
- Treat uploaded requirements/test cases as untrusted input.
- Do not log full confidential test/spec content in production.
- Sanitize exported CSV cells against spreadsheet formula injection.

## Acceptance Criteria for v0.1
- CSV can be uploaded and normalized.
- Requirement change can be entered.
- Analysis returns impact/reason/suggested modification.
- Results render in the UI.
- Results can be exported safely as CSV.
- CI verifies typecheck, tests, and build.
