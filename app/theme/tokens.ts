// LocVac — Design tokens (React Native)
// Fonte de verdade visual do redesign: cores, raios, espaçamentos, tipografia, sombras.

import { TextStyle } from 'react-native';

export const colors = {
  // Backgrounds
  bg:        'rgba(255, 255, 255, 0.4)',
  bgElev:    '#FFFFFF',
  bgMuted:   '#F1F5F4',
  bgSheet:   '#F4F8F7',

  // Ink (texto)
  ink:   '#1A2422',
  ink2:  '#525E5C',
  ink3:  '#7C8786',
  ink4:  '#A8B2B1',

  // Linhas
  line:        '#E1E8E6',
  lineStrong:  '#CDD7D5',

  // Brand — azul profundo
  brand:     '#03394A',
  brand2:    '#022D3C',
  brandSoft: '#E5EEF2',
  brandInk:  '#03394A',

  // Coral — urgência / pendências / atrasadas
  coral:     '#D27457',
  coralSoft: '#F8E9E2',
  coralInk:  '#7A3A23',

  // Ochre — campanhas / acentos quentes
  ochre:     '#C8A14A',
  ochreSoft: '#F6EFD9',
  ochreInk:  '#6E5419',

  // Estados
  success:     '#4F9A6E',
  successSoft: '#DEF1E5',
  successInk:  '#03394A',
  warn:        '#D49C3A',
  warnSoft:    '#F5E8C9',
  warnInk:     '#5C4319',
  danger:      '#C84A38',
  dangerSoft:  '#F6D9D2',
  dangerInk:   '#5C2418',

  // Overlay
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

// Famílias — Inter (sans, sistema) e Instrument Serif (display, registrar via expo-font).
// Fallback: serif do sistema. Quando InstrumentSerif não estiver carregado o RN usa fallback.
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
