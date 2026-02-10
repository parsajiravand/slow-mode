import { useState, useCallback } from 'react';
import {
  getStatus,
  enable as enableEngine,
  disable as disableEngine,
  reportFailure as reportFailureEngine,
} from 'slow-mode';

/**
 * React hook for Slow Mode: status, enable, disable, reportFailure, refresh.
 * Use in any component; state is global (singleton engine).
 */
export function useSlowMode() {
  const [status, setStatus] = useState(getStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(() => {
    setStatus(getStatus());
  }, []);

  const enable = useCallback(async (options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const next = await enableEngine({
        ...options,
        hooks: {
          ...options.hooks,
          onFailure: (failure) => {
            options.hooks?.onFailure?.(failure);
            refresh();
          },
          onMetric: (metric) => {
            options.hooks?.onMetric?.(metric);
            refresh();
          },
        },
      });
      setStatus(next);
      return next;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const disable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await disableEngine();
      setStatus(next);
      return next;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reportFailure = useCallback((failure) => {
    reportFailureEngine(failure);
    refresh();
  }, [refresh]);

  return {
    status,
    loading,
    error,
    refresh,
    enable,
    disable,
    reportFailure,
  };
}
