import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThemeStore } from './themeStore';
import { themes, defaultTheme } from '@/data/themes';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset store state by re-creating it or manually setting it if needed.
    // Since zustand stores are global, we might need to reset.
    // For this simple test, we just set it back to default.
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setTheme(defaultTheme.name);
    });
  });

  it('should initialize with default theme', () => {
    const { result } = renderHook(() => useThemeStore());
    expect(result.current.currentTheme).toEqual(defaultTheme);
  });

  it('should change theme correctly', () => {
    const { result } = renderHook(() => useThemeStore());
    const newTheme = themes.find(t => t.name === 'light');
    
    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.currentTheme).toEqual(newTheme);
  });

  it('should fallback to default theme if invalid name provided', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setTheme('non-existent-theme');
    });

    expect(result.current.currentTheme).toEqual(defaultTheme);
  });
  
  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useThemeStore());
    
    act(() => {
      result.current.setTheme('midnight');
    });

    const stored = JSON.parse(localStorage.getItem('kreotype-theme-storage') || '{}');
    expect(stored.state.currentTheme.name).toBe('midnight');
  });
});
