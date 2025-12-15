/**
 * Color constants for the application
 * Centralized color management to ensure consistency across the app
 */

export const COLORS = {
  // Primary colors
  primary: '#1890ff',

  // Danger/Error colors (Red)
  danger: '#b30000',
  dangerHover: '#d40000',
  dangerActive: '#8b0000',

  // Success colors (Green)
  success: '#52c41a',
  successHover: '#73d13d',

  // Warning colors (Yellow/Orange)
  warning: '#faad14',
  warningHover: '#ffc53d',

  // Info colors
  info: '#1890ff',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',

  // Background colors
  bgDark: '#001529',
  bgLight: '#f5f5f5',
  bgWhite: '#ffffff',

  // Text colors
  textPrimary: 'rgba(0, 0, 0, 0.85)',
  textSecondary: 'rgba(0, 0, 0, 0.65)',
  textDisabled: 'rgba(0, 0, 0, 0.25)',
  textWhite: '#ffffff',

  // Border colors
  border: '#d9d9d9',
  borderLight: 'rgba(255, 255, 255, 0.1)',
} as const

export type ColorKey = keyof typeof COLORS
