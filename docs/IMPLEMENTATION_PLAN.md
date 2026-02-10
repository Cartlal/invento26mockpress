# Invento 2026 - Voting System Implementation Plan

This document outlines the systematic plan to enhance the voting application with Redis caching, improved display features, and overall production readiness.

## Phase 1: Performance Optimization (Redis Integration)
- [x] **Setup Redis Connection**: Create a centralized Redis client configuration in `server/config/redis.js`.
- [x] **State Caching**: Implement Redis caching for the `GET /state` route to reduce MongoDB load on frequent display polls.
- [x] **Participant List Caching**: Cache the full list of participants for the admin and voting screens.
- [x] **Leaderboard Optimization**: Cache the aggregated leaderboard results with a short TTL (e.g., 60s) to handle high traffic during results reveal.
- [x] **Gallery Caching**: Implement per-participant gallery image caching to ensure smooth image transitions on the projector.
- [x] **Cache Invalidation Protocol**: Ensure cache keys are deleted/updated when data changes (e.g., state updates, participant edits, new votes).

## Phase 2: Display & UI Refinement
- [x] **Dynamic Display Router**: Enhance `Display.jsx` to handle state transitions between Standby, QR, Voting, and Results modes smoothly.
- [x] **Real-time Synchronization**: Use Socket.io to trigger immediate UI updates on the main display when the admin changes modes.
- [x] **Image Path Normalization**: Ensure all images (local and URL-based) use a consistent `SERVER_URL` prefix for reliable loading on all devices.
- [x] **QR Code Mode**: Redesign the QR view to match the "Spyverse" aesthetic (Red theme, static layout, inverted QR).

## Phase 3: Gallery Navigation & Control
- [x] **Gallery Manager**: Implement a dedicated component for admins to upload and manage character-specific gallery images.
- [x] **Navigation Controller**: Add "Next/Previous" and "First/Last" controls to the Gallery Controller for precise stage management.
- [x] **Projector Sync**: Ensure the main display's gallery view follows the admin's navigation commands instantly via WebSockets.

## Phase 4: Production Readiness
- [x] **Asset Consolidation**: Move hardcoded external assets into the project structure for self-contained deployment.
- [x] **Relative Pathing**: Replace absolute Windows paths with `__dirname` based relative paths.
- [x] **Deployment Config**: Configure `render.yaml` with necessary environment variables (MONGO_URI, REDIS_URL, etc.).
- [x] **Security Hardening**: Verify JWT roles and enforce strict access control on sensitive admin routes.

## Phase 5: Documentation & Handover
- [x] **README Overhaul**: Create a comprehensive setup guide and usage manual.
- [x] **Root Cleanup**: Organize project files into `docs/` and `server/` to remove clutter.
- [x] **Testing & Validation**: Perform full dry-run of the event flow (Standby -> Character Reveal -> Voting -> Results).
