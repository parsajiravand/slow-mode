/**
 * CDP adapter interface. Implement with Playwright/Puppeteer or mock for tests.
 */

import type { ConstraintConfig } from '../types.js';

export type { ConstraintConfig };

export interface CDPAdapter {
  applyConstraints(config: ConstraintConfig): Promise<void>;
  removeConstraints(): Promise<void>;
  startTracing(): Promise<void>;
  stopTracing(): Promise<void>;
}
