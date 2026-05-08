import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { tonePairs, Tone, typography } from '../../app/theme/tokens';

type Props = {
  tone?: Tone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  children: React.ReactNode;
  solid?: boolean;
  style?: ViewStyle;
};

export default function Tag({ tone = 'brand', icon, children, solid = false, style }: Props) {
  const { bg, ink } = tonePairs[tone] ?? tonePairs.brand;
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
