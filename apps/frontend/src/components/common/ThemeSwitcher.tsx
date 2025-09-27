import { useState } from 'react';
import { useThemeStore, ThemeName, themes } from '@/stores/themeStore';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher = ({ className = '' }: ThemeSwitcherProps) => {
  const { currentTheme, setTheme, mode, setMode } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  const handleModeChange = (newMode: 'dark' | 'light' | 'system') => {
    setMode(newMode);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-secondary flex items-center gap-2"
        aria-label="Theme switcher"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
        <span className="hidden sm:inline">{themes[currentTheme].displayName}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-elevated border border-primary rounded-lg shadow-xl z-50">
          <div className="p-4">
            {/* Mode Selection */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-primary mb-2">Mode</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleModeChange('dark')}
                  className={`btn btn-sm ${mode === 'dark' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark
                </button>
                <button
                  onClick={() => handleModeChange('light')}
                  className={`btn btn-sm ${mode === 'light' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light
                </button>
                <button
                  onClick={() => handleModeChange('system')}
                  className={`btn btn-sm ${mode === 'system' ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  System
                </button>
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <h3 className="text-sm font-medium text-primary mb-2">Theme</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.values(themes).map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme.name)}
                    className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                      currentTheme === theme.name
                        ? 'border-accent bg-secondary'
                        : 'border-primary hover:border-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Theme Preview */}
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                           style={{ background: theme.colors.special.gradient }}>
                        {theme.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-primary">{theme.displayName}</div>
                        <div className="text-xs text-secondary">{theme.description}</div>
                      </div>
                    </div>
                    {currentTheme === theme.name && (
                      <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
