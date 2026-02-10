/**
 * Build public Status from internal state (real diagnostics).
 */

import type { Status } from './types.js';
import { getState } from './state.js';

export function formatStatus(): Status {
  const s = getState();
  const durationMs =
    s.active && s.startTime != null ? Date.now() - s.startTime : undefined;

  return {
    active: s.active,
    device: s.deviceProfile,
    cpu: s.cpuThrottle != null ? `${s.cpuThrottle}x` : undefined,
    network: s.network,
    memory: s.memoryLimit != null ? `${s.memoryLimit}mb` : undefined,
    durationMs,
    startTime: s.startTime,
    detectedIssues: s.issues.length,
    issues: s.issues.length > 0 ? [...s.issues] : undefined,
  };
}
