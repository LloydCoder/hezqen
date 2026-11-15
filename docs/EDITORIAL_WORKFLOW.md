# HEZQEN Editorial Workflow State Machine

## Purpose and boundary

The editorial domain module defines allowed state transitions and enforces human authority at the domain boundary. It is provider-independent and does not yet replace a CMS, database, authentication system, or server-side authorization layer.

The current implementation is a pure TypeScript state machine with deterministic unit tests.

## Workflow states

`pitch → research → draft → fact_check → editorial_review → approved → scheduled → published`

Additional paths:
- Editorial review may return work to `draft`.
- A published item may move to `correction_required`, then reopen as a new `draft` revision.
- A published item may be archived.
- An approved item may publish immediately or be scheduled.

## Authority rules

- Pitch/research/draft work can be advanced by the assigned human author or assigned human editor.
- Fact-check completion must be recorded before an assigned human editor can move work into editorial review.
- Only the assigned human editor can approve.
- Author and editor must be different people; self-approval is rejected.
- Approval requires the existing publication policy: author/editor accountability, valid approval identity/time, completed fact-check, disclosure review and source references for material claims.
- Only the assigned human editor can publish.
- A scheduled item cannot publish before its scheduled time.
- Automated actors, services, readers and administrators do not receive editorial approval or publishing authority by default.
- Reopening a correction creates a new revision and clears previous approval, fact-check and disclosure-review state.

## Transition API

`transitionPublication(record, actor, targetStatus, options)` returns a discriminated result:

- `{ ok: true, record }` when the transition is permitted.
- `{ ok: false, blockers }` when the transition is rejected.

The caller must persist the returned record atomically and write an audit event. The current pure domain function does not persist records, authenticate actors, or provide database concurrency control.

## Production integration requirements

Before CMS release, the state machine must be invoked from server-only command handlers after authentication and authorization. Never trust client-supplied role, human status, author/editor IDs, approval timestamps, claims, or publication status. Derive actor identity and role from the authenticated server session and persisted assignments.

The CMS integration must add:
- Transactional state update plus immutable audit event.
- Optimistic concurrency/version checks to prevent stale transitions.
- Server-side role/assignment checks on every mutation endpoint.
- Direct API and IDOR tests for every transition.
- Idempotency for scheduled publishing and retryable jobs.
- A durable scheduler that can request publication but cannot grant editorial authority.
- Human editor approval as a required precondition at the actual publish boundary.
- Revision history and correction visibility.

The domain module is not production publishing enforcement until these controls are implemented and tested end to end.
