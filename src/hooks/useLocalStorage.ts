'use client';

import { useState, useEffect } from 'react';

/**
 * A safe localStorage hook that works with SSR
 * Returns [value, setValue, isLoading] similar to useState but with localStorage persistence
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Get value from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, isLoading];
}

/**
 * A simplified version for just getting localStorage values
 */
export function getLocalStorageItem(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * A simplified version for setting localStorage values
 */
export function setLocalStorageItem(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * A simplified version for removing localStorage values
 */
export function removeLocalStorageItem(key: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}
