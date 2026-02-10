/**
 * disable(): stop tracing, remove constraints, reset state. Idempotent.
 */

import type { CDPAdapter } from './cdp/adapter.js';
import type { Status } from './types.js';
import * as state from './state.js';
import { formatStatus } from './status.js';
import { setHooks } from './hooks.js';

let adapter: CDPAdapter | null = null;

/**
 * Set the CDP adapter (used by enable; inject mock in tests).
 */
export function setAdapter(a: CDPAdapter | null): void {
  adapter = a;
}

/**
 * Disable Slow Mode: stop tracing, remove constraints, reset session.
 * Safe to call multiple times (idempotent).
 */
export async function disable(): Promise<Status> {
  if (!state.isActive()) {
    return formatStatus();
  }

  if (adapter) {
    try {
      await adapter.stopTracing();
    } catch {
      // best-effort: continue cleanup
    }
    try {
      await adapter.removeConstraints();
    } catch {
      // best-effort
    }
  }

  setHooks(null);
  state.reset();
  return formatStatus();
}
