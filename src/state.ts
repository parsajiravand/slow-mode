/**
 * Internal state store: singleton session, serializable, resettable.
 */

import type { SlowModeState, UXFailure } from './types.js';

let state: SlowModeState = createInitialState();

function createInitialState(): SlowModeState {
  return {
    active: false,
    issues: [],
  };
}

/**
 * Get current state (copy). Safe for serialization.
 */
export function getState(): Readonly<SlowModeState> {
  return { ...state, issues: [...state.issues] };
}

/**
 * Set state (used by enable/disable). Replaces current state.
 */
export function setState(partial: Partial<SlowModeState>): void {
  state = { ...state, ...partial };
  if (partial.issues !== undefined) state.issues = [...partial.issues];
}

/**
 * Mark session active and set constraint fields + start time.
 */
export function setActiveSession(config: {
  deviceProfile?: string;
  cpuThrottle?: number;
  network?: string;
  memoryLimit?: number;
}): void {
  state = {
    ...state,
    active: true,
    startTime: Date.now(),
    deviceProfile: config.deviceProfile,
    cpuThrottle: config.cpuThrottle,
    network: config.network,
    memoryLimit: config.memoryLimit,
  };
}

/**
 * Add a detected UX failure (append only).
 */
export function addIssue(failure: UXFailure): void {
  state.issues = [...state.issues, failure];
}

/**
 * Clear issues (e.g. on new enable). Does not change active/constraints.
 */
export function clearIssues(): void {
  state.issues = [];
}

/**
 * Reset session: inactive, no constraints, no issues. Used by disable().
 */
export function reset(): void {
  state = createInitialState();
}

/**
 * Check if session is active (for idempotent disable).
 */
export function isActive(): boolean {
  return state.active;
}
