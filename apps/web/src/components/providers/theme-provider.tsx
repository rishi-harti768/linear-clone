'use client';

import * as React from 'react';
import { useUIStore } from '@/stores/ui-store';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme';
  defaultTheme?: 'light' | 'dark' | 'system';
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

/**
 * Theme Provider Component
 * 
 * Manages theme state and applies it to the document.
 * Integrates with Zustand UI store for theme persistence.
 * Supports light, dark, and system themes.
 * 
 * Features:
 * - Automatic system theme detection
 * - Theme persistence via Zustand
 * - Smooth transitions (optional)
 * - SSR-safe with useEffect
 * 
 * @example
 * ```tsx
 * <ThemeProvider
 *   attribute="class"
 *   defaultTheme="system"
 *   enableSystem
 * >
 *   {children}
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const { theme, setTheme } = useUIStore();
  const [mounted, setMounted] = React.useState(false);

  // Initialize theme from store or default
  React.useEffect(() => {
    setMounted(true);
    
    // Set default theme if store is empty
    if (!theme) {
      setTheme(defaultTheme);
    }
  }, []);

  // Apply theme to document
  React.useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Disable transitions temporarily if requested
    if (disableTransitionOnChange) {
      root.style.setProperty('transition', 'none');
    }

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme || defaultTheme;

    // Handle system theme
    if (effectiveTheme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      effectiveTheme = systemTheme;
    }

    // Apply theme class
    if (attribute === 'class') {
      root.classList.add(effectiveTheme);
    } else {
      root.setAttribute(attribute, effectiveTheme);
    }

    // Re-enable transitions
    if (disableTransitionOnChange) {
      setTimeout(() => {
        root.style.removeProperty('transition');
      }, 0);
    }
  }, [theme, defaultTheme, enableSystem, attribute, disableTransitionOnChange, mounted]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const root = document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, enableSystem]);

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
