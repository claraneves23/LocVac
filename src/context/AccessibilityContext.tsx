import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AccessibilityInfo } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REDUCE_MOTION_KEY = 'locvac:a11y:reduceMotion';
const FONT_SCALE_KEY = 'locvac:a11y:fontScale';

type ReduceMotionPref = 'system' | 'on' | 'off';

export type FontScalePref = 'P' | 'M' | 'G' | 'GG';

/** Multiplicador do app por preferência. A escala do sistema compõe por cima. */
export const FONT_SCALE_VALUES: Record<FontScalePref, number> = {
  P: 0.9,
  M: 1.0,
  G: 1.15,
  GG: 1.3,
};

type AccessibilityContextValue = {
  /** Valor efetivo: se deve reduzir/desabilitar animações. */
  reduceMotion: boolean;
  /** Preferência escolhida pelo usuário ('system' segue o ajuste do dispositivo). */
  reduceMotionPref: ReduceMotionPref;
  setReduceMotionPref: (pref: ReduceMotionPref) => void;
  /** Preferência de tamanho de fonte do app (P/M/G/GG). */
  fontScalePref: FontScalePref;
  /** Multiplicador numérico correspondente à preferência. */
  fontScale: number;
  setFontScalePref: (pref: FontScalePref) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue>({
  reduceMotion: false,
  reduceMotionPref: 'system',
  setReduceMotionPref: () => {},
  fontScalePref: 'M',
  fontScale: 1,
  setFontScalePref: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);
  const [reduceMotionPref, setReduceMotionPrefState] = useState<ReduceMotionPref>('system');
  const [fontScalePref, setFontScalePrefState] = useState<FontScalePref>('M');

  // Preferências persistidas do usuário.
  useEffect(() => {
    AsyncStorage.getItem(REDUCE_MOTION_KEY).then((val) => {
      if (val === 'on' || val === 'off' || val === 'system') {
        setReduceMotionPrefState(val);
      }
    });
    AsyncStorage.getItem(FONT_SCALE_KEY).then((val) => {
      if (val === 'P' || val === 'M' || val === 'G' || val === 'GG') {
        setFontScalePrefState(val);
      }
    });
  }, []);

  // Ajuste do sistema (acompanha mudanças em tempo real).
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setSystemReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setSystemReduceMotion(enabled);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const setReduceMotionPref = useCallback((pref: ReduceMotionPref) => {
    setReduceMotionPrefState(pref);
    AsyncStorage.setItem(REDUCE_MOTION_KEY, pref);
  }, []);

  const setFontScalePref = useCallback((pref: FontScalePref) => {
    setFontScalePrefState(pref);
    AsyncStorage.setItem(FONT_SCALE_KEY, pref);
  }, []);

  const reduceMotion =
    reduceMotionPref === 'on' ? true : reduceMotionPref === 'off' ? false : systemReduceMotion;

  const fontScale = FONT_SCALE_VALUES[fontScalePref];

  const value = useMemo(
    () => ({
      reduceMotion,
      reduceMotionPref,
      setReduceMotionPref,
      fontScalePref,
      fontScale,
      setFontScalePref,
    }),
    [reduceMotion, reduceMotionPref, setReduceMotionPref, fontScalePref, fontScale, setFontScalePref]
  );

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
