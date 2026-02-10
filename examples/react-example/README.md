# Slow Mode — React Example

This is a **real-world example** of using Slow Mode inside a **React** app: enable/disable from the UI, show live status, and report UX failures (e.g. long tasks, blocked input) from user actions or from your own monitoring.

---

## What this example shows

1. **Using Slow Mode in React** — The app imports the `slow-mode` package and uses it in the browser. The engine runs in the same tab (with the mock CDP adapter); in production you might run the real CDP adapter in Node and drive the app from tests or dev tools.

2. **`useSlowMode` hook** — A custom hook that wraps `enable`, `disable`, `getStatus`, and `reportFailure`, and keeps **status** in React state so the UI updates when:
   - You enable or disable
   - The engine reports a metric or failure (via hooks)

3. **Enable / Disable from the UI** — Buttons call `enable({ device, cpu, network, memory })` and `disable()`. The status panel shows active state, constraints, duration, and issue count.

4. **Simulating UX issues** — Buttons that block the main thread (e.g. 80ms) then call `reportFailure(parseLongTask(80))` (and similar for blocked input, blank screen). This mimics what you’d do when you have real data from:
   - **PerformanceObserver** (long tasks, paint timing)
   - Your **RUM/monitoring** layer (e.g. “input delayed”, “blank screen”)
   - **React Profiler** or custom “slow render” detection

5. **Issues list** — When you report failures, they appear in `status.issues` and are rendered in the UI. In a real app you could send these to your backend or show them in a dev dashboard.

---

## How to run

From the **slow-mode repo root**:

```bash
# 1) Build the slow-mode package (required; the React app imports from dist/)
npm run build

# 2) Install dependencies for the React example (includes slow-mode via file:../..)
cd examples/react-example && npm install

# 3) Start the dev server
npm run dev
```

Open http://localhost:5174 (or the URL Vite prints). Then:

- Click **Enable Slow Mode** — status should show `active: true` and the constraint profile.
- Click **Simulate long task (80ms)** (or blocked input / blank screen) — the UI will block briefly, then the reported issue appears in the list.
- Click **Disable** — status resets to inactive.

---

## Real-world usage patterns

### 1. In-browser (this example)

- **Use case:** Dev dashboard or internal tool where you want to enable “slow mode” (constraints + reporting) and see issues in the same tab.
- **How:** Import `slow-mode` in React, use the **mock** adapter (default). Call `reportFailure` when you detect problems (e.g. from PerformanceObserver, or from a “simulate” action).
- **Limitation:** No real CPU/network throttling or device emulation; that requires a Node + browser environment (e.g. Playwright).

### 2. Node + browser (tests / CI)

- **Use case:** E2E tests or CI where you run Slow Mode in Node, launch a browser (Playwright/Puppeteer), apply real constraints, and collect failures.
- **How:** Your **Node** script calls `enable()` with a real CDP adapter, opens the React app in the controlled browser, and listens to `onFailure` / `onMetric`. The **React app** is the target; it doesn’t need to import Slow Mode unless you also want in-app reporting (e.g. `reportFailure` from PerformanceObserver callbacks).

### 3. Hybrid: React reports, Node drives

- **Use case:** Same as (2), but the React app also reports failures (e.g. from PerformanceObserver) so you get both “engine-detected” and “app-reported” issues.
- **How:** In the React app, use a **PerformanceObserver** (or similar) to detect long tasks / input delay, then call `reportFailure(parseLongTask(duration))`. You’d need a way to get the Slow Mode API into the page (e.g. the page is loaded by your Node script, which could inject a bridge or the app could postMessage to the Node side). This example keeps everything in one tab with the mock adapter for simplicity.

---

## Files in this example

| File | Purpose |
|------|--------|
| `src/useSlowMode.js` | React hook: `status`, `enable`, `disable`, `reportFailure`, `refresh`; wires engine hooks to `refresh()` so the UI updates. |
| `src/App.jsx` | UI: enable/disable, status panel, “Simulate” buttons that call `reportFailure` with detector helpers. |
| `package.json` | Depends on `slow-mode` via `file:../..` so the example uses the local package. |

---

## Dependencies

- **React 18** + **Vite** — build and dev server.
- **slow-mode** — `file:../..` (repo root). Build the root with `npm run build` before running the example.

For a production app you’d depend on the published `slow-mode` package from npm instead of `file:../..`.
