/**
 * WCAG 2.0 AA-oriented palette: normal text targets ≥4.5:1 on intended backgrounds.
 * Large text (18pt+ / 14pt+ bold) may use #757575 on white (3:1 for large).
 */

export const colors = {
  sidebarBg: '#1C1C1C',
  headerBg: '#1C1C1C',
  mainBg: '#F5F5F5',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  /** ~7:1 on white */
  textSecondary: '#525252',
  /** ~4.5:1 on white for UI chrome */
  textMuted: '#595959',
  brandRed: '#E53935',
  brandRedPressed: '#C62828',
  accentBlue: '#1565C0',
  accentBlueLight: '#E3F2FD',
  accentGreen: '#2E7D32',
  accentGreenLight: '#E8F5E9',
  accentOrange: '#E65100',
  accentOrangeLight: '#FFF3E0',
  accentPurple: '#6A1B9A',
  accentPurpleLight: '#F3E5F5',
  navActiveBg: '#3D3D3D',
  white: '#FFFFFF',
  borderSubtle: '#E0E0E0',
  chartBar: '#1976D2',
  chartBarH: '#26A69A',
  focusRing: '#90CAF9',
  shadow: 'rgba(0,0,0,0.08)',
  /** ≥4.5:1 on white for small caps (Sundays, UNAVAILABLE) */
  sundayRed: '#B71C1C',
  calendarSelectedDay: '#E8F4FC',
  calendarGridLine: '#E8E8E8',
  calendarEventBar: '#1565C0',
} as const;

/**
 * Extended color tokens used by the login screen.
 * Inherits values from the base `colors` palette where possible.
 */
export const Colors = {
  // Text
  textPrimary: colors.textPrimary,
  textSecondary: colors.textSecondary,

  // Input fields
  inputBorder: '#D1D5DB',
  inputText: colors.textPrimary,
  inputPlaceholder: '#9CA3AF',
  inputBg: '#FFFFFF',
  inputLabel: colors.textPrimary,

  // Error
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#DC2626',

  // Login layout
  loginLeftBg: colors.sidebarBg,
  loginRightBg: '#FFFFFF',
  loginTitleWhite: '#FFFFFF',
  loginSubtitleWhite: 'rgba(255,255,255,0.8)',
  loginAccentRed: colors.brandRed,

  // Login button
  loginBtnBg: colors.brandRed,
  loginBtnText: '#FFFFFF',
} as const;
