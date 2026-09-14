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

## Status

Repository initialized. MVP foundation is being implemented via GitHub Issues and pull requests.
