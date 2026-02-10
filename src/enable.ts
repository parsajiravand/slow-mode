/**
 * enable(): apply constraints in order (device → CPU → network → memory), start tracing.
 */

import type { CDPAdapter } from './cdp/adapter.js';
import type { EnableOptions, Status } from './types.js';
import { validateEnableOptions } from './config.js';
import * as state from './state.js';
import { setAdapter } from './disable.js';
import { formatStatus } from './status.js';
import { setHooks } from './hooks.js';
import { mockAdapter } from './cdp/mock.js';

let defaultAdapter: CDPAdapter = mockAdapter;

/**
 * Set default CDP adapter (e.g. Playwright-backed). Default is mock.
 */
export function setDefaultAdapter(adapter: CDPAdapter): void {
  defaultAdapter = adapter;
}

/**
 * Enable Slow Mode: validate options, apply constraints in order, start tracing.
 * If already active, re-applies constraints (same session).
 */
export async function enable(options: EnableOptions = {}): Promise<Status> {
  const validated = validateEnableOptions(options);

  const config = {
    device: validated.device,
    cpu: validated.cpu,
    network: validated.network,
    memory: validated.memory,
  };

  const adapter = defaultAdapter;
  setAdapter(adapter);

  // If already active, disable first so we have a clean apply (optional: could document as "re-apply")
  if (state.isActive()) {
    await import('./disable.js').then((d) => d.disable());
  }

  state.clearIssues();
  setHooks(validated.hooks ?? null);
  state.setActiveSession({
    deviceProfile: config.device,
    cpuThrottle: config.cpu,
    network: config.network,
    memoryLimit: config.memory,
  });

  try {
    await adapter.applyConstraints(config);
    await adapter.startTracing();
  } catch (err) {
    await import('./disable.js').then((d) => d.disable());
    throw err;
  }

  const status = formatStatus();
  const hooks = validated.hooks;

  if (hooks?.onMetric) {
    hooks.onMetric({
      name: 'slow-mode-enabled',
      value: 1,
      timestamp: Date.now(),
    });
  }

  return status;
}
