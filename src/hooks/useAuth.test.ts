import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth hook', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should initialize with isAuthenticated false if no apiKey', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should initialize with isAuthenticated true if apiKey exists', () => {
    sessionStorage.setItem('apiKey', 'test-key');
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set isAuthenticated to true on login', () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.login('test-key');
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem('apiKey')).toBe('test-key');
  });

  it('should set isAuthenticated to false on logout', () => {
    sessionStorage.setItem('apiKey', 'test-key');
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('apiKey')).toBeNull();
  });
});
