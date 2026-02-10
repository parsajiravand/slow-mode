# How Slow Mode Improves Your Project and App

This doc explains **how** using Slow Mode improves both your **project** (development, testing, quality) and your **app** (what users experience).

---

## Improving the project (dev, CI, quality)

### 1. Catch performance issues before users do

- **Problem:** On a fast dev machine and good Wi‑Fi, your app feels fine. On a low-end device or slow 3G, it can feel broken (jank, frozen UI, blank screens).
- **How Slow Mode helps:** You run the same app under **simulated constraints** (e.g. Android low-end, 6× CPU throttle, Slow 3G). The engine reports **UX failures** (long tasks, blocked input, frozen UI, blank screen). You fix them in development instead of in production.
- **Outcome:** Fewer “works on my machine” bugs; more confidence that the app behaves under real-world conditions.

### 2. Make performance part of your workflow

- **Problem:** Performance is often checked only when something is obviously slow, or in a separate “performance sprint.”
- **How Slow Mode helps:** You can **enable** Slow Mode in local dev, in E2E tests, or in CI. Same API everywhere: `enable({ device, cpu, network })` and listen to `onFailure`. You define what “good enough” means (e.g. no critical issues, or issue count below a threshold).
- **Outcome:** Performance becomes a first-class signal, not an afterthought.

### 3. Test across device and network profiles

- **Problem:** Manually testing on many devices and networks is slow and hard to repeat.
- **How Slow Mode helps:** You **select a profile** (e.g. “Android low-end” + “Slow 3G”) and run your app or tests. The engine applies those constraints (via CDP when using a real browser). You get consistent, repeatable “bad network / weak device” runs.
- **Outcome:** Easier to cover low-end and poor-network scenarios without owning every device.

### 4. Get clear, actionable failure reasons

- **Problem:** Raw metrics (e.g. “LCP 4s”) are useful but don’t always tell you *why* the experience was bad.
- **How Slow Mode helps:** The **UX detector** turns metrics into **typed failures** with human-readable reasons (e.g. “Main thread blocked for 120ms (over 50ms threshold)”, “Input blocked for 150ms”, “Blank screen detected”). You can log them, send them to your backend, or fail CI when severity is too high.
- **Outcome:** You know *what* went wrong and can prioritize (e.g. fix critical and high first).

### 5. One API for dev, CI, and tools

- **Problem:** Different tools and scripts for “throttle CPU,” “simulate 3G,” and “collect long tasks” are hard to combine and maintain.
- **How Slow Mode helps:** One **programmatic API**: `enable` / `disable` / `getStatus` + `reportFailure` and hooks. Use it from a Node script, a React dev dashboard, E2E tests, or CI. Same semantics everywhere.
- **Outcome:** Less fragmentation; one place to document and evolve “how we test and measure under constraints.”

---

## Improving the app (what users experience)

### 1. Fewer long tasks and frozen UI

- **Problem:** Long tasks (>50ms) block the main thread; the UI can’t respond. Users see jank or “page not responding.”
- **How it improves the app:** By testing under Slow Mode and fixing every **long-task** and **frozen-ui** failure you care about, you reduce how often real users hit those conditions. The **thresholds** (e.g. 50ms, 300ms) are tunable so you can aim for “feels responsive” on your target devices.
- **Outcome:** Smoother interactions and fewer freezes.

### 2. More responsive input

- **Problem:** If the main thread is busy, clicks and taps are delayed. Users think the app is broken.
- **How it improves the app:** The **blocked-input** and **delayed-interaction** failures force you to optimize so that input is handled quickly (e.g. under 100ms). You do the work in Slow Mode until those failures disappear under your chosen profile.
- **Outcome:** Buttons and links feel instant; fewer “I had to tap twice” reports.

### 3. Fewer blank screens and “white flashes”

- **Problem:** Slow or heavy rendering can show a blank screen or flash of unstyled content.
- **How it improves the app:** **Blank-screen** is a critical failure in the detector. By running under constraints and fixing the causes (e.g. lazy loading, code splitting, reducing main-thread work), you reduce how often users see blank or broken frames.
- **Outcome:** More reliable first paint and transitions.

### 4. Better behavior on slow networks and low-end devices

- **Problem:** The app might be tuned for fast networks and powerful devices; on 3G or a budget phone it degrades badly.
- **How it improves the app:** Slow Mode lets you **target** those conditions (network profile + device profile + CPU/memory). You iterate until the app meets your bar (e.g. no critical issues, acceptable LCP) under those profiles. Real users in similar conditions get that improved experience.
- **Outcome:** More consistent quality for users on weak devices and poor networks.

### 5. Data to prioritize what to fix

- **Problem:** You know the app is “sometimes slow” but don’t know what to fix first.
- **How it improves the app:** **Severity** (low / medium / high / critical) and **failure kinds** (long-task, blocked-input, frozen-ui, blank-screen, delayed-interaction) give you a clear list. You can **score** failures and gate releases (e.g. “no critical issues in CI”). That directs effort to the issues that affect users most.
- **Outcome:** Better prioritization and fewer regressions.

---

## Putting it together

| Goal | Use Slow Mode to… | Result |
|------|-------------------|--------|
| **Ship with fewer perf bugs** | Run under constraints in dev/CI; fix every failure you care about. | Fewer user-reported freezes and blank screens. |
| **Support low-end and poor network** | Test with device + network profiles; tune until metrics and UX failures are acceptable. | App works better on real-world devices and networks. |
| **Make perf visible and repeatable** | One API in scripts, tests, and tools; same thresholds and failure types everywhere. | Performance is part of the process, not a one-off. |
| **Know what to fix first** | Use severity and failure kind; optionally fail CI or block release on critical issues. | Clear backlog and fewer regressions. |

---

## Next steps

- **In development:** Use the [React example](../examples/react-example/) or [Node sample](../examples/run.js) to enable Slow Mode, pick device/network, and watch `onFailure` and `getStatus()`.
- **In tests/CI:** Implement a real CDP adapter (e.g. Playwright), run your app in the controlled browser, and assert on issue count or severity (see [ENGINE.md](ENGINE.md)).
- **In production (optional):** Use the same **failure definitions and thresholds** in your RUM/monitoring so production metrics align with what you tested in Slow Mode.

Slow Mode improves the **project** by making performance testable and repeatable; it improves the **app** by guiding you to fix the issues that hurt real users under real conditions.
