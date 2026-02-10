/**
 * Slow Mode — public API.
 * Programmatic, CLI, CI, dev tools.
 */

import type { EnableOptions, Status, UXFailure, Metric } from './types.js';
import { enable as doEnable } from './enable.js';
import { disable as doDisable } from './disable.js';
import { formatStatus } from './status.js';
import * as state from './state.js';
import { getHooks } from './hooks.js';

export type { EnableOptions, Status, UXFailure, Metric, SlowModeHooks } from './types.js';
export type { ConstraintConfig, CDPAdapter } from './cdp/adapter.js';
export { mockAdapter, resetMock, getMockState } from './cdp/mock.js';
export { setDefaultAdapter } from './enable.js';
export {
  parseLongTask,
  parseBlockedInput,
  parseFrozenUI,
  parseDelayedInteraction,
  createBlankScreenFailure,
  createFailure,
  scoreFailures,
  LONG_TASK_MS,
  BLOCKED_INPUT_MS,
  FROZEN_UI_MS,
  DELAYED_INTERACTION_MS,
} from './ux-detector.js';

/**
 * Enable Slow Mode with optional constraints and hooks.
 */
export async function enable(options?: EnableOptions): Promise<Status> {
  return doEnable(options);
}

/**
 * Disable Slow Mode (idempotent).
 */
export async function disable(): Promise<Status> {
  return doDisable();
}

/**
 * Get current diagnostics (read-only).
 */
export function getStatus(): Status {
  return formatStatus();
}

/**
 * Report a UX failure (adds to status, calls onFailure hook if set).
 * Use from trace/performance analysis. No-op if session not active.
 */
export function reportFailure(failure: UXFailure): void {
  if (!state.isActive()) return;
  state.addIssue(failure);
  getHooks()?.onFailure?.(failure);
}

/**
 * Report a metric (calls onMetric hook if set). No-op if session not active.
 */
export function reportMetric(metric: Metric): void {
  if (!state.isActive()) return;
  getHooks()?.onMetric?.(metric);
}

export default { enable, disable, getStatus, reportFailure, reportMetric };
