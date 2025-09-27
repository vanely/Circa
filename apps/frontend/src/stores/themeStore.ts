import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ThemeName = 'midnight' | 'aurora' | 'ocean' | 'forest' | 'sunset';

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    accent: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    accent: string;
    focus: string;
  };
  
  // Interactive colors
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
    danger: string;
    dangerHover: string;
    success: string;
    successHover: string;
    warning: string;
    warningHover: string;
  };
  
  // Special colors
  special: {
    gradient: string;
    shadow: string;
    glow: string;
  };
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Theme definitions
const themes: Record<ThemeName, Theme> = {
  midnight: {
    name: 'midnight',
    displayName: 'Midnight',
    description: 'Deep, sleek dark theme with purple accents',
    colors: {
      background: {
        primary: '#0a0a0a',
        secondary: '#111111',
        tertiary: '#1a1a1a',
        elevated: '#1f1f1f',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#a3a3a3',
        tertiary: '#737373',
        inverse: '#000000',
        accent: '#8b5cf6',
      },
      border: {
        primary: '#262626',
        secondary: '#404040',
        accent: '#8b5cf6',
        focus: '#a78bfa',
      },
      interactive: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryActive: '#6d28d9',
        secondary: '#262626',
        secondaryHover: '#404040',
        secondaryActive: '#525252',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        success: '#10b981',
        successHover: '#059669',
        warning: '#f59e0b',
        warningHover: '#d97706',
      },
      special: {
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    },
  },
  
  aurora: {
    name: 'aurora',
    displayName: 'Aurora',
    description: 'Vibrant dark theme with cyan and purple gradients',
    colors: {
      background: {
        primary: '#0c0c0c',
        secondary: '#141414',
        tertiary: '#1e1e1e',
        elevated: '#242424',
        overlay: 'rgba(0, 0, 0, 0.85)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
        tertiary: '#808080',
        inverse: '#000000',
        accent: '#06b6d4',
      },
      border: {
        primary: '#2a2a2a',
        secondary: '#404040',
        accent: '#06b6d4',
        focus: '#22d3ee',
      },
      interactive: {
        primary: '#06b6d4',
        primaryHover: '#0891b2',
        primaryActive: '#0e7490',
        secondary: '#2a2a2a',
        secondaryHover: '#404040',
        secondaryActive: '#525252',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        success: '#10b981',
        successHover: '#059669',
        warning: '#f59e0b',
        warningHover: '#d97706',
      },
      special: {
        gradient: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        glow: '0 0 20px rgba(6, 182, 212, 0.4)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
    },
  },
  
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    description: 'Deep blue ocean-inspired theme',
    colors: {
      background: {
        primary: '#0a0e1a',
        secondary: '#0f1419',
        tertiary: '#1a1f2e',
        elevated: '#1f2430',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#a8b2d1',
        tertiary: '#6b7280',
        inverse: '#000000',
        accent: '#3b82f6',
      },
      border: {
        primary: '#1e293b',
        secondary: '#334155',
        accent: '#3b82f6',
        focus: '#60a5fa',
      },
      interactive: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        secondary: '#1e293b',
        secondaryHover: '#334155',
        secondaryActive: '#475569',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        success: '#10b981',
        successHover: '#059669',
        warning: '#f59e0b',
        warningHover: '#d97706',
      },
      special: {
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    },
  },
  
  forest: {
    name: 'forest',
    displayName: 'Forest',
    description: 'Natural green forest theme',
    colors: {
      background: {
        primary: '#0a0f0a',
        secondary: '#0f140f',
        tertiary: '#1a1f1a',
        elevated: '#1f241f',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#a3b3a3',
        tertiary: '#737373',
        inverse: '#000000',
        accent: '#22c55e',
      },
      border: {
        primary: '#1f2a1f',
        secondary: '#334133',
        accent: '#22c55e',
        focus: '#4ade80',
      },
      interactive: {
        primary: '#22c55e',
        primaryHover: '#16a34a',
        primaryActive: '#15803d',
        secondary: '#1f2a1f',
        secondaryHover: '#334133',
        secondaryActive: '#475147',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        success: '#10b981',
        successHover: '#059669',
        warning: '#f59e0b',
        warningHover: '#d97706',
      },
      special: {
        gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(34, 197, 94, 0.3)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    },
  },
  
  sunset: {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm orange and pink sunset theme',
    colors: {
      background: {
        primary: '#0f0a0a',
        secondary: '#140f0f',
        tertiary: '#1f1a1a',
        elevated: '#241f1f',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
      text: {
        primary: '#ffffff',
        secondary: '#b3a3a3',
        tertiary: '#808080',
        inverse: '#000000',
        accent: '#f97316',
      },
      border: {
        primary: '#2a1f1f',
        secondary: '#403333',
        accent: '#f97316',
        focus: '#fb923c',
      },
      interactive: {
        primary: '#f97316',
        primaryHover: '#ea580c',
        primaryActive: '#dc2626',
        secondary: '#2a1f1f',
        secondaryHover: '#403333',
        secondaryActive: '#525252',
        danger: '#ef4444',
        dangerHover: '#dc2626',
        success: '#10b981',
        successHover: '#059669',
        warning: '#f59e0b',
        warningHover: '#d97706',
      },
      special: {
        gradient: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(249, 115, 22, 0.3)',
      },
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    },
  },
};

interface ThemeState {
  currentTheme: ThemeName;
  mode: ThemeMode;
  isDark: boolean;
}

interface ThemeActions {
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  getCurrentTheme: () => Theme;
  applyTheme: () => void;
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // State
      currentTheme: 'midnight',
      mode: 'dark',
      isDark: true,

      // Actions
      setTheme: (theme: ThemeName) => {
        set({ currentTheme: theme });
        get().applyTheme();
      },

      setMode: (mode: ThemeMode) => {
        const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        set({ mode, isDark });
        get().applyTheme();
      },

      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        get().setMode(newMode);
      },

      getCurrentTheme: () => {
        return themes[get().currentTheme];
      },

      applyTheme: () => {
        const theme = get().getCurrentTheme();
        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme.colors.background).forEach(([key, value]) => {
          root.style.setProperty(`--color-bg-${key}`, value);
        });
        
        Object.entries(theme.colors.text).forEach(([key, value]) => {
          root.style.setProperty(`--color-text-${key}`, value);
        });
        
        Object.entries(theme.colors.border).forEach(([key, value]) => {
          root.style.setProperty(`--color-border-${key}`, value);
        });
        
        Object.entries(theme.colors.interactive).forEach(([key, value]) => {
          root.style.setProperty(`--color-interactive-${key}`, value);
        });
        
        Object.entries(theme.colors.special).forEach(([key, value]) => {
          root.style.setProperty(`--color-special-${key}`, value);
        });
        
        // Apply fonts
        root.style.setProperty('--font-heading', theme.fonts.heading);
        root.style.setProperty('--font-body', theme.fonts.body);
        root.style.setProperty('--font-mono', theme.fonts.mono);
        
        // Apply spacing
        Object.entries(theme.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--spacing-${key}`, value);
        });
        
        // Apply border radius
        Object.entries(theme.borderRadius).forEach(([key, value]) => {
          root.style.setProperty(`--radius-${key}`, value);
        });
        
        // Apply shadows
        Object.entries(theme.shadows).forEach(([key, value]) => {
          root.style.setProperty(`--shadow-${key}`, value);
        });
        
        // Apply theme class to body
        document.body.className = `theme-${theme.name} ${get().isDark ? 'dark' : 'light'}`;
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        mode: state.mode,
      }),
    }
  )
);

// Export themes for external use
export { themes };
