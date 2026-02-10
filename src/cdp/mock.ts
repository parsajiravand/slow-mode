/**
 * Mock CDP adapter for tests and environments without a real browser.
 * Applies no real constraints; records calls for assertions.
 */

import type { CDPAdapter } from './adapter.js';
import type { ConstraintConfig } from '../types.js';

export interface MockCDPState {
  constraintsApplied: ConstraintConfig | null;
  tracingStarted: boolean;
  removeCalls: number;
  stopTracingCalls: number;
}

const mockState: MockCDPState = {
  constraintsApplied: null,
  tracingStarted: false,
  removeCalls: 0,
  stopTracingCalls: 0,
};

export function getMockState(): Readonly<MockCDPState> {
  return { ...mockState };
}

export function resetMock(): void {
  mockState.constraintsApplied = null;
  mockState.tracingStarted = false;
  mockState.removeCalls = 0;
  mockState.stopTracingCalls = 0;
}

export const mockAdapter: CDPAdapter = {
  async applyConstraints(config: ConstraintConfig): Promise<void> {
    mockState.constraintsApplied = { ...config };
  },

  async removeConstraints(): Promise<void> {
    mockState.constraintsApplied = null;
    mockState.removeCalls += 1;
  },

  async startTracing(): Promise<void> {
    mockState.tracingStarted = true;
  },

  async stopTracing(): Promise<void> {
    mockState.tracingStarted = false;
    mockState.stopTracingCalls += 1;
  },
};
