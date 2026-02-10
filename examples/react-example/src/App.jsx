import { useState } from 'react';
import { useSlowMode } from './useSlowMode';
import {
  parseLongTask,
  parseBlockedInput,
  createBlankScreenFailure,
} from 'slow-mode';

// Device profiles for testing (engine accepts any string; real CDP would map these)
const DEVICE_PROFILES = [
  { value: '', label: '— No device emulation —' },
  { value: 'android-low', label: 'Android low-end (e.g. budget)' },
  { value: 'android-mid', label: 'Android mid (e.g. Pixel 5)' },
  { value: 'android-high', label: 'Android high-end (e.g. Pixel 7)' },
  { value: 'iphone-se', label: 'iPhone SE (small screen)' },
  { value: 'iphone-12', label: 'iPhone 12' },
  { value: 'iphone-14', label: 'iPhone 14 Pro' },
  { value: 'ipad-10', label: 'iPad 10"' },
  { value: 'galaxy-tab', label: 'Galaxy Tab' },
  { value: 'desktop-low', label: 'Desktop (low-end)' },
  { value: 'desktop', label: 'Desktop' },
];

const NETWORK_PROFILES = [
  { value: '', label: '— No network throttle —' },
  { value: 'offline', label: 'Offline' },
  { value: '2g', label: '2G' },
  { value: 'slow-3g', label: 'Slow 3G' },
  { value: '3g', label: '3G' },
  { value: 'fast-3g', label: 'Fast 3G' },
  { value: 'slow-4g', label: 'Slow 4G' },
  { value: '4g', label: '4G' },
  { value: 'fast-4g', label: 'Fast 4G' },
];

const CPU_PRESETS = [
  { value: '', label: '— No CPU throttle —' },
  { value: '1', label: '1× (no throttle)' },
  { value: '2', label: '2×' },
  { value: '4', label: '4×' },
  { value: '6', label: '6×' },
  { value: '10', label: '10×' },
  { value: '15', label: '15×' },
  { value: '20', label: '20× (max)' },
];

const MEMORY_PRESETS = [
  { value: '', label: '— No memory limit —' },
  { value: '128', label: '128 MB' },
  { value: '256', label: '256 MB' },
  { value: '512', label: '512 MB' },
  { value: '1024', label: '1 GB' },
  { value: '2048', label: '2 GB' },
  { value: '4096', label: '4 GB' },
];

function simulateLongTask(ms) {
  const start = performance.now();
  while (performance.now() - start < ms) {}
}

// Group issues by kind for a compact, scannable list
function IssuesList({ issues }) {
  const [expanded, setExpanded] = useState({});
  const groups = issues.reduce((acc, issue) => {
    const key = `${issue.kind}-${issue.severity}`;
    if (!acc[key]) acc[key] = { kind: issue.kind, severity: issue.severity, items: [] };
    acc[key].items.push(issue);
    return acc;
  }, {});
  const groupList = Object.values(groups);

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ fontSize: '0.9rem' }}>
      {groupList.map((group) => {
        const key = `${group.kind}-${group.severity}`;
        const count = group.items.length;
        const isExpanded = expanded[key];
        const severityColor =
          group.severity === 'critical'
            ? '#f87171'
            : group.severity === 'high'
              ? '#fbbf24'
              : group.severity === 'medium'
                ? '#a3a3a3'
                : '#737373';
        return (
          <div
            key={key}
            style={{
              marginBottom: '0.5rem',
              border: '1px solid #333',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(key)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#1a1a1e',
                border: 'none',
                color: '#e4e4e8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textAlign: 'left',
              }}
            >
              <span>
                <strong>{group.kind}</strong>
                <span style={{ color: severityColor, marginLeft: '0.35rem' }}>
                  ({group.severity})
                </span>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>× {count}</span>
              </span>
              <span style={{ color: '#666' }}>{isExpanded ? '▼' : '▶'}</span>
            </button>
            {isExpanded && (
              <ul
                style={{
                  margin: 0,
                  padding: '0.5rem 0.75rem 0.75rem 1.5rem',
                  background: '#0f0f12',
                  borderTop: '1px solid #333',
                  fontSize: '0.85rem',
                  color: '#a3a3a3',
                }}
              >
                {group.items.map((item, i) => (
                  <li key={i} style={{ marginBottom: '0.25rem' }}>
                    {item.reason}
                    {item.value != null && item.unit && (
                      <span style={{ color: '#666' }}> — {item.value}{item.unit}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

const inputStyle = {
  padding: '0.4rem 0.5rem',
  borderRadius: 6,
  border: '1px solid #333',
  background: '#1a1a1e',
  color: '#e4e4e8',
  fontSize: '0.9rem',
  minWidth: 180,
};

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

  const [device, setDevice] = useState('android-low');
  const [network, setNetwork] = useState('3g');
  const [cpu, setCpu] = useState('6');
  const [memory, setMemory] = useState('512');

  const handleEnable = () => {
    enable({
      device: device || undefined,
      network: network || undefined,
      cpu: cpu ? Number(cpu) : undefined,
      memory: memory ? Number(memory) : undefined,
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
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Options</h2>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            marginBottom: '1rem',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Device</span>
            <select
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              disabled={status.active}
              style={inputStyle}
            >
              {DEVICE_PROFILES.map(({ value, label }) => (
                <option key={value || 'none'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Network</span>
            <select
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={status.active}
              style={inputStyle}
            >
              {NETWORK_PROFILES.map(({ value, label }) => (
                <option key={value || 'none'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>CPU throttle</span>
            <select
              value={cpu}
              onChange={(e) => setCpu(e.target.value)}
              disabled={status.active}
              style={inputStyle}
            >
              {CPU_PRESETS.map(({ value, label }) => (
                <option key={value || 'none'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#888' }}>Memory limit</span>
            <select
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              disabled={status.active}
              style={inputStyle}
            >
              {MEMORY_PRESETS.map(({ value, label }) => (
                <option key={value || 'none'} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
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
          <IssuesList issues={status.issues} />
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
