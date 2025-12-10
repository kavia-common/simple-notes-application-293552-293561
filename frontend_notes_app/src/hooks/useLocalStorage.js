/**
 * Hook for reading and writing JSON data to localStorage with debounce.
 * Provides get(), set(value), and replaceNow(value) to control persistence cadence.
 */
import { useCallback, useRef } from 'react';

const isBrowser = typeof window !== 'undefined';

/**
 * Debounce helper.
 */
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// PUBLIC_INTERFACE
export function useLocalStorage(key, defaultValue) {
  /** This is a public hook to persist app data under a stable key. */
  const debouncedRef = useRef(null);

  const get = useCallback(() => {
    if (!isBrowser) return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const write = useCallback((value) => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore quota or serialization errors
    }
  }, [key]);

  const set = useCallback((value) => {
    if (!debouncedRef.current) {
      debouncedRef.current = debounce(write, 300);
    }
    debouncedRef.current(value);
  }, [write]);

  const replaceNow = useCallback((value) => {
    write(value);
  }, [write]);

  return { get, set, replaceNow };
}
