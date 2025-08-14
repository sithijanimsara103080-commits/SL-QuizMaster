'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return (
      <button
        className="p-3 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200 !rounded-button"
        aria-label="Toggle theme"
      >
        <i className="ri-moon-line text-white text-xl"></i>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-gray-600 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200 !rounded-button"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {theme === 'light' ? (
        <i className="ri-moon-line text-white dark:text-gray-300 text-xl transition-transform duration-200 hover:scale-110"></i>
      ) : (
        <i className="ri-sun-line text-white dark:text-gray-300 text-xl transition-transform duration-200 hover:scale-110"></i>
      )}
    </button>
  );
}