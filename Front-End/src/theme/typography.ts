/**
 * Typography design tokens.
 * Uses system fonts for cross-platform compatibility.
 */
export const Typography = {
  fontFamily: {
    regular: 'System',
    bold: 'System',
    semiBold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 22,
    '2xl': 26,
    '3xl': 30,
    '4xl': 36,
  },
} as const;
