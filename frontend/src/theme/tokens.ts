/** Design tokens — WCAG-friendly contrast on white / charcoal surfaces */
export const colors = {
  charcoal: '#1A1A1B',
  red: '#EF4444',
  redPressed: '#DC2626',
  blue: '#3B82F6',
  bluePressed: '#2563EB',
  blueSoft: '#DBEAFE',
  pageBg: '#F3F4F6',
  white: '#FFFFFF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
  border: '#E5E7EB',
  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#EA580C',
  warningBg: '#FFEDD5',
  teal: '#0D9488',
  tealBg: '#CCFBF1',
  focusRing: '#2563EB',
};

export const focusStyle = {
  borderWidth: 2,
  borderColor: colors.focusRing,
  shadowColor: colors.focusRing,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.35,
  shadowRadius: 4,
  elevation: 2,
};
