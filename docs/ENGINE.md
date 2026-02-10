# Slow Mode Engine — Implementation Map

This doc maps the agent task breakdown to the codebase.

## Phase 0 — API Intent

- **Deliverable:** [docs/API_CONTRACT.md](API_CONTRACT.md)
- **Decisions:** Per-session, browser-based (CDP), stateful. `enable` / `disable` / `getStatus` contract and invariants.

## Phase 1 — State & Configuration

- **Deliverables:**
  - **State:** `src/state.ts` — singleton, serializable, resettable; `getState`, `setActiveSession`, `addIssue`, `reset`, `isActive`.
  - **Config:** `src/config.ts` — `validateEnableOptions` (cpu 1–20, memory 64–4096 MB).
  - **Types:** `src/types.ts` — `SlowModeState`, `EnableOptions`, `Status`, `ConstraintConfig`, etc.

## Phase 2 — enable(): Constraint Application

- **Deliverables:**
  - **enable:** `src/enable.ts` — validates options, sets adapter, applies constraints, starts tracing; uses mock by default.
  - **CDP interface:** `src/cdp/adapter.ts` — `CDPAdapter` (applyConstraints, removeConstraints, startTracing, stopTracing).
  - **Mock:** `src/cdp/mock.ts` — records calls for tests; swap for Playwright/Puppeteer later.

## Phase 3 — disable(): Clean Rollback

- **Deliverables:**
  - **disable:** `src/disable.ts` — stop tracing, remove constraints, clear hooks, reset state; idempotent.
  - **Lifecycle:** enable sets adapter and hooks; disable clears them and resets state.

## Phase 4 — getStatus(): Real Diagnostics

- **Deliverables:**
  - **Status:** `src/status.ts` — `formatStatus()` builds public `Status` from state (active, device, cpu, network, memory, durationMs, startTime, detectedIssues, issues).

## Phase 5 — UX Failure Detection

- **Deliverables:**
  - **Detector:** `src/ux-detector.ts` — thresholds (long-task 50ms, blocked-input 100ms, frozen-ui 300ms, delayed-interaction 200ms), `createFailure`, `parseLongTask`, `parseBlockedInput`, `parseFrozenUI`, `parseDelayedInteraction`, `createBlankScreenFailure`, `scoreFailures`.
  - **Reporting:** `reportFailure()` in `src/index.ts` adds to state and calls `onFailure` hook.

## Phase 6 — API Hardening & DX

- **Deliverables:**
  - **TypeScript:** Full codebase in TS; types exported from `src/index.ts`.
  - **Validation:** Config validation in `config.ts`; throws on invalid cpu/memory.
  - **Hooks:** `enable({ hooks: { onMetric, onFailure } })`; `reportFailure` / `reportMetric` call hooks when session active.

## Phase 7 — Testing

- **Deliverables:**
  - **test/index.test.js** — getStatus, enable (with mock state), disable (idempotent), getStatus when active, reportFailure, parseLongTask / parseDelayedInteraction / createBlankScreenFailure, scoreFailures, config validation, onMetric hook.
  - **Mock CDP** — tests assert on `getMockState()` (constraintsApplied, tracingStarted, removeCalls, stopTracingCalls).

## Next Steps (Real CDP)

To wire a real browser:

1. Implement `CDPAdapter` using Playwright or Puppeteer (applyConstraints → device emulation, CPU throttling, network conditions; start/stop tracing).
2. Call `setDefaultAdapter(playwrightAdapter)` before `enable()` (e.g. in CLI or test runner).
3. Feed PerformanceObserver / trace data into `parseLongTask`, `parseBlockedInput`, etc., and call `reportFailure()` so status and hooks get real issues.
