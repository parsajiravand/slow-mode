# Slow Mode — API Intent & Contract (Phase 0)

## Decisions (API Intent)

| Question | Decision | Rationale |
|----------|----------|-----------|
| **Process-wide or per-session?** | **Per-session** | One Node process may run multiple test runs or tools; each gets its own Slow Mode session. Session can be singleton by default for simple CLI use. |
| **Browser-based or environment-based?** | **Browser-based** | Constraints (CPU, network, device) are applied via CDP to a browser instance. The engine runs in Node and controls the browser. |
| **Stateless or stateful?** | **Stateful** | We must track applied constraints, start time, and detected issues to support `getStatus()`, rollback, and hooks. State is serializable and resettable. |

## What the API Represents

- **`enable(options?)`** — Start a performance simulation: attach to (or launch) a browser, apply device/CPU/network/memory constraints in order, start tracing. Returns the new session state / diagnostics. Optional hooks: `onMetric`, `onFailure`.
- **`disable()`** — End the simulation: stop tracing, remove all constraints, restore browser to normal, release session. Idempotent.
- **`getStatus()`** — Read-only snapshot of the current session: active flag, applied constraints, duration, and any detected UX issues (long tasks, blocked input, etc.). No side effects.

## Final API Contract

### Types (summary)

```ts
// Session lifecycle
enable(options?: EnableOptions): Promise<Status>
disable(): Promise<Status>
getStatus(): Status

// Options when enabling
EnableOptions = {
  device?: DeviceProfileId
  cpu?: CpuThrottleMultiplier   // e.g. 4 or 6
  network?: NetworkProfileId    // e.g. '3g', 'slow-4g'
  memory?: number               // MB limit
  hooks?: {
    onMetric?: (metric: Metric) => void
    onFailure?: (failure: UXFailure) => void
  }
}

// Status (read-only diagnostics)
Status = {
  active: boolean
  device?: string
  cpu?: string
  network?: string
  memory?: string
  durationMs?: number
  startTime?: number
  detectedIssues: number
  issues?: UXFailure[]
}
```

### Invariants

- **enable**  
  - If already active, behavior is defined (e.g. no-op or re-apply). Documented as “re-apply” for same session.  
  - Constraints applied in order: device → CPU → network → memory; then tracing started.  
  - Partial failure: best-effort rollback of applied constraints; status reflects what is active.

- **disable**  
  - Idempotent: safe to call multiple times.  
  - Cleans: tracing stopped, CPU/network/memory restored, session cleared. No zombie CDP sessions.

- **getStatus**  
  - Pure read: no side effects.  
  - Returns current session snapshot; if inactive, `active: false` and minimal fields.

### Environment

- **Runtime:** Node.js (engine); browser is external, controlled via CDP (e.g. Playwright/Puppeteer).
- **Usage:** Programmatic, CLI, CI, dev tools — same API surface; CLI and CI call the same `enable`/`disable`/`getStatus`.

This document is the single source of truth for the public API contract.
