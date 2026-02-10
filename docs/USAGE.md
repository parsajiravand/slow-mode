# How to use Slow Mode

## Install

**From the repo (development):**

```bash
git clone https://github.com/your-org/slow-mode.git
cd slow-mode
npm install
npm run build
```

**As a dependency (when published):**

```bash
npm install slow-mode
```

**Requirements:** Node.js 18+

---

## CLI

```bash
npm start                 # status (default)
npm start -- status       # show current diagnostics
npm start -- on           # enable (mock adapter)
npm start -- off          # disable (idempotent)
```

After publishing:

```bash
npx slow-mode status
npx slow-mode on
npx slow-mode off
```

---

## Programmatic API

### enable / disable / getStatus

```javascript
import { getStatus, enable, disable } from 'slow-mode';

// Sync: read-only diagnostics
const status = getStatus();
// { active, device, cpu, network, memory, durationMs, startTime, detectedIssues, issues? }

// Async: enable with constraints (device, cpu, network, memory) and optional hooks
const afterEnable = await enable({
  device: 'android-low',
  cpu: 6,
  network: '3g',
  memory: 512,
  hooks: {
    onMetric(metric) { console.log('metric', metric); },
    onFailure(failure) { console.warn('failure', failure); },
  },
});

// Async: disable (idempotent)
const afterDisable = await disable();
```

### Reporting UX failures

When you have performance/trace data, use the detector helpers and `reportFailure`:

```javascript
import {
  enable,
  disable,
  getStatus,
  reportFailure,
  reportMetric,
  parseLongTask,
  parseBlockedInput,
  createBlankScreenFailure,
} from 'slow-mode';

await enable({ hooks: { onFailure: (f) => console.warn(f.reason) } });

// Example: long task from PerformanceObserver
const failure = parseLongTask(120); // 120ms > 50ms threshold
if (failure) reportFailure(failure);

// Blank screen
reportFailure(createBlankScreenFailure());

const status = getStatus();
console.log(status.detectedIssues, status.issues);

await disable();
```

### Hooks

- **onMetric** — called when a metric is reported (e.g. `reportMetric(...)` or built-in “slow-mode-enabled”).
- **onFailure** — called when a UX failure is reported via `reportFailure(...)`.

Both only run while the session is active (after `enable`, before `disable`).

---

## Scripts

| Script    | Command         | Description              |
|-----------|-----------------|--------------------------|
| `build`   | `npm run build` | Compile TypeScript → dist|
| `start`   | `npm start`     | Build + run CLI          |
| `test`    | `npm test`      | Build + run tests        |

---

## Real CDP (browser) integration

Out of the box, Slow Mode uses a **mock** CDP adapter (no real browser). To use a real browser:

1. Implement the `CDPAdapter` interface (see `src/cdp/adapter.ts`) using Playwright or Puppeteer.
2. Call `setDefaultAdapter(yourAdapter)` before `enable()`.
3. See [docs/ENGINE.md](ENGINE.md) and [docs/API_CONTRACT.md](API_CONTRACT.md) for contract and lifecycle.
