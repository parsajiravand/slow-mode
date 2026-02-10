/**
 * Public and internal types for Slow Mode engine.
 */

/** Device profile id (e.g. for CDP emulation). */
export type DeviceProfileId = string;

/** CPU throttle multiplier (e.g. 4 = 4x slower). */
export type CpuThrottleMultiplier = number;

/** Network profile id (e.g. '3g', 'slow-4g'). */
export type NetworkProfileId = string;

/** Enable options: constraints + optional hooks. */
export interface EnableOptions {
  device?: DeviceProfileId;
  cpu?: CpuThrottleMultiplier;
  network?: NetworkProfileId;
  memory?: number;
  hooks?: SlowModeHooks;
}

/** Hooks for metrics and UX failures. */
export interface SlowModeHooks {
  onMetric?: (metric: Metric) => void;
  onFailure?: (failure: UXFailure) => void;
}

/** A single performance metric event. */
export interface Metric {
  name: string;
  value: number;
  unit?: string;
  timestamp?: number;
}

/** UX failure kinds we detect. */
export type UXFailureKind =
  | 'long-task'
  | 'blocked-input'
  | 'frozen-ui'
  | 'delayed-interaction'
  | 'blank-screen';

/** Severity for prioritization. */
export type UXFailureSeverity = 'low' | 'medium' | 'high' | 'critical';

/** One detected UX failure. */
export interface UXFailure {
  kind: UXFailureKind;
  severity: UXFailureSeverity;
  reason: string;
  value?: number;
  unit?: string;
  timestamp?: number;
}

/** Public read-only status (diagnostics). */
export interface Status {
  active: boolean;
  device?: string;
  cpu?: string;
  network?: string;
  memory?: string;
  durationMs?: number;
  startTime?: number;
  detectedIssues: number;
  issues?: UXFailure[];
}

/** Internal state model (serializable, resettable). */
export interface SlowModeState {
  active: boolean;
  deviceProfile?: DeviceProfileId;
  cpuThrottle?: CpuThrottleMultiplier;
  network?: NetworkProfileId;
  memoryLimit?: number;
  startTime?: number;
  issues: UXFailure[];
}

/** CDP adapter: apply/remove constraints, no browser launch details. */
export interface CDPAdapter {
  applyConstraints(config: ConstraintConfig): Promise<void>;
  removeConstraints(): Promise<void>;
  startTracing(): Promise<void>;
  stopTracing(): Promise<void>;
}

/** Config passed to CDP adapter. */
export interface ConstraintConfig {
  device?: DeviceProfileId;
  cpu?: CpuThrottleMultiplier;
  network?: NetworkProfileId;
  memory?: number;
}
