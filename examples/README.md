# Sample app — using Slow Mode

This folder shows how to use the Slow Mode API from a Node script.

## Run the sample

From the **repo root**:

```bash
npm run example
```

Or build once, then run:

```bash
npm run build
node examples/run.js
```

## What the sample does

1. **getStatus()** — initial read-only diagnostics (inactive).
2. **enable(options)** — enables with device profile, CPU throttle, network, memory, and hooks (`onMetric`, `onFailure`).
3. **getStatus()** — while active: device, cpu, network, memory, duration, detected issues.
4. **reportFailure()** — simulates detecting a long task, blocked input, and blank screen; uses `parseLongTask`, `parseBlockedInput`, `createBlankScreenFailure` from the UX detector.
5. **reportMetric()** — custom metric (triggers `onMetric` hook).
6. **getMockState()** — shows what the mock CDP adapter recorded (for demo).
7. **disable()** — cleanup; then **getStatus()** again (inactive).

## Use in your own app

- **From this repo (dev):**  
  Build first (`npm run build`), then in your script:
  ```js
  import { enable, disable, getStatus, reportFailure } from '../dist/index.js';
  ```
- **From npm (when published):**
  ```bash
  npm install slow-mode
  ```
  ```js
  import { enable, disable, getStatus, reportFailure } from 'slow-mode';
  ```

See [docs/USAGE.md](../docs/USAGE.md) for the full API and hooks.
