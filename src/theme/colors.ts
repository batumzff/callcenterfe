export const colors = {
  background: {
    DEFAULT: 'var(--background)',
    light: 'var(--background-light)',
    dark: 'var(--background-dark)',
    gradient: 'linear-gradient(135deg, var(--background) 0%, var(--background-light) 100%)',
  },
  text: {
    DEFAULT: 'var(--text)',
    light: 'var(--text-light)',
    dark: 'var(--text-dark)',
    muted: 'var(--text-muted)',
  },
  primary: {
    DEFAULT: 'var(--primary)',
    light: 'var(--primary-light)',
    dark: 'var(--primary-dark)',
    foreground: '#FFFFFF',
    gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
  },
  secondary: {
    DEFAULT: 'var(--secondary)',
    light: 'var(--secondary-light)',
    dark: 'var(--secondary-dark)',
    foreground: '#FFFFFF',
    gradient: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dark) 100%)',
  },
  accent: {
    DEFAULT: 'var(--accent)',
    light: 'var(--accent-light)',
    dark: 'var(--accent-dark)',
    foreground: '#FFFFFF',
    gradient: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)',
  },
  border: {
    DEFAULT: 'var(--border)',
    light: 'var(--border-light)',
    dark: 'var(--border-dark)',
  },
  error: {
    DEFAULT: 'var(--error)',
    light: 'var(--error-light)',
    dark: 'var(--error-dark)',
    foreground: '#FFFFFF',
  },
  success: {
    DEFAULT: 'var(--success)',
    light: 'var(--success-light)',
    dark: 'var(--success-dark)',
    foreground: '#FFFFFF',
  },
  warning: {
    DEFAULT: 'var(--warning)',
    light: 'var(--warning-light)',
    dark: 'var(--warning-dark)',
    foreground: '#FFFFFF',
  },
  surface: {
    DEFAULT: 'var(--surface)',
    light: 'var(--surface-light)',
    dark: 'var(--surface-dark)',
    card: 'var(--surface-card)',
    cardDark: 'var(--surface-card-dark)',
  },
  black: '#000000',
  white: '#FFFFFF',
  // Eski renkler kaldırıldı
} as const;

export type ColorScheme = typeof colors; 