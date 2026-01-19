import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#4A90E2',
  success: '#6BCF7F',
  neutral: '#F5F5F5',
  accent: '#FF6B6B',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
  },
  sentiment: {
    positive: '#6BCF7F',
    neutral: '#FFD93D',
    challenging: '#FF6B6B',
  },
  progress: {
    improving: '#6BCF7F',
    steady: '#4A90E2',
    struggling: '#FF6B6B',
    first_mention: '#9E9E9E',
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.white,
    surface: colors.white,
    surfaceVariant: colors.gray[100],
  },
};
