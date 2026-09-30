# Assignment-Based Access and Request Access Design

**Date:** 2026-09-30
**Scope:** Frontend migration for assignment-based teacher access, access requests, and day-based attendance.

## Goals

- Remove permission claims, permission presets, permission overrides, and all UI/API paths that depend on them.
- Derive teacher-facing action visibility from class/subject assignments and approved HOMEWORK/MARKS access requests.
- Add teacher request/cancel and admin approve/reject/revoke/direct-grant/tracking workflows.
- Match the new attendance day API and the revised academic-year, homework, exam, grade, and fee access rules.
- Continue treating the backend as the authority; show backend error messages and never infer permission from JWT claims.

## Access Architecture

Auth state will contain identity, role, and teacher/student profile IDs only. A shared access query will fetch the current teacher's assignments using the teacher profile ID and approved access requests using the user ID. Admins use role-based full access. Teacher features consume the shared assignment/grant data and apply their own rules for class teacher, subject teacher, and grant-only capabilities. Query invalidation/refetch follows every access-request mutation so approvals and revocations become visible without re-login.

A small request-access feature owns request types, API clients, query/mutation hooks, and the teacher/admin screens. Other features use its approved-access query or the shared access hook; they do not duplicate API contracts. Deep links from homework/marks errors carry the requested type, section ID, and subject ID into the request form. A 403 without a request-access CTA is still displayed using the backend's `message`.

## Request Access Workflows

Teacher routes provide a request form and paginated My Requests table. Sections come from the current academic year; subject options are filtered to the selected section's class level. Type, reason (trimmed, required, max 500), status filters, review/revoke details, and cancel-only-when-pending are represented directly in the UI.

Admin routes provide a paginated request queue with status/type/teacher/section/subject filters; approve, reject, and revoke dialogs; a direct-grant dialog targeting a teacher user ID; and a section+subject access-tracking view split into class teacher, assigned subject teachers, and approved extra grants. Grant rows show whether access came from a request or direct grant and allow revocation. Request and grant mutations invalidate request lists, approved access, and pending-count queries where present.

## Attendance Migration

Attendance APIs and types move from per-student PRESENT/ABSENT writes to day resources. The date-based screen defaults to today, restricts dates to today or earlier and to the current academic-year range when known, loads the day resource, defaults students to present, and submits only absent student IDs. Untaken days display a not-taken state; taken days show the last marker/time. Admins and class teachers can save/delete; other assigned teachers get a read-only roster. Delete is confirmation-protected.

Monthly summaries become available for assigned teachers and use the updated taken-days meaning without frontend recalculation. Student history consumes the flat date/section/status records and preserves newest-first ordering from the API.

## Feature Access and Removal Rules

- Homework creation/edit/delete visibility follows section class-teacher, section+subject subject-teacher, or approved HOMEWORK access; grant-only users can modify only their own homework (`createdBy.userId`). Homework 403s requesting HOMEWORK access include the prefilled form action.
- Exams remain visible to teachers through their assignment/grant-scoped list, but every exam mutation is admin-only. Marks reads/writes follow the assignment and approved MARKS rules; MARKS access errors include the prefilled form action.
- Academic-year management, section/subject writes, announcement writes, and all fee access are hidden/guarded according to the specified admin/student roles. Teacher flows that need an academic year use `/academic-years/current`.
- Remove preset screens, permission controls, old permission routes/menu entries, obsolete permission enums/types/helpers, and stale messages/endpoints. Teacher profiles no longer expose preset or override fields.

## Implementation Sequence

1. Remove JWT permission handling; add shared assignment/approved-grant access queries and role-only guard primitives.
2. Add request-access API/types/hooks and teacher/admin routes and workflows.
3. Replace attendance contracts, hooks, screen behavior, summary access, and student-history rendering.
4. Apply assignment/grant rules to homework and marks; restrict exam mutations and admin-only screens/fees.
5. Remove obsolete teacher preset/override UI and profile fields; sweep endpoint constants, error mappings, navigation, and stale strings.
6. Validate each slice with focused checks, then run TypeScript build, lint, production build, and searches for removed contract names/messages.

## Verification Criteria

- TypeScript build and production build pass; lint introduces no new errors.
- No frontend code decodes/stores/reads permission claims or calls removed endpoints.
- Attendance client types and requests contain no legacy `AttendanceStatus` request records or `/attendance/mark` call.
- Role-based routes/navigation hide admin-only and fee screens from teachers while keeping current academic year available to teacher workflows.
- Access-request mutations refresh the teacher's approved grants, and both access-required errors can open a prefilled request form.
- Errors from API responses display the backend `message`.

## Assumptions

- Existing assignment API response fields are sufficient to identify assignment role, section, and subject; implementation will align with the current API contract rather than inventing a backend shape.
- The supplied API response definitions are authoritative, including teacher profile ID versus user ID distinctions.
- This is a frontend-only change; backend behavior is assumed to be deployed alongside it.
