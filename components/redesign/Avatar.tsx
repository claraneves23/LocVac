import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, tonePairs, Tone } from '../../app/theme/tokens';

type Props = {
  name?: string;
  photoUri?: string;
  size?: number;
  tone?: Tone;
  active?: boolean;
};

export default function Avatar({ name = '?', photoUri, size = 40, tone = 'brand', active = false }: Props) {
  const t = tonePairs[tone] ?? tonePairs.brand;
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
