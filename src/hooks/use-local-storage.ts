
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize with the initialValue to ensure the first render on the client
  // matches the server-rendered output, preventing hydration errors.
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // This effect runs only on the client, after the component has mounted.
  // It safely reads the value from localStorage and updates the state.
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      // If a value is found in localStorage, parse and set it.
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      // If parsing fails, we keep the initialValue.
      // We don't log an error to avoid the Next.js error overlay in dev.
    }
  }, [key]);


  const setValue = useCallback((value: T) => {
    try {
      // The `value instanceof Function` check is for compatibility with useState's setter function.
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Handle potential errors, e.g., if localStorage is full.
    }
  }, [key, storedValue]);

  // This effect listens for changes in other tabs and updates the state.
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          // Gracefully handle parse error from other tabs/windows
          setStoredValue(initialValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}
