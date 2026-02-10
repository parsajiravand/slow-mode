# Slow Mode

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Status: Early stage](https://img.shields.io/badge/status-early%20stage-yellow)](https://github.com/your-org/slow-mode)

> **Intentional pace. Better focus.**  
> A clean, professional approach to [replace with your tagline from canvas].

---

## What is Slow Mode?

*[Paste your concept brief from the canvas here. 1–2 paragraphs on problem + solution.]*

**In short:** Slow Mode helps [who] [do what] by [how], so that [outcome].

---

## Why now?

*[Optional: 1–2 bullets on timing / market / trend.]*

- The need for [X] has never been clearer.
- [Your second “why now” point.]

---

## Quick Start

```bash
# Clone
git clone https://github.com/your-org/slow-mode.git
cd slow-mode

# Install
npm install

# Run CLI
npm start                 # show status
npm start -- on           # enable
npm start -- off          # disable
```

**Requirements:** Node.js 18+

**Use as a library:** see [How to use](docs/USAGE.md) for install, CLI, and API.

**Try the sample app:** `npm run example` — runs [examples/run.js](examples/run.js) (enable, hooks, reportFailure, disable). See [examples/README.md](examples/README.md).

**React example:** [examples/react-example/](examples/react-example/) — Vite + React app with a `useSlowMode` hook, enable/disable UI, and simulated UX issue reporting. Run: `npm run build` then `cd examples/react-example && npm install && npm run dev`.

**How it helps:** [How Slow Mode improves your project and app](docs/HOW_IT_IMPROVES.md) — catch perf issues before users, test under device/network profiles, get actionable failure reasons, and improve real-world UX.

---

## Screenshots

*[Add mockups or UI screenshots when ready.]*

| Concept / UI | Description |
|--------------|-------------|
| *(placeholder)* | Main experience |
| *(placeholder)* | Settings / profiles |

---

## Project structure

```
slow-mode/
├── README.md           # This file
├── package.json        # Package config and scripts
├── tsconfig.json
├── bin/cli.js          # CLI runner (loads dist/cli.js)
├── src/                # TypeScript source
│   ├── index.ts        # Public API (enable, disable, getStatus, reportFailure, reportMetric)
│   ├── state.ts        # Internal state (serializable, resettable)
│   ├── config.ts       # Option validation
│   ├── enable.ts       # enable() + CDP adapter wiring
│   ├── disable.ts      # disable() cleanup
│   ├── status.ts       # getStatus() diagnostics
│   ├── hooks.ts        # onMetric / onFailure
│   ├── ux-detector.ts  # Long task, blocked input, frozen UI, etc.
│   └── cdp/
│       ├── adapter.ts  # CDP adapter interface
│       └── mock.ts     # Mock adapter (tests / no-browser)
├── dist/               # Built output (npm run build)
├── docs/
│   ├── API_CONTRACT.md # API intent and contract
│   ├── ENGINE.md       # Phase → implementation map
│   ├── AGENT_PITCH.md
│   └── USAGE.md
└── test/               # Tests (npm test)
```

---

## Contributing

We welcome contributors. See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- **Core maintainer** – product direction, roadmap, releases  
- **Infra** – CI/CD, hosting, security  
- **DX / docs** – developer experience, tutorials, API docs  
- **Device profile contributors** – device-specific behavior and profiles  

---

## License

[MIT](LICENSE) unless otherwise noted.

---

*Slow Mode is in early stage. Feedback and early contributors are welcome.*
