import { useSlowMode } from './useSlowMode';
import {
  parseLongTask,
  parseBlockedInput,
  createBlankScreenFailure,
} from 'slow-mode';

function simulateLongTask(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
}

export default function App() {
  const {
    status,
    loading,
    error,
    enable,
    disable,
    reportFailure,
    refresh,
  } = useSlowMode();

  const handleEnable = () => {
    enable({
      device: 'android-low',
      cpu: 6,
      network: '3g',
      memory: 512,
    });
  };

  const handleSimulateLongTask = () => {
    simulateLongTask(80);
    const failure = parseLongTask(80);
    if (failure) reportFailure(failure);
  };

  const handleSimulateBlockedInput = () => {
    simulateLongTask(120);
    const failure = parseBlockedInput(120);
    if (failure) reportFailure(failure);
  };

  const handleSimulateBlankScreen = () => {
    reportFailure(createBlankScreenFailure());
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
        Slow Mode — React Example
      </h1>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Enable performance simulation, then simulate UX issues from the UI. In a real app you’d
        report failures from PerformanceObserver or your monitoring layer.
      </p>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            background: 'rgba(255,80,80,0.15)',
            borderRadius: 8,
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}
        >
          {error.message}
        </div>
      )}

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Controls</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleEnable}
            disabled={loading || status.active}
            style={buttonStyle}
          >
            Enable Slow Mode
          </button>
          <button
            onClick={disable}
            disabled={loading || !status.active}
            style={{ ...buttonStyle, background: '#333' }}
          >
            Disable
          </button>
          <button onClick={refresh} style={{ ...buttonStyle, background: '#333' }}>
            Refresh status
          </button>
        </div>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Status</h2>
        <pre
          style={{
            background: '#1a1a1e',
            padding: '1rem',
            borderRadius: 8,
            fontSize: '0.8rem',
            overflow: 'auto',
          }}
        >
          {JSON.stringify(
            {
              active: status.active,
              device: status.device,
              cpu: status.cpu,
              network: status.network,
              memory: status.memory,
              durationMs: status.durationMs,
              detectedIssues: status.detectedIssues,
            },
            null,
            2
          )}
        </pre>
      </section>

      {status.active && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            Simulate UX issues (real-world: from PerformanceObserver / monitoring)
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={handleSimulateLongTask} style={buttonStyle}>
              Simulate long task (80ms)
            </button>
            <button onClick={handleSimulateBlockedInput} style={buttonStyle}>
              Simulate blocked input (120ms)
            </button>
            <button onClick={handleSimulateBlankScreen} style={buttonStyle}>
              Report blank screen
            </button>
          </div>
        </section>
      )}

      {status.issues?.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
            Detected issues ({status.issues.length})
          </h2>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
            {status.issues.map((issue, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>
                <strong>{issue.kind}</strong> ({issue.severity}): {issue.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const buttonStyle = {
  padding: '0.5rem 0.75rem',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.9rem',
};
