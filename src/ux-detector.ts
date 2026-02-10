/**
 * UX failure detection: thresholds, kinds, severity, human-readable reasons.
 */

import type { UXFailure, UXFailureKind, UXFailureSeverity } from './types.js';

/** Long task threshold (ms). */
export const LONG_TASK_MS = 50;

/** Blocked input threshold (ms). */
export const BLOCKED_INPUT_MS = 100;

/** Frozen UI threshold (ms no main-thread activity). */
export const FROZEN_UI_MS = 300;

/** Delayed interaction threshold (ms from event to first paint). */
export const DELAYED_INTERACTION_MS = 200;

export const failureDefinitions: Record<
  UXFailureKind,
  { threshold: number; unit: string; defaultSeverity: UXFailureSeverity }
> = {
  'long-task': { threshold: LONG_TASK_MS, unit: 'ms', defaultSeverity: 'medium' },
  'blocked-input': { threshold: BLOCKED_INPUT_MS, unit: 'ms', defaultSeverity: 'high' },
  'frozen-ui': { threshold: FROZEN_UI_MS, unit: 'ms', defaultSeverity: 'critical' },
  'delayed-interaction': {
    threshold: DELAYED_INTERACTION_MS,
    unit: 'ms',
    defaultSeverity: 'high',
  },
  'blank-screen': { threshold: 0, unit: 'ms', defaultSeverity: 'critical' },
};

function severityScore(s: UXFailureSeverity): number {
  switch (s) {
    case 'low':
      return 1;
    case 'medium':
      return 2;
    case 'high':
      return 3;
    case 'critical':
      return 4;
    default:
      return 0;
  }
}

/**
 * Score a list of failures (higher = worse). Used for ordering or gates.
 */
export function scoreFailures(failures: UXFailure[]): number {
  return failures.reduce((sum, f) => sum + severityScore(f.severity), 0);
}

/**
 * Create a UX failure from raw metric. Maps kind → reason and severity.
 */
export function createFailure(
  kind: UXFailureKind,
  value: number,
  timestamp?: number
): UXFailure {
  const def = failureDefinitions[kind];
  const severity = def.defaultSeverity;
  const reason = toHumanReason(kind, value);
  return {
    kind,
    severity,
    reason,
    value,
    unit: def.unit,
    timestamp,
  };
}

function toHumanReason(kind: UXFailureKind, value: number): string {
  switch (kind) {
    case 'long-task':
      return `Main thread blocked for ${value}ms (over ${LONG_TASK_MS}ms threshold)`;
    case 'blocked-input':
      return `Input blocked for ${value}ms (over ${BLOCKED_INPUT_MS}ms threshold)`;
    case 'frozen-ui':
      return `UI frozen for ${value}ms (over ${FROZEN_UI_MS}ms threshold)`;
    case 'delayed-interaction':
      return `Interaction to paint ${value}ms (over ${DELAYED_INTERACTION_MS}ms threshold)`;
    case 'blank-screen':
      return 'Blank screen detected';
    default:
      return `UX issue: ${kind}`;
  }
}

/**
 * Parse PerformanceObserver-style long task (duration) into a UX failure if over threshold.
 */
export function parseLongTask(durationMs: number, timestamp?: number): UXFailure | null {
  if (durationMs >= LONG_TASK_MS) {
    return createFailure('long-task', durationMs, timestamp);
  }
  return null;
}

/**
 * Parse blocked input duration into a UX failure if over threshold.
 */
export function parseBlockedInput(durationMs: number, timestamp?: number): UXFailure | null {
  if (durationMs >= BLOCKED_INPUT_MS) {
    return createFailure('blocked-input', durationMs, timestamp);
  }
  return null;
}

/**
 * Parse frozen UI duration into a UX failure if over threshold.
 */
export function parseFrozenUI(durationMs: number, timestamp?: number): UXFailure | null {
  if (durationMs >= FROZEN_UI_MS) {
    return createFailure('frozen-ui', durationMs, timestamp);
  }
  return null;
}

/**
 * Parse delayed interaction (event → paint) into a UX failure if over threshold.
 */
export function parseDelayedInteraction(durationMs: number, timestamp?: number): UXFailure | null {
  if (durationMs >= DELAYED_INTERACTION_MS) {
    return createFailure('delayed-interaction', durationMs, timestamp);
  }
  return null;
}

/**
 * Create a blank-screen failure (no duration).
 */
export function createBlankScreenFailure(timestamp?: number): UXFailure {
  return createFailure('blank-screen', 0, timestamp);
}
