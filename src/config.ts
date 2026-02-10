/**
 * Config schema and validation for enable options.
 */

import type { EnableOptions, CpuThrottleMultiplier } from './types.js';

const CPU_MIN = 1;
const CPU_MAX = 20;
const MEMORY_MIN_MB = 64;
const MEMORY_MAX_MB = 4096;

export interface ValidatedEnableOptions extends EnableOptions {
  cpu?: CpuThrottleMultiplier;
  memory?: number;
}

/**
 * Validate and normalize enable options. Throws on invalid values.
 */
export function validateEnableOptions(options: EnableOptions): ValidatedEnableOptions {
  const out: ValidatedEnableOptions = { ...options };

  if (options.cpu !== undefined) {
    const n = Number(options.cpu);
    if (!Number.isFinite(n) || n < CPU_MIN || n > CPU_MAX) {
      throw new RangeError(
        `slow-mode: cpu must be ${CPU_MIN}-${CPU_MAX}, got ${options.cpu}`
      );
    }
    out.cpu = n;
  }

  if (options.memory !== undefined) {
    const n = Number(options.memory);
    if (!Number.isFinite(n) || n < MEMORY_MIN_MB || n > MEMORY_MAX_MB) {
      throw new RangeError(
        `slow-mode: memory must be ${MEMORY_MIN_MB}-${MEMORY_MAX_MB} MB, got ${options.memory}`
      );
    }
    out.memory = Math.round(n);
  }

  if (options.device !== undefined && typeof options.device !== 'string') {
    throw new TypeError('slow-mode: device must be a string');
  }

  if (options.network !== undefined && typeof options.network !== 'string') {
    throw new TypeError('slow-mode: network must be a string');
  }

  return out;
}
