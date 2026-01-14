export interface ThemeColors {
  // Primary Colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary Colors
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Background Colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface Colors
  surface: string;
  surfaceSecondary: string;
  card: string;
  
  // Text Colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border Colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status Colors
  success: string;
  successLight: string;
  error: string;
  errorLight: string;
  warning: string;
  warningLight: string;
  info: string;
  infoLight: string;
  
  // Shadow
  shadow: string;
  shadowDark: string;
  
  // Overlay
  overlay: string;
  
  // Bus Route Colors
  busRoute: string;
  busStop: string;
  busActive: string;
}

export const lightTheme: ThemeColors = {
  // Primary Colors
  primary: '#4299eb', // Blue - matching web admin
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  
  // Secondary Colors
  secondary: '#64748b', // Gray - matching web admin
  secondaryLight: '#94a3b8',
  secondaryDark: '#475569',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#f8fafc', // secondary-50
  backgroundTertiary: '#f1f5f9', // secondary-100
  
  // Surface Colors
  surface: '#FFFFFF',
  surfaceSecondary: '#f8fafc',
  card: '#FFFFFF',
  
  // Text Colors
  text: '#0f172a', // secondary-900
  textSecondary: '#475569', // secondary-600
  textTertiary: '#64748b', // secondary-500
  textInverse: '#FFFFFF',
  
  // Border Colors
  border: '#e2e8f0', // secondary-200
  borderLight: '#f1f5f9', // secondary-100
  borderDark: '#cbd5e1', // secondary-300
  
  // Status Colors
  success: '#10B981',
  successLight: '#34D399',
  error: '#EF4444',
  errorLight: '#F87171',
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  info: '#4299eb', // primary-500
  infoLight: '#60a5fa', // primary-400
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Bus Route Colors
  busRoute: '#4299eb', // primary-500
  busStop: '#64748b', // secondary-500
  busActive: '#10B981',
};

export const darkTheme: ThemeColors = {
  // Primary Colors
  primary: '#4299eb', // Same primary blue for consistency
  primaryLight: '#60a5fa', // primary-400
  primaryDark: '#2563eb', // primary-600
  
  // Secondary Colors
  secondary: '#94a3b8', // Lighter gray for dark mode - secondary-400
  secondaryLight: '#cbd5e1', // secondary-300
  secondaryDark: '#64748b', // secondary-500
  
  // Background Colors
  background: '#0f172a', // secondary-900
  backgroundSecondary: '#1e293b', // secondary-800
  backgroundTertiary: '#334155', // secondary-700
  
  // Surface Colors
  surface: '#1e293b', // secondary-800
  surfaceSecondary: '#334155', // secondary-700
  card: '#1e293b', // secondary-800
  
  // Text Colors
  text: '#f8fafc', // secondary-50
  textSecondary: '#cbd5e1', // secondary-300
  textTertiary: '#94a3b8', // secondary-400
  textInverse: '#0f172a', // secondary-900
  
  // Border Colors
  border: '#475569', // secondary-600
  borderLight: '#64748b', // secondary-500
  borderDark: '#334155', // secondary-700
  
  // Status Colors
  success: '#34D399',
  successLight: '#6EE7B7',
  error: '#F87171',
  errorLight: '#FCA5A5',
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  info: '#4299eb', // primary-500
  infoLight: '#60a5fa', // primary-400
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Bus Route Colors
  busRoute: '#4299eb', // primary-500
  busStop: '#94a3b8', // secondary-400
  busActive: '#34D399',
};

export const getTheme = (isDark: boolean): ThemeColors => isDark ? darkTheme : lightTheme;