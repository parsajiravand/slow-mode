import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getStatus,
  enable,
  disable,
  reportFailure,
  getMockState,
  resetMock,
  parseLongTask,
  parseDelayedInteraction,
  createBlankScreenFailure,
  scoreFailures,
  LONG_TASK_MS,
} from '../dist/index.js';

describe('slow-mode', () => {
  it('getStatus returns object with active and detectedIssues', () => {
    const status = getStatus();
    assert.strictEqual(typeof status, 'object');
    assert.strictEqual(typeof status.active, 'boolean');
    assert.strictEqual(typeof status.detectedIssues, 'number');
    assert.strictEqual(status.active, false);
  });

  it('enable returns active true and applies constraints via mock', async () => {
    resetMock();
    const status = await enable({ device: 'android-low', cpu: 6, network: '3g', memory: 512 });
    assert.strictEqual(status.active, true);
    assert.strictEqual(status.device, 'android-low');
    assert.strictEqual(status.cpu, '6x');
    assert.strictEqual(status.network, '3g');
    assert.strictEqual(status.memory, '512mb');
    assert.strictEqual(typeof status.durationMs, 'number');
    assert.strictEqual(status.detectedIssues, 0);

    const mock = getMockState();
    assert.strictEqual(mock.constraintsApplied?.device, 'android-low');
    assert.strictEqual(mock.constraintsApplied?.cpu, 6);
    assert.strictEqual(mock.tracingStarted, true);
  });

  it('disable clears state and is idempotent', async () => {
    await enable();
    let status = await disable();
    assert.strictEqual(status.active, false);
    assert.strictEqual(status.detectedIssues, 0);

    status = await disable();
    assert.strictEqual(status.active, false);

    const mock = getMockState();
    assert.strictEqual(mock.removeCalls >= 1, true);
    assert.strictEqual(mock.stopTracingCalls >= 1, true);
  });

  it('getStatus returns real diagnostics when active', async () => {
    resetMock();
    await enable({ cpu: 4 });
    const status = getStatus();
    assert.strictEqual(status.active, true);
    assert.strictEqual(status.cpu, '4x');
    assert.ok(status.startTime != null);
    assert.ok(status.durationMs != null);
    await disable();
  });

  it('reportFailure adds to status and detectedIssues', async () => {
    resetMock();
    await enable();
    const failure = parseLongTask(60);
    assert.ok(failure != null);
    reportFailure(failure);
    const status = getStatus();
    assert.strictEqual(status.detectedIssues, 1);
    assert.strictEqual(status.issues?.length, 1);
    assert.strictEqual(status.issues?.[0].kind, 'long-task');
    await disable();
  });

  it('parseLongTask returns failure when over threshold', () => {
    assert.strictEqual(parseLongTask(30), null);
    const f = parseLongTask(60);
    assert.ok(f != null);
    assert.strictEqual(f.kind, 'long-task');
    assert.ok(f.reason.includes(String(LONG_TASK_MS)));
  });

  it('parseDelayedInteraction returns failure when over threshold', () => {
    assert.strictEqual(parseDelayedInteraction(100), null);
    const f = parseDelayedInteraction(250);
    assert.ok(f != null);
    assert.strictEqual(f.kind, 'delayed-interaction');
  });

  it('createBlankScreenFailure returns critical failure', () => {
    const f = createBlankScreenFailure();
    assert.strictEqual(f.kind, 'blank-screen');
    assert.strictEqual(f.severity, 'critical');
  });

  it('scoreFailures aggregates severity', () => {
    const low = { kind: 'long-task', severity: 'low', reason: 'x' };
    const critical = { kind: 'blank-screen', severity: 'critical', reason: 'y' };
    assert.ok(scoreFailures([critical, low]) > scoreFailures([low]));
  });

  it('enable validates config and throws on invalid cpu', async () => {
    await assert.rejects(
      async () => enable({ cpu: 100 }),
      /cpu must be/
    );
  });

  it('enable with hooks calls onMetric', async () => {
    let metricSeen = false;
    await enable({ hooks: { onMetric: (m) => { metricSeen = true; assert.strictEqual(m.name, 'slow-mode-enabled'); } } });
    assert.strictEqual(metricSeen, true);
    await disable();
  });
});
