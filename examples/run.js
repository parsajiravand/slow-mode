#!/usr/bin/env node
/**
 * Sample app: how to use Slow Mode programmatically.
 * Run from repo root: npm run example
 *
 * Demonstrates: enable with options, getStatus, hooks (onMetric, onFailure),
 * reportFailure + UX detector, disable.
 */

import {
  enable,
  disable,
  getStatus,
  reportFailure,
  reportMetric,
  parseLongTask,
  parseBlockedInput,
  createBlankScreenFailure,
  getMockState,
} from '../dist/index.js';

/** Log object without undefined keys for cleaner demo output. */
function log(obj) {
  const clean = (o) => {
    if (o == null || typeof o !== 'object') return o;
    if (Array.isArray(o)) return o.map(clean);
    return Object.fromEntries(
      Object.entries(o).filter(([, v]) => v !== undefined).map(([k, v]) => [k, clean(v)])
    );
  };
  console.log(JSON.stringify(clean(obj), null, 2));
}

async function main() {
  console.log('--- Slow Mode sample app ---\n');

  // 1) Initial status
  console.log('1) Initial getStatus():');
  log(getStatus());
  console.log('');

  // 2) Enable with constraints and hooks
  console.log('2) enable({ device, cpu, network, memory, hooks })');
  const status = await enable({
    device: 'android-low',
    cpu: 6,
    network: '3g',
    memory: 512,
    hooks: {
      onMetric(metric) {
        console.log('   [onMetric]', metric.name, metric.value);
      },
      onFailure(failure) {
        console.log('   [onFailure]', failure.kind, '—', failure.reason);
      },
    },
  });
  console.log('   Result:');
  log(status);
  console.log('');

  // 3) Status while active (duration, etc.)
  console.log('3) getStatus() while active:');
  log(getStatus());
  console.log('');

  // 4) Simulate detecting issues (e.g. from PerformanceObserver / trace)
  console.log('4) Simulated UX failures via reportFailure():');
  const longTask = parseLongTask(120);
  if (longTask) reportFailure(longTask);
  const blocked = parseBlockedInput(150);
  if (blocked) reportFailure(blocked);
  reportFailure(createBlankScreenFailure());
  reportMetric({ name: 'custom-metric', value: 42, unit: 'ms' });
  console.log('   getStatus() after reporting:');
  log(getStatus());
  console.log('');

  // 5) What the mock CDP adapter recorded (for demo)
  console.log('5) Mock CDP state (constraints we “applied”):');
  log(getMockState());
  console.log('');

  // 6) Disable (idempotent)
  console.log('6) disable()');
  const afterDisable = await disable();
  console.log('   Result:');
  log(afterDisable);
  console.log('');

  // 7) Final status
  console.log('7) getStatus() after disable:');
  log(getStatus());
  console.log('--- Done ---');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
