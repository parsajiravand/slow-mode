/**
 * Current session hooks (set by enable, cleared by disable).
 */

import type { SlowModeHooks } from './types.js';

let current: SlowModeHooks | null = null;

export function setHooks(hooks: SlowModeHooks | null): void {
  current = hooks;
}

export function getHooks(): SlowModeHooks | null {
  return current;
}
