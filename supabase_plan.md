# Deferred Supabase Plan (Not In Current Scope)

Date: 2026-03-09

## Status

This document is a deferred roadmap only.

- Current phase: local-first functional OS simulation
- Not included now: real auth, real database, cloud storage
- Revisit this plan only after core OS/HCI functionality goals in `feature_plan.md` are satisfied

## Why Deferred

The project currently prioritizes:

- interaction quality
- OS behavior realism
- functional completeness for coursework demos

Auth/database integration would add implementation overhead without directly improving core OS/HCI interaction quality in this phase.

## Future Integration Goals (Later Phase)

When enabled in a future phase, Supabase can support:

- account identity and secure session management
- durable user settings and session restore
- persistent file metadata and cloud-backed blobs
- multi-device continuity

## Future Data Domains

Potential future tables/services:

- profiles
- user_settings
- session_snapshots
- folders
- files
- downloads
- storage_usage

## Migration Prerequisites

Do not start Supabase integration until these are done:

- stable VFS serialization contract
- stable session snapshot contract
- clear per-user namespace strategy
- explicit OS/HCI acceptance criteria met for local simulation

## Suggested Future Sequence

1. Add persistence adapters behind existing local stores.
2. Add server validation for file and session mutations.
3. Add cloud persistence with rollback-safe migration.
4. Add optional auth provider integration.

## Anti-Goals for Current Phase

- No login/signup backend flow
- No RLS/database policy work
- No cloud bucket wiring
- No server-side user data model

Stay focused on functional OS simulation first.
