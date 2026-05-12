import { Image, StyleSheet, Text, View } from 'react-native';
import { type Tone } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';

type Props = {
  name?: string;
  photoUri?: string;
  size?: number;
  tone?: Tone;
  active?: boolean;
};

export default function Avatar({ name = '?', photoUri, size = 40, tone = 'brand', active = false }: Props) {
  const { colors } = useTheme();
  const toneMap: Record<Tone, { bg: string; ink: string }> = {
    brand:   { bg: colors.brandSoft,   ink: colors.brandInk },
    coral:   { bg: colors.coralSoft,   ink: colors.coralInk },
    ochre:   { bg: colors.ochreSoft,   ink: colors.ochreInk },
    success: { bg: colors.successSoft, ink: colors.successInk },
    warn:    { bg: colors.warnSoft,    ink: colors.warnInk },
    danger:  { bg: colors.dangerSoft,  ink: colors.dangerInk },
    neutral: { bg: colors.bgMuted,     ink: colors.ink2 },
  };
  const t = toneMap[tone] ?? toneMap.brand;
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  const dotSize = size * 0.32;

  return (
    <View style={{ position: 'relative', width: size, height: size }}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View style={[
          styles.disc,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: t.bg },
        ]}>
          <Text style={{
            color: t.ink,
            fontSize: size * 0.4,
            fontWeight: '600',
            letterSpacing: -0.2,
          }}>{initial}</Text>
        </View>
      )}
      {active && (
        <View style={{
          position: 'absolute', right: -1, bottom: -1,
          width: dotSize, height: dotSize, borderRadius: dotSize / 2,
          backgroundColor: colors.success,
          borderWidth: 2, borderColor: colors.bgElev,
        }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
