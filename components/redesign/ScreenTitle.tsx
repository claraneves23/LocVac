import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, typography } from '../../app/theme/tokens';

type Props = {
  title: string;
  back?: () => void;
  trailing?: React.ReactNode;
};

export default function ScreenTitle({ title, back, trailing }: Props) {
  return (
    <View style={styles.row}>
      {back && (
        <Pressable onPress={back} style={styles.backBtn} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={20} color={colors.ink2} />
        </Pressable>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgElev,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
  },
});
