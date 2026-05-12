import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { type Tone, typography } from '../../src/theme/tokens';
import { useTheme } from '../../src/context/ThemeContext';

type Props = {
  tone?: Tone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
  solid?: boolean;
  style?: ViewStyle;
};

export default function Tag({ tone = 'brand', icon, children, solid = false, style }: Props) {
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
  const { bg, ink } = toneMap[tone] ?? toneMap.brand;
  const fg = solid ? '#fff' : ink;
  const bgColor = solid ? ink : bg;
  return (
    <View style={[styles.chip, { backgroundColor: bgColor }, style]}>
      {icon && <Ionicons name={icon} size={12} color={fg} />}
      <Text style={[typography.caption, { color: fg, fontWeight: '500' }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
});
