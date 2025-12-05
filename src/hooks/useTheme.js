'use client';

import { useEffect, useState } from 'react';

export function useTheme() {
  // Start with undefined to avoid SSR mismatch
  const [theme, setTheme] = useState(undefined);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Apply dark class to html element
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    if (!mounted) return;

    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    // Toggle dark class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme);
  };

  // Set specific theme
  const setSpecificTheme = (newTheme) => {
    if (!mounted) return;

    setTheme(newTheme);

    // Apply/remove dark class
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme);
  };

  // Return light theme during SSR to avoid hydration mismatch
  return {
    theme: mounted ? theme : 'light',
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: mounted ? theme === 'dark' : false,
  };
}

export default useTheme;
