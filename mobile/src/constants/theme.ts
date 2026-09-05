export const Colors = {
  background: '#050505',
  surface: '#232323',
  surfaceAlt: '#1f1f1f',
  border: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecondary: '#9a9a9a',
  textMuted: '#6b6b6b',
  accentFrom: '#ff5f6d',
  accentTo: '#ff9a44',
  warning: '#ffb020',
};

export const AccentGradient = [Colors.accentFrom, Colors.accentTo] as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};
