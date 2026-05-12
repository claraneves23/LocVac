import { TextStyle } from 'react-native';

export type Colors = {
  bg: string; bgElev: string; bgMuted: string; bgSheet: string;
  ink: string; ink2: string; ink3: string; ink4: string;
  line: string; lineStrong: string;
  brand: string; brand2: string; brandSoft: string; brandInk: string;
  coral: string; coralSoft: string; coralInk: string;
  ochre: string; ochreSoft: string; ochreInk: string;
  success: string; successSoft: string; successInk: string;
  warn: string; warnSoft: string; warnInk: string;
  danger: string; dangerSoft: string; dangerInk: string;
  dimDark: string; white: string;
};

export const colors: Colors = {
  bg:        'rgba(255, 255, 255, 0.4)',
  bgElev:    '#FFFFFF',
  bgMuted:   '#F1F5F4',
  bgSheet:   '#F4F8F7',
  ink:   '#1A2422',
  ink2:  '#525E5C',
  ink3:  '#7C8786',
  ink4:  '#A8B2B1',
  line:        '#E1E8E6',
  lineStrong:  '#CDD7D5',
  brand:     '#03394A',
  brand2:    '#022D3C',
  brandSoft: '#E5EEF2',
  brandInk:  '#03394A',
  coral:     '#D27457',
  coralSoft: '#F8E9E2',
  coralInk:  '#7A3A23',
  ochre:     '#C8A14A',
  ochreSoft: '#F6EFD9',
  ochreInk:  '#6E5419',
  success:     '#4F9A6E',
  successSoft: '#DEF1E5',
  successInk:  '#03394A',
  warn:        '#D49C3A',
  warnSoft:    '#F5E8C9',
  warnInk:     '#5C4319',
  danger:      '#C84A38',
  dangerSoft:  '#F6D9D2',
  dangerInk:   '#5C2418',
  dimDark: 'rgba(15, 30, 25, 0.45)',
  white:   '#FFFFFF',
};

export const radii = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  pill: 999,
};

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
};

export const fontFamily = {
  display: 'InstrumentSerif',
  sans:    'System',
  mono:    'monospace',
};

export const typography = {
  h1:       { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 36, letterSpacing: -0.5 } as TextStyle,
  h2:       { fontFamily: fontFamily.display, fontSize: 24, lineHeight: 26, letterSpacing: -0.2 } as TextStyle,
  h3:       { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 22 } as TextStyle,
  display:  { fontFamily: fontFamily.display, fontSize: 26, lineHeight: 28, letterSpacing: -0.3 } as TextStyle,
  body:     { fontFamily: fontFamily.sans,    fontSize: 14, lineHeight: 20 } as TextStyle,
  bodyLg:   { fontFamily: fontFamily.sans,    fontSize: 15, lineHeight: 22 } as TextStyle,
  small:    { fontFamily: fontFamily.sans,    fontSize: 12, lineHeight: 16 } as TextStyle,
  caption:  { fontFamily: fontFamily.sans,    fontSize: 11, lineHeight: 14, letterSpacing: 0.4 } as TextStyle,
  labelCap: { fontFamily: fontFamily.sans,    fontSize: 11, lineHeight: 14, letterSpacing: 1, fontWeight: '600', textTransform: 'uppercase' } as TextStyle,
  mono:     { fontFamily: fontFamily.mono,    fontSize: 11, letterSpacing: 0.2 } as TextStyle,
};

export const shadows = {
  sm: {
    shadowColor: '#1A2422',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#1A2422',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1A2422',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
};

export const darkColors: Colors = {
  bg:        'rgba(13, 26, 24, 0.95)',
  bgElev:    '#162824',
  bgMuted:   '#1C3330',
  bgSheet:   '#1A302D',
  ink:   '#E8F3F0',
  ink2:  '#A8C5C0',
  ink3:  '#6B8E8A',
  ink4:  '#3D5E5A',
  line:        '#2A3E3B',
  lineStrong:  '#365450',
  brand:     '#03394A',
  brand2:    '#022D3C',
  brandSoft: '#0D2830',
  brandInk:  '#5ABED8',
  coral:     '#D27457',
  coralSoft: '#2A1510',
  coralInk:  '#E8A890',
  ochre:     '#C8A14A',
  ochreSoft: '#2A2010',
  ochreInk:  '#D4B870',
  success:     '#4F9A6E',
  successSoft: '#0E2820',
  successInk:  '#6DC898',
  warn:        '#D49C3A',
  warnSoft:    '#2A2010',
  warnInk:     '#D4B060',
  danger:      '#C84A38',
  dangerSoft:  '#280E0A',
  dangerInk:   '#E07868',
  dimDark: 'rgba(0, 0, 0, 0.75)',
  white:   '#FFFFFF',
};

export type Tone = 'brand' | 'coral' | 'ochre' | 'success' | 'warn' | 'danger' | 'neutral';

export const tonePairs: Record<Tone, { bg: string; ink: string; solid: string }> = {
  brand:   { bg: colors.brandSoft,   ink: colors.brandInk,   solid: colors.brand },
  coral:   { bg: colors.coralSoft,   ink: colors.coralInk,   solid: colors.coral },
  ochre:   { bg: colors.ochreSoft,   ink: colors.ochreInk,   solid: colors.ochre },
  success: { bg: colors.successSoft, ink: colors.successInk, solid: colors.success },
  warn:    { bg: colors.warnSoft,    ink: colors.warnInk,    solid: colors.warn },
  danger:  { bg: colors.dangerSoft,  ink: colors.dangerInk,  solid: colors.danger },
  neutral: { bg: colors.bgMuted,     ink: colors.ink2,       solid: colors.ink },
};

export const theme = { colors, radii, spacing, typography, shadows, tonePairs, fontFamily };
export default theme;
